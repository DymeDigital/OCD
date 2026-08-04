"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUpOnce } from "@/lib/motion";

// The site's single below-the-fold motion signature (§6): one fade-up per section, once, never
// repeated as generic decoration elsewhere.
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUpOnce}
    >
      {children}
    </motion.div>
  );
}
