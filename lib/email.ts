import type { StoredOrder } from "@/lib/order-store";
import {
  buildOrderPlainText,
  orderCustomerName,
  orderOccasionLine,
  orderEstimateLine,
  collectionWindowLabel,
  formatDateZA,
} from "@/lib/order-summary";
import { flavourLabel } from "@/lib/ledger";
import { designTiers } from "@/content/data/designTiers";
import { normalizeSAWhatsAppNumber } from "@/lib/phone";
import type { OrderFormValues, WeddingOrderFormValues } from "@/lib/schemas";
import type { ReferenceImage } from "@/lib/upload-schema";

// Interim order-delivery channel: an email to the baker, sent via Resend's HTTP API (works from a
// Cloudflare Worker, unlike SMTP). This mirrors lib/whatsapp.ts on purpose — a pure builder plus an
// async sender, with all config passed in by the caller (app/api/submit-order/route.ts) so this
// stays a synchronous, unit-testable module with no Cloudflare imports.
//
// While Resend is in "test" mode (from = onboarding@resend.dev, no verified domain) it only
// delivers to the address that owns the Resend account — see .dev.vars.example. Swapping to a
// verified domain later changes only ORDER_EMAIL_FROM.
//
// Reference photos: ORDER_PHOTOS_PUBLIC_URL isn't guaranteed to be a real, reachable URL yet (see
// .dev.vars.example), so rather than link to it, the email embeds the photos directly as inline
// attachments via Resend's `content_id` support (referenced in the HTML as `cid:...`). The caller
// passes the already-read, already-size-checked file bytes in as `photos` — this module does no
// file I/O of its own. See lib/upload-constraints.ts's MAX_INLINE_EMAIL_ATTACHMENT_BYTES.

export type EmailPhoto = { filename: string; content: string; contentType: string };

type ResendAttachment = {
  filename: string;
  content: string;
  content_id: string;
  content_type: string;
};

