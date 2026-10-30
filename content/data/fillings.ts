// `surchargePct`: client-confirmed 2026-10-24, a percentage added to the cake price for this
// filling — stacks with the flavour's own (see lib/flavour-pricing.ts). Swiss Meringue + Caramel
// Ganache and Swiss Meringue Buttercream were listed without a percentage, so they're 0 —
// TODO(client): confirm neither carries one.
export type Filling = { id: string; label: string; surchargePct: number };

// Client-confirmed 2026-09-18: offered as a filling override for Belgian Chocolate and Vanilla
// Bean only (content/data/flavours.ts's hasFillingChoice) — every other flavour keeps its fixed filling.
export const fillings: Filling[] = [
  { id: "white-chocolate-ganache", label: "White chocolate ganache", surchargePct: 5 },
  { id: "cream-cheese", label: "Cream cheese", surchargePct: 3 },
  { id: "swiss-meringue-buttercream", label: "Swiss Meringue Buttercream", surchargePct: 0 },
  { id: "caramel-ganache", label: "Caramel ganache", surchargePct: 0 },
  { id: "belgian-chocolate-ganache", label: "Belgian Chocolate Ganache", surchargePct: 10 },
  { id: "swiss-meringue-caramel-ganache", label: "Swiss Meringue + Caramel Ganache", surchargePct: 0 },
  { id: "swiss-meringue-belgian-chocolate-ganache", label: "Swiss Meringue + Belgian Chocolate Ganache", surchargePct: 5 },
];

// Vanilla Bean, eggless — eggless is only available on this sponge (flavours.ts's egglessFlavourIds).
// Same fillings (and percentages) as above, eggless-safe ones only.
export const egglessFillings: Filling[] = [
  { id: "caramel-ganache", label: "Caramel Ganache", surchargePct: 0 },
  { id: "belgian-chocolate-ganache", label: "Belgian Chocolate Ganache", surchargePct: 10 },
  { id: "cream-cheese", label: "Cream Cheese", surchargePct: 3 },
  { id: "white-chocolate-ganache", label: "White Chocolate ganache", surchargePct: 5 },
];

// Client-requested 2026-10-01: the filling is now an explicit, required choice, so keeping the
// flavour's standard filling is its own option rather than an empty "default". Displays as the
// plain flavour name, same as before.
export const USUAL_FILLING_ID = "usual";

export function fillingName(id: string | undefined): string | undefined {
  if (!id || id === USUAL_FILLING_ID) return undefined;
  return fillings.find((f) => f.id === id)?.label ?? egglessFillings.find((f) => f.id === id)?.label;
}
