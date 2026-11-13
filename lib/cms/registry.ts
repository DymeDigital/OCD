import { z } from "zod";
import { photos, aboutPhotos, homeFeatureIds } from "@/content/data/photos";

// Everything the client can edit in /admin. One entry per D1 row: a Zod schema (enforced on every
// save, server-side, and on every read — an invalid stored value falls back to the default), the
// static default from content/data/*, and the public paths to revalidate when it changes.
//
// Adding pricing later (flavours, sizes, fillings, designTiers…) means adding entries here that
// reuse the existing content/data types — no new storage, routes or auth.

// Either a path under public/images/ (the original photography) or an https URL (an upload).
// The upload route only ever produces URLs on the R2 public base; the content route additionally
// checks absolute URLs against that base, since the client can't be trusted to send only those.
const fileSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (f) => (/^https?:\/\//.test(f) ? f.startsWith("https://") : /^[\w\-./]+$/.test(f) && !f.includes("..")),
    "Not a valid image location.",
  );

const idSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Ids are lowercase letters, numbers and dashes.")
  .max(80);

const altSchema = z
  .string()
  .trim()
  .min(5, "Describe the photo in a few words — screen readers and Google read this.")
  .max(300);

const uniqueIds = <T extends { id: string }>(list: T[]) => new Set(list.map((p) => p.id)).size === list.length;

export const photoSchema = z.object({
  id: idSchema,
  file: fileSchema,
  alt: altSchema,
  category: z.enum(["cake", "cupcakes", "wedding"]),
  occasion: z.string().trim().max(40).optional(),
  hero: z.boolean().optional(),
});

export const aboutPhotoSchema = z.object({ id: idSchema, file: fileSchema, alt: altSchema });

export const registry = {
  photos: {
    label: "Photos",
    schema: z.array(photoSchema).max(400).refine(uniqueIds, "Two photos share an id."),
    default: photos,
    // The library feeds the gallery and the product-page carousels; the landing page looks its
    // three plates up by id, so a replaced image there needs `/` refreshed too.
    paths: ["/", "/gallery", "/cakes", "/cupcakes", "/weddings"],
  },
  homeFeatures: {
    label: "Home page",
    schema: z.tuple([idSchema, idSchema, idSchema]),
    default: homeFeatureIds,
    paths: ["/"],
  },
  aboutPhotos: {
    label: "About",
    schema: z.array(aboutPhotoSchema).min(1, "Keep at least one photo on the About page.").max(12).refine(uniqueIds, "Two photos share an id."),
    default: aboutPhotos,
    paths: ["/about"],
  },
} as const;

export type ContentKey = keyof typeof registry;
export type ContentValue<K extends ContentKey> = z.infer<(typeof registry)[K]["schema"]>;

export function isContentKey(key: string): key is ContentKey {
  return Object.prototype.hasOwnProperty.call(registry, key);
}

/** Every image file a value references, for cleanup of uploads nothing points at any more. */
export function filesIn(key: ContentKey, value: unknown): string[] {
  if (key === "photos" || key === "aboutPhotos") {
    return (value as { file: string }[]).map((p) => p.file);
  }
  return [];
}
