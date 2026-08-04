// Not sourced from a PDF — the source documents don't define named design-complexity tiers or
// price multipliers anywhere. This is a qualitative UX device only: it shapes the brief the baker
// receives, it does NOT move the displayed price range. See CLAUDE.md §8's DesignTier type, which
// sketches `multiplierFrom/multiplierTo` fields — those numbers don't exist in any source PDF, so
// they're deliberately omitted here rather than invented. TODO(client): supply real multipliers
// (or a fixed bespoke-quote process) if a numeric complexity surcharge is wanted on-site.

export type DesignTier = {
  id: "simple" | "detailed" | "showpiece";
  label: string;
  description: string;
};

export const designTiers: DesignTier[] = [
  {
    id: "simple",
    label: "Simple",
    description:
      "Clean finish, a single colour palette, minimal piping or toppers. The fastest route from flavour to finished cake.",
  },
  {
    id: "detailed",
    label: "Detailed",
    description:
      "Custom colours, piped textures, a topper or small sugar-work elements — the kind of detail that needs a reference image or two.",
  },
  {
    id: "showpiece",
    label: "Showpiece",
    description:
      "Multi-tier structure, hand-sculpted elements, intricate sugar work — a centrepiece. Talk to us early; these need the most lead time.",
  },
];
