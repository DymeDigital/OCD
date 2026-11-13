import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  // Lets an /admin save refresh just the affected cached pages (revalidatePath), so the public
  // pages stay static — well inside the Workers Free CPU limit — instead of rendering per visit.
  tagCache: d1NextTagCache,
});
