"use client";

import { useEffect, useMemo, useState } from "react";
import type { Photo, AboutPhoto } from "@/content/data/photos";
import { PhotoLedger, altProblem } from "@/components/admin/photo-ledger";
import { HomePlates } from "@/components/admin/home-plates";

// /admin's one screen. Edits stay in the browser until "Save changes"; then each changed section
// is PUT with the version it was loaded at, so two people editing at once can't overwrite each
// other silently (the server answers 409). Saves refresh the affected public pages.

type Values = {
  photos: Photo[];
  homeFeatures: [string, string, string];
  aboutPhotos: AboutPhoto[];
};
type Key = keyof Values;
type Versions = Record<Key, string | null>;

const sections: { key: Key; label: string }[] = [
  { key: "photos", label: "Photos" },
  { key: "homeFeatures", label: "Home page" },
  { key: "aboutPhotos", label: "About" },
];
const sectionLabel = Object.fromEntries(sections.map((s) => [s.key, s.label])) as Record<Key, string>;
const keys = sections.map((s) => s.key);
const resetQuestion: Record<Key, string> = {
  photos: "Put the original photo library back? Photos you've added or changed will be removed.",
  homeFeatures: "Put the original three home page photos back?",
  aboutPhotos: "Put the original About photos back? Photos you've added there will be removed.",
};
const listOf = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const primaryButton =
  "label inline-flex min-h-11 items-center justify-center rounded-[4px] bg-ink px-5 text-paper transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40";
