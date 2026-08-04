/**
 * Weighted anchor zones — loose sub-regions of the hero canvas (percent, 0-100 both axes) that a
 * particle anchors to before jitter. Zones span the *entire* canvas, including the area over the
 * hero content, but a zone's selection weight falls off the closer it sits to the content column
 * (wide layouts) or the stacked text block (narrow/mobile layouts). That's a deliberate choice:
 * cupcakes should read as flowing around the headline, occasionally drifting close on the soft
 * back layer, not as excluded from a hard rectangle — a boolean ban is what produced the
 * suspiciously empty band along the text edge in the previous version. The one place a hard
 * boundary still applies is the foreground layer, enforced separately in compose.ts (a sharp,
 * opaque cupcake sitting on the headline is a legibility bug, not an aesthetic call).
 */
export type Zone = { x: [number, number]; y: [number, number] };

// Deliberately more zones than the largest particle count (desktop tops out well under this) so a
// full load doesn't repeatedly re-hit the same handful of anchors.
export const ZONES: Zone[] = [
  { x: [0, 30], y: [0, 30] },
  { x: [18, 46], y: [4, 34] },
  { x: [38, 66], y: [0, 30] },
  { x: [58, 86], y: [2, 32] },
  { x: [78, 100], y: [0, 30] },
  { x: [0, 28], y: [30, 60] },
  { x: [22, 50], y: [34, 64] },
  { x: [44, 72], y: [30, 60] },
  { x: [66, 94], y: [32, 62] },
  { x: [82, 100], y: [30, 60] },
  { x: [0, 30], y: [60, 90] },
  { x: [20, 48], y: [64, 94] },
  { x: [42, 70], y: [60, 90] },
  { x: [62, 90], y: [62, 92] },
  { x: [80, 100], y: [60, 90] },
  { x: [10, 40], y: [86, 100] },
  { x: [46, 76], y: [88, 100] },
  { x: [70, 98], y: [84, 100] },
];

function zoneCenter(zone: Zone): { x: number; y: number } {
  return { x: (zone.x[0] + zone.x[1]) / 2, y: (zone.y[0] + zone.y[1]) / 2 };
}

/**
 * Soft falloff away from the content edge — 0 at/inside the boundary, ramping up to full weight
 * over the next 16 points of distance. `boundary` is the content-edge percent Hero computes
 * (SAFE_ZONE_END / MOBILE_SAFE_ZONE_BOTTOM). In wide mode content sits on the left, so distance
 * grows with x; in narrow mode content is stacked above, so distance grows with y — both defined
 * so "distance" always means "how far past the boundary, in the direction cupcakes are allowed."
 */
function contentFalloff(zone: Zone, mode: "wide" | "narrow", boundary: number): number {
  const center = zoneCenter(zone);
  const distance = mode === "wide" ? center.x - boundary : center.y - boundary;
  // `boundary` itself is already sized to clear the actual glyph extent (see Hero's SAFE_ZONE_END
  // comment) — so unlike the transition band above it, there's no soft floor on the near side of
  // it. A translucent, blurred back-layer cupcake grazing the outer edge of that boundary as it
  // ramps in reads as depth; one sitting on the headline reads as a bug, not "organic."
  if (distance >= 16) return 1;
  if (distance <= 0) return 0;
  return distance / 16;
}

export function pickWeightedZone(
  mode: "wide" | "narrow",
  boundary: number,
  rand: (min: number, max: number) => number
): Zone {
  const weights = ZONES.map((z) => contentFalloff(z, mode, boundary));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand(0, total);
  for (let i = 0; i < ZONES.length; i++) {
    r -= weights[i];
    if (r <= 0) return ZONES[i];
  }
  return ZONES[ZONES.length - 1];
}
