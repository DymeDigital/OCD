import type { StoredOrder } from "@/lib/order-store";
import { orderCustomerName, orderOccasionLine, orderItemsSummary, orderEstimateLine } from "@/lib/order-summary";

// Meta WhatsApp Cloud API. Business-initiated, out-of-session messages must use a pre-approved
// template — free-form text isn't allowed here. TODO(client): the template below needs to exist
// and be approved in the Meta WhatsApp Business Platform before this can send for real; until
// then sendOrderTemplate() throws and the caller falls back to the copyable-text + wa.me flow
// (see lib/order-summary.ts, components/order/submit-fallback.tsx).
//
// Approved template draft ("new_order_notification", submit for Meta approval):
//   Body:   "New order from {{1}}. Occasion: {{2}}. Items: {{3}}. Estimated: {{4}}.
//            View the full order below."
//   Button: "View order" — a URL button configured as https://<site>/o/{{1}} (dynamic suffix).
//
// Config is passed in explicitly rather than read from process.env/getCloudflareContext here —
// keeps buildOrderTemplatePayload a pure, synchronous, unit-testable function, and the caller
// (app/api/submit-order/route.ts) is where a Cloudflare env binding naturally already lives.

export type WhatsAppTemplatePayload = {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: {
    name: string;
    language: { code: string };
    components: Array<
      | { type: "body"; parameters: { type: "text"; text: string }[] }
      | { type: "button"; sub_type: "url"; index: string; parameters: { type: "text"; text: string }[] }
    >;
  };
};

export function buildOrderTemplatePayload(
  order: StoredOrder,
  config: { ownerNumber: string | undefined; templateName: string | undefined }
): WhatsAppTemplatePayload {
  const { ownerNumber, templateName } = config;
  if (!ownerNumber || !templateName) {
    throw new Error("WhatsApp is not configured: WHATSAPP_OWNER_NUMBER / WHATSAPP_TEMPLATE_NAME missing.");
  }

  return {
    messaging_product: "whatsapp",
    to: ownerNumber,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: orderCustomerName(order) },
            { type: "text", text: orderOccasionLine(order) },
            { type: "text", text: orderItemsSummary(order) },
            { type: "text", text: orderEstimateLine(order) },
          ],
        },
        {
          // Dynamic URL suffix — only the token travels here, the base URL is fixed on the
          // approved template itself.
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: order.token }],
        },
      ],
    },
  };
}

export async function sendOrderTemplate(
  payload: WhatsAppTemplatePayload,
  config: { accessToken: string | undefined; phoneNumberId: string | undefined }
): Promise<void> {
  const { accessToken, phoneNumberId } = config;
  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp is not configured: WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID missing.");
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WhatsApp send failed (${res.status}): ${body}`);
  }
}
