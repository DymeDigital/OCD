import type { MetadataRoute } from "next";

const BASE_URL = "https://obsessivecupcakedisorder.co.za";

// Public marketing + order-intake routes only (CLAUDE.md §7). Excludes /order/thank-you and
// /o/[token] — transactional/private pages, not meant for indexing.
const routes = [
  "/",
  "/cakes",
  "/cupcakes",
  "/weddings",
  "/gallery",
  "/order",
  "/order/wedding",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
