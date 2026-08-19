import type { Metadata } from "next";
import { SectionA } from "@/components/register-a";
import { Reveal } from "@/components/reveal";
import { GalleryGrid, type GalleryFilter } from "@/components/gallery-grid";
import { ButtonLink } from "@/components/button";
import { photos } from "@/content/data/photos";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look through what we've made — cakes, cupcakes and wedding cakes, real orders, real occasions.",
};

const validFilters: GalleryFilter[] = ["all", "cake", "cupcakes", "wedding"];

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const initialFilter = validFilters.includes(category as GalleryFilter)
    ? (category as GalleryFilter)
    : "all";

  return (
    <>
      <Reveal>
        <SectionA eyebrow="Gallery" className="pb-0 text-center md:pb-0">
          <h1 className="mx-auto max-w-2xl font-display text-2xl font-medium">
            Our Creations.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
            Every cake here was made for someone&apos;s actual celebration. Have a browse, then
            tell us about yours.
          </p>
          <div className="mt-10 text-left">
            <GalleryGrid photos={photos} initialFilter={initialFilter} />
          </div>
        </SectionA>
      </Reveal>

      <Reveal>
        <SectionA className="text-center">
          <h2 className="mx-auto max-w-xl font-display text-2xl font-medium">
            See something close to what you have in mind?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/order">Start your cake order</ButtonLink>
            <ButtonLink href="/order/wedding" variant="ghost">
              Start your wedding order
            </ButtonLink>
          </div>
        </SectionA>
      </Reveal>
    </>
  );
}
