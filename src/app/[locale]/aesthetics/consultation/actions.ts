"use server";

import { headers } from "next/headers";
import { consultationRequestSchema } from "@/features/booking/validation";
import { sanitizeText } from "@/features/contact/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";

export type ConsultationFormState = {
  status: "idle" | "success" | "error" | "not-configured";
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
};

/**
 * Same fail-closed delivery pattern as the general contact form
 * (src/lib/forms/delivery.ts) — no CONSULTATION_DELIVERY_PROVIDER
 * exists yet, so submissions validate and rate-limit correctly but never
 * claim a false "sent" success. Route itself is unreachable while
 * `consultationFormEnabled` is false (src/app/[locale]/aesthetics/consultation/page.tsx).
 */
export async function submitConsultationRequest(
  _prevState: ConsultationFormState,
  formData: FormData,
): Promise<ConsultationFormState> {
  if ((formData.get("companyWebsite") as string | null)?.length) {
    return { status: "success" };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`consultation:${ip}`);
  if (!rateLimit.allowed) {
    return { status: "error" };
  }

  const parsed = consultationRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    treatmentInterest: formData.get("treatmentInterest"),
    message: formData.get("message"),
    companyWebsite: formData.get("companyWebsite"),
  });

  if (!parsed.success) {
    const fieldErrors: ConsultationFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ConsultationFormState["fieldErrors"]>;
      if (key) fieldErrors[key] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const sanitized = { ...parsed.data, name: sanitizeText(parsed.data.name), message: sanitizeText(parsed.data.message) };

  // No delivery provider configured for this build — fail closed rather
  // than claim a false "sent" success. See src/lib/forms/delivery.ts
  // for the equivalent, fuller adapter on the general contact form.
  console.warn("[consultation-form] submission received but no delivery provider is configured");
  void sanitized;
  return { status: "not-configured" };
}
