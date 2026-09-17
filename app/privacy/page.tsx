import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { socialLinks } from "@/content/data/socialLinks";

// DRAFT — pending legal review. This is a plain-language POPIA-oriented notice written to cover
// what the order form actually collects (CLAUDE.md §9), not a lawyer-reviewed policy. Flag to the
// client before treating this as final.

export const metadata: Metadata = {
  title: "Privacy",
  description: "What we collect when you order from OCD, and how we use it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="Privacy">
          <h1 className="max-w-2xl font-display text-2xl font-medium">
            What happens to your information.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            We only collect what we need to quote, confirm and deliver your order. Here&apos;s
            exactly what that is, and how it&apos;s used.
          </p>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="pt-0" id="what-we-collect">
          <h2 className="font-display text-xl font-medium">What we collect</h2>
          <div className="mt-6 max-w-2xl space-y-4 border-t border-rule pt-6 text-ink-soft">
            <p>
              When you submit an order request through our website, we collect your name, contact
              number, email address (if given), delivery or collection details, and the details of
              what you&apos;re ordering — occasion, date, size, flavours, design brief and any
              reference photos you upload.
            </p>
            <p>
              For wedding orders, we also collect partner names, venue and venue contact details,
              and planner or coordinator details where relevant.
            </p>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="pt-0" id="why-we-collect-it">
          <h2 className="font-display text-xl font-medium">Why we collect it</h2>
          <div className="mt-6 max-w-2xl space-y-4 border-t border-rule pt-6 text-ink-soft">
            <p>
              We use your information to quote, confirm and deliver your order, and to contact you
              — usually over WhatsApp or email — about your order specifically. We don&apos;t use it
              for anything beyond that, and we don&apos;t send marketing messages unless you&apos;ve
              asked us to.
            </p>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="pt-0" id="who-sees-it">
          <h2 className="font-display text-xl font-medium">Who sees it</h2>
          <div className="mt-6 max-w-2xl space-y-4 border-t border-rule pt-6 text-ink-soft">
            <p>
              Your order details are seen by OCD only. We use a small number of service providers
              to run the site and process orders — an email provider (Resend) to send order
              notifications, and Cloudflare to host the site and store order records and reference
              photos. These providers process your information on our behalf; they don&apos;t use it
              for their own purposes, and we don&apos;t sell or share it with anyone else.
            </p>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="pt-0" id="how-long-we-keep-it">
          <h2 className="font-display text-xl font-medium">How long we keep it</h2>
          <div className="mt-6 max-w-2xl space-y-4 border-t border-rule pt-6 text-ink-soft">
            <p>
              We keep your order record, including any reference photos, for as long as we need it
              to fulfil your order and handle anything that comes up afterwards, such as a query
              about a past order.
            </p>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="pt-0" id="your-rights">
          <h2 className="font-display text-xl font-medium">Your rights</h2>
          <div className="mt-6 max-w-2xl space-y-4 border-t border-rule pt-6 text-ink-soft">
            <p>
              You can ask us what information we hold about you, ask us to correct it, or ask us to
              delete it, at any time. Get in touch over{" "}
              <a href={socialLinks.whatsappUrl} className="text-ink underline hover:no-underline">
                WhatsApp
              </a>{" "}
              or{" "}
              <a href={`mailto:${socialLinks.email}`} className="text-ink underline hover:no-underline">
                email
              </a>{" "}
              and we&apos;ll sort it out.
            </p>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
