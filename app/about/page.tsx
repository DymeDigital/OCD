import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button";
import { AutoCarousel } from "@/components/auto-carousel";
import { Disclosure, DisclosureTrigger, DisclosureContent } from "@/components/expandable";
import { ReviewsSection } from "@/components/reviews-section";
import { aboutPhotos } from "@/content/data/photos";

export const metadata: Metadata = {
  title: "About",
  description: "Who's behind OCD, and how we work.",
};

export default function AboutPage() {
  return (
    <>
      <Reveal>
        <SectionA eyebrow="About" className="pb-12 text-center md:pb-16">
          <h1 className="mx-auto max-w-2xl font-display text-2xl font-medium">
            Where culinary craft meets creative obsession.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
            Behind OCD are Darrel Rhyce and Melissa Chetty, a husband-and-wife team who bring two
            very different strengths together to create something uniquely ours.
          </p>
        </SectionA>
      </Reveal>

      <Disclosure>
        <Reveal>
          <SectionA className="pt-0 pb-0 md:pb-0">
            <div className="grid gap-x-12 gap-y-6 md:grid-cols-[380px_1fr] md:items-start">
              <div className="md:col-start-1 md:row-start-1">
                <AutoCarousel photos={aboutPhotos} intervalMs={5000} />
              </div>
              <div className="md:col-start-2 md:row-start-1 md:row-span-2">
                <h2 className="font-display text-xl font-medium">Darrel</h2>
                <p className="mt-3 text-ink-soft">
                  A qualified chef, Darrel brings the culinary foundation to OCD. With a
                  background rooted in hospitality, training and professional culinary practice,
                  his approach is centred around flavour, quality and consistency. From
                  developing flavour combinations to ensuring every element meets the standards
                  we set for our brand, Darrel is often the person behind the scenes making sure
                  that what looks beautiful tastes just as good.
                </p>
                <h2 className="mt-10 font-display text-xl font-medium">Melissa</h2>
                <p className="mt-3 text-ink-soft">
                  Our cake designer and the creative force behind OCD, Melissa brings the
                  artistry. With an eye for detail and a passion for creating statement pieces,
                  Mel transforms ideas, inspirations and sometimes just a few words from a client
                  into beautifully crafted cakes. From intricate piping and elegant finishes to
                  bespoke wedding cakes and completely custom designs, her work is where
                  creativity comes to life.
                </p>
                <p className="mt-10 text-lg text-ink-soft">
                  Together, we believe that a cake should be more than something beautiful on a
                  dessert table. It should be an experience.
                </p>
              </div>
              <DisclosureTrigger
                collapsedLabel="More about us"
                className="w-full justify-center md:col-start-1 md:row-start-2"
              />
            </div>
          </SectionA>
        </Reveal>

        <div className="mx-auto max-w-[1280px] bg-icing">
          <DisclosureContent>
            <div className="px-6 py-16 text-center md:px-12 md:py-24">
              <div className="mx-auto max-w-2xl space-y-4 text-sm text-ink-soft">
                <p>
                  At OCD, we specialise in bespoke celebration and wedding cakes, cupcakes,
                  macarons, sugar cookies and curated desserts, with every creation made to feel
                  personal to the occasion and the people celebrating it.
                </p>
                <p>
                  We don&apos;t believe in taking a one-size-fits-all approach. Every order
                  begins with understanding the vision, the occasion and the little details that
                  matter. We then combine thoughtful design with carefully crafted flavours and
                  meticulous finishing to create something that feels distinctly yours.
                </p>
                <p>
                  Our philosophy is simple: exceptional ingredients, considered design,
                  meticulous craftsmanship and flavours worth coming back for.
                </p>
                <p>
                  From an intimate celebration to a grand wedding, we approach every creation
                  with the same level of care — because whether we&apos;re making ten cupcakes or
                  a spectacular multi-tiered wedding cake, your occasion deserves our obsession.
                </p>
              </div>
            </div>
          </DisclosureContent>
        </div>
      </Disclosure>

      <Reveal>
        <SectionA className="pb-12 md:pb-16">
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
        <ReviewsSection className="pt-0" />
      </Reveal>

      <Reveal>
        <SectionA className="bg-icing text-center">
          <p className="label text-ink-soft">On record</p>
          <dl className="mx-auto mt-6 max-w-lg text-left divide-y divide-rule border-y border-rule">
            <div className="flex justify-between py-3">
              <dt className="text-ink-soft">Trading as</dt>
              <dd>Obsessive Cupcake Disorder (OCD)</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-ink-soft">Established</dt>
              <dd>2017</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-ink-soft">Registered entity</dt>
              <dd>Obsessive Cupcake Disorder (Pty) Ltd, 2021</dd>
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
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/order">Start your order</ButtonLink>
            <ButtonLink href="/gallery" variant="ghost">
              See what we make
            </ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
