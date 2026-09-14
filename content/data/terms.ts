// Source: OCD Order Form 2026.pdf ("Payment & Terms", "Cancellations & Refunds", "Transport,
// Storage & Serving Guidelines", "Client Acknowledgement") for standard orders; OCD Wedding Cake
// Contract 2026.pdf (PTY LTD 2021/623273/07) for wedding orders. These are real, binding terms —
// do not paraphrase away the numbers.
//
// 2026-08-20: the client's FAQ copy states OCD Credit Vouchers are valid for 36 months "for both
// standard orders and wedding orders" — the order form PDF's printed figure for standard orders
// was 12 months. Treating the newer client instruction as authoritative and updating the figure
// below; flagged to the client rather than silently picked.

export const standardTerms = {
  minLeadTimeDays: 14,
  fullPaymentRequired: true,
  depositPortion: 0.5, // 50% of full payment is a non-refundable deposit
  deliveryPricing:
    "Delivery charges are calculated based on the distance from OCD to the delivery address, and quoted separately.",
  proofOfPayment:
    "Proof of payment must be sent via email or WhatsApp to confirm your order — no orders are processed without payment confirmation.",
  productVariationNote:
    "Finished products may differ slightly from reference or inspiration images.",
  cancellation: {
    voucherValidityMonths: 36,
    tiers: [
      { noticeDays: "8 days or more", creditPercent: 50 },
      { noticeDays: "4 to 7 days", creditPercent: 25 },
      { noticeDays: "0 to 3 days", creditPercent: 0 },
    ],
    note: "No cash refunds are issued. 50% of your payment is a non-refundable deposit. Cancellations are credited as an OCD Credit Voucher, not cash.",
  },
};

/** Full clause text for the standard Cake/Cupcake order form's terms, rendered in the order
 * form's "Terms & signature" step. Numbered to match the ledger register's clause-sheet feel —
 * these are not a new set of terms, just the Order Form PDF's own sections laid out for the web. */
export const standardContractSections = [
  {
    title: "Payment & terms",
    bullets: [
      "Full payment is required to confirm your order.",
      "All orders require a minimum lead time of 14 days. For urgent or short-notice requests, get in touch to check availability.",
      "A final quote is provided once design details, sizes and flavours are confirmed.",
      "Delivery charges are calculated based on the distance from OCD to the delivery address, and quoted separately.",
      "Finished products may differ slightly from reference or inspiration images.",
      "Proof of payment must be sent via email or WhatsApp to confirm your order — no orders are processed without payment confirmation.",
    ],
  },
  {
    title: "Cancellations & refunds",
    bullets: [
      "No cash refunds are issued. 50% of your payment serves as a non-refundable deposit.",
      "Cancellations are credited as an OCD Credit Voucher, valid for 36 months from the date of issue, according to notice given: 8 days or more before collection/delivery — 50% credit voucher. 4 to 7 days — 25% credit voucher. 0 to 3 days — no credit voucher issued.",
    ],
  },
  {
    title: "Product handling & allergen disclaimer",
    bullets: [
      "We do our best to accommodate allergies and dietary requirements — please disclose these when placing your order.",
      "We offer egg-free and gluten-free options, but OCD cannot guarantee an entirely allergen-free production environment.",
    ],
  },
  {
    title: "Transport, storage & serving guidelines",
    bullets: [
      "Lift the cake from the bottom only, keep it completely level during transport, and drive directly to your destination without sudden braking or sharp turns.",
      "Store the cake in the refrigerator until ready to serve, then bring it to room temperature before cutting — our cakes are butter-based and the white chocolate ganache can crack or crumble if served too cold.",
      "Use a cake stand at least 5cm larger than the cake board, and remove toppers and decorations before cutting and serving.",
      "Once your order has been collected or delivered, responsibility for it belongs to you.",
    ],
  },
];

/** Client Acknowledgement list from the Order Form PDF, shown above the signature. */
export const standardAcknowledgement = [
  "Payment & terms",
  "Cancellations & refunds",
  "Product handling & allergen disclaimer",
  "Transport, storage & serving guidelines",
  "Once an order has been collected or delivered, responsibility belongs to the client",
];

export const weddingTerms = {
  entity: "Obsessive Cupcake Disorder (PTY) LTD 2021/623273/07",
  fullPaymentRequired: true,
  depositPortion: 0.5,
  guestCountDeadlineDays: 14,
  designChangeDeadlineDays: 14,
  deliveryPricing:
    "Delivery charges are calculated based on the distance from OCD's premises and quoted separately.",
  cancellation: {
    voucherValidityMonths: 36,
    tiers: [
      { noticeDays: "More than 14 days before the event", outcome: "Deposit forfeited, no further charges." },
      { noticeDays: "Within 14 days of the event", outcome: "75% cancellation fee." },
      { noticeDays: "Within 5 days of the event", outcome: "Non-refundable, not eligible for credit." },
    ],
    note: "No cash refunds — a credit voucher valid for 36 months is issued according to the notice period given.",
  },
  allergenNote:
    "OCD will specify ingredients used but cannot guarantee allergen-free products. Allergies/dietary restrictions must be flagged at least 14 days before the event.",
  jurisdiction: "Governed by the laws of South Africa; disputes resolved in the courts of Durban.",
};

