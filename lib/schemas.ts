import { z } from "zod";
import { normalizeSAWhatsAppNumber } from "@/lib/phone";
import { egglessFlavourIds, flavours } from "@/content/data/flavours";
import { cakeKinds, tableCakeSizes } from "@/content/data/sizes";
import { tierSheetProblem, dozenSheetProblem, type PickProblem } from "@/lib/flavour-picks";

// §9: multi-step, one decision per step. These schemas are written once and are meant to be
// reused server-side unchanged in Phase 2 (§4) — validation rules live here, not in the UI.

export const occasions = ["Birthday", "Anniversary", "Corporate", "Baby shower", "Just because"] as const;
export const productTypes = ["cake", "cupcakes", "both"] as const;
// Client-requested 2026-10-30: Hexagon and Number/Letter removed, Oval and Heart added.
export const cakeShapes = ["Round", "Square", "Oval", "Heart", "Other"] as const;
export const deliveryModes = ["delivery", "collection"] as const;
export const foundUsOptions = ["Instagram", "Google", "Friend/family", "Past order", "Other"] as const;
// Client-confirmed 2026-08-16: eggless is only available on the Vanilla Bean sponge. The UI
// (order-form.tsx / wedding-form.tsx) auto-deselects incompatible flavours the moment eggless is
// checked; the refines below re-check the same rule so a direct API payload can't bypass it.
export const dietaryOptions = ["gluten-free", "eggless"] as const;

// An unselected radio group or a placeholder-option <select> reaches the schema as `null` or
// `""` (react-hook-form's uncontrolled default), never `undefined` — z.enum(...).optional() only
// accepts `undefined`, so a genuinely optional enum field needs this instead or it silently fails
// validation the moment the user leaves it untouched.
function optionalEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.enum(values).optional()
  );
}

// A RadioCardGroup with nothing selected reaches the schema as `null`, not `undefined` — `.optional()`
// alone only tolerates the latter and fails with Zod's raw "expected string, received null" instead
// of the friendly required-field message a conditional `.refine()` attaches below. `.nullable()`
// accepts null outright (kept as `string | null | undefined` rather than transformed away, so
// downstream consumers' existing `string | ... | null | undefined` types still line up).
function optionalString() {
  return z.string().nullable().optional();
}

const contactFields = {
  fullName: z.string().trim().min(2, "We need your name so we know who to quote."),
  // Validated against the same normalizer that builds the baker's WhatsApp link (lib/phone.ts) —
  // a number that can't produce that link isn't one we can actually reach the customer on, so it's
  // caught here rather than silently accepted and only discovered later, missing, in the order email.
  contactNumber: z
    .string()
    .trim()
    .min(1, "We need a contact number so we can reach you.")
    .refine((v) => normalizeSAWhatsAppNumber(v) !== null, {
      message: "That doesn't look like a valid SA mobile number — try 082 123 4567.",
    }),
  email: z.string().trim().email("That doesn't look like a full email address.").optional().or(z.literal("")),
  // Only needed when it differs from contactNumber — contactNumber is still what we WhatsApp by
  // default (lib/email.ts), this just lets a customer override that when the two aren't the same.
  whatsappNumber: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || normalizeSAWhatsAppNumber(v) !== null, {
      message: "That doesn't look like a valid SA mobile number — try 082 123 4567.",
    }),
  foundUs: optionalEnum(foundUsOptions),
};

// The order form's closing step (§9 step 9 / wedding equivalent): a typed signature plus an
// explicit agreement checkbox, standing in for the client's paper "Client Acknowledgement" /
// "Acknowledgment & Acceptance" sign-off. `agreedToTerms` must be `true`, not just any boolean —
// `.refine` (not `z.literal(true)`) so an unchecked box still reaches the schema as `false` rather
// than failing to parse at all, which lets the error message attach to the field like every other.
const signatureFields = {
  signatureName: z.string().trim().min(2, "Type your full name to sign."),
  agreedToTerms: z
    .boolean()
    .refine((v) => v === true, { message: "Please confirm you agree to the terms before sending your order." }),
};

