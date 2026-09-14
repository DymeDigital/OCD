import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Ledger } from "@/lib/ledger";
import type { OrderFormValues, WeddingOrderFormValues } from "@/lib/schemas";
import type { ReferenceImage } from "@/lib/upload-schema";

// Bindings declared in wrangler.jsonc — ORDERS (KV) and ORDER_PHOTOS (R2) are app data, kept
// separate from OpenNext's own NEXT_INC_CACHE_R2_BUCKET (its ISR/data cache, not ours).
declare global {
  interface CloudflareEnv {
    ORDERS: KVNamespace;
    ORDER_PHOTOS: R2Bucket;
    ORDER_PHOTOS_PUBLIC_URL: string;
  }
}

type StoredOrderBase = {
  token: string;
  createdAt: string;
  ledger: Ledger;
  referenceImages: ReferenceImage[];
  signatureName: string;
  agreedAt: string;
  // Both set to "failed" the moment the record is written (before either send is attempted), then
  // flipped to "sent" once that channel's call succeeds — see app/api/submit-order/route.ts. This
  // way a worker crash mid-send still leaves a record that's honest about not having gone out.
  // Email is the interim primary channel; WhatsApp stays wired and flips on once its Meta template
  // is approved.
  whatsappStatus: "sent" | "failed";
  emailStatus: "sent" | "failed";
};

export type StoredOrder =
  | (StoredOrderBase & { kind: "standard"; data: OrderFormValues })
  | (StoredOrderBase & { kind: "wedding"; data: WeddingOrderFormValues });

function orderKey(token: string): string {
  return `order:${token}`;
}

export function generateOrderToken(): string {
  return crypto.randomUUID();
}

export async function saveOrder(order: StoredOrder): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.ORDERS.put(orderKey(order.token), JSON.stringify(order));
}

export async function getOrder(token: string): Promise<StoredOrder | null> {
  const { env } = await getCloudflareContext({ async: true });
  const raw = await env.ORDERS.get(orderKey(token));
  if (!raw) return null;
  return JSON.parse(raw) as StoredOrder;
}

/** Streams one uploaded file into the ORDER_PHOTOS bucket and returns its public URL.
 * Requires the bucket's public access (r2.dev or a custom domain) enabled in the Cloudflare
 * dashboard, and that base URL set as ORDER_PHOTOS_PUBLIC_URL — see .dev.vars.example. */
export async function savePhoto(token: string, file: File): Promise<ReferenceImage> {
  const { env } = await getCloudflareContext({ async: true });
  const publicBase = env.ORDER_PHOTOS_PUBLIC_URL;
  if (!publicBase) throw new Error("ORDER_PHOTOS_PUBLIC_URL is not configured");

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const key = `${token}/${crypto.randomUUID()}.${ext}`;
  // Pass the File (a Blob) directly rather than file.stream() — R2's put() needs a known length
  // up front, which a bare ReadableStream doesn't carry.
  await env.ORDER_PHOTOS.put(key, file, {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  return { url: `${publicBase.replace(/\/$/, "")}/${key}`, name: file.name };
}
