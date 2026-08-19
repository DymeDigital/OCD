import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button";
import { SocialIcons, socialIconMarks } from "@/components/social-icons";
import { socialLinks } from "@/content/data/socialLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch, or start your order directly.",
};

export default function ContactPage() {
  return (
    <Reveal>
      <SectionA eyebrow="Contact" className="text-center">
        <h1 className="mx-auto max-w-2xl font-display text-2xl font-medium">
          The fastest way to reach us is to start your order.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
          Tell us about your cake and we&apos;ll come back to you within 24 hours. If you&apos;d
          rather chat first, get in touch and we&apos;ll take it from there.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/order">Start your order</ButtonLink>
          <ButtonLink href="/faq" variant="ghost">
            Read the FAQ
          </ButtonLink>
        </div>

        <dl className="mx-auto mt-16 max-w-md text-left divide-y divide-rule border-y border-rule">
          <div className="flex justify-between py-3">
            <dt className="text-ink-soft">Based in</dt>
            <dd>Durban, South Africa</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink-soft">WhatsApp</dt>
            <dd>
              <a
                href={socialLinks.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-ink-soft"
              >
                <span className="block h-4 w-4 text-ink-soft" aria-hidden>
                  {socialIconMarks.whatsapp}
                </span>
                {socialLinks.whatsappNumber}
              </a>
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink-soft">Email</dt>
            <dd>
              <a href={`mailto:${socialLinks.email}`} className="hover:text-ink-soft">
                {socialLinks.email}
              </a>
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-ink-soft">Follow along</dt>
            <dd>
              <SocialIcons />
            </dd>
          </div>
        </dl>
      </SectionA>
    </Reveal>
  );
}
