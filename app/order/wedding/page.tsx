import type { Metadata } from "next";
import { SectionB } from "@/components/register-b";
import { WeddingForm } from "@/components/order/wedding-form";

export const metadata: Metadata = {
  title: "Start your wedding order",
  description: "Tell us about your wedding cake — venue, date, tiers, and design. We'll come back to you within 24 hours.",
};

export default function WeddingOrderPage() {
  return (
    <SectionB className="pt-12">
      <p className="label text-ink-soft">Wedding order</p>
      <h1 className="mt-3 max-w-xl font-display text-2xl font-medium">Tell us about your wedding cake.</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Wedding cakes get their own process — more design time, and terms built for a day that
        can&apos;t move. Nothing&apos;s locked in yet.
      </p>
      <div className="mt-12">
        <WeddingForm />
      </div>
    </SectionB>
  );
}
