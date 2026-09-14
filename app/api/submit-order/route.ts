import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { orderSchema, weddingOrderSchema } from "@/lib/schemas";
import { computeOrderLedger, computeWeddingLedger, type Ledger } from "@/lib/ledger";
import type { OrderFormValues, WeddingOrderFormValues } from "@/lib/schemas";
import {
  MAX_FILES,
  MAX_SIZE_BYTES,
  ACCEPTED_TYPES,
  MAX_INLINE_EMAIL_ATTACHMENT_BYTES,
} from "@/lib/upload-constraints";
import { generateOrderToken, saveOrder, savePhoto, type StoredOrder } from "@/lib/order-store";
import { buildOrderTemplatePayload, sendOrderTemplate } from "@/lib/whatsapp";
import { buildOrderEmail, sendOrderEmail, type EmailPhoto } from "@/lib/email";
import { socialLinks } from "@/content/data/socialLinks";

declare global {
  interface CloudflareEnv {
    WHATSAPP_ACCESS_TOKEN: string;
    WHATSAPP_PHONE_NUMBER_ID: string;
    WHATSAPP_OWNER_NUMBER: string;
    WHATSAPP_TEMPLATE_NAME: string;
    // Interim email channel (Resend) — see lib/email.ts and .dev.vars.example.
    RESEND_API_KEY: string;
    ORDER_EMAIL_FROM: string;
    ORDER_EMAIL_TO: string;
    // Deployed origin for the /o/[token] link in outbound messages; falls back to the request origin.
    SITE_URL: string;
  }
}

// A real discriminated union for the validated-but-not-yet-stored order — picking a Zod schema
// via a ternary (`kind === "standard" ? orderSchema : weddingOrderSchema`) erases the correlation
// between `kind` and the parsed data's type, so branching happens explicitly below instead.
type ValidatedOrder =
  | { kind: "standard"; data: OrderFormValues; ledger: Ledger }
  | { kind: "wedding"; data: WeddingOrderFormValues; ledger: Ledger };

