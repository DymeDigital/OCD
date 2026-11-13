// The ORDER_PHOTOS bucket's public base URL, shared by order reference photos (lib/order-store.ts)
// and site photos uploaded through /admin (lib/cms/media.ts).
//
// The unset case is obvious, but the .dev.vars.example placeholder is a non-empty string — pasted
// verbatim into a production secret by mistake, it would build URLs that look fine and only fail
// once someone opens the broken image. Both cases throw, loudly, at upload time.
export function r2PublicBase(env: { ORDER_PHOTOS_PUBLIC_URL?: string }): string {
  const base = env.ORDER_PHOTOS_PUBLIC_URL;
  if (!base || base.includes("REPLACE-ME")) {
    throw new Error("ORDER_PHOTOS_PUBLIC_URL is not configured (still unset or the example placeholder)");
  }
  return base.replace(/\/$/, "");
}
