# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Prospective customers** browsing to decide what to order for an occasion (birthday, celebration, event, high tea) — need to see flavours, sizes/servings, and signature confections, then submit an order/quote request without the friction of the current paper form.
- **Wedding clients** — a distinct, higher-stakes workflow: bespoke design, larger lead times, and terms governed by a separate Wedding Cake Contract.
- **The business owner (client, Yashill)** — receives whatever the customer submits and turns it into a confirmed, priced order; the form's job is to make that intake easier for both sides, not just prettier.

## Product Purpose

A marketing + order-intake website for OCD. It presents the product range (cakes, cupcakes, signature confections) with pricing, and lets a customer configure and submit a request — flavour(s), size/tier or serving count, cake shape, bespoke design details, and collection/delivery details — that the business receives and follows up on with a final quote.

Success = fewer incomplete/confusing submissions than the current PDF-based order form, without adding scope (no online payment yet).

## Positioning

Not decided. No differentiating mechanism or claim has been confirmed yet — do not invent one (no fabricated USP, no comparison to competitors).

## Operating Context

- Current process is entirely form/paper-based: customers fill in an **OCD Order Form** (standard cakes/cupcakes/confections) or go through a separate **Wedding Cake Contract** flow for weddings. Client (Yashill) describes this as "cumbersome" for customers to complete.
- Two distinct product lines with different terms:
  - **Standard orders** (cakes, cupcakes, signature confections): 14-day minimum lead time, full payment required to confirm, 50% of payment is a non-refundable deposit, credit-voucher-only cancellation policy (50%/25%/0% by notice window), proof of payment via email/WhatsApp, banking details (FNB/RMB) provided directly to the customer.
  - **Wedding cakes**: governed by a separate Wedding Cake Contract (OCD (PTY) LTD 2021/623273/07), with its own cancellation tiers (14-day/5-day cutoffs, 75% fee inside 14 days, non-refundable inside 5 days, 36-month credit voucher), design lock-in and change-fee terms, delivery/setup responsibility clauses, allergen disclaimers, and a Durban jurisdiction clause.
- Delivery charges are distance-based from the OCD premises (not a flat rate) — a final delivery cost cannot be quoted purely from an online form without the business pricing it.
- Bespoke/custom designs are inherently quote-based: the business reviews theme, colours, reference images and custom add-ons before finalizing a price — the site cannot show a fixed price for bespoke work.
- Sizing tables are described in the Product Guide as "a guideline only" — the business advises the final size for a given serving count, so the form should capture intent (servings/occasion) rather than force a binding size choice for bespoke orders.

## Capabilities and Constraints

- The order form must let a customer choose flavour(s), size/tier or serving count, and a collection/delivery location/range, mirroring what the paper **OCD Order Form 2026** already captures (customer details, collection/delivery/event date, delivery address, cake size/tier, flavour, shape, bespoke theme/design/colours/reference images/add-ons) plus the **Signature Confections** add-on list (cake pops, cakesicles, macarons, sugar cookies, cheesecakes, tartlets, mousse, scones, etc. — see Product Guide & Price Schedule 2026 for the full, current catalogue and pricing).
- **Explicitly out of scope for now: checkout / online payment.** The form collects and submits an order/quote request; it does not process payment. This is a deliberate current-phase constraint, not an oversight — do not build a cart or payment flow unless the client asks.
- The submitted order must reach the business in a usable form (e.g. emailed submission) — undecided: the exact delivery mechanism (email service, form backend, etc.) and whether wedding orders get a separate form/flow from standard orders on the site.
- All flavours, sizes, servings, and prices shown on the site must trace to **OCD Product Guide & Price Schedule 2026.pdf** — do not invent flavours, prices, or serving counts.
- Terms shown to customers (payment terms, cancellation policy, banking details, transport/storage/serving guidance) must trace to **OCD Order Form 2026.pdf** and **OCD Wedding Cake Contract 2026.pdf** — do not paraphrase away binding terms (deposit %, lead times, refund policy) since these are legal/financial commitments to customers.
- Terminology: "OCD" = Obsessive Cupcake Disorder throughout (not the clinical condition) — brand tagline is "IT WILL HAVE YOU IN A FRENZY."

## Brand Commitments

- Name: **Obsessive Cupcake Disorder**, trading as **OCD**. Registered entity: Obsessive Cupcake Disorder (PTY) LTD, 2021/623273/07.
- Existing logo mark: interlocking "OCD" lettermark in a circular frame, with tagline "IT WILL HAVE YOU IN A FRENZY" beneath it (seen on all client documents).
- Client-specified, binding: **white & black is the website theme and colour palette.**
- Client supplied two reference sites for inspiration (visual direction to be resolved in new-work, not here): honeybeebaker.co.za, and kcake.co.nz's cake-customization page.

## Evidence on Hand

- `OCD Product Guide & Price Schedule 2026.pdf` — full flavour list (14 named flavours with descriptions), sizes/servings/pricing table (single through six-tier), and Signature Confections menu with prices.
- `OCD Order Form 2026.pdf` — the existing paper order form: fields, structure, Signature Confections checklist, Payment & Terms, banking details, Cancellations & Refunds, Transport/Storage/Serving Guidelines, Client Acknowledgement.
- `OCD Wedding Cake Contract 2026.pdf` — full wedding-specific terms (booking, design lock-in, cancellation tiers, delivery/setup responsibility, allergens, liability, force majeure, Durban jurisdiction).
- `inspo/` — two saved reference URLs (honeybeebaker.co.za, kcake.co.nz customize page) for visual inspiration.
- `assets/img/` — 18 real client photographs of completed cakes, cupcakes, and confections (client-supplied, in use across Home, Gallery, About, and Wedding) plus the real OCD logo (`ocd-logo.png`, replacing the earlier hand-drawn recreation). None are tagged to a specific menu flavour, so the Menu page's 14 flavour plates remain honest empty placeholders — do not pair a real photo with a flavour name unless the photo is actually confirmed to be that flavour.
- No testimonials, case studies, or third-party press confirmed — do not fabricate any of these.

## Product Principles

1. The paper forms are the source of truth for product/pricing/terms — the site must not drift from the Product Guide, Order Form, or Wedding Cake Contract without the client changing them first.
2. Standard orders and wedding orders are genuinely different workflows (different terms, different lead times, different cancellation policies) — treat them as distinct, not a single generic "contact us" form.
3. Checkout is explicitly deferred, not merely unbuilt — the intake form must stand on its own as a complete, useful step without implying payment happens on-site.
4. Bespoke/custom requests are quote-based by nature — the form should collect enough detail (theme, colours, references, servings) to let the business quote, not force a fixed price the business can't actually guarantee.
5. Delivery cost and final size guidance are business-determined, not calculable from fixed rules — the site should set that expectation rather than promise a number it can't back up.

## Accessibility & Inclusion

No product-specific requirement established yet.
