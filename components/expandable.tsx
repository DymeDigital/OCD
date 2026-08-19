"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/button";

// Client-requested disclosure pattern (2026-08-15) — collapsed by default, expands in place on
// click. Trigger and content are split (context-shared state) so the button can sit somewhere
// other than directly above the content it reveals — e.g. below a carousel in a different column,
// while the revealed text lives in its own full-width block further down the page.

const DisclosureContext = createContext<{ open: boolean; toggle: () => void } | null>(null);

export function Disclosure({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <DisclosureContext.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>
      {children}
    </DisclosureContext.Provider>
  );
}

function useDisclosure() {
  const ctx = useContext(DisclosureContext);
  if (!ctx) throw new Error("DisclosureTrigger/DisclosureContent must be used inside <Disclosure>");
  return ctx;
}

export function DisclosureTrigger({
  collapsedLabel,
  expandedLabel = "Show less",
  className = "",
}: {
  collapsedLabel: string;
  expandedLabel?: string;
  className?: string;
}) {
  const { open, toggle } = useDisclosure();
  return (
    <Button variant="ghost" onClick={toggle} aria-expanded={open} className={className}>
      {open ? expandedLabel : collapsedLabel}
    </Button>
  );
}

export function DisclosureContent({ children }: { children: ReactNode }) {
  const { open } = useDisclosure();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={reduce ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduce ? undefined : { height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
