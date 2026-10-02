"use client";

import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

// Register B field style: a label above a single ruled baseline — no boxes, written like a line
// on ruled paper. Selects/textareas get the one sanctioned 4px radius since they're real boxes.

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-red-ink">
      {children}
    </p>
  );
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
  // On an icing ground: the label is set as a question and the input sits on paper.
  emphasis?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${register.name}-error`;
  if (emphasis) {
    return (
      <label className="block">
        <QuestionText required={required}>{label}</QuestionText>
        {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
        <input
          type={type}
          {...register}
          {...rest}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="mt-3 w-full rounded-[4px] border border-ink bg-paper px-3 py-2.5 text-ink"
        />
        <ErrorText id={errorId}>{error}</ErrorText>
      </label>
    );
  }
  return (
    <label className="block">
      <span className="label text-ink-soft">
        {label}
        {required && (
          <span className="text-red-ink" aria-hidden>
            {" "}
            *
          </span>
        )}
      </span>
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
      <input
        type={type}
        {...register}
        {...rest}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 w-full border-0 border-b border-rule bg-transparent py-2 text-ink focus:border-b-2 focus:border-ink focus:outline-none"
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
      <span className="label text-ink-soft">
        {label}
        {required && (
          <span className="text-red-ink" aria-hidden>
            {" "}
            *
          </span>
        )}
      </span>
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
      <textarea
        rows={rows}
        {...register}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 w-full rounded-[4px] border border-rule bg-transparent p-3 text-ink focus:border-ink focus:outline-none"
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
      {required && (
        <span className="text-red-ink" aria-hidden>
          {" "}
          *
        </span>
      )}
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
  // Inside a FollowUpPanel: the label is set as a question and the select sits on paper.
  emphasis?: boolean;
}) {
  const errorId = `${register.name}-error`;
  if (emphasis) {
    return (
      <label className="block">
        <QuestionText required={required}>{label}</QuestionText>
        {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
        <select
          {...register}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="mt-3 w-full rounded-[4px] border border-ink bg-paper px-3 py-2.5 text-ink"
        >
          {children}
        </select>
        <ErrorText id={errorId}>{error}</ErrorText>
      </label>
    );
  }
  return (
    <label className="block">
      <span className="label text-ink-soft">
        {label}
        {required && (
          <span className="text-red-ink" aria-hidden>
            {" "}
            *
          </span>
        )}
      </span>
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
      <select
        {...register}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 w-full rounded-[4px] border border-rule bg-transparent px-3 py-2.5 text-ink focus:border-ink focus:outline-none"
      >
        {children}
      </select>
      <ErrorText id={errorId}>{error}</ErrorText>
    </label>
  );
}

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
  // Inside a FollowUpPanel: legend set as a question, cards on paper, and the picked card
  // inverts to ink so the choice is unmistakable against the icing ground.
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
    : "cursor-pointer rounded-[4px] border border-rule p-4 has-[:checked]:border-ink has-[:checked]:bg-icing has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40";
  return (
    <fieldset>
      <legend className={emphasis ? "block" : "label text-ink-soft"}>
        {emphasis ? <QuestionText required={required}>{legend}</QuestionText> : legend}
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
                aria-describedby={emphasis && error ? errorId : undefined}
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
      <legend className="label text-ink-soft">{legend}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const extra = selectedValues?.includes(opt.value) ? renderAfter?.(opt.value) : null;
          return (
            <div key={opt.value} className="contents">
              <label className="flex cursor-pointer items-start gap-3 rounded-[4px] border border-rule p-4 has-[:checked]:border-ink has-[:checked]:bg-icing">
                <input
                  type="checkbox"
                  value={opt.value}
                  {...register}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  className="mt-1 h-4 w-4 shrink-0 rounded-[2px] border border-rule accent-ink"
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
