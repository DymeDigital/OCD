import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ocdcakes.co.za"),
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
  },
};

const bakerySchema = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "Obsessive Cupcake Disorder",
  alternateName: "OCD",
  slogan: "It will have you in a frenzy.",
  areaServed: "Durban, South Africa",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Durban",
    addressRegion: "KwaZulu-Natal",
    addressCountry: "ZA",
  },
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
      </body>
    </html>
  );
}
