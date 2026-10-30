"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { Review } from "@/content/data/reviews";

// Client-requested 2026-10-30: reviews as a carousel — one at a time, set as a large pull quote.
// Same crossfade as components/auto-carousel.tsx, so no new motion enters the vocabulary (§6).
// Every quote sits in the same grid cell, so the section is always as tall as the longest one and
// never jumps between slides. Auto-advances until someone uses the controls, pauses on hover or
// focus, and never moves on its own under prefers-reduced-motion.

const INTERVAL_MS = 8000;

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const arrowClass =
  "flex h-11 w-11 items-center justify-center rounded-[4px] border border-ink-soft text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper";

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userControlled, setUserControlled] = useState(false);
  const reduce = useReducedMotion();
  const count = reviews.length;

  useEffect(() => {
    if (reduce || paused || userControlled || count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduce, paused, userControlled, count]);

  function go(next: number) {
    setUserControlled(true);
    setIndex((next + count) % count);
  }

  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Client reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="text-center"
    >
      {/* Announced only once the visitor is driving it — an auto-advancing live region would talk over them. */}
      <div className="grid" aria-live={userControlled ? "polite" : "off"}>
        {reviews.map((review, i) => {
          const active = i === index;
          return (
            <figure
              key={review.name}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              inert={!active}
              className={`col-start-1 row-start-1 mx-auto max-w-3xl ${
                reduce ? "" : "transition-opacity duration-700 ease-out"
              } ${active ? "opacity-100" : "opacity-0"}`}
            >
              <p className="font-display text-3xl leading-none text-ink" aria-hidden>
                &ldquo;
              </p>
              <blockquote className="mt-2 font-display text-base font-normal leading-snug text-ink md:text-lg">
                {review.quote}
              </blockquote>
              <figcaption className="mt-8 text-sm text-ink-soft">{review.name}</figcaption>
            </figure>
          );
        })}
      </div>

      {count > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(index - 1)} className={arrowClass} aria-label="Previous review">
            <Chevron direction="left" />
          </button>
          <div className="flex items-center">
            {reviews.map((review, i) => (
              <button
                key={review.name}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show review ${i + 1} of ${count}`}
                aria-current={i === index}
                className="flex h-11 w-8 items-center justify-center"
              >
                <span
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-ink" : "w-1.5 bg-ink-soft/40"}`}
                />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1)} className={arrowClass} aria-label="Next review">
            <Chevron direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}
