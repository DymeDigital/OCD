/** Resolves a photo's `file` to an image src. Uploaded photos (from /admin) are stored as absolute
 * R2 URLs; the original photography is a path under `public/images/`. No data migration needed —
 * both shapes live side by side in the same list. */
export function photoSrc(photo: { file: string }): string {
  return /^https?:\/\//.test(photo.file) ? photo.file : `/images/${photo.file}`;
}
