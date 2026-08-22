import type { ImageStatus } from "@/types/media";

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
  };
  bookingChannel: "family-doctor" | "phone-medical-botox";
}
