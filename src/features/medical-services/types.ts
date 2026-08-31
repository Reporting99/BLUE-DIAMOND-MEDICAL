import type { BookingChannel } from "@/config/booking";
import type { Bilingual, FaqEntry } from "@/types/common";
import type { ImageKitAsset } from "@/types/media";

export type { Bilingual, FaqEntry };

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
  /**
   * Lead image, resolved from this entity's FeelStack media assignment.
   *
   * Optional because most services have no assignment yet: absent means the
   * template renders no image block at all, which is the existing behaviour.
   * Never populated from a hardcoded path — see lib/feelstack/media-slots.ts.
   */
  image?: ImageKitAsset;
  /** true only when every field above traces directly to the approved content-extraction doc. */
  sourceVerified: boolean;
}
