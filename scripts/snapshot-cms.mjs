// Writes lib/cms/snapshot.generated.json — the client's saved /admin content, read from the
// production D1 database — so `next build` prerenders pages with it instead of the static
// defaults (see getContent in lib/cms/store.ts). Without this, every redeploy would quietly put
// the original photos back until the next admin save.
//
//   node scripts/snapshot-cms.mjs           fetch from production (cf:build / cf:deploy)
//   node scripts/snapshot-cms.mjs --ensure  just make sure the file exists (dev / plain build)
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../lib/cms/snapshot.generated.json", import.meta.url));

if (process.argv.includes("--ensure")) {
  if (!existsSync(out)) writeFileSync(out, "{}\n");
  process.exit(0);
}

let raw;
try {
  raw = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "NEXT_TAG_CACHE_D1", "--remote", "--json", "--command", "SELECT key, value FROM cms_content"],
    { encoding: "utf8", shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] },
  );
} catch (err) {
  const text = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  // First deploy: nothing has been saved yet, so the table doesn't exist. Defaults are correct.
  if (/no such table/i.test(text)) {
    writeFileSync(out, "{}\n");
    console.log("[snapshot-cms] no saved content yet — building with the defaults");
    process.exit(0);
  }
  // Anything else (not logged in, offline, wrong database id) must stop the deploy: carrying on
  // would replace the client's live edits with the defaults.
  console.error("[snapshot-cms] could not read saved content from production D1:\n" + text);
  process.exit(1);
}

const [result] = JSON.parse(raw);
const snapshot = {};
for (const row of result?.results ?? []) snapshot[row.key] = JSON.parse(row.value);
writeFileSync(out, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`[snapshot-cms] snapshot of ${Object.keys(snapshot).length} saved item(s): ${Object.keys(snapshot).join(", ") || "none"}`);
