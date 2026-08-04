"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { FloatingCupcake } from "@/components/floating-cupcake";
import { useCupcakeParticles } from "@/hooks/use-cupcake-particles";
import { useMouseParallax } from "@/hooks/use-mouse-parallax";
import { animateParticle, setParticleRestingState } from "@/lib/cupcake/particle-engine";
import { prefersReducedMotion } from "@/lib/gsap-helpers";
import type { CupcakeParticle } from "@/types/cupcake";

/**
 * The hero's continuous background particle field. Owns its own animation lifecycle end to end —
 * initializes once particles exist, runs independently of React re-renders and scroll, and cleans
 * up via `gsap.context().revert()` on unmount or when the particle set regenerates (viewport
 * crossed a density breakpoint). Nothing here triggers a React re-render once mounted; GSAP
 * animates the DOM nodes directly.
 */
export function FloatingCupcakes({
  safeZoneEnd = 40,
  mobileSafeZoneBottom = 60,
  className = "",
}: {
  /** Right edge (0-100) of the protected content zone on wide viewports — few/no particles start left of this. */
  safeZoneEnd?: number;
  /** Bottom edge (0-100) of the protected content zone on narrow viewports, where content stacks full-width above the particle field instead of beside it. */
  mobileSafeZoneBottom?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const frontLayerRef = useRef<HTMLDivElement>(null);
  const particleElRefs = useRef(new Map<string, HTMLDivElement>());

  const particles = useCupcakeParticles(containerRef, safeZoneEnd, mobileSafeZoneBottom);

  const byLayer = useMemo(() => {
    const layers: Record<0 | 1 | 2, CupcakeParticle[]> = { 0: [], 1: [], 2: [] };
    for (const p of particles) layers[p.layer].push(p);
    return layers;
  }, [particles]);

  useLayoutEffect(() => {
    if (particles.length === 0) return;
    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      for (const p of particles) {
        const el = particleElRefs.current.get(p.id);
        if (!el) continue;
        if (reduce) setParticleRestingState(el, p);
        else animateParticle(el, p);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [particles]);

  useMouseParallax(containerRef, [backLayerRef, midLayerRef, frontLayerRef]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden [perspective:1000px] ${className}`}
      aria-hidden
    >
      {/* Tried `transform-style: preserve-3d` here to properly chain the container's `perspective`
          down to each rotated particle — CSS-correct in theory, but empirically it triggers a real
          Chromium rendering bug in combination with this container's `overflow-hidden` +
          `perspective` (particles render washed-out/near-invisible; confirmed by toggling it live
          and watching the same particles reappear). Left flat (the default) instead — the actual
          fix for warped-looking blurred particles is removing 3D tilt on the back layer below,
          not this. */}
      <div ref={backLayerRef} className="absolute inset-0">
        {byLayer[0].map((p) => (
          <FloatingCupcake
            key={p.id}
            particle={p}
            ref={(el) => {
              if (el) particleElRefs.current.set(p.id, el);
              else particleElRefs.current.delete(p.id);
            }}
          />
        ))}
      </div>
      <div ref={midLayerRef} className="absolute inset-0">
        {byLayer[1].map((p) => (
          <FloatingCupcake
            key={p.id}
            particle={p}
            ref={(el) => {
              if (el) particleElRefs.current.set(p.id, el);
              else particleElRefs.current.delete(p.id);
            }}
          />
        ))}
      </div>
      <div ref={frontLayerRef} className="absolute inset-0">
        {byLayer[2].map((p) => (
          <FloatingCupcake
            key={p.id}
            particle={p}
            ref={(el) => {
              if (el) particleElRefs.current.set(p.id, el);
              else particleElRefs.current.delete(p.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
