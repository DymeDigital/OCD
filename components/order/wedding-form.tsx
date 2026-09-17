"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePersistedForm, clearPersistedForm } from "@/lib/use-persisted-form";
import { weddingOrderSchema, deliveryModes, foundUsOptions, type WeddingOrderFormValues } from "@/lib/schemas";
import { computeWeddingLedger } from "@/lib/ledger";
import { flavours, egglessFlavourIds } from "@/content/data/flavours";
import { weddingTerms } from "@/content/data/terms";
import { LedgerPanel } from "@/components/order/ledger-panel";
import { ImageUpload } from "@/components/order/image-upload";
import { TermsStep } from "@/components/order/terms-step";
import { SubmitFallback } from "@/components/order/submit-fallback";
import { TextField, TextAreaField, SelectField, RadioCardGroup, CheckboxCardGroup } from "@/components/order/fields";
import { Button } from "@/components/button";
import { buildOrderPlainText, type OrderSummaryInput } from "@/lib/order-summary";

const STORAGE_KEY = "ocd-wedding-order-draft";

const steps = [
  "Partners & venue",
  "Date & time",
  "Guests & tiers",
  "Flavours",
  "Design",
  "Cake table & tasting",
  "Planner & dietary",
  "Delivery",
  "Your details",
  "Terms & sign",
  "Review",
] as const;

const tierCountOptions = [1, 2, 3, 4, 5, 6];

export function WeddingForm() {
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

  const form = usePersistedForm<WeddingOrderFormValues>(STORAGE_KEY, zodResolver(weddingOrderSchema), {
    fauxTierCount: 0,
    perTierFlavourIds: [],
    dietaryOptions: [],
    tastingWanted: false,
    deliveryMode: "delivery",
    agreedToTerms: false,
  } as unknown as WeddingOrderFormValues);

  const values = form.watch();
  const ledger = useMemo(() => computeWeddingLedger(values), [values]);

  // Eggless only comes in Vanilla Bean — deselect any other flavour the moment eggless is checked.
  useEffect(() => {
    if (!values.dietaryOptions?.includes("eggless")) return;
    const perTier = values.perTierFlavourIds ?? [];
    const filtered = perTier.filter((id) => egglessFlavourIds.includes(id));
    if (filtered.length !== perTier.length) form.setValue("perTierFlavourIds", filtered, { shouldValidate: true });
  }, [values.dietaryOptions, values.perTierFlavourIds, form]);

  // At least one tier must be real cake — pull faux count down if tier count drops below it.
  useEffect(() => {
    const tierCount = values.tierCount ?? 1;
    const faux = values.fauxTierCount ?? 0;
    if (faux >= tierCount) form.setValue("fauxTierCount", Math.max(0, tierCount - 1), { shouldValidate: true });
  }, [values.tierCount, values.fauxTierCount, form]);

  const stepFields: (keyof WeddingOrderFormValues)[][] = [
    ["partnerNames", "venue", "venueContact"],
    ["weddingDate", "weddingTime"],
    ["guestCount", "tierCount", "fauxTierCount"],
    [],
    ["designBrief"],
    [],
    [],
    ["deliveryMode", "address"],
    ["fullName", "contactNumber", "email"],
    ["signatureName", "agreedToTerms"],
    [],
  ];

  async function goNext() {
    const fields = stepFields[step];
    const valid = fields.length === 0 ? true : await form.trigger(fields as never[]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: WeddingOrderFormValues) {
    const summaryInput: OrderSummaryInput = { token: null, kind: "wedding", data, ledger };

    const body = new FormData();
    body.set("kind", "wedding");
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
      setSubmitFallback({ summaryText: buildOrderPlainText(summaryInput, null), token: null });
    }
  }

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
            <SelectField label="Number of tiers" required register={form.register("tierCount", { valueAsNumber: true })}>
              {tierCountOptions.map((n) => (
                <option key={n} value={n}>
                  {n} tier{n > 1 ? "s" : ""}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Faux/dummy tiers (optional)"
              register={form.register("fauxTierCount", { valueAsNumber: true })}
              error={form.formState.errors.fauxTierCount?.message}
            >
              {Array.from({ length: values.tierCount ?? 1 }, (_, n) => n).map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "None — all real cake" : `${n} faux tier${n > 1 ? "s" : ""}`}
                </option>
              ))}
            </SelectField>
            <p className="text-sm text-ink-soft">
              Faux tiers are polystyrene, iced to match — handy for extra height on a budget. At
              least one tier needs to be real cake.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <CheckboxCardGroup
              legend="Flavour(s) — pick one per tier, or mix it up"
              options={flavours.map((f) => ({ value: f.id, label: f.name, description: f.filling }))}
              register={form.register("perTierFlavourIds")}
            />
            <CheckboxCardGroup
              legend="Dietary options"
              options={[
                { value: "gluten-free", label: "Gluten free" },
                { value: "eggless", label: "Eggless", description: "Available in Vanilla only" },
              ]}
              register={form.register("dietaryOptions")}
            />
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
            <ImageUpload files={files} onChange={setFiles} />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <TextAreaField label="Cake table setup (optional)" hint="Stands, florals, signage — anything you already have planned." register={form.register("cakeTableSetup")} />
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...form.register("tastingWanted")}
                className="h-4 w-4 shrink-0 rounded-[2px] border border-rule accent-ink"
              />
              <span>I&apos;d like a tasting before the big day</span>
            </label>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <TextField label="Planner / coordinator name (optional)" register={form.register("plannerName")} />
            <TextField label="Planner / coordinator contact (optional)" register={form.register("plannerContact")} />
            <TextAreaField label="Dietary requirements (optional)" register={form.register("dietaryRequirements")} />
          </div>
        )}

        {step === 7 && (
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
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6">
            <TextField label="Full name" required register={form.register("fullName")} error={form.formState.errors.fullName?.message} />
            <TextField label="Contact number" required register={form.register("contactNumber")} error={form.formState.errors.contactNumber?.message} />
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

        {step === 10 && (
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

      <LedgerPanel ledger={ledger} className="order-first lg:order-last" />
    </div>
  );
}
