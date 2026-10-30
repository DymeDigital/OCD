"use client";

import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

// Register B fields. Client-requested 2026-10-30: inputs were a #E4E4E4 baseline on white (~1.2:1),
// easy to miss and below WCAG 1.4.11's 3:1 for a control's edge — so every input, select and
// textarea is now a real box: paper fill, an --ink-soft border (~5:1), ink on hover/focus, red-ink
// once invalid. Labels are ink, sentence case. Still only palette tokens — no new colour.

/** The box every text/number/date input, select and textarea on the order forms uses. */
export const fieldBoxClass =
  "w-full min-h-11 rounded-[4px] border border-ink-soft bg-paper px-3 py-2.5 text-ink transition-colors hover:border-ink focus:border-ink aria-[invalid=true]:border-red-ink disabled:cursor-not-allowed disabled:opacity-40";

/** A field's own label — ink, so the question reads before the box does. */
export const fieldLabelClass = "block text-sm font-medium text-ink";

/** Native checkboxes, sized up so they're easy to see and tap. */
export const checkboxClass = "h-5 w-5 shrink-0 cursor-pointer accent-ink";

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-red-ink">
      {children}
    </p>
  );
}

function RequiredMark({ required }: { required?: boolean }) {
  if (!required) return null;
  return (
    <span className="text-red-ink" aria-hidden>
      {" "}
      *
    </span>
  );
}

// `emphasis` (inside a FollowUpPanel or on an icing ground) sets the label as a question in body
// size; otherwise it's the standard field label. The box itself is the same either way.
function FieldLabel({ label, required, emphasis }: { label: string; required?: boolean; emphasis?: boolean }) {
  return (
    <span className={emphasis ? "block font-medium text-ink" : fieldLabelClass}>
      {label}
      <RequiredMark required={required} />
    </span>
  );
}

function Hint({ children }: { children?: string }) {
  if (!children) return null;
  return <span className="mt-1 block text-sm text-ink-soft">{children}</span>;
}

export function TextField({
  label,
  hint,
  error,
  required,
  register,
  type = "text",
  emphasis,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  type?: string;
  emphasis?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${register.name}-error`;
  return (
    <label className="block">
      <FieldLabel label={label} required={required} emphasis={emphasis} />
      <Hint>{hint}</Hint>
      <input
        type={type}
        {...register}
        {...rest}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 ${fieldBoxClass}`}
      />
      <ErrorText id={errorId}>{error}</ErrorText>
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  register,
  rows = 4,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  rows?: number;
}) {
  const errorId = `${register.name}-error`;
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <Hint>{hint}</Hint>
      <textarea
        rows={rows}
        {...register}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 ${fieldBoxClass}`}
      />
      <ErrorText id={errorId}>{error}</ErrorText>
    </label>
  );
}

// A required follow-up to the card just picked above it (a flavour's sponge or filling). Indented
// like a ledger sub-entry — icing ground, ink rule on the left — so it reads as part of that
// choice, not as more options in the list. `data-scroll-target` is where the forms scroll to
// when Continue is blocked on it.
export function FollowUpPanel({ children }: { children: ReactNode }) {
  return (
    <div data-scroll-target className="rounded-[4px] border-l-2 border-ink bg-icing p-4 sm:p-5">
      {children}
    </div>
  );
}

function QuestionText({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="block font-medium text-ink">
      {children}
      <RequiredMark required={required} />
    </span>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  register,
  children,
  emphasis,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  children: ReactNode;
  emphasis?: boolean;
}) {
  const errorId = `${register.name}-error`;
  return (
    <label className="block">
      <FieldLabel label={label} required={required} emphasis={emphasis} />
      <Hint>{hint}</Hint>
      <select
        {...register}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 ${fieldBoxClass}`}
      >
        {children}
      </select>
      <ErrorText id={errorId}>{error}</ErrorText>
    </label>
  );
}

