import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Reference photos uploaded on the order forms (CLAUDE.md §9) live in the ORDER_PHOTOS R2
    // bucket and are served from its public r2.dev URL — see lib/order-store.ts.
    remotePatterns: [{ protocol: "https", hostname: "*.r2.dev" }],
  },
};

export default nextConfig;

// Wires the Cloudflare bindings (R2/KV/Images) into `next dev` via Miniflare, so
// getCloudflareContext() works locally without a full `opennextjs-cloudflare build`.
import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) =>
  initOpenNextCloudflareForDev()
);
