"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/content/data/photos";
import { photoSrc } from "@/lib/photo-src";
import { Thumb } from "@/components/admin/photo-ledger";

// The three photos under "Cakes, cupcakes and confections, made to the millimetre." on the home
// page. Titles match app/page.tsx; each plate suggests photos from its own section first.
const plates: { title: string; category: Photo["category"] }[] = [
  { title: "Celebration cakes", category: "cake" },
  { title: "Wedding cakes", category: "wedding" },
  { title: "Cupcakes & confections", category: "cupcakes" },
];

export function HomePlates({
  ids,
  photos,
  onChange,
}: {
  ids: [string, string, string];
  photos: Photo[];
  onChange: (next: [string, string, string]) => void;
}) {
  const [picking, setPicking] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const byId = new Map(photos.map((p) => [p.id, p]));

  return (
    <div>
      <p className="max-w-xl text-ink-soft">
        The three photos near the top of the home page, one per line of work. Pick them from the photo library.
      </p>
      <ol className="mt-8 border-t border-ink">
        {plates.map((plate, i) => {
          const current = byId.get(ids[i]);
          const open = picking === i;
          const options = (showAll ? photos : photos.filter((p) => p.category === plate.category)).filter((p) => p.file);
          return (
            <li key={plate.title} className="border-b border-rule py-4">
              <div className="flex items-center gap-4">
                <Thumb file={current?.file ?? ""} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{plate.title}</p>
                  <p className="line-clamp-2 text-sm text-ink-soft">{current?.alt ?? "No photo picked"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPicking(open ? null : i);
                    setShowAll(false);
                  }}
                  aria-expanded={open}
                  className="min-h-11 shrink-0 px-1 text-sm text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                >
                  {open ? "Done" : "Change photo"}
                </button>
              </div>

              {open && (
                <div className="mt-4">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8" role="radiogroup" aria-label={`Photo for ${plate.title}`}>
                    {options.map((p) => {
                      const selected = p.id === ids[i];
                      return (
                        <button
                          key={p.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={p.alt || "Photo without a description"}
                          onClick={() => {
                            const next = [...ids] as [string, string, string];
                            next[i] = p.id;
                            onChange(next);
                          }}
                          className={`relative aspect-[4/5] overflow-hidden rounded-[4px] bg-icing outline-offset-2 ${
                            selected ? "outline outline-2 outline-red-ink" : ""
                          }`}
                        >
                          <Image src={photoSrc(p)} alt="" fill sizes="120px" className="object-cover" />
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    className="mt-3 min-h-11 px-1 text-sm text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                  >
                    {showAll ? "Only show suggested photos" : "Show the whole library"}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
