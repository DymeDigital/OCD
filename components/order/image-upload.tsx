"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_FILES, MAX_SIZE_BYTES, ACCEPT_ATTR } from "@/lib/upload-constraints";

// §9 step 6: shows thumbnails and filenames in the ledger. Files aren't persisted to the
// localStorage autosave (not JSON-serialisable) — on submit they travel to /api/submit-order
// as part of one multipart request; see order-form.tsx / wedding-form.tsx onSubmit.

// The wrapper's id — the forms scroll here when Continue is blocked on a missing image.
const IMAGE_UPLOAD_ID = "reference-images";

export const imageRequiredMessage = "Add at least one reference image so we can see what you have in mind.";

export function scrollToImageUpload() {
  document.getElementById(IMAGE_UPLOAD_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function ImageUpload({
  files,
  onChange,
  requiredError,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  // Set by the form when Continue/submit is blocked because no image was added.
  requiredError?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const shownError = error ?? requiredError;
  const errorId = `${IMAGE_UPLOAD_ID}-error`;


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
    <div id={IMAGE_UPLOAD_ID} className="scroll-mt-24">
      <span className="label text-ink-soft">
        Reference images
        <span className="text-red-ink" aria-hidden>
          {" "}
          *
        </span>
      </span>
      <p className="mt-1 text-sm text-ink-soft">
        At least one, so we can see what you have in mind. Up to {MAX_FILES} images, 10MB each — JPG, PNG or HEIC.
      </p>
      <label className="mt-3 block cursor-pointer rounded-[4px] border border-dashed border-rule p-6 text-center text-sm text-ink-soft transition-colors hover:border-ink">
        Click to choose images, or drag them here
        <input
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          required
          aria-invalid={!!shownError}
          aria-describedby={shownError ? errorId : undefined}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {shownError && (
        <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-red-ink">
          {shownError}
        </p>
      )}
      {files.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="group relative aspect-square overflow-hidden rounded-[4px] bg-icing">
              <PreviewImage file={file} />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${file.name}`}
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

// One thumbnail. The object URL is created and revoked inside the same effect and set straight
// on the <img>. (Creating it in a useMemo and revoking in an effect cleanup broke previews:
// StrictMode/remounts run the cleanup, then re-run the effect without re-running the memo,
// leaving the <img> on an already-revoked URL.)
function PreviewImage({ file }: { file: File }) {
  const ref = useRef<HTMLImageElement>(null);
  // Set when the browser can't decode the file (HEIC outside Safari) — the upload itself is fine.
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (failed) {
    return (
      <span className="flex h-full w-full flex-col justify-end p-2 text-xs text-ink-soft">
        <span className="line-clamp-2 break-all text-ink">{file.name}</span>
        <span className="mt-0.5">Added, no preview</span>
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- transient blob: preview, not a served asset
  return <img ref={ref} alt={file.name} className="h-full w-full object-cover" onError={() => setFailed(true)} />;
}
