"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/button";
import { FloatingCupcakes } from "@/components/floating-cupcakes";
import { heroLogo, heroHeadlineContainer, heroHeadlineLine, heroSubCta } from "@/lib/motion";

const headlineLines = ["Cakes and cupcakes,", "made for the moment", "you're celebrating."];

// Soft content-avoidance boundary (0-100), not a hard wall — zones.ts ramps a cupcake's selection
// weight down as it approaches this edge rather than banning it outright, so the field flows
// around the copy instead of stopping at an arbitrary rectangle. Set well inside the content
// column's own width (md:w-[48%] below) since the actual headline/CTA glyphs occupy much less of
// that column than its full box; only the sharp foreground layer gets a hard minimum past this.
const SAFE_ZONE_END = 40;
const MOBILE_SAFE_ZONE_BOTTOM = 68;

export function Hero() {
  const reduce = useReducedMotion();
  const initial = reduce ? "visible" : "hidden";

  return (
    <section className="relative min-h-[720px] overflow-hidden md:min-h-[85vh] md:max-h-[920px]">
      <FloatingCupcakes
        safeZoneEnd={SAFE_ZONE_END}
        mobileSafeZoneBottom={MOBILE_SAFE_ZONE_BOTTOM}
        className="z-0"
      />

      <div className="relative z-10 flex h-full max-w-[1280px] flex-col items-center justify-start px-6 py-12 text-center md:w-[48%] md:items-start md:justify-center md:px-20 md:py-20 md:text-left">
        <motion.p
          initial={initial}
          animate="visible"
          variants={heroLogo}
          className="label mb-6 text-ink-soft"
        >
          Durban &middot; Bespoke cakes &amp; confections
        </motion.p>

        <motion.h1
          initial={initial}
          animate="visible"
          variants={heroHeadlineContainer}
          className="font-display text-xl font-medium tracking-[-0.02em] md:text-2xl"
        >
          {headlineLines.map((line) => (
            <motion.span key={line} variants={heroHeadlineLine} className="block">
              {line}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div initial={initial} animate="visible" variants={heroSubCta} className="mt-8 max-w-md">
          <p className="text-lg text-ink-soft">
            Tell us about your cake. We&apos;ll come back to you within 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
            <ButtonLink href="/order">Start your order</ButtonLink>
            <ButtonLink href="/cakes" variant="ghost">
              See what we make
            </ButtonLink>
          </div>
          <div className="mt-12 flex justify-center gap-6 text-sm text-ink-soft md:justify-start">
            <span>Est. 2021</span>
            <span>Durban, South Africa</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
