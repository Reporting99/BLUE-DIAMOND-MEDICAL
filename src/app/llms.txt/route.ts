import { siteConfig } from "@/config/site";
import { isIndexingEnabled } from "@/config/launch";

// Request-time, like robots.txt and sitemap.xml — indexability is a property
// of the running environment, never of the artifact.
export const dynamic = "force-dynamic";

/**
 * llms.txt — brief §31. Every claim here must already be visible on the
 * live site; nothing is added here that the pages themselves don't say.
 *
 * Optional and non-standard: it is a convenience for answer engines that
 * choose to read it, and it guarantees nothing about AI indexing or ranking.
 * It contains only public canonical content — no secrets, internal APIs,
 * admin routes, or unpublished pages.
 *
 * Gated on the same condition as robots.txt and sitemap.xml. This file is a
 * URL inventory, so serving it on a deployment that is withholding its
 * sitemap and answering `Disallow: /` would hand that inventory to exactly
 * the class of client the gate exists to withhold it from. It also has no
 * absolute URLs to print before an origin is configured. 404 is the honest
 * answer in that state, not an empty 200.
 */
export function GET() {
  if (!isIndexingEnabled()) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const body = `# Blue Diamond Medical Clinic

> Family medicine, walk-in care, and physician-led medical aesthetics in West Springs, Calgary, Alberta, Canada.

Blue Diamond Medical Clinic opened July 4, 2022 in West Springs, Calgary, founded by Dr. Mohamed Farhat (30+ years in family medicine). The clinic now has six family physicians providing AHS-insured family medicine, walk-in visits, and physician-led medical aesthetics including RF micro-needling, skin tightening, laser treatments, and medical/cosmetic Botox.

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
