import { forwardRef } from "react";
import Image from "next/image";
import type { CupcakeParticle } from "@/types/cupcake";

// Base CSS width — constant, deliberately NOT multiplied by p.scale here. GSAP's `scale` transform
// (particle-engine.ts's setParticleRestingState) is the sole sizing mechanism; this used to also
// bake p.scale into the CSS width, which compounded with GSAP's transform (a scale=1.35 particle
// rendered at 1.35×1.35 ≈ 1.82× its intended size) — exactly the mismatch that let large/hero-tier
// cupcakes visually overlap despite compose.ts's spacing math reserving room for their real size.
const BASE_WIDTH = 260;

/**
 * Purely presentational — position/blur/size are set once as plain inline style (never animated,
 * never top/left thrash) and never touched again. Opacity and every transform component
 * (scale/rotationX/Y/Z, the drift x/y, and the centering xPercent/yPercent) are left for GSAP to
 * own entirely via `gsap.set`/tweens in a `useLayoutEffect` in the parent — one source of truth,
 * set before first paint, so there's no flash and no fight over the `transform` property.
 */
export const FloatingCupcake = forwardRef<HTMLDivElement, { particle: CupcakeParticle }>(
  function FloatingCupcake({ particle: p }, ref) {
    return (
      <div
        ref={ref}
        className="pointer-events-none absolute will-change-transform"
        style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: BASE_WIDTH,
          filter: p.blurPx ? `blur(${p.blurPx}px)` : undefined,
          // No 3D-transformed children live inside this div (the <Image> is flat), so
          // `transform-style: preserve-3d` here does nothing useful — and the same combination
          // (preserve-3d + an ancestor with both `perspective` and `overflow: hidden`) already
          // caused a real Chromium rendering bug once in this component tree (see
          // floating-cupcakes.tsx's comment on the layer wrapper divs). Here it showed up as
          // particles escaping the hero's clip boundary and rendering into the section below.
        }}
      >
        <Image
          src={p.image}
          alt=""
          width={p.width}
          height={p.height}
          sizes="300px"
          className="h-auto w-full select-none"
          draggable={false}
          // Only 3 distinct sprite URLs exist across the whole field (see SPRITES in
          // cupcake-generator.ts), so `priority` on every instance still only triggers 3 fetches —
          // it just stops Next.js lazy-loading whichever instance happens to be the largest paint
          // (see LCP warning this fixed: a background sprite was outracing the headline text,
          // which itself starts at opacity:0 for its Motion entrance and so doesn't count for LCP).
          priority
        />
      </div>
    );
  }
);
