import type { LegalPageContent } from "@/types/legal";

/**
 * Legal page store — brief §25. The legacy site's Terms and Privacy pages
 * are literal "Coming soon" placeholders, which the brief explicitly
 * forbids publishing. Every entry below has `effectiveDate: null` and an
 * empty `body` — no legal copy has been drafted or approved. The route,
 * template, and typed model are fully built (see
 * src/features/legal/components/LegalPageTemplate.tsx) so publishing is a matter of
 * populating one entry once counsel/the client approves real copy, not
 * new code. Gated behind `legalPagesEnabled`. See
 * docs/MISSING_CONTENT_REPORT.md and docs/CONTENT_APPROVAL_MATRIX.md.
 */
export const legalPages: LegalPageContent[] = [
  {
    id: "terms",
    slug: "terms",
    slugAr: "الشروط-والأحكام",
    title: { en: "Terms & Conditions", ar: "الشروط والأحكام" },
    effectiveDate: null,
    body: { en: "", ar: "" },
  },
  {
    id: "privacy-policy",
    slug: "privacy-policy",
    slugAr: "سياسة-الخصوصية",
    title: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
    effectiveDate: null,
    body: { en: "", ar: "" },
  },
  {
    id: "accessibility",
    slug: "accessibility",
    slugAr: "إمكانية-الوصول",
    title: { en: "Accessibility", ar: "إمكانية الوصول" },
    effectiveDate: null,
    body: { en: "", ar: "" },
  },
  {
    id: "medical-disclaimer",
    slug: "medical-disclaimer",
    slugAr: "إخلاء-المسؤولية-الطبية",
    title: { en: "Medical Disclaimer", ar: "إخلاء المسؤولية الطبية" },
    effectiveDate: null,
    body: { en: "", ar: "" },
  },
];

export function getLegalPage(slug: string): LegalPageContent | undefined {
  return legalPages.find((p) => p.slug === slug);
}
