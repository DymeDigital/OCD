"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { flavours, egglessFlavourIds, defaultFillingLabel, withSurcharge } from "@/content/data/flavours";
import { fillingSurchargePct } from "@/lib/flavour-pricing";
import { fillings, egglessFillings, USUAL_FILLING_ID } from "@/content/data/fillings";
import type { TierPick } from "@/lib/flavour-picks";
import { fieldBoxClass, fieldLabelClass, checkboxClass } from "@/components/order/fields";

// Register B: a ruled sheet with one line per tier (top first) or per dozen — the per-tier answer
// to "which tier is which flavour" (client-requested 2026-10-24). Native selects throughout, so it
// stays quick on a 375px phone and needs no custom keyboard handling.

const selectClass = `mt-1 ${fieldBoxClass}`;

/** A to-scale side view of the cake, top tier first, each tier carrying the flavour picked for it
 * in the rows below — so "top" and "bottom" can't get swapped in anyone's head. Dummy tiers are
 * drawn dashed. Purely a picture of the rows below, so it's hidden from screen readers. */
export function TierStack({ tiers }: { tiers: TierPick[] }) {
  if (tiers.length < 2) return null;
  const maxCm = Math.max(...tiers.map((t) => t.sizeCm ?? 0)) || 1;
  return (
    <div aria-hidden className="flex flex-col items-center rounded-[4px] bg-icing px-4 pb-4 pt-6">
      {tiers.map((t, i) => {
        const name = t.faux ? "Dummy" : flavours.find((f) => f.id === t.flavourId)?.name;
        return (
          <div
            key={i}
            style={{ width: `${Math.max(30, ((t.sizeCm ?? maxCm) / maxCm) * 100)}%` }}
            className={`-mt-px flex h-10 items-center justify-center border px-2 ${
              t.faux ? "border-dashed border-ink-soft bg-icing text-ink-soft" : "border-ink bg-paper text-ink"
            } ${i === 0 ? "rounded-t-[4px]" : ""}`}
          >
            <span className="truncate text-xs">{name ?? "?"}</span>
          </div>
        );
      })}
      {/* The cake board. */}
      <div className="h-1 w-[calc(100%+1rem)] max-w-full rounded-[4px] bg-ink" />
    </div>
  );
}

export function FlavourSheet({
  name,
  rows,
  noun,
  rowTitle,
  rowMeta,
  category,
  eggless,
  allowFaux,
  register,
  setValue,
  errorFor,
}: {
  // Form path of the array, e.g. "cakeTiers", "tiers", "cupcakeDozenFlavours".
  name: string;
  rows: TierPick[];
  noun: "tier" | "dozen";
  rowTitle: (index: number) => string;
  rowMeta?: (index: number) => string | undefined;
  category: "cake" | "cupcake";
  eggless: boolean;
  allowFaux?: boolean;
  register: (path: string) => UseFormRegisterReturn;
  setValue: (path: string, value: unknown) => void;
  errorFor: (path: string) => string | undefined;
}) {
  const options = flavours.filter((f) => f.category === category || f.category === "both");
  const fillingOptions = eggless ? egglessFillings : fillings;
  // Flavour percentages apply to cakes only (lib/flavour-pricing.ts) — cupcakes never show them.
  const pct = (label: string, value: number | undefined) => (category === "cake" ? withSurcharge(label, value) : label);

  return (
    <ol className="border-t border-ink">
      {rows.map((row, i) => {
        const path = `${name}.${i}`;
        const title = rowTitle(i);
        const meta = rowMeta?.(i);
        const flavour = flavours.find((f) => f.id === row.flavourId);
        const flavourReg = register(`${path}.flavourId`);
        const error =
          errorFor(`${path}.flavourId`) ??
          errorFor(`${path}.spongeId`) ??
          errorFor(`${path}.fillingId`) ??
          errorFor(`${path}.faux`);
        const errorId = `${path}-error`;
        return (
          <li key={i} data-scroll-target className="border-b border-ledger-line py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <p className="font-medium">
                {title}
                {meta && <span className="ml-2 font-mono text-sm text-ink-soft tabular-nums">{meta}</span>}
              </p>
              {allowFaux && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    {...register(`${path}.faux`)}
                    className={checkboxClass}
                  />
                  Make this a dummy tier
                </label>
              )}
            </div>

            {row.faux ? (
              <p className="mt-2 text-sm text-ink-soft">Polystyrene, iced to match the real tiers.</p>
            ) : (
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="sr-only">
                    {title}
                    {meta ? `, ${meta}` : ""} — flavour
                  </span>
                  <select
                    {...flavourReg}
                    onChange={(e) => {
                      // A sponge or filling belongs to the flavour it was picked for — clear both
                      // so a switch never carries a stale choice over silently.
                      void flavourReg.onChange(e);
                      setValue(`${path}.spongeId`, "");
                      setValue(`${path}.fillingId`, "");
                    }}
                    aria-invalid={!!errorFor(`${path}.flavourId`)}
                    aria-describedby={error ? errorId : undefined}
                    className={selectClass}
                  >
                    <option value="">Pick a flavour for this {noun}…</option>
                    {options.map((f) => (
                      <option key={f.id} value={f.id} disabled={eggless && !egglessFlavourIds.includes(f.id)}>
                        {pct(f.name, f.surchargePct)}
                      </option>
                    ))}
                  </select>
                </label>
                {flavour && !flavour.spongeChoices && !flavour.hasFillingChoice && (
                  <p className="text-sm text-ink-soft">{defaultFillingLabel(flavour, eggless)}</p>
                )}
                {flavour && (flavour.spongeChoices || flavour.hasFillingChoice) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {flavour.spongeChoices && (
                      <label className="block">
                        <span className={fieldLabelClass}>Sponge</span>
                        <select
                          {...register(`${path}.spongeId`)}
                          aria-invalid={!!errorFor(`${path}.spongeId`)}
                          className={selectClass}
                        >
                          <option value="">Select…</option>
                          {flavour.spongeChoices.map((s) => (
                            <option key={s.id} value={s.id}>
                              {pct(s.label, s.surchargePct)}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {flavour.hasFillingChoice && (
                      <label className="block">
                        <span className={fieldLabelClass}>Filling</span>
                        <select
                          {...register(`${path}.fillingId`)}
                          aria-invalid={!!errorFor(`${path}.fillingId`)}
                          className={selectClass}
                        >
                          <option value="">Select…</option>
                          <option value={USUAL_FILLING_ID}>
                            {pct(`Our usual — ${defaultFillingLabel(flavour, eggless)}`, fillingSurchargePct(USUAL_FILLING_ID, flavour.id))}
                          </option>
                          {fillingOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                              {pct(o.label, o.surchargePct)}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && (
              <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-red-ink">
                {error}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
