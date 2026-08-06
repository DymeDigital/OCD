export type CupcakeLayer = 0 | 1 | 2; // 0 = back (small, soft, slow), 2 = front (large, sharp, fast)

export type CupcakeParticle = {
  id: string;
  image: string;
  /** Intrinsic pixel size of `image` — sprites aren't all the same source photo/aspect (see sprites.ts), so the renderer needs this per-particle instead of one hardcoded aspect. */
  width: number;
  height: number;
  layer: CupcakeLayer;
  /** Fixed horizontal lane, percent of the container's width (0-100). Never animated — falling is a pure vertical motion, so a cupcake never drifts sideways out of its lane. */
  x: number;
  /** CSS `top`, percent of the container's height, set once. The highest point of this lane's fall path — usually a little above the visible zone so the fade-in (see `fallDistancePx`) completes right as it crosses into frame. */
  topPct: number;
  /** Total vertical travel for one fall pass, in px. Computed once from the container's height at layout time (see compose.ts) rather than re-derived from a live percent, matching how motion.ts already bakes viewport-relative amounts to px elsewhere. */
  fallDistancePx: number;
  /** Progress fraction (0-1 of the pass) at which the entry fade-in completes. */
  fadeInEndFrac: number;
  /** Progress fraction (0-1 of the pass) at which the exit fade-out begins — reaches opacity 0 by 1.0, comfortably before the section's true bottom edge, so nothing visibly clips. */
  fadeOutStartFrac: number;
  scale: number;
  /** Opacity while fully inside the visible zone — ramps up from 0 on entry and back to 0 before the fall's lower end (see particle-engine.ts), so a cupcake fades out before it would be clipped by the section's bottom edge rather than cutting off. */
  opacityPeak: number;
  blurPx: number;
  rotationX: number;
  rotationY: number;
  /** Starting in-plane rotation, degrees. */
  rotationZStart: number;
  /** Total degrees turned over one fall pass — sign sets spin direction. Rotation lives entirely on Z (a pure in-plane spin never warps the flat sprite, unlike X/Y — see poses.ts) so the tumble reads as deliberate rather than a warped plane. */
  rotationZDelta: number;
  /** Seconds for one top-to-bottom pass. Back layer is slowest, front fastest — same depth ordering as the rest of the field's per-layer look. */
  duration: number;
  /** Starting progress (0-1) through the loop, so the field reads as already-falling on first paint instead of every cupcake launching from the top in unison. */
  phase: number;
};
