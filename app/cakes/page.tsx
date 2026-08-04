import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button";
import { flavours } from "@/content/data/flavours";
import { sizes, sizesFootnote } from "@/content/data/sizes";
import { formatRange, formatPriceFrom, PRICE_CONFIRM_NOTE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Cakes",
  description: "Fourteen flavours, six tiers of scale, and pricing that starts from a real number.",
};

const cakeFlavours = flavours.filter((f) => f.category === "cake" || f.category === "both");

export default function CakesPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="Cakes">
          <h1 className="max-w-2xl font-display text-2xl font-medium">
            Fourteen flavours. Six tiers of scale. One quote, built around your event.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Pick a flavour below, or start your order and tell us your guest count — we&apos;ll
            help you land on the right size.
          </p>
          <div className="mt-8">
            <ButtonLink href="/order">Start your order</ButtonLink>
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
                  <th className="label py-3 pr-4 font-normal text-ink-soft">Servings</th>
                  <th className="label py-3 text-right font-normal text-ink-soft">From</th>
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
                    <td className="py-3 pr-4 text-ink-soft">
                      {s.servingsMin}–{s.servingsMax}
                    </td>
                    <td className="py-3 text-right">{formatPriceFrom(s.priceFrom)}</td>
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
