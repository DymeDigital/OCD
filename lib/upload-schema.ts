import { z } from "zod";
import { MAX_FILES } from "@/lib/upload-constraints";

// Kept separate from orderSchema/weddingOrderSchema (lib/schemas.ts) deliberately — those stay
// the single source of truth for the form fields themselves, unchanged. This validates the R2
// URLs the server hands back to itself after upload, never a raw client-supplied file.
export const referenceImageSchema = z.object({
  url: z.string().url(),
  name: z.string(),
});

export const referenceImagesSchema = z.array(referenceImageSchema).max(MAX_FILES);

export type ReferenceImage = z.infer<typeof referenceImageSchema>;
