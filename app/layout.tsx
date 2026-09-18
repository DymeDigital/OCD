import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialRail } from "@/components/social-rail";
import { socialLinks } from "@/content/data/socialLinks";
import { reviews } from "@/content/data/reviews";
import { sizes } from "@/content/data/sizes";
import { formatZAR } from "@/lib/pricing";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://obsessivecupcakedisorder.co.za"),
  alternates: { canonical: "/" },
  title: {
    default: "Obsessive Cupcake Disorder — Bespoke cakes, cupcakes & confections",
    template: "%s — OCD",
  },
  description:
    "OCD (Obsessive Cupcake Disorder) makes bespoke celebration cakes, cupcakes, wedding cakes and signature confections in Durban, South Africa. Tell us about your cake — we'll come back to you within 24 hours.",
  openGraph: {
    title: "Obsessive Cupcake Disorder",
    description: "Bespoke cakes, cupcakes and signature confections, made to order in Durban.",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        // JPEG, not the site's usual WebP — several link-preview crawlers (WhatsApp, iMessage,
        // older Facebook/Slack scrapers) don't reliably fetch WebP for og:image. The real OCD logo
        // mark, centered on white with generous margin — matches the site's actual white/black,
        // logo-forward look (§5), rather than an arbitrary product photo.
        url: "/images/og-logo.jpg",
        width: 1200,
        height: 630,
        alt: "The OCD (Obsessive Cupcake Disorder) logo — \"it will have you in a frenzy\"",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsessive Cupcake Disorder",
    description: "Bespoke cakes, cupcakes and signature confections, made to order in Durban.",
    images: ["/images/og-logo.jpg"],
  },
};

const sizePrices = sizes.map((s) => s.priceFrom);
const priceRange = `R${formatZAR(Math.min(...sizePrices))} - R${formatZAR(Math.max(...sizePrices))}`;

const bakerySchema = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "Obsessive Cupcake Disorder",
  alternateName: "OCD",
  slogan: "It will have you in a frenzy.",
  image: "https://obsessivecupcakedisorder.co.za/images/og-logo.jpg",
  areaServed: "Durban, South Africa",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Durban",
    addressRegion: "KwaZulu-Natal",
    addressCountry: "ZA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: socialLinks.geoLat,
    longitude: socialLinks.geoLng,
  },
  priceRange,
  sameAs: [socialLinks.instagram, socialLinks.facebook, socialLinks.tiktok, socialLinks.googleReviewsUrl],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: socialLinks.googleRating,
    reviewCount: socialLinks.googleReviewCount,
  },
  review: reviews.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    reviewBody: r.quote,
  })),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col bg-paper text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bakerySchema) }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <SocialRail />
      </body>
    </html>
  );
}
