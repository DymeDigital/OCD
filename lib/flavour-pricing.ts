import { flavours } from "@/content/data/flavours";
import { fillings, egglessFillings, USUAL_FILLING_ID } from "@/content/data/fillings";
import { flavourPickLabel, tierRowLabel, type FlavourPick, type TierPick } from "@/lib/flavour-picks";

// Client-confirmed 2026-10-24: each flavour, sponge and filling can add a percentage to the CAKE
// price (never cupcakes). They stack — Belgian Chocolate (+10%) with Belgian Chocolate ganache
// (+10%) is +20%; Cookies & Cream (+5%) on a Belgian Chocolate sponge (+10%) is +15%. On a tiered
// cake each tier's percentage applies to that tier's share of the price, weighted by the tier's
// top area (cm²) so a bigger tier counts for more; dummy tiers carry no flavour, so 0%.

export function fillingSurchargePct(fillingId: string | null | undefined, flavourId: string | null | undefined): number {
  if (!fillingId) return 0;
  const id = fillingId === USUAL_FILLING_ID ? flavours.find((f) => f.id === flavourId)?.usualFillingId : fillingId;
  if (!id) return 0;
  return (fillings.find((f) => f.id === id) ?? egglessFillings.find((f) => f.id === id))?.surchargePct ?? 0;
}

export function pickSurchargePct(pick: FlavourPick | undefined): number {
  const flavour = flavours.find((f) => f.id === pick?.flavourId);
  if (!flavour) return 0;
  const sponge = flavour.spongeChoices?.find((s) => s.id === pick?.spongeId)?.surchargePct ?? 0;
  return flavour.surchargePct + sponge + fillingSurchargePct(pick?.fillingId, flavour.id);
}

export type FlavourSurcharge = {
  amount: number; // ZAR, rounded to the rand
  detail: string;
  sub?: { label: string; value: string }[];
};

/** One flavour for the whole cake. Null when it adds nothing. */
export function singleFlavourSurcharge(basePrice: number, pick: FlavourPick): FlavourSurcharge | null {
  const pct = pickSurchargePct(pick);
  if (!pct || !basePrice) return null;
  return { amount: Math.round((basePrice * pct) / 100), detail: `${flavourPickLabel(pick)} — +${pct}%` };
}

/** A flavour per tier, top first. Null when no tier adds anything. */
export function tieredFlavourSurcharge(basePrice: number, tiers: TierPick[]): FlavourSurcharge | null {
  if (!basePrice || tiers.length === 0) return null;
  const weights = tiers.map((t) => (t.sizeCm ? t.sizeCm * t.sizeCm : 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let amount = 0;
  const sub: { label: string; value: string }[] = [];
  tiers.forEach((t, i) => {
    const pct = t.faux ? 0 : pickSurchargePct(t);
    if (!pct) return;
    amount += (basePrice * (weights[i] / totalWeight) * pct) / 100;
    sub.push({ label: tierRowLabel(t, i, tiers.length), value: `+${pct}% on this tier's share` });
  });
  if (amount === 0) return null;
  return { amount: Math.round(amount), detail: "Charged per tier, by tier size", sub };
}
