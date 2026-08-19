import { SectionA } from "@/components/register-a";
import { ButtonLink } from "@/components/button";
import { reviews } from "@/content/data/reviews";
import { socialLinks } from "@/content/data/socialLinks";

export function ReviewsSection({ className = "" }: { className?: string }) {
  return (
    <SectionA eyebrow="What our clients say" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden>
              <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.5 1.3 6.6L12 17l-5.9 3.4 1.3-6.6-4.9-4.5 6.6-.7L12 2.5Z" />
            </svg>
            <p className="font-display text-4xl font-medium">{socialLinks.googleRating}</p>
          </div>
          <p className="mt-1 text-ink-soft">
            From {socialLinks.googleReviewCount} Google reviews
          </p>
        </div>
        <ButtonLink href={socialLinks.googleReviewsUrl} variant="ghost" external>
          View all Google reviews
        </ButtonLink>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.name} className="border-b border-rule pb-8">
            <p className="text-ink-soft">&ldquo;{review.quote}&rdquo;</p>
            <p className="mt-4 font-medium">{review.name}</p>
          </div>
        ))}
      </div>
    </SectionA>
  );
}
