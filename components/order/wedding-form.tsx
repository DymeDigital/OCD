"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { get } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePersistedForm, clearPersistedForm } from "@/lib/use-persisted-form";
import { weddingOrderSchema, deliveryModes, foundUsOptions, tableSizeRequiredMessage, type WeddingOrderFormValues } from "@/lib/schemas";
import { computeWeddingLedger } from "@/lib/ledger";
import { formatPriceFrom } from "@/lib/pricing";
import {
  MAX_MIXED_DOZENS,
  tierSheetProblem,
  dozenSheetProblem,
  tierPositionLabel,
  syncTierPicks,
  syncDozenPicks,
  egglessPicks,
} from "@/lib/flavour-picks";
import { weddingSizes, resolveWeddingSize, italianCake } from "@/content/data/sizes";
import { CakeKindPicker, TableCakeFields, ItalianCakeNote } from "@/components/order/cake-kind-fields";
import { cupcakeStyles } from "@/content/data/cupcake-styles";
import { weddingTerms } from "@/content/data/terms";
import { collectionWindows } from "@/content/data/collection-windows";
import { LedgerPanel } from "@/components/order/ledger-panel";
import { ConfectionsPicker, useConfectionImages } from "@/components/order/confections-picker";
import { FlavourSheet, TierStack } from "@/components/order/flavour-sheet";
import { ImageUpload, imageRequiredMessage, scrollToImageUpload } from "@/components/order/image-upload";
import { TermsStep } from "@/components/order/terms-step";
import { SubmitFallback } from "@/components/order/submit-fallback";
import { TextField, TextAreaField, SelectField, RadioCardGroup, CheckboxCardGroup, fieldBoxClass, checkboxClass } from "@/components/order/fields";
import { Button } from "@/components/button";
import { buildOrderPlainText, type OrderSummaryInput } from "@/lib/order-summary";

const STORAGE_KEY = "ocd-wedding-order-draft";

const steps = [
  "Partners & venue",
  "Date & time",
  "Guests & size",
  "Flavours",
  "Design",
  "Extras",
  "Cake table & tasting",
  "Planner & dietary",
  "Delivery",
  "Your details",
  "Terms & sign",
  "Review",
] as const;

const tierCountOptions = [1, 2, 3, 4, 5, 6];

// Same as order-form.tsx: centre whatever's missing (its row, or its card group) and focus it.
function scrollToField(name: string) {
  const el = document.querySelector<HTMLElement>(`[name="${name}"]`);
  if (!el) return;
  const target = el.closest("[data-scroll-target]") ?? el.closest("fieldset") ?? el;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  el.focus({ preventScroll: true });
}

