import gsap from "gsap";
import type { CupcakeParticle } from "@/types/cupcake";

/**
 * Wires one particle's continuous fall directly onto its DOM node. Must run inside a
 * `gsap.context()` scope so the caller can revert (kill) everything in one call on unmount — this
 * file never tracks or kills tweens itself.
 *
 * Hardware-accelerated properties only: x/y (translate3d under the hood via GSAP's CSSPlugin),
 * rotationX/Y/Z, scale, opacity. Never top/left/width/height/margin/padding — those (plus blur,
 * which GSAP doesn't need to touch) are set once as plain inline style on the element by
 * FloatingCupcake and never revisited here.
 *
 * The fall is two independent, concurrently-running tweens on the same element rather than one
 * combined timeline: `fallTween` drives the linear descent + continuous Z spin, `fadeTween` drives
 * the opacity trapezoid (fade in, hold, fade out) that keeps a cupcake invisible while it's in the
 * overshoot band above the zone and again before it would reach the section's true bottom edge —
 * that's what turns a hard clip at the container boundary into a soft disappearance. Both tweens
 * share the same total period (`p.duration`) so they stay in lockstep through every repeat, and
 * both get seeked to the same `p.phase` on creation so the field reads as already-falling on first
 * paint instead of every cupcake launching from the top in unison.
 */

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** A representative mid-fall snapshot — used for the reduced-motion resting frame, where nothing animates but the field still needs to look populated rather than empty or invisible. */
function restingProgress(p: CupcakeParticle): number {
  return clamp(p.phase, p.fadeInEndFrac, p.fadeOutStartFrac);
}

function opacityAtProgress(p: CupcakeParticle, t: number): number {
  if (t < p.fadeInEndFrac) return p.opacityPeak * (t / p.fadeInEndFrac);
  if (t > p.fadeOutStartFrac) return p.opacityPeak * (1 - (t - p.fadeOutStartFrac) / (1 - p.fadeOutStartFrac));
  return p.opacityPeak;
}

/** The static frame every particle needs when motion is disabled — no tweens, just one representative point along its path. */
export function setParticleRestingState(el: HTMLElement, p: CupcakeParticle) {
  const t = restingProgress(p);
  gsap.set(el, {
    xPercent: -50,
    x: 0,
    y: p.fallDistancePx * t,
    opacity: opacityAtProgress(p, t),
    scale: p.scale,
    rotationX: p.rotationX,
    rotationY: p.rotationY,
    rotationZ: p.rotationZStart + p.rotationZDelta * t,
    force3D: true,
  });
}

export function animateParticle(el: HTMLElement, p: CupcakeParticle) {
  gsap.set(el, {
    xPercent: -50,
    x: 0,
    scale: p.scale,
    rotationX: p.rotationX,
    rotationY: p.rotationY,
    force3D: true,
  });

  const fallTween = gsap.fromTo(
    el,
    { y: 0, rotationZ: p.rotationZStart },
    { y: p.fallDistancePx, rotationZ: p.rotationZStart + p.rotationZDelta, duration: p.duration, ease: "none", repeat: -1 }
  );

  const fadeTween = gsap.timeline({ repeat: -1 });
  fadeTween
    .fromTo(el, { opacity: 0 }, { opacity: p.opacityPeak, duration: p.duration * p.fadeInEndFrac, ease: "sine.out" })
    .to(el, { opacity: p.opacityPeak, duration: p.duration * (p.fadeOutStartFrac - p.fadeInEndFrac) })
    .to(el, { opacity: 0, duration: p.duration * (1 - p.fadeOutStartFrac), ease: "sine.in" });

  // Seek both tweens to the same starting point in the loop so the fall and its fade stay in sync
  // through every repeat, and so the field looks mid-flight from the very first frame.
  fallTween.progress(p.phase);
  fadeTween.progress(p.phase);
}
