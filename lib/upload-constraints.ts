// Shared between the client (components/order/image-upload.tsx) and the server
// (app/api/submit-order/route.ts) — the client's checks are a convenience, this file is what
// actually gets enforced, since a client can send anything it likes.
export const MAX_FILES = 5;
export const MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

// Reference photos are embedded directly in the order-notification email (lib/email.ts) as
// inline attachments, since ORDER_PHOTOS_PUBLIC_URL isn't guaranteed to be a real, reachable
// URL yet. Resend caps total attachment size at 40MB *after* base64 encoding (~33% inflation),
// and MAX_FILES × MAX_SIZE_BYTES alone can exceed that — so app/api/submit-order/route.ts only
// inline-attaches when the raw total is under this budget, leaving headroom for the encoding
// overhead and the rest of the message. Over budget, the email still sends; see lib/email.ts.
export const MAX_INLINE_EMAIL_ATTACHMENT_BYTES = 15 * 1024 * 1024;
