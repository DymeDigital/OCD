import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionB } from "@/components/register-b";
import { OrderDetail } from "@/components/order/order-detail";
import { getOrder } from "@/lib/order-store";

// A private receipt link handed out over WhatsApp, never a page to be found — no sitemap entry,
// noindex/nofollow here specifically (CLAUDE.md §10 talks about SEO for the public site; this is
// the deliberate exception).
export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrder(token);
  if (!order) notFound();

  return (
    <SectionB className="pt-12">
      <OrderDetail order={order} />
    </SectionB>
  );
}
