import gsap from "gsap";
import type { CupcakeParticle } from "@/types/cupcake";

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Wires one particle's continuous motion directly onto its DOM node. Must run inside a
 * `gsap.context()` scope so the caller can revert (kill) everything in one call on unmount —
 * this file never tracks or kills tweens itself.
 *
 * Hardware-accelerated properties only: x/y (translate3d under the hood via GSAP's CSSPlugin),
 * rotationX/Y/Z, scale, opacity. Never top/left/width/height/margin/padding — those (plus blur,
 * which GSAP doesn't need to touch) are set once as plain inline style on the element by
 * FloatingCupcake and never revisited here.
 *
 * GSAP owns the transform/opacity properties entirely once it touches an element — resting values
 * are established with `gsap.set` rather than a hand-authored CSS `transform` string, so the
 * entrance and continuous tweens below compose against a value GSAP's own cache already knows.
 */
/** The resting transform every particle needs regardless of motion preference. */
export function setParticleRestingState(el: HTMLElement, p: CupcakeParticle) {
  gsap.set(el, {
    xPercent: -50,
    yPercent: -50,
    opacity: p.opacity,
    scale: p.scale,
    rotationX: p.rotationX,
    rotationY: p.rotationY,
    rotationZ: p.rotationZ,
    x: 0,
    y: 0,
    force3D: true,
  });
}

export function animateParticle(el: HTMLElement, p: CupcakeParticle) {
  setParticleRestingState(el, p);

  // Entrance: a soft settle-in, not a UI "reveal" (that's Motion's job for hero content) — just
  // avoids a whole field of sprites popping in at once on mount.
  gsap.from(el, {
    opacity: 0,
    scale: p.scale * 0.85,
    duration: 0.9,
    delay: p.delay * 0.15,
    ease: "power2.out",
  });

  // Meander — a closed, randomized loop around the resting position, built as a timeline of
  // chained `.to()` legs. §7: "gently drift through still air... slowly descend... suspended
  // rather than falling" — not a symmetric random wander. The x range stays symmetric (a gentle
  // side-to-side sway); the y range is deliberately skewed toward the positive (downward)
  // direction on every leg but the last, so the path reads as a slow sink that resets, like
  // something suspended settling under its own weight, rather than an aimless drift in every
  // direction equally. The final leg always returns to (0,0), so the loop is seamless with no
  // `yoyo` (yoyo would play the same route backward every other cycle, reading as swinging rather
  // than drifting — confirmed the wrong call in this same file previously).
  const legs = 5;
  const meander = gsap.timeline({ repeat: -1, delay: p.delay });
  for (let leg = 0; leg < legs; leg++) {
    const isLast = leg === legs - 1;
    meander.to(el, {
      x: isLast ? 0 : rand(-p.driftX / 3, p.driftX / 3),
      y: isLast ? 0 : rand(-p.driftY / 6, p.driftY),
      duration: p.duration / legs,
      ease: "sine.inOut",
    });
  }

  // Continuous rotational wobble around the resting tilt — floating, not spinning (§7: "no
  // spinning, no abrupt direction changes"). Amplitude comes from the particle's own
  // `rotationSpeed` (layer-scaled in motion.ts, largest for the foreground layer per §8), and the
  // secondary X wobble stays subordinate to it so no particle ever tips further than it spins.
  gsap.fromTo(
    el,
    { rotationZ: p.rotationZ - p.rotationSpeed },
    {
      rotationZ: p.rotationZ + p.rotationSpeed,
      duration: p.duration * 1.4,
      delay: p.delay * 0.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }
  );

  gsap.fromTo(
    el,
    { rotationX: p.rotationX - p.rotationSpeed * 0.6 },
    {
      rotationX: p.rotationX + p.rotationSpeed * 0.6,
      duration: p.duration * 1.7,
      delay: p.delay * 0.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }
  );
}
