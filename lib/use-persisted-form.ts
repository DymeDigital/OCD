"use client";

import { useEffect, useRef } from "react";
import { useForm, type FieldValues, type DefaultValues, type Resolver } from "react-hook-form";

// §9: "state persisted to localStorage so nobody loses work." Demo-phase only — see CLAUDE.md §4;
// this never sends anywhere, it just survives a refresh or an interrupted mobile session.
//
// Takes an already-built `Resolver` (i.e. call `zodResolver(schema)` at the call site) rather
// than a raw Zod schema — that keeps the Zod<->RHF generic inference precise, which it isn't
// when a schema is passed through an extra generic function boundary.
export function usePersistedForm<T extends FieldValues>(
  key: string,
  // zodResolver's TContext/TTransformedValues generics don't unify cleanly through this extra
  // function boundary (see file comment above) — `any` here is a deliberate escape hatch.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolver: Resolver<T, any, any>,
  defaultValues: DefaultValues<T>
) {
  const hydrated = useRef(false);
  const form = useForm<T>({
    resolver,
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) form.reset(JSON.parse(saved));
    } catch {
      // corrupt/blocked storage — start fresh rather than block the form
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sub = form.watch((values) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(values));
      } catch {
        // storage full/blocked — autosave is a convenience, not a requirement
      }
    });
    return () => sub.unsubscribe();
  }, [form, key]);

  return form;
}

export function clearPersistedForm(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
