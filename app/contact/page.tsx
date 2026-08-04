import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch, or start your order directly.",
};

export default function ContactPage() {
  return (
    <Reveal>
      <SectionA eyebrow="Contact">
        <h1 className="max-w-2xl font-display text-2xl font-medium">
          The fastest way to reach us is to start your order.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">
          Tell us about your cake and we&apos;ll come back to you within 24 hours. If you&apos;d
          rather chat first, get in touch and we&apos;ll take it from there.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href="/order">Start your order</ButtonLink>
          <ButtonLink href="/faq" variant="ghost">
            Read the FAQ
          </ButtonLink>
        </div>

        <dl className="mt-16 max-w-md divide-y divide-rule border-y border-rule">
          <div className="flex justify-between py-3">
            <dt className="text-ink-soft">Based in</dt>
            <dd>Durban, South Africa</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink-soft">WhatsApp &amp; Instagram</dt>
            <dd className="text-right text-ink-soft">Shared once you start an order</dd>
          </div>
        </dl>
      </SectionA>
    </Reveal>
  );
}
