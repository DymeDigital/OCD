import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button";
import { AutoCarousel } from "@/components/auto-carousel";
import { flavours } from "@/content/data/flavours";
import { sizes, sizesFootnote } from "@/content/data/sizes";
import { photos } from "@/content/data/photos";
import { formatRange, PRICE_CONFIRM_NOTE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Cakes",
  description:
    "Bespoke celebration cakes in Durban, KwaZulu-Natal — fourteen flavours, six tiers of scale, and pricing that starts from a real number.",
  alternates: { canonical: "/cakes" },
};

const cakeFlavours = flavours.filter((f) => f.category === "cake" || f.category === "both");
const cakePhotos = photos.filter((p) => p.category === "cake" && p.hero).slice(0, 5);

export default function CakesPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="Cakes" className="text-center md:text-left">
          <div className="grid gap-10 md:grid-cols-[1fr_260px] md:items-center">
            <div>
              <h1 className="mx-auto max-w-2xl font-display text-xl font-medium md:mx-0 md:text-2xl">
                Fourteen flavours. Six tiers of scale. One quote, built around your event.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base text-ink-soft md:mx-0 md:text-lg">
                Pick a flavour below, or start your order and tell us your guest count —
                we&apos;ll help you land on the right size.
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                <ButtonLink href="/order">Start your order</ButtonLink>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[260px]">
              <AutoCarousel photos={cakePhotos} href="/gallery?category=cake" hrefLabel="View cake gallery" />
              <ButtonLink href="/gallery?category=cake" variant="ghost" className="mt-4 w-full justify-center">
                View gallery
              </ButtonLink>
            </div>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="bg-icing">
          <h2 className="font-display text-xl font-medium">Flavours</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2">
            {cakeFlavours.map((flavour) => (
              <div key={flavour.id}>
                <h3 className="font-display text-lg font-medium">{flavour.name}</h3>
                <p className="text-sm text-ink-soft">{flavour.filling}</p>
                <p className="mt-2 text-ink-soft">{flavour.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/order">Start your order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA>
          <h2 className="font-display text-xl font-medium">Sizes &amp; servings</h2>
          <p className="mt-3 max-w-xl text-ink-soft">{sizesFootnote}</p>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-ink text-left">
                  <th className="label py-3 pr-4 font-normal text-ink-soft">Tier</th>
                  <th className="label py-3 pr-4 font-normal text-ink-soft">Sizes</th>
                  <th className="label py-3 font-normal text-ink-soft">Servings</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s) => (
                  <tr key={s.id} className="border-b border-rule">
                    <td className="py-3 pr-4">{s.tierLabel}</td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {s.sizesCm.map((cm) => `${cm}cm`).join(", ")}
                      {s.layersNote ? ` (${s.layersNote})` : ""}
                    </td>
                    <td className="py-3 text-ink-soft">
                      {s.servingsMin}–{s.servingsMax}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Cakes from {formatRange(Math.min(...sizes.map((s) => s.priceFrom)), Math.max(...sizes.map((s) => s.priceFrom)))}.{" "}
            {PRICE_CONFIRM_NOTE}
          </p>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="text-center">
          <h2 className="mx-auto max-w-xl font-display text-2xl font-medium">
            Have a theme in mind? Tell us about it.
          </h2>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/order">Start your order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