/** Full clause text from the Wedding Cake Contract PDF (clauses 1–11), rendered in the wedding
 * order form's "Terms & signature" step. Clause 12 (Acknowledgment & Acceptance) is the signature
 * step itself, not a clause to display — see weddingAcknowledgement below. */
export const weddingContractSections = [
  {
    title: "1. Booking & confirmation",
    bullets: [
      "A completed Wedding Cake Order Form and full payment secure your booking.",
      "Orders are not confirmed until full payment is received and confirmed by OCD.",
      "OCD reserves the right to decline or cancel orders if the deposit is not received within a reasonable time frame.",
    ],
  },
  {
    title: "2. Design & details",
    bullets: [
      "You'll provide detailed design instructions — themes, colours, inspiration images and any specific design elements — at the time of booking.",
      "OCD provides a final design and quote based on the details supplied. Changes requested less than 14 days before the event may incur additional charges and are subject to feasibility.",
      "OCD reserves the right to make minor adjustments to the design for practical or aesthetic reasons.",
      "Handmade cakes may have slight variations from reference images.",
    ],
  },
  {
    title: "3. Cake specifications",
    bullets: [
      "You'll specify guest numbers, cake size/tier configuration, shape, flavours and any dietary restrictions on the order form.",
      "You're responsible for informing OCD of any allergies or dietary needs at the time of order. OCD will use reasonable efforts to accommodate but does not guarantee allergen-free products.",
      "An accurate guest count and cake requirements must be confirmed at least 14 days before the wedding.",
    ],
  },
  {
    title: "4. Add-ons & extras",
    bullets: [
      "Dessert tables, favour packaging, tastings or other services must be requested via the order form and will incur additional charges.",
      "Changes or additions after initial confirmation may be subject to extra fees and are subject to availability.",
    ],
  },
  {
    title: "5. Payment & cancellation policy",
    bullets: [
      "Full payment confirms your booking, with 50% serving as a non-refundable deposit.",
      "Payment is made via bank transfer or other agreed method, with proof of payment sent via email or WhatsApp.",
      "Cancellations more than 14 days before the event forfeit the deposit but incur no further charges. Within 14 days, a 75% cancellation fee applies. Within 5 days, cancellations are non-refundable and not eligible for credit.",
      "No refunds are issued — instead, a credit voucher valid for 36 months is issued according to the notice period given.",
      "OCD reserves the right to cancel or decline orders for non-payment or breach of these terms.",
    ],
  },
  {
    title: "6. Delivery, setup & responsibility",
    bullets: [
      "Delivery charges are calculated based on distance from OCD's premises and quoted separately.",
      "OCD delivers and sets up the cake at the specified venue within the agreed time window.",
      "You must ensure access, adequate space and suitable conditions for cake setup.",
      "You or an authorised representative must supervise the cake upon delivery — OCD is not liable for damage caused after setup or due to mishandling.",
    ],
  },
  {
    title: "7. Handling, storage & serving",
    bullets: [
      "Store the cake in a cool, dry place away from direct sunlight, and serve within 2–6 hours of setup for optimal freshness.",
      "Refrigerate if necessary, and remove at least 30 minutes before serving to reach room temperature.",
      "OCD is not responsible for damage caused by improper handling or storage after delivery.",
    ],
  },
  {
    title: "8. Product variations & photography",
    bullets: [
      "Handmade, decorated cakes may have slight variations from images or initial designs.",
      "OCD may photograph the finished cake for promotional purposes unless notified otherwise in writing.",
    ],
  },
  {
    title: "9. Allergens & dietary restrictions",
    bullets: [
      "OCD will specify ingredients used but cannot guarantee allergen-free products.",
      "You're responsible for informing OCD of any allergies or dietary restrictions at least 14 days before the event.",
    ],
  },
  {
    title: "10. Liability & limitations",
    bullets: [
      "OCD is not liable for damage or loss caused by mishandling, improper storage, or external factors beyond its control.",
      "Inspect the cake upon delivery and notify OCD of any issues within 24 hours — OCD's liability is limited to the value of the cake.",
      "Force majeure: OCD is not liable for delays or failure to perform due to events beyond reasonable control, including natural disasters, power outages, transport delays, civil unrest, pandemics, or changes in government regulations.",
    ],
  },
  {
    title: "11. Miscellaneous",
    bullets: [
      "This agreement is governed by the laws of South Africa; disputes are resolved in the courts of Durban.",
      "This agreement is the entire understanding between the parties and supersedes any prior arrangements.",
    ],
  },
];

/** Clause 12, Acknowledgment & Acceptance — the sentence shown above the signature field. */
export const weddingAcknowledgement =
  "By signing below, you confirm that you have read, understood and agree to these terms and conditions, including policies on payments, cancellations, handling and liability.";

/** Fields that appear in CLAUDE.md's own §12 "Open questions for the client" — genuinely
 * undocumented anywhere in the source PDFs. Rendered as TODO(client) placeholders, never invented.
 * WhatsApp number and Instagram handle were answered by the client 2026-08-15 — see
 * content/data/socialLinks.ts, now the source of truth for those. */
export const openQuestions = {
  deliveryAreas: null as string | null,
  weddingTastingPolicy: null as string | null,
};
