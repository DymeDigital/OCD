import { getCloudflareContext } from "@opennextjs/cloudflare";
import { registry, type ContentKey, type ContentValue } from "@/lib/cms/registry";
// Production content as it was at deploy time — written by scripts/snapshot-cms.mjs before
// `cf:build`/`cf:deploy`, `{}` otherwise. See getContent below for why the build needs it.
import snapshot from "@/lib/cms/snapshot.generated.json";

// Content lives in D1, not KV: D1 is strongly consistent, so a page regenerated straight after a
// save (app/api/admin/content/[key]/route.ts revalidates it) reads the new value, never a stale
// edge-cached one, and the "someone else saved first" check is a single atomic UPDATE. It shares
// the D1 database OpenNext uses as its tag cache (open-next.config.ts), in its own table
// (NEXT_TAG_CACHE_D1 — typed optional by OpenNext, required here).

export type ContentRecord<K extends ContentKey> = {
  value: ContentValue<K>;
  /** null when nothing has been saved yet — the static default is showing. */
  updatedAt: string | null;
};

export class ConflictError extends Error {}

let tableReady: Promise<unknown> | null = null;

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const database = env.NEXT_TAG_CACHE_D1;
  if (!database) throw new Error("NEXT_TAG_CACHE_D1 binding is missing (see wrangler.jsonc)");
  // Created lazily (once per isolate) so local dev, a fresh deploy and production all just work —
  // OpenNext's deploy only creates its own `revalidations` table.
  tableReady ??= database
    .prepare("CREATE TABLE IF NOT EXISTS cms_content (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)")
    .run()
    .catch((err) => {
      tableReady = null;
      throw err;
    });
  await tableReady;
  return database;
}

function fallback<K extends ContentKey>(key: K): ContentValue<K> {
  const snap = (snapshot as Record<string, unknown>)[key];
  if (snap !== undefined) {
    const parsed = registry[key].schema.safeParse(snap);
    if (parsed.success) return parsed.data as ContentValue<K>;
  }
  return registry[key].default as ContentValue<K>;
}

export async function getContentRecord<K extends ContentKey>(key: K): Promise<ContentRecord<K>> {
  const row = await (await db())
    .prepare("SELECT value, updated_at FROM cms_content WHERE key = ?")
    .bind(key)
    .first<{ value: string; updated_at: string }>();
  if (!row) return { value: registry[key].default as ContentValue<K>, updatedAt: null };

  const parsed = registry[key].schema.safeParse(JSON.parse(row.value));
  if (!parsed.success) {
    console.error(`[cms] stored value for "${key}" no longer validates — showing the default`, parsed.error);
    return { value: registry[key].default as ContentValue<K>, updatedAt: row.updated_at };
  }
  return { value: parsed.data as ContentValue<K>, updatedAt: row.updated_at };
}

/** What the public pages read. Never throws — a storage problem shows the last known content
 * rather than an error page. */
export async function getContent<K extends ContentKey>(key: K): Promise<ContentValue<K>> {
  // Static pages are prerendered by `next build`, where there's no Worker and no D1. Using the
  // deploy-time snapshot there means a redeploy doesn't quietly revert the client's edits to
  // the defaults until the next save.
  if (process.env.NEXT_PHASE === "phase-production-build") return fallback(key);
  try {
    return (await getContentRecord(key)).value;
  } catch (err) {
    console.error(`[cms] reading "${key}" failed — showing the fallback`, err);
    return fallback(key);
  }
}

/** Saves a value already validated by the caller. `expectedUpdatedAt` is the version the editor
 * loaded; if anyone saved since, nothing is written and ConflictError is thrown. */
export async function putContent<K extends ContentKey>(
  key: K,
  value: ContentValue<K>,
  expectedUpdatedAt: string | null,
): Promise<string> {
  const database = await db();
  const now = new Date().toISOString();
  const json = JSON.stringify(value);
  const result =
    expectedUpdatedAt === null
      ? await database
          .prepare("INSERT INTO cms_content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING")
          .bind(key, json, now)
          .run()
      : await database
          .prepare("UPDATE cms_content SET value = ?, updated_at = ? WHERE key = ? AND updated_at = ?")
          .bind(json, now, key, expectedUpdatedAt)
          .run();
  if (result.meta.changes !== 1) throw new ConflictError();
  return now;
}

export async function resetContent(key: ContentKey): Promise<void> {
  await (await db()).prepare("DELETE FROM cms_content WHERE key = ?").bind(key).run();
}
