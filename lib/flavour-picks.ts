import { flavours, egglessFlavourIds, spongeLabel } from "@/content/data/flavours";
import { fillings, egglessFillings, fillingName, USUAL_FILLING_ID } from "@/content/data/fillings";

// One row of a per-tier or per-dozen flavour sheet (components/order/flavour-sheet.tsx).
// Client-requested 2026-10-24: tiered cakes were being quoted upside down ("one flavour per tier"
// didn't say which tier), so each tier is now its own row, named by position and size. The same
// row shape carries cupcake flavours per dozen. Pure module — imported by the Zod schemas, the
// ledger, the email builder and the order-detail page alike.

export type FlavourPick = {
  flavourId?: string | null;
  spongeId?: string | null;
  fillingId?: string | null;
};

// Index 0 is always the TOP tier (smallest) — sizes.ts lists sizesCm smallest first.
export type TierPick = FlavourPick & { sizeCm?: number; faux?: boolean };

export type PickProblem = { index: number; field: "flavourId" | "spongeId" | "fillingId" | "faux"; message: string };

// Mixing flavours per dozen is offered up to this many dozen — beyond it the sheet gets too long
// to fill in on a phone, and the customer is pointed at the notes instead.
export const MAX_MIXED_DOZENS = 12;

export function pickProblem(
  pick: FlavourPick | undefined,
  eggless: boolean,
  noun: "tier" | "dozen",
  index: number
): PickProblem | null {
  const flavour = flavours.find((f) => f.id === pick?.flavourId);
  if (!flavour) return { index, field: "flavourId", message: `Pick a flavour for this ${noun}.` };
  if (eggless && !egglessFlavourIds.includes(flavour.id)) {
    return { index, field: "flavourId", message: "Eggless is only available in Vanilla Bean." };
  }
  if (flavour.spongeChoices && !flavour.spongeChoices.some((s) => s.id === pick?.spongeId)) {
    return { index, field: "spongeId", message: "Pick a sponge so we know what to bake." };
  }
  if (flavour.hasFillingChoice) {
    const options = eggless ? egglessFillings : fillings;
    const id = pick?.fillingId;
    if (!id || (id !== USUAL_FILLING_ID && !options.some((o) => o.id === id))) {
      return { index, field: "fillingId", message: "Pick a filling — or keep our usual one." };
    }
  }
  return null;
}

/** First problem on a tier sheet, top to bottom. Dummy tiers need no flavour, but at least one
 * tier has to be real cake. */
export function tierSheetProblem(tiers: TierPick[] | undefined, eggless: boolean): PickProblem | null {
  const rows = tiers ?? [];
  if (rows.length > 0 && rows.every((t) => t.faux)) {
    return { index: rows.length - 1, field: "faux", message: "At least one tier needs to be real cake." };
  }
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].faux) continue;
    const problem = pickProblem(rows[i], eggless, "tier", i);
    if (problem) return problem;
  }
  return null;
}

export function dozenSheetProblem(dozens: FlavourPick[] | undefined, eggless: boolean): PickProblem | null {
  const rows = dozens ?? [];
  for (let i = 0; i < rows.length; i++) {
    const problem = pickProblem(rows[i], eggless, "dozen", i);
    if (problem) return problem;
  }
  return null;
}

const ordinals = ["", "", "Second", "Third", "Fourth", "Fifth"];

/** "Top tier", "Middle tier", "Bottom tier" — or "Second tier" etc. counting down from the top
 * once there's more than one middle. */
export function tierPositionLabel(index: number, count: number): string {
  if (count <= 1) return "Cake";
  if (index === 0) return "Top tier";
  if (index === count - 1) return "Bottom tier";
  if (count === 3) return "Middle tier";
  return `${ordinals[index + 1] ?? `Tier ${index + 1}`} tier`;
}

export function tierRowLabel(tier: TierPick, index: number, count: number): string {
  const position = tierPositionLabel(index, count);
  return tier.sizeCm ? `${position}, ${tier.sizeCm}cm` : position;
}

export function flavourPickLabel(pick: FlavourPick | undefined): string {
  const flavour = flavours.find((f) => f.id === pick?.flavourId);
  if (!flavour) return "Flavour not picked";
  const extras = [spongeLabel(flavour.id, pick?.spongeId ?? undefined), fillingName(pick?.fillingId ?? undefined)].filter(Boolean);
  return extras.length ? `${flavour.name} (${extras.join(", ")})` : flavour.name;
}

export function tierValueLabel(tier: TierPick): string {
  return tier.faux ? "Dummy tier — iced to match" : flavourPickLabel(tier);
}

/** One {label, value} row per tier, top to bottom — for the email, the order page and the ledger. */
export function tierRows(tiers: TierPick[] | undefined): { label: string; value: string }[] {
  const rows = tiers ?? [];
  return rows.map((t, i) => ({ label: tierRowLabel(t, i, rows.length), value: tierValueLabel(t) }));
}

/** Dozens grouped by identical flavour, in first-seen order: "3 dozen — Vanilla Bean (…)". A
 * single row stands for every dozen ordered (one flavour for the lot), so it's labelled with
 * `totalDozens` rather than counted as one. */
export function dozenRows(dozens: FlavourPick[] | undefined, totalDozens?: number): { label: string; value: string }[] {
  if (dozens?.length === 1 && totalDozens) return [{ label: `${totalDozens} dozen`, value: flavourPickLabel(dozens[0]) }];
  const groups = new Map<string, number>();
  for (const d of dozens ?? []) {
    const label = flavourPickLabel(d);
    groups.set(label, (groups.get(label) ?? 0) + 1);
  }
  return [...groups].map(([value, count]) => ({ label: `${count} dozen`, value }));
}

/** Resizes a tier sheet to a cake's sizesCm (smallest = top), keeping existing picks by position.
 * Returns null when nothing would change, so callers can skip a setValue (and a render loop). */
export function syncTierPicks(current: TierPick[] | undefined, sizesCm: (number | undefined)[]): TierPick[] | null {
  const rows = current ?? [];
  if (rows.length === sizesCm.length && rows.every((t, i) => t.sizeCm === sizesCm[i])) return null;
  return sizesCm.map((cm, i) => ({ ...(rows[i] ?? { faux: false }), sizeCm: cm }));
}

export function syncDozenPicks(current: FlavourPick[] | undefined, count: number): FlavourPick[] | null {
  const rows = current ?? [];
  if (rows.length === count) return null;
  return Array.from({ length: count }, (_, i) => rows[i] ?? {});
}

/** Eggless only comes in Vanilla Bean — move every row onto it and drop now-invalid fillings.
 * Returns null when nothing would change. */
export function egglessPicks<T extends FlavourPick & { faux?: boolean }>(rows: T[] | undefined): T[] | null {
  let changed = false;
  const next = (rows ?? []).map((r) => {
    if (r.faux) return r;
    if (!r.flavourId || !egglessFlavourIds.includes(r.flavourId)) {
      changed = true;
      return { ...r, flavourId: egglessFlavourIds[0], spongeId: "", fillingId: "" };
    }
    if (r.fillingId && r.fillingId !== USUAL_FILLING_ID && !egglessFillings.some((o) => o.id === r.fillingId)) {
      changed = true;
      return { ...r, fillingId: "" };
    }
    return r;
  });
  return changed ? next : null;
}
