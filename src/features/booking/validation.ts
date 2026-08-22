import { z } from "zod";

/** Aesthetics consultation-request form — brief §15. Gated behind consultationFormEnabled. */
export const consultationRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  treatmentInterest: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  companyWebsite: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export type ConsultationRequestValues = z.infer<typeof consultationRequestSchema>;
