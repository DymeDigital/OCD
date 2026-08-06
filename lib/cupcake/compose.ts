/**
 * Layout generation — decides position, layer, scale, orientation preset and sprite for every
 * cupcake in the hero's falling field, plus the spatial facts its fall needs (where the top of its
 * path sits, how far down it travels). Deliberately knows nothing about spin, speed or loop phase
 * (see motion.ts) — this file answers "where does this lane sit and how tall is its drop," motion
 * answers "how fast, which way it spins, and where in the loop it starts."
 *
 * Lane x-positions come from fall-lanes.ts — pre-programmed, not randomized, so the field looks the
 * same on every load. A small ±ANCHOR_JITTER % nudge on x keeps it from reading as a perfect grid
 * without reintroducing per-session randomness in *placement* (sprite/pose assignment still varies
 * a little from load to load; the lanes and fall geometry never do).
 */
import type { CupcakeLayer } from "@/types/cupcake";
import { POSES, VISIBLE_POSES, PARTIAL_POSES, jitterPose, type Pose } from "./poses";
import { spritesForLayer, type Sprite } from "./sprites";
import { FALL_LANES, type Lane } from "./fall-lanes";
import type { DensityTier } from "./responsive";

export type SizeTierName = "hero" | "large" | "medium" | "small" | "tiny";

export const SIZE_TIERS: Record<SizeTierName, number> = {
  hero: 1.35,
  large: 1.1,
  medium: 0.8,
  small: 0.55,
  tiny: 0.3,
};

export type ComposedParticle = {
  id: string;
  sprite: Sprite;
  layer: CupcakeLayer;
  x: number;
  /** CSS `top`, percent of container height — the top of this particle's fall path (see fall geometry below). */
  topPct: number;
  /** Total vertical travel for one pass, px — computed from the live container height so it stays correct across breakpoints. */
  fallDistancePx: number;
  fadeInEndFrac: number;
  fadeOutStartFrac: number;
  scale: number;
  sizeTier: SizeTierName;
  poseName: string;
  rotationX: number;
  rotationY: number;
  rotationZStart: number;
  opacity: number;
  blurPx: number;
};

/** Per-layer look (§8): back reads small/soft/slow, mid is the primary sharpness/size step up, front is largest and perfectly sharp. */
const LAYER_LOOK: Record<CupcakeLayer, { opacity: [number, number]; blur: [number, number] }> = {
  0: { opacity: [0.32, 0.55], blur: [3, 6] },
  1: { opacity: [0.65, 0.75], blur: [1, 1.5] },
  2: { opacity: [0.92, 1], blur: [0, 0] },
};

// Mid layer is mostly `tilted` (no logo, reads fine at mid size/blur in any pose) with room left
// for `newclassic` to mix in — one lane's worth per tier, not a quota of its own, since it isn't
// pose-restricted (see MID_EXCLUDE_IDS) and doesn't need to dominate the way `tilted` does.
const MID_TILTED_QUOTA: Record<DensityTier, number> = {
  desktop: 2,
  laptop: 3,
  tablet: 2,
  mobile: 4,
};
// `alt`'s garbled logo has no pose protection at mid's size/sharpness (unlike front, which excludes
// it outright) — kept out of mid the same way. `classic` is reserved for front, where its quota
// does the work of surfacing the brand; mid's non-`tilted` slots go to `newclassic` instead so the
// two layers don't compete for the same handful of front-quality logo shots.
const MID_EXCLUDE_IDS = ["alt", "classic"];

// Front is the largest, sharpest layer — the one place the logo has to read. `tilted` has no logo
// at all, and both `alt` and `newclassic` have a warped/illegible logo (see sprites.ts), so all
// three are excluded outright rather than left to chance — `newclassic` belongs to mid only (see
// MID_TILTED_QUOTA above), never front. `classic` (cupcake_no_bg.png, the one sprite with a clean,
// legible logo) gets a guaranteed quota so it isn't left to a flat coin-flip against the rest —
// but on desktop/laptop's fuller field (5 front lanes plus mid/back layers all falling at once),
// a majority read as repetitive, so there it's tuned to "some," not "most." Mobile has far fewer
// cupcakes on screen at all, so a majority there doesn't have the same crowding problem.
const FRONT_EXCLUDE_IDS = ["tilted", "alt", "newclassic"];
const FRONT_CLASSIC_QUOTA: Record<DensityTier, number> = {
  desktop: 2,
  laptop: 2,
  tablet: 2,
  mobile: 2,
};

// Fall geometry — how far above the visible zone a lane's path starts, and how close to the
// section's bottom edge it's allowed to still be visible. Both are expressed as absolute percent
// of container height, not a fraction of any one lane's own travel, so every lane fades out over
// the same physical band regardless of how far it falls. Kept here (not motion.ts) because they're
// what fallDistancePx is derived from — a spatial fact about the path, not a timing one.
const FALL_TOP_OVERSHOOT_PCT = 8; // starts this far above the zone's nominal top, invisible
const FALL_BOTTOM_FADE_COMPLETE_PCT = 95; // opacity reaches 0 by this height — never touches the true bottom edge, so nothing visibly clips
const FADE_OUT_SPAN_PCT = 12; // width of the exit fade band, in the same absolute container-height percent as the two constants above

