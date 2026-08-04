"use client";

import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

// Register B field style: a label above a single ruled baseline — no boxes, written like a line
// on ruled paper. Selects/textareas get the one sanctioned 4px radius since they're real boxes.

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium">
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
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
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

export function SelectField({
  label,
  error,
  required,
  register,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  children: ReactNode;
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
}: {
  legend: string;
  name: string;
  options: { value: string; label: string; description?: string }[];
  register: UseFormRegisterReturn;
  error?: string;
}) {
  const errorId = `${name}-error`;
  return (
    <fieldset>
      <legend className="label text-ink-soft">{legend}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="cursor-pointer rounded-[4px] border border-rule p-4 has-[:checked]:border-ink has-[:checked]:bg-icing"
          >
            <input type="radio" value={opt.value} {...register} className="sr-only" />
            <span className="block font-medium">{opt.label}</span>
            {opt.description && <span className="mt-1 block text-sm text-ink-soft">{opt.description}</span>}
          </label>
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
}: {
  legend: string;
  options: { value: string; label: string; description?: string }[];
  register: UseFormRegisterReturn;
}) {
  return (
    <fieldset>
      <legend className="label text-ink-soft">{legend}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-start gap-3 rounded-[4px] border border-rule p-4 has-[:checked]:border-ink has-[:checked]:bg-icing"
          >
            <input type="checkbox" value={opt.value} {...register} className="mt-1" />
            <span>
              <span className="block font-medium">{opt.label}</span>
              {opt.description && <span className="mt-1 block text-sm text-ink-soft">{opt.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
