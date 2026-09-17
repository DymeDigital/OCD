import Link from "next/link";
import Image from "next/image";
import { CTA_LABEL, CTA_HREF } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-icing">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-12">
        <div className="grid gap-12 text-center md:grid-cols-[1.5fr_1fr] md:text-left">
          <div>
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <Image src="/images/ocd-logo.png" alt="" width={36} height={36} className="h-9 w-9" aria-hidden />
              <span className="font-display text-lg font-semibold">Obsessive Cupcake Disorder</span>
            </div>
            <p className="label mt-2 text-ink-soft">It will have you in a frenzy.</p>
            <p className="mx-auto mt-6 max-w-sm text-ink-soft md:mx-0">
              Bespoke cakes, cupcakes and signature confections, made to order in Durban.
            </p>
          </div>

          <div>
            <p className="label text-ink-soft">Get in touch</p>
            <p className="mt-4 text-ink-soft">Durban, South Africa</p>
            <p className="text-ink-soft">Est. 2017</p>
            <Link
              href={CTA_HREF}
              className="label mt-6 inline-block rounded-[4px] border border-ink px-5 py-2.5 transition-colors hover:bg-ink hover:text-paper"
            >
              {CTA_LABEL}
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-2 border-t border-rule pt-6 text-center text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()} Obsessive Cupcake Disorder (Pty) Ltd. 2021/623273/07. ·{" "}
            <Link href="/privacy" className="transition-colors hover:text-ink">
              Privacy
            </Link>
          </p>
          <p>Nothing&apos;s locked in until we&apos;ve confirmed everything with you first.</p>
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft">
          Baked by{" "}
          <a
            href="https://dyme.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            Dyme Digital
          </a>
        </p>
      </div>
    </footer>
  );
}
