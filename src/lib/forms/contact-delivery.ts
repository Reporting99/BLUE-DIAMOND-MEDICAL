import type { ContactFormValues } from "@/lib/validation/contact";

/**
 * Delivery adapter boundary — brief §27: "Do not activate email or CRM
 * delivery until credentials are supplied." No CONTACT_DELIVERY_PROVIDER
 * is configured in this build, so every submission fails closed with a
 * typed error rather than silently pretending to send. The server action
 * that calls this catches DeliveryNotConfiguredError and shows the user a
 * clear fallback (call the clinic directly) instead of a false "sent"
 * confirmation. See .env.example and docs/DEPLOYMENT.md.
 */
export class DeliveryNotConfiguredError extends Error {
  constructor() {
    super("Contact form delivery provider is not configured.");
    this.name = "DeliveryNotConfiguredError";
  }
}

export async function sendContactMessage(values: ContactFormValues): Promise<void> {
  // Real providers below will read `values`; explicitly marking it "used"
  // here (rather than renaming to `_values`) keeps the no-unused-vars rule
  // meaningful project-wide instead of adding a blanket argsIgnorePattern
  // override — and documents, at the one call site that matters, that the
  // form payload must never be logged (brief §36).
  void values;
  const provider = process.env.CONTACT_DELIVERY_PROVIDER;

  if (!provider) {
    // Never log message body/email/phone — brief §36 ("do not log private
    // form content"). Only a non-identifying signal that a submission
    // was attempted while delivery is unconfigured.
    console.warn("[contact-form] submission received but no delivery provider is configured");
    throw new DeliveryNotConfiguredError();
  }

  // Real providers (e.g. Resend, SendGrid, a CRM webhook) get wired in
  // here once credentials exist. Intentionally unimplemented for now.
  throw new Error(`Unsupported CONTACT_DELIVERY_PROVIDER: ${provider}`);
}
