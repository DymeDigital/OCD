// Source: OCD Order Form 2026.pdf ("Payment & Terms", "Cancellations & Refunds") for standard
// orders; OCD Wedding Cake Contract 2026.pdf (PTY LTD 2021/623273/07) for wedding orders.
// These are real, binding terms — do not paraphrase away the numbers.

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
    voucherValidityMonths: 12,
    tiers: [
      { noticeDays: "8 days or more", creditPercent: 50 },
      { noticeDays: "4 to 7 days", creditPercent: 25 },
      { noticeDays: "0 to 3 days", creditPercent: 0 },
    ],
    note: "No cash refunds are issued. 50% of your payment is a non-refundable deposit. Cancellations are credited as an OCD Credit Voucher, not cash.",
  },
};

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

/** Fields that appear in CLAUDE.md's own §12 "Open questions for the client" — genuinely
 * undocumented anywhere in the source PDFs. Rendered as TODO(client) placeholders, never invented.
 * WhatsApp number and Instagram handle were answered by the client 2026-08-15 — see
 * content/data/socialLinks.ts, now the source of truth for those. */
export const openQuestions = {
  deliveryAreas: null as string | null,
  weddingTastingPolicy: null as string | null,
};
