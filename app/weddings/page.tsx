import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { AutoCarousel } from "@/components/auto-carousel";
import { ButtonLink } from "@/components/button";
import { photos } from "@/content/data/photos";
import { weddingTerms } from "@/content/data/terms";

export const metadata: Metadata = {
  title: "Weddings",
  description: "Wedding cakes, designed around your day — with the lead time and care a wedding cake needs.",
};

const weddingPhotos = photos.filter((p) => p.category === "wedding" && p.hero).slice(0, 6);

const process = [
  {
    title: "Submit your requirements",
    body: "Wedding date, venue, guest count, tiers, flavours, colours and theme, and any design inspiration — all in one form.",
  },
  {
    title: "We review your brief",
    body: "We read through everything you've shared and get a proper feel for your day before we design anything.",
  },
  {
    title: "Design & quote",
    body: "We put together a design direction and an indicative quote based on what you've told us.",
  },
  {
    title: "Confirmation",
    body: "Once you're happy, we lock in your date with a deposit.",
  },
  {
    title: "Cake creation",
    body: "We get baking, timed to land closer to your big day.",
  },
  {
    title: "Delivery or setup",
    body: "Delivered and set up on-site where applicable, so it's ready when you are.",
  },
];

export default function WeddingsPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="Weddings">
          <div className="grid gap-10 md:grid-cols-[1fr_260px] md:items-center">
            <div>
              <h1 className="max-w-2xl font-display text-2xl font-medium">
                A wedding cake, designed around your day.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-ink-soft">
                Wedding cakes get their own process — more design time, a dedicated form, and
                terms built for a day that can&apos;t move. We&apos;ll talk through tiers,
                flavours per tier, and how it all comes together on the table.
              </p>
              <div className="mt-8">
                <ButtonLink href="/order/wedding">Start your wedding order</ButtonLink>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[260px]">
              <AutoCarousel photos={weddingPhotos} href="/gallery?category=wedding" hrefLabel="View wedding cake gallery" />
              <ButtonLink href="/gallery?category=wedding" variant="ghost" className="mt-4 w-full justify-center">
                View gallery
              </ButtonLink>
            </div>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="bg-icing">
          <h2 className="font-display text-xl font-medium">How it works</h2>
          <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {process.map((step, i) => (
              <div key={step.title}>
                <p className="label text-ink-soft">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-medium">{step.title}</h3>
                <p className="mt-2 text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-ink-soft">
            Design changes inside {weddingTerms.designChangeDeadlineDays} days of the wedding may
            carry additional charges, so we lock in details early. {weddingTerms.deliveryPricing}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Wondering about a tasting before you commit? Ask us when you get in touch — we&apos;ll
            let you know what&apos;s available.
          </p>
          <div className="mt-10">
            <ButtonLink href="/order/wedding">Start your wedding order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="text-center">
          <h2 className="mx-auto max-w-xl font-display text-2xl font-medium">
            Ready to start planning your cake?
          </h2>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/order/wedding">Start your wedding order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
