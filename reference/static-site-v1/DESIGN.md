---
name: Obsessive Cupcake Disorder
description: The account book of every cake ever committed to paper.
colors:
  ink: "#171310"
  paper: "#FBF9F4"
  ink-hairline: "rgba(23, 19, 16, 0.16)"
  ink-hairline-strong: "rgba(23, 19, 16, 0.32)"
  ink-muted: "rgba(23, 19, 16, 0.62)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.75rem, 6vw, 5.5rem)"
    fontWeight: 560
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.75rem, 3vw, 2.75rem)"
    fontWeight: 540
    lineHeight: 1.05
    letterSpacing: "-0.005em"
  title:
    fontFamily: "DM Sans, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
  body:
    fontFamily: "DM Sans, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
  ledger-figure:
    fontFamily: "Space Mono, 'Courier New', monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  2xl: "64px"
  3xl: "96px"
  4xl: "128px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "18px 36px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "18px 36px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "17px 35px"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "10px 2px"
  nav-tab:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
---

# Design System: Obsessive Cupcake Disorder

## Overview

**Creative North Star: "The Order Ledger"**

OCD's whole name is a joke about obsession, and its real working documents — a price *schedule*, a wedding *contract*, a payment reference format, a cancellation table graded by the day — already read like the pages of an account book kept by someone who cannot let a detail go uninspected. The system doesn't decorate that idea; it IS a ledger. Every page is a leaf in one continuously bound book: ruled lines, tabbed dividers for navigation, monospaced figures wherever money or quantity appears, an ink stamp for confirmation, the existing OCD roundel doing duty as the book's wax seal.

The palette is strictly black ink on white paper — the client's own instruction, held exactly, with no third hue smuggled in as an "accent." Depth and hierarchy come from ink weight, rule thickness, and spacing, never from shadow, gradient, or color. Confirmed rejections: no pastel bakery palette, no cursive script logotype treatment, no rounded corners anywhere, no drop shadows, no stock-photo gloss standing in for the real thing.

**Key Characteristics:**
- Two tones only: ink black and paper white, plus alpha-derived hairlines of the ink itself.
- A display serif with visible ink-trap character (Fraunces) for headlines; a plain geometric sans (DM Sans) for reading; a monospace (Space Mono) reserved exclusively for figures.
- Every section is a leaf of actual ruled paper — horizontal rules, a vertical margin line, a faint fibre grain — not a plain white div with a heading on it.
- Interaction is ink and paper physics, never motion-for-motion's-sake: a drawn-on flourish, a punched stamp, a page that turns on navigation, a dog-eared corner, a total that tallies itself.
- Real product photography runs in full color inside the monochrome frame — the palette governs chrome, not the cakes.
- Zero rounded corners, zero ambient drop shadows, zero gradients.

## Colors

Two tones and nothing else — the palette is the client's brief, held without dilution.

### Primary
- **Iron Gall Ink** (`#171310`): the only ink color. All text, rules, icons, stamps, and filled buttons.

### Neutral
- **Ledger Paper** (`#FBF9F4`): the page ground. Reads as white; carries the faintest warmth so large paper fields don't glare like a screen.
- **Ink Hairline** (`rgba(23, 19, 16, 0.16)`): rule lines, table grids, dividers, resting borders.
- **Ink Hairline, Strong** (`rgba(23, 19, 16, 0.32)`): emphasis rules — totals, active tab underline, focus state.
- **Ink, Muted** (`rgba(23, 19, 16, 0.62)`): secondary text (captions, helper text, inactive nav labels) — always the ink at reduced opacity, never a separate gray.

### Named Rules
**The Two-Tone Rule.** Every color in this system resolves to Iron Gall Ink at some opacity, or Ledger Paper. No gray, cream, sepia, or accent hue is ever introduced, including for "just this one" success/error state — error and success speak through weight, iconography, and copy, not color.

**The Photography Exception.** Real product photography (cakes, cupcakes, confections, the gallery) is the one deliberate exception to the Two-Tone Rule: it runs in natural full color, not forced grayscale. The palette governs the site's own chrome — type, rules, buttons, backgrounds — not documentary photography of the product itself; a chocolate ganache needs to read as chocolate. Drop a real `<img>` into any `.plate__figure` and it takes over automatically (see Components → Cards / Plates).

## Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** DM Sans (with -apple-system, sans-serif fallback)
**Label/Mono Font:** Space Mono (with 'Courier New', monospace fallback)

**Character:** Fraunces carries the book's authority and its slightly eccentric, hand-set quality — this is a ledger kept by someone particular, not a template. DM Sans stays out of the way for reading. Space Mono marks the exact moment a number matters: this is where the obsession is legible as precision.

