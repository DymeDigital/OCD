import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /o/[token] pages already set `noindex` individually — this is belt-and-braces.
      disallow: "/o/",
    },
    sitemap: "https://obsessivecupcakedisorder.co.za/sitemap.xml",
  };
}
