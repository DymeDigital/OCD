"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

type CarouselPhoto = { file: string; alt: string };

// Auto-advancing crossfade carousel — client-requested addition (2026-08-15) for /cakes,
// /cupcakes hero companions and the About page. Respects prefers-reduced-motion by freezing on
// the first frame rather than cycling (CLAUDE.md §6's reduced-motion rule, extended here).

export function AutoCarousel({
  photos,
  intervalMs = 4000,
  aspectClassName = "aspect-[4/5]",
  className = "",
  href,
  hrefLabel = "View gallery",
}: {
  photos: CarouselPhoto[];
  intervalMs?: number;
  aspectClassName?: string;
  className?: string;
  href?: string;
  hrefLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || photos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [photos.length, intervalMs, reduce]);

  if (photos.length === 0) return null;

  const frame = (
    <div
      className={`relative overflow-hidden rounded-[4px] bg-icing ${aspectClassName} ${
        href ? "group" : ""
      }`}
    >
      {photos.map((photo, i) => (
        <Image
          key={photo.file}
          src={`/images/${photo.file}`}
          alt={photo.alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className={`object-cover transition-[opacity,transform] duration-700 ease-out ${
            href ? "group-hover:scale-[1.03]" : ""
          } ${i === index ? "opacity-100" : "opacity-0"}`}
          priority={i === 0}
        />
      ))}
    </div>
  );

  return (
    <div className={className}>
      {href ? (
        <Link href={href} aria-label={hrefLabel} className="block">
          {frame}
        </Link>
      ) : (
        frame
      )}
      {photos.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {photos.map((photo, i) => (
            <span
              key={photo.file}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? "bg-ink" : "bg-rule"
              }`}
              aria-hidden
            />
          ))}
        </div>
      )}
    </div>
  );
}
