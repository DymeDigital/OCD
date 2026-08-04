import type { Metadata } from "next";
import { SectionB } from "@/components/register-b";
import { OrderForm } from "@/components/order/order-form";

export const metadata: Metadata = {
  title: "Start your order",
  description: "Tell us about your cake — flavour, size, design, and delivery. We'll come back to you within 24 hours.",
};

export default function OrderPage() {
  return (
    <SectionB className="pt-12">
      <p className="label text-ink-soft">Order</p>
      <h1 className="mt-3 max-w-xl font-display text-2xl font-medium">Tell us about your cake.</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Nothing&apos;s locked in yet — we&apos;ll confirm everything with you first.
      </p>
      <div className="mt-12">
        <OrderForm />
      </div>
    </SectionB>
  );
}
