import { sizes, sizesForServings } from "@/content/data/sizes";
import { confections, cupcakeBase } from "@/content/data/confections";
import { flavours } from "@/content/data/flavours";
import type { OrderFormValues } from "@/lib/schemas";
import type { WeddingOrderFormValues } from "@/lib/schemas";
import { formatRange, formatPriceFrom } from "@/lib/pricing";

export type LedgerLine = { label: string; detail?: string; amount: number };
// `priceFrom` is a real floor — the sum of each selected item's actual "From R…" minimum. It is
// NOT padded into a fabricated range; see designTiers.ts on why no multiplier is applied.
export type Ledger = { lines: LedgerLine[]; priceFrom: number };

const EMPTY_LEDGER: Ledger = { lines: [], priceFrom: 0 };

function confectionLines(selections: OrderFormValues["confections"] | undefined): LedgerLine[] {
  if (!selections?.length) return [];
  return selections
    .map((sel): LedgerLine | null => {
      const c = confections.find((x) => x.id === sel.confectionId);
      if (!c) return null;
      return {
        label: c.name,
        detail: `${sel.quantity} × set of ${c.unit}${sel.note ? ` — ${sel.note}` : ""}`,
        amount: c.priceFrom * sel.quantity,
      };
    })
    .filter((l): l is LedgerLine => l !== null);
}

/** Cake/cupcake order — derives an indicative range from real Size/Servings + Signature
 * Confections data only. Design complexity never moves this number (see designTiers.ts). */
export function computeOrderLedger(values: Partial<OrderFormValues>): Ledger {
  const lines: LedgerLine[] = [];
  let priceFrom = 0;

  if ((values.productType === "cake" || values.productType === "both") && values.guestCount) {
    const candidates = sizesForServings(values.guestCount);
    const chosen = values.sizeId ? candidates.find((s) => s.id === values.sizeId) : undefined;
    const match = chosen ?? candidates[0] ?? sizes.find((s) => s.servingsMax >= (values.guestCount ?? 0));
    if (match) {
      lines.push({
        label: match.ledgerLabel ?? `${match.tierLabel} cake`,
        detail: `${match.sizesCm.map((c) => `${c}cm`).join(", ")}${match.layersNote ? ` (${match.layersNote})` : ""} — ${match.servingsMin}–${match.servingsMax} servings`,
        amount: match.priceFrom,
      });
      priceFrom += match.priceFrom;
    }
  }

  if ((values.productType === "cupcakes" || values.productType === "both") && values.cupcakeDozens) {
    const amount = cupcakeBase.priceFrom * values.cupcakeDozens;
    lines.push({
      label: "Gourmet cupcakes",
      detail: `${values.cupcakeDozens} dozen`,
      amount,
    });
    priceFrom += amount;
  }

  const cLines = confectionLines(values.confections);
  lines.push(...cLines);
  priceFrom += cLines.reduce((sum, l) => sum + l.amount, 0);

  if (lines.length === 0) return EMPTY_LEDGER;

  // Design complexity (Simple/Detailed/Showpiece) can move the final price beyond this floor —
  // see content/data/designTiers.ts. No invented multiplier is applied here.
  return { lines, priceFrom };
}

export function computeWeddingLedger(values: Partial<WeddingOrderFormValues>): Ledger {
  const lines: LedgerLine[] = [];
  let priceFrom = 0;

  if (values.tierCount) {
    const tierSizes = sizes.filter((s) => s.tier === values.tierCount && s.weddingEligible !== false);
    const exactMatch = values.guestCount
      ? tierSizes.find((s) => values.guestCount! >= s.servingsMin && values.guestCount! <= s.servingsMax)
      : undefined;
    // No exact fit for this guest count at this tier count: anchor to the LARGEST size in that
    // tier (never the smallest) so the floor doesn't understate the price — and say so, rather
    // than silently implying a mismatched size/guest-count pairing is fine.
    const largestInTier = tierSizes[tierSizes.length - 1];
    const match = exactMatch ?? largestInTier;
    if (match) {
      const guestsExceedTier =
        !exactMatch && !!values.guestCount && values.guestCount > match.servingsMax;
      const faux = values.fauxTierCount ?? 0;
      const fauxNote = faux > 0 ? ` — ${faux} of ${values.tierCount} tiers faux/dummy (display only, final quote may differ)` : "";
      lines.push({
        label: `${match.tierLabel} wedding cake`,
        detail:
          (guestsExceedTier
            ? `${match.sizesCm.map((c) => `${c}cm`).join(", ")} — up to ${match.servingsMax} servings. ${values.guestCount} guests may need more tiers.`
            : `${match.sizesCm.map((c) => `${c}cm`).join(", ")} — ${match.servingsMin}–${match.servingsMax} servings`) + fauxNote,
        amount: match.priceFrom,
      });
      priceFrom += match.priceFrom;
    }
  }

  if (lines.length === 0) return EMPTY_LEDGER;

  return { lines, priceFrom };
}

export function flavourName(id: string): string {
  return flavours.find((f) => f.id === id)?.name ?? id;
}

export { formatRange, formatPriceFrom };
