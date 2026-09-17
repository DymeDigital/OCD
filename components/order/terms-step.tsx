"use client";

import { useEffect } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import {
  standardContractSections,
  standardAcknowledgement,
  weddingContractSections,
  weddingAcknowledgement,
} from "@/content/data/terms";

// The order form's paper counterpart has a signature line at the bottom of every page (Order
// Form PDF "Client Acknowledgement", Wedding Cake Contract clause 12). This is that line, moved
// onto the web: the same clause text as a ruled contract sheet, then a typed name standing in for
// a signature, dated automatically. Register B — this lives inside the order form, not the
// gallery pages.

function todayZA() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function TermsStep({
  kind,
  fullName,
  signatureName,
  signatureNameRegister,
  signatureNameError,
  agreedToTermsRegister,
  agreedError,
  onPrefillSignature,
}: {
  kind: "standard" | "wedding";
  fullName?: string;
  signatureName?: string;
  signatureNameRegister: UseFormRegisterReturn;
  signatureNameError?: string;
  agreedToTermsRegister: UseFormRegisterReturn;
  agreedError?: string;
  onPrefillSignature: (name: string) => void;
}) {
  const sections = kind === "standard" ? standardContractSections : weddingContractSections;
  const acknowledgement = kind === "standard" ? standardAcknowledgement : [weddingAcknowledgement];

  // Signing is a deliberate re-affirmation, not just a copy of the name typed three steps ago —
  // but there's no reason to make someone retype it from scratch, so the field arrives prefilled
  // and editable the first time this step is reached.
  useEffect(() => {
    if (!signatureName && fullName) onPrefillSignature(fullName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName]);

  return (
    <div className="space-y-8">
      <div>
        <p className="label text-ink-soft">Terms & conditions</p>
        <h2 className="mt-2 font-display text-xl font-medium">Read, then sign.</h2>
        <p className="mt-2 max-w-xl text-ink-soft">
          {kind === "standard"
            ? "This is the same acknowledgement on our paper order form — payment, cancellations, allergens and cake care, all in one place."
            : "This is the same Wedding Cake Contract we'd otherwise hand you on paper — booking, design, payment, delivery and liability, clause by clause."}
        </p>
      </div>

      <div className="max-h-[420px] overflow-y-auto rounded-[4px] border border-rule p-6 md:p-8">
        <div className="divide-y divide-rule">
          {sections.map((section, i) => (
            <div key={section.title} className={i === 0 ? "pb-6" : "py-6"}>
              <p className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium">{section.title.replace(/^\d+\.\s*/, "")}</span>
              </p>
              <ul className="mt-3 space-y-2 pl-8 text-sm text-ink-soft">
                {section.bullets.map((b) => (
                  <li key={b} className="list-disc">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="label text-ink-soft">Client acknowledgement</p>
        <p className="mt-2 text-sm text-ink-soft">
          {kind === "standard"
            ? "By signing below, I confirm that I have read, understood and agree to the terms outlined above, including:"
            : weddingAcknowledgement}
        </p>
        {kind === "standard" && (
          <ul className="mt-3 space-y-1.5 pl-5 text-sm text-ink-soft">
            {acknowledgement.map((item) => (
              <li key={item} className="list-disc">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-rule pt-8">
        <label className="block">
          <span className="label text-ink-soft">
            Type your full name to sign
            <span className="text-red-ink" aria-hidden>
              {" "}
              *
            </span>
          </span>
          <input
            type="text"
            {...signatureNameRegister}
            aria-invalid={!!signatureNameError}
            className="mt-2 w-full border-0 border-b border-rule bg-transparent py-2 text-ink focus:border-b-2 focus:border-ink focus:outline-none"
            placeholder="Full legal name"
          />
          {signatureNameError && (
            <p role="alert" className="mt-1.5 text-sm font-medium text-red-ink">
              {signatureNameError}
            </p>
          )}
        </label>

        <div className="mt-6 flex items-end justify-between gap-6 border-b border-ink pb-2">
          <p className="font-display text-2xl italic text-ink" aria-hidden>
            {signatureName || "Your signature"}
          </p>
          <p className="whitespace-nowrap text-sm text-ink-soft">Signed {todayZA()}</p>
        </div>

        <label className="mt-6 flex items-start gap-3">
          <input
            type="checkbox"
            {...agreedToTermsRegister}
            className="mt-1 h-4 w-4 shrink-0 rounded-[2px] border border-rule accent-ink"
          />
          <span>
            I&apos;ve read and agree to the terms above.
            <span className="text-red-ink" aria-hidden>
              {" "}
              *
            </span>
          </span>
        </label>
        {agreedError && (
          <p role="alert" className="mt-1.5 pl-7 text-sm font-medium text-red-ink">
            {agreedError}
          </p>
        )}
      </div>
    </div>
  );
}