// One multipart request: form fields as a JSON string under "data", plus the reference photos
// under repeated "files" entries. Cloudflare Workers accept request bodies up to 100MB (vs.
// ~4.5MB on a typical serverless platform), so — unlike a Vercel-hosted version of this route —
// there's no need to split this into a separate direct-to-storage upload step first.
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the submitted form." }, { status: 400 });
  }

  // Anti-spam: a hidden honeypot field real users never see, plus a minimum time-on-form. A bot
  // that fills every field and submits instantly trips one or the other. Silently accepted with an
  // empty token so it looks the same as success to a script; no KV write, no email, no WhatsApp.
  // No CAPTCHA (CLAUDE.md §9).
  const honeypot = String(formData.get("company") ?? "").trim();
  const renderedAt = Number(formData.get("renderedAt") ?? 0);
  if (honeypot !== "" || (renderedAt > 0 && Date.now() - renderedAt < 3000)) {
    return NextResponse.json({ token: "", whatsappSent: false, emailSent: false });
  }

  const kind = formData.get("kind");
  if (kind !== "standard" && kind !== "wedding") {
    return NextResponse.json({ error: "Missing or invalid order kind." }, { status: 400 });
  }

  const rawData = formData.get("data");
  if (typeof rawData !== "string") {
    return NextResponse.json({ error: "Missing order data." }, { status: 400 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
  } catch {
    return NextResponse.json({ error: "Order data was not valid JSON." }, { status: 400 });
  }

  // The ledger is recomputed here from the validated data rather than trusted from the client —
  // it's cheap (the same pure functions the form itself uses) and a client payload should never
  // be the source of truth for a number, even an indicative one.
  let validated: ValidatedOrder;
  if (kind === "standard") {
    const parsed = orderSchema.safeParse(parsedJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Order data failed validation.", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    validated = { kind, data: parsed.data, ledger: computeOrderLedger(parsed.data) };
  } else {
    const parsed = weddingOrderSchema.safeParse(parsedJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Order data failed validation.", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    validated = { kind, data: parsed.data, ledger: computeWeddingLedger(parsed.data) };
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Too many files — max ${MAX_FILES}.` }, { status: 400 });
  }
  for (const file of files) {
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: `${file.name} is over the 10MB limit.` }, { status: 400 });
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `${file.name} is not an accepted image type.` }, { status: 400 });
    }
  }

  // Read the reference photos into base64 for the email now, while they're still plain `File`s —
  // reading arrayBuffer() doesn't consume a File/Blob, so the same `files` still flow into
  // savePhoto() below unchanged. Only attempt this under a size budget well below Resend's 40MB
  // (post-base64) attachment cap; buildOrderEmail() falls back to a plain "too large" note
  // otherwise rather than let a big order fail to send at all.
  let emailPhotos: EmailPhoto[] | undefined;
  const totalFileBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (files.length > 0 && totalFileBytes <= MAX_INLINE_EMAIL_ATTACHMENT_BYTES) {
    try {
      emailPhotos = await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()).toString("base64"),
          contentType: file.type || "application/octet-stream",
        }))
      );
    } catch (err) {
      console.error("[submit-order] reading photos for email failed", err);
      emailPhotos = undefined;
    }
  }

  const token = generateOrderToken();

  let referenceImages;
  try {
    referenceImages = await Promise.all(files.map((file) => savePhoto(token, file)));
  } catch (err) {
    console.error("[submit-order] photo upload failed", err);
    return NextResponse.json({ error: "Could not upload reference images." }, { status: 502 });
  }

  const createdAt = new Date().toISOString();
  const order: StoredOrder = {
    ...validated,
    token,
    createdAt,
    referenceImages,
    signatureName: validated.data.signatureName,
    agreedAt: createdAt,
    whatsappStatus: "failed",
    emailStatus: "failed",
  };

  try {
    // Saved before either send is attempted, so a durable record and a working /o/[token] link
    // exist even if the calls below fail or the worker dies mid-send.
    await saveOrder(order);
  } catch (err) {
    console.error("[submit-order] order save failed", err);
    return NextResponse.json({ error: "Could not save the order." }, { status: 500 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const base = (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const orderUrl = `${base}/o/${token}`;

  // Interim primary channel: email the baker. Non-fatal — the order is already in KV and the
  // client falls back to the copyable-text + wa.me flow using the token if this doesn't land.
  let emailSent = false;
  try {
    const to = (env.ORDER_EMAIL_TO || socialLinks.email)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await sendOrderEmail(buildOrderEmail(order, { orderUrl, photos: emailPhotos }), {
      apiKey: env.RESEND_API_KEY,
      from: env.ORDER_EMAIL_FROM,
      to,
      replyTo: order.data.email || undefined,
    });
    emailSent = true;
  } catch (err) {
    console.error("[submit-order] email send failed", err);
  }

  // WhatsApp stays wired but is skipped until its Meta template + credentials are configured, so
  // an un-set-up deployment doesn't log a guaranteed failure on every order.
  let whatsappSent = false;
  if (env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_TEMPLATE_NAME) {
    try {
      const payload = buildOrderTemplatePayload(order, {
        ownerNumber: env.WHATSAPP_OWNER_NUMBER,
        templateName: env.WHATSAPP_TEMPLATE_NAME,
      });
      await sendOrderTemplate(payload, {
        accessToken: env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
      });
      whatsappSent = true;
    } catch (err) {
      console.error("[submit-order] WhatsApp send failed", err);
    }
  }

  // One corrective KV write if either channel delivered — keeps the stored record honest without
  // a write per channel.
  if (emailSent || whatsappSent) {
    try {
      await saveOrder({
        ...order,
        emailStatus: emailSent ? "sent" : "failed",
        whatsappStatus: whatsappSent ? "sent" : "failed",
      });
    } catch (err) {
      console.error("[submit-order] order status update failed", err);
    }
  }

  return NextResponse.json({ token, whatsappSent, emailSent });
}