const quietButton =
  "inline-flex min-h-11 items-center px-1 text-sm text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink disabled:opacity-40";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function AdminEditor({
  initial,
  initialVersions,
  email,
}: {
  initial: Values;
  initialVersions: Versions;
  email: string;
}) {
  const [saved, setSaved] = useState<Values>(initial);
  const [versions, setVersions] = useState<Versions>(initialVersions);
  const [draft, setDraft] = useState<Values>(initial);
  const [tab, setTab] = useState<Key>("photos");
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const dirty = useMemo(() => keys.filter((k) => !same(draft[k], saved[k])), [draft, saved]);

  useEffect(() => {
    if (dirty.length === 0 && uploading === 0) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty.length, uploading]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const set = <K extends Key>(key: K) => (update: (prev: Values[K]) => Values[K]) =>
    setDraft((d) => ({ ...d, [key]: update(d[key]) }));

  const homeIds = new Set(draft.homeFeatures);

  const firstProblem = (): { key: Key; message: string } | null => {
    for (const key of ["photos", "aboutPhotos"] as const) {
      const list = draft[key] as { alt: string; file: string }[];
      if (list.some((p) => !p.file)) return { key, message: "Wait for the photos to finish uploading." };
      if (list.some((p) => altProblem(p.alt))) {
        return { key, message: key === "photos" ? "Some photos need a description." : "Some About photos need a description." };
      }
    }
    return null;
  };

  async function send(key: Key, method: "PUT" | "DELETE") {
    const res = await fetch(`/api/admin/content/${key}`, {
      method,
      headers: { "content-type": "application/json" },
      body: method === "PUT" ? JSON.stringify({ value: draft[key], expectedUpdatedAt: versions[key] }) : undefined,
    });
    const json = (await res.json().catch(() => ({}))) as { value?: unknown; updatedAt?: string | null; error?: string };
    if (!res.ok) throw new Error(json.error ?? "We couldn't save that. Try again in a moment.");
    return json as { value: Values[Key]; updatedAt: string | null };
  }

  async function save() {
    setError(null);
    const problem = firstProblem();
    if (problem) {
      setShowErrors(true);
      setTab(problem.key);
      setError(problem.message);
      return;
    }
    // The home page can only point at photos the server already has. Save it first when it does
    // (e.g. a photo is swapped off the home page and then removed), otherwise after the library.
    const homeFirst = draft.homeFeatures.every((id) => saved.photos.some((p) => p.id === id));
    const order = (homeFirst ? ["homeFeatures", "photos", "aboutPhotos"] : ["photos", "homeFeatures", "aboutPhotos"]) as Key[];

    setSaving(true);
    try {
      for (const key of order.filter((k) => dirty.includes(k))) {
        const result = await send(key, "PUT");
        setSaved((s) => ({ ...s, [key]: result.value }));
        setVersions((v) => ({ ...v, [key]: result.updatedAt }));
      }
      setShowErrors(false);
      setToast("Saved. Live in a few seconds.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function reset(key: Key) {
    setError(null);
    setSaving(true);
    try {
      const result = await send(key, "DELETE");
      setSaved((s) => ({ ...s, [key]: result.value }));
      setDraft((d) => ({ ...d, [key]: result.value }));
      setVersions((v) => ({ ...v, [key]: null }));
      setConfirmReset(false);
      setToast("Reset to original. Live in a few seconds.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const canReset = versions[tab] !== null;

  return (
    <div className="pb-32">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-normal md:text-2xl">Site photos</h1>
          <p className="mt-2 max-w-md text-ink-soft">Change what&apos;s on the site. Nothing goes live until you save.</p>
        </div>
        <p className="font-mono text-2xs text-ink-soft">{email}</p>
      </header>

      <nav className="mt-10 flex border-b border-rule" aria-label="Sections">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              setTab(s.key);
              setConfirmReset(false);
            }}
            aria-current={tab === s.key ? "page" : undefined}
            className={`-mb-px min-h-11 flex-1 border-b-2 px-2 text-sm transition-colors sm:flex-none sm:px-5 ${
              tab === s.key ? "border-red-ink font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {s.label}
            {dirty.includes(s.key) && <span className="sr-only"> (unsaved)</span>}
            {dirty.includes(s.key) && <span aria-hidden className="ml-1 text-red-ink">•</span>}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "photos" && (
          <PhotoLedger
            kind="library"
            items={draft.photos}
            onChange={set("photos")}
            lockedIds={homeIds}
            lockedReason="This photo is on the home page. Pick a different one there first."
            onUploadingChange={(d) => setUploading((n) => n + d)}
            showErrors={showErrors}
          />
        )}
        {tab === "homeFeatures" && (
          <HomePlates ids={draft.homeFeatures} photos={draft.photos} onChange={(next) => set("homeFeatures")(() => next)} />
        )}
        {tab === "aboutPhotos" && (
          <PhotoLedger
            kind="about"
            items={draft.aboutPhotos}
            onChange={set("aboutPhotos")}
            onUploadingChange={(d) => setUploading((n) => n + d)}
            showErrors={showErrors}
          />
        )}
      </div>

      {canReset && (
        <div className="mt-12 border-t border-rule pt-4">
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="w-full text-sm text-ink sm:w-auto">
                {resetQuestion[tab]}
              </p>
              <button type="button" className={quietButton} disabled={saving} onClick={() => void reset(tab)}>
                Yes, reset
              </button>
              <button type="button" className={quietButton} onClick={() => setConfirmReset(false)}>
                Keep mine
              </button>
            </div>
          ) : (
            <button type="button" className={`${quietButton} text-ink-soft`} onClick={() => setConfirmReset(true)}>
              Reset {sectionLabel[tab].toLowerCase()} to original
            </button>
          )}
        </div>
      )}

      {/* Only there when there's something to save — the bar itself is the "unsaved" signal. */}
      {(dirty.length > 0 || error) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-paper">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 md:px-12">
            <div className="w-full min-w-0 sm:w-auto sm:flex-1">
              {error ? (
                <p role="alert" className="text-sm font-medium text-red-ink">
                  {error}
                </p>
              ) : (
                <p className="text-sm text-ink">
                  Unsaved changes in {listOf(dirty.map((k) => sectionLabel[k]))}
                </p>
              )}
              {uploading > 0 && <p className="text-sm text-ink-soft">Uploading {uploading} {uploading === 1 ? "photo" : "photos"}…</p>}
            </div>
            {dirty.length > 0 && (
              <>
                <button
                  type="button"
                  className={`${quietButton} ml-auto`}
                  disabled={saving}
                  onClick={() => {
                    setDraft(saved);
                    setError(null);
                    setShowErrors(false);
                  }}
                >
                  Undo all
                </button>
                <button type="button" className={primaryButton} disabled={saving || uploading > 0} onClick={() => void save()}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-6">
        {toast && <p className="rounded-[4px] bg-ink px-4 py-3 text-sm text-paper">{toast}</p>}
      </div>
    </div>
  );
}
