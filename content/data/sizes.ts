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
  // Client-confirmed 2026-09-18: this is the only bento box option — a 12cm bento does not exist.
  // Servings estimated from the 10cm mini (1–4) + 5 cupcakes — TODO(client): confirm exact servings for this bento.
  { id: "bento-10", tier: 1, tierLabel: "Bento box", sizesCm: [10], layersNote: "2 layers + 5 cupcakes", servingsMin: 6, servingsMax: 9, priceFrom: 950, weddingEligible: false, ledgerLabel: "Bento box" },
  // Single Tier
  // Client-confirmed 2026-09-19: this is NOT a mini cake — it's a Single Tier, 8–10 servings (was
  // filed as "Mini", 10–12 servings). No cupcakes included.
  { id: "1t-12-3l", tier: 1, tierLabel: "Single Tier", sizesCm: [12], layersNote: "3 layers", servingsMin: 8, servingsMax: 10, priceFrom: 1000, weddingEligible: false },
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

/** The size a cake/cupcake order is quoted on: the customer's own pick (which may be deliberately
 * bigger or smaller than the guest count suggests), else the cheapest fit, else the first size big
 * enough. */
export function resolveCakeSize(guestCount: number | undefined, sizeId: string | undefined): SizeOption | undefined {
  const chosen = sizeId ? sizes.find((s) => s.id === sizeId) : undefined;
  if (chosen) return chosen;
  if (!guestCount) return undefined;
  return sizesForServings(guestCount)[0] ?? sizes.find((s) => s.servingsMax >= guestCount);
}

export const weddingSizes = sizes.filter((s) => s.weddingEligible !== false);

/** The size a wedding cake is quoted on. A size the couple picked themselves wins (the form keeps
 * tierCount in step with it); otherwise the guest-count fit at that tier count — or, with no exact
 * fit, the LARGEST size at that tier count, so the floor never understates the price. */
export function resolveWeddingSize(
  guestCount: number | undefined,
  tierCount: number | undefined,
  sizeId: string | undefined
): { size: SizeOption | undefined; exact: boolean; chosen: boolean } {
  const chosen = sizeId ? weddingSizes.find((s) => s.id === sizeId) : undefined;
  if (chosen && (!tierCount || chosen.tier === tierCount)) return { size: chosen, exact: true, chosen: true };
  if (!tierCount) return { size: undefined, exact: false, chosen: false };
  const tierSizes = weddingSizes.filter((s) => s.tier === tierCount);
  const exactMatch = guestCount
    ? tierSizes.find((s) => guestCount >= s.servingsMin && guestCount <= s.servingsMax)
    : undefined;
  return { size: exactMatch ?? tierSizes[tierSizes.length - 1], exact: !!exactMatch, chosen: false };
}

// Client-supplied 2026-10-24 (chat, not yet in the Product Guide PDF): rectangle/table cakes,
// offered on both order forms. A guideline only — the baker can do wider or longer cakes.
export type TableCakeSize = {
  id: string;
  widthCm: number;
  lengthCm: number;
  servingsMin?: number;
  servingsMax?: number;
  priceFrom: number; // ZAR
};

