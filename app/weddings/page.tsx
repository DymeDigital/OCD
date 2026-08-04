import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { PhotoPlate } from "@/components/photo-plate";
import { ButtonLink } from "@/components/button";
import { photos } from "@/content/data/photos";
import { weddingTerms } from "@/content/data/terms";

export const metadata: Metadata = {
  title: "Weddings",
  description: "Wedding cakes, designed around your day — with the lead time and care a wedding cake needs.",
};

const weddingPhotos = photos.filter((p) => p.category === "wedding");

export default function WeddingsPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="Weddings">
          <h1 className="max-w-2xl font-display text-2xl font-medium">
            A wedding cake, designed around your day.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Wedding cakes get their own process — more design time, a dedicated form, and terms
            built for a day that can&apos;t move. We&apos;ll talk through tiers, flavours per
            tier, and how it all comes together on the table.
          </p>
          <div className="mt-8">
            <ButtonLink href="/order/wedding">Start your wedding order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="pt-0">
          <div className="grid gap-4 sm:grid-cols-2">
            {weddingPhotos.map((photo, i) => (
              <PhotoPlate key={photo.id} photo={photo} priority={i === 0} />
            ))}
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="bg-icing">
          <h2 className="font-display text-xl font-medium">What to expect</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-medium">Tell us the details</h3>
              <p className="mt-2 text-ink-soft">
                Guest count, tiers, flavours per tier, venue, and the design you have in mind —
                reference images included.
              </p>
            </div>
            <div>
              <h3 className="font-medium">We confirm the design</h3>
              <p className="mt-2 text-ink-soft">
                Design changes inside {weddingTerms.designChangeDeadlineDays} days of the wedding
                may carry additional charges, so we lock in details early.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Delivery &amp; setup</h3>
              <p className="mt-2 text-ink-soft">{weddingTerms.deliveryPricing}</p>
            </div>
          </div>
          <p className="mt-10 text-sm text-ink-soft">
            Wondering about a tasting before you commit? Ask us when you get in touch — we&apos;ll
            let you know what&apos;s available.
          </p>
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
