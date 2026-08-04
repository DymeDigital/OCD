/**
 * Variable-radius Poisson-disk placement: every particle carries its own "personal space" radius
 * (derived from its rendered size), and a new point is only accepted once it clears every
 * already-placed point by the sum of their two radii. This is the classic dart-throwing
 * formulation of Poisson-disk sampling — rather than Bridson's grid-accelerated variant, which
 * exists to make sampling thousands of equal-radius points tractable. At the particle counts here
 * (well under 30 per hero load) plain rejection sampling against the existing set is both simpler
 * to get right and cheap enough to run every mount, so that's what this implements: try a batch of
 * zone-biased candidates, relax the required spacing in a few bounded steps if the zone is
 * genuinely crowded, and fall back to a deterministic grid scan as a last resort so a tight zone
 * always finds its least-bad spot instead of keeping whatever random near-miss it last tried.
 */
export type PlacedPoint = { x: number; y: number; radius: number };

const ATTEMPTS_PER_ROUND = 50;
// Progressively accept tighter spacing rather than give up — each factor still requires *some*
// separation, it just stops holding out for the ideal gap once a zone is genuinely crowded.
const RELAXATION_FACTORS = [1, 0.85, 0.7, 0.55, 0.4];

function worstClearance(x: number, y: number, radius: number, existing: PlacedPoint[], paddingScale: number): number {
  let worst = Infinity;
  for (const p of existing) {
    const d = Math.hypot(x - p.x, y - p.y) - (radius + p.radius) * paddingScale;
    if (d < worst) worst = d;
  }
  return worst;
}

/**
 * `candidate()` should return a point biased toward wherever the caller wants this particle
 * anchored (e.g. a zone from zones.ts) — this function only handles the spacing guarantee, not
 * where candidates come from, per the layout/spacing separation described in compose.ts.
 * `bounds` is used only by the deterministic fallback scan, so it should be at least as large as
 * whatever region `candidate()` draws from.
 */
export function placeWithSpacing(
  radius: number,
  candidate: () => { x: number; y: number },
  existing: PlacedPoint[],
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number } = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }
): { x: number; y: number } {
  let best: { x: number; y: number } | null = null;
  let bestClearance = -Infinity;

  for (const factor of RELAXATION_FACTORS) {
    for (let i = 0; i < ATTEMPTS_PER_ROUND; i++) {
      const c = candidate();
      const worst = worstClearance(c.x, c.y, radius, existing, existing.length === 0 ? 1 : factor);
      if (worst >= 0) return c; // clears every existing point at this round's required spacing
      if (worst > bestClearance) {
        bestClearance = worst;
        best = c;
      }
    }
  }

  // Random sampling ran out — a coarse deterministic grid scan always finds whichever spot is
  // least-bad within the given bounds, so a crowded zone never silently keeps a badly overlapping
  // position just because chance never tried the right neighborhood.
  const steps = 14;
  for (let gx = 0; gx <= steps; gx++) {
    for (let gy = 0; gy <= steps; gy++) {
      const x = bounds.xMin + (gx / steps) * (bounds.xMax - bounds.xMin);
      const y = bounds.yMin + (gy / steps) * (bounds.yMax - bounds.yMin);
      const worst = worstClearance(x, y, radius, existing, 1);
      if (worst > bestClearance) {
        bestClearance = worst;
        best = { x, y };
      }
    }
  }

  return best ?? candidate();
}
