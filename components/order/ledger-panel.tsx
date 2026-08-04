"use client";

import type { Ledger } from "@/lib/ledger";
import { formatPriceFrom } from "@/lib/pricing";

// The signature element (§5): line items build as the form is filled, mono figures, a
// --red-ink total, and a plain-language "not final" note. Sidebar on desktop, sticky sheet on
// mobile — this is Register B, the order form's own stationery.
export function LedgerPanel({ ledger, className = "" }: { ledger: Ledger; className?: string }) {
  const empty = ledger.lines.length === 0;

  return (
    <aside
      className={`self-start border border-rule bg-icing p-6 md:sticky md:top-24 md:p-8 ${className}`}
      aria-label="Order summary"
    >
      <p className="label text-ink-soft">Your ledger</p>
      {empty ? (
        <p className="mt-4 text-sm text-ink-soft">
          Start filling in the form and your order will build itself here, line by line.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-rule">
          {ledger.lines.map((line, i) => (
            <div key={`${line.label}-${i}`} className="flex items-baseline justify-between gap-4 py-3">
              <div>
                <p className="text-sm">{line.label}</p>
                {line.detail && <p className="text-xs text-ink-soft">{line.detail}</p>}
              </div>
              <p className="font-mono whitespace-nowrap text-sm">{formatPriceFrom(line.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {!empty && (
        <div className="ledger-double-rule mt-2 flex items-baseline justify-between gap-4 pt-3">
          <p className="label">Estimated, from</p>
          <p className="font-mono text-lg text-red-ink">{formatPriceFrom(ledger.priceFrom)}</p>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-soft">
        Not final — we&apos;ll confirm the real price once we&apos;ve talked through your design.
      </p>
    </aside>
  );
}
