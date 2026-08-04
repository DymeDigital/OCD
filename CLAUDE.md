# CLAUDE.md — OCD (Obsessive Cupcake Disorder)

Guidance for any AI agent or developer working in this repo. Read this before writing code.

---

## 0. Before you touch any frontend code

**Load the `frontend-design` skill and follow its process for every frontend change.** This applies to new pages, new components, restyling existing ones, layout changes, motion work, and anything that alters what a person sees. It is not limited to greenfield work — a "quick tweak" to a section is a design decision and gets the same treatment.

The order of operations, every time:

1. **Read `/mnt/skills/public/frontend-design/SKILL.md` first.** Before writing markup, before writing CSS.
2. **Plan before building.** Brainstorm the change against this brief, sketch the layout in prose or ASCII, and name what makes it specific to *this* bakery rather than any bakery.
3. **Self-critique the plan.** If any part of it is what you'd produce for a generic client, revise it and say what changed and why.
4. **Then build**, deriving every colour, type and spacing decision from the tokens in §5 — never from instinct, never from a stray hex value.
5. **Critique again after building.** Screenshot it if the environment allows. Remove one thing.

**Where the skill and this file disagree, this file wins.** The client has pinned the palette (white/black), the register split (§5), the motion vocabulary (§6) and the voice (§3). Those are settled — the skill's job here is to raise the execution quality *inside* those constraints, not to reopen them. In particular: do not substitute a warm-cream-and-terracotta palette, do not add a second accent, and do not expand the animation vocabulary. Spend the creative freedom on layout, typographic detail, and the ledger's craft instead.

Two things this catches that generic building misses, and that matter most here: the order form on a 375px screen, and the moment the hero loads. Both deserve a real design pass, not a default one.

---

## 1. What we're building

A marketing + order-intake website for **OCD (Obsessive Cupcake Disorder)**, a South African home bakery specialising in cupcakes, celebration cakes and wedding cakes.

**The single job of this site:** replace the WhatsApp-and-PDF ordering process with a clean online order form the client can complete in one sitting, and that lands in the bakery's inbox already organised.

**There is no checkout.** No cart, no payment gateway, no Stripe/PayFast/Yoco integration. Orders are *enquiries*. Pricing is indicative, because the final price depends on servings and design complexity, and is confirmed by the baker over WhatsApp or email. Do not add commerce features "for later" — they change the entire information architecture.

Reference the client liked: `honeybeebaker.co.za` — white, clean, logo-forward, photography does the talking. We match that cleanliness but we are **not** cloning it. Our differentiator is the hero animation and the ledger.

---

## 2. Constraints from the client (non-negotiable)

| Constraint | Detail |
|---|---|
| Palette | White and black. Logo-forward. |
| Checkout | Not available. Enquiry only. |
| Pricing | Standard pricelist by size, but varies by servings + design. Always show a **range**, never a single fixed price. |
| Forms | Two: **Cake / Cupcake Order Form** and **Wedding Cake Order Form**. These currently exist as PDFs and are cumbersome. The web versions must be faster to complete than the PDFs. |
| Delivery to bakery | Baker must receive a clean, readable summary of every submission. |
| Locale | South Africa. `en-ZA`, ZAR (`R` prefix), `DD/MM/YYYY` dates, metric. |

**Source documents** live in `/content/source/`:

| File | What it is |
|---|---|
| `animate_this.png` | The branded cupcake photo. **This is the seed frame for the hero animation** — see §6. |
| `hero_idea.png` | The client's concept sketch for the hero: composition, density, how the cupcakes sit in frame. Treat as art direction, not a pixel target. |
| Order form PDF | Source of truth for the fields in §9. |
| Product guide PDF | Source of truth for flavours and descriptions. |
| Pricing PDF | Source of truth for sizes, servings and ranges. |

Extract the PDFs into the structured data files in §8 rather than hardcoding values in components. If a value isn't in the PDFs, mark it `TODO(client)` — never invent a price, flavour or lead time.

---

## 3. Brand voice

Friendly, fun, warm. Like the baker herself texting you back. Short sentences. Sentence case everywhere, including buttons and headings.