// Option cards: an --ink-soft edge at rest so each one reads as something to tap, ink on hover,
// and once picked an ink ring + icing fill — unmistakable without spending red-ink.
const optionCardClass =
  "cursor-pointer rounded-[4px] border border-ink-soft bg-paper p-4 transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-icing has-[:checked]:ring-1 has-[:checked]:ring-inset has-[:checked]:ring-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-red-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40 has-[:disabled]:hover:border-ink-soft";

/** The question a card group asks — body size, ink, so it reads as the thing to answer. */
const legendClass = "block font-medium text-ink";

export function RadioCardGroup({
  legend,
  name,
  options,
  register,
  error,
  hint,
  selectedValue,
  renderAfterSelected,
  emphasis,
  required,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  register: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  // Inside a FollowUpPanel: cards on paper, and the picked card inverts to ink so the choice is
  // unmistakable against the icing ground.
  emphasis?: boolean;
  required?: boolean;
  // Injects content (e.g. a follow-up field) directly after the currently selected card, in DOM
  // order — so on a single-column mobile layout it lands right under the choice it belongs to,
  // not after the whole list.
  selectedValue?: string | null;
  renderAfterSelected?: ReactNode;
}) {
  const errorId = `${name}-error`;
  const cardClass = emphasis
    ? "group cursor-pointer rounded-[4px] border border-ink bg-paper p-4 has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-red-ink"
    : optionCardClass;
  return (
    <fieldset>
      <legend className={legendClass}>
        <QuestionText required={required}>{legend}</QuestionText>
      </legend>
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <div key={opt.value} className="contents">
            <label className={cardClass}>
              <input
                type="radio"
                value={opt.value}
                disabled={opt.disabled}
                {...register}
                aria-describedby={error ? errorId : undefined}
                className="sr-only"
              />
              <span className="block font-medium">{opt.label}</span>
              {opt.description && (
                <span className="mt-1 block text-sm text-ink-soft group-has-[:checked]:text-paper">{opt.description}</span>
              )}
            </label>
            {selectedValue === opt.value && renderAfterSelected && (
              <div className="sm:col-span-2">{renderAfterSelected}</div>
            )}
          </div>
        ))}
      </div>
      <ErrorText id={errorId}>{error}</ErrorText>
    </fieldset>
  );
}

/**
 * Boolean-array checkbox group (e.g. "which flavours"). Bind with RHF's native array-of-checkbox
 * support: pass `register(name)` — the SAME UseFormRegisterReturn — to every option; RHF collects
 * checked `value`s into the array field because they all share one `name`.
 */
export function CheckboxCardGroup({
  legend,
  options,
  register,
  error,
  selectedValues,
  renderAfter,
}: {
  legend: string;
  options: { value: string; label: string; description?: string }[];
  register: UseFormRegisterReturn;
  error?: string;
  // Injects content (e.g. a follow-up field) directly after each checked card, in DOM order — so
  // on a single-column mobile layout it lands right under the choice it belongs to, not after the
  // whole list. `renderAfter` may return null/undefined for a value with nothing to show.
  selectedValues?: string[];
  renderAfter?: (value: string) => ReactNode;
}) {
  const errorId = `${register.name}-error`;
  return (
    <fieldset>
      <legend className={legendClass}>{legend}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const extra = selectedValues?.includes(opt.value) ? renderAfter?.(opt.value) : null;
          return (
            <div key={opt.value} className="contents">
              <label className={`flex items-start gap-3 ${optionCardClass}`}>
                <input
                  type="checkbox"
                  value={opt.value}
                  {...register}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  className={`mt-0.5 ${checkboxClass}`}
                />
                <span>
                  <span className="block font-medium">{opt.label}</span>
                  {opt.description && <span className="mt-1 block text-sm text-ink-soft">{opt.description}</span>}
                </span>
              </label>
              {extra && <div className="sm:col-span-2">{extra}</div>}
            </div>
          );
        })}
      </div>
      <ErrorText id={errorId}>{error}</ErrorText>
    </fieldset>
  );
}
