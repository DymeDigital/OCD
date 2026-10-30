"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { RadioCardGroup, fieldBoxClass, fieldLabelClass } from "@/components/order/fields";
import {
  tableCakeSizes,
  tableCakeWidths,
  formatLengthCm,
  tableServingsLabel,
  italianCake,
} from "@/content/data/sizes";
import { formatPriceFrom } from "@/lib/pricing";

// Client-requested 2026-10-24, shared by both order forms: round/tiered (the original size flow),
// a rectangle/table cake picked by width then length, or the Italian style cake.

const minTablePrice = Math.min(...tableCakeSizes.map((s) => s.priceFrom));

export function CakeKindPicker({ register, error }: { register: UseFormRegisterReturn; error?: string }) {
  return (
    <RadioCardGroup
      legend="What kind of cake?"
      name="cakeKind"
      options={[
        { value: "tiered", label: "Round or tiered", description: "Our classic sizes, from a mini cake to six tiers." },
        {
          value: "table",
          label: "Rectangle / table cake",
          description: `Long and flat, for a crowd. ${formatPriceFrom(minTablePrice)}.`,
        },
        {
          value: "italian",
          label: italianCake.label,
          description: `${italianCake.sizeCm}cm, ${italianCake.layersNote}, serves ${italianCake.servingsMin}–${italianCake.servingsMax}. ${formatPriceFrom(italianCake.priceFrom)}.`,
        },
      ]}
      register={register}
      error={error}
    />
  );
}

const selectClass = `mt-2 ${fieldBoxClass}`;

export function TableCakeFields({
  widthCm,
  sizeId,
  guestCount,
  onWidthChange,
  onSizeChange,
  error,
}: {
  widthCm?: number;
  sizeId?: string;
  guestCount?: number;
  onWidthChange: (widthCm: number | undefined) => void;
  onSizeChange: (sizeId: string) => void;
  error?: string;
}) {
  const lengths = tableCakeSizes.filter((s) => s.widthCm === widthCm);
  const fits = (s: (typeof tableCakeSizes)[number]) =>
    !!guestCount && !!s.servingsMin && guestCount >= s.servingsMin && guestCount <= (s.servingsMax ?? s.servingsMin);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={fieldLabelClass}>Width</span>
          <select
            value={widthCm ?? ""}
            onChange={(e) => onWidthChange(e.target.value ? Number(e.target.value) : undefined)}
            className={selectClass}
          >
            <option value="">Select…</option>
            {tableCakeWidths.map((w) => (
              <option key={w} value={w}>
                {w}cm wide
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={fieldLabelClass}>
            Length
            <span className="text-red-ink" aria-hidden>
              {" "}
              *
            </span>
          </span>
          <select
            name="tableSizeId"
            value={sizeId ?? ""}
            disabled={!widthCm}
            onChange={(e) => onSizeChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "tableSizeId-error" : undefined}
            className={selectClass}
          >
            <option value="">{widthCm ? "Select…" : "Pick a width first"}</option>
            {lengths.map((s) => {
              const servings = tableServingsLabel(s);
              return (
                <option key={s.id} value={s.id}>
                  {formatLengthCm(s.lengthCm)} long{servings ? `, serves ${servings}` : ""} — {formatPriceFrom(s.priceFrom)}
                  {fits(s) ? " (fits your guests)" : ""}
                </option>
              );
            })}
          </select>
        </label>
      </div>
      {error && (
        <p id="tableSizeId-error" role="alert" className="text-sm font-medium text-red-ink">
          {error}
        </p>
      )}
      <p className="text-sm text-ink-soft">
        These sizes are a guideline — we can do wider or longer cakes. Tell us what you need in your
        design brief.
      </p>
    </div>
  );
}

export function ItalianCakeNote() {
  return (
    <div className="rounded-[4px] border border-rule bg-icing p-4 text-sm">
      <p className="text-ink">
        {italianCake.sizeCm}cm, {italianCake.layersNote}, serves {italianCake.servingsMin}–{italianCake.servingsMax}
        <span className="font-mono tabular-nums"> — {formatPriceFrom(italianCake.priceFrom)}</span>
      </p>
      <p className="mt-2 text-ink-soft">
        Available in every flavour. We recommend {italianCake.recommendation}. Need it bigger or
        smaller? Pop your number of servings above and we&apos;ll suggest a size.
      </p>
    </div>
  );
}
