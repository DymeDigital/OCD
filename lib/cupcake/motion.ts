/**
 * Attaches motion parameters (drift, rotation speed, duration, delay) to an already-composed,
 * already-balanced layout. Knows nothing about placement, zones or composition rules — see
 * compose.ts for the "what a paused frame looks like" half of the split described there.
 *
 * Per §8/§7: back is smallest/slowest/least drift, front is largest/sharpest/most noticeable
 * drift, and every layer stays calm — no bouncing, no fast spins, a slow believable-weight sway
 * rather than anything reading as rain. See particle-engine.ts for how these numbers actually
 * shape the GSAP timeline (the downward-biased meander, the wobble, etc).
 */
import type { CupcakeLayer, CupcakeParticle } from "@/types/cupcake";
import type { ComposedParticle } from "./compose";

const DURATION_RANGE: Record<CupcakeLayer, [number, number]> = {
  0: [16, 20], // slowest — background ambience
  1: [12, 16], // primary movement layer
  2: [10, 14], // "slightly faster" per §8
};

// Px envelope for the primary drift, before the viewport's sizeMultiplier is applied — front gets
// the most noticeable travel, back the least, matching compose.ts's DRIFT_HEADROOM_PCT ordering
// (that constant reserves layout space for this; keep the two roughly consistent if either changes).
const DRIFT_RANGE: Record<CupcakeLayer, [number, number]> = {
  0: [18, 26],
  1: [32, 42],
  2: [42, 54],
};

const ROTATION_WOBBLE_RANGE: Record<CupcakeLayer, [number, number]> = {
  0: [1.5, 3],
  1: [2, 4],
  2: [2.5, 5],
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function sizeMultiplier(containerWidth: number): number {
  return Math.max(0.5, Math.min(1, Math.sqrt(containerWidth / 1440)));
}

export function attachMotion(composed: ComposedParticle[], containerWidth: number): CupcakeParticle[] {
  const mult = sizeMultiplier(containerWidth);

  return composed.map((p) => {
    const duration = rand(...DURATION_RANGE[p.layer]);
    const [driftMin, driftMax] = DRIFT_RANGE[p.layer];
    const driftX = rand(driftMin, driftMax) * mult;
    const driftY = rand(driftMin * 1.15, driftMax * 1.15) * mult;

    return {
      id: p.id,
      image: p.sprite.src,
      width: p.sprite.width,
      height: p.sprite.height,
      layer: p.layer,
      x: p.x,
      y: p.y,
      scale: p.scale * mult,
      opacity: p.opacity,
      blurPx: p.blurPx,
      rotationX: p.rotationX,
      rotationY: p.rotationY,
      rotationZ: p.rotationZ,
      duration,
      delay: rand(0, duration),
      driftX,
      driftY,
      rotationSpeed: rand(...ROTATION_WOBBLE_RANGE[p.layer]),
    };
  });
}
