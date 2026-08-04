/**
 * Layout generation — decides position, layer, scale, orientation preset and sprite for every
 * particle in the hero's cupcake field. Deliberately knows nothing about drift, rotation speed,
 * duration or delay (see motion.ts) — per the brief, layout is "what a paused frame should look
 * like," animation is "how that frame comes to life." A `ComposedParticle[]` should already read
 * as a deliberately art-directed still image before motion.ts ever touches it.
 */
import type { CupcakeLayer } from "@/types/cupcake";
import { POSES, VISIBLE_POSES, PARTIAL_POSES, jitterPose, type Pose } from "./poses";
import { spritesForLayer, type Sprite } from "./sprites";
import { ZONES, pickWeightedZone } from "./zones";
import { placeWithSpacing, type PlacedPoint } from "./spacing";
import type { DensityTier } from "./responsive";

export type SizeTierName = "hero" | "large" | "medium" | "small" | "tiny";

export const SIZE_TIERS: Record<SizeTierName, number> = {
  hero: 1.35,
  large: 1.1,
  medium: 0.8,
  small: 0.55,
  tiny: 0.3,
};

// Rendered width at scale=1 (percent-independent px baseline) — see FloatingCupcake's BASE_WIDTH,
// which this must stay in sync with.
const BASE_WIDTH_PX = 260;

export type ComposedParticle = {
  id: string;
  sprite: Sprite;
  layer: CupcakeLayer;
  x: number;
  y: number;
  scale: number;
  sizeTier: SizeTierName;
  poseName: string;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  opacity: number;
  blurPx: number;
};

/** Per-layer look (§8): back reads small/soft/slow, mid is the primary sharpness/size step up, front is largest and perfectly sharp. */
const LAYER_LOOK: Record<CupcakeLayer, { opacity: [number, number]; blur: [number, number]; tiers: SizeTierName[] }> = {
  0: { opacity: [0.32, 0.55], blur: [3, 6], tiers: ["tiny", "tiny", "small"] },
  1: { opacity: [0.65, 0.75], blur: [1, 1.5], tiers: ["small", "medium", "medium", "large"] },
  2: { opacity: [0.92, 1], blur: [0, 0], tiers: ["large", "large", "large", "hero"] },
};

// Extra spacing headroom reserved per layer so motion.ts's independently-chosen drift amplitudes
// (see the "primary"/"more noticeable" movement per layer in §8) don't need layout.ts to know
// their exact values to still avoid drifting into overlaps — front drifts furthest, so it gets the
// most headroom. A hardcoded allowance rather than a shared constant is the deliberate seam
// between the two modules; motion.ts's actual drift ranges are free to change without this file
// needing to track them, as long as they stay under this rough budget.
const DRIFT_HEADROOM_PCT: Record<CupcakeLayer, number> = { 0: 1.5, 1: 2.5, 2: 4 };

