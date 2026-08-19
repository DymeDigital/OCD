"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/content/data/photos";

// First filterable-grid pattern in the codebase (per CLAUDE.md §5, Register A stays photography-
// led — no borders/boxes beyond the plate itself). Uses CSS multi-column masonry rather than
// CSS Grid: a grid with row-spanning "hero" tiles next to fixed-aspect tiles leaves uneven gaps,
// because spanning items and single-row items don't share row-track sizing. Columns avoid that
// entirely — each column packs its own items tightly regardless of neighbouring column heights.

export type GalleryFilter = "all" | "cake" | "cupcakes" | "wedding";

const filters: { id: GalleryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cake", label: "Cakes" },
  { id: "cupcakes", label: "Cupcakes" },
  { id: "wedding", label: "Weddings" },
];

export function GalleryGrid({
  photos,
  filterable = true,
  initialFilter = "all",
  limit,
}: {
  photos: Photo[];
  filterable?: boolean;
  initialFilter?: GalleryFilter;
  limit?: number;
}) {
  const [active, setActive] = useState<GalleryFilter>(initialFilter);
  const filtered = active === "all" ? photos : photos.filter((p) => p.category === active);
  const visible = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div>
      {filterable && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActive(f.id)}
              aria-pressed={active === f.id}
              className={`label rounded-[4px] border px-4 py-2 transition-colors ${
                active === f.id
                  ? "border-ink bg-ink text-paper"
                  : "border-rule text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="columns-2 gap-4 md:columns-4">
        {visible.map((photo, i) => (
          <figure
            key={photo.id}
            className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-[4px] bg-icing ${
              photo.hero ? "aspect-[4/6]" : "aspect-[4/5]"
            }`}
          >
            <Image
              src={`/images/${photo.file}`}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              priority={i < 2}
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