export function WeddingForm() {
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
  const confectionImages = useConfectionImages();

  const form = usePersistedForm<WeddingOrderFormValues>(STORAGE_KEY, zodResolver(weddingOrderSchema), {
    tierCount: 1,
    cakeKind: "tiered",
    tiers: [],
    fauxTierCount: 0,
    perTierFlavourIds: [],
    dietaryOptions: [],
    cupcakeMixFlavours: false,
    cupcakeDozenFlavours: [],
    confections: [],
    tastingWanted: false,
    deliveryMode: "delivery",
    address: "",
    collectionWindow: "",
    flavourFillings: {},
    flavourSponges: {},
    agreedToTerms: false,
  } as unknown as WeddingOrderFormValues);

  const values = form.watch();
  const ledger = useMemo(() => computeWeddingLedger(values), [values]);
  const eggless = !!values.dietaryOptions?.includes("eggless");

  // The size the cake is quoted on — the couple's own pick, or the guest-count fit at their tier
  // count. One flavour row per tier of it, top first, kept in step as the size changes.
  // Table and Italian cakes are one cake, so one flavour row with no tier size.
  const specialKind = values.cakeKind === "table" || values.cakeKind === "italian";
  useEffect(() => {
    if (!values.cakeKind) form.setValue("cakeKind", "tiered");
  }, [values.cakeKind, form]);
  const { size: cakeSize, exact: sizeIsExact, chosen: sizeIsChosen } = resolveWeddingSize(
    values.guestCount,
    values.tierCount,
    values.sizeId
  );
  useEffect(() => {
    const next = syncTierPicks(values.tiers, specialKind ? [undefined] : cakeSize?.sizesCm ?? []);
    if (next) form.setValue("tiers", next);
  }, [specialKind, cakeSize, values.tiers, form]);

  // Changing the tier count by hand drops a picked size that no longer matches it.
  useEffect(() => {
    const picked = weddingSizes.find((s) => s.id === values.sizeId);
    if (picked && picked.tier !== values.tierCount) form.setValue("sizeId", "");
  }, [values.sizeId, values.tierCount, form]);

  // Cupcakes: one flavour row for the lot, or one per dozen when mixing (needs 2+ dozen, up to
  // MAX_MIXED_DOZENS, and not eggless — that only comes in one flavour).
  const canMixCupcakes =
    !!values.cupcakeDozens && values.cupcakeDozens >= 2 && values.cupcakeDozens <= MAX_MIXED_DOZENS && !eggless;
  useEffect(() => {
    if (values.cupcakeMixFlavours && !canMixCupcakes) form.setValue("cupcakeMixFlavours", false);
    const count = !values.cupcakeDozens ? 0 : values.cupcakeMixFlavours ? values.cupcakeDozens : 1;
    const next = syncDozenPicks(values.cupcakeDozenFlavours, count);
    if (next) form.setValue("cupcakeDozenFlavours", next);
  }, [canMixCupcakes, values.cupcakeMixFlavours, values.cupcakeDozens, values.cupcakeDozenFlavours, form]);

  // Default to "Basic" the moment a dozen count is entered, so the ledger has a real style to price.
  useEffect(() => {
    if (!values.cupcakeDozens || values.cupcakeStyleId) return;
    form.setValue("cupcakeStyleId", cupcakeStyles[0].id);
  }, [values.cupcakeDozens, values.cupcakeStyleId, form]);

  useEffect(() => {
    if (!values.cupcakeStyleVariantId) return;
    const style = cupcakeStyles.find((s) => s.id === values.cupcakeStyleId);
    if (!style?.variants?.some((v) => v.id === values.cupcakeStyleVariantId)) {
      form.setValue("cupcakeStyleVariantId", "");
    }
  }, [values.cupcakeStyleId, values.cupcakeStyleVariantId, form]);

  // Eggless only comes in Vanilla Bean — move every tier and every dozen onto it the moment
  // eggless is checked, and drop fillings the eggless list doesn't offer.
  useEffect(() => {
    if (!eggless) return;
    const tiers = egglessPicks(values.tiers);
    if (tiers) form.setValue("tiers", tiers, { shouldValidate: true });
    const dozens = egglessPicks(values.cupcakeDozenFlavours);
    if (dozens) form.setValue("cupcakeDozenFlavours", dozens, { shouldValidate: true });
  }, [eggless, values.tiers, values.cupcakeDozenFlavours, form]);

  // The per-row bindings FlavourSheet needs — dynamic array paths, so typed as plain strings here.
  const sheetBindings = {
    register: (path: string) => form.register(path as never),
    setValue: (path: string, value: unknown) => form.setValue(path as never, value as never),
    errorFor: (path: string) => (get(form.formState.errors, path) as { message?: string } | undefined)?.message,
  };

  const stepFields: (keyof WeddingOrderFormValues)[][] = [
    ["partnerNames", "venue", "venueContact"],
    ["weddingDate", "weddingTime"],
    ["guestCount", "tierCount", "tableSizeId"],
    ["dietaryOptions"],
    ["designBrief"],
    ["cupcakeDozens", "confections"],
    [],
    [],
    ["deliveryMode", "address", "collectionWindow"],
    ["fullName", "contactNumber", "email"],
    ["signatureName", "agreedToTerms"],
    [],
  ];

  async function goNext() {
    const fields = stepFields[step];
    let valid = fields.length === 0 ? true : await form.trigger(fields as never[]);
    let firstInvalidField: string | undefined;

    // The schema's per-row checks only run once every field type-checks, which never happens
    // mid-wizard — so the flavour sheets are checked here directly.
    if (step === 2 && values.cakeKind === "table" && !values.tableSizeId) {
      firstInvalidField = "tableSizeId";
      form.setError("tableSizeId", { type: "manual", message: tableSizeRequiredMessage });
      valid = false;
    }

    if (step === 3) {
      const problem = tierSheetProblem(values.tiers, eggless);
      if (problem) {
        firstInvalidField = `tiers.${problem.index}.${problem.field}`;
        form.setError(firstInvalidField as never, { type: "manual", message: problem.message });
        valid = false;
      }
    }

    if (step === 5 && values.cupcakeDozens) {
      const problem = dozenSheetProblem(values.cupcakeDozenFlavours, eggless);
      if (problem) {
        firstInvalidField = `cupcakeDozenFlavours.${problem.index}.${problem.field}`;
        form.setError(firstInvalidField as never, { type: "manual", message: problem.message });
        valid = false;
      }
    }

    // Files live in component state, not the form schema.
    if (step === 4 && files.length === 0) {
      setFilesError(imageRequiredMessage);
      if (valid) scrollToImageUpload();
      valid = false;
    }

    // Cake pops, cakesicles, sugar cookies and bespoke macarons each need their own photo.
    const missingConfectionImage = step === 5 ? confectionImages.validate(values.confections) : null;
    if (missingConfectionImage) valid = false;

    if (valid) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      return;
    }
    if (firstInvalidField) scrollToField(firstInvalidField);
    else if (missingConfectionImage)
      document.getElementById(missingConfectionImage)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: WeddingOrderFormValues) {
    // Files aren't autosaved, so guard here too rather than let the server reject the order.
    if (files.length === 0) {
      setFilesError(imageRequiredMessage);
      setStep(4);
      return;
    }
    if (confectionImages.validate(data.confections)) {
      setStep(5);
      return;
    }
    const summaryInput: OrderSummaryInput = { token: null, kind: "wedding", data, ledger };

    const body = new FormData();
    body.set("kind", "wedding");
    body.set("data", JSON.stringify(data));
    body.set("company", honeypot);
    body.set("renderedAt", String(mountedAt));
    files.forEach((file) => body.append("files", file));
    confectionImages.appendTo(body, data.confections);

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
      setSubmitFallback({ summaryText: buildOrderPlainText(summaryInput, null), token: null });
    }
  }

  if (submitFallback) {
    return <SubmitFallback summaryText={submitFallback.summaryText} token={submitFallback.token} />;
  }

  const tiers = values.tiers ?? [];
  const dozenRowsCount = values.cupcakeDozenFlavours?.length ?? 0;

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
          <div className="space-y-6">
            <TextField label="Partner names" required register={form.register("partnerNames")} error={form.formState.errors.partnerNames?.message} />
            <TextField label="Venue" required register={form.register("venue")} error={form.formState.errors.venue?.message} />
            <TextField label="Venue contact (optional)" register={form.register("venueContact")} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <TextField
              label="Wedding date"
              required
              type="date"
              hint={`Guest count and design are due at least ${weddingTerms.guestCountDeadlineDays} days before the wedding.`}
              register={form.register("weddingDate")}
              error={form.formState.errors.weddingDate?.message}
            />
            <TextField label="Time (optional)" type="time" register={form.register("weddingTime")} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <TextField
              label="Guest count"
              required
              type="number"
              min={1}
              register={form.register("guestCount", {
                setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
              })}
              error={form.formState.errors.guestCount?.message}
            />
            <CakeKindPicker register={form.register("cakeKind")} />
            {values.cakeKind === "table" && (
              <TableCakeFields
                widthCm={values.tableWidthCm}
                sizeId={values.tableSizeId}
                guestCount={values.guestCount}
                onWidthChange={(w) => {
                  form.setValue("tableWidthCm", w);
                  form.setValue("tableSizeId", "");
                }}
                onSizeChange={(id) => form.setValue("tableSizeId", id, { shouldValidate: true })}
                error={form.formState.errors.tableSizeId?.message}
              />
            )}
            {values.cakeKind === "italian" && <ItalianCakeNote />}
            {!specialKind && (
            <>
            <SelectField label="Number of tiers" required register={form.register("tierCount", { valueAsNumber: true })}>
              {tierCountOptions.map((n) => (
                <option key={n} value={n}>
                  {n} tier{n > 1 ? "s" : ""}
                </option>
              ))}
            </SelectField>
            {cakeSize && !sizeIsChosen && (
              <p className="text-sm text-ink-soft">
                {sizeIsExact
                  ? `That fits a ${cakeSize.sizesCm.join("/")}cm cake — ${cakeSize.servingsMin}–${cakeSize.servingsMax} servings.`
                  : `The biggest ${cakeSize.tier}-tier cake is ${cakeSize.sizesCm.join("/")}cm, ${cakeSize.servingsMin}–${cakeSize.servingsMax} servings.${
                      values.guestCount && values.guestCount > cakeSize.servingsMax ? " For your guest count you may want more tiers." : ""
                    }`}
              </p>
            )}
            {/* Client-requested 2026-10-24: the same bigger/smaller override as the standard form. */}
            <div className="rounded-[4px] border border-rule bg-icing p-4">
              <label className="block">
                <span className="block font-medium text-ink">Want a bigger or smaller cake?</span>
                <span className="mt-1 block text-sm text-ink-soft">
                  Pick any size here and it replaces the match above.
                </span>
                <select
                  value={sizeIsChosen ? values.sizeId ?? "" : ""}
                  onChange={(e) => {
                    const picked = weddingSizes.find((s) => s.id === e.target.value);
                    form.setValue("sizeId", picked?.id ?? "", { shouldValidate: true });
                    if (picked) form.setValue("tierCount", picked.tier, { shouldValidate: true });
                  }}
                  className={`mt-3 ${fieldBoxClass}`}
                >
                  <option value="">Select…</option>
                  {weddingSizes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tierLabel} — {s.sizesCm.join("/")}cm — {s.servingsMin}–{s.servingsMax} servings, {formatPriceFrom(s.priceFrom)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {(values.tierCount ?? 1) > 1 && (
              <p className="text-sm text-ink-soft">
                Want extra height on a budget? You can make any tier a dummy on the next step.
              </p>
            )}
            </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <CheckboxCardGroup
              legend="Dietary options"
              options={[
                { value: "gluten-free", label: "Gluten free" },
                { value: "eggless", label: "Eggless", description: "Available in Vanilla only" },
              ]}
              register={form.register("dietaryOptions")}
              error={form.formState.errors.dietaryOptions?.message}
            />
            <section className="space-y-4">
              <div>
                <p className="font-medium text-ink">{tiers.length > 1 ? "Flavour per tier" : "Flavour"}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {tiers.length > 1
                    ? "Pick a flavour for each tier, top to bottom. A dummy tier is polystyrene, iced to match — at least one tier needs to be real cake."
                    : "Pick the flavour for your cake."}{" "}
                  Some flavours and fillings add to the cake price — shown as a percentage.
                  {values.cakeKind === "italian" && ` We recommend ${italianCake.recommendation}.`}
                  {eggless && " Only Vanilla Bean is eggless."}
                </p>
              </div>
              <TierStack tiers={tiers} />
              <FlavourSheet
                name="tiers"
                rows={tiers}
                noun="tier"
                rowTitle={(i) => tierPositionLabel(i, tiers.length)}
                rowMeta={(i) => (tiers[i]?.sizeCm ? `${tiers[i].sizeCm}cm` : undefined)}
                category="cake"
                eggless={eggless}
                allowFaux={tiers.length > 1}
                {...sheetBindings}
              />
            </section>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <TextAreaField
              label="Theme, colours & design"
              required
              hint="Tell us what you're picturing — reference images help a lot here."
              register={form.register("designBrief")}
              error={form.formState.errors.designBrief?.message}
              rows={6}
            />
            <ImageUpload files={files} onChange={setFiles} requiredError={filesError} />
          </div>
        )}

        {/* Client-requested 2026-10-24: cupcakes, cake pops, cookies and the rest, alongside the cake. */}
        {step === 5 && (
          <div className="space-y-10">
            <section className="space-y-4">
              <TextField
                label="Cupcakes — how many dozen? (optional)"
                hint="Leave it empty if you don't need any."
                type="number"
                min={1}
                register={form.register("cupcakeDozens", {
                  setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
                })}
                error={form.formState.errors.cupcakeDozens?.message}
              />
              {!!values.cupcakeDozens && (
                <>
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
                  {canMixCupcakes && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-[4px] border border-ink-soft bg-icing p-4 transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:ring-1 has-[:checked]:ring-inset has-[:checked]:ring-ink">
                      <input
                        type="checkbox"
                        {...form.register("cupcakeMixFlavours")}
                        className={`mt-0.5 ${checkboxClass}`}
                      />
                      <span>
                        <span className="block font-medium text-ink">Mix flavours by the dozen</span>
                        <span className="mt-1 block text-sm text-ink-soft">
                          Pick a different flavour for each of your {values.cupcakeDozens} dozen.
                        </span>
                      </span>
                    </label>
                  )}
                  <div>
                    <p className="font-medium text-ink">Cupcake flavour{dozenRowsCount > 1 ? "s" : ""}</p>
                    <div className="mt-3">
                      <FlavourSheet
                        name="cupcakeDozenFlavours"
                        rows={values.cupcakeDozenFlavours ?? []}
                        noun="dozen"
                        rowTitle={(i) =>
                          values.cupcakeMixFlavours ? `Dozen ${i + 1}` : `All ${values.cupcakeDozens} dozen`
                        }
                        category="cupcake"
                        eggless={eggless}
                        {...sheetBindings}
                      />
                    </div>
                  </div>
                  {values.cupcakeDozens > MAX_MIXED_DOZENS && (
                    <p className="text-sm text-ink-soft">
                      Want a mix across more than {MAX_MIXED_DOZENS} dozen? Pick the main flavour
                      here and tell us the split in your notes.
                    </p>
                  )}
                </>
              )}
            </section>
            <ConfectionsPicker
              form={form}
              images={confectionImages.images}
              onImagesChange={confectionImages.onImagesChange}
              imageErrors={confectionImages.errors}
            />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <TextAreaField label="Cake table setup (optional)" hint="Stands, florals, signage — anything you already have planned." register={form.register("cakeTableSetup")} />
            <label className="flex cursor-pointer items-center gap-3 rounded-[4px] border border-ink-soft bg-paper p-4 transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-icing has-[:checked]:ring-1 has-[:checked]:ring-inset has-[:checked]:ring-ink">
              <input
                type="checkbox"
                {...form.register("tastingWanted")}
                className={checkboxClass}
              />
              <span>I&apos;d like a tasting before the big day</span>
            </label>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <TextField label="Planner / coordinator name (optional)" register={form.register("plannerName")} />
            <TextField label="Planner / coordinator contact (optional)" register={form.register("plannerContact")} />
            <TextAreaField label="Dietary requirements (optional)" register={form.register("dietaryRequirements")} />
          </div>
        )}

        {step === 8 && (
          <div className="space-y-8">
            <RadioCardGroup
              legend="Delivery or collection?"
              name="deliveryMode"
              options={deliveryModes.map((m) => ({ value: m, label: m === "delivery" ? "Delivery & setup" : "Collection" }))}
              register={form.register("deliveryMode")}
            />
            {values.deliveryMode === "delivery" && (
              <TextAreaField
                label="Venue address"
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

        {step === 9 && (
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

        {step === 10 && (
          <TermsStep
            kind="wedding"
            fullName={values.fullName}
            signatureName={values.signatureName}
            signatureNameRegister={form.register("signatureName")}
            signatureNameError={form.formState.errors.signatureName?.message}
            agreedToTermsRegister={form.register("agreedToTerms")}
            agreedError={form.formState.errors.agreedToTerms?.message}
            onPrefillSignature={(name) => form.setValue("signatureName", name)}
          />
        )}

        {step === 11 && (
          <div>
            <p className="text-ink-soft">
              Wedding cakes get a closer look before we quote — send this through and we&apos;ll
              come back to you within 24 hours to start the design conversation.
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
