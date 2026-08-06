"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { composeLayout } from "@/lib/cupcake/compose";
import { attachMotion } from "@/lib/cupcake/motion";
import { getDensityTier, NARROW_BREAKPOINT, type DensityTier } from "@/lib/cupcake/responsive";
import { debounce } from "@/lib/gsap-helpers";
import type { CupcakeParticle } from "@/types/cupcake";

/**
 * Generates the particle field once on mount (client-only — Math.random() would mismatch SSR
 * hydration if generated during render) and regenerates only when the viewport crosses a density
 * breakpoint, not on every resize pixel. Layout (composeLayout) and motion (attachMotion) are
 * deliberately separate calls — see compose.ts's file comment for why.
 */
export function useCupcakeParticles(
  containerRef: RefObject<HTMLElement | null>,
  safeZoneEnd = 38,
  mobileSafeZoneBottom = 54
): CupcakeParticle[] {
  const [particles, setParticles] = useState<CupcakeParticle[]>([]);
  const lastTier = useRef<DensityTier | null>(null);
  const lastNarrow = useRef<boolean | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function regenerate() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const tier = getDensityTier(rect.width);
      const narrow = rect.width < NARROW_BREAKPOINT;
      lastTier.current = tier;
      lastNarrow.current = narrow;
      const contentBoundary = narrow ? mobileSafeZoneBottom : safeZoneEnd;
      const layout = composeLayout(rect.width, rect.height, tier, narrow, contentBoundary);
      setParticles(attachMotion(layout, rect.width));
    }

    regenerate();

    const onResize = debounce(() => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const tier = getDensityTier(rect.width);
      const narrow = rect.width < NARROW_BREAKPOINT;
      // Tablet-tier widths can cross the narrow/wide content-layout breakpoint without changing
      // density tier (see responsive.ts) — regenerate on either changing, not just the tier.
      if (tier !== lastTier.current || narrow !== lastNarrow.current) regenerate();
    }, 250);

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return particles;
}
