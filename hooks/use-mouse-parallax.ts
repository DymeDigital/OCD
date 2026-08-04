"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/gsap-helpers";

// Parallax is applied per DEPTH LAYER (a wrapping <div> per layer), not per particle — a particle
// already owns its own `x`/`y` drift tween (particle-engine.ts), and GSAP can't cleanly run two
// independent tweens driving the same transform property on the same element. Nesting a
// layer-level parallax translate around each particle's own transform composes fine in CSS.
const LAYER_WEIGHTS = [6, 14, 24]; // px of max travel per layer, back -> front

export function useMouseParallax(
  containerRef: RefObject<HTMLElement | null>,
  layerRefs: RefObject<HTMLDivElement | null>[]
) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const container = containerRef.current;
    if (!container) return;

    const setters = layerRefs.map((ref, i) => {
      const el = ref.current;
      if (!el) return null;
      return {
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
        weight: LAYER_WEIGHTS[i] ?? 10,
      };
    });

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      setters.forEach((s) => {
        if (!s) return;
        s.x(nx * s.weight);
        s.y(ny * s.weight);
      });
    }

    function onMouseLeave() {
      setters.forEach((s) => {
        if (!s) return;
        s.x(0);
        s.y(0);
      });
    }

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
