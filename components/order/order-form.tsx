"use client";

import { useEffect, useMemo, useState } from "react";
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
  type OrderFormValues,
} from "@/lib/schemas";
import { computeOrderLedger } from "@/lib/ledger";
import { formatPriceFrom } from "@/lib/pricing";
import { flavours, egglessFlavourIds } from "@/content/data/flavours";
import { fillings, egglessFillings } from "@/content/data/fillings";
import { designTiers } from "@/content/data/designTiers";
import { sizesForServings } from "@/content/data/sizes";
import { collectionWindows } from "@/content/data/collection-windows";
import { LedgerPanel } from "@/components/order/ledger-panel";
import { ConfectionsPicker } from "@/components/order/confections-picker";
import { ImageUpload } from "@/components/order/image-upload";
import { TermsStep } from "@/components/order/terms-step";
import { SubmitFallback } from "@/components/order/submit-fallback";
import { TextField, TextAreaField, SelectField, RadioCardGroup, CheckboxCardGroup } from "@/components/order/fields";
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

function minEventDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function OrderForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [submitFallback, setSubmitFallback] = useState<{ summaryText: string; token: string | null } | null>(
    null
  );
  // Anti-spam, checked server-side: a honeypot field bots fill and humans never see, and the time
  // the form first rendered (submitting in under 3s reads as automated).
  const [honeypot, setHoneypot] = useState("");
  const [mountedAt] = useState(() => Date.now());

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
      if (!options.some((o) => o.id === pickedCake)) {
        form.setValue("cakeFlavourFillings.vanilla-bean-caramel", "", { shouldValidate: true });
      }
    }
    const pickedCupcake = values.cupcakeFlavourFillings?.["vanilla-bean-caramel"];
    if (pickedCupcake) {
      const options = cupcakeEggless ? egglessFillings : fillings;
      if (!options.some((o) => o.id === pickedCupcake)) {
        form.setValue("cupcakeFlavourFillings.vanilla-bean-caramel", "", { shouldValidate: true });
      }
    }
  }, [cakeEggless, cupcakeEggless, values.cakeFlavourFillings, values.cupcakeFlavourFillings, form]);

  // When more than one size fits the guest count (e.g. a mini cake and a bento box both do),
  // default to the cheapest so the field is always populated even if the customer never touches
  // the picker below, but don't fight a choice they've already made.
  useEffect(() => {
    if (!values.guestCount) return;
    const candidates = sizesForServings(values.guestCount);
    if (candidates.length === 0) return;
    if (!candidates.some((s) => s.id === values.sizeId)) form.setValue("sizeId", candidates[0].id);
  }, [values.guestCount, values.sizeId, form]);

  const stepFields: (keyof OrderFormValues)[][] = [
    ["occasion"],
    ["eventDate"],
    ["productType"],
    values.productType === "both" ? ["guestCount", "cupcakeDozens"] : values.productType === "cupcakes" ? ["cupcakeDozens"] : ["guestCount"],
    [],
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

    // guestCount/cupcakeDozens are schema-optional (each only applies to some productType
    // branches), so zodResolver's per-field trigger above can't express "required for this
    // branch" — a schema-level cross-field refine can't either: Zod only runs a ZodObject's
    // .refine()/.superRefine() chain once every other field type-checks, and at this step in the
    // wizard fullName/contactNumber/etc. are still empty, so it would never fire here. Checked
    // directly instead.
    if (step === 3) {
      if ((values.productType === "cake" || values.productType === "both") && !values.guestCount) {
        form.setError("guestCount", { type: "manual", message: "Let us know how many guests you're expecting." });
        valid = false;
      }
      if ((values.productType === "cupcakes" || values.productType === "both") && !values.cupcakeDozens) {
        form.setError("cupcakeDozens", { type: "manual", message: "Let us know how many dozen you'd like." });
        valid = false;
      }
    }

    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: OrderFormValues) {
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
          <TextField
            label="When do you need it?"
            hint={`Standard orders need at least 14 days' notice.`}
            required
            type="date"
            min={minEventDate(14)}
            register={form.register("eventDate")}
            error={form.formState.errors.eventDate?.message}
          />
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
              <TextField
                label="How many dozen?"
                hint={`Gourmet cupcakes, from R450 / dozen.`}
                type="number"
                min={1}
                register={form.register("cupcakeDozens", {
                  setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
                })}
                error={form.formState.errors.cupcakeDozens?.message}
              />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            {(values.productType === "cake" || values.productType === "both") && (
              <>
                <RadioCardGroup
                  legend="Cake flavour"
                  name="cakeFlavourId"
                  options={cakeFlavours.map((f) => ({
                    value: f.id,
                    label: f.name,
                    description: f.filling,
                    disabled: cakeEggless && !egglessFlavourIds.includes(f.id),
                  }))}
                  register={form.register("cakeFlavourId")}
                  error={form.formState.errors.cakeFlavourId?.message}
                  hint={cakeEggless ? "Only Vanilla Bean is eggless — unselect eggless to choose a different flavour." : undefined}
                />
                <CheckboxCardGroup
                  legend="Cake dietary options"
                  options={[
                    { value: "gluten-free", label: "Gluten free" },
                    { value: "eggless", label: "Eggless", description: "Available in Vanilla only" },
                  ]}
                  register={form.register("cakeDietaryOptions")}
                />
                {(() => {
                  const flavour = flavours.find((f) => f.id === values.cakeFlavourId);
                  if (!flavour?.hasFillingChoice) return null;
                  const options = cakeEggless ? egglessFillings : fillings;
                  return (
                    <div className="space-y-6">
                      <p className="label text-ink-soft">Cake filling</p>
                      <SelectField label={`${flavour.name} filling`} register={form.register(`cakeFlavourFillings.${flavour.id}`)}>
                        <option value="">Use the usual filling — {flavour.filling}</option>
                        {options.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  );
                })()}
              </>
            )}
            {(values.productType === "cupcakes" || values.productType === "both") && (
              <>
                <RadioCardGroup
                  legend="Cupcake flavour"
                  name="cupcakeFlavourId"
                  options={cupcakeFlavours.map((f) => ({
                    value: f.id,
                    label: f.name,
                    description: f.filling,
                    disabled: cupcakeEggless && !egglessFlavourIds.includes(f.id),
                  }))}
                  register={form.register("cupcakeFlavourId")}
                  error={form.formState.errors.cupcakeFlavourId?.message}
                  hint={cupcakeEggless ? "Only Vanilla Bean is eggless — unselect eggless to choose a different flavour." : undefined}
                />
                <CheckboxCardGroup
                  legend="Cupcake dietary options"
                  options={[
                    { value: "gluten-free", label: "Gluten free" },
                    { value: "eggless", label: "Eggless", description: "Available in Vanilla only" },
                  ]}
                  register={form.register("cupcakeDietaryOptions")}
                />
                {(() => {
                  const flavour = flavours.find((f) => f.id === values.cupcakeFlavourId);
                  if (!flavour?.hasFillingChoice) return null;
                  const options = cupcakeEggless ? egglessFillings : fillings;
                  return (
                    <div className="space-y-6">
                      <p className="label text-ink-soft">Cupcake filling</p>
                      <SelectField label={`${flavour.name} filling`} register={form.register(`cupcakeFlavourFillings.${flavour.id}`)}>
                        <option value="">Use the usual filling — {flavour.filling}</option>
                        {options.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  );
                })()}
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
            />
            <TextAreaField
              label="Theme, colours & style"
              hint="The more detail, the better we can quote — reference images help too."
              register={form.register("designBrief")}
            />
            <ImageUpload files={files} onChange={setFiles} />
            <TextField label="Custom topper or add-ons needed?" register={form.register("addOns")} />
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

      <LedgerPanel ledger={ledger} className="order-first lg:order-last" />
    </div>
  );
}