// Tight ±1.0% nudge to preserve hand-tuned lane spacing while avoiding a static grid.
const LANE_JITTER = 1.0;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/**
 * Assigns a guaranteed minimum of one sprite (by id) across `count` slots in random order, filling
 * the rest by uniform random pick from whatever's left in the pool (after `excludeIds`).
 */
function assignLayerSprites(
  spritePool: Sprite[],
  count: number,
  quotaId: string | undefined,
  quotaMax: number,
  excludeIds: string[] = []
): Sprite[] {
  const pool = spritePool.filter((s) => !excludeIds.includes(s.id));
  const quota = quotaId ? pool.find((s) => s.id === quotaId) : undefined;
  const rest = pool.filter((s) => s.id !== quotaId);
  const quotaSlots = quota ? Math.min(quotaMax, count) : 0;

  const assignment: Sprite[] = [];
  for (let i = 0; i < count; i++) {
    if (i < quotaSlots) assignment.push(quota!);
    else assignment.push(rest.length > 0 ? pick(rest) : pick(pool));
  }
  for (let i = assignment.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [assignment[i], assignment[j]] = [assignment[j], assignment[i]];
  }
  return assignment;
}

function pickPoseForSprite(sprite: Sprite): Pose {
  const preferring = POSES.filter((p) => p.preferredSprite === sprite.id);
  if (preferring.length > 0 && Math.random() < 0.6) return pick(preferring);
  if (sprite.logoQuality === "clear") return Math.random() < 0.45 ? pick(VISIBLE_POSES) : pick(PARTIAL_POSES);
  return pick(POSES);
}

/**
 * The top and total travel of a lane's fall path, in the units the renderer needs. `zoneTopPct` is
 * 0 in wide mode (the field spans the section's full height) or the content boundary in narrow mode
 * (cupcakes only fall below the stacked text block) — mirrors how the old zones.ts drew the same
 * distinction from `mode`/`contentBoundary`.
 */
function fallGeometry(
  zoneTopPct: number,
  containerHeight: number
): { topPct: number; fallDistancePx: number; fadeInEndFrac: number; fadeOutStartFrac: number } {
  const topPct = zoneTopPct - FALL_TOP_OVERSHOOT_PCT;
  const fallDistancePct = FALL_BOTTOM_FADE_COMPLETE_PCT - topPct;
  return {
    topPct,
    fallDistancePx: containerHeight * (fallDistancePct / 100),
    fadeInEndFrac: FALL_TOP_OVERSHOOT_PCT / fallDistancePct,
    fadeOutStartFrac: 1 - FADE_OUT_SPAN_PCT / fallDistancePct,
  };
}

function composeLane(
  lane: Lane,
  layer: CupcakeLayer,
  sprite: Sprite,
  zoneTopPct: number,
  containerHeight: number,
  index: number
): ComposedParticle {
  const look = LAYER_LOOK[layer];
  const pose = pickPoseForSprite(sprite);
  const jittered = jitterPose(pose, rand);
  const { topPct, fallDistancePx, fadeInEndFrac, fadeOutStartFrac } = fallGeometry(zoneTopPct, containerHeight);

  return {
    id: `cupcake-${layer}-${index}`,
    sprite,
    layer,
    x: Math.min(98, Math.max(2, lane.x + rand(-LANE_JITTER, LANE_JITTER))),
    topPct,
    fallDistancePx,
    fadeInEndFrac,
    fadeOutStartFrac,
    scale: SIZE_TIERS[lane.sizeTier] * rand(0.97, 1.03),
    sizeTier: lane.sizeTier,
    poseName: pose.name,
    rotationX: jittered.rotationX,
    rotationY: jittered.rotationY,
    rotationZStart: jittered.rotationZ,
    opacity: rand(...look.opacity),
    blurPx: rand(...look.blur),
  };
}

export function composeLayout(
  containerWidth: number,
  containerHeight: number,
  tier: DensityTier,
  narrow: boolean,
  contentBoundary: number
): ComposedParticle[] {
  const mode: "wide" | "narrow" = narrow ? "narrow" : "wide";
  const laneSet = FALL_LANES[tier][mode];
  // Wide mode: content sits beside the field (left column), so the fall spans the section's full
  // height and lanes are already x-clamped clear of it. Narrow mode: content stacks above the
  // field, so the fall only starts below it.
  const zoneTopPct = mode === "narrow" ? contentBoundary : 0;

  const frontLanes = laneSet[2];
  const midLanes = laneSet[1];
  const frontSprites = assignLayerSprites(
    spritesForLayer(2),
    frontLanes.length,
    "classic",
    FRONT_CLASSIC_QUOTA[tier],
    FRONT_EXCLUDE_IDS
  );
  const midSprites = assignLayerSprites(
    spritesForLayer(1),
    midLanes.length,
    "tilted",
    MID_TILTED_QUOTA[tier],
    MID_EXCLUDE_IDS
  );

  const particles: ComposedParticle[] = [];

  for (const layer of [2, 1, 0] as CupcakeLayer[]) {
    const lanes = laneSet[layer];
    const spritePool = spritesForLayer(layer);

    lanes.forEach((lane, index) => {
      const sprite = layer === 2 ? frontSprites[index] : layer === 1 ? midSprites[index] : pick(spritePool);
      particles.push(composeLane(lane, layer, sprite, zoneTopPct, containerHeight, index));
    });
  }

  return particles;
}
