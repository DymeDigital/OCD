import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { PhotoPlate } from "@/components/photo-plate";
import { ButtonLink } from "@/components/button";
import { ReviewsSection } from "@/components/reviews-section";
import { flavours } from "@/content/data/flavours";
import { photos as defaultPhotos } from "@/content/data/photos";
import { getContent } from "@/lib/cms/store";

// Title/description are inherited from the root layout's default — already locality/keyword-rich
// (mentions Durban, South Africa and every product line). Only the canonical needs setting here.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Client-requested 2026-10-30: everything below the hero reworked to read more premium — real
// headings instead of an eyebrow over every section, no ruled lines (Register A, §5), bigger
// photography, and the two order buttons shown once rather than three times.

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

// One photo per line of work, each leading to its own page. The middle plate sits lower on
// desktop so the three read as a spread rather than a row of tiles. Which photo sits on each
// plate is editable in /admin (homeFeatures); the copy is not.
const lines = [
  {
    title: "Celebration cakes",
    body: "From a mini cake to six tiers, designed around your occasion.",
    href: "/cakes",
    linkLabel: "See celebration cakes",
  },
  {
    title: "Wedding cakes",
    body: "Tall, considered and finished by hand for the day itself.",
    href: "/weddings",
    linkLabel: "See wedding cakes",
  },
  {
    title: "Cupcakes & confections",
    body: "By the dozen, alongside cake pops, cookies, macarons and more.",
    href: "/cupcakes",
    linkLabel: "See cupcakes",
  },
];

const mostRequested = flavours.filter((f) => f.mostRequested);

const textLink =
  "font-medium text-ink underline decoration-ink/40 decoration-1 underline-offset-4 transition-colors hover:decoration-ink";

export default async function HomePage() {
  const [photos, featureIds] = await Promise.all([getContent("photos"), getContent("homeFeatures")]);
  // The admin won't save a home page pointing at a missing photo; the default library is only a
  // last-resort fallback so a bad stored value can never blank a plate.
  const plates = lines.map((line, i) => ({
    ...line,
    photo: photos.find((p) => p.id === featureIds[i]) ?? defaultPhotos.find((p) => p.id === featureIds[i]) ?? photos[i],
  }));

  return (
    <>
      <Hero />

      <Reveal>
        <SectionA>
          <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-12">
            <h2 className="font-display text-xl font-normal md:col-span-7 md:text-2xl">
              Cakes, cupcakes and confections, made to the millimetre.
            </h2>
            <p className="max-w-sm text-ink-soft md:col-span-4 md:col-start-9">
              Tell us about your occasion and we&apos;ll design around it, then quote you on what you
              actually need.
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8">
            {plates.map((line, i) => (
              <div key={line.title} className={i === 1 ? "md:mt-20" : undefined}>
                <PhotoPlate photo={line.photo} priority={i === 0} />
                <h3 className="mt-6 font-display text-lg font-normal">{line.title}</h3>
                <p className="mt-2 max-w-xs text-ink-soft">{line.body}</p>
                <Link href={line.href} className={`mt-4 inline-block ${textLink}`}>
                  {line.linkLabel}
                </Link>
              </div>
            ))}
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA>
          <div className="grid gap-12 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-5">
              <div className="md:sticky md:top-32">
                <h2 className="font-display text-xl font-normal md:text-2xl">Fussy about every detail.</h2>
                <p className="mt-4 max-w-sm text-ink-soft">
                  It&apos;s in the name. Here&apos;s what that means for your cake.
                </p>
              </div>
            </div>
            <div className="space-y-12 md:col-span-6 md:col-start-7">
              {whyOcd.map((item) => (
                <div key={item.title}>
                  <h3 className="font-display text-lg font-normal">{item.title}</h3>
                  <p className="mt-2 max-w-md text-ink-soft">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        {/* Full-bleed icing band — the one tinted section, so the steps read as their own moment. */}
        <div className="bg-icing">
          <SectionA>
            <h2 className="max-w-xl font-display text-xl font-normal md:text-2xl">Ordering takes one sitting.</h2>
            <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <p className="font-display text-3xl font-light leading-none text-ink" aria-hidden>
                    {i + 1}
                  </p>
                  <h3 className="mt-6 font-display text-lg font-normal">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-16 flex flex-wrap gap-4">
              <ButtonLink href="/order">Start your cake or cupcake order</ButtonLink>
              <ButtonLink href="/order/wedding" variant="ghost">
                Start your wedding order
              </ButtonLink>
            </div>
          </SectionA>
        </div>
      </Reveal>

      <Reveal>
        <SectionA>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-xl font-display text-xl font-normal md:text-2xl">Our most requested flavours.</h2>
            <Link href="/cakes" className={textLink}>
              See all 14 flavours
            </Link>
          </div>
          <div className="mt-16 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {mostRequested.map((flavour) => (
              <div key={flavour.id}>
                <h3 className="font-display text-lg font-normal">{flavour.name}</h3>
                <p className="mt-1 font-display text-sm italic text-ink-soft">{flavour.filling}</p>
                <p className="mt-3 max-w-md text-ink-soft">{flavour.description}</p>
              </div>
            ))}
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <ReviewsSection />
      </Reveal>

      <Reveal>
        <SectionA className="text-center">
          <h2 className="mx-auto max-w-3xl font-display text-xl font-normal md:text-2xl lg:text-3xl">
            Nothing&apos;s locked in yet — we&apos;ll confirm everything with you first.
          </h2>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/order">Start your order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
