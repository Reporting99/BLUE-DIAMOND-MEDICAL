import type { Locale } from "@/types/media";
import { doctors } from "./data";
import type { Doctor } from "./types";

export function getDoctor(id: string): Doctor | undefined {
  return doctors.find((d) => d.id === id);
}

/**
 * CL-025 — the portrait reference a given locale is allowed to render.
 *
 * Every doctor surface (team index, profile, homepage) resolves through this
 * rather than reading `doctor.image` directly, so a locale restriction is
 * honoured in one place and cannot be reintroduced by a page that forgets it.
 * A restricted asset is returned with `status: "disabled"`, which is the
 * existing signal ImageKitImage already understands: it draws the branded
 * FacetTile instead of the asset.
 */
export function portraitForLocale(doctor: Doctor, locale: Locale): Doctor["image"] {
  // The restriction is read from the STATIC roster record, not from whatever
  // record was passed in. A doctor resolved from FeelStack in hybrid/cms mode
  // has no `locales` field -- the CMS contract does not carry one -- so
  // trusting the argument alone would quietly reopen CL-025 the moment the
  // CMS became the content source. This is a consent/accuracy control, so it
  // fails closed against the roster instead.
  const restriction = (doctors.find((d) => d.id === doctor.id) ?? doctor).image.locales;
  if (restriction && !restriction.includes(locale)) {
    return { ...doctor.image, status: "disabled" };
  }
  return doctor.image;
}

/**
 * CL-027 — the availability line published under every physician biography.
 *
 * English is the client's exact approved sentence. Arabic reuses the clinic's
 * own already-published Arabic for the same fact (the Medical Care hub intro),
 * not a new machine translation.
 */
export const DOCTOR_AVAILABILITY_NOTE = {
  en: "Accepting new patients and walk-ins.",
  ar: "يستقبل مرضى جددًا وحالات بدون موعد مسبق.",
} as const;
