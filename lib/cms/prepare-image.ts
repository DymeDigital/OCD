// Browser-side: shrink a phone photo before it's uploaded through /admin. A 12 MP camera shot is
// 3–6 MB; at 2400px on the long edge as WebP it's ~0.5 MB and still sharper than any slot on the
// site needs. This also keeps R2 storage and upload time small.

const LONG_EDGE = 2400;
/** Bigger originals are refused before decoding — a 50 MB PNG or 100 MP shot can exhaust an older
 * phone's memory and crash the tab. Normal phone photos are 3–12 MB. */
export const MAX_ORIGINAL_BYTES = 40 * 1024 * 1024;
/** Below this on the long edge, a photo looks soft on the gallery's large tiles. Allowed (it may
 * be all the client has), but flagged in the editor. */
export const MIN_LONG_EDGE = 1200;

export async function prepareImage(file: File): Promise<{ blob: Blob; longEdge: number }> {
  if (/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
    throw new Error(
      "iPhone HEIC photos can't be opened here. Use a JPG or PNG — or on the iPhone, set Settings → Camera → Formats to Most Compatible.",
    );
  }
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Use a JPG, PNG or WebP image.");
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error("That file is very large. Try exporting a smaller copy (under 40 MB).");
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const longEdge = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, LONG_EDGE / longEdge);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser couldn't prepare the photo. Try another browser.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // Older Safari can't encode WebP and silently hands back a PNG — fall back to JPEG instead.
  const webp = await encode("image/webp", 0.82);
  if (webp?.type === "image/webp") return { blob: webp, longEdge };
  const jpeg = await encode("image/jpeg", 0.85);
  if (!jpeg) throw new Error("This browser couldn't prepare the photo. Try another browser.");
  return { blob: jpeg, longEdge };
}

export type UploadedImage = {
  url: string;
  /** The original's long edge in px, before resizing. */
  longEdge: number;
  small: boolean;
};

/** Resize, then upload. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const { blob, longEdge } = await prepareImage(file);
  const body = new FormData();
  body.append("file", blob, blob.type === "image/webp" ? "photo.webp" : "photo.jpg");
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "The upload didn't go through. Try again.");
  return { url: json.url, longEdge, small: longEdge < MIN_LONG_EDGE };
}
