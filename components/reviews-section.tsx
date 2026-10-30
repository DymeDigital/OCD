import { SectionA } from "@/components/register-a";
import { ButtonLink } from "@/components/button";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { reviews } from "@/content/data/reviews";
import { socialLinks } from "@/content/data/socialLinks";

// Register A: no ruled lines. Quotes are verbatim (content/data/reviews.ts), shown in full one at a
// time in components/reviews-carousel.tsx, never trimmed.
export function ReviewsSection({ className = "" }: { className?: string }) {
  return (
    <SectionA className={className}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-xl font-normal md:text-2xl">What our clients say.</h2>
          <p className="mt-4 flex items-center gap-2 text-ink-soft">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-ink" aria-hidden>
              <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.5 1.3 6.6L12 17l-5.9 3.4 1.3-6.6-4.9-4.5 6.6-.7L12 2.5Z" />
            </svg>
            <span>
              <span className="font-medium text-ink">{socialLinks.googleRating}</span> from{" "}
              {socialLinks.googleReviewCount} Google reviews
            </span>
          </p>
        </div>
        <ButtonLink href={socialLinks.googleReviewsUrl} variant="ghost" external>
          View all Google reviews
        </ButtonLink>
      </div>

      <div className="mt-16 md:mt-20">
        <ReviewsCarousel reviews={reviews} />
      </div>
    </SectionA>
  );
}
