import Link from "next/link";
import Image from "next/image";
import { CTA_LABEL, CTA_HREF } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-icing">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-12">
        {/* Client-requested 2026-10-30: the brand block is centred at every width (it used to
            left-align from md up), with the contact details and CTA stacked beneath it. */}
        <div className="flex flex-col items-center text-center">
          <Image src="/images/ocd-logo.png" alt="" width={48} height={48} className="h-12 w-12" aria-hidden />
          <p className="mt-4 font-display text-lg font-normal md:text-xl">Obsessive Cupcake Disorder</p>
          <p className="label mt-2 text-ink-soft">It will have you in a frenzy.</p>
          <p className="mt-6 max-w-sm text-ink-soft">
            Bespoke cakes, cupcakes and signature confections, made to order in Durban.
          </p>
          <p className="mt-6 text-ink-soft">
            Durban, South Africa
            <br />
            Est. 2017
          </p>
          <Link
            href={CTA_HREF}
            className="label mt-8 inline-block rounded-[4px] border border-ink px-5 py-2.5 transition-colors hover:bg-ink hover:text-paper"
          >
            {CTA_LABEL}
          </Link>
        </div>

        <p className="mt-16 border-t border-rule pt-6 text-center text-sm text-ink-soft">
          © {new Date().getFullYear()} Obsessive Cupcake Disorder
        </p>

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
