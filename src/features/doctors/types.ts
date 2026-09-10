import type { ImageStatus, Locale } from "@/types/media";

export interface Doctor {
  id: string;
  routeId: string;
  name: { en: string; ar: string };
  credentials: { en: string; ar: string };
  bio: { en: string; ar: string };
  clinicalInterests?: { en: string[]; ar: string[] };
  /** Whether this doctor performs Botox/aesthetics — drives cross-links. */
  practicesAesthetics: boolean;
  image: {
    path: string;
    status: ImageStatus;
    /** true = subject has explicitly declined photography; never revisit. */
    photoDeclined?: boolean;
    /**
     * CL-025 — locales this asset may be shown in. Absent means "both",
     * which is every doctor but one. Dr. Omaima Saeed's consent-protected
     * identity card carries her name and title in Arabic as well as English,
     * and displaying it on the ENGLISH card and profile implied she reads or
     * speaks Arabic. Restricting it to `["ar"]` removes that implication from
     * the English presentation without touching the consent guarantee or the
     * legitimate Arabic layout.
     */
    locales?: Locale[];
    /**
     * The CMS assignment's asset id, when this portrait came from a real
     * FeelStack assignment rather than the static roster record — see
     * `ImageKitImage`'s `version` prop. Absent for the static record, which
     * is fine: it renders exactly as before, just without cache-busting.
     */
    id?: string;
  };
  bookingChannel: "family-doctor" | "phone-medical-botox";
}
