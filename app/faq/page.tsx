import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button";
import { FaqRow } from "@/components/faq-accordion";
import { faqCategories } from "@/content/data/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "The real terms, plainly stated — ordering, weddings, cupcakes, dietary requirements, delivery, cake care and payments.",
};

export default function FaqPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="FAQ">
          <h1 className="max-w-2xl font-display text-2xl font-medium">
            The real terms, plainly stated.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Everything you need to know about ordering from OCD — from bespoke cakes and weddings
            to cupcakes, signature confections, delivery and cake care.
          </p>
          <nav aria-label="Jump to a topic" className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {faqCategories.map((cat) => (
              <a key={cat.id} href={`#${cat.id}`} className="label text-ink-soft hover:text-ink">
                {cat.title}
              </a>
            ))}
          </nav>
        </SectionA>
      </Reveal>

      {faqCategories.map((cat) => (
        <Reveal key={cat.id}>
          <SectionA className="pt-0" id={cat.id}>
            <h2 className="font-display text-xl font-medium">{cat.title}</h2>
            <div className="mt-6 border-t border-rule">
              {cat.items.map((item) => (
                <FaqRow key={item.q} item={item} />
              ))}
            </div>
          </SectionA>
        </Reveal>
      ))}

      <Reveal>
        <SectionA className="pt-0 text-center">
          <div className="mx-auto max-w-xl border-t border-rule pt-16">
            <p className="label text-ink-soft">Still have a question?</p>
            <h2 className="mt-3 font-display text-xl font-medium">
              Tell us what you&apos;re dreaming up.
            </h2>
            <p className="mt-3 text-ink-soft">
              No problem. The easiest way to get started is to submit an online order request —
              tell us your preferred date and as much detail as possible, and we&apos;ll review it
              and get back to you.
            </p>
            <ButtonLink href="/order" className="mt-8">
              Start your order
            </ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
