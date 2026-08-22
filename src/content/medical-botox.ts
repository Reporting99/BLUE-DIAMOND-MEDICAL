import type { MedicalServiceContent } from "@/types/medical-service";

/**
 * Brief §14 requires a /medical/botox/ hub plus migraine, bruxism-tmj, and
 * hyperhidrosis detail pages. Route, typed bilingual data, and template
 * (reuses MedicalServiceTemplate) are fully built here — but every one of
 * these is feature-flagged off (`medicalBotoxDetailPagesEnabled`) because
 * the only source content available for each condition individually is
 * already published in full on /botox (the brief §16 educational hub) and
 * summarized on /medical (the Medical Care hub's Botox card). A separate
 * subtree repeating the same facts, split three ways, would be duplicate
 * content rather than unique pages. See docs/CONTENT_MODEL.md
 * and docs/CONTENT_MODEL.md.
 */
export const medicalBotoxHub = {
  title: { en: "Medical Botox", ar: "البوتوكس الطبي" },
  summary: {
    en: "Botox for migraine, bruxism/TMJ, and hyperhidrosis is covered by a combination of provincial health insurance and the clinic's compassionate program. See our full Botox page for treatment details and booking.",
    ar: "يُغطّى بوتوكس الشقيقة وصرير الأسنان (TMJ) والتعرق الزائد جزئيًا بالتأمين الصحي الحكومي وبرنامج العيادة التعاطفي. راجعوا صفحة البوتوكس الكاملة لتفاصيل العلاج والحجز.",
  },
};

export const medicalBotoxConditions: (MedicalServiceContent & { requiresFeature: string })[] = [
  {
    id: "migraine",
    slug: "migraine",
    slugAr: "الشقيقة",
    title: { en: "Botox for Migraine", ar: "البوتوكس لعلاج الشقيقة" },
    summary: {
      en: "Botox for migraine treatment, covered by a combination of provincial health insurance and the clinic's compassionate program.",
      ar: "بوتوكس لعلاج الشقيقة، مشمول جزئيًا بالتأمين الصحي الحكومي وبرنامج العيادة التعاطفي.",
    },
    relatedDoctorIds: ["mohamed-farhat"],
    bookingChannel: "phone-medical-botox",
    sourceVerified: true,
    requiresFeature: "medicalBotoxDetailPagesEnabled",
  },
  {
    id: "bruxism-tmj",
    slug: "bruxism-tmj",
    slugAr: "صرير-الأسنان",
    title: { en: "Botox for Bruxism & TMJ", ar: "البوتوكس لصرير الأسنان والفك" },
    summary: {
      en: "Botox for bruxism (TMJ) and jaw pain, covered by a combination of provincial health insurance and the clinic's compassionate program.",
      ar: "بوتوكس لعلاج صرير الأسنان (TMJ) وألم الفك، مشمول جزئيًا بالتأمين الصحي الحكومي وبرنامج العيادة التعاطفي.",
    },
    relatedDoctorIds: ["mohamed-farhat"],
    bookingChannel: "phone-medical-botox",
    sourceVerified: true,
    requiresFeature: "medicalBotoxDetailPagesEnabled",
  },
  {
    id: "hyperhidrosis",
    slug: "hyperhidrosis",
    slugAr: "التعرق-الزائد",
    title: { en: "Botox for Hyperhidrosis", ar: "البوتوكس لعلاج التعرق الزائد" },
    summary: {
      en: "Botox for hyperhidrosis (excessive sweating), covered by a combination of provincial health insurance and the clinic's compassionate program.",
      ar: "بوتوكس لعلاج التعرق الزائد، مشمول جزئيًا بالتأمين الصحي الحكومي وبرنامج العيادة التعاطفي.",
    },
    relatedDoctorIds: ["mohamed-farhat"],
    bookingChannel: "phone-medical-botox",
    sourceVerified: true,
    requiresFeature: "medicalBotoxDetailPagesEnabled",
  },
];

export function getMedicalBotoxCondition(slug: string) {
  return medicalBotoxConditions.find((c) => c.slug === slug);
}
