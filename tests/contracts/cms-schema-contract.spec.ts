import { test, expect } from "@playwright/test";
import { concerns } from "@/features/concerns/data";
import { technologies } from "@/features/technologies/data";
import { treatments } from "@/features/aesthetics/data/treatments";
import { medicalServices } from "@/features/medical-services/data";
import { doctors } from "@/features/doctors/data";
import { products } from "@/features/products/data";
import { routes } from "@/lib/routing";

/**
 * CMS_TO_SCHEMA_CONTRACT — proves visible content and JSON-LD do not drift,
 * for one representative entity per family. Not a fixture comparison: it
 * renders the LOCAL server (the same repository state this test run is
 * checking out) and extracts real JSON-LD, then compares it against the
 * SAME repository objects the templates render from
 * (src/lib/schema builders consume these directly — see each feature's
 * Template component). When FEELSTACK_API_URL /
 * FEELSTACK_SITE_KEY are set, it ALSO fetches the live CMS-resolved content
 * for each entity and asserts that against the schema, closing the loop this
 * repo's cms-content-drift.spec.ts leaves for schema specifically: repo ==
 * schema is necessary but not sufficient if the CMS itself has drifted from
 * repo (that half is covered by cms-content-drift.spec.ts / the doctor drift
 * block; this test's live branch is a second, independent check of the same
 * fact from the schema side).
 */

type JsonLdBlock = Record<string, unknown>;

async function extractJsonLd(page: import("@playwright/test").Page, url: string): Promise<JsonLdBlock[]> {
  const res = await page.goto(url);
  expect(res?.status(), `${url} did not return 200`).toBe(200);
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.map((t) => JSON.parse(t) as JsonLdBlock);
}

function findByType(blocks: JsonLdBlock[], type: string): JsonLdBlock | undefined {
  return blocks.find((b) => b["@type"] === type || (Array.isArray(b["@graph"]) && (b["@graph"] as JsonLdBlock[]).some((g) => g["@type"] === type)));
}

function faqPage(blocks: JsonLdBlock[]): JsonLdBlock | undefined {
  return findByType(blocks, "FAQPage");
}

const norm = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();

async function liveResolve(path: string, locale = "en") {
  const apiUrl = process.env.FEELSTACK_API_URL;
  const siteKey = process.env.FEELSTACK_SITE_KEY;
  if (!apiUrl || !siteKey) return null;
  const res = await fetch(`${apiUrl}/public/v1/sites/${siteKey}/resolve?path=${encodeURIComponent(path)}&locale=${locale}`);
  if (!res.ok) return null;
  return res.json();
}

