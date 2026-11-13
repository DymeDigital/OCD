import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { SectionB } from "@/components/register-b";
import { requireAdmin } from "@/lib/cms/auth";

// The client's editor for site content (CLAUDE.md §4). Behind Cloudflare Access in production;
// lib/cms/auth.ts re-checks the Access token here and on every /api/admin call.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin(await headers());
  if (!admin) {
    return (
      <SectionB className="pt-12">
        <h1 className="font-display text-xl font-normal">This page is for the OCD team.</h1>
        <p className="mt-4 max-w-md text-ink-soft">
          Sign in with the email address that has admin access. If you just signed in, reload the page.
        </p>
      </SectionB>
    );
  }
  return <SectionB className="pt-12">{children}</SectionB>;
}
