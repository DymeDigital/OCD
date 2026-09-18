export type Filling = { id: string; label: string };

// Client-confirmed 2026-09-18: offered as a filling override for Belgian Chocolate and Vanilla
// Bean only (content/data/flavours.ts's hasFillingChoice) — every other flavour keeps its fixed filling.
export const fillings: Filling[] = [
  { id: "white-chocolate-ganache", label: "White chocolate ganache" },
  { id: "cream-cheese", label: "Cream cheese" },
  { id: "swiss-meringue-buttercream", label: "Swiss Meringue Buttercream" },
  { id: "caramel-ganache", label: "Caramel ganache" },
  { id: "belgian-chocolate-ganache", label: "Belgian Chocolate Ganache" },
  { id: "swiss-meringue-caramel-ganache", label: "Swiss Meringue + Caramel Ganache" },
  { id: "swiss-meringue-belgian-chocolate-ganache", label: "Swiss Meringue + Belgian Chocolate Ganache" },
];

// Vanilla Bean, eggless — eggless is only available on this sponge (flavours.ts's egglessFlavourIds).
export const egglessFillings: Filling[] = [
  { id: "caramel-ganache", label: "Caramel Ganache" },
  { id: "belgian-chocolate-ganache", label: "Belgian Chocolate Ganache" },
  { id: "cream-cheese", label: "Cream Cheese" },
  { id: "white-chocolate-ganache", label: "White Chocolate ganache" },
];

export function fillingName(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return fillings.find((f) => f.id === id)?.label ?? egglessFillings.find((f) => f.id === id)?.label;
}
