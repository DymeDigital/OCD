import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cms/auth";
import { detectImageType, saveSiteImage, SITE_IMAGE_MAX_BYTES } from "@/lib/cms/media";

// One image per request. The admin resizes to WebP in the browser first, so this normally sees
// ~0.5 MB files; the 10 MB cap is the hard server-side limit regardless.
export async function POST(request: Request) {
  if (!(await requireAdmin(request.headers))) {
    return NextResponse.json({ error: "You need to be signed in to the admin." }, { status: 403 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "No image in the upload." }, { status: 400 });
  if (file.size > SITE_IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: "That image is over 10 MB. Try a smaller copy." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 400 });

  try {
    return NextResponse.json({ url: await saveSiteImage(bytes, type) });
  } catch (err) {
    console.error("[admin] image upload failed", err);
    return NextResponse.json({ error: "We couldn't upload that image. Try again in a moment." }, { status: 500 });
  }
}
