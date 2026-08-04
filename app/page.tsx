import { Hero } from "@/components/hero";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { PhotoPlate } from "@/components/photo-plate";
import { ButtonLink } from "@/components/button";
import { flavours } from "@/content/data/flavours";
import { photos } from "@/content/data/photos";
import { formatPriceFrom, PRICE_CONFIRM_NOTE } from "@/lib/pricing";
import { sizes } from "@/content/data/sizes";

const steps = [
  {
    title: "Tell us about your cake",
    body: "Occasion, date, size or servings, flavour, and the design you have in mind — one step at a time.",
  },
  {
    title: "We come back to you",
    body: "Within 24 hours, with a quote based on what you've told us. Nothing's locked in yet.",
  },
  {
    title: "We confirm together",
    body: "Once you're happy, we lock in the date and get baking.",
  },
];

const mostRequested = flavours.filter((f) => f.mostRequested);
const featuredPhotos = photos.slice(0, 6);
const startingPrice = Math.min(...sizes.map((s) => s.priceFrom));

export default function HomePage() {
  return (
    <>
      <Hero />

      <Reveal>
        <SectionA eyebrow="What we make">
          <h2 className="max-w-2xl font-display text-2xl font-medium">
            Celebration cakes, wedding cakes, cupcakes, and a full line of signature confections.
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {featuredPhotos.map((photo, i) => (
              <PhotoPlate key={photo.id} photo={photo} priority={i === 0} />
            ))}
          </div>
          <p className="mt-8 text-ink-soft">
            Cakes start from {formatPriceFrom(startingPrice)}. {PRICE_CONFIRM_NOTE}
          </p>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA eyebrow="How ordering works" className="bg-icing">
          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title}>
                <p className="label text-ink-soft">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-xl font-medium">{step.title}</h3>
                <p className="mt-2 text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA eyebrow="Most requested">
          <h2 className="max-w-2xl font-display text-2xl font-medium">A few favourites to start from.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {mostRequested.map((flavour) => (
              <div key={flavour.id} className="border-b border-rule pb-8">
                <h3 className="font-display text-lg font-medium">{flavour.name}</h3>
                <p className="text-sm text-ink-soft">{flavour.filling}</p>
                <p className="mt-2 text-ink-soft">{flavour.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <ButtonLink href="/cakes">See all 14 flavours</ButtonLink>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="text-center">
          <h2 className="mx-auto max-w-xl font-display text-2xl font-medium">
            Nothing&apos;s locked in yet — we&apos;ll confirm everything with you first.
          </h2>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/order">Start your order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
