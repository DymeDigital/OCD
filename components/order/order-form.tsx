"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePersistedForm, clearPersistedForm } from "@/lib/use-persisted-form";
import {
  orderSchema,
  occasions,
  productTypes,
  cakeShapes,
  deliveryModes,
  foundUsOptions,
  spongeRequiredMessage,
  fillingRequiredMessage,
  type OrderFormValues,
} from "@/lib/schemas";
import { computeOrderLedger } from "@/lib/ledger";
import { formatPriceFrom } from "@/lib/pricing";
import { standardTerms } from "@/content/data/terms";
import { flavours, egglessFlavourIds, defaultFillingLabel, flavourCardDescription } from "@/content/data/flavours";
import { fillings, egglessFillings, USUAL_FILLING_ID } from "@/content/data/fillings";
import { designTiers } from "@/content/data/designTiers";
import { sizesForServings, sizes } from "@/content/data/sizes";
import { cupcakeStyles } from "@/content/data/cupcake-styles";
import { collectionWindows } from "@/content/data/collection-windows";
import { LedgerPanel } from "@/components/order/ledger-panel";
import { ConfectionsPicker } from "@/components/order/confections-picker";
import { ImageUpload, imageRequiredMessage, scrollToImageUpload } from "@/components/order/image-upload";
import { TermsStep } from "@/components/order/terms-step";
import { SubmitFallback } from "@/components/order/submit-fallback";
import { TextField, TextAreaField, SelectField, RadioCardGroup, CheckboxCardGroup, FollowUpPanel } from "@/components/order/fields";
import { Button } from "@/components/button";
import { buildOrderPlainText, type OrderSummaryInput } from "@/lib/order-summary";

const STORAGE_KEY = "ocd-order-draft";

// A localStorage draft saved before dietaryOptions was split into cakeDietaryOptions /
// cupcakeDietaryOptions (or any other malformed persisted value) can restore these fields as
// something other than a clean string array — guard reads instead of assuming the shape.
function includesEggless(opts: unknown): boolean {
  return Array.isArray(opts) && opts.includes("eggless");
}

const steps = [
  "Occasion",
  "Date",
  "What are we making",
  "Size & servings",
  "Flavour",
  "Design",
  "Confections",
  "Delivery",
  "Your details",
  "Terms & sign",
  "Review",
] as const;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Client-confirmed 2026-09-19: 14 days is standard guidance, not a hard cutoff — last-minute
// orders are still accepted where the production schedule allows, so the date field's floor drops
// from 14 days out to just "today" (still no ordering for a date that's already passed). This only
// decides whether to show the heads-up notice below the field.
function isWithinLeadTime(eventDate: string, days: number): boolean {
  if (!eventDate) return false;
  const chosen = new Date(eventDate);
  if (Number.isNaN(chosen.getTime())) return false;
  const threshold = new Date();
  threshold.setHours(0, 0, 0, 0);
  threshold.setDate(threshold.getDate() + days);
  return chosen < threshold;
}

// Scrolls a field into view (and focuses it) by its form `name` — used when Continue is blocked,
// so the customer lands directly on whatever's missing instead of reading a summary and hunting
// for it. `closest("fieldset")` centres the whole card group (radios/checkboxes are visually
// hidden inputs) rather than the invisible input itself.
function scrollToField(name: string) {
  const el = document.querySelector<HTMLElement>(`[name="${name}"]`);
  if (!el) return;
  const target = el.closest("[data-scroll-target]") ?? el.closest("fieldset") ?? el;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  el.focus({ preventScroll: true });
}