// Front is pinned to a flat 5 on every tier (2 tilted + 3 classic, see FRONT_TILTED_COUNT below) —
// unlike mid/back, which stay tier-scaled for density/performance, the foreground sprite mix is a
// fixed art-directed count the client wants regardless of viewport.
type BreakpointSpec = { front: number; mid: number; back: number };
const BREAKPOINT_SPECS: Record<DensityTier, BreakpointSpec> = {
  desktop: { front: 5, mid: 3, back: 2 },
  laptop: { front: 5, mid: 4, back: 5 },
  tablet: { front: 5, mid: 3, back: 4 },
  mobile: { front: 5, mid: 3, back: 3 },
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function sizeMultiplier(containerWidth: number): number {
  return Math.max(0.5, Math.min(1, Math.sqrt(containerWidth / 1440)));
}

/** Circular radius (percent) that safely bounds the sprite's real box in either orientation — see the file-level note on why a circle, not a box. */
function radiusPct(sizeTier: SizeTierName, sprite: Sprite, containerWidth: number, containerHeight: number, mult: number): number {
  const scale = SIZE_TIERS[sizeTier] * mult;
  const widthPx = BASE_WIDTH_PX * scale;
  const heightPx = widthPx * (sprite.height / sprite.width);
  const halfWPct = (widthPx / 2 / containerWidth) * 100;
  const halfHPct = (heightPx / 2 / containerHeight) * 100;
  return Math.max(halfWPct, halfHPct);
}

// §5: "3-4 sharp, unmistakably-close foreground cupcakes" reads best with a fixed, small count of
// them caught in the `tilted` sprite's more side-on angle — left to independent per-particle
// coin-flips (the old behaviour), a field could just as easily land zero or five, which either
// loses the silhouette variety or makes it the dominant look up front. Pinned to exactly two (or
// fewer only if the front layer itself has fewer than two slots) the same way §5's front count is
// pinned rather than left to chance.
const FRONT_TILTED_COUNT = 2;

/** Assigns the front layer's fixed `tilted`-sprite quota across its slots in random order, filling the rest from the front pool's other sprites. */
function assignFrontSprites(spritePool: Sprite[], count: number): Sprite[] {
  const tilted = spritePool.find((s) => s.id === "tilted");
  const rest = spritePool.filter((s) => s.id !== "tilted");
  const tiltedSlots = tilted ? Math.min(FRONT_TILTED_COUNT, count) : 0;

  const assignment: Sprite[] = [];
  for (let i = 0; i < count; i++) {
    if (i < tiltedSlots) assignment.push(tilted!);
    else assignment.push(rest.length > 0 ? pick(rest) : pick(spritePool));
  }
  // Shuffle so the two tilted cupcakes don't always land in the first-placed (and so
  // largest-radius-reserved) front slots.
  for (let i = assignment.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [assignment[i], assignment[j]] = [assignment[j], assignment[i]];
  }
  return assignment;
}

function pickPoseForSprite(sprite: Sprite): Pose {
  // A sprite that can't actually show a legible logo shouldn't get a "visible/partial" logo-bucket
  // preset picked *for that reason* — but the pose still shapes its tilt/body-language, so pick
  // from the full set for those, and bias toward the sprite's own preferred pose when one exists.
  const preferring = POSES.filter((p) => p.preferredSprite === sprite.id);
  if (preferring.length > 0 && Math.random() < 0.6) return pick(preferring);
  if (sprite.logoQuality === "clear") return Math.random() < 0.45 ? pick(VISIBLE_POSES) : pick(PARTIAL_POSES);
  return pick(POSES);
}

const PROXIMITY_PCT = 18; // "beside each other" radius used by every diversify pass below.

/** §5: no two adjacent particles share a pose, a size tier, or sit on an obvious vertical/horizontal line. */
function applyCompositionRules(particles: ComposedParticle[], mode: "wide" | "narrow", contentBoundary: number) {
  // no repeated orientation beside another
  for (let i = 1; i < particles.length; i++) {
    const p = particles[i];
    for (let j = 0; j < i; j++) {
      const q = particles[j];
      if (p.poseName !== q.poseName) continue;
      if (Math.hypot(p.x - q.x, p.y - q.y) >= PROXIMITY_PCT) continue;
      const alternatives = POSES.filter((pose) => pose.name !== p.poseName);
      const next = pick(alternatives);
      p.poseName = next.name;
      const j2 = jitterPose(next, rand);
      p.rotationX = j2.rotationX;
      p.rotationY = j2.rotationY;
      p.rotationZ = j2.rotationZ;
      break;
    }
  }

  // no repeated scale beside another (also covers "no several large cupcakes next to each other")
  for (let i = 1; i < particles.length; i++) {
    const p = particles[i];
    for (let j = 0; j < i; j++) {
      const q = particles[j];
      if (p.sizeTier !== q.sizeTier) continue;
      if (Math.hypot(p.x - q.x, p.y - q.y) >= PROXIMITY_PCT) continue;
      const layerTiers = LAYER_LOOK[p.layer].tiers;
      const alternatives = layerTiers.filter((t) => t !== p.sizeTier);
      if (alternatives.length === 0) continue;
      const nextTier = pick(alternatives);
      p.sizeTier = nextTier;
      p.scale = SIZE_TIERS[nextTier] * rand(0.95, 1.05);
      break;
    }
  }

  // no obvious vertical/horizontal alignment — nudge the later particle of any near-aligned pair.
  // The axis that's content-sensitive for this mode may only ever be nudged *away* from the
  // boundary (wide: x only increases; narrow: y only increases) — nudging toward it, even by a
  // few percent, is exactly what put a cupcake back on top of the headline once already here.
  for (let i = 1; i < particles.length; i++) {
    const p = particles[i];
    for (let j = 0; j < i; j++) {
      const q = particles[j];
      const dx = Math.abs(p.x - q.x);
      const dy = Math.abs(p.y - q.y);
      if (dx < 5 && dy > 15) {
        p.x += mode === "wide" ? rand(6, 10) : p.x > 50 ? rand(6, 10) : rand(-10, -6);
      } else if (dy < 5 && dx > 15) {
        p.y += mode === "narrow" ? rand(6, 10) : p.y > 50 ? rand(6, 10) : rand(-10, -6);
      }
      p.x = Math.min(99, Math.max(1, p.x));
      p.y = Math.min(97, Math.max(3, p.y));
    }
  }

  // Final backstop: nothing above should be able to push a particle back past the content
  // boundary, but guarantee it explicitly rather than trust every future rule change to remember
  // this — the zone weighting only guarantees it at the sampling stage.
  for (const p of particles) {
    if (mode === "wide" && p.x < contentBoundary) p.x = contentBoundary + rand(0, 5);
    if (mode === "narrow" && p.y < contentBoundary) p.y = contentBoundary + rand(0, 5);
  }
}

export function composeLayout(
  containerWidth: number,
  containerHeight: number,
  tier: DensityTier,
  narrow: boolean,
  contentBoundary: number
): ComposedParticle[] {
  const spec = BREAKPOINT_SPECS[tier];
  const mult = sizeMultiplier(containerWidth);
  const mode: "wide" | "narrow" = narrow ? "narrow" : "wide";

  const order: CupcakeLayer[] = [
    ...Array(spec.front).fill(2),
    ...Array(spec.mid).fill(1),
    ...Array(spec.back).fill(0),
  ];

  const placed: (PlacedPoint & { layer: CupcakeLayer })[] = [];
  const particles: ComposedParticle[] = [];

  const frontSprites = assignFrontSprites(spritesForLayer(2), spec.front);
  let frontIndex = 0;

  for (const layer of order) {
    const look = LAYER_LOOK[layer];
    const sizeTier = pick(look.tiers);
    const spritePool = spritesForLayer(layer);
    const sprite = layer === 2 ? frontSprites[frontIndex++] : pick(spritePool);
    const radius = radiusPct(sizeTier, sprite, containerWidth, containerHeight, mult) + DRIFT_HEADROOM_PCT[layer];

    const candidate = () => {
      const zone = pickWeightedZone(mode, contentBoundary, rand);
      let x = rand(zone.x[0], zone.x[1]);
      let y = rand(zone.y[0], zone.y[1]);
      // The foreground layer keeps one hard rule the soft zone weighting doesn't enforce on its
      // own: it must never land on the hero copy, at rest or mid-drift. Back/mid stay soft-only —
      // a translucent, blurred cupcake grazing the text edge reads as depth, not a bug.
      if (layer === 2) {
        if (mode === "wide" && x < contentBoundary + 6) x = rand(contentBoundary + 6, 100);
        if (mode === "narrow" && y < contentBoundary + 6) y = rand(contentBoundary + 6, 100);
      }
      x = Math.min(99, Math.max(1, x));
      y = Math.min(97, Math.max(3, y));
      return { x, y };
    };

    const placementBounds =
      layer === 2
        ? mode === "wide"
          ? { xMin: contentBoundary + 6, xMax: 99, yMin: 3, yMax: 97 }
          : { xMin: 1, xMax: 99, yMin: contentBoundary + 6, yMax: 97 }
        : { xMin: 1, xMax: 99, yMin: 3, yMax: 97 };
    const spot = placeWithSpacing(radius, candidate, placed, placementBounds);
    placed.push({ ...spot, radius, layer });

    const pose = pickPoseForSprite(sprite);
    const jittered = jitterPose(pose, rand);

    particles.push({
      id: `cupcake-${particles.length}-${Math.random().toString(36).slice(2, 8)}`,
      sprite,
      layer,
      x: spot.x,
      y: spot.y,
      scale: SIZE_TIERS[sizeTier] * rand(0.95, 1.05),
      sizeTier,
      poseName: pose.name,
      rotationX: jittered.rotationX,
      rotationY: jittered.rotationY,
      rotationZ: jittered.rotationZ,
      opacity: rand(...look.opacity),
      blurPx: rand(...look.blur),
    });
  }

  applyCompositionRules(particles, mode, contentBoundary);
  return particles;
}

// Re-exported for callers that only need the zone shape (e.g. a future debug overlay), keeping
// this module the single entry point for "how is the hero laid out."
export { ZONES };
