import { resolveCakeSize, resolveWeddingSize, describeSpecialCake, type SizeOption } from "@/content/data/sizes";
import { singleFlavourSurcharge, tieredFlavourSurcharge, type FlavourSurcharge } from "@/lib/flavour-pricing";
import { confections, cupcakeBase } from "@/content/data/confections";
import { cupcakeStyles } from "@/content/data/cupcake-styles";
import { flavours, spongeLabel } from "@/content/data/flavours";
import { fillingName } from "@/content/data/fillings";
import { tierRows, dozenRows, type FlavourPick, type TierPick } from "@/lib/flavour-picks";
import type { OrderFormValues } from "@/lib/schemas";
import type { WeddingOrderFormValues } from "@/lib/schemas";
import { formatRange, formatPriceFrom } from "@/lib/pricing";

// `sub` lists a line's own breakdown — a tiered cake's flavour per tier (top first), or mixed
// cupcakes' flavours by the dozen — shown indented under it, like sub-entries in a ledger.
export type LedgerLine = { label: string; detail?: string; amount: number; sub?: { label: string; value: string }[] };
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

function cupcakeLine(
  dozens: number,
  styleId: string | null | undefined,
  variantId: string | null | undefined,
  dozenFlavours?: FlavourPick[]
): LedgerLine {
  const style = cupcakeStyles.find((s) => s.id === styleId);
  const variant = style?.variants?.find((v) => v.id === variantId);
  const unitPrice = variant?.priceFrom ?? style?.priceFrom ?? cupcakeBase.priceFrom;
  const styleDetail = variant ? `${style!.label} — ${variant.label}` : style?.label;
  const sub = dozenFlavours?.some((d) => d.flavourId) ? dozenRows(dozenFlavours, dozens) : undefined;
  return {
    label: "Gourmet cupcakes",
    detail: `${dozens} dozen${styleDetail ? ` — ${styleDetail}` : ""}`,
    amount: unitPrice * dozens,
    sub,
  };
}

function sizeDetail(size: SizeOption): string {
  return `${size.sizesCm.map((c) => `${c}cm`).join(", ")}${size.layersNote ? ` (${size.layersNote})` : ""}`;
}

function tierSub(tiers: TierPick[] | undefined): LedgerLine["sub"] {
  return tiers && tiers.length > 1 ? tierRows(tiers) : undefined;
}

// The flavour/filling percentage, as its own ledger line under the cake (lib/flavour-pricing.ts).
function surchargeLine(s: FlavourSurcharge | null): LedgerLine | null {
  return s ? { label: "Flavour & filling", detail: s.detail, amount: s.amount, sub: s.sub } : null;
}

function isSpecialKind(kind: unknown) {
  return kind === "table" || kind === "italian";
}

/** Cake/cupcake order — derives an indicative range from real Size/Servings + Signature
 * Confections data only. Design complexity never moves this number (see designTiers.ts). */
export function computeOrderLedger(values: Partial<OrderFormValues>): Ledger {
  const lines: LedgerLine[] = [];
  let priceFrom = 0;
  function add(line: LedgerLine | null) {
    if (!line) return;
    lines.push(line);
    priceFrom += line.amount;
  }

  if (values.productType === "cake" || values.productType === "both") {
    const singlePick = {
      flavourId: values.cakeFlavourId,
      spongeId: values.cakeFlavourId ? values.cakeFlavourSponges?.[values.cakeFlavourId] : undefined,
      fillingId: values.cakeFlavourId ? values.cakeFlavourFillings?.[values.cakeFlavourId] : undefined,
    };
    if (isSpecialKind(values.cakeKind)) {
      const special = describeSpecialCake(values.cakeKind, values.tableSizeId);
      if (special) {
        add({ label: special.label, detail: special.detail, amount: special.priceFrom });
        add(surchargeLine(singleFlavourSurcharge(special.priceFrom, singlePick)));
      }
    } else if (values.guestCount) {
      // A customer can deliberately pick a bigger or smaller cake than their guest count suggests.
      const match = resolveCakeSize(values.guestCount, values.sizeId);
      if (match) {
        add({
          label: match.ledgerLabel ?? `${match.tierLabel} cake`,
          detail: `${sizeDetail(match)} — ${match.servingsMin}–${match.servingsMax} servings`,
          amount: match.priceFrom,
          sub: tierSub(values.cakeTiers),
        });
        const multi = (values.cakeTiers?.length ?? 0) > 1;
        add(
          surchargeLine(
            multi
              ? tieredFlavourSurcharge(match.priceFrom, values.cakeTiers!)
              : singleFlavourSurcharge(match.priceFrom, singlePick)
          )
        );
      }
    }
  }

  if ((values.productType === "cupcakes" || values.productType === "both") && values.cupcakeDozens) {
    add(
      cupcakeLine(
        values.cupcakeDozens,
        values.cupcakeStyleId,
        values.cupcakeStyleVariantId,
        values.cupcakeMixFlavours ? values.cupcakeDozenFlavours : undefined
      )
    );
  }

  confectionLines(values.confections).forEach(add);

  if (lines.length === 0) return EMPTY_LEDGER;

  // Design complexity (Simple/Detailed/Showpiece) can move the final price beyond this floor —
  // see content/data/designTiers.ts. No invented multiplier is applied here.
  return { lines, priceFrom };
}

