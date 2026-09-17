import { z } from "zod";
import { standardTerms } from "@/content/data/terms";
import { normalizeSAWhatsAppNumber } from "@/lib/phone";
import { egglessFlavourIds } from "@/content/data/flavours";

// §9: multi-step, one decision per step. These schemas are written once and are meant to be
// reused server-side unchanged in Phase 2 (§4) — validation rules live here, not in the UI.

export const occasions = ["Birthday", "Anniversary", "Corporate", "Baby shower", "Just because"] as const;
export const productTypes = ["cake", "cupcakes", "both"] as const;
export const cakeShapes = ["Round", "Square", "Hexagon", "Number/Letter", "Other"] as const;
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
};

// `confectionId` (not `id`) deliberately — react-hook-form's useFieldArray injects its own
// `.id` key onto each array row, which would collide with a field literally named `id`.
const confectionSelectionSchema = z.object({
  confectionId: z.string(),
  quantity: z.number().int().min(1).max(20),
  note: z.string().trim().optional(), // colour/theme/flavour sub-detail
});

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
  cakeShape: optionalEnum(cakeShapes),
  cakeFlavourIds: z.array(z.string()).default([]),

  // Cupcake branch
  cupcakeDozens: z.number().int().min(1, "Let us know how many dozen you'd like.").optional(),
  cupcakeFlavourIds: z.array(z.string()).default([]),

  dietaryOptions: z.array(z.enum(dietaryOptions)).default([]),

  // Design
  designTierId: optionalEnum(["simple", "detailed", "showpiece"] as const),
  designBrief: z.string().trim().optional(),
  addOns: z.string().trim().optional(),

  confections: z.array(confectionSelectionSchema).default([]),

  notes: z.string().trim().optional(),
  ...deliveryFields,
  ...contactFields,
  ...signatureFields,
});

export const orderSchema = orderObjectSchema
  .refine((v) => v.deliveryMode === "collection" || !!(v.address && v.address.length > 4), {
    message: "We need a delivery address to quote delivery.",
    path: ["address"],
  })
  .refine(
    (v) => {
      if (!v.eventDate) return true; // let the required-field message own this case
      const min = new Date();
      min.setHours(0, 0, 0, 0);
      min.setDate(min.getDate() + standardTerms.minLeadTimeDays);
      return new Date(v.eventDate) >= min;
    },
    {
      message: `Standard orders need at least ${standardTerms.minLeadTimeDays} days' notice — pick a later date, or get in touch to check availability.`,
      path: ["eventDate"],
    }
  )
  .refine((v) => v.productType === "cupcakes" || typeof v.guestCount === "number", {
    message: "Let us know how many guests you're expecting.",
    path: ["guestCount"],
  })
  .refine((v) => v.productType === "cake" || typeof v.cupcakeDozens === "number", {
    message: "Let us know how many dozen you'd like.",
    path: ["cupcakeDozens"],
  })
  .refine(
    (v) => {
      if (!v.dietaryOptions.includes("eggless")) return true;
      const picked = [...v.cakeFlavourIds, ...v.cupcakeFlavourIds];
      return picked.every((id) => egglessFlavourIds.includes(id));
    },
    {
      message: "Eggless is only available in Vanilla Bean — remove the other flavours, or unselect eggless.",
      path: ["dietaryOptions"],
    }
  );
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
  fauxTierCount: z.number().int().min(0).max(5).default(0),
  perTierFlavourIds: z.array(z.string()).default([]),
  dietaryOptions: z.array(z.enum(dietaryOptions)).default([]),
  cakeTableSetup: z.string().trim().optional(),
  tastingWanted: z.boolean().default(false),
  plannerName: z.string().trim().optional(),
  plannerContact: z.string().trim().optional(),
  dietaryRequirements: z.string().trim().optional(),
  designBrief: z.string().trim().min(4, "Tell us a little about the design you're picturing."),

  notes: z.string().trim().optional(),
  ...deliveryFields,
  ...contactFields,
  ...signatureFields,
});

export const weddingOrderSchema = weddingObjectSchema
  .refine((v) => v.deliveryMode === "collection" || !!(v.address && v.address.length > 4), {
    message: "We need a venue address to quote delivery.",
    path: ["address"],
  })
  .refine((v) => v.fauxTierCount < v.tierCount, {
    message: "At least one tier needs to be real cake.",
    path: ["fauxTierCount"],
  })
  .refine(
    (v) => {
      if (!v.dietaryOptions.includes("eggless")) return true;
      return v.perTierFlavourIds.every((id) => egglessFlavourIds.includes(id));
    },
    {
      message: "Eggless is only available in Vanilla Bean — remove the other flavours, or unselect eggless.",
      path: ["dietaryOptions"],
    }
  );
export type WeddingOrderFormValues = z.input<typeof weddingObjectSchema>;
