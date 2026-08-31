/**
 * Regenerates src/config/localized-entity-routes.generated.ts from FeelStack.
 *
 *   FEELSTACK_API_URL=... FEELSTACK_SITE_KEY=... node scripts/generate-localized-entity-routes.mjs
 *
 * Entity routes (a doctor, a treatment, a product) are created in the CMS, not
 * in this repository, and their Arabic slugs are AUTHORED THERE. Hand-copying
 * them into src/config/routes.ts is what let 52 of 58 CMS routes end up with no
 * Arabic mapping at all: every one of those Arabic URLs was unreachable, because
 * proxy.ts builds its Arabic->English rewrite map from the static registry.
 *
 * This file is committed rather than fetched at build time on purpose: the
 * proxy runs as edge middleware and cannot call the CMS, and a build that
 * silently depends on a live CMS is a build that breaks when the CMS is down.
 * The committed artifact is checked against the CMS by
 * tests/contracts/localized-route-parity.spec.ts, so drift fails a test instead
 * of silently breaking Arabic.
 */
import { writeFileSync } from "node:fs";

const API = process.env.FEELSTACK_API_URL;
const SITE = process.env.FEELSTACK_SITE_KEY;
if (!API || !SITE) throw new Error("FEELSTACK_API_URL and FEELSTACK_SITE_KEY are required.");

const json = async (u) => {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`${r.status} ${u}`);
  return r.json();
};

const inventory = await json(`${API}/public/v1/sites/${SITE}/routes?locale=en&limit=500`);
const paths = (inventory.items ?? []).map((i) => i.path ?? i.fullPath).filter(Boolean);

const rows = [];
for (const path of paths) {
  const envelope = await json(
    `${API}/public/v1/sites/${SITE}/resolve?path=${encodeURIComponent(path)}&locale=en`,
  );
  const ar = (envelope.route?.alternates ?? []).find((a) => a.locale === "ar")?.path;
  if (!ar || ar === path) continue;
  rows.push({ en: path, ar, type: envelope.type });
}
rows.sort((a, b) => a.en.localeCompare(b.en));

const body = `// GENERATED FILE — do not edit by hand.
// Regenerate: node scripts/generate-localized-entity-routes.mjs
// Source of truth: FeelStack route alternates. Parity is enforced by
// tests/contracts/localized-route-parity.spec.ts.
//
// Every Arabic slug here was AUTHORED IN THE CMS. None is derived, guessed or
// transliterated by this repository.

export interface LocalizedEntityRoute {
  /** English physical path — the path the Next.js segment resolves to. */
  en: string;
  /** Arabic public path, exactly as authored in FeelStack. */
  ar: string;
  /** CMS entity type, for auditing which families are covered. */
  type: string;
}

export const localizedEntityRoutes: LocalizedEntityRoute[] = ${JSON.stringify(rows, null, 2)};
`;
writeFileSync("src/config/localized-entity-routes.generated.ts", body);
console.log(`wrote ${rows.length} localized entity routes`);
