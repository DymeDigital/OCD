import type { ReactNode } from "react";

// Register A — CLAUDE.md §5: "White, airy, huge margins, photography and the hero animation
// carry it. Almost no lines, no boxes, no borders." Used on landing/product/about pages.

export function SectionA({
  children,
  eyebrow,
  className = "",
  id,
}: {
  children: ReactNode;
  eyebrow?: string;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-[1280px] scroll-mt-24 px-6 py-24 md:px-12 md:py-32 ${className}`}>
      {eyebrow && <p className="label mb-4 text-ink-soft">{eyebrow}</p>}
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="label mb-4 text-ink-soft">{children}</p>;
}
