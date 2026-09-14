"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FaqItem } from "@/content/data/faq";

// One row, one independent toggle — same height/opacity transition as the site's other
// click-to-expand pattern (components/expandable.tsx, client-requested 2026-08-15), rebuilt here
// as a plain row rather than a bordered button: fifty-odd questions read as a list, not a stack
// of buttons.
export function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const contentId = useId();

  return (
    <div className="border-b border-rule">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="font-display text-lg font-medium">{item.q}</span>
        <span
          aria-hidden
          className={`shrink-0 text-2xl font-light leading-none text-ink-soft transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            role="region"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="max-w-2xl space-y-3 pb-6 text-ink-soft">
              {item.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              {item.list && (
                <ul className="list-disc space-y-1 pl-5">
                  {item.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
