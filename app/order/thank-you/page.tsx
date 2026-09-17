import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { ButtonLink } from "@/components/button";

export const metadata: Metadata = {
  title: "Order received",
  description: "We've got your order — here's what happens next.",
  alternates: { canonical: "/order/thank-you" },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <SectionA eyebrow="Order received" className="text-center">
      <h1 className="mx-auto max-w-xl font-display text-2xl font-medium">
        Thank you — we&apos;ve got it.
      </h1>
      <p className="mx-auto mt-6 max-w-md text-lg text-ink-soft">
        We&apos;ll come back to you within 24 hours with a quote based on what you&apos;ve told
        us. Nothing&apos;s locked in yet.
      </p>
      <div className="mx-auto mt-10 max-w-md text-left">
        <p className="label text-ink-soft">What happens next</p>
        <ol className="mt-4 space-y-3 text-ink-soft">
          <li>1. We review your order and price it against your exact details.</li>
          <li>2. We come back to you — by email or WhatsApp — within 24 hours.</li>
          <li>3. Once you&apos;re happy, full payment confirms the booking.</li>
        </ol>
      </div>
      {token && (
        <div className="mt-8 flex justify-center">
          <ButtonLink href={`/o/${token}`} variant="ghost">
            View your order
          </ButtonLink>
        </div>
      )}
      <div className="mt-10 flex justify-center gap-4">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/faq" variant="ghost">
          Read the FAQ
        </ButtonLink>
      </div>
    </SectionA>
  );
}