**Do:**
- "Tell us about your cake." / "We'll come back to you within 24 hours."
- "Pick a size. We'll help you figure out servings."
- "Nothing's locked in yet — we'll confirm everything with you first."

**Don't:**
- Corporate filler: "Leverage our bespoke confectionery solutions."
- Exclamation-mark spam. One per screen, maximum.
- Puns in every single line. The brand name is already the joke; let it carry.

**On the name.** "Obsessive Cupcake Disorder" is a play on a real condition. Keep it light and about *craft* — precision, symmetry, neat piping, everything measured. Never use clinical language, therapy imagery, pill/straitjacket/checklist-of-symptoms motifs, or jokes at the expense of people with OCD. The joke is "we're fussy about cupcakes," full stop. This is a brand-safety line, not a suggestion.

**Microcopy rules.** A button says what happens: "Send my order" → toast says "Order sent." Errors say what's wrong and how to fix it, without apologising: "We need a date so we can check availability." Empty states invite action.

---

## 4. Stack

### Current phase: demo. No backend.

We are building a **frontend demo to show the client** — the look, the hero, and the order form flow end to end. Nothing persists, nothing sends. Do not build server infrastructure yet.

| | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Static/client-rendered for now. Server actions are Phase 2. |
| Styling | **Tailwind CSS** | Tokens from §5 mapped into `tailwind.config.ts`. No inline hex values in components, ever. |
| Forms | **React Hook Form + Zod** | Zod schema is the single source of truth for validation. Write the real schema now — Phase 2 reuses it server-side unchanged. |
| Form state | **`localStorage`** | Autosave and step persistence. Enough for the demo, and it's what we'd ship anyway. |
| UI motion | **Framer Motion** | Reveals and hovers only. Not the hero — see §6. |
| Hero | **`<video>` element** | Plain HTML. No player library, no WebGL, no Three.js. |
| Content data | **Typed TS files** in `/content/data/` | Per §8. Hand-authored from the client's PDFs. |
| Deploy | **Vercel** preview link | That link is how the client reviews it. Keep it always working. |

**Demo-phase behaviour for the order form:** the full multi-step flow works, validation is real, the running ledger calculates properly, and "Send my order" routes to `/order/thank-you` after a short simulated delay. It sends nothing. `console.log` the assembled payload so we can eyeball the shape. Put a single line in the dev README noting submissions are stubbed — do not put a "this is a demo" banner in the UI, because the client needs to see the real thing.

File uploads in the demo: accept them, show thumbnails and filenames in the ledger, hold them in memory. Don't upload anywhere.

### Phase 2, once the demo is signed off

Deliberately deferred. Don't scaffold these now — half-built backend is worse than none.

