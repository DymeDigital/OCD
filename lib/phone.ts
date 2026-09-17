// Normalizes a customer-typed contact number (lib/schemas.ts's contactFields.contactNumber has no
// format constraint — min(7) only) into the digits-only, country-code-first form wa.me requires.
// Returns null rather than a best guess when the input can't be confidently read as an SA mobile
// number, so callers can skip the WhatsApp link entirely rather than risk a broken/wrong chat.
export function normalizeSAWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  // Already international — "+27 84 973 5638" / "27849735638". SA mobile ranges start 6/7/8.
  if (digits.length === 11 && /^27[678]/.test(digits)) return digits;

  // Local, 0-prefixed 10-digit mobile — "082 234 5678" -> "27822345678".
  if (digits.length === 10 && /^0[678]/.test(digits)) return `27${digits.slice(1)}`;

  // Bare mobile subscriber number, no leading 0 and no country code — "82 234 5678" -> "27822345678".
  if (digits.length === 9 && /^[678]/.test(digits)) return `27${digits}`;

  // Too short/long, landline-shaped (01x-05x), non-SA, or ambiguous — don't guess.
  return null;
}
