import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { standardTerms, weddingTerms } from "@/content/data/terms";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Lead times, delivery, deposits, cancellations, and allergens — the real terms, plainly stated.",
};

const faqs = [
  {
    q: "How far in advance do I need to order?",
    a: `All standard orders need at least ${standardTerms.minLeadTimeDays} days' notice. Wedding cakes need more — final guest counts and design details are due at least ${weddingTerms.guestCountDeadlineDays} days before the wedding, so the earlier we start talking, the more room we have.`,
  },
  {
    q: "How does pricing work?",
    a: "Every price you see on this site is a starting range, not a final number — the exact price depends on your servings and design. Once we've talked through the details, we'll come back with a real quote.",
  },
  {
    q: "Do you deliver?",
    a: `${standardTerms.deliveryPricing} We'll confirm delivery areas and fees when you get in touch.`,
  },
  {
    q: "What's required to confirm my order?",
    a: `Full payment confirms a standard order, with ${standardTerms.depositPortion * 100}% of that counted as a non-refundable deposit. ${standardTerms.proofOfPayment}`,
  },
  {
    q: "What if I need to cancel a standard order?",
    a: null,
    list: standardTerms.cancellation.tiers.map(
      (t) => `${t.noticeDays} before collection/delivery: ${t.creditPercent}% credit voucher (valid ${standardTerms.cancellation.voucherValidityMonths} months).`
    ),
    note: standardTerms.cancellation.note,
  },
  {
    q: "What if I need to cancel a wedding order?",
    a: null,
    list: weddingTerms.cancellation.tiers.map((t) => `${t.noticeDays}: ${t.outcome}`),
    note: weddingTerms.cancellation.note,
  },
  {
    q: "Can you cater for allergies?",
    a: weddingTerms.allergenNote,
  },
  {
    q: "Do you offer tastings?",
    a: "Ask us when you get in touch — we'll let you know what's available for your event.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="FAQ">
          <h1 className="max-w-2xl font-display text-2xl font-medium">
            The real terms, plainly stated.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Everything below matches what&apos;s in our order form and wedding contract — nothing
            here is simplified away.
          </p>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="pt-0">
          <div className="divide-y divide-rule border-t border-rule">
            {faqs.map((item) => (
              <div key={item.q} className="py-8">
                <h2 className="font-display text-lg font-medium">{item.q}</h2>
                {item.a && <p className="mt-3 max-w-2xl text-ink-soft">{item.a}</p>}
                {item.list && (
                  <ul className="mt-3 max-w-2xl list-disc space-y-1 pl-5 text-ink-soft">
                    {item.list.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
                {item.note && <p className="mt-3 max-w-2xl text-sm text-ink-soft">{item.note}</p>}
              </div>
            ))}
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
