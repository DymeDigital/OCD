import { Hero } from "@/components/hero";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { PhotoPlate } from "@/components/photo-plate";
import { ButtonLink } from "@/components/button";
import { ReviewsSection } from "@/components/reviews-section";
import { flavours } from "@/content/data/flavours";
import { photos } from "@/content/data/photos";
import { formatPriceFrom, PRICE_CONFIRM_NOTE } from "@/lib/pricing";
import { sizes } from "@/content/data/sizes";

const whyOcd = [
  {
    title: "Designed, not decorated.",
    body: "Every bespoke cake starts with a concept and is created around the occasion.",
  },
  {
    title: "Flavour matters.",
    body: "We believe a cake should taste just as good as it looks.",
  },
  {
    title: "Made with intention.",
    body: "Every element is carefully considered, from the flavour and structure to the final finish.",
  },
  {
    title: "Bespoke by nature.",
    body: "Our cakes are created around each client's requirements rather than simply choosing from a catalogue.",
  },
  {
    title: "Premium ingredients.",
    body: "We believe great ingredients are an important part of creating a great cake.",
  },
];

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
// Curated, not slice(0, 6): the headline promises cakes, wedding cakes and cupcakes, so the grid
// should show more than birthday cakes. Interleaved so the wedding shots don't clump together.
const featuredPhotoIds = [
  "mermaid",
  "wedding-pearl-two-tier",
  "birthday-albums",
  "wedding-ombre-red-roses",
  "skyline-30th",
  "wedding-watercolor-blue",
];
const featuredPhotos = featuredPhotoIds.map((id) => photos.find((p) => p.id === id)!);
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
            Chat to us about your design and we&apos;ll give you a quote based on your requirements.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/order">Start your cake or cupcake order</ButtonLink>
            <ButtonLink href="/order/wedding" variant="ghost">
              Start your wedding order
            </ButtonLink>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA eyebrow="Why OCD?">
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {whyOcd.map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
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
          <div className="mt-12 flex flex-wrap gap-4">
            <ButtonLink href="/order">Start your cake or cupcake order</ButtonLink>
            <ButtonLink href="/order/wedding" variant="ghost">
              Start your wedding order
            </ButtonLink>
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
        <ReviewsSection className="bg-icing" />
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
