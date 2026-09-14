import { SectionB } from "@/components/register-b";
import { ButtonLink } from "@/components/button";

export default function OrderNotFound() {
  return (
    <SectionB className="pt-12 text-center">
      <p className="label text-ink-soft">Order</p>
      <h1 className="mt-3 font-display text-2xl font-medium">This link isn&apos;t valid.</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        The order this points to doesn&apos;t exist, or the link&apos;s been mistyped. If
        you&apos;re the customer, check the WhatsApp message we sent for the right one.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <ButtonLink href="/order">Start a new order</ButtonLink>
        <ButtonLink href="/contact" variant="ghost">
          Contact us
        </ButtonLink>
      </div>
    </SectionB>
  );
}
