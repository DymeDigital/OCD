"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import type { Photo, AboutPhoto } from "@/content/data/photos";
import { photoSrc } from "@/lib/photo-src";
import { uploadImage, type UploadedImage } from "@/lib/cms/prepare-image";
import { checkboxClass, fieldBoxClass, fieldLabelClass } from "@/components/order/fields";

// The photo library as a ledger: one ruled row per photo, position in mono (it IS the gallery
// order), the description as the row's name. Tapping a row opens its editor in place, so the
// whole thing works one-handed on a phone. Shared by the library (kind="library") and the About
// carousel (kind="about"), which has no category/occasion/featured.

type Category = Photo["category"];
type Filter = "all" | Category;
type Item = Photo | AboutPhoto;

export const categoryLabel: Record<Category, string> = { cake: "Cake", cupcakes: "Cupcakes", wedding: "Wedding" };
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cake", label: "Cakes" },
  { id: "cupcakes", label: "Cupcakes" },
  { id: "wedding", label: "Weddings" },
];

export const MIN_ALT = 5;
export const altProblem = (alt: string) => (alt.trim().length < MIN_ALT ? "Add a short description of the photo." : null);

const buttonClass =
  "label inline-flex min-h-11 items-center justify-center rounded-[4px] border border-ink px-4 text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40";
const quietButtonClass =
  "inline-flex min-h-11 items-center px-1 text-sm text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40";