const deliveryFields = {
  deliveryMode: z.enum(deliveryModes),
  address: z.string().trim().optional(),
  collectionWindow: z.string().optional(),
};

// Keyed by flavour id — only meaningful for flavours with hasFillingChoice (flavours.ts). Absent
// or missing means "use the flavour's usual filling".
const fillingFields = {
  flavourFillings: z.record(z.string(), z.string()).optional(),
  // Keyed by flavour id, like flavourFillings — only for flavours with spongeChoices (flavours.ts).
  flavourSponges: z.record(z.string(), z.string()).optional(),
};

// A flavour with spongeChoices (Cookies & Cream, Salted Caramel) needs one picked — true when it
// has one, or when the flavour has no sponge choice at all.
function hasRequiredSponge(flavourId: string | null | undefined, sponges: Record<string, string> | undefined) {
  if (!flavourId) return true;
  const choices = flavours.find((f) => f.id === flavourId)?.spongeChoices;
  if (!choices) return true;
  return choices.some((c) => c.id === sponges?.[flavourId]);
}
export const spongeRequiredMessage = "Pick a sponge so we know what to bake.";

// Client-requested 2026-10-01: a flavour with hasFillingChoice needs an explicit filling pick
// (which can be USUAL_FILLING_ID, "our usual") — true when it has one or has no filling choice.
function hasRequiredFilling(flavourId: string | null | undefined, picked: Record<string, string> | undefined) {
  if (!flavourId) return true;
  if (!flavours.find((f) => f.id === flavourId)?.hasFillingChoice) return true;
  return !!picked?.[flavourId];
}
export const fillingRequiredMessage = "Pick a filling — or keep our usual one.";

// The standard order form splits fillings per branch (not the single flavourFillings above) so a
// "both" order can pick a different filling for the cake vs. the cupcakes even when they share the
// same flavour, e.g. Vanilla Bean cake with caramel filling alongside Vanilla Bean cupcakes with
// cream cheese filling.
const branchedFillingFields = {
  cakeFlavourFillings: z.record(z.string(), z.string()).optional(),
  cupcakeFlavourFillings: z.record(z.string(), z.string()).optional(),
  cakeFlavourSponges: z.record(z.string(), z.string()).optional(),
  cupcakeFlavourSponges: z.record(z.string(), z.string()).optional(),
};

// `confectionId` (not `id`) deliberately — react-hook-form's useFieldArray injects its own
// `.id` key onto each array row, which would collide with a field literally named `id`.
const confectionSelectionSchema = z.object({
  confectionId: z.string(),
  quantity: z.number().int().min(1).max(20),
  note: z.string().trim().optional(), // colour/theme/flavour sub-detail
});

// One row of a per-tier / per-dozen flavour sheet — see lib/flavour-picks.ts. Tier index 0 is the
// top tier. `sizeCm` is copied in by the form so a stored order reads on its own.
const flavourPickSchema = z.object({
  flavourId: optionalString(),
  spongeId: optionalString(),
  fillingId: optionalString(),
});
const tierPickSchema = flavourPickSchema.extend({
  sizeCm: z.number().optional(),
  faux: z.boolean().default(false),
});

// Cupcakes, shared by both forms: one flavour for the lot, or (cupcakeMixFlavours) one per dozen.
const cupcakeMixFields = {
  cupcakeMixFlavours: z.boolean().default(false),
  cupcakeDozenFlavours: z.array(flavourPickSchema).default([]),
};

function addPickIssue(ctx: z.RefinementCtx, field: string, problem: PickProblem | null) {
  if (!problem) return;
  ctx.addIssue({
    code: "custom",
    message: problem.message,
    path: [field, problem.index, problem.field],
  });
}

