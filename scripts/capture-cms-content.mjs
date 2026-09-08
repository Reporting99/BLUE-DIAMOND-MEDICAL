/**
 * Captures the PUBLISHED editorial text of every CMS-backed entity into
 * tests/fixtures/feelstack/cms-content-inventory.json.
 *
 *   FEELSTACK_API_URL=... FEELSTACK_SITE_KEY=... node scripts/capture-cms-content.mjs
 *
 * Why this exists. Production builds run with FEELSTACK_CONTENT_MODE=hybrid
 * (.github/workflows/deploy-production.yml), so entity pages are prerendered
 * FROM THE CMS. For a CMS-backed entity the CMS text is what ships and
 * src/features/<family>/data.ts is only the offline fallback. Editing the repository
 * copy and deploying therefore changes NOTHING a patient reads — the deploy
 * succeeds, /api/version reports the new SHA, CI is green, and the words on
 * the page are the old ones.
 *
 * That is not hypothetical. The 2026-09-07 English audit rewrote 19 strings to
 * remove unqualified medical claims; on 2026-09-08, 15 of them were still live
 * across 13 pages, including "No downtime is associated with this treatment."
 * Nothing failed, because nothing was comparing the two sources.
 *
 * Captured rather than fetched live in the test, for the same reason as
 * scripts/generate-localized-entity-routes.mjs: a suite that calls the CMS is a
 * suite that goes red when the CMS has a bad afternoon, and this check must be
 * trustworthy enough that a red run means "fix the content", never "retry".
 * Refresh this capture whenever you change repo entity copy OR update the CMS.
 */
import { writeFileSync } from "node:fs";

const API = process.env.FEELSTACK_API_URL;
const SITE = process.env.FEELSTACK_SITE_KEY;
if (!API || !SITE) throw new Error("FEELSTACK_API_URL and FEELSTACK_SITE_KEY are required.");

const json = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

/**
 * CMS path families this check covers. Concerns are listed under
 * /aesthetics/concerns/ and NOT under their public /aesthetics/treatments/
 * URL — see CONCERN_CMS_PREFIX. Probing the public path returns 404 and reads
 * exactly like "this page is repo-owned", which is how the drift above was
 * misdiagnosed twice on the day it was found.
 */
const FAMILIES = [
  "/aesthetics/concerns/",
  "/aesthetics/treatments/",
  "/aesthetics/technologies/",
  "/medical/",
  "/shop/",
];

const inventory = await json(`${API}/public/v1/sites/${SITE}/routes?locale=en&limit=500`);
const paths = (inventory.items ?? [])
  .map((i) => i.path ?? i.fullPath)
  .filter(Boolean)
  .filter((p) => FAMILIES.some((f) => p.startsWith(f)));

const rows = [];
for (const path of paths.sort()) {
  const env = await json(`${API}/public/v1/sites/${SITE}/resolve?path=${encodeURIComponent(path)}&locale=en`);
  if (env.type !== "content_entry") continue;
  // Only the editorial surface. Ids, media, relations and prices are compared
  // by their own contract tests; duplicating them here would make this fixture
  // churn on changes that have nothing to do with the words on the page.
  const fields = Object.fromEntries(
    Object.entries(env.data?.fields ?? {}).filter(([, v]) => typeof v === "string" && v.trim().length > 0),
  );
  rows.push({
    cmsPath: path,
    entryId: env.data?.id ?? null,
    contentType: env.data?.contentType ?? null,
    updatedAt: env.route?.updatedAt ?? null,
    title: env.data?.title ?? null,
    fields,
    faqs: (env.relations?.faqs ?? []).map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
  });
}

writeFileSync(
  new URL("../tests/fixtures/feelstack/cms-content-inventory.json", import.meta.url),
  `${JSON.stringify(rows, null, 2)}\n`,
);
console.log(`captured ${rows.length} published CMS entries`);
