export type CupcakeLayer = 0 | 1 | 2; // 0 = back (small, soft, slow), 2 = front (large, sharp, fast)

export type CupcakeParticle = {
  id: string;
  image: string;
  /** Intrinsic pixel size of `image` — sprites aren't all the same source photo/aspect anymore (see cupcake-generator.ts's SPRITES), so the renderer needs this per-particle instead of one hardcoded aspect. */
  width: number;
  height: number;
  layer: CupcakeLayer;
  /** Starting position, percent of the container's box (0-100). Static — GSAP drift is layered on top. */
  x: number;
  y: number;
  scale: number;
  opacity: number;
  blurPx: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  /** Seconds per primary drift cycle — kept long so the motion reads as calm and weighted, not a bob. */
  duration: number;
  /** Seconds before a particle's drift/wobble timelines start, so particles don't move in unison. */
  delay: number;
  /** Px range for the primary horizontal drift (yoyo — smoothly reverses, never jumps, so looping is seamless by construction). */
  driftX: number;
  /** Px range for the primary vertical drift (yoyo, same character as driftX). Combined with driftX at a
   * different period/phase per particle, this traces a slow, unique, non-repeating-looking wander —
   * "leaves on still air," not a fall. See particle-engine.ts for how the secondary flutter layers on top. */
  driftY: number;
  /** Deg range for the continuous rotational wobble (not a full spin — see particle-engine.ts). */
  rotationSpeed: number;
};