// Client-requested 2026-10-24, both forms: a round/tiered cake (the original sizes), a
// rectangle/table cake (width + length) or the Italian style cake. Unset reads as "tiered", so
// drafts and orders from before this still mean what they did.
const cakeKindFields = {
  cakeKind: optionalEnum(cakeKinds),
  tableWidthCm: z.number().optional(),
  tableSizeId: z.string().optional(),
};
export const tableSizeRequiredMessage = "Pick a length for your table cake.";
function hasTableSize(v: { cakeKind?: unknown; tableSizeId?: string }) {
  return v.cakeKind !== "table" || tableCakeSizes.some((s) => s.id === v.tableSizeId);
}

function isMultiTier(v: { cakeTiers: unknown[] }) {
  return v.cakeTiers.length > 1;
}

const orderObjectSchema = z.object({
  occasion: z.enum(occasions, { message: "Let us know the occasion." }),
  eventDate: z.string().min(1, "We need a date so we can check availability."),
  productType: z.enum(productTypes, { message: "Let us know what you're making." }),

  // Cake branch. `valueAsNumber` in the form's register() is swapped for a `setValueAs` that maps
  // an empty box to undefined (not NaN) — see order-form.tsx — so `.optional()` here behaves as
  // written; conditional required-ness for the cake/both branch lives in the refine below.
  guestCount: z.number().int().min(1, "Let us know how many guests you're expecting.").optional(),
  // Only meaningful when more than one size fits the guest count (e.g. a mini cake and a bento
  // box both fit) — lets the customer pick between them instead of always getting the cheapest.
  sizeId: z.string().optional(),
  // A draft saved before 2026-10-30 may still hold a shape no longer offered (Hexagon,
  // Number/Letter) — dropped to "not picked" rather than failing a field the customer can't see.
  cakeShape: z.preprocess(
    (v) => ((cakeShapes as readonly unknown[]).includes(v) ? v : undefined),
    z.enum(cakeShapes).optional()
  ),
  // Optional at the field level (like guestCount above) — conditional required-ness for the
  // cake/both branch lives in the refine below.
  cakeFlavourId: optionalString(),
  // Only for a multi-tier size (the form fills one row per tier) — replaces cakeFlavourId then.
  cakeTiers: z.array(tierPickSchema).default([]),
  ...cakeKindFields,

  // Cupcake branch
  cupcakeDozens: z.number().int().min(1, "Let us know how many dozen you'd like.").optional(),
  cupcakeStyleId: optionalString(),
  // Only meaningful for styles with variants (currently just "characters-logos" — print type).
  cupcakeStyleVariantId: optionalString(),
  cupcakeFlavourId: optionalString(),
  ...cupcakeMixFields,

  // Split per branch (not one shared field) so eggless can be picked for just the cake or just
  // the cupcakes on a "both" order without forcing the other branch to Vanilla Bean too.
  cakeDietaryOptions: z.array(z.enum(dietaryOptions)).default([]),
  cupcakeDietaryOptions: z.array(z.enum(dietaryOptions)).default([]),

  // Design
  designTierId: optionalEnum(["simple", "detailed", "showpiece"] as const),
  designBrief: z.string().trim().optional(),
  addOns: z.string().trim().optional(),

  confections: z.array(confectionSelectionSchema).default([]),

  notes: z.string().trim().optional(),
  ...deliveryFields,
  ...contactFields,
  ...signatureFields,
  ...branchedFillingFields,
});

