import { siteConfig } from "./site";

/**
 * The clinic's two PUBLISHED phone lines, as display facts.
 *
 * WHY THIS FILE EXISTS. Blue Diamond publishes two genuinely different
 * numbers (docs/SOURCE_CONFLICT_REGISTER.md CONF-001): the medical /
 * walk-in clinic line and the medical-aesthetics reception line. Before
 * this file, each surface that showed a number picked one by hand, which is
 * how the footer, the closing CTA and the homepage call card all ended up
 * publishing the medical line alone while the aesthetics line appeared
 * nowhere outside the Contact page.
 *
 * The label travels WITH the number here rather than living in a locale
 * copy file. Two numbers on one card are only usable if each says which
 * desk it reaches, so the label is not decoration — it is part of the fact,
 * and a surface must not be able to render one without the other.
 *
 * CLIENT RULE (2026-09-07), and the reason `publishedPhoneLines` and
 * `medicalPhoneLines` are two separate exports:
 *   - Pages under the MEDICAL section (`/medical/*`) publish the clinic
 *     line ONLY — a caller reading a family-medicine page must not be
 *     handed the aesthetics desk.
 *   - Every other page publishes BOTH lines together.
 *
 * This governs PUBLISHED CONTACT INFORMATION. It deliberately does NOT
 * govern booking ACTIONS — `src/config/booking.ts` channels, `AccessOptions`
 * and the /botox hero CTA each route a caller to one specific desk for one
 * specific task, and must stay channel-correct rather than listing both.
 */
export interface PhoneLine {
  id: "clinic" | "aesthetics";
  /** `tel:` target — E.164, no punctuation. */
  tel: string;
  /** The number exactly as the approved cards print it. */
  display: string;
  label: { en: string; ar: string };
}

export const clinicPhoneLine: PhoneLine = {
  id: "clinic",
  tel: siteConfig.clinic.phone,
  display: siteConfig.clinic.phoneDisplay,
  label: { en: "Clinic phone", ar: "هاتف العيادة" },
};

export const aestheticsPhoneLine: PhoneLine = {
  id: "aesthetics",
  tel: siteConfig.aesthetics.phone,
  display: siteConfig.aesthetics.phoneDisplay,
  label: { en: "Aesthetics phone", ar: "هاتف التجميل" },
};

/** Both lines, clinic first — the default for every non-medical surface. */
export const publishedPhoneLines: readonly PhoneLine[] = [clinicPhoneLine, aestheticsPhoneLine];

/** What `/medical/*` publishes: the clinic line, alone. */
export const medicalPhoneLines: readonly PhoneLine[] = [clinicPhoneLine];
