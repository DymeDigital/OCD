import { headers } from "next/headers";
import { AdminEditor } from "@/components/admin/admin-editor";
import { requireAdmin } from "@/lib/cms/auth";
import { getContentRecord } from "@/lib/cms/store";

export default async function AdminPage() {
  // The layout already gates this; checked again so the page never renders data on its own.
  const admin = await requireAdmin(await headers());
  if (!admin) return null;

  const [photos, homeFeatures, aboutPhotos] = await Promise.all([
    getContentRecord("photos"),
    getContentRecord("homeFeatures"),
    getContentRecord("aboutPhotos"),
  ]);

  return (
    <AdminEditor
      email={admin.email}
      initial={{ photos: photos.value, homeFeatures: homeFeatures.value, aboutPhotos: aboutPhotos.value }}
      initialVersions={{ photos: photos.updatedAt, homeFeatures: homeFeatures.updatedAt, aboutPhotos: aboutPhotos.updatedAt }}
    />
  );
}
