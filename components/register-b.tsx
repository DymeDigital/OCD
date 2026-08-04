import type { ReactNode } from "react";

// Register B — CLAUDE.md §5: "Ruled paper. Tabular figures. Running line items." Used on order
// forms, pricing tables, menus — never on Register A pages (§5: don't blend the two registers).

export function SectionB({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-[1280px] px-6 py-16 md:px-12 ${className}`}>
      {children}
    </section>
  );
}

export function LedgerRow({
  label,
  detail,
  value,
  className = "",
}: {
  label: string;
  detail?: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-b border-rule py-3 ${className}`}>
      <div>
        <p>{label}</p>
        {detail && <p className="text-sm text-ink-soft">{detail}</p>}
      </div>
      <p className="font-mono whitespace-nowrap">{value}</p>
    </div>
  );
}

export function LedgerTotal({ label, value }: { label: string; value: string }) {
  return (
    <div className="ledger-double-rule mt-2 flex items-baseline justify-between gap-4 pt-3">
      <p className="label">{label}</p>
      <p className="font-mono text-lg text-red-ink">{value}</p>
    </div>
  );
}
