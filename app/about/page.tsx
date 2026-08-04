import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { PhotoPlate } from "@/components/photo-plate";
import { ButtonLink } from "@/components/button";
import { photos } from "@/content/data/photos";

export const metadata: Metadata = {
  title: "About",
  description: "Who's behind OCD, and how we work.",
};

const aboutPhoto = photos.find((p) => p.id === "sweet18-white")!;

export default function AboutPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="About">
          <h1 className="max-w-2xl font-display text-2xl font-medium">
            A cake studio that doesn&apos;t leave things to chance.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Obsessive Cupcake Disorder (OCD) is a Durban cake and confection studio. The name is
            the joke — precision, symmetry, neat piping, everything measured — the standard
            behind it isn&apos;t.
          </p>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="pt-0">
          <PhotoPlate photo={aboutPhoto} />
          <p className="mt-4 text-sm text-ink-soft">
            Every petal on this finish was piped and placed by hand.
          </p>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="bg-icing">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-medium">In the kitchen</h2>
              <p className="mt-3 text-ink-soft">
                Premium Belgian cocoa and Callebaut chocolate, real vanilla bean, and fourteen
                flavours held to a written description precise enough to be a recipe. Sizes are
                never guessed at — we advise against your exact serving count, because a size
                chart is a starting point, not a rule that overrides your event.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-medium">After it leaves</h2>
              <p className="mt-3 text-ink-soft">
                Every cake ships with the same instructions, followed exactly: lifted from the
                base only, kept level through transport, driven directly with no harsh braking.
                Left too cold, a butter-based sponge turns dense — so storage and serving
                temperature are treated as part of the recipe, not an afterthought.
              </p>
            </div>
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA>
          <p className="label text-ink-soft">On record</p>
          <dl className="mt-6 max-w-lg divide-y divide-rule border-y border-rule">
            <div className="flex justify-between py-3">
              <dt className="text-ink-soft">Trading as</dt>
              <dd>Obsessive Cupcake Disorder (OCD)</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-ink-soft">Registered entity</dt>
              <dd>Obsessive Cupcake Disorder (Pty) Ltd</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-ink-soft">Registration no.</dt>
              <dd className="font-mono">2021/623273/07</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-ink-soft">Based in</dt>
              <dd>Durban, South Africa</dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/order">Start your order</ButtonLink>
            <ButtonLink href="/cakes" variant="ghost">
              See what we make
            </ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