export type OrderEmail = {
  subject: string;
  html: string;
  text: string;
  attachments?: ResendAttachment[];
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// lib/schemas.ts's optionalEnum() fields (cakeShape, foundUs) type as `unknown` in
// OrderFormValues/WeddingOrderFormValues. By the time a value is on a StoredOrder it's already
// passed schema validation server-side, so this is a safe runtime narrow, not a cast — same helper
// as components/order/order-detail.tsx's `str()`.
function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

// One label/value row in a two-column details table. Skips empty/undefined values rather than
// rendering a blank row — mirrors order-detail.tsx's Row component.
function fieldRow(label: string, value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "";
  return `<tr><td style="padding:4px 8px 4px 0;font-size:13px;color:#6B6B6B;white-space:nowrap;vertical-align:top">${esc(
    label
  )}</td><td style="padding:4px 0;color:#111111">${esc(String(value))}</td></tr>`;
}

// A titled section table. Renders nothing at all if every row inside it was skipped.
function section(title: string, rows: string): string {
  if (!rows) return "";
  return `<table style="width:100%;border-collapse:collapse;border-top:1px solid #E4E4E4;margin-bottom:16px">
      <tr><td colspan="2" style="padding:12px 0 4px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#6B6B6B">${esc(
        title
      )}</td></tr>
      ${rows}
    </table>`;
}

function standardDetailRows(data: OrderFormValues): string {
  return [
    fieldRow("Occasion", data.occasion),
    fieldRow("Date needed", data.eventDate && formatDateZA(data.eventDate)),
    fieldRow("Making", data.productType),
    fieldRow("Guest count", data.guestCount),
    fieldRow("Cake shape", str(data.cakeShape)),
    fieldRow("Cake flavour", data.cakeFlavourId && flavourLabel(data.cakeFlavourId, data.cakeFlavourFillings)),
    fieldRow("Cupcake dozens", data.cupcakeDozens),
    fieldRow("Cupcake flavour", data.cupcakeFlavourId && flavourLabel(data.cupcakeFlavourId, data.cupcakeFlavourFillings)),
    fieldRow("Cake dietary", data.cakeDietaryOptions?.join(", ")),
    fieldRow("Cupcake dietary", data.cupcakeDietaryOptions?.join(", ")),
    fieldRow("Design tier", designTiers.find((t) => t.id === data.designTierId)?.label),
    fieldRow("Add-ons", data.addOns),
  ].join("");
}

function weddingDetailRows(data: WeddingOrderFormValues): string {
  return [
    fieldRow("Partners", data.partnerNames),
    fieldRow("Venue", data.venue),
    fieldRow("Venue contact", data.venueContact),
    fieldRow("Wedding date", data.weddingDate && formatDateZA(data.weddingDate)),
    fieldRow("Time", data.weddingTime),
    fieldRow("Guest count", data.guestCount),
    fieldRow(
      "Tiers",
      data.tierCount
        ? `${data.tierCount}${data.fauxTierCount ? ` (${data.fauxTierCount} faux)` : ""}`
        : undefined
    ),
    fieldRow("Flavour(s)", data.perTierFlavourIds?.map((id) => flavourLabel(id, data.flavourFillings)).join(", ")),
    fieldRow("Dietary", data.dietaryOptions?.join(", ")),
    fieldRow("Cake table setup", data.cakeTableSetup),
    fieldRow("Tasting wanted", data.tastingWanted ? "Yes" : "No"),
    fieldRow(
      "Planner",
      data.plannerName
        ? `${data.plannerName}${data.plannerContact ? ` — ${data.plannerContact}` : ""}`
        : undefined
    ),
    fieldRow("Dietary requirements", data.dietaryRequirements),
  ].join("");
}

function textBlock(title: string, value: string | undefined): string {
  if (!value) return "";
  return `<div style="margin:0 0 16px"><p style="margin:0 0 4px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#6B6B6B">${esc(
    title
  )}</p><p style="margin:0;color:#111111;white-space:pre-wrap">${esc(value)}</p></div>`;
}

// Builds both the inline-photo markup and the Resend attachments array together, since the
// content_id linking them has to match on both sides. Each thumbnail links out to the photo's real
// R2 URL (same referenceImages the /o/[token] page reads) — the inline cid: image is fast to see
// at a glance, the link is how you get to the full-resolution original. photos and referenceImages
// are index-aligned: both are built by mapping over the same uploaded `files` array in
// app/api/submit-order/route.ts, and Promise.all preserves array order regardless of resolution
// order. Falls back to plain links when photos were received but skipped for size (see
// lib/upload-constraints.ts), or a plain note when none were uploaded at all.
function buildPhotos(
  photos: EmailPhoto[] | undefined,
  referenceImages: ReferenceImage[]
): { html: string; attachments: ResendAttachment[] } {
  if (photos && photos.length > 0) {
    const attachments = photos.map((p, i) => ({
      filename: p.filename,
      content: p.content,
      content_id: `photo${i}`,
      content_type: p.contentType,
    }));
    const html = attachments
      .map((a, i) => {
        const img = `<img src="cid:${a.content_id}" alt="${esc(
          a.filename
        )}" width="96" height="96" style="display:block;width:96px;height:96px;object-fit:cover;border:1px solid #E4E4E4;border-radius:4px">`;
        const url = referenceImages[i]?.url;
        return url
          ? `<a href="${esc(url)}" style="display:inline-block;margin:0 8px 8px 0">${img}</a>`
          : `<div style="display:inline-block;margin:0 8px 8px 0">${img}</div>`;
      })
      .join("");
    return { html, attachments };
  }
  if (referenceImages.length > 0) {
    const links = referenceImages
      .map(
        (img) =>
          `<a href="${esc(img.url)}" style="display:block;color:#111111;font-size:14px;padding:2px 0">${esc(
            img.name
          )}</a>`
      )
      .join("");
    return {
      html: `<p style="margin:0 0 4px;color:#6B6B6B;font-size:14px">Too large to attach here — tap to view full-size:</p>${links}`,
      attachments: [],
    };
  }
  return {
    html: `<p style="margin:0;color:#6B6B6B;font-size:14px">No reference photos attached.</p>`,
    attachments: [],
  };
}

export function buildOrderEmail(
  order: StoredOrder,
  opts: { orderUrl: string; photos?: EmailPhoto[] }
): OrderEmail {
  const name = orderCustomerName(order);
  const occasion = orderOccasionLine(order);
  const subject = `New order — ${name} — ${occasion}`;

  // Plain-text part is the same baker-ready summary the wa.me fallback uses, verbatim.
  const text = buildOrderPlainText(order, opts.orderUrl);

  const foundUs = str(order.data.foundUs);
  const whatsappNumber = str(order.data.whatsappNumber);
  const contact = `${order.data.contactNumber}${
    whatsappNumber ? ` &nbsp;(WhatsApp: ${esc(whatsappNumber)})` : ""
  }${order.data.email ? ` &nbsp;/&nbsp; ${esc(order.data.email)}` : ""}${
    foundUs ? ` &nbsp;·&nbsp; via ${esc(foundUs)}` : ""
  }`;

  // Deep-links to a WhatsApp chat with the customer's own number (distinct from lib/whatsapp.ts,
  // which sends the bakery's own order-notification template). No ?text= prefill — this is the
  // baker opening a chat cold, in her own voice. Prefers whatsappNumber when the customer gave one
  // (it's only collected because it differs from contactNumber). lib/schemas.ts's contactNumber
  // validation now requires a normalizable number before an order can even be submitted, so this
  // should always resolve for new orders — the raw-digits fallback below is only for orders stored
  // before that validation existed. The Contact row above shows the raw number regardless, so a
  // fallback link that happens to be off is still safer to offer than none at all.
  const preferredWaSource = whatsappNumber || order.data.contactNumber;
  const customerWaNumber =
    normalizeSAWhatsAppNumber(preferredWaSource) ??
    (() => {
      const digits = preferredWaSource.replace(/\D/g, "");
      return digits.length >= 9 ? digits : null;
    })();
  const customerFirstName = name.split(/\s+/)[0];
  const customerWaButton = customerWaNumber
    ? `<div style="margin:8px 0 20px">
        <a href="https://wa.me/${customerWaNumber}" style="display:inline-block;background:#FFFFFF;color:#111111;text-decoration:none;padding:12px 22px;border-radius:4px;font-size:14px;border:1px solid #111111">Message ${esc(
        customerFirstName
      )} on WhatsApp</a>
      </div>`
    : "";

  const detailRows = order.kind === "standard" ? standardDetailRows(order.data) : weddingDetailRows(order.data);

  const itemRows =
    order.ledger.lines.length > 0
      ? order.ledger.lines
          .map(
            (line) =>
              `<tr><td style="padding:4px 0;color:#111111">${esc(line.label)}${
                line.detail ? `<span style="color:#6B6B6B"> — ${esc(line.detail)}</span>` : ""
              }</td></tr>`
          )
          .join("")
      : `<tr><td style="padding:4px 0;color:#6B6B6B">Details in the full order.</td></tr>`;

  const deliveryTitle = order.data.deliveryMode === "delivery" ? "Delivery" : "Collection";
  const deliveryRows = [
    fieldRow(
      "Address",
      order.data.deliveryMode === "delivery" ? order.data.address : "Collection from OCD"
    ),
    order.data.deliveryMode === "collection"
      ? fieldRow("Collection window", collectionWindowLabel(order.data.collectionWindow))
      : "",
  ].join("");

  const { html: photosHtml, attachments } = buildPhotos(opts.photos, order.referenceImages);

  const html = `<!doctype html>
<html>
<body style="margin:0;background:#F7F4F2;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E4E4E4;border-radius:4px;padding:28px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#A81E27">New order — OCD website</p>
    <h1 style="margin:0 0 4px;font-size:22px;line-height:1.2">${esc(name)}</h1>
    <p style="margin:0 0 2px;color:#111111">${esc(occasion)}</p>
    <p style="margin:0 0 20px;font-size:13px;color:#6B6B6B">Received ${esc(formatDateZA(order.createdAt))}</p>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #E4E4E4;margin-bottom:16px">
      <tr><td style="padding:12px 0 4px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#6B6B6B">Contact</td></tr>
      <tr><td style="padding:0 0 4px;color:#111111">${contact}</td></tr>
    </table>

    ${customerWaButton}

    ${section("Order details", detailRows)}

    ${textBlock("Design brief", order.data.designBrief)}
    ${textBlock("Notes", order.data.notes)}

    ${section(deliveryTitle, deliveryRows)}

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #E4E4E4;margin-bottom:16px">
      <tr><td style="padding:12px 0 4px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#6B6B6B">Order</td></tr>
      ${itemRows}
      <tr><td style="padding:10px 0 0;color:#A81E27;font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace">Estimated: ${esc(
        orderEstimateLine(order)
      )} — not final</td></tr>
    </table>

    <div style="margin:20px 0">
      <a href="${esc(
        opts.orderUrl
      )}" style="display:inline-block;background:#111111;color:#FFFFFF;text-decoration:none;padding:12px 22px;border-radius:4px;font-size:14px">View full order &amp; photos</a>
    </div>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #E4E4E4;margin-bottom:16px">
      <tr><td style="padding:12px 0 4px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#6B6B6B">Signature</td></tr>
      <tr><td style="padding:0 0 4px;color:#111111;font-style:italic">${esc(
        order.signatureName
      )} <span style="font-style:normal;color:#6B6B6B;font-size:12px">— signed ${esc(
    formatDateZA(order.agreedAt)
  )}</span></td></tr>
    </table>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #E4E4E4">
      <tr><td style="padding:12px 0 8px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#6B6B6B">Reference photos</td></tr>
      <tr><td>${photosHtml}</td></tr>
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:#6B6B6B">Nothing is locked in — reply to this email to talk design and confirm the price with the customer.</p>
  </div>
</body>
</html>`;

  return { subject, html, text, attachments: attachments.length > 0 ? attachments : undefined };
}

export async function sendOrderEmail(
  mail: OrderEmail,
  config: {
    apiKey: string | undefined;
    from: string | undefined;
    to: string[];
    replyTo?: string;
  }
): Promise<void> {
  const { apiKey, from, to, replyTo } = config;
  if (!apiKey || !from) {
    throw new Error("Email is not configured: RESEND_API_KEY / ORDER_EMAIL_FROM missing.");
  }
  if (to.length === 0) {
    throw new Error("Email is not configured: no recipient (ORDER_EMAIL_TO).");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.attachments ? { attachments: mail.attachments } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${body}`);
  }
}
