import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/cms/auth";
import { filesIn, isContentKey, registry, type ContentKey } from "@/lib/cms/registry";
import { ConflictError, getContentRecord, putContent, resetContent } from "@/lib/cms/store";
import { deleteSiteImages, isSiteImageUrl } from "@/lib/cms/media";

type Params = { params: Promise<{ key: string }> };

const forbidden = () => NextResponse.json({ error: "You need to be signed in to the admin." }, { status: 403 });
const notFound = () => NextResponse.json({ error: "Unknown content." }, { status: 404 });

function refresh(key: ContentKey) {
  for (const path of registry[key].paths) revalidatePath(path);
}

/** Uploads this value stopped referencing, and that no other key still uses. */
async function orphanedUploads(key: ContentKey, before: unknown, after: unknown | null): Promise<string[]> {
  const kept = new Set(after === null ? [] : filesIn(key, after));
  const candidates = filesIn(key, before).filter((f) => !kept.has(f));
  if (candidates.length === 0) return [];
  const elsewhere = new Set<string>();
  for (const other of Object.keys(registry) as ContentKey[]) {
    if (other === key) continue;
    filesIn(other, (await getContentRecord(other)).value).forEach((f) => elsewhere.add(f));
  }
  return candidates.filter((f) => !elsewhere.has(f));
}

/** Checks that span keys: absolute URLs must be our own uploads, and the landing page can't
 * point at a photo that's no longer in the library. */
async function crossCheck(key: ContentKey, value: unknown): Promise<string | null> {
  for (const file of filesIn(key, value)) {
    if (/^https?:\/\//.test(file) && !(await isSiteImageUrl(file))) return "One of the images isn't an upload from this admin.";
  }
  if (key === "photos") {
    const ids = new Set((value as { id: string }[]).map((p) => p.id));
    const home = (await getContentRecord("homeFeatures")).value;
    if (home.some((id) => !ids.has(id))) return "A photo used on the home page can't be removed. Swap it on the home page first.";
  }
  if (key === "homeFeatures") {
    const ids = new Set((await getContentRecord("photos")).value.map((p) => p.id));
    if ((value as string[]).some((id) => !ids.has(id))) return "Pick home page photos from the photo library.";
  }
  return null;
}

export async function GET(request: Request, { params }: Params) {
  if (!(await requireAdmin(request.headers))) return forbidden();
  const { key } = await params;
  if (!isContentKey(key)) return notFound();
  return NextResponse.json(await getContentRecord(key));
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await requireAdmin(request.headers))) return forbidden();
  const { key } = await params;
  if (!isContentKey(key)) return notFound();

  let body: { value?: unknown; expectedUpdatedAt?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Could not read the changes." }, { status: 400 });
  }

  const parsed = registry[key].schema.safeParse(body.value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue?.message ?? "Some of the changes aren't valid." }, { status: 400 });
  }
  const problem = await crossCheck(key, parsed.data);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const before = (await getContentRecord(key)).value;
  let updatedAt: string;
  try {
    // The schema-parsed value matches this key's type; TS can't correlate it through the union.
    updatedAt = await putContent(key, parsed.data as never, body.expectedUpdatedAt ?? null);
  } catch (err) {
    if (err instanceof ConflictError) {
      return NextResponse.json(
        { error: "Someone saved changes here since you opened it. Reload to see them, then make your edits again." },
        { status: 409 },
      );
    }
    console.error(`[admin] saving "${key}" failed`, err);
    return NextResponse.json({ error: "We couldn't save that. Try again in a moment." }, { status: 500 });
  }

  refresh(key);
  await deleteSiteImages(await orphanedUploads(key, before, parsed.data));
  return NextResponse.json({ value: parsed.data, updatedAt });
}

/** Reset to original: drop the saved value so the static default shows again. */
export async function DELETE(request: Request, { params }: Params) {
  if (!(await requireAdmin(request.headers))) return forbidden();
  const { key } = await params;
  if (!isContentKey(key)) return notFound();

  const before = (await getContentRecord(key)).value;
  const fallback = registry[key].default;
  const problem = await crossCheck(key, fallback);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  await resetContent(key);
  refresh(key);
  await deleteSiteImages(await orphanedUploads(key, before, fallback));
  return NextResponse.json({ value: fallback, updatedAt: null });
}
