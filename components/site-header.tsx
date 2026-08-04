"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { primaryNav, CTA_LABEL, CTA_HREF } from "@/lib/nav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/images/ocd-logo.png" alt="OCD — Obsessive Cupcake Disorder" width={40} height={40} className="h-10 w-10" priority />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-base font-semibold">OCD</span>
            <span className="label text-ink-soft">Obsessive Cupcake Disorder</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={CTA_HREF}
            className="label hidden rounded-[4px] border border-ink px-5 py-2.5 transition-colors hover:bg-ink hover:text-paper sm:inline-block"
          >
            {CTA_LABEL}
          </Link>
          <button
            type="button"
            className="label rounded-[4px] border border-ink px-3 py-2 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="flex flex-col gap-1 border-t border-rule px-6 py-4 md:hidden">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label py-3 text-ink-soft transition-colors hover:text-ink"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={CTA_HREF}
            className="label mt-2 rounded-[4px] border border-ink px-5 py-3 text-center"
            onClick={() => setOpen(false)}
          >
            {CTA_LABEL}
          </Link>
        </nav>
      )}
    </header>
  );
}
