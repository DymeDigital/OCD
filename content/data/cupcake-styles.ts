// Client-confirmed 2026-09-19: cupcake "from" pricing by style/finish — separate from
// content/data/confections.ts's Signature Confections list. "Characters & logo's" needs a print
// type picked (its own price attaches to the print type, not the style itself).

export type CupcakeStyleVariant = {
  id: string;
  label: string;
  priceFrom: number; // ZAR per dozen
};

export type CupcakeStyle = {
  id: string;
  label: string;
  description?: string;
  priceFrom: number; // ZAR per dozen — ignored once a variant is chosen, see variants below
  variants?: CupcakeStyleVariant[];
};

export const cupcakeStyles: CupcakeStyle[] = [
  {
    id: "basic",
    label: "Basic",
    priceFrom: 450,
  },
  {
    id: "characters-logos",
    label: "Characters & logo's",
    priceFrom: 550,
    variants: [
      { id: "non-edible-print", label: "Non-edible print", priceFrom: 550 },
      { id: "edible-print", label: "Edible print", priceFrom: 650 },
    ],
  },
  {
    id: "3d-fondant-toppers",
    label: "Bespoke cupcakes with 3D fondant toppers",
    priceFrom: 850,
  },
  {
    id: "detailed-floral",
    label: "Detailed floral cupcakes",
    priceFrom: 850,
  },
];