export const orderSchema = orderObjectSchema
  .refine((v) => v.productType === "cupcakes" || hasTableSize(v), {
    message: tableSizeRequiredMessage,
    path: ["tableSizeId"],
  })
  .refine((v) => v.deliveryMode === "collection" || !!(v.address && v.address.length > 4), {
    message: "We need a delivery address to quote delivery.",
    path: ["address"],
  })
  .refine((v) => v.deliveryMode === "delivery" || !!v.collectionWindow, {
    message: "Please pick a collection time window.",
    path: ["collectionWindow"],
  })
  // Client-confirmed 2026-09-19: the 14-day standard lead time is guidance, not a hard cutoff —
  // last-minute orders are still accepted where the production schedule allows, so a date within
  // that window no longer fails validation. order-form.tsx shows a non-blocking heads-up instead
  // (see isWithinLeadTime there) when the chosen date falls inside standardTerms.minLeadTimeDays.
  .refine((v) => v.productType === "cupcakes" || typeof v.guestCount === "number", {
    message: "Let us know how many guests you're expecting.",
    path: ["guestCount"],
  })
  .refine((v) => v.productType === "cake" || typeof v.cupcakeDozens === "number", {
    message: "Let us know how many dozen you'd like.",
    path: ["cupcakeDozens"],
  })
  // A multi-tier cake is checked tier by tier instead (superRefine below), and mixed cupcakes
  // dozen by dozen — the single-flavour refines here step aside for those.
  .refine((v) => v.productType === "cupcakes" || isMultiTier(v) || !!v.cakeFlavourId, {
    message: "Pick a cake flavour.",
    path: ["cakeFlavourId"],
  })
  .refine((v) => v.productType === "cake" || v.cupcakeMixFlavours || !!v.cupcakeFlavourId, {
    message: "Pick a cupcake flavour.",
    path: ["cupcakeFlavourId"],
  })
  .refine((v) => !!v.designTierId, {
    message: "Pick a design complexity so we know what to quote.",
    path: ["designTierId"],
  })
  .refine(
    (v) => {
      if (!v.cakeDietaryOptions.includes("eggless") || !v.cakeFlavourId || isMultiTier(v)) return true;
      return egglessFlavourIds.includes(v.cakeFlavourId);
    },
    {
      message: "Eggless is only available in Vanilla Bean — change the cake flavour, or unselect eggless.",
      path: ["cakeDietaryOptions"],
    }
  )
  .refine(
    (v) => {
      if (!v.cupcakeDietaryOptions.includes("eggless") || !v.cupcakeFlavourId || v.cupcakeMixFlavours) return true;
      return egglessFlavourIds.includes(v.cupcakeFlavourId);
    },
    {
      message: "Eggless is only available in Vanilla Bean — change the cupcake flavour, or unselect eggless.",
      path: ["cupcakeDietaryOptions"],
    }
  )
  .refine((v) => v.productType === "cupcakes" || isMultiTier(v) || hasRequiredSponge(v.cakeFlavourId, v.cakeFlavourSponges), {
    message: spongeRequiredMessage,
    path: ["cakeFlavourSponges"],
  })
  .refine((v) => v.productType === "cake" || v.cupcakeMixFlavours || hasRequiredSponge(v.cupcakeFlavourId, v.cupcakeFlavourSponges), {
    message: spongeRequiredMessage,
    path: ["cupcakeFlavourSponges"],
  })
  .refine((v) => v.productType === "cupcakes" || isMultiTier(v) || hasRequiredFilling(v.cakeFlavourId, v.cakeFlavourFillings), {
    message: fillingRequiredMessage,
    path: ["cakeFlavourFillings"],
  })
  .refine((v) => v.productType === "cake" || v.cupcakeMixFlavours || hasRequiredFilling(v.cupcakeFlavourId, v.cupcakeFlavourFillings), {
    message: fillingRequiredMessage,
    path: ["cupcakeFlavourFillings"],
  })
  .superRefine((v, ctx) => {
    if (v.productType !== "cupcakes" && isMultiTier(v)) {
      addPickIssue(ctx, "cakeTiers", tierSheetProblem(v.cakeTiers, v.cakeDietaryOptions.includes("eggless")));
    }
    if (v.productType !== "cake" && v.cupcakeMixFlavours) {
      if (v.cupcakeDozenFlavours.length === 0) {
        ctx.addIssue({ code: "custom", message: "Pick a flavour for each dozen.", path: ["cupcakeDozenFlavours"] });
      }
      addPickIssue(ctx, "cupcakeDozenFlavours", dozenSheetProblem(v.cupcakeDozenFlavours, v.cupcakeDietaryOptions.includes("eggless")));
    }
  });