export function OrderForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  // Each step can be a different length — without this, moving on from a long step leaves the next
  // one scrolled to wherever the previous one ended, hiding its heading and first fields.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  const [files, setFilesState] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string | undefined>();
  function setFiles(next: File[]) {
    setFilesState(next);
    if (next.length > 0) setFilesError(undefined);
  }
  const [submitFallback, setSubmitFallback] = useState<{ summaryText: string; token: string | null } | null>(
    null
  );
  // Anti-spam, checked server-side: a honeypot field bots fill and humans never see, and the time
  // the form first rendered (submitting in under 3s reads as automated).
  const [honeypot, setHoneypot] = useState("");
  const [mountedAt] = useState(() => Date.now());
  // Tracks the sizeId this component itself last auto-picked, so the effect below can tell "the
  // guest count moved and this value is now stale" apart from "the customer chose this on purpose"
  // — the latter should never be silently overwritten.
  const lastAutoSizeId = useRef<string | undefined>(undefined);

  const form = usePersistedForm<OrderFormValues>(STORAGE_KEY, zodResolver(orderSchema), {
    occasion: undefined,
    eventDate: "",
    productType: undefined,
    cakeDietaryOptions: [],
    cupcakeDietaryOptions: [],
    confections: [],
    deliveryMode: "collection",
    address: "",
    collectionWindow: "",
    cakeFlavourFillings: {},
    cupcakeFlavourFillings: {},
    cakeFlavourSponges: {},
    cupcakeFlavourSponges: {},
    agreedToTerms: false,
  } as unknown as OrderFormValues);

  const values = form.watch();
  const ledger = useMemo(() => computeOrderLedger(values), [values]);

  const cakeFlavours = flavours.filter((f) => f.category === "cake" || f.category === "both");
  const cupcakeFlavours = flavours.filter((f) => f.category === "cupcake" || f.category === "both");

  // Eggless only comes in Vanilla Bean — switch the flavour to it in a branch the moment eggless is
  // checked for that branch (cake and cupcake dietary options are independent, so eggless cupcakes
  // doesn't force the cake branch to Vanilla Bean too, and vice versa). If nothing was selected yet,
  // pick Vanilla Bean too — otherwise the filling picker below has no flavour to attach to.
  useEffect(() => {
    const needsCake = values.productType === "cake" || values.productType === "both";
    const needsCupcake = values.productType === "cupcakes" || values.productType === "both";
    const cakeEggless = includesEggless(values.cakeDietaryOptions);
    const cupcakeEggless = includesEggless(values.cupcakeDietaryOptions);
    if (cakeEggless && needsCake && (!values.cakeFlavourId || !egglessFlavourIds.includes(values.cakeFlavourId))) {
      form.setValue("cakeFlavourId", egglessFlavourIds[0], { shouldValidate: true });
    }
    if (cupcakeEggless && needsCupcake && (!values.cupcakeFlavourId || !egglessFlavourIds.includes(values.cupcakeFlavourId))) {
      form.setValue("cupcakeFlavourId", egglessFlavourIds[0], { shouldValidate: true });
    }
  }, [
    values.cakeDietaryOptions,
    values.cupcakeDietaryOptions,
    values.cakeFlavourId,
    values.cupcakeFlavourId,
    values.productType,
    form,
  ]);

  const cakeEggless = includesEggless(values.cakeDietaryOptions);
  const cupcakeEggless = includesEggless(values.cupcakeDietaryOptions);

  // Fillings are chosen per branch — cakeFlavourFillings / cupcakeFlavourFillings — so a "both"
  // order can put a different filling in the cake vs. the cupcakes even when they share the same
  // flavour (only Vanilla Bean has a filling choice, and it's also the only eggless flavour).
  // A filling chosen from the general list may not exist in the eggless list (or vice versa) —
  // clear it rather than leave a stale, no-longer-offered choice silently in place.
  useEffect(() => {
    const pickedCake = values.cakeFlavourFillings?.["vanilla-bean-caramel"];
    if (pickedCake) {
      const options = cakeEggless ? egglessFillings : fillings;
      if (pickedCake !== USUAL_FILLING_ID && !options.some((o) => o.id === pickedCake)) {
        form.setValue("cakeFlavourFillings.vanilla-bean-caramel", "", { shouldValidate: true });
      }
    }
    const pickedCupcake = values.cupcakeFlavourFillings?.["vanilla-bean-caramel"];
    if (pickedCupcake) {
      const options = cupcakeEggless ? egglessFillings : fillings;
      if (pickedCupcake !== USUAL_FILLING_ID && !options.some((o) => o.id === pickedCupcake)) {
        form.setValue("cupcakeFlavourFillings.vanilla-bean-caramel", "", { shouldValidate: true });
      }
    }
  }, [cakeEggless, cupcakeEggless, values.cakeFlavourFillings, values.cupcakeFlavourFillings, form]);

  // When more than one size fits the guest count (e.g. a mini cake and a bento box both do),
  // default to the cheapest so the field is always populated even if the customer never touches
  // the picker below, but don't fight a choice they've already made — including a deliberately
  // bigger/smaller size picked from the manual override below, which won't be in `candidates`.
  useEffect(() => {
    if (!values.guestCount) return;
    const candidates = sizesForServings(values.guestCount);
    if (candidates.length === 0) return;
    if (candidates.some((s) => s.id === values.sizeId)) return;
    const wasAutoSet = !values.sizeId || values.sizeId === lastAutoSizeId.current;
    if (!wasAutoSet) return;
    form.setValue("sizeId", candidates[0].id);
    lastAutoSizeId.current = candidates[0].id;
  }, [values.guestCount, values.sizeId, form]);

  // Default to "Basic" the moment a dozen count is entered, so the ledger always has a real style
  // to price against — same reasoning as the size default above.
  useEffect(() => {
    if (!values.cupcakeDozens || values.cupcakeStyleId) return;
    form.setValue("cupcakeStyleId", cupcakeStyles[0].id);
  }, [values.cupcakeDozens, values.cupcakeStyleId, form]);

  // A print-type choice only means anything for a style that has variants — clear a stale one if
  // the customer switches away from "Characters & logo's" to a style without them.
  useEffect(() => {
    if (!values.cupcakeStyleVariantId) return;
    const style = cupcakeStyles.find((s) => s.id === values.cupcakeStyleId);
    if (!style?.variants?.some((v) => v.id === values.cupcakeStyleVariantId)) {
      form.setValue("cupcakeStyleVariantId", "");
    }
  }, [values.cupcakeStyleId, values.cupcakeStyleVariantId, form]);

  const stepFields: (keyof OrderFormValues)[][] = [
    ["occasion"],
    ["eventDate"],
    ["productType"],
    values.productType === "both" ? ["guestCount", "cupcakeDozens"] : values.productType === "cupcakes" ? ["cupcakeDozens"] : ["guestCount"],
    values.productType === "both"
      ? ["cakeFlavourId", "cakeDietaryOptions", "cupcakeFlavourId", "cupcakeDietaryOptions"]
      : values.productType === "cupcakes"
        ? ["cupcakeFlavourId", "cupcakeDietaryOptions"]
        : ["cakeFlavourId", "cakeDietaryOptions"],
    [],
    ["confections"],
    ["deliveryMode", "address", "collectionWindow"],
    ["fullName", "contactNumber", "email"],
    ["signatureName", "agreedToTerms"],
    [],
  ];

  async function goNext() {
    const fields = stepFields[step];
    let valid = fields.length === 0 ? true : await form.trigger(fields as never[]);
    // The first field that's actually missing, so we can scroll/focus it below rather than make
    // the customer hunt for whatever's wrong.
    let firstInvalidField: string | undefined;
    function fail(name: string, message: string) {
      form.setError(name as never, { type: "manual", message });
      firstInvalidField ??= name;
      valid = false;
    }

    // guestCount/cupcakeDozens are schema-optional (each only applies to some productType
    // branches), so zodResolver's per-field trigger above can't express "required for this
    // branch" — a schema-level cross-field refine can't either: Zod only runs a ZodObject's
    // .refine()/.superRefine() chain once every other field type-checks, and at this step in the
    // wizard fullName/contactNumber/etc. are still empty, so it would never fire here. Checked
    // directly instead.
    if (step === 3) {
      if ((values.productType === "cake" || values.productType === "both") && !values.guestCount) {
        fail("guestCount", "Let us know how many guests you're expecting.");
      }
      if ((values.productType === "cupcakes" || values.productType === "both") && !values.cupcakeDozens) {
        fail("cupcakeDozens", "Let us know how many dozen you'd like.");
      }
    }

    // Same non-firing-mid-wizard issue as above — checked directly rather than relying on the
    // schema's refine chain (cakeFlavourId/cupcakeFlavourId/address/collectionWindow) or the
    // field simply having no required rule yet (designTierId).
    if (step === 4) {
      if ((values.productType === "cake" || values.productType === "both") && !values.cakeFlavourId) {
        fail("cakeFlavourId", "Pick a cake flavour.");
      }
      if ((values.productType === "cupcakes" || values.productType === "both") && !values.cupcakeFlavourId) {
        fail("cupcakeFlavourId", "Pick a cupcake flavour.");
      }
      // The follow-up under the chosen flavour: a sponge (Cookies & Cream, Salted Caramel) and/or a filling
      // (Belgian Chocolate, Vanilla Bean) — both required once that flavour is picked.
      form.clearErrors(["cakeFlavourSponges", "cupcakeFlavourSponges", "cakeFlavourFillings", "cupcakeFlavourFillings"]);
      const branches = [
        { on: values.productType !== "cupcakes", key: "cake", flavourId: values.cakeFlavourId, sponges: values.cakeFlavourSponges, fillings: values.cakeFlavourFillings },
        { on: values.productType !== "cake", key: "cupcake", flavourId: values.cupcakeFlavourId, sponges: values.cupcakeFlavourSponges, fillings: values.cupcakeFlavourFillings },
      ] as const;
      for (const b of branches) {
        const flavour = b.on ? flavours.find((f) => f.id === b.flavourId) : undefined;
        if (!flavour) continue;
        if (flavour.spongeChoices && !b.sponges?.[flavour.id]) fail(`${b.key}FlavourSponges.${flavour.id}`, spongeRequiredMessage);
        if (flavour.hasFillingChoice && !b.fillings?.[flavour.id]) fail(`${b.key}FlavourFillings.${flavour.id}`, fillingRequiredMessage);
      }
    }

    if (step === 5 && !values.designTierId) {
      fail("designTierId", "Pick a design complexity so we know what to quote.");
    }
    // Files live in component state, not the form, so this can't go through fail()/scrollToField.
    let imagesMissing = false;
    if (step === 5 && files.length === 0) {
      setFilesError(imageRequiredMessage);
      imagesMissing = true;
      valid = false;
    }

    if (step === 7) {
      if (values.deliveryMode === "collection" && !values.collectionWindow) {
        fail("collectionWindow", "Please pick a collection time window.");
      }
      if (values.deliveryMode === "delivery" && !(values.address && values.address.trim().length > 4)) {
        fail("address", "We need a delivery address to quote delivery.");
      }
    }

    if (valid) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      return;
    }

    // Nothing manually failed above — fall back to whichever field(s) form.trigger() itself caught.
    if (!firstInvalidField) firstInvalidField = fields.find((f) => form.formState.errors[f]);
    if (firstInvalidField) scrollToField(firstInvalidField);
    else if (imagesMissing) scrollToImageUpload();
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: OrderFormValues) {
    // Files aren't autosaved, so guard here too rather than let the server reject the order.
    if (files.length === 0) {
      setFilesError(imageRequiredMessage);
      setStep(5);
      return;
    }
    const summaryInput: OrderSummaryInput = { token: null, kind: "standard", data, ledger };

    const body = new FormData();
    body.set("kind", "standard");
    body.set("data", JSON.stringify(data));
    body.set("company", honeypot);
    body.set("renderedAt", String(mountedAt));
    files.forEach((file) => body.append("files", file));

    try {
      const res = await fetch("/api/submit-order", { method: "POST", body });
      if (!res.ok) throw new Error(`submit-order responded ${res.status}`);
      const result = (await res.json()) as { token: string; whatsappSent: boolean; emailSent: boolean };

      const delivered = result.whatsappSent || result.emailSent;
      if (!delivered) {
        const orderUrl = result.token ? `${window.location.origin}/o/${result.token}` : null;
        setSubmitFallback({
          summaryText: buildOrderPlainText({ ...summaryInput, token: result.token || null }, orderUrl),
          token: result.token || null,
        });
        return;
      }

      clearPersistedForm(STORAGE_KEY);
      router.push(`/order/thank-you?token=${result.token}`);
    } catch {
      // Draft stays in localStorage — this is only the automated send failing, not data loss.
      setSubmitFallback({ summaryText: buildOrderPlainText(summaryInput, null), token: null });
    }
  }

  // Follow-up choices shown directly under the selected flavour card: the sponge (Cookies & Cream, Salted Caramel)
  // and/or the filling override (Belgian Chocolate, Vanilla Bean). Per branch, so a "both" order
  // can differ between cake and cupcakes.
  function flavourExtras(branch: "cake" | "cupcake") {
    const flavour = flavours.find((f) => f.id === (branch === "cake" ? values.cakeFlavourId : values.cupcakeFlavourId));
    if (!flavour || (!flavour.spongeChoices && !flavour.hasFillingChoice)) return null;
    const eggless = branch === "cake" ? cakeEggless : cupcakeEggless;
    const noun = branch === "cake" ? "cake" : "cupcakes";
    const spongeField = `${branch}FlavourSponges.${flavour.id}` as const;
    const fillingField = `${branch}FlavourFillings.${flavour.id}` as const;
    type NestedErrors = (Record<string, { message?: string }> & { message?: string }) | undefined;
    const spongeError = form.formState.errors[`${branch}FlavourSponges`] as NestedErrors;
    const fillingError = form.formState.errors[`${branch}FlavourFillings`] as NestedErrors;
    return (
      <FollowUpPanel>
        <div className="space-y-6">
          {flavour.spongeChoices && (
            <RadioCardGroup
              emphasis
              required
              legend={`Which sponge for your ${flavour.name} ${noun}?`}
              hint="Pick one to continue."
              name={spongeField}
              options={flavour.spongeChoices.map((s) => ({ value: s.id, label: s.label }))}
              register={form.register(spongeField)}
              error={spongeError?.[flavour.id]?.message ?? spongeError?.message}
            />
          )}
          {flavour.hasFillingChoice && (
            <SelectField
              emphasis
              required
              label={`Which filling for your ${flavour.name} ${noun}?`}
              hint="Pick one to continue — or keep our usual."
              register={form.register(fillingField)}
              error={fillingError?.[flavour.id]?.message ?? fillingError?.message}
            >
              <option value="">Select a filling…</option>
              <option value={USUAL_FILLING_ID}>Our usual — {defaultFillingLabel(flavour, eggless)}</option>
              {(eggless ? egglessFillings : fillings).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          )}
        </div>
      </FollowUpPanel>
    );
  }

  const matchedSizes = values.guestCount ? sizesForServings(values.guestCount) : [];

  if (submitFallback) {
    return <SubmitFallback summaryText={submitFallback.summaryText} token={submitFallback.token} />;
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {/* Honeypot — hidden from people, left for bots to fill. Not part of the form schema. */}
        <input
          type="text"
          name="company"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />
        <div className="mb-8 flex items-center justify-between">
          <p className="label text-ink-soft">
            Step {step + 1} of {steps.length} — {steps[step]}
          </p>
        </div>
        <div className="mb-10 h-1 w-full bg-rule">
          <div
            className="h-1 bg-ink transition-[width] duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {step === 0 && (
          <RadioCardGroup
            legend="What's the occasion?"
            name="occasion"
            options={occasions.map((o) => ({ value: o, label: o }))}
            register={form.register("occasion")}
            error={form.formState.errors.occasion?.message}
          />
        )}

        {step === 1 && (
          <div>
            <TextField
              label="When do you need it?"
              hint={`Standard orders need at least 14 days' notice. Short notice? Still worth asking.`}
              required
              type="date"
              min={todayISO()}
              register={form.register("eventDate")}
              error={form.formState.errors.eventDate?.message}
            />
            {values.eventDate && isWithinLeadTime(values.eventDate, standardTerms.minLeadTimeDays) && (
              <p role="status" className="mt-3 rounded-[4px] border border-rule bg-icing p-4 text-sm text-ink">
                Your selected date falls within our standard {standardTerms.minLeadTimeDays}-day lead
                time. You&apos;re welcome to send your enquiry — we&apos;ll confirm availability with
                you directly.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <RadioCardGroup
            legend="What are we making?"
            name="productType"
            options={productTypes.map((p) => ({
              value: p,
              label: p === "cake" ? "Cake" : p === "cupcakes" ? "Cupcakes" : "Cake & cupcakes",
            }))}
            register={form.register("productType")}
            error={form.formState.errors.productType?.message}
          />
        )}

        {step === 3 && (
          <div className="space-y-8">
            {(values.productType === "cake" || values.productType === "both") && (
              <div>
                <TextField
                  label="How many guests?"
                  hint="Tell us the guest count — we'll match you to a size."
                  type="number"
                  min={1}
                  register={form.register("guestCount", {
                    setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
                  })}
                  error={form.formState.errors.guestCount?.message}
                />
                {values.guestCount && matchedSizes.length === 1 && (
                  <p className="mt-2 text-sm text-ink-soft">
                    That fits a {matchedSizes[0].tierLabel.toLowerCase()} ({matchedSizes[0].sizesCm.join("/")}cm).
                  </p>
                )}
                {values.guestCount && matchedSizes.length > 1 && (
                  <div className="mt-4">
                    <RadioCardGroup
                      legend="Which fits best?"
                      name="sizeId"
                      options={matchedSizes.map((s) => ({
                        value: s.id,
                        label: `${s.tierLabel} — ${s.sizesCm.join("/")}cm${s.layersNote ? `, ${s.layersNote}` : ""}`,
                        description: `${s.servingsMin}–${s.servingsMax} servings. ${formatPriceFrom(s.priceFrom)}.`,
                      }))}
                      register={form.register("sizeId")}
                    />
                  </div>
                )}
                {values.guestCount && (
                  // Client-requested 2026-09-30: this override was easy to miss as a plain field, so it
                  // sits on the icing tint (same treatment as the lead-time notice) with ink, not
                  // ink-soft, text — more visible without spending any red-ink.
                  <div className="mt-6 rounded-[4px] border border-rule bg-icing p-4">
                    <label className="block">
                      <span className="block font-medium text-ink">Want a bigger or smaller cake?</span>
                      <span className="mt-1 block text-sm text-ink-soft">
                        Pick any size here and it replaces the match above.
                      </span>
                      <select
                        value={values.sizeId ?? ""}
                        onChange={(e) => form.setValue("sizeId", e.target.value || undefined, { shouldValidate: true })}
                        className="mt-3 w-full rounded-[4px] border border-ink bg-paper px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-red-ink"
                      >
                        <option value="">Select…</option>
                        {sizes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.tierLabel} — {s.sizesCm.join("/")}cm{s.layersNote ? `, ${s.layersNote}` : ""} — {s.servingsMin}–{s.servingsMax} servings, {formatPriceFrom(s.priceFrom)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
                <div className="mt-6">
                  <SelectField
                    label="Cake shape"
                    register={form.register("cakeShape")}
                  >
                    <option value="">Select…</option>
                    {cakeShapes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>
            )}
            {(values.productType === "cupcakes" || values.productType === "both") && (
              <div>
                <TextField
                  label="How many dozen?"
                  hint="Gourmet cupcakes — pricing depends on the style you pick below."
                  type="number"
                  min={1}
                  register={form.register("cupcakeDozens", {
                    setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
                  })}
                  error={form.formState.errors.cupcakeDozens?.message}
                />
                {values.cupcakeDozens && (
                  <div className="mt-4">
                    <RadioCardGroup
                      legend="Cupcake style"
                      name="cupcakeStyleId"
                      options={cupcakeStyles.map((s) => ({
                        value: s.id,
                        label: s.label,
                        description: `${formatPriceFrom(
                          s.variants ? Math.min(...s.variants.map((v) => v.priceFrom)) : s.priceFrom
                        )} / dozen`,
                      }))}
                      register={form.register("cupcakeStyleId")}
                      selectedValue={values.cupcakeStyleId}
                      renderAfterSelected={(() => {
                        const style = cupcakeStyles.find((s) => s.id === values.cupcakeStyleId);
                        if (!style?.variants) return null;
                        return (
                          <SelectField label="Print type" register={form.register("cupcakeStyleVariantId")}>
                            <option value="">Select…</option>
                            {style.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.label} — {formatPriceFrom(v.priceFrom)} / dozen
                              </option>
                            ))}
                          </SelectField>
                        );
                      })()}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            {(values.productType === "cake" || values.productType === "both") && (
              <>
                <CheckboxCardGroup
                  legend="Cake dietary options"
                  options={[
                    { value: "gluten-free", label: "Gluten free" },
                    { value: "eggless", label: "Eggless", description: "Available in Vanilla only" },
                  ]}
                  register={form.register("cakeDietaryOptions")}
                  error={form.formState.errors.cakeDietaryOptions?.message}
                />
                <RadioCardGroup
                  legend="Cake flavour"
                  name="cakeFlavourId"
                  options={cakeFlavours.map((f) => ({
                    value: f.id,
                    label: f.name,
                    description: flavourCardDescription(f, cakeEggless),
                    disabled: cakeEggless && !egglessFlavourIds.includes(f.id),
                  }))}
                  register={form.register("cakeFlavourId")}
                  error={form.formState.errors.cakeFlavourId?.message}
                  hint={cakeEggless ? "Only Vanilla Bean is eggless — unselect eggless to choose a different flavour." : undefined}
                  selectedValue={values.cakeFlavourId}
                  renderAfterSelected={flavourExtras("cake")}
                />
              </>
            )}
            {(values.productType === "cupcakes" || values.productType === "both") && (
              <>
                <CheckboxCardGroup
                  legend="Cupcake dietary options"
                  options={[
                    { value: "gluten-free", label: "Gluten free" },
                    { value: "eggless", label: "Eggless", description: "Available in Vanilla only" },
                  ]}
                  register={form.register("cupcakeDietaryOptions")}
                  error={form.formState.errors.cupcakeDietaryOptions?.message}
                />
                <RadioCardGroup
                  legend="Cupcake flavour"
                  name="cupcakeFlavourId"
                  options={cupcakeFlavours.map((f) => ({
                    value: f.id,
                    label: f.name,
                    description: flavourCardDescription(f, cupcakeEggless),
                    disabled: cupcakeEggless && !egglessFlavourIds.includes(f.id),
                  }))}
                  register={form.register("cupcakeFlavourId")}
                  error={form.formState.errors.cupcakeFlavourId?.message}
                  hint={cupcakeEggless ? "Only Vanilla Bean is eggless — unselect eggless to choose a different flavour." : undefined}
                  selectedValue={values.cupcakeFlavourId}
                  renderAfterSelected={flavourExtras("cupcake")}
                />
              </>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <RadioCardGroup
              legend="Design complexity"
              name="designTierId"
              options={designTiers.map((t) => ({ value: t.id, label: t.label, description: t.description }))}
              register={form.register("designTierId")}
              error={form.formState.errors.designTierId?.message}
            />
            <TextAreaField
              label="Theme, colours & style"
              hint="The more detail, the better we can quote — reference images help too."
              register={form.register("designBrief")}
            />
            <ImageUpload files={files} onChange={setFiles} requiredError={filesError} />
            {/* Its own icing ground so it doesn't vanish under the upload thumbnails above. */}
            <div className="rounded-[4px] bg-icing p-4 sm:p-5">
              <TextField
                emphasis
                label="Need a custom topper or any add-ons?"
                hint="Tell us here and we'll include it in your quote."
                register={form.register("addOns")}
              />
            </div>
          </div>
        )}

        {step === 6 && <ConfectionsPicker form={form} />}

        {step === 7 && (
          <div className="space-y-8">
            <RadioCardGroup
              legend="Delivery or collection?"
              name="deliveryMode"
              options={deliveryModes.map((m) => ({ value: m, label: m === "delivery" ? "Delivery" : "Collection" }))}
              register={form.register("deliveryMode")}
            />
            {values.deliveryMode === "delivery" && (
              <TextAreaField
                label="Delivery address"
                required
                hint="Delivery is quoted separately, based on distance from our kitchen."
                register={form.register("address")}
                error={form.formState.errors.address?.message}
              />
            )}
            {values.deliveryMode === "collection" && (
              <SelectField
                label="Collection window"
                required
                hint="Kindly select a one-hour collection window that suits you, and we'll have your order ready for collection during this time."
                register={form.register("collectionWindow")}
                error={form.formState.errors.collectionWindow?.message}
              >
                <option value="">Select…</option>
                {collectionWindows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </SelectField>
            )}
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6">
            <TextField label="Full name" required register={form.register("fullName")} error={form.formState.errors.fullName?.message} />
            <TextField label="Contact number" required register={form.register("contactNumber")} error={form.formState.errors.contactNumber?.message} />
            <TextField
              label="WhatsApp number (if different)"
              hint="Only if it's different from the contact number above — we'll message you there for updates."
              register={form.register("whatsappNumber")}
              error={form.formState.errors.whatsappNumber?.message}
            />
            <TextField label="Email (optional)" type="email" register={form.register("email")} error={form.formState.errors.email?.message} />
            <SelectField label="How did you find us?" register={form.register("foundUs")}>
              <option value="">Select…</option>
              {foundUsOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </SelectField>
            <TextAreaField label="Anything else we should know?" register={form.register("notes")} />
          </div>
        )}

        {step === 9 && (
          <TermsStep
            kind="standard"
            fullName={values.fullName}
            signatureName={values.signatureName}
            signatureNameRegister={form.register("signatureName")}
            signatureNameError={form.formState.errors.signatureName?.message}
            agreedToTermsRegister={form.register("agreedToTerms")}
            agreedError={form.formState.errors.agreedToTerms?.message}
            onPrefillSignature={(name) => form.setValue("signatureName", name)}
          />
        )}

        {step === 10 && (
          <div>
            <p className="text-ink-soft">
              Everything checks out on the right. Send it through and we&apos;ll come back to you
              within 24 hours.
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              Signed by {values.signatureName || values.fullName}.
            </p>
            {files.length > 0 && (
              <p className="mt-3 text-sm text-ink-soft">
                {files.length} reference image{files.length > 1 ? "s" : ""} attached: {files.map((f) => f.name).join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="mt-12 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={step === 0} type="button">
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending…" : "Send my order"}
            </Button>
          )}
        </div>
      </form>

      <LedgerPanel ledger={ledger} className="lg:order-last" />
    </div>
  );
}
