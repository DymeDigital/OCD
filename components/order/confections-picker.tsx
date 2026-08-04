"use client";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { confections } from "@/content/data/confections";
import type { OrderFormValues } from "@/lib/schemas";
import { formatPriceFrom, formatZAR } from "@/lib/pricing";

export function ConfectionsPicker({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "confections" });

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
      <legend className="label text-ink-soft">Signature Confections (optional)</legend>
      <p className="mt-1 text-sm text-ink-soft">Add any of these to your order — tick, then set a quantity.</p>
      <div className="mt-4 space-y-3">
        {confections.map((c) => {
          const idx = indexOf(c.id);
          const selected = idx !== -1;
          return (
            <div key={c.id} className="rounded-[4px] border border-rule p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(c.id)}
                  className="mt-1"
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
                    <span className="label text-ink-soft">Sets</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      {...form.register(`confections.${idx}.quantity`, { valueAsNumber: true })}
                      className="mt-1 w-full rounded-[4px] border border-rule bg-transparent px-3 py-2"
                    />
                  </label>
                  {c.subOptions ? (
                    <label className="block">
                      <span className="label text-ink-soft">Choice</span>
                      <select
                        {...form.register(`confections.${idx}.note`)}
                        className="mt-1 w-full rounded-[4px] border border-rule bg-transparent px-3 py-2"
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
                      <span className="label text-ink-soft">Colour / theme (optional)</span>
                      <input
                        {...form.register(`confections.${idx}.note`)}
                        className="mt-1 w-full border-0 border-b border-rule bg-transparent px-0 py-2"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
