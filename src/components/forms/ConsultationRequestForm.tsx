"use client";

import { useActionState } from "react";
import { submitConsultationRequest, type ConsultationFormState } from "@/app/[locale]/aesthetics/consultation/actions";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

const copy = {
  en: {
    name: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    treatmentInterest: "Treatment of interest (optional)",
    message: "Tell us a bit about what you're looking for",
    submit: "Request a consultation",
    submitting: "Sending…",
    success: "Thank you — we've received your request.",
    notConfigured: "This form isn't connected yet. Please call us at 403 247 1418 and we'll help right away.",
    error: "Something went wrong. Please try again, or call us at 403 247 1418.",
  },
  ar: {
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف (اختياري)",
    treatmentInterest: "العلاج المرغوب (اختياري)",
    message: "أخبرونا قليلًا عمّا تبحثون عنه",
    submit: "طلب استشارة",
    submitting: "جارٍ الإرسال…",
    success: "شكرًا لكم — تم استلام طلبكم.",
    notConfigured: "هذا النموذج غير مرتبط بعد. يرجى الاتصال بنا على 403 247 1418 وسنساعدكم فورًا.",
    error: "حدث خطأ ما. يرجى المحاولة مرة أخرى، أو الاتصال بنا على 403 247 1418.",
  },
} as const;

const initialState: ConsultationFormState = { status: "idle" };

export function ConsultationRequestForm({ locale }: { locale: Locale }) {
  const [state, formAction, isPending] = useActionState(submitConsultationRequest, initialState);
  const t = copy[locale];

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-md border border-success bg-success-surface px-4 py-3 text-success">
        {t.success}
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.status === "not-configured" ? (
        <div role="alert" className="rounded-md border border-border bg-surface px-4 py-3 text-sm">
          {t.notConfigured}
        </div>
      ) : null}
      {state.status === "error" && !state.fieldErrors ? (
        <div role="alert" className="rounded-md border border-destructive bg-destructive-surface px-4 py-3 text-sm text-destructive">
          {t.error}
        </div>
      ) : null}

      <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <Field label={t.name} name="name" type="text" required error={state.fieldErrors?.name} />
      <Field label={t.email} name="email" type="email" required error={state.fieldErrors?.email} />
      <Field label={t.phone} name="phone" type="tel" error={state.fieldErrors?.phone} />
      <Field label={t.treatmentInterest} name="treatmentInterest" type="text" />
      <FieldTextarea label={t.message} name="message" required error={state.fieldErrors?.message} />

      <Button type="submit" size="lg" disabled={isPending} className="self-start">
        {isPending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}

function Field({ label, name, type, required, error }: { label: string; name: string; type: string; required?: boolean; error?: string }) {
  const errorId = `${name}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FieldTextarea({ label, name, required, error }: { label: string; name: string; required?: boolean; error?: string }) {
  const errorId = `${name}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={5}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
