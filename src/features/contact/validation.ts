import { z } from "zod";

/**
 * General contact form only — brief §23/§27. Deliberately has no fields for
 * symptoms, diagnoses, or any health information; the form's own copy
 * states it is not for emergencies and not for private medical details.
 */
export const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  // Honeypot — real users never see or fill this field (visually hidden,
  // aria-hidden, tabIndex -1). Any value here is treated as spam.
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/** Strips HTML tags and collapses whitespace — belt-and-suspenders on top of Zod's type checks. */
export function sanitizeText(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
