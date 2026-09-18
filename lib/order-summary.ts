import type { Ledger } from "@/lib/ledger";
import type { OrderFormValues, WeddingOrderFormValues } from "@/lib/schemas";
import { formatPriceFrom } from "@/lib/pricing";
import { collectionWindows } from "@/content/data/collection-windows";

// Deliberately independent of lib/order-store.ts (which touches Cloudflare bindings) — this
// module is imported from client components (components/order/submit-fallback.tsx) as well as
// the server (lib/whatsapp.ts, via a StoredOrder, which structurally satisfies this shape). A
// real discriminated union (not a flat `kind: A | B` + `data: X | Y`) so `order.kind` narrows
// `order.data`.
export type OrderSummaryInput =
  | { token: string | null; kind: "standard"; data: OrderFormValues; ledger: Ledger }
  | { token: string | null; kind: "wedding"; data: WeddingOrderFormValues; ledger: Ledger };

// CLAUDE.md locale: en-ZA, DD/MM/YYYY.
export function formatDateZA(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function orderCustomerName(order: OrderSummaryInput): string {
  return order.data.fullName;
}

export function collectionWindowLabel(id: string | undefined): string | undefined {
  return collectionWindows.find((w) => w.id === id)?.label;
}

export function orderOccasionLine(order: OrderSummaryInput): string {
  if (order.kind === "standard") {
    return `${order.data.occasion} — ${formatDateZA(order.data.eventDate)}`;
  }
  return `Wedding — ${formatDateZA(order.data.weddingDate)}`;
}

export function orderItemsSummary(order: OrderSummaryInput): string {
  if (order.ledger.lines.length === 0) return "Details in the full order";
  return order.ledger.lines.map((line) => line.label).join(", ");
}

export function orderEstimateLine(order: OrderSummaryInput): string {
  return order.ledger.lines.length === 0 ? "To be confirmed" : formatPriceFrom(order.ledger.priceFrom);
}

/** Full plain-text summary — the WhatsApp template's fields (lib/whatsapp.ts) are built from the
 * same pieces, and this same text is what a client copies/sends themselves via the wa.me fallback
 * if the automated send fails or never reached the server at all (no token yet, in which case
 * there's no /o/[token] link to include). Modelled on the "Option 1 — messages" mockup in
 * handoff/whatsapp-order-preview.html. */
export function buildOrderPlainText(order: OrderSummaryInput, orderUrl: string | null): string {
  const lines: string[] = [];
  lines.push("New order — OCD website");
  if (order.token) lines.push(`Ref: ${order.token}`);
  lines.push("");
  lines.push(`Customer: ${orderCustomerName(order)}`);
  lines.push(
    `Contact: ${order.data.contactNumber}${
      order.data.whatsappNumber ? ` (WhatsApp: ${order.data.whatsappNumber})` : ""
    }${order.data.email ? ` / ${order.data.email}` : ""}`
  );
  lines.push("");
  lines.push(orderOccasionLine(order));
  if (order.data.deliveryMode === "collection" && order.data.collectionWindow) {
    const slotLabel = collectionWindowLabel(order.data.collectionWindow);
    if (slotLabel) lines.push(`Collection window: ${slotLabel}`);
  }
  lines.push("");
  if (order.ledger.lines.length > 0) {
    for (const line of order.ledger.lines) {
      lines.push(`- ${line.label}${line.detail ? ` (${line.detail})` : ""}`);
    }
    lines.push("");
  }
  lines.push(`Estimated: ${orderEstimateLine(order)} — not final`);
  if (orderUrl) {
    lines.push("");
    lines.push(`Full order & photos: ${orderUrl}`);
  }
  return lines.join("\n");
}

export function buildWhatsAppDeepLink(ownerNumber: string, text: string): string {
  return `https://wa.me/${ownerNumber}?text=${encodeURIComponent(text)}`;
}
