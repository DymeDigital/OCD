/**
 * Pre-programmed horizontal lanes for the falling-cupcake field — the direct replacement for the
 * old zones.ts (weighted random anchor picking). A cupcake's fall is vertical only, so the one
 * spatial fact that needs authoring ahead of time is *which lane* (x, sizeTier) it falls through;
 * everything about the fall itself (how far, how fast, how much it spins, where in its loop it
 * starts) is derived deterministically in motion.ts, not randomized. Same field on every load —
 * that's the point of "pre-programmed" instead of "random."
 *
 * Lane x-positions are carried over from the previous version's hand-spaced FIXED_ANCHORS (this is
 * the same art-directed horizontal spread, just without the y component that placement no longer
 * needs), so the existing content-boundary clearances still hold: every wide-mode lane already
 * sits clear of SAFE_ZONE_END, and narrow-mode lanes are unconstrained on x because the content
 * stacks above them instead of beside them.
 */
import type { CupcakeLayer } from "@/types/cupcake";
import type { SizeTierName } from "./compose";
import type { DensityTier } from "./responsive";

export type Lane = { x: number; sizeTier: SizeTierName };
type LaneSet = Record<CupcakeLayer, Lane[]>;
type LaneMap = { wide: LaneSet; narrow: LaneSet };

// Shared by every tier's "narrow" layout (content stacks full-width above the fall zone) — tiers
// above mobile keep a lighter version of the same spread rather than a bespoke one, matching how
// FIXED_ANCHORS treated narrow mode previously.
const NARROW_LANES: LaneSet = {
  0: [
    { x: 10, sizeTier: "tiny" },
    { x: 86, sizeTier: "small" },
    { x: 32, sizeTier: "tiny" },
    { x: 68, sizeTier: "small" },
  ],
  1: [
    { x: 48, sizeTier: "medium" },
    { x: 14, sizeTier: "small" },
    { x: 88, sizeTier: "medium" },
  ],
  2: [
    { x: 18, sizeTier: "large" },
    { x: 76, sizeTier: "large" },
    { x: 48, sizeTier: "hero" },
  ],
};

export const FALL_LANES: Record<DensityTier, LaneMap> = {
  mobile: {
    narrow: {
      0: [
        { x: 12, sizeTier: "small" },
        { x: 92, sizeTier: "tiny" },
        { x: 16, sizeTier: "tiny" },
        { x: 8, sizeTier: "small" },
      ],
      1: [
        { x: 44, sizeTier: "small" },
        { x: 28, sizeTier: "small" },
        { x: 72, sizeTier: "small" },
        { x: 90, sizeTier: "small" },
        { x: 38, sizeTier: "medium" },
      ],
      2: [
        { x: 80, sizeTier: "medium" },
        { x: 54, sizeTier: "medium" },
        { x: 76, sizeTier: "medium" },
      ],
    },
    wide: { 0: [], 1: [], 2: [] },
  },

  tablet: {
    wide: {
      0: [
        { x: 72, sizeTier: "tiny" },
        { x: 92, sizeTier: "small" },
        { x: 60, sizeTier: "tiny" },
        { x: 72, sizeTier: "tiny" },
      ],
      1: [
        { x: 74, sizeTier: "medium" },
        { x: 52, sizeTier: "medium" },
        { x: 92, sizeTier: "small" },
      ],
      2: [
        { x: 56, sizeTier: "hero" },
        { x: 86, sizeTier: "large" },
        { x: 48, sizeTier: "large" },
        { x: 78, sizeTier: "large" },
      ],
    },
    narrow: NARROW_LANES,
  },

  laptop: {
    wide: {
      0: [
        { x: 70, sizeTier: "tiny" },
        { x: 94, sizeTier: "small" },
        { x: 60, sizeTier: "tiny" },
        { x: 60, sizeTier: "tiny" },
        { x: 80, sizeTier: "tiny" },
      ],
      1: [
        { x: 72, sizeTier: "medium" },
        { x: 94, sizeTier: "small" },
        { x: 48, sizeTier: "medium" },
        { x: 90, sizeTier: "small" },
      ],
      2: [
        { x: 54, sizeTier: "hero" },
        { x: 86, sizeTier: "large" },
        { x: 46, sizeTier: "large" },
        { x: 78, sizeTier: "large" },
        { x: 64, sizeTier: "large" },
      ],
    },
    narrow: NARROW_LANES,
  },

  desktop: {
    wide: {
      0: [
        { x: 72, sizeTier: "tiny" },
        { x: 94, sizeTier: "small" },
        { x: 60, sizeTier: "tiny" },
        { x: 78, sizeTier: "tiny" },
      ],
      1: [
        { x: 74, sizeTier: "medium" },
        { x: 92, sizeTier: "small" },
        { x: 48, sizeTier: "medium" },
      ],
      2: [
        { x: 55, sizeTier: "hero" },
        { x: 88, sizeTier: "large" },
        { x: 46, sizeTier: "large" },
        { x: 80, sizeTier: "large" },
        { x: 62, sizeTier: "large" },
      ],
    },
    narrow: NARROW_LANES,
  },
};
