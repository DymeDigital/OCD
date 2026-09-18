import Image from "next/image";
import type { ReactNode } from "react";
import type { StoredOrder } from "@/lib/order-store";
import { formatDateZA, collectionWindowLabel } from "@/lib/order-summary";
import { flavourLabel } from "@/lib/ledger";
import { LedgerPanel } from "@/components/order/ledger-panel";
import { LedgerRow } from "@/components/register-b";
import { designTiers } from "@/content/data/designTiers";
import type { OrderFormValues, WeddingOrderFormValues } from "@/lib/schemas";

// The read-only counterpart to the order form itself — a receipt, not another form. Pure
// Register B: reuses LedgerPanel/LedgerRow (CLAUDE.md §5), no Register A styling here.

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return <LedgerRow label={label} value={String(value)} />;
}

// lib/schemas.ts's optionalEnum() fields (cakeShape, foundUs) type as `unknown` in
// OrderFormValues/WeddingOrderFormValues — z.input of a z.preprocess field is always `unknown`,
// since preprocess accepts anything before validating it. By the time it's in a StoredOrder it's
// already passed schema validation server-side, so this is a safe runtime narrow, not a cast.
function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="label mb-3 text-ink-soft">{title}</p>
      <div className="divide-y divide-rule border-y border-rule">{children}</div>
    </section>
  );
}

function StandardFields({ data }: { data: OrderFormValues }) {
  return (
    <Section title="Order details">
      <Row label="Occasion" value={data.occasion} />
      <Row label="Date needed" value={data.eventDate && formatDateZA(data.eventDate)} />
      <Row label="Making" value={data.productType} />
      <Row label="Guest count" value={data.guestCount} />
      <Row label="Cake shape" value={str(data.cakeShape)} />
      <Row label="Cake flavour" value={data.cakeFlavourId && flavourLabel(data.cakeFlavourId, data.cakeFlavourFillings)} />
      <Row label="Cupcake dozens" value={data.cupcakeDozens} />
      <Row label="Cupcake flavour" value={data.cupcakeFlavourId && flavourLabel(data.cupcakeFlavourId, data.cupcakeFlavourFillings)} />
      <Row label="Cake dietary" value={data.cakeDietaryOptions?.join(", ")} />
      <Row label="Cupcake dietary" value={data.cupcakeDietaryOptions?.join(", ")} />
      <Row
        label="Design tier"
        value={designTiers.find((t) => t.id === data.designTierId)?.label}
      />
      <Row label="Add-ons" value={data.addOns} />
    </Section>
  );
}

function WeddingFields({ data }: { data: WeddingOrderFormValues }) {
  return (
    <Section title="Order details">
      <Row label="Partners" value={data.partnerNames} />
      <Row label="Venue" value={data.venue} />
      <Row label="Venue contact" value={data.venueContact} />
      <Row label="Wedding date" value={data.weddingDate && formatDateZA(data.weddingDate)} />
      <Row label="Time" value={data.weddingTime} />
      <Row label="Guest count" value={data.guestCount} />
      <Row
        label="Tiers"
        value={data.tierCount ? `${data.tierCount}${data.fauxTierCount ? ` (${data.fauxTierCount} faux)` : ""}` : undefined}
      />
      <Row label="Flavour(s)" value={data.perTierFlavourIds?.map((id) => flavourLabel(id, data.flavourFillings)).join(", ")} />
      <Row label="Dietary" value={data.dietaryOptions?.join(", ")} />
      <Row label="Cake table setup" value={data.cakeTableSetup} />
      <Row label="Tasting wanted" value={data.tastingWanted ? "Yes" : "No"} />
      <Row
        label="Planner"
        value={data.plannerName ? `${data.plannerName}${data.plannerContact ? ` — ${data.plannerContact}` : ""}` : undefined}
      />
      <Row label="Dietary requirements" value={data.dietaryRequirements} />
    </Section>
  );
}

export function OrderDetail({ order }: { order: StoredOrder }) {
  const { data } = order;

  return (
    <div className="space-y-12">
      <div>
        <p className="label text-ink-soft">Order {order.token.slice(0, 8)}</p>
        <h1 className="mt-2 font-display text-2xl font-medium">
          {order.kind === "wedding" ? order.data.partnerNames : order.data.fullName}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Received {formatDateZA(order.createdAt)}</p>
      </div>

      {order.kind === "standard" ? <StandardFields data={order.data} /> : <WeddingFields data={order.data} />}

      {(data.designBrief || data.notes) && (
        <section className="space-y-6">
          {data.designBrief && (
            <div>
              <p className="label text-ink-soft">Design brief</p>
              <p className="mt-2 whitespace-pre-wrap">{data.designBrief}</p>
            </div>
          )}
          {data.notes && (
            <div>
              <p className="label text-ink-soft">Notes</p>
              <p className="mt-2 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </section>
      )}

      <Section title={data.deliveryMode === "delivery" ? "Delivery" : "Collection"}>
        <Row label="Address" value={data.deliveryMode === "delivery" ? data.address : "Collection from OCD"} />
        {data.deliveryMode === "collection" && (
          <Row label="Collection window" value={collectionWindowLabel(data.collectionWindow)} />
        )}
      </Section>

      <Section title="Contact">
        <Row label="Full name" value={data.fullName} />
        <Row label="Number" value={data.contactNumber} />
        <Row label="WhatsApp number" value={str(data.whatsappNumber)} />
        <Row label="Email" value={data.email} />
        <Row label="Found us via" value={str(data.foundUs)} />
      </Section>

      <div>
        <p className="label mb-3 text-ink-soft">Ledger</p>
        <LedgerPanel ledger={order.ledger} />
      </div>

      <div>
        <p className="label mb-3 text-ink-soft">Signature</p>
        <div className="flex items-end justify-between gap-6 border-b border-ink pb-2">
          <p className="font-display text-2xl italic text-ink">{order.signatureName}</p>
          <p className="whitespace-nowrap text-sm text-ink-soft">Signed {formatDateZA(order.agreedAt)}</p>
        </div>
      </div>

      {order.referenceImages.length > 0 && (
        <div>
          <p className="label mb-3 text-ink-soft">Reference photos</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {order.referenceImages.map((img) => (
              <div key={img.url} className="relative aspect-square overflow-hidden rounded-[4px] bg-icing">
                <Image
                  src={img.url}
                  alt={img.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 33vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
