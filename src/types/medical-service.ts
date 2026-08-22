import type { BookingChannel } from "@/config/booking";

export interface Bilingual {
  en: string;
  ar: string;
}

export interface FaqEntry {
  question: Bilingual;
  answer: Bilingual;
}

export interface MedicalServiceContent {
  id: string;
  /** English URL slug — the canonical physical route; Arabic is a proxy-rewritten pretty URL. */
  slug: string;
  slugAr: string;
  title: Bilingual;
  /** Answer-first summary — what this is, in one or two sentences. */
  summary: Bilingual;
  whoItsFor?: Bilingual;
  whatsIncluded?: { en: string[]; ar: string[] };
  howAppointmentsWork?: Bilingual;
  /** When to seek urgent/emergency care instead of this service. */
  urgentCareNote?: Bilingual;
  relatedDoctorIds: string[];
  /** Other medical-service pages worth cross-linking (e.g. Chronic Disease Management <-> Pain Management). */
  relatedServiceIds?: string[];
  bookingChannel: BookingChannel;
  /** External referral partners (e.g. after-hours PCN partners) — name is a proper noun, not translated. */
  externalPartners?: { name: string; url: string; note: Bilingual }[];
  contactNote?: Bilingual;
  faqs?: FaqEntry[];
  /** true only when every field above traces directly to the approved content-extraction doc. */
  sourceVerified: boolean;
}