export function Thumb({ file, className = "h-20 w-16" }: { file: string; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-[4px] bg-icing ${className}`}>
      {file && <Image src={photoSrc({ file })} alt="" fill sizes="96px" className="object-cover" />}
    </div>
  );
}

export function PhotoLedger<T extends Item>({
  kind,
  items,
  onChange,
  lockedIds = new Set(),
  lockedReason = "",
  onUploadingChange,
  showErrors,
}: {
  kind: "library" | "about";
  items: T[];
  /** Always a functional update — uploads finish asynchronously, after other edits. */
  onChange: (update: (prev: T[]) => T[]) => void;
  /** Photos that can't be removed (used on the home page). */
  lockedIds?: Set<string>;
  lockedReason?: string;
  onUploadingChange: (delta: number) => void;
  showErrors: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [addError, setAddError] = useState<string | null>(null);
  // Photos uploaded this session that came in under MIN_LONG_EDGE, keyed by id → original long
  // edge in px. Advice at the moment of adding, not stored with the content.
  const [smallEdge, setSmallEdge] = useState<Map<string, number>>(new Map());
  const addInput = useRef<HTMLInputElement>(null);
  const isLibrary = kind === "library";

  const visible = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !isLibrary || filter === "all" || (item as Photo).category === filter);

  const occasions = isLibrary
    ? [...new Set(items.map((p) => (p as Photo).occasion).filter((o): o is string => !!o))].sort()
    : [];

  const update = (id: string, patch: Partial<Photo>) =>
    onChange((prev) => prev.map((p) => (p.id === id ? ({ ...p, ...patch } as T) : p)));

  const noteSize = (id: string, uploaded: UploadedImage) =>
    setSmallEdge((prev) => {
      const next = new Map(prev);
      if (uploaded.small) next.set(id, uploaded.longEdge);
      else next.delete(id);
      return next;
    });

  const setBusyFor = (id: string, on: boolean) => {
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    onUploadingChange(on ? 1 : -1);
  };

  // Moves past the neighbouring *visible* row, so reordering inside a filter does what it looks
  // like it does.
  const move = (visiblePos: number, dir: -1 | 1) => {
    const from = visible[visiblePos]?.index;
    const to = visible[visiblePos + dir]?.index;
    if (from === undefined || to === undefined) return;
    onChange((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const remove = (id: string) => {
    onChange((prev) => prev.filter((p) => p.id !== id));
    setOpenId(null);
  };

  const replace = async (id: string, file: File) => {
    setRowError((e) => ({ ...e, [id]: "" }));
    setBusyFor(id, true);
    try {
      const uploaded = await uploadImage(file);
      update(id, { file: uploaded.url });
      noteSize(id, uploaded);
    } catch (err) {
      setRowError((e) => ({ ...e, [id]: (err as Error).message }));
    } finally {
      setBusyFor(id, false);
    }
  };

  // New photos go to the top of the list (and of the current filter's category), open, with the
  // description empty — the one thing only a person can fill in.
  const addFiles = async (files: FileList) => {
    setAddError(null);
    const category: Category = filter === "all" ? "cake" : filter;
    for (const file of Array.from(files)) {
      const id = `photo-${crypto.randomUUID().slice(0, 8)}`;
      const placeholder = (isLibrary ? { id, file: "", alt: "", category } : { id, file: "", alt: "" }) as T;
      onChange((prev) => [placeholder, ...prev]);
      setOpenId(id);
      setBusyFor(id, true);
      try {
        const uploaded = await uploadImage(file);
        onChange((prev) => prev.map((p) => (p.id === id ? ({ ...p, file: uploaded.url } as T) : p)));
        noteSize(id, uploaded);
      } catch (err) {
        onChange((prev) => prev.filter((p) => p.id !== id));
        setAddError(`${file.name}: ${(err as Error).message}`);
      } finally {
        setBusyFor(id, false);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isLibrary ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Show photos from">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`min-h-11 rounded-[4px] border px-3 text-xs transition-colors ${
                  filter === f.id ? "border-ink bg-ink text-paper" : "border-rule text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">These rotate on the About page, in this order.</p>
        )}
        <div>
          <input
            ref={addInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button type="button" className={buttonClass} onClick={() => addInput.current?.click()}>
            Add photos
          </button>
        </div>
      </div>
      {addError && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-ink">
          {addError}
        </p>
      )}

      <p className="mt-6 font-mono text-2xs text-ink-soft">
        {visible.length} {visible.length === 1 ? "photo" : "photos"}
      </p>

      {visible.length === 0 ? (
        <p className="mt-3 border-t border-ink py-10 text-ink-soft">
          No photos here yet. Add one and it&apos;ll show up in this section.
        </p>
      ) : (
        <ol className="mt-3 border-t border-ink">
          {visible.map(({ item, index }, pos) => (
            <PhotoRow
              key={item.id}
              item={item}
              position={index + 1}
              isLibrary={isLibrary}
              open={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              onUpdate={(patch) => update(item.id, patch)}
              onReplace={(file) => void replace(item.id, file)}
              onMove={(dir) => move(pos, dir)}
              canMoveUp={pos > 0}
              canMoveDown={pos < visible.length - 1}
              onRemove={() => remove(item.id)}
              locked={lockedIds.has(item.id)}
              lockedReason={lockedReason}
              busy={busy.has(item.id)}
              smallEdge={smallEdge.get(item.id)}
              error={rowError[item.id]}
              showErrors={showErrors}
              occasions={occasions}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function PhotoRow({
  item,
  position,
  isLibrary,
  open,
  onToggle,
  onUpdate,
  onReplace,
  onMove,
  canMoveUp,
  canMoveDown,
  onRemove,
  locked,
  lockedReason,
  busy,
  smallEdge,
  error,
  showErrors,
  occasions,
}: {
  item: Item;
  position: number;
  isLibrary: boolean;
  open: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Photo>) => void;
  onReplace: (file: File) => void;
  onMove: (dir: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  locked: boolean;
  lockedReason: string;
  busy: boolean;
  /** Set when this session's upload was under the minimum size — its original long edge in px. */
  smallEdge?: number;
  error?: string;
  showErrors: boolean;
  occasions: string[];
}) {
  const uid = useId();
  const replaceInput = useRef<HTMLInputElement>(null);
  const photo = item as Photo;
  const problem = altProblem(item.alt);
  const flagged = showErrors && !!problem;

  const meta = isLibrary
    ? [categoryLabel[photo.category], photo.occasion, photo.hero ? "featured" : null].filter(Boolean).join(", ")
    : null;

  return (
    <li className="border-b border-rule">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-icing"
      >
        <span className="w-7 shrink-0 font-mono text-2xs text-ink-soft">{String(position).padStart(2, "0")}</span>
        <Thumb file={item.file} />
        <span className="min-w-0 flex-1">
          <span className={`line-clamp-2 ${item.alt.trim() ? "text-ink" : "text-ink-soft"}`}>
            {busy && !item.file ? "Uploading…" : item.alt.trim() || "No description yet"}
          </span>
          {meta && <span className="mt-0.5 block text-sm text-ink-soft first-letter:uppercase">{meta}</span>}
          {flagged && <span className="mt-0.5 block text-sm font-medium text-red-ink">Needs a description</span>}
          {smallEdge !== undefined && <span className="mt-0.5 block text-sm text-ink-soft">Small photo, may look blurry</span>}
        </span>
        <span aria-hidden className={`shrink-0 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div id={`${uid}-panel`} className="grid gap-5 pb-6 pl-11 md:grid-cols-[200px_1fr] md:gap-8">
          <div>
            <Thumb file={item.file} className="aspect-[4/5] w-full max-w-[160px] md:max-w-[200px]" />
            <input
              ref={replaceInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReplace(file);
                e.target.value = "";
              }}
            />
            <button type="button" className={`${quietButtonClass} mt-2`} disabled={busy} onClick={() => replaceInput.current?.click()}>
              {busy ? "Uploading…" : "Replace image"}
            </button>
            {smallEdge !== undefined && !error && (
              <p className="mt-1 text-sm text-ink-soft md:max-w-[200px]">
                This photo is only <span className="font-mono">{smallEdge}px</span> across, so it may look blurry on the
                site. If you have the original, replace it.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-1 text-sm font-medium text-red-ink">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className={fieldLabelClass}>
                Description<span className="text-red-ink" aria-hidden> *</span>
              </span>
              <span id={`${uid}-alt-hint`} className="mt-1 block text-sm text-ink-soft">
                What&apos;s in the photo, in a sentence. Screen readers say this out loud, and Google reads it.
              </span>
              <textarea
                rows={3}
                value={item.alt}
                onChange={(e) => onUpdate({ alt: e.target.value })}
                aria-invalid={flagged}
                aria-describedby={`${uid}-alt-hint${flagged ? ` ${uid}-alt-error` : ""}`}
                className={`${fieldBoxClass} mt-2`}
              />
              {flagged && (
                <span id={`${uid}-alt-error`} className="mt-1.5 block text-sm font-medium text-red-ink">
                  {problem}
                </span>
              )}
            </label>

            {isLibrary && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className={fieldLabelClass}>Section</span>
                  <select
                    value={photo.category}
                    onChange={(e) => onUpdate({ category: e.target.value as Category })}
                    className={`${fieldBoxClass} mt-2`}
                  >
                    <option value="cake">Cakes</option>
                    <option value="cupcakes">Cupcakes</option>
                    <option value="wedding">Weddings</option>
                  </select>
                </label>
                <label className="block">
                  <span className={fieldLabelClass}>Occasion</span>
                  <input
                    type="text"
                    list={`${uid}-occasions`}
                    value={photo.occasion ?? ""}
                    maxLength={40}
                    placeholder="e.g. birthday"
                    onChange={(e) => onUpdate({ occasion: e.target.value || undefined })}
                    className={`${fieldBoxClass} mt-2`}
                  />
                  <datalist id={`${uid}-occasions`}>
                    {occasions.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                </label>
              </div>
            )}

            {isLibrary && (
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={!!photo.hero}
                  onChange={(e) => onUpdate({ hero: e.target.checked || undefined })}
                  className={`${checkboxClass} mt-0.5`}
                />
                <span>
                  <span className="block font-medium">Featured</span>
                  <span className="block text-sm text-ink-soft">
                    Shown larger in the gallery. Featured cake and wedding photos also rotate on the Cakes and Weddings pages.
                  </span>
                </span>
              </label>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-rule pt-3">
              <button type="button" className={quietButtonClass} disabled={!canMoveUp} onClick={() => onMove(-1)}>
                Move up
              </button>
              <button type="button" className={quietButtonClass} disabled={!canMoveDown} onClick={() => onMove(1)}>
                Move down
              </button>
              <button
                type="button"
                className={`${quietButtonClass} ml-auto`}
                disabled={locked || busy}
                aria-describedby={locked ? `${uid}-locked` : undefined}
                onClick={onRemove}
              >
                Remove photo
              </button>
              {locked && (
                <p id={`${uid}-locked`} className="w-full text-sm text-ink-soft">
                  {lockedReason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
