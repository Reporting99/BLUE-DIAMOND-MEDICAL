"use server";

import { headers } from "next/headers";
import { contactFormSchema, sanitizeText } from "@/features/contact/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sendContactMessage, DeliveryNotConfiguredError } from "@/lib/forms/delivery";

export type ContactFormState = {
  status: "idle" | "success" | "error" | "not-configured";
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot — a filled hidden field means a bot, fail silently as "success"
  // so scrapers get no signal, without ever attempting delivery.
  if ((formData.get("companyWebsite") as string | null)?.length) {
    return { status: "success" };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`contact:${ip}`);
  if (!rateLimit.allowed) {
    return { status: "error" };
  }

  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    companyWebsite: formData.get("companyWebsite"),
  });

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactFormState["fieldErrors"]>;
      if (key) fieldErrors[key] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const sanitized = {
    ...parsed.data,
    name: sanitizeText(parsed.data.name),
    message: sanitizeText(parsed.data.message),
  };

  try {
    await sendContactMessage(sanitized);
    return { status: "success" };
  } catch (error) {
    if (error instanceof DeliveryNotConfiguredError) {
      return { status: "not-configured" };
    }
    return { status: "error" };
  }
}
