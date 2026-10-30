"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { confections, confectionNeedsImage, MAX_CONFECTION_IMAGES } from "@/content/data/confections";
import type { OrderFormValues, WeddingOrderFormValues } from "@/lib/schemas";
import { formatPriceFrom, formatZAR } from "@/lib/pricing";
import { ImageUpload } from "@/components/order/image-upload";
import { fieldBoxClass, fieldLabelClass, checkboxClass } from "@/components/order/fields";

export const confectionImageRequiredMessage = "Add a reference photo so we can match the look.";

/** The id of an item's own photo upload — the forms scroll here when Continue is blocked on it. */
export function confectionImagesId(confectionId: string) {
  return `confection-images-${confectionId}`;
}

export function ConfectionsPicker({
  form: anyForm,
  images,
  onImagesChange,
  imageErrors,
}: {
  form: UseFormReturn<OrderFormValues> | UseFormReturn<WeddingOrderFormValues>;
  // Per-item reference photos, keyed by confection id (client-requested 2026-10-24). Held in the
  // form component's state, like the cake's own reference images — files can't be autosaved.
  images: Record<string, File[]>;
  onImagesChange: (confectionId: string, files: File[]) => void;
  imageErrors: Record<string, string | undefined>;
}) {
  // Both schemas share the identical `confections` field (lib/schemas.ts), and that's the only
  // part of the form this touches — narrowed to one type so useFieldArray's paths type-check.
  const form = anyForm as UseFormReturn<OrderFormValues>;
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "confections" });
  const selections = form.watch("confections") ?? [];
  // Array-level Zod errors land as one entry per row (undefined for valid rows) rather than a
  // single top-level message — a generic line is enough to send the customer back to fix whichever
  // quantity they cleared, without needing to thread a per-row error into each number input.
  const hasConfectionsError = Array.isArray(form.formState.errors.confections)
    ? form.formState.errors.confections.some(Boolean)
    : !!form.formState.errors.confections;

  function indexOf(confectionId: string) {
    return fields.findIndex((f) => f.confectionId === confectionId);
  }

  function toggle(confectionId: string) {
    const idx = indexOf(confectionId);
    if (idx === -1) append({ confectionId, quantity: 1, note: "" });
    else remove(idx);
  }

  return (
    <fieldset>
      <legend className="block font-medium text-ink">Signature Confections (optional)</legend>
      <p className="mt-1 text-sm text-ink-soft">Add any of these to your order — tick, then set a quantity.</p>
      {hasConfectionsError && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-ink">
          Check the quantities above — each one needs to be between 1 and 20.
        </p>
      )}
      <div className="mt-4 space-y-3">
        {confections.map((c) => {
          const idx = indexOf(c.id);
          const selected = idx !== -1;
          return (
            <div
              key={c.id}
              className={`rounded-[4px] border p-4 transition-colors ${
                selected ? "border-ink bg-icing ring-1 ring-inset ring-ink" : "border-ink-soft bg-paper hover:border-ink"
              }`}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(c.id)}
                  className={`mt-0.5 ${checkboxClass}`}
                />
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{c.name}</span>
                    <span className="whitespace-nowrap text-sm text-ink-soft">
                      {c.isFromPrice ? formatPriceFrom(c.priceFrom) : `R${formatZAR(c.priceFrom)}`} / {c.unit}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{c.description}</span>
                </span>
              </label>

              {selected && (
                <div className="mt-3 grid gap-3 pl-7 sm:grid-cols-[120px_1fr]">
                  <label className="block">
                    <span className={fieldLabelClass}>Sets</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      {...form.register(`confections.${idx}.quantity`, { valueAsNumber: true })}
                      className={`mt-1 ${fieldBoxClass}`}
                    />
                  </label>
                  {c.subOptions ? (
                    <label className="block">
                      <span className={fieldLabelClass}>Choice</span>
                      <select
                        {...form.register(`confections.${idx}.note`)}
                        className={`mt-1 ${fieldBoxClass}`}
                      >
                        <option value="">Select…</option>
                        {c.subOptions.map((o) => (
                          <option key={o.label} value={o.label}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <label className="block">
                      <span className={fieldLabelClass}>Colour / theme (optional)</span>
                      <input
                        {...form.register(`confections.${idx}.note`)}
                        className={`mt-1 ${fieldBoxClass}`}
                      />
                    </label>
                  )}
                </div>
              )}

              {selected && confectionNeedsImage({ confectionId: c.id, note: selections[idx]?.note }) && (
                <div className="mt-4 pl-7">
                  <ImageUpload
                    id={confectionImagesId(c.id)}
                    label={`Reference photo — ${c.name}`}
                    hint="Show us the look you'd like for these."
                    max={MAX_CONFECTION_IMAGES}
                    files={images[c.id] ?? []}
                    onChange={(files) => onImagesChange(c.id, files)}
                    requiredError={imageErrors[c.id]}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

type ConfectionSelection = { confectionId: string; note?: string | null };

/** State + checks for the per-item photos, shared by both order forms. */
export function useConfectionImages() {
  const [images, setImages] = useState<Record<string, File[]>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function onImagesChange(confectionId: string, files: File[]) {
    setImages((prev) => ({ ...prev, [confectionId]: files }));
    if (files.length > 0) setErrors((prev) => ({ ...prev, [confectionId]: undefined }));
  }

  /** Flags every selected item still missing its photo; returns the first one's upload id. */
  function validate(selections: ConfectionSelection[] | undefined): string | null {
    const missing = (selections ?? []).filter((s) => confectionNeedsImage(s) && !images[s.confectionId]?.length);
    setErrors(Object.fromEntries(missing.map((s) => [s.confectionId, confectionImageRequiredMessage])));
    return missing.length ? confectionImagesId(missing[0].confectionId) : null;
  }

  /** Adds each still-needed item's photos to the submit body as `confectionFiles:<id>`. */
  function appendTo(body: FormData, selections: ConfectionSelection[] | undefined) {
    for (const s of selections ?? []) {
      if (!confectionNeedsImage(s)) continue;
      for (const file of images[s.confectionId] ?? []) body.append(`confectionFiles:${s.confectionId}`, file);
    }
  }

  return { images, errors, onImagesChange, validate, appendTo };
}
