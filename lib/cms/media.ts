import { getCloudflareContext } from "@opennextjs/cloudflare";
import { r2PublicBase } from "@/lib/r2-public";

// Site photography uploaded through /admin. Lives in the ORDER_PHOTOS bucket under `site/`
// (order reference photos use `<token>/`), so it's served from the same public domain that
// next.config.ts already allows for next/image.

export const SITE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const PREFIX = "site/";

/** Sniffs the real type from the first bytes — the extension and the browser's MIME claim are
 * just what the client said. */
export function detectImageType(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)) {
    return { mime: "image/png", ext: "png" };
  }
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

export async function saveSiteImage(bytes: Uint8Array, type: { mime: string; ext: string }): Promise<string> {
  const { env } = await getCloudflareContext({ async: true });
  const base = r2PublicBase(env);
  const key = `${PREFIX}${crypto.randomUUID()}.${type.ext}`;
  await env.ORDER_PHOTOS.put(key, bytes, {
    // Every upload gets a fresh name, so the object at a URL never changes.
    httpMetadata: { contentType: type.mime, cacheControl: "public, max-age=31536000, immutable" },
  });
  return `${base}/${key}`;
}

/** The R2 key for a URL this module produced, or null for anything else (static photos,
 * order reference photos, foreign URLs) — those are never deleted from here. */
export async function siteImageKey(url: string): Promise<string | null> {
  const { env } = await getCloudflareContext({ async: true });
  let base: string;
  try {
    base = r2PublicBase(env);
  } catch {
    return null;
  }
  const prefix = `${base}/${PREFIX}`;
  if (!url.startsWith(prefix)) return null;
  const key = url.slice(base.length + 1);
  return /^site\/[\w-]+\.(jpg|png|webp)$/.test(key) ? key : null;
}

export async function isSiteImageUrl(url: string): Promise<boolean> {
  return (await siteImageKey(url)) !== null;
}

/** Best-effort: a failed delete just leaves an orphan file, never blocks the save. */
export async function deleteSiteImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const { env } = await getCloudflareContext({ async: true });
  const keys = (await Promise.all(urls.map(siteImageKey))).filter((k): k is string => k !== null);
  if (keys.length === 0) return;
  try {
    await env.ORDER_PHOTOS.delete(keys);
  } catch (err) {
    console.error("[cms] deleting replaced site images failed", err);
  }
}
