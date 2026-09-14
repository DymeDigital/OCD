"use client";

import { useState } from "react";
import Link from "next/link";
import { buildWhatsAppDeepLink } from "@/lib/order-summary";
import { socialLinks } from "@/content/data/socialLinks";
import { Button } from "@/components/button";

// Shown inline in place of the form when /api/submit-order fails outright, or saves the order but
// neither automated channel (email, WhatsApp) went through. CLAUDE.md §9: don't dead-end the
// client — they get their order back as text plus a direct WhatsApp link, so nothing is lost even
// if every automated send is down.
export function SubmitFallback({ summaryText, token }: { summaryText: string; token: string | null }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked — the textarea below is still selectable and copyable by hand.
    }
  }

  const ownerNumber = socialLinks.whatsappNumber.replace(/[^\d]/g, "");
  const waLink = buildWhatsAppDeepLink(ownerNumber, summaryText);

  return (
    <div className="space-y-6 border border-rule bg-icing p-6 md:p-8" role="alert">
      <div>
        <p className="label text-red-ink">We couldn&apos;t send that automatically</p>
        <p className="mt-2 text-ink-soft">
          Here&apos;s your order to send yourself — nothing&apos;s lost, and your draft is still
          saved if you&apos;d rather try again later.
        </p>
      </div>

      <label className="block">
        <span className="label text-ink-soft">Your order, as text</span>
        <textarea
          readOnly
          value={summaryText}
          rows={10}
          className="mt-2 w-full resize-none border border-rule bg-paper p-3 font-mono text-sm"
          onFocus={(e) => e.currentTarget.select()}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" onClick={handleCopy}>
          {copied ? "Copied" : "Copy order text"}
        </Button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="label inline-flex items-center gap-2 border border-ink px-6 py-3.5 text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Send on WhatsApp
        </a>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? "Order text copied" : ""}
      </p>

      {token && (
        <p className="text-sm text-ink-soft">
          Your order was saved —{" "}
          <Link href={`/o/${token}`} className="text-ink underline underline-offset-2 hover:text-red-ink">
            view it here
          </Link>
          .
        </p>
      )}
    </div>
  );
}
