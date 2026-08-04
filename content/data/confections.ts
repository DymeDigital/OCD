// Source: OCD Product Guide & Price Schedule 2026.pdf, page 4-5 ("Signature Confections"),
// cross-checked against OCD Order Form 2026.pdf's "Signature Confections" checklist and "Cupcake Order" section.
//
// Two figures conflict between the two source documents. The Price Schedule is treated as the
// authority (it's the document titled "Price Schedule"); the Order Form's figure is kept as a
// comment. Flag both for the client rather than silently picking one:
//   - Macarons: Guide says "R350 for 12" / bespoke "from R500 for 12"; Order Form says "for 10".
//   - Decorated Sugar Cookies: Guide says "From R750 for 12"; Order Form says "From R650 for 12".

export type Confection = {
  id: string;
  name: string;
  description: string;
  unit: string; // e.g. "12", "20", "24 halves"
  priceFrom: number; // ZAR
  isFromPrice: boolean; // true = "From RX", false = flat "RX"
  subOptions?: { label: string; note?: string }[];
  sourceNote?: string; // TODO(client) discrepancy flags
};

export const confections: Confection[] = [
  {
    id: "cake-pops",
    name: "Chocolate Cake Pops",
    description:
      "Moist chocolate cake crumbs gently bound, rolled into bite-sized pops and dipped in a crisp white chocolate coating.",
    unit: "12",
    priceFrom: 600,
    isFromPrice: true,
  },
  {
    id: "cakesicles",
    name: "Chocolate Cakesicles",
    description:
      "Decadent, moist chocolate cake — no frosting added — shaped into elegant popsicle-style bars and coated in a crisp layer of creamy white chocolate.",
    unit: "12",
    priceFrom: 750,
    isFromPrice: true,
  },
  {
    id: "macarons",
    name: "French Macarons",
    description:
      "Delicate almond meringue shells with a crisp exterior and soft, chewy centre, filled with rich, velvety ganache. One colour per set.",
    unit: "12",
    priceFrom: 350,
    isFromPrice: false,
    subOptions: [
      { label: "Standard — R350" },
      { label: "Bespoke — from R500", note: "custom colour, flavour & theme" },
    ],
    sourceNote:
      "TODO(client): Order Form lists this as \"per 10\", Product Guide (Price Schedule) says \"per 12\" — confirm which is current.",
  },
  {
    id: "sugar-cookies",
    name: "Decorated Sugar Cookies",
    description:
      "Buttery, soft sugar cookies with a hint of vanilla, hand-decorated with royal icing to match any theme or occasion.",
    unit: "12",
    priceFrom: 750,
    isFromPrice: true,
    sourceNote:
      "TODO(client): Order Form says \"From R650 for 12\", Product Guide (Price Schedule) says \"From R750 for 12\" — confirm which is current.",
  },
  {
    id: "orange-coconut-squares",
    name: "Orange & Coconut Squares",
    description:
      "A buttery pecan base topped with a zingy citrus and coconut layer — nutty richness meets fresh, tropical flavour.",
    unit: "12",
    priceFrom: 400,
    isFromPrice: false,
  },
  {
    id: "caramel-peppermint-cups",
    name: "Caramel & Peppermint Cups",
    description:
      "Inspired by the classic South African peppermint tart: whipped caramel, peppermint-infused cream, and a biscuit crumble base.",
    unit: "20",
    priceFrom: 600,
    isFromPrice: false,
  },
  {
    id: "chocolate-mousse",
    name: "Belgian Chocolate Mousse",
    description:
      "Rich, velvety mousse made with premium Belgian chocolate, served in elegant individual portions.",
    unit: "20",
    priceFrom: 800,
    isFromPrice: false,
  },
  {
    id: "baked-cheesecake-whole",
    name: "Baked Cheesecake (Whole)",
    description:
      "A smooth, creamy cheesecake on a buttery biscuit base, oven-baked to perfection.",
    unit: "1 whole",
    priceFrom: 650,
    isFromPrice: true,
    subOptions: [
      { label: "Vanilla" },
      { label: "Biscoff" },
      { label: "Blueberry" },
      { label: "Lemon" },
    ],
  },
  {
    id: "individual-cheesecakes",
    name: "Individual Cheesecakes",
    description:
      "Creamy, smooth cheesecakes served in single portions on a buttery biscuit base. Available in a variety of flavours.",
    unit: "20",
    priceFrom: 700,
    isFromPrice: false,
  },
  {
    id: "assorted-tartlets",
    name: "Assorted Tartlets",
    description:
      "Handcrafted mini tarts with a crisp, buttery shell and rich, flavourful fillings. One flavour per set of 20.",
    unit: "20",
    priceFrom: 500,
    isFromPrice: false,
    subOptions: [
      { label: "Crème Brûlée", note: "silky vanilla custard, caramelised sugar top" },
      { label: "Vanilla & Berry", note: "vanilla cream, fresh seasonal berries" },
      { label: "Lemon Meringue", note: "tangy lemon curd, golden toasted meringue" },
      { label: "Chocolate Ganache", note: "rich, glossy dark chocolate" },
      { label: "Milk Tart", note: "classic SA custard, dusting of cinnamon" },
      { label: "Raspberry & White Chocolate" },
    ],
  },
  {
    id: "english-scones",
    name: "English Scones",
    description:
      "Traditional, buttery English scones served with house-made strawberry compote and a generous dollop of cream.",
    unit: "24 halves",
    priceFrom: 450,
    isFromPrice: false,
  },
];

/** The base cupcake product — priced separately from the Signature Confections list. */
export const cupcakeBase = {
  name: "Gourmet Cupcakes",
  description:
    "Moist, flavour-packed cupcakes topped with silky smooth Swiss meringue buttercream — a luxurious, less-sweet alternative to traditional icing. Each cupcake is filled with a complementary centre.",
  unit: "dozen",
  priceFrom: 450,
};
