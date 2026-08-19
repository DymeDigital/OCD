// Source: OCD Product Guide & Price Schedule 2026.pdf, page 1-2 ("Most Popular Flavours" / "Additional flavours include").
// Transcribed, not invented. Do not add, remove, or reword flavours without the source PDF changing first.

export type Flavour = {
  id: string;
  name: string;
  filling: string;
  description: string;
  category: "cake" | "cupcake" | "both";
  mostRequested: boolean;
};

// Client-confirmed 2026-08-16: eggless is only available on the Vanilla Bean sponge. The order
// forms use this list to auto-deselect incompatible flavours the moment "eggless" is checked.
export const egglessFlavourIds = ["vanilla-bean-caramel"];

export const flavours: Flavour[] = [
  {
    id: "belgian-chocolate",
    name: "Belgian Chocolate",
    filling: "Chocolate Ganache Filling",
    description:
      "A rich, moist chocolate sponge made with premium Belgian cocoa, layered generously with silky smooth chocolate ganache. Each bite melts in your mouth, offering a deep, decadent chocolate flavour and a luscious, fudge-like finish.",
    category: "both",
    mostRequested: true,
  },
  {
    id: "vanilla-bean-caramel",
    name: "Vanilla Bean",
    filling: "Caramel Ganache Filling (Swiss Meringue Filling Optional)",
    description:
      "A soft, butter-based delight infused with real vanilla bean for a rich, fragrant flavour. Each layer is filled with a smooth, golden caramel ganache that adds the perfect touch of sweetness.",
    category: "both",
    mostRequested: true,
  },
  {
    id: "lemon-blueberry",
    name: "Lemon and Blueberry",
    filling: "Cream Cheese Filling",
    description:
      "A soft, butter-based sponge bursting with juicy blueberries and bright lemon flavour. Layered with a smooth, tangy cream cheese filling, this cake strikes the perfect balance between sweet, tart, and creamy.",
    category: "both",
    mostRequested: true,
  },
  {
    id: "toasted-nut",
    name: "Toasted Nut",
    filling: "Cream Cheese Filling",
    description:
      "A rich, buttery cake packed with toasted coconut, crunchy almonds, and pecans. Each bite offers a perfect mix of texture and flavour, balanced with a smooth, tangy cream cheese filling.",
    category: "both",
    mostRequested: true,
  },
  {
    id: "orange-almond-white-chocolate",
    name: "Orange, Almonds",
    filling: "White Chocolate Filling",
    description:
      "A fragrant, orange-infused sponge layered with whipped Callebaut white chocolate and topped with delicate flaked almonds. The citrusy brightness of orange pairs beautifully with the smooth, velvety richness of premium white chocolate.",
    category: "both",
    mostRequested: false,
  },
  {
    id: "roasted-nougat-white-chocolate",
    name: "Roasted Nougat",
    filling: "White Chocolate Filling",
    description:
      "A rich, buttery sponge infused with golden roasted nougat pieces, layered with smooth Callebaut white chocolate. A luxurious mix of chewy, nutty nougat and creamy sweetness in every bite.",
    category: "both",
    mostRequested: false,
  },
  {
    id: "salted-caramel",
    name: "Salted Caramel",
    filling: "Signature Salted Caramel Filling",
    description:
      "Lusciously layered with our signature salted caramel filling, offering the perfect balance of sweet and salty. Choose between a soft, fragrant vanilla bean sponge or a rich, decadent Belgian chocolate sponge.",
    category: "both",
    mostRequested: false,
  },
  {
    id: "raspberry-white-chocolate",
    name: "Raspberry",
    filling: "White Chocolate Filling",
    description:
      "A delicate, buttery sponge layered with smooth Callebaut white chocolate and bursts of fresh raspberries. The natural tartness of the berries pairs perfectly with the creamy sweetness of white chocolate.",
    category: "both",
    mostRequested: false,
  },
  {
    id: "cookies-and-cream",
    name: "Cookies & Cream",
    filling: "Vanilla Bean or Belgian Chocolate Sponge",
    description:
      "A dreamy blend of crushed chocolate cookies and creamy filling, layered between your choice of soft Vanilla Bean or rich Belgian Chocolate sponge. Nostalgic, comforting, and perfect for cookie lovers of all ages.",
    category: "both",
    mostRequested: false,
  },
  {
    id: "red-velvet",
    name: "Red Velvet",
    filling: "Cream Cheese Filling",
    description:
      "A moist, tender red-hued sponge with a subtle cocoa flavour, layered generously with smooth, tangy cream cheese filling. A timeless favourite that's both elegant and irresistibly delicious.",
    category: "both",
    mostRequested: false,
  },
  {
    id: "spiced-carrot",
    name: "Spiced Carrot Cake",
    filling: "Pecan & Walnuts and Cream Cheese Filling",
    description:
      "A moist, buttery cake packed with aromatic spices, crunchy pecans, and walnuts, layered with a smooth, tangy cream cheese filling. Comforting, rich, and full of texture.",
    category: "both",
    mostRequested: false,
  },
  {
    id: "fruit-cake",
    name: "Fruit Cake",
    filling: "Cream Cheese Filling",
    description:
      "A rich, moist cake loaded with a medley of dried fruits, nuts and candied cherries perfectly spiced and complemented by a smooth, tangy cream cheese filling. A timeless favourite for any celebration.",
    category: "cake",
    mostRequested: false,
  },
  {
    id: "matcha",
    name: "Matcha",
    filling: "White Chocolate Ganache Filling",
    description:
      "A light and fragrant matcha sponge layered with silky white chocolate ganache, perfectly balancing earthy green tea notes with smooth, creamy sweetness. Finished with a delicate crumb.",
    category: "both",
    mostRequested: false,
  },
  {
    id: "espresso-biscoff",
    name: "Espresso",
    filling: "White Chocolate and Biscoff Filling",
    description:
      "Rich espresso-infused sponge layered with silky white chocolate ganache and a luscious Biscoff filling, delivering a perfect balance of bold coffee notes, creamy sweetness, and warm caramelised spice.",
    category: "both",
    mostRequested: false,
  },
];
