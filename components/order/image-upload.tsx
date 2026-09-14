"use client";

import { useEffect, useMemo, useState } from "react";
import { MAX_FILES, MAX_SIZE_BYTES, ACCEPT_ATTR } from "@/lib/upload-constraints";

// §9 step 6: shows thumbnails and filenames in the ledger. Files aren't persisted to the
// localStorage autosave (not JSON-serialisable) — on submit they travel to /api/submit-order
// as part of one multipart request; see order-form.tsx / wedding-form.tsx onSubmit.

export function ImageUpload({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const tooBig = incoming.find((f) => f.size > MAX_SIZE_BYTES);
    if (tooBig) {
      setError(`${tooBig.name} is over 10MB — try a smaller file.`);
      return;
    }
    const room = Math.max(0, MAX_FILES - files.length);
    if (incoming.length > room) {
      setError(`We can only take ${MAX_FILES} images here — added the first ${room}.`);
    } else {
      setError(null);
    }
    onChange([...files, ...incoming.slice(0, room)]);
  }

  function removeAt(i: number) {
    onChange(files.filter((_, idx) => idx !== i));
    setError(null);
  }

  return (
    <div>
      <span className="label text-ink-soft">Reference images (optional)</span>
      <p className="mt-1 text-sm text-ink-soft">
        Up to {MAX_FILES} images, 10MB each — JPG, PNG or HEIC.
      </p>
      <label className="mt-3 block cursor-pointer rounded-[4px] border border-dashed border-rule p-6 text-center text-sm text-ink-soft transition-colors hover:border-ink">
        Click to choose images, or drag them here
        <input
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium">
          {error}
        </p>
      )}
      {previews.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {previews.map((p, i) => (
            <li key={`${p.file.name}-${i}`} className="group relative aspect-square overflow-hidden rounded-[4px] bg-icing">
              {/* eslint-disable-next-line @next/next/no-img-element -- transient blob: preview, not a served asset */}
              <img src={p.url} alt={p.file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${p.file.name}`}
                className="absolute right-1 top-1 rounded-[4px] bg-paper px-1.5 py-0.5 text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