// z.input (not z.infer/output) — react-hook-form types `useForm<T>` against the raw, pre-default
// shape it actually manages; zodResolver maps that to the post-default output at validation time.
export type OrderFormValues = z.input<typeof orderObjectSchema>;

const weddingObjectSchema = z.object({
  partnerNames: z.string().trim().min(2, "Both names, so we know whose day this is."),
  venue: z.string().trim().min(2, "Where's the wedding?"),
  venueContact: z.string().trim().optional(),
  weddingDate: z.string().min(1, "We need the date to check availability."),
  weddingTime: z.string().optional(),
  // Required (unlike the standard form's guestCount) — the base message covers the "left empty"
  // case (a bare z.number() rejects undefined before .min() ever runs) and .min() covers "typed 0".
  guestCount: z.number("Roughly how many guests?").int().min(1, "Roughly how many guests?"),
  tierCount: z.number().int().min(1).max(6),
  // A deliberately bigger/smaller size than the guest count suggests (client-requested 2026-10-24,
  // same as the standard form). The form keeps tierCount in step with it.
  sizeId: z.string().optional(),
  // One row per tier, top first — a flavour or a dummy, per tier. Replaces fauxTierCount +
  // perTierFlavourIds (2026-10-24), which stay only so orders saved before then still render.
  tiers: z.array(tierPickSchema).default([]),
  ...cakeKindFields,
  fauxTierCount: z.number().int().min(0).max(5).default(0),
  perTierFlavourIds: z.array(z.string()).default([]),
  dietaryOptions: z.array(z.enum(dietaryOptions)).default([]),
  cakeTableSetup: z.string().trim().optional(),
  tastingWanted: z.boolean().default(false),
  plannerName: z.string().trim().optional(),
  plannerContact: z.string().trim().optional(),
  dietaryRequirements: z.string().trim().optional(),
  designBrief: z.string().trim().min(4, "Tell us a little about the design you're picturing."),

  // Extras (client-requested 2026-10-24): cupcakes and Signature Confections alongside the cake.
  // Wedding cupcakes always use the per-dozen sheet — one row when they're all the same flavour.
  cupcakeDozens: z.number().int().min(1, "At least one dozen — or leave it empty.").optional(),
  cupcakeStyleId: optionalString(),
  cupcakeStyleVariantId: optionalString(),
  ...cupcakeMixFields,
  confections: z.array(confectionSelectionSchema).default([]),

  notes: z.string().trim().optional(),
  ...deliveryFields,
  ...contactFields,
  ...signatureFields,
  ...fillingFields,
});

export const weddingOrderSchema = weddingObjectSchema
  .refine(hasTableSize, { message: tableSizeRequiredMessage, path: ["tableSizeId"] })
  .refine((v) => v.deliveryMode === "collection" || !!(v.address && v.address.length > 4), {
    message: "We need a venue address to quote delivery.",
    path: ["address"],
  })
  .refine((v) => v.deliveryMode === "delivery" || !!v.collectionWindow, {
    message: "Please pick a collection time window.",
    path: ["collectionWindow"],
  })
  // The legacy perTierFlavourIds/flavourSponges/flavourFillings aren't validated any more — a draft
  // saved before the per-tier sheet may still carry them, and they mustn't block a new submit.
  .superRefine((v, ctx) => {
    const eggless = v.dietaryOptions.includes("eggless");
    if (v.tiers.length === 0) {
      ctx.addIssue({ code: "custom", message: "Pick a flavour for each tier.", path: ["tiers"] });
    }
    addPickIssue(ctx, "tiers", tierSheetProblem(v.tiers, eggless));
    if (v.cupcakeDozens) {
      if (v.cupcakeDozenFlavours.length === 0) {
        ctx.addIssue({ code: "custom", message: "Pick a cupcake flavour.", path: ["cupcakeDozenFlavours"] });
      }
      addPickIssue(ctx, "cupcakeDozenFlavours", dozenSheetProblem(v.cupcakeDozenFlavours, eggless));
    }
  });
export type WeddingOrderFormValues = z.input<typeof weddingObjectSchema>;