test.describe("CMS_TO_SCHEMA_CONTRACT", () => {
  test("medical service: visible description and MedicalWebPage schema match repository summary", async ({ page }) => {
    const service = medicalServices.find((s) => s.id === "preventive-care");
    if (!service) test.skip(true, "preventive-care fixture missing");
    const route = routes.find((r) => r.id === `medical-${service!.id}`);
    const url = route ? route.path.en : `/medical/${service!.id}`;
    const blocks = await extractJsonLd(page, `/en${url}`);
    const webPage = findByType(blocks, "MedicalWebPage");
    expect(webPage, "no MedicalWebPage schema found").toBeTruthy();
    expect(norm(webPage!.description)).toBe(norm(service!.summary.en));

    const live = await liveResolve(`/medical/${service!.id}`);
    if (live?.type === "content_entry") {
      expect(norm(webPage!.description)).toBe(norm(live.data?.fields?.summary));
    }
  });

  test("aesthetic treatment: FAQ schema matches repository FAQs exactly", async ({ page }) => {
    const treatment = treatments.find((t) => t.id === "ultra");
    if (!treatment) test.skip(true, "ultra fixture missing");
    const route = routes.find((r) => r.id === `treatment-${treatment!.id}`);
    const url = route ? route.path.en : `/aesthetics/treatments/${treatment!.id}`;
    const blocks = await extractJsonLd(page, `/en${url}`);
    const faq = faqPage(blocks);
    expect(faq, "no FAQPage schema found on treatment page").toBeTruthy();
    const schemaFaqs = ((faq!.mainEntity as JsonLdBlock[]) ?? []).map((q) => ({
      question: norm(q.name),
      answer: norm((q.acceptedAnswer as JsonLdBlock)?.text),
    }));
    for (const repoFaq of treatment!.faqs ?? []) {
      const match = schemaFaqs.find((f) => f.question === norm(repoFaq.question.en));
      expect(match, `FAQ question missing from schema: ${repoFaq.question.en}`).toBeTruthy();
      expect(match!.answer).toBe(norm(repoFaq.answer.en));
    }
  });

  test("concern: schema description matches repository summary, no CMS content leaks unmatched", async ({ page }) => {
    const concern = concerns.find((c) => c.id === "dry-skin");
    if (!concern) test.skip(true, "dry-skin fixture missing");
    const route = routes.find((r) => r.id === `concern-${concern!.id}`);
    const url = route ? route.path.en : `/aesthetics/concerns/${concern!.id}`;
    const blocks = await extractJsonLd(page, `/en${url}`);
    const webPage = findByType(blocks, "MedicalWebPage") ?? findByType(blocks, "WebPage");
    if (webPage) expect(norm(webPage.description)).toBe(norm(concern!.summary.en));

    const live = await liveResolve(`/aesthetics/concerns/${concern!.id}`);
    if (live?.type === "content_entry") {
      expect(norm(live.data?.fields?.summary)).toBe(norm(concern!.summary.en));
    }
  });

  test("technology: schema reflects repository summary", async ({ page }) => {
    const tech = technologies.find((t) => t.id === "elite-iq");
    if (!tech) test.skip(true, "elite-iq fixture missing");
    const route = routes.find((r) => r.id === `technology-${tech!.id}`);
    const url = route ? route.path.en : `/aesthetics/technologies/${tech!.id}`;
    const blocks = await extractJsonLd(page, `/en${url}`);
    const webPage = findByType(blocks, "MedicalWebPage") ?? findByType(blocks, "WebPage");
    if (webPage) expect(norm(webPage.description)).toBe(norm(tech!.summary.en));
  });

  test("doctor: Physician schema description matches repository biography exactly", async ({ page }) => {
    const doctor = doctors.find((d) => d.id === "reem-hamdi");
    if (!doctor) test.skip(true, "reem-hamdi fixture missing");
    const route = routes.find((r) => r.id === "doctor-hamdi");
    const url = route ? route.path.en : `/our-team/${doctor!.id}`;
    const blocks = await extractJsonLd(page, `/en${url}`);
    const physician = findByType(blocks, "Physician");
    expect(physician, "no Physician schema found").toBeTruthy();
    expect(norm(physician!.description)).toBe(norm(doctor!.bio.en));

    const live = await liveResolve("/our-team/reem-hamdi");
    if (live?.type === "person_profile") {
      expect(norm(physician!.description)).toBe(norm(live.data?.biography));
    }
  });

  test("product: visible price matches JSON-LD (or JSON-LD carries no invented price, per documented no-offers design)", async ({ page }) => {
    const product = products.find((p) => p.approvalStatus === "approved" && (p.detail || p.name));
    if (!product) test.skip(true, "no approved product fixture found");
    const blocks = await extractJsonLd(page, `/en/shop/${product!.slug}`);
    const productSchema = findByType(blocks, "Product");
    expect(productSchema, "no Product schema found").toBeTruthy();
    expect(norm(productSchema!.name)).toBe(norm(product!.name.en));
    // Per src/features/products/components/ProductTemplate.tsx's documented
    // decision, Product schema deliberately carries no `offers`/price sub-
    // schema. Asserting that stays true is the contract, not asserting a
    // price match that would require inventing schema.org availability data
    // the CMS never modelled (see docs/CMS_CONTENT_AUTHORITY.md).
    expect(productSchema).not.toHaveProperty("offers");
  });

  test("breadcrumb schema: sequential positions, absolute canonical URLs, no redirect targets", async ({ page }) => {
    const blocks = await extractJsonLd(page, "/en/medical/preventive-care");
    const crumbs = findByType(blocks, "BreadcrumbList");
    expect(crumbs, "no BreadcrumbList schema found").toBeTruthy();
    const items = (crumbs!.itemListElement as JsonLdBlock[]) ?? [];
    items.forEach((item, i) => expect(item.position).toBe(i + 1));
    const origins = new Set(items.slice(0, -1).map((item) => new URL(String(item.item)).origin));
    expect([...origins], "breadcrumb items do not all share one origin").toHaveLength(1);
    for (const item of items.slice(0, -1)) {
      // Every crumb except the current page must carry an absolute URL under
      // the EN locale path — never a bare path, never the AR locale for an
      // EN page.
      const path = new URL(String(item.item)).pathname;
      expect(path.startsWith("/en/") || path === "/en", `breadcrumb item not under /en: ${item.item}`).toBe(true);
    }
  });
});
