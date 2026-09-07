import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Clinic-wide care must not be attributed to one named physician — including
 * in the metadata a visitor never sees on the page.
 *
 * `tests/e2e/medical-services.spec.ts` already guards the RENDERED prose. It
 * cannot guard this, and that gap is exactly where the defect survived: the
 * CMS stores `seo.description` as a field of its own, separate from `summary`.
 * The 2026-09-06 corrections (OP-001/OP-011/OP-021/OP-026) rewrote every
 * visible sentence on the two affected services and left the descriptions
 * untouched, so the pages read correctly while a search result still said
 * "with Dr. Bakare additionally offering…". Nothing in the suite looked there,
 * because nothing renders it in static mode.
 *
 * So this asserts against the correction set itself — the repository-controlled
 * operations file that `scripts/feelstack-republish.mjs` applies. It is the one
 * artefact that exists in a fresh checkout AND describes what the CMS is
 * supposed to hold, which makes it the only place the rule can be checked
 * without credentials and without a live CMS.
 *
 * The rule being enforced is NOT "the string Dr. Bakare must not appear".
 * He is a real physician with a real profile, he belongs in the roster of every
 * clinic-wide service, and his own biography is his. The rule is that a service
 * offered by all family physicians must not be described as his.
 */

const MANIFEST = join(
  process.cwd(),
  "content",
  "feelstack",
  "republish-operations.json",
);

interface Operation {
  opId: string;
  applicable: boolean;
  kind: string;
  route: string;
  locale: "en" | "ar";
  field: string;
  from?: unknown;
  to?: unknown;
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as {
  counts: { applicable: number; excluded: number };
  operations: Operation[];
};

/** Every way this clinician's name is written, in both locales. */
const NAMED_PHYSICIAN = /Dr\.?\s*Bakare|الدكتور\s*باكاري|د\.\s*باكاري/u;

/**
 * The routes whose content is clinic-wide, so no single physician may own it.
 * Deliberately a literal list rather than a scan: the point is that THESE four
 * were wrong, and a future route being added must be considered rather than
 * silently inheriting a rule.
 */
const CLINIC_WIDE_ROUTES = [
  { route: "/medical/minor-procedures", locale: "en" },
  { route: "/الرعاية-الطبية/الإجراءات-البسيطة", locale: "ar" },
  { route: "/medical/chronic-disease-management", locale: "en" },
  { route: "/الرعاية-الطبية/إدارة-الأمراض-المزمنة", locale: "ar" },
] as const;

/** His own profile routes. These legitimately carry his name. */
const PROFILE_ROUTES = ["/our-team/bakare", "/فريقنا/باكاري"];

test.describe("clinic-wide attribution", () => {
  test("every corrected value is free of single-physician attribution", () => {
    // The `from` side is expected to contain it — that is the defect being
    // corrected. Only what this repository asks the CMS to STORE is checked.
    const offenders = manifest.operations
      .filter((op) => op.applicable)
      .filter((op) => !PROFILE_ROUTES.includes(op.route))
      .filter((op) => NAMED_PHYSICIAN.test(JSON.stringify(op.to ?? "")))
      .map((op) => `${op.opId} ${op.locale} ${op.route} .${op.field}`);
    expect(offenders, "corrected values must not name one physician").toEqual([]);
  });

  test("all four stale SEO descriptions are covered, one per route and locale", () => {
    const seoOps = manifest.operations.filter(
      (op) => op.kind === "entry.seo.set" && op.field === "description",
    );
    expect(seoOps).toHaveLength(CLINIC_WIDE_ROUTES.length);

    for (const target of CLINIC_WIDE_ROUTES) {
      const op = seoOps.find(
        (o) => o.route === target.route && o.locale === target.locale,
      );
      expect(op, `no seo.description correction for ${target.locale} ${target.route}`).toBeTruthy();
      // The value being replaced must be the one that names him — otherwise
      // this operation is correcting something else and the real defect is
      // still out there.
      expect(
        NAMED_PHYSICIAN.test(String(op!.from)),
        `${op!.opId} does not replace a single-physician description`,
      ).toBe(true);
      expect(NAMED_PHYSICIAN.test(String(op!.to))).toBe(false);
    }
  });

  test("the replacements are usable as meta descriptions", () => {
    for (const op of manifest.operations.filter(
      (o) => o.kind === "entry.seo.set" && o.field === "description",
    )) {
      const value = String(op.to);
      // The two English values this replaces were stored cut off mid-word at
      // exactly 160 characters ("…and joint injec", "…and pallia"). Length
      // alone would not have caught that, so both are asserted: inside the
      // limit AND a finished sentence.
      expect(value.length, `${op.opId} is too long for a meta description`).toBeLessThanOrEqual(160);
      expect(value.length, `${op.opId} is suspiciously short`).toBeGreaterThan(60);
      expect(value.trim().endsWith("."), `${op.opId} does not end in a full stop`).toBe(true);
    }
  });

  test("English and Arabic corrections stay paired", () => {
    // A correction applied to one locale only is how the two halves of a
    // bilingual site drift apart, and Arabic is the half nobody reviewing an
    // English PR reads.
    const seoOps = manifest.operations.filter((o) => o.kind === "entry.seo.set");
    const en = seoOps.filter((o) => o.locale === "en").length;
    const ar = seoOps.filter((o) => o.locale === "ar").length;
    expect(en, "one Arabic correction per English one").toBe(ar);
  });

  test("his own profile content is not touched", () => {
    // The correction set must never "fix" the pages where his name belongs.
    const profileOps = manifest.operations.filter((op) =>
      PROFILE_ROUTES.includes(op.route),
    );
    for (const op of profileOps) {
      expect(
        NAMED_PHYSICIAN.test(String(op.from)) && !NAMED_PHYSICIAN.test(String(op.to)),
        `${op.opId} strips his name from his own profile`,
      ).toBe(false);
    }
  });

  test("the manifest's own counts match its contents", () => {
    // The published arithmetic for this correction set has been restated
    // several times from summaries rather than from the file. It is derivable;
    // derive it.
    expect(manifest.counts.applicable).toBe(
      manifest.operations.filter((o) => o.applicable).length,
    );
    expect(manifest.counts.excluded).toBe(
      manifest.operations.filter((o) => !o.applicable).length,
    );
    expect(manifest.counts.applicable + manifest.counts.excluded).toBe(
      manifest.operations.length,
    );
    // Operation ids are the handle every report and runbook uses; a duplicate
    // makes --only=OP-0xx ambiguous.
    const ids = manifest.operations.map((o) => o.opId);
    expect(new Set(ids).size, "duplicate operation id").toBe(ids.length);
  });
});
