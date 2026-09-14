// Source: OCD Product Guide & Price Schedule 2026.pdf, page 3 ("Sizes and Servings").
// "From R…" prices are indicative minimums for standard cakes; bespoke/custom designs are quote-based (see OCD Order Form).
// Sizes are a guideline only — the source PDF states OCD will advise a suitable size for the servings/design requested.

export type SizeOption = {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  tierLabel: string;
  sizesCm: number[];
  layersNote?: string; // single-tier rows are described as "4 layers" rather than multiple cake sizes
  servingsMin: number;
  servingsMax: number;
  priceFrom: number; // ZAR
  weddingEligible?: boolean; // default true; set false to exclude from wedding tier-matching (see lib/ledger.ts)
  ledgerLabel?: string; // overrides the default "{tierLabel} cake" ledger line label when that reads wrong
};

export const sizes: SizeOption[] = [
  // Mini cakes and bento boxes — added 2026-09 per baker request, ahead of the Product Guide PDF.
  // Bento boxes bundle a small cake with cupcakes; not offered for weddings.
  { id: "mini-10", tier: 1, tierLabel: "Mini", sizesCm: [10], layersNote: "2 layers", servingsMin: 1, servingsMax: 4, priceFrom: 550, weddingEligible: false },
  { id: "mini-12", tier: 1, tierLabel: "Mini", sizesCm: [12], layersNote: "2 layers", servingsMin: 5, servingsMax: 8, priceFrom: 850, weddingEligible: false },
  // Servings estimated from the 10cm mini (1–4) + 5 cupcakes — TODO(client): confirm exact servings for this bento.
  { id: "bento-10", tier: 1, tierLabel: "Bento box", sizesCm: [10], layersNote: "2 layers + 5 cupcakes", servingsMin: 6, servingsMax: 9, priceFrom: 950, weddingEligible: false, ledgerLabel: "Bento box" },
  // Cupcake count assumed to match the 10cm bento — TODO(client): confirm bundled cupcake count for this size.
  { id: "bento-12", tier: 1, tierLabel: "Bento box", sizesCm: [12], layersNote: "3 layers + 5 cupcakes", servingsMin: 10, servingsMax: 12, priceFrom: 1000, weddingEligible: false, ledgerLabel: "Bento box" },
  // Single Tier
  { id: "1t-12", tier: 1, tierLabel: "Single Tier", sizesCm: [12], layersNote: "4 layers", servingsMin: 12, servingsMax: 16, priceFrom: 1250 },
  { id: "1t-15", tier: 1, tierLabel: "Single Tier", sizesCm: [15], layersNote: "4 layers", servingsMin: 20, servingsMax: 25, priceFrom: 1500 },
  { id: "1t-17", tier: 1, tierLabel: "Single Tier", sizesCm: [17], layersNote: "4 layers", servingsMin: 26, servingsMax: 32, priceFrom: 2000 },
  { id: "1t-20", tier: 1, tierLabel: "Single Tier", sizesCm: [20], layersNote: "4 layers", servingsMin: 35, servingsMax: 40, priceFrom: 2500 },
  { id: "1t-25", tier: 1, tierLabel: "Single Tier", sizesCm: [25], layersNote: "4 layers", servingsMin: 50, servingsMax: 55, priceFrom: 3000 },
  // Two Tier
  { id: "2t-10-12", tier: 2, tierLabel: "Two Tier", sizesCm: [10, 12], layersNote: "Petite", servingsMin: 20, servingsMax: 30, priceFrom: 3000 },
  { id: "2t-12-15", tier: 2, tierLabel: "Two Tier", sizesCm: [12, 15], servingsMin: 35, servingsMax: 40, priceFrom: 4000 },
  { id: "2t-15-20", tier: 2, tierLabel: "Two Tier", sizesCm: [15, 20], servingsMin: 55, servingsMax: 65, priceFrom: 5000 },
  { id: "2t-20-25", tier: 2, tierLabel: "Two Tier", sizesCm: [20, 25], servingsMin: 85, servingsMax: 90, priceFrom: 6500 },
  // Three Tier
  { id: "3t-10-12-15", tier: 3, tierLabel: "Three Tier", sizesCm: [10, 12, 15], servingsMin: 50, servingsMax: 55, priceFrom: 4250 },
  { id: "3t-12-15-20", tier: 3, tierLabel: "Three Tier", sizesCm: [12, 15, 20], servingsMin: 70, servingsMax: 80, priceFrom: 6000 },
  { id: "3t-15-20-25", tier: 3, tierLabel: "Three Tier", sizesCm: [15, 20, 25], servingsMin: 130, servingsMax: 150, priceFrom: 7500 },
  // Four Tier
  { id: "4t-10-12-15-20", tier: 4, tierLabel: "Four Tier", sizesCm: [10, 12, 15, 20], servingsMin: 90, servingsMax: 100, priceFrom: 7000 },
  { id: "4t-12-15-20-25", tier: 4, tierLabel: "Four Tier", sizesCm: [12, 15, 20, 25], servingsMin: 150, servingsMax: 160, priceFrom: 8500 },
  { id: "4t-15-20-25-30", tier: 4, tierLabel: "Four Tier", sizesCm: [15, 20, 25, 30], servingsMin: 200, servingsMax: 220, priceFrom: 9250 },
  // Five Tier
  { id: "5t-10-12-15-20-25", tier: 5, tierLabel: "Five Tier", sizesCm: [10, 12, 15, 20, 25], servingsMin: 160, servingsMax: 170, priceFrom: 9500 },
  { id: "5t-12-15-20-25-30", tier: 5, tierLabel: "Five Tier", sizesCm: [12, 15, 20, 25, 30], servingsMin: 220, servingsMax: 240, priceFrom: 10500 },
  // Six Tier
  { id: "6t-10-12-15-20-25-30", tier: 6, tierLabel: "Six Tier", sizesCm: [10, 12, 15, 20, 25, 30], servingsMin: 230, servingsMax: 250, priceFrom: 11500 },
];

export const sizesFootnote = "All our cakes are covered in white chocolate ganache. Prices listed are for standard cakes — bespoke/custom designs are quoted separately via the order form. Sizes above are a guideline only; OCD will advise a suitable size for your specific design and number of servings.";

/** Sizes whose serving range covers the given guest count, smallest (cheapest) first. */
export function sizesForServings(guestCount: number): SizeOption[] {
  return sizes
    .filter((s) => guestCount >= s.servingsMin && guestCount <= s.servingsMax)
    .sort((a, b) => a.priceFrom - b.priceFrom);
}