### Hierarchy
- **Display** (560, `clamp(2.75rem, 6vw, 5.5rem)`, 0.98): page-opening statements only — the Home leaf, one per page maximum.
- **Headline** (540, `clamp(1.75rem, 3vw, 2.75rem)`, 1.05): section openers within a leaf (a flavour plate's name, a form's section title).
- **Title** (600, 1.25rem, 1.3): card/plate titles, form field group labels.
- **Body** (400, 1.0625rem, 1.6, measure capped at 68ch): running copy, descriptions, terms.
- **Label** (600, 0.75rem, tracked +0.14em, uppercase): nav tabs, button text, table headers, form field labels — the system's "stamped" register.
- **Ledger Figure** (Space Mono, 400, 1rem, 1.4): every price, date, quantity, serving count, and order reference, always right-aligned in tables.

### Named Rules
**The Figures-in-Mono Rule.** Any number a customer or the business would need to verify — a price, a date, a serving count, an order reference — sets in Space Mono. Prose numbers (e.g. "14 flavours" in a sentence) stay in body type.

## Layout

Content sits in leaves: full-bleed ruled sections stacked like pages in one book, each opening with a thin top hairline and a small running header (`LEAF — SECTION NAME`, label type, muted ink) the way a ledger page carries a header. Every leaf is drawn on actual ruled paper: a faint horizontal rule every 48px runs behind the whole leaf (Ink Hairline, so it never fights with reading), plus a single vertical margin rule at the leaf's left content edge — the book's own gutter line, not a decorative border. Max content measure 1200px, with generous outer margins (`{spacing.2xl}`–`{spacing.3xl}`). Spacing rhythm is a strict 8px-based scale (8/16/24/32/48/64/96/128); headings always carry more space above than below. Navigation is a column of tabbed dividers fixed to the right edge of the viewport on desktop (each tab a page-divider tang bleeding off the edge); on mobile it collapses to a horizontal in-book index bar pinned under the header. Tables (pricing, order summaries) are true ruled ledger grids — hairline row dividers, a doubled rule above any total. A faint, fixed fibre-grain texture (SVG turbulence, ~3.5% opacity, multiply blend) sits over the whole book so paper reads as paper rather than screen gloss.

### Named Rules
**The Page-Turn Rule.** Navigating between pages uses the native CSS View Transitions API (`@view-transition { navigation: auto; }`) so one leaf turns into the next — a brief rotate-and-slide, never a hard cut — on browsers that support it. Unsupported browsers fall back to an instant swap; this is progressive enhancement, never a required dependency.

## Elevation & Depth

Flat by design: no shadows anywhere in the resting system. Hierarchy comes from ink weight (rule thickness, fill vs. outline), spacing, and type scale only.

### Named Rules
**The Flat Ledger Rule.** No blurred, ambient `box-shadow` anywhere, ever. Hard-edged, zero-blur ink offsets are permitted only where they depict actual paper physics rather than UI elevation: the stamp mark's double-struck impression (see Components → Stamp) and the plate's dog-ear fold on hover (a 1px offset reading as a lifted paper corner, not a floating card). Any new "depth" need is solved with a hairline rule or ink weight, never a soft shadow.

## Shapes

Radius is zero everywhere — corners are square, the way paper and rulers are square. The single non-rectilinear motifs are the OCD roundel (an existing asset, used as-is) and the stamp mark's slight rotation (2–4°) when it lands. A "tear-off" perforation (a dashed hairline with small circular perforation dots) marks the boundary of anything conceptually detachable — the order slip's customer-copy edge, a printable confirmation.

## Components

### Buttons
- **Shape:** rectangular, 0px radius, generous horizontal padding (36px) so it reads as a stamped block, not a rounded pill.
- **Primary:** Iron Gall Ink fill, Ledger Paper text, Label typography (tracked uppercase). No hover color shift; instead a thin Ledger Paper inline rule draws on beneath the label on hover (an underline stamp, not a color change).
- **Ghost/Secondary:** Ledger Paper fill, Iron Gall Ink 1px outline and text. On hover, fills to Primary — the ghost "commits."

### Inputs / Fields
- **Style:** no boxes. A field is a label (Label type, muted ink) above a single ruled baseline (1px Ink Hairline) the width of the field, exactly like writing on ruled paper.
- **Focus:** the baseline thickens to 2px and darkens to full Iron Gall Ink; a small drawn tick (✓, hand-drawn SVG stroke) appears at the line's end once a required field validates.
- **Error:** the baseline stays 2px but the field's label gains a bracketed note in Body type stating the problem plainly (e.g. "[required — we can't quote without this]"); never a red fill, since red does not exist in this palette.
- **Selections (checkboxes/radios for confections, sizes):** rendered as a small ruled box; a checked state fills with a hand-drawn ink tick, not a checkmark icon glyph or color swap.

