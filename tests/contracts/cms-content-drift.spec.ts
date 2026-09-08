import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { concerns } from "@/features/concerns/data";
import { technologies } from "@/features/technologies/data";
import { treatments } from "@/features/aesthetics/data/treatments";
import { medicalServices } from "@/features/medical-services/data";
import { products } from "@/features/products/data";

/**
 * CMS_CONTENT_DRIFT — the repository's approved English copy versus the copy
 * FeelStack will actually publish.
 *
 * WHY THIS EXISTS, and why it is not paranoia.
 *
 * Production builds run with FEELSTACK_CONTENT_MODE=hybrid
 * (.github/workflows/deploy-production.yml pins it and fails closed without
 * it), and entity pages are prerendered by generateStaticParams DURING that
 * build. So for a CMS-backed entity the CMS supplies the words that ship, and
 * the repository copy is only the offline fallback. Editing repo copy and
 * deploying therefore changes nothing a patient reads: the deploy succeeds,
 * /api/version reports the new SHA, CI is green, and the page is unchanged.
 *
 * That happened. The 2026-09-07 English audit rewrote 19 strings to remove
 * unqualified medical claims and to fix Canadian spelling. On 2026-09-08, 15 of
 * them were still live across 13 pages — including "No downtime is associated
 * with this treatment.", which the audit had deliberately replaced with hedged
 * wording. Every gate passed. Nothing was comparing the two sources, so nothing
 * could fail.
 *
 * WHAT THIS ASSERTS. For every published CMS entry, each approved English
 * editorial string in this repository must equal the CMS's. Matching is by the
 * entry's own identity field (concern_id, technology_id, treatment_id,
 * service_id, product_id) rather than by reconstructing a path — concerns are
 * published under /aesthetics/concerns/<slug> but served at
 * /aesthetics/treatments/<slug>, and building the path from the public URL is
 * precisely the mistake that made this drift look like "the page is repo-owned"
 * twice on the day it was found.
 *
 * A failure here means one of two things, and the fix differs:
 *   - the repository copy is newer  -> publish it to the CMS, then re-capture
 *   - the CMS copy is newer         -> bring it back into the repo, then re-capture
 * Re-capture with: FEELSTACK_API_URL=... FEELSTACK_SITE_KEY=... \
 *                  node scripts/capture-cms-content.mjs
 */

interface CmsEntry {
  cmsPath: string;
  entryId: string | null;
  contentType: string | null;
  updatedAt: string | null;
  title: string | null;
  fields: Record<string, string>;
  faqs: { id: string; question: string; answer: string }[];
}

const cmsEntries: CmsEntry[] = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "tests", "fixtures", "feelstack", "cms-content-inventory.json"),
    "utf8",
  ),
);

/**
 * Records known to be drifted, with the reason. This list exists so that NEW
 * drift fails immediately instead of being lost in a long-standing red, and it
 * is deliberately enumerated rather than a wildcard: every entry names a record
 * a human has to fix. A second test below fails when an entry here stops
 * drifting, so the list cannot rot into a permanent mute.
 *
 * BLOCKED 2026-09-08: correcting these needs content.publish on the
 * blue-diamond-medical project. The bd-media-import identity does not hold it
 * (PATCH entries/:id -> 403 "Missing content.publish permission"), so the
 * remediation is a publisher-identity job, not a code change. Field-level
 * diffs are in docs/CMS_CONTENT_AUTHORITY.md.
 *
 * 22 records, found by this check. A production crawl for strings the audit
 * REMOVED found only 13 of them: a crawl cannot see drift in a field whose old
 * text was never published as a distinctive phrase, nor drift introduced by a
 * correction that has not shipped yet. That gap is the argument for this test.
 */
const KNOWN_CMS_DRIFT: ReadonlySet<string> = new Set([
  "aesthetic-concern:acne-scars",
  "aesthetic-concern:dry-skin",
  "aesthetic-concern:fine-lines-wrinkles",
  "aesthetic-concern:razor-bumps",
  "aesthetic-concern:skin-laxity",
  "aesthetic-concern:skin-revitalization",
  "aesthetic-concern:spider-veins",
  "aesthetic-concern:sun-damage-pigmentation",
  "technology:elite-iq",
  "technology:potenza",
  "technology:tempsure",
  "aesthetic-treatment:laser-hair-removal",
  "aesthetic-treatment:laser-skin-treatments",
  "aesthetic-treatment:prp-hair-restoration",
  "aesthetic-treatment:radio-frequency",
  "aesthetic-treatment:rf-microneedling",
  "aesthetic-treatment:tempsure-vitalia",
  "aesthetic-treatment:ultra",
  "medical-service:eye-screening",
  "medical-service:preventive-care",
  "product:daily-physical-defense-spf-34",
  "product:lytera-2-pigment-brightening-serum",
]);

type Localized = { en: string; ar: string };
const isLocalized = (v: unknown): v is Localized =>
  !!v && typeof v === "object" && typeof (v as Localized).en === "string";

const snake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

/** Identity field the CMS stores for each content type. */
const ID_FIELD: Record<string, string> = {
  "aesthetic-concern": "concern_id",
  technology: "technology_id",
  "aesthetic-treatment": "treatment_id",
  "medical-service": "service_id",
  product: "product_id",
};

