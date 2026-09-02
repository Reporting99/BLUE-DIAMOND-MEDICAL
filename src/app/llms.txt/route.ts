import { siteConfig } from "@/config/site";

/**
 * llms.txt — brief §31. Every claim here must already be visible on the
 * live site; nothing is added here that the pages themselves don't say.
 */
export function GET() {
  const body = `# Blue Diamond Medical Clinic

> Family medicine, walk-in care, and physician-led medical aesthetics in West Springs, Calgary, Alberta, Canada.

Blue Diamond Medical Clinic opened July 4, 2022 in West Springs, Calgary, founded by Dr. Mohamed Farhat (28+ years in family medicine). The clinic now has six family physicians providing AHS-insured family medicine, walk-in visits, and physician-led medical aesthetics including RF micro-needling, skin tightening, laser treatments, and medical/cosmetic Botox.

## Languages
- English: ${siteConfig.url}/en
- Arabic (العربية): ${siteConfig.url}/ar

## Services
- Medical Care: ${siteConfig.url}/en/medical
- Medical Aesthetics: ${siteConfig.url}/en/aesthetics
- Botox: ${siteConfig.url}/en/botox
- Our Team: ${siteConfig.url}/en/our-team
- Patient Resources: ${siteConfig.url}/en/patient-resources
- Health Hub: ${siteConfig.url}/en/health-hub
- Book an Appointment: ${siteConfig.url}/en/book-appointment

## Location & Contact
${siteConfig.clinic.address.line1}, ${siteConfig.clinic.address.city}, ${siteConfig.clinic.address.region} ${siteConfig.clinic.address.postalCode}, Canada
Phone: ${siteConfig.clinic.phoneDisplay}
Fax: ${siteConfig.clinic.faxDisplay}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