### Navigation
- **Style:** vertical tabbed page-dividers (desktop) — each tab a small rectangular tang, Label typography, Ink Muted at rest.
- **Active/hover:** tab text goes full Iron Gall Ink and a hairline-strong rule draws on along the tab's inner edge, as if that divider is the one currently parted.
- **Mobile:** collapses to a horizontal bar of the same tabs, scrollable, pinned below the header; active state identical.

### Cards / Plates
- **Corner style:** square, 0px radius, always.
- **Background:** Ledger Paper, 1px Ink Hairline border.
- **Shadow strategy:** none (see Elevation).
- **Internal padding:** `{spacing.md}`–`{spacing.lg}`.
- **Caption:** every plate (flavour, gallery photograph, confection) carries a small caption beneath in Label type reading like a museum/ledger plate tag: `PLATE IV — RASPBERRY, WHITE CHOCOLATE FILLING`.
- **Empty state:** an unphotographed plate shows a diagonal hairline hatch and a mono-type label naming the exact shot reserved for that frame — never a stock photo or gradient block standing in for the real thing.
- **Filled state:** drop a real `<img>` directly inside `.plate__figure` — the hatch and label disappear automatically (`:has(img)`), the photo covers the frame in full color (see Colors → The Photography Exception), and it gains a slow 1.03× scale on hover.
- **Dog-ear:** on hover, every plate's top-right corner lifts — a small triangular fold in Ink Hairline Strong, like turning a page. This is the plate's one interaction signature; it does not also gain a shadow or color shift.

### Stamp (signature component)
The confirmation and status mark: a bordered rectangle or the OCD roundel outline containing tracked uppercase Label type (`RECEIVED`, `VOID`, `CONFIRMED`), rotated 2–4°, rendered with the Flat Ledger Rule's hard double-struck offset instead of a blur. Appears on successful form submission (RECEIVED, in full Iron Gall Ink) and on any unavailable/sold-out item (VOID, drawn diagonally across the plate at reduced opacity). The confirmation stamp punches onto the page once on arrival — scale-in from oversized, a slight overshoot, settle — the system's loudest authored moment; the VOID mark stays static since it appears inline among other content, not as a standalone reveal. Never repeat the impact animation as a generic entrance elsewhere.

### Flourish &amp; Tally (signature motion)
- **Flourish:** a hand-drawn SVG line draws itself under the closing phrase of the homepage's opening headline (`stroke-dashoffset` animation, ~0.9s), like a pen underlining the point once the thesis lands. Reserved for the single most important headline per page — never applied to every heading, which would flatten it back into decoration.
- **Tally:** select ledger figures (currently the homepage's confection price teaser) count up from zero once, the moment they scroll into view, like a total being tallied. Reserved for a handful of emphasis numbers, never the full 20-row price schedule, which needs to stay instantly scannable.
- Both respect `prefers-reduced-motion`: the flourish renders fully drawn and tallies render at their final value with no animation.

## Do's and Don'ts

### Do:
- **Do** hold the palette to exactly Iron Gall Ink and Ledger Paper, at any opacity. Every new color need is a hairline-opacity or muted-ink problem, not a new hue.
- **Do** set every price, date, quantity, and order reference in Space Mono, right-aligned in tables.
- **Do** open every section with a ruled top hairline and a small running header, like a page in a bound book.
- **Do** use the existing OCD roundel as the seal of authority at moments that need it (form confirmation, footer, the stamp mark).
- **Do** build placeholder gallery/plate frames honestly (a labeled, empty ruled frame) until real photography lands — never fill the gap with a stock photo or a decorative gradient block.
- **Do** let real product photography run in full color — the Two-Tone Rule governs the site's chrome, not the cakes themselves.
- **Do** keep every motion moment legible as ink-on-paper physics: draws, folds, punches, and totals — never a generic fade/slide lifted from an unrelated system.

### Don't:
- **Don't** add a box-shadow anywhere outside the stamp mark's hard-edged double-strike.
- **Don't** round any corner. This is squared paper, not an app.
- **Don't** reach for a cursive/script "bakery" font, pastel fills, confetti, or icon-in-a-tile grids — the category default this world exists to refuse.
- **Don't** color-code error/success/sold-out states. State speaks through weight, the stamp mark, and plain copy, never a new hue.
- **Don't** let a section repeat the same entrance motion as every other section. The system has a small, named set of signature moments — the stamp punch, the headline flourish, the tally count-up, the plate dog-ear, the page-turn — each reserved for the specific instant it means something; scattering any of them onto every element flattens them back into decoration.
- **Don't** force real product photography into grayscale; the Two-Tone Rule is a chrome rule, not a photography rule (see Colors → The Photography Exception).