/** Repository entities by content type, keyed by their stable id. */
function repoEntitiesFor(
  contentType: string,
): Map<string, { source: Record<string, unknown>; title: unknown }> {
  const list =
    contentType === "aesthetic-concern" ? concerns
    : contentType === "technology" ? technologies
    : contentType === "aesthetic-treatment" ? treatments
    : contentType === "medical-service" ? medicalServices
    : contentType === "product" ? products
    : [];
  return new Map(
    (list as { id: string }[]).map((e) => {
      // Product editorial copy lives one level down, under `detail`.
      const record = e as unknown as Record<string, unknown>;
      const source = contentType === "product"
        ? ((record.detail as Record<string, unknown>) ?? {})
        : record;
      // Products name the field `name`; every other family uses `title`.
      return [e.id, { source, title: record.name ?? record.title }];
    }),
  );
}

/** Editorial differences between one repo entity and its CMS entry. */
function driftFor(entry: CmsEntry, repo: Record<string, unknown>, title: unknown): string[] {
  const out: string[] = [];

  /**
   * The entity title, which the CMS stores at the TOP LEVEL and not inside
   * `fields`. Comparing only `fields` therefore misses it entirely — and the
   * title is what the page renders as its <h1> and its <title>, so a drifted
   * one is the most visible drift there is. Found by deliberately editing a
   * repo title and watching this check stay green.
   *
   * Products carry it as `name`, every other family as `title`.
   */
  if (isLocalized(title) && norm(entry.title) !== norm(title.en)) {
    out.push(`title (h1 + <title>)\n      cms : ${norm(entry.title)}\n      repo: ${norm(title.en)}`);
  }

  for (const [key, value] of Object.entries(repo)) {
    if (!isLocalized(value)) continue;
    const cmsKey = snake(key);
    // Only fields the CMS actually models. A repo-only field is not drift —
    // it simply has no CMS counterpart to disagree with.
    if (!(cmsKey in entry.fields)) continue;
    if (norm(entry.fields[cmsKey]) !== norm(value.en)) {
      out.push(`${cmsKey}\n      cms : ${norm(entry.fields[cmsKey])}\n      repo: ${norm(value.en)}`);
    }
  }

  const repoFaqs = (repo.faqs ?? []) as { question: Localized; answer: Localized }[];
  for (const faq of Array.isArray(repoFaqs) ? repoFaqs : []) {
    const q = norm(faq.question.en);
    const match =
      entry.faqs.find((f) => norm(f.question) === q) ??
      // A reworded question is still the same FAQ; matching on the opening
      // clause keeps a punctuation fix from reading as an unrelated ADD.
      entry.faqs.find((f) => norm(f.question).slice(0, 22) === q.slice(0, 22));
    if (!match) out.push(`faq MISSING IN CMS: "${q}"`);
    else if (norm(match.answer) !== norm(faq.answer.en) || norm(match.question) !== q) {
      out.push(`faq "${q}"\n      cms : ${norm(match.question)} / ${norm(match.answer)}\n      repo: ${q} / ${norm(faq.answer.en)}`);
    }
  }

  return out;
}

/** Every published CMS entry paired with its repository counterpart. */
const pairs = cmsEntries.flatMap((entry) => {
  const idField = ID_FIELD[entry.contentType ?? ""];
  if (!idField) return [];
  const id = entry.fields[idField];
  if (!id) return [];
  const found = repoEntitiesFor(entry.contentType!).get(id);
  if (!found) return [];
  return [{ key: `${entry.contentType}:${id}`, entry, repo: found.source, title: found.title }];
});

test.describe("CMS_CONTENT_DRIFT — published copy matches approved repository copy", () => {
  test("the capture covers every CMS-backed entity family", () => {
    // A family silently dropping out of the capture would make this whole
    // suite pass by measuring nothing.
    const families = new Set(cmsEntries.map((e) => e.contentType));
    for (const expected of ["aesthetic-concern", "technology", "aesthetic-treatment", "medical-service", "product"]) {
      expect(families, `no ${expected} entries captured`).toContain(expected);
    }
    expect(pairs.length, "no CMS entry matched a repository entity — the id mapping is broken").toBeGreaterThan(0);
  });

  test("no UNKNOWN record has drifted", () => {
    const drifted = pairs
      .filter((p) => !KNOWN_CMS_DRIFT.has(p.key))
      .map((p) => ({ key: p.key, diffs: driftFor(p.entry, p.repo, p.title) }))
      .filter((r) => r.diffs.length)
      .map((r) => `  ${r.key}\n    ${r.diffs.join("\n    ")}`);

    expect(
      drifted,
      `CMS_CONTENT_DRIFT — these records would ship the CMS's words, not the repository's.\n` +
        `A deploy will NOT change what the page says. Publish to FeelStack, then re-run\n` +
        `scripts/capture-cms-content.mjs. See docs/CMS_CONTENT_AUTHORITY.md.\n\n${drifted.join("\n\n")}`,
    ).toEqual([]);
  });

  test("KNOWN_CMS_DRIFT contains no record that has since been fixed", () => {
    // Keeps the acknowledgement list shrinking. When a record is corrected in
    // the CMS and re-captured, this fails until its entry is deleted — so the
    // list can never quietly become a permanent exemption.
    const fixed = pairs
      .filter((p) => KNOWN_CMS_DRIFT.has(p.key))
      .filter((p) => driftFor(p.entry, p.repo, p.title).length === 0)
      .map((p) => p.key);

    expect(
      fixed,
      `These records no longer drift — remove them from KNOWN_CMS_DRIFT:\n${fixed.join("\n")}`,
    ).toEqual([]);
  });

  test("every acknowledged record still exists in the CMS capture", () => {
    const keys = new Set(pairs.map((p) => p.key));
    const stale = [...KNOWN_CMS_DRIFT].filter((k) => !keys.has(k));
    expect(stale, `KNOWN_CMS_DRIFT names records that are no longer published:\n${stale.join("\n")}`).toEqual([]);
  });
});
