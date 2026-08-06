/**
 * Attaches fall timing (duration, spin, loop phase) to an already-composed, already-placed layout.
 * Knows nothing about placement, lanes or fall distance — see compose.ts for the "where does this
 * lane sit" half of the split described there.
 *
 * Everything here is a deterministic function of a particle's layer and its index within that
 * layer — no `Math.random()` — so the field's *motion* is genuinely pre-programmed: the same
 * cupcake falls the same way, at the same pace, on every load. Per §8: back is slowest/least spin,
 * front is fastest/most noticeable spin, and every layer stays calm — a steady linear fall, not a
 * bounce or a tumble that reads as rain. See particle-engine.ts for how these numbers drive the
 * actual GSAP timeline (the linear descent, the fade band at each end, the Z-only spin).
 */
import type { CupcakeLayer, CupcakeParticle } from "@/types/cupcake";
import type { ComposedParticle } from "./compose";

// Seconds for one full top-to-bottom pass. Back is the slowest (matches its smaller, softer look),
// front the fastest so it reads as the layer closest to the viewer.
const DURATION_BASE: Record<CupcakeLayer, number> = { 0: 22, 1: 16, 2: 12 };
const DURATION_STEP: Record<CupcakeLayer, number> = { 0: 1.6, 1: 1.3, 2: 1.0 };

// Total degrees turned over one pass — pure Z spin (never warps the flat sprite, unlike X/Y, see
// poses.ts), so front can afford a much more noticeable tumble than back without ever looking wrong.
const ROTATION_DELTA_BASE: Record<CupcakeLayer, number> = { 0: 36, 1: 65, 2: 95 };
const ROTATION_DELTA_STEP: Record<CupcakeLayer, number> = { 0: 10, 1: 14, 2: 18 };

// Loop phase per layer is offset from the others so all three don't visibly "restart" together.
const PHASE_LAYER_OFFSET: Record<CupcakeLayer, number> = { 0: 0, 1: 0.33, 2: 0.66 };

function sizeMultiplier(containerWidth: number): number {
  return Math.max(0.5, Math.min(1, Math.sqrt(containerWidth / 1440)));
}

export function attachMotion(composed: ComposedParticle[], containerWidth: number): CupcakeParticle[] {
  const mult = sizeMultiplier(containerWidth);

  const countByLayer: Record<CupcakeLayer, number> = { 0: 0, 1: 0, 2: 0 };
  for (const p of composed) countByLayer[p.layer]++;
  const seenByLayer: Record<CupcakeLayer, number> = { 0: 0, 1: 0, 2: 0 };

  return composed.map((p) => {
    const index = seenByLayer[p.layer]++;
    const count = Math.max(1, countByLayer[p.layer]);

    const duration = DURATION_BASE[p.layer] + (index % 3) * DURATION_STEP[p.layer];
    const rotationMag = ROTATION_DELTA_BASE[p.layer] + (index % 2) * ROTATION_DELTA_STEP[p.layer];
    const rotationSign = index % 2 === 0 ? 1 : -1;
    const phase = (index / count + PHASE_LAYER_OFFSET[p.layer]) % 1;

    return {
      id: p.id,
      image: p.sprite.src,
      width: p.sprite.width,
      height: p.sprite.height,
      layer: p.layer,
      x: p.x,
      topPct: p.topPct,
      fallDistancePx: p.fallDistancePx,
      fadeInEndFrac: p.fadeInEndFrac,
      fadeOutStartFrac: p.fadeOutStartFrac,
      scale: p.scale * mult,
      opacityPeak: p.opacity,
      blurPx: p.blurPx,
      rotationX: p.rotationX,
      rotationY: p.rotationY,
      rotationZStart: p.rotationZStart,
      rotationZDelta: rotationMag * rotationSign,
      duration,
      phase,
    };
  });
}
