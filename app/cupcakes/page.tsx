import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button";
import { flavours } from "@/content/data/flavours";
import { confections, cupcakeBase } from "@/content/data/confections";
import { formatPriceFrom, PRICE_CONFIRM_NOTE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Cupcakes & Confections",
  description: "Gourmet cupcakes with Swiss meringue buttercream, plus the full Signature Confections line.",
};

const cupcakeFlavours = flavours.filter((f) => f.category === "cupcake" || f.category === "both");

export default function CupcakesPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="Cupcakes & confections">
          <h1 className="max-w-2xl font-display text-2xl font-medium">
            Gourmet cupcakes, and a full line of signature confections.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">{cupcakeBase.description}</p>
          <p className="mt-4 text-ink-soft">
            {formatPriceFrom(cupcakeBase.priceFrom)} per {cupcakeBase.unit}. {PRICE_CONFIRM_NOTE}
          </p>
          <div className="mt-8">
            <ButtonLink href="/order">Start your order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="bg-icing">
          <h2 className="font-display text-xl font-medium">Cupcake flavours</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2">
            {cupcakeFlavours.map((flavour) => (
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
          <h2 className="font-display text-xl font-medium">Signature Confections</h2>
          <p className="mt-3 max-w-xl text-ink-soft">
            Cake pops, cakesicles, macarons, cheesecakes and more — add any of these to a cake or
            cupcake order, or order them on their own.
          </p>
          <div className="mt-10 divide-y divide-rule border-t border-rule">
            {confections.map((c) => (
              <div key={c.id} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div className="sm:max-w-xl">
                  <h3 className="font-medium">{c.name}</h3>
                  <p className="text-sm text-ink-soft">{c.description}</p>
                  {c.subOptions && (
                    <p className="mt-1 text-sm text-ink-soft">
                      {c.subOptions.map((o) => o.label).join(" · ")}
                    </p>
                  )}
                </div>
                <p className="whitespace-nowrap text-ink-soft sm:text-ink">
                  {c.isFromPrice ? formatPriceFrom(c.priceFrom) : `R${c.priceFrom}`} for {c.unit}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-soft">{PRICE_CONFIRM_NOTE}</p>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="text-center">
          <h2 className="mx-auto max-w-xl font-display text-2xl font-medium">
            Mix and match — cupcakes, cake, and a table full of confections.
          </h2>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/order">Start your order</ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
