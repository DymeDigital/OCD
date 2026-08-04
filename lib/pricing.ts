// CLAUDE.md §8 price-display rule: always a range, space as thousands separator (SA convention),
// always paired with the confirmation note. Never a single fixed number.

export function formatZAR(amount: number): string {
  return Math.round(amount).toLocaleString("en-US").replace(/,/g, " ");
}

export function formatPriceFrom(amount: number): string {
  return `From R${formatZAR(amount)}`;
}

export function formatRange(from: number, to: number): string {
  if (from === to) return `R${formatZAR(from)}`;
  return `R${formatZAR(from)} – R${formatZAR(to)}`;
}

export const PRICE_CONFIRM_NOTE =
  "Final price confirmed once we've chatted about your design.";