export function computeWeddingLedger(values: Partial<WeddingOrderFormValues>): Ledger {
  const lines: LedgerLine[] = [];
  let priceFrom = 0;
  function add(line: LedgerLine | null) {
    if (!line) return;
    lines.push(line);
    priceFrom += line.amount;
  }
  const tiers = values.tiers ?? [];

  if (isSpecialKind(values.cakeKind)) {
    const special = describeSpecialCake(values.cakeKind, values.tableSizeId);
    if (special) {
      add({ label: special.label, detail: special.detail, amount: special.priceFrom });
      if (tiers[0]) add(surchargeLine(singleFlavourSurcharge(special.priceFrom, tiers[0])));
    }
  } else {
    // No exact fit for this guest count at this tier count: resolveWeddingSize anchors to the
    // LARGEST size in that tier (never the smallest) so the floor doesn't understate the price — and
    // the line says so, rather than silently implying a mismatched size/guest-count pairing is fine.
    const { size: match, exact } = resolveWeddingSize(values.guestCount, values.tierCount, values.sizeId);
    if (match) {
      const guestsExceedTier = !exact && !!values.guestCount && values.guestCount > match.servingsMax;
      const faux = tiers.filter((t) => t.faux).length;
      const fauxNote = faux > 0 ? ` — ${faux} dummy tier${faux > 1 ? "s" : ""} (final quote may differ)` : "";
      add({
        label: `${match.tierLabel} wedding cake`,
        detail:
          (guestsExceedTier
            ? `${sizeDetail(match)} — up to ${match.servingsMax} servings. ${values.guestCount} guests may need more tiers.`
            : `${sizeDetail(match)} — ${match.servingsMin}–${match.servingsMax} servings`) + fauxNote,
        amount: match.priceFrom,
        sub: tierSub(tiers),
      });
      add(
        surchargeLine(
          tiers.length > 1
            ? tieredFlavourSurcharge(match.priceFrom, tiers)
            : tiers[0]
              ? singleFlavourSurcharge(match.priceFrom, tiers[0])
              : null
        )
      );
    }
  }

  if (values.cupcakeDozens) {
    add(cupcakeLine(values.cupcakeDozens, values.cupcakeStyleId, values.cupcakeStyleVariantId, values.cupcakeDozenFlavours));
  }

  confectionLines(values.confections).forEach(add);

  if (lines.length === 0) return EMPTY_LEDGER;

  return { lines, priceFrom };
}

export function flavourName(id: string): string {
  return flavours.find((f) => f.id === id)?.name ?? id;
}

export function flavourLabel(
  id: string,
  flavourFillings?: Record<string, string>,
  flavourSponges?: Record<string, string>
): string {
  const name = flavourName(id);
  const extras = [spongeLabel(id, flavourSponges?.[id]), fillingName(flavourFillings?.[id])].filter(Boolean);
  return extras.length ? `${name} (${extras.join(", ")})` : name;
}

export { formatRange, formatPriceFrom };