- Server actions for submission
- **Resend** (or the client's SMTP) for the two emails in §9
- File uploads to Vercel Blob or S3 presigned URLs
- Submission storage — Supabase, Airtable or Google Sheet, `TODO(client)`
- **Keystatic** so the client can edit flavours, sizes, prices and availability herself without a code change

Keep dependencies boring and few. No component library — the design is specific enough that a generic kit will fight us.

---

## 5. Design system

The site has **two visual registers**. Keeping them separate is the whole design idea. Don't blend them.

**Register A — Gallery (landing, about, portfolio).** White, airy, huge margins, photography and the hero animation carry it. Almost no lines, no boxes, no borders. This is where the client's "minimal, clean, professional" lives.

**Register B — Ledger (order forms, pricing tables, menus).** Ruled paper. Tabular figures. Running line items. This is where "ledger vibes" lives, and only here. The ledger was never meant to be the whole site — it's the *stationery* of the business, and stationery belongs on the forms.

### Colour tokens

```
--paper        #FFFFFF   page background, Register A
--ink          #111111   primary text, near-black (never pure #000 for body copy)
--ink-soft     #6B6B6B   secondary text, labels, helper copy
--rule         #E4E4E4   hairlines, dividers, form field underlines
--ledger-line  #D6DFE6   the pale blue-grey of accounting paper. Register B only,
                         for horizontal row rules. Used at low opacity.
--red-ink      #A81E27   THE accent. Ledger correction red / red velvet.
                         Used for: required-field markers, the running total line,
                         active states, the logo lockup accent, and nothing else.
--icing        #F7F4F2   the only tint. Section breathers, hover fills, disabled states.
```

That's the whole palette. `--red-ink` is rationed deliberately — if it's on more than ~3% of any screen, cut some.

### Type

| Role | Face | Notes |
|---|---|---|
| Display | **Fraunces** (variable) | Headlines only. Use the `SOFT` and `WONK` axes lightly — warmth without whimsy. Optical size matters; set `opsz` per size. |
| Body | **Instrument Sans** | All prose, labels, buttons. |
| Ledger | **IBM Plex Mono** | Register B only: prices, quantities, order numbers, servings, dates in tables. Always `font-variant-numeric: tabular-nums`. |

Scale (rem): `0.75 / 0.875 / 1 / 1.25 / 1.5 / 2 / 3 / 4.5 / 6`. Line height 1.15 for display, 1.6 for body. Tracking: −0.02em on display, 0 on body, +0.04em on mono labels (uppercase, 0.75rem).

### Layout

12-column grid, 1280px max, 24px gutters mobile / 48px desktop. Generous vertical rhythm — 96px between sections on desktop, 64px mobile. Radius: `4px` everywhere. Not 0 (too severe for a bakery), not 16px (too soft-SaaS). Shadows: none, except a single `0 1px 0 var(--rule)` hairline where separation is genuinely needed.

### Signature element

**The running order ledger.** As a client fills in the order form, their choices write themselves as line items into a ruled ledger panel that stays visible (sidebar on desktop, sticky summary sheet on mobile). Each selection appears as a row: description, qty, servings, indicative range. The bottom line is a mono "estimated range" in `--red-ink`, with a plain-language note that it's not final.

This is the thing people will remember, and it does real work: it turns the cumbersome PDF into something the client can see taking shape. Build this well before building anything else on the form.

---

## 6. Hero animation

The landing page opens with **realistic cupcakes falling through frame in varied orientations** — tumbling, rotating, some upright, some tilted, shot against white. Soft, slow, weighty. Think product photography that happens to be in motion, not a physics toy.

### Production

Drive this as **image-to-video**, not text-to-video. `/content/source/animate_this.png` is a photograph of a cupcake carrying the OCD logo, and it is the seed frame — it keeps the branding, the icing swirl and the lighting consistent across every generated clip in a way a text prompt never will.

`/content/source/hero_idea.png` is the client's concept for the finished hero: read it for **composition** — how many cupcakes are in frame, how densely they're spread, where the negative space for the headline sits, roughly what scale they read at. It is direction, not a target to match pixel for pixel. Where it conflicts with the constraints in this file (palette, motion vocabulary, the headline never sitting on top of a cupcake), those win — but flag the conflict rather than silently resolving it, since the client drew that image for a reason.

Before generating, check `animate_this.png` is usable: 2048px on the long edge or better, sharp logo, even soft lighting, on white or cleanly cut out. If it's a phone snap on a kitchen counter, ask for a reshoot or cut it out and relight it first — the generator amplifies whatever it's given, and a soft logo becomes an illegible smear the moment it rotates.

Generate with the **Higgsfield MCP** (see `/docs/higgsfield-notes.md` for the exact tool names and parameters available in this workspace — confirm them at call time rather than assuming; log the seed image, working prompt and settings there so runs are reproducible).

Direction to give the generator:
- Subject: the supplied cupcake, unchanged. Preserve the logo and the icing exactly. For variants, re-seed from the same image with a flavour change described in the prompt (red velvet, chocolate with sprinkles) rather than generating new cupcakes from scratch — match the products in the product guide PDF once available.
- Motion: slow descent, gentle tumble, subtle motion blur. No splatter, no impact, no destruction. Nothing lands.
- Camera: static, eye-level, shallow depth of field.
- Lighting: soft key from upper left, white seamless background, soft contact-free shadows.
- Look: photoreal, food-photography grade. Not stylised, not cartoon, not CGI-shiny.
- Deliverable: 6–10s **seamless loop**, 1920×1080 minimum, plus a 1080×1920 portrait crop for mobile.

**Review each generation against the seed image specifically for logo integrity.** Generative video warps small high-contrast marks under rotation — the logo will melt, mirror, or turn into nonsense letterforms, and it'll be the first thing the client notices. Reject any clip where it does. If the model can't hold it through a full tumble, the fix is to reduce rotation on the branded cupcake and let the unbranded variants do the acrobatic falling, keeping one hero cupcake closer to camera and slower.

Aim for the logo being clearly readable at least once per loop, ideally near the moment the headline finishes animating in.

Iterate on the prompt until the loop point is invisible. A visible cut kills the effect.

### Implementation

- `<video>` with `autoplay muted loop playsinline preload="metadata"`, `poster` set to a still frame so the first paint is instant.
- Encode **AV1 → WebM/VP9 → MP4/H.264** fallbacks. Budget: **under 2.5 MB** for the desktop loop. Compress hard; it's a white background, it will compress well.
- Art-direct with `<source media="...">` — portrait crop under 768px.
- The video sits *behind* the hero content at low z-index. Headline and CTA sit on white space the cupcakes fall through, never on top of a cupcake at any frame of the loop. Check every frame.
- `prefers-reduced-motion: reduce` → serve the poster still. Non-negotiable.
- If the loop can't be made to look right, ship a still hero. A beautiful still beats a janky video, and the client's brief is minimal first.

### Other hero effects

Keep them to one orchestrated page-load sequence, not scattered tricks:
1. Logo fades in (200ms)
2. Headline rises 12px + fades (400ms, 60ms stagger per line)
3. Sub + CTA fade (200ms)
4. Video begins its loop

Total under 1.2s. Ease `cubic-bezier(0.16, 1, 0.3, 1)`. Below the fold: single scroll-triggered fade-up per section, 24px travel, once only. That's the entire motion vocabulary of the site. Adding more will make it feel generated.

---

## 7. Pages

```
/                     Landing — hero animation, what we make, a few products,
                      "how ordering works" (3 steps), CTA to order
/cakes                Product guide — flavours, sizes, servings, indicative ranges
/cupcakes             Cupcake range + boxes
/weddings             Wedding cakes — softer, more editorial, tasting info
/order                Cake & cupcake order form   ← primary conversion
/order/wedding        Wedding cake order form
/order/thank-you      Confirmation + what happens next + WhatsApp link
/about                The baker's story, the obsessive-precision angle
/faq                  Lead times, delivery areas, deposits, changes, allergens
/contact              WhatsApp, email, Instagram, service area
```

Every page has one CTA and it is the same CTA: **Start your order**.

---

## 8. Data model

All product data lives in `/content/data/` as typed TS or JSON, generated from the client's PDFs. Never hardcode in components.

```ts
// flavours.ts
type Flavour = {
  id: string
  name: string
  description: string        // one warm sentence
  category: 'cake' | 'cupcake' | 'both'
  isPremium: boolean         // premium flavours affect the range
  allergens: string[]
  available: boolean
}

// sizes.ts
type Size = {
  id: string
  label: string              // e.g. "15cm round, single tier"
  shape: 'round' | 'square' | 'number' | 'sheet'
  tiers: number
  servingsMin: number
  servingsMax: number
  priceFrom: number          // ZAR, integer cents avoided — use rands
  priceTo: number
  note?: string              // "Price varies with design complexity"
}

// designTiers.ts — the multiplier the client applies for complexity
type DesignTier = {
  id: 'simple' | 'detailed' | 'showpiece'
  label: string
  description: string        // plain language, with photo examples
  multiplierFrom: number
  multiplierTo: number
}
```

**Price display rule:** always `R1 200 – R1 600`, always followed by "Final price confirmed once we've chatted about your design." Never show a single number. Space as thousands separator, per SA convention.

---

## 9. Order forms — the core deliverable

Two forms, same engine, different schemas. Multi-step, one decision per step, progress visible, **state persisted to `localStorage`** so nobody loses work. Every step is reachable by keyboard, and the whole form works without JS-dependent custom controls where a native input will do.

### Cake / cupcake form (`/order`)

1. **What's the occasion?** — birthday, anniversary, corporate, baby shower, just because
2. **When do you need it?** — date picker, enforce the minimum lead time from the FAQ data; block dates the baker has marked unavailable
3. **What are we making?** — cake / cupcakes / both
4. **Size & servings** — pick by *guest count* first, then show which sizes fit. This is the biggest improvement over the PDF: clients know how many people, not what "20cm round" means.
5. **Flavour** — cards with photos; premium flavours flagged, not hidden
6. **Design** — complexity tier with real photo examples, colour notes, free-text brief, **image upload** (max 5 files, 10 MB each, jpg/png/heic) for inspiration pictures
7. **Delivery or collection** — address + suburb if delivery; show whether it's in the service area
8. **Your details** — name, WhatsApp number, email, how they found us
9. **Review** — the full ledger, editable inline, then "Send my order"

The running ledger (§5) is visible from step 3 onward.

### Wedding form (`/order/wedding`)

Same engine, plus: partner names, venue + venue contact, wedding date and time, guest count, tiers and per-tier flavour, cake table setup, whether a tasting is wanted, planner/coordinator details, dietary requirements, and a longer design brief. Wedding leads are worth more — this form can afford to be longer, but it still needs the ledger and the autosave.

### Submission — Phase 2, not the demo

For the demo, "Send my order" simulates and routes to the thank-you page (see §4). Build none of the below yet; it's recorded here so the form fields and Zod schema are designed to feed it.

Server action → **two emails**:
1. **To the bakery:** subject `New order — {name} — {date needed}`. Plain, scannable HTML: every field in ledger layout, uploads as links, WhatsApp link that opens a reply thread with the client. This must be readable on a phone, because that's where it will be read.
2. **To the client:** warm confirmation, a copy of what they submitted, "we'll come back to you within 24 hours," WhatsApp link.

Also write every submission to a store (Supabase, Airtable, or a Google Sheet — client's choice, `TODO(client)`) so nothing is ever lost to a bounced email.

Spam handling: honeypot field + timing check. **No CAPTCHA** — it costs more orders than it saves.

Errors: if the email fails, do *not* show a dead end. Show the client their full order in copyable text plus a WhatsApp deep link with it pre-filled.

---

## 10. Quality floor

- **Accessibility:** WCAG 2.1 AA. Visible focus rings (2px, `--red-ink`). Every input has a real `<label>`. Errors linked with `aria-describedby`. Form steps announce changes to screen readers. `--ink-soft` on white passes AA for body sizes — verify before using it smaller.
- **Performance:** LCP under 2.5s on 4G. The hero video must not be the LCP element — the poster is. Next/Image everywhere, AVIF + WebP. Self-host fonts, `font-display: swap`, subset to Latin.
- **Responsive:** design mobile-first. Most SA clients will arrive from an Instagram link on a phone, mid-conversation. The order form on a 375px screen is the real design problem — solve it first.
- **SEO:** local business schema, `Bakery` structured data, Durban/KZN service-area terms, per-page metadata and OG images. Alt text on every product photo describing the actual cake.

---

## 11. Do not

- Add a cart, checkout, prices-as-single-numbers, or "buy now" anything.
- Let the ledger styling leak onto the landing page. Register A stays clean.
- Introduce a second accent colour. If something needs to stand out, use space, not colour.
- Use stock cupcake photography. Client photos only — placeholder blocks with `TODO(photo)` until they arrive.
- Animate anything beyond the vocabulary in §6.
- Invent flavours, prices, lead times, delivery areas or allergen info. `TODO(client)` instead.
- Make the joke about the disorder rather than about the baking.

---

## 12. Open questions for the client

Track answers here as they come in.

- [ ] Confirmed business name and logo files (SVG preferred)? Is "OCD" the trading name or the tagline?
- [ ] Minimum lead time — standard cakes vs wedding cakes?
- [ ] Delivery areas and fees, or collection only?
- [ ] Deposit policy — how much, when, and does it appear on the site at all?
- [ ] Where should submissions be stored, and which email address receives them?
- [ ] WhatsApp Business number for the deep links?
- [ ] Are wedding tastings offered, and are they charged?
- [ ] Instagram handle for the feed embed / footer?
- [ ] Domain and who controls the DNS?