export const tableCakeSizes: TableCakeSize[] = [
  { id: "table-9x18", widthCm: 9, lengthCm: 18, servingsMin: 10, servingsMax: 16, priceFrom: 1250 },
  { id: "table-13x25", widthCm: 13, lengthCm: 25, servingsMin: 16, servingsMax: 20, priceFrom: 1800 },
  { id: "table-13x50", widthCm: 13, lengthCm: 50, servingsMin: 30, servingsMax: 35, priceFrom: 3500 },
  { id: "table-13x60", widthCm: 13, lengthCm: 60, servingsMin: 40, servingsMax: 45, priceFrom: 4500 },
  { id: "table-13x75", widthCm: 13, lengthCm: 75, servingsMin: 50, servingsMax: 55, priceFrom: 6000 },
  { id: "table-13x100", widthCm: 13, lengthCm: 100, servingsMin: 60, servingsMax: 70, priceFrom: 7500 },
  { id: "table-15x40", widthCm: 15, lengthCm: 40, servingsMin: 40, servingsMax: 50, priceFrom: 3500 },
  { id: "table-15x80", widthCm: 15, lengthCm: 80, servingsMin: 80, servingsMax: 80, priceFrom: 8000 },
  { id: "table-15x100", widthCm: 15, lengthCm: 100, servingsMin: 100, servingsMax: 100, priceFrom: 10000 },
  { id: "table-15x120", widthCm: 15, lengthCm: 120, servingsMin: 120, servingsMax: 120, priceFrom: 12000 },
  { id: "table-15x160", widthCm: 15, lengthCm: 160, servingsMin: 140, servingsMax: 160, priceFrom: 16000 },
  { id: "table-18x36", widthCm: 18, lengthCm: 36, servingsMin: 30, servingsMax: 50, priceFrom: 4000 },
  { id: "table-18x54", widthCm: 18, lengthCm: 54, servingsMin: 50, servingsMax: 70, priceFrom: 6000 },
  { id: "table-18x72", widthCm: 18, lengthCm: 72, servingsMin: 70, servingsMax: 90, priceFrom: 8000 },
  { id: "table-18x90", widthCm: 18, lengthCm: 90, servingsMin: 90, servingsMax: 110, priceFrom: 11000 },
  { id: "table-18x110", widthCm: 18, lengthCm: 110, servingsMin: 110, servingsMax: 130, priceFrom: 13500 },
  { id: "table-18x120", widthCm: 18, lengthCm: 120, servingsMin: 130, servingsMax: 150, priceFrom: 15000 },
  { id: "table-30x40", widthCm: 30, lengthCm: 40, servingsMin: 60, servingsMax: 60, priceFrom: 4000 },
  { id: "table-30x80", widthCm: 30, lengthCm: 80, servingsMin: 100, servingsMax: 110, priceFrom: 8500 },
  // TODO(client): the source said "1.2cm length" — read as 1.2m.
  { id: "table-30x120", widthCm: 30, lengthCm: 120, servingsMin: 150, servingsMax: 150, priceFrom: 15000 },
  // TODO(client): no servings given, and the price was marked "R20 000*" — confirm both.
  { id: "table-30x160", widthCm: 30, lengthCm: 160, priceFrom: 20000 },
];

export const tableCakeWidths = [...new Set(tableCakeSizes.map((s) => s.widthCm))];

export function formatLengthCm(cm: number): string {
  return cm >= 100 ? `${cm / 100}m` : `${cm}cm`;
}

export function tableServingsLabel(s: TableCakeSize): string | undefined {
  if (!s.servingsMin) return undefined;
  return s.servingsMax && s.servingsMax !== s.servingsMin ? `${s.servingsMin}–${s.servingsMax}` : `${s.servingsMin}`;
}

// Client-supplied 2026-10-24. TODO(client): the brief's "Topped" line was cut off — topped with what?
export const italianCake = {
  label: "Italian style cake",
  sizeCm: 50,
  layersNote: "2 layers",
  servingsMin: 70,
  servingsMax: 80,
  priceFrom: 6500,
  recommendation: "Vanilla Bean with Swiss meringue filling",
};

export const cakeKinds = ["tiered", "table", "italian"] as const;
export type CakeKind = (typeof cakeKinds)[number];

/** Ledger-ready description of a non-tiered cake (table or Italian) — undefined when not enough
 * has been picked yet. Tiered cakes are described from SizeOption by lib/ledger.ts. */
export function describeSpecialCake(
  kind: unknown,
  tableSizeId: string | null | undefined
): { label: string; detail: string; priceFrom: number } | undefined {
  if (kind === "italian") {
    return {
      label: italianCake.label,
      detail: `${italianCake.sizeCm}cm, ${italianCake.layersNote} — ${italianCake.servingsMin}–${italianCake.servingsMax} servings`,
      priceFrom: italianCake.priceFrom,
    };
  }
  if (kind === "table") {
    const s = tableCakeSizes.find((t) => t.id === tableSizeId);
    if (!s) return undefined;
    const servings = tableServingsLabel(s);
    return {
      label: "Rectangle table cake",
      detail: `${s.widthCm}cm × ${formatLengthCm(s.lengthCm)}${servings ? ` — ${servings} servings` : ""}`,
      priceFrom: s.priceFrom,
    };
  }
  return undefined;
}

/** "Rectangle table cake — 13cm × 50cm — 30–35 servings", for the baker's email and order page. */
export function specialCakeText(kind: unknown, tableSizeId: string | null | undefined): string | undefined {
  const s = describeSpecialCake(kind, tableSizeId);
  return s ? `${s.label} — ${s.detail}` : undefined;
}
