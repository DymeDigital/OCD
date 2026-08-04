import { z } from "zod";
import { standardTerms } from "@/content/data/terms";

// §9: multi-step, one decision per step. These schemas are written once and are meant to be
// reused server-side unchanged in Phase 2 (§4) — validation rules live here, not in the UI.

export const occasions = ["Birthday", "Anniversary", "Corporate", "Baby shower", "Just because"] as const;
export const productTypes = ["cake", "cupcakes", "both"] as const;
export const cakeShapes = ["Round", "Square", "Hexagon", "Number/Letter", "Other"] as const;
export const deliveryModes = ["delivery", "collection"] as const;
export const foundUsOptions = ["Instagram", "Google", "Friend/family", "Past order", "Other"] as const;

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
  contactNumber: z.string().trim().min(7, "A contact number we can reach you on."),
  email: z.string().trim().email("That doesn't look like a full email address.").optional().or(z.literal("")),
  foundUs: optionalEnum(foundUsOptions),
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
  productType: z.enum(productTypes),

  // Cake branch
  guestCount: z.number().int().min(1).optional(),
  cakeShape: optionalEnum(cakeShapes),
  cakeFlavourIds: z.array(z.string()).default([]),

  // Cupcake branch
  cupcakeDozens: z.number().int().min(1).optional(),
  cupcakeFlavourIds: z.array(z.string()).default([]),

  // Design
  designTierId: optionalEnum(["simple", "detailed", "showpiece"] as const),
  designBrief: z.string().trim().optional(),
  addOns: z.string().trim().optional(),

  confections: z.array(confectionSelectionSchema).default([]),

  notes: z.string().trim().optional(),
  ...deliveryFields,
  ...contactFields,
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
  guestCount: z.number().int().min(1, "Roughly how many guests?"),
  tierCount: z.number().int().min(1).max(6),
  perTierFlavourIds: z.array(z.string()).default([]),
  cakeTableSetup: z.string().trim().optional(),
  tastingWanted: z.boolean().default(false),
  plannerName: z.string().trim().optional(),
  plannerContact: z.string().trim().optional(),
  dietaryRequirements: z.string().trim().optional(),
  designBrief: z.string().trim().min(4, "Tell us a little about the design you're picturing."),

  notes: z.string().trim().optional(),
  ...deliveryFields,
  ...contactFields,
});

export const weddingOrderSchema = weddingObjectSchema.refine(
  (v) => v.deliveryMode === "collection" || !!(v.address && v.address.length > 4),
  {
    message: "We need a venue address to quote delivery.",
    path: ["address"],
  }
);
export type WeddingOrderFormValues = z.input<typeof weddingObjectSchema>;
