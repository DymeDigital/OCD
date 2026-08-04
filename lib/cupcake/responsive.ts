/**
 * §9: desktop/tablet/mobile get a recomposed layout, not just a smaller particle count off the
 * same layout — see BREAKPOINT_SPECS in compose.ts, which assigns different front/mid/back counts
 * per tier rather than scaling one count down.
 */
export type DensityTier = "desktop" | "laptop" | "tablet" | "mobile";

export function getDensityTier(viewportWidth: number): DensityTier {
  if (viewportWidth >= 1440) return "desktop";
  if (viewportWidth >= 1024) return "laptop";
  if (viewportWidth >= 640) return "tablet";
  return "mobile";
}

// Matches Hero's `md:` breakpoint, where the content column switches from full-width (stacked
// above the particle field) to a left-side column (particles fill the remaining width beside it).
// Independent of getDensityTier's own thresholds — a tablet-tier viewport can fall on either side
// of this, which is why compose.ts takes `narrow` as a separate argument from `tier`.
export const NARROW_BREAKPOINT = 768;
