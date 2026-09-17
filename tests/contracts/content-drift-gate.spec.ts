import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
/**
 * Dynamic imports: Playwright transpiles a spec to CommonJS, and Node always
 * loads a `.mjs` as ESM, so a static import of either script fails at load
 * time. See the same note in content-sync-orchestration.spec.ts.
 */
type GateModule = typeof import("../../scripts/content-drift-gate.mjs");
type FixtureModule = typeof import("../../scripts/feelstack-refresh-fixtures.mjs");

let CMS_OWNED_FIELDS: GateModule["CMS_OWNED_FIELDS"];
let fieldChecksum: GateModule["fieldChecksum"];
let liveValueOf: GateModule["liveValueOf"];
let sameValue: GateModule["sameValue"];
let verdictFor: GateModule["verdictFor"];

let PROVENANCE_KEY: FixtureModule["PROVENANCE_KEY"];
let buildProvenance: FixtureModule["buildProvenance"];
let canonicalize: FixtureModule["canonicalize"];
let contentChecksum: FixtureModule["contentChecksum"];
let hasDrifted: FixtureModule["hasDrifted"];
let withoutProvenance: FixtureModule["withoutProvenance"];

test.beforeAll(async () => {
  ({ CMS_OWNED_FIELDS, fieldChecksum, liveValueOf, sameValue, verdictFor } = await import(
    "../../scripts/content-drift-gate.mjs"
  ));
  ({ PROVENANCE_KEY, buildProvenance, canonicalize, contentChecksum, hasDrifted, withoutProvenance } =
    await import("../../scripts/feelstack-refresh-fixtures.mjs"));
});

/**
 * PROPERTIES 4-bis, 10, 11 — drift detection and fixture provenance, tested as
 * the pure functions they were factored into.
 *
 * Both scripts keep their comparison logic above the `import.meta.main` guard
 * precisely so it can be exercised here without a CMS: the network half is
 * proven by running the tools against the live public API (evidence in
 * docs/RELEASE_ARCHITECTURE_AUDIT.md), the judgement half is proven here.
 */

test.describe("drift verdicts", () => {
  test("agreement across every source that has an opinion is CLEAN", () => {
    expect(verdictFor({ declared: "a", live: "a", fixture: "a" }).verdict).toBe("CLEAN");
    expect(verdictFor({ declared: "a", live: "a", fixture: undefined }).verdict).toBe("CLEAN");
  });

  test("a single opinion is UNCHECKED, not CLEAN and not DRIFT", () => {
    // A field only one source knows about cannot be in conflict with anything.
    // Calling that DRIFT would flag every CMS-only field on the site; calling
    // it CLEAN would claim a verification that never happened.
    expect(verdictFor({ declared: "a", live: undefined, fixture: undefined }).verdict).toBe("UNCHECKED");
  });

  test("the declared target not being live is DRIFT, and says which pair disagreed", () => {
    const v = verdictFor({ declared: "new", live: "old", fixture: "old" });
    expect(v.verdict).toBe("DRIFT");
    expect(v.reason).toContain("declared!=live");
    expect(v.reason).not.toContain("live!=fixture");
  });

  test("a stale fixture is DRIFT even when the CMS is already correct", () => {
    // The case the repo actually had: four EN remediation values were published
    // but never re-captured, so the repo-vs-fixture test compared against a
    // recording of the past and passed.
    const v = verdictFor({ declared: "new", live: "new", fixture: "old" });
    expect(v.verdict).toBe("DRIFT");
    expect(v.reason).toContain("live!=fixture");
  });

  test("whitespace differences are not drift", () => {
    expect(sameValue("a  b\n c", "a b c")).toBe(true);
    expect(verdictFor({ declared: "a  b", live: "a b", fixture: "a b" }).verdict).toBe("CLEAN");
  });

  test("undefined is never equal to anything, including itself", () => {
    // "neither source has a value" must not be reported as agreement.
    expect(sameValue(undefined, undefined)).toBe(false);
    expect(sameValue(undefined, "")).toBe(false);
  });

  test("per-field checksums are stable, short, and distinguish different values", () => {
    expect(fieldChecksum("hello")).toBe(fieldChecksum("hello "));
    expect(fieldChecksum("hello")).not.toBe(fieldChecksum("hallo"));
    expect(fieldChecksum(undefined)).toBeNull();
    expect(fieldChecksum("hello")).toMatch(/^sha256:[0-9a-f]+$/);
  });

  test("CMS-owned-only fields are excluded by name, not guessed at", () => {
    // Flagging fields with no repository source of truth would make every
    // legitimate CMS edit fail CI, which trains people to ignore the gate.
    expect(CMS_OWNED_FIELDS.has("source_verified")).toBe(true);
    expect(CMS_OWNED_FIELDS.has("summary"), "editorial copy IS repo-owned").toBe(false);
  });

  test("the live value is extracted from the right place for each operation kind", () => {
    const payload = {
      data: { fields: { summary: "S", external_partners: [{ note: "N" }] }, biography: "B" },
      seo: { description: "D" },
      relations: { faqs: [{ id: "f1", answer: "A" }] },
    };
    expect(liveValueOf({ kind: "entry.field.set", field: "summary" }, payload)).toBe("S");
    // The resolver returns seo already MERGED, which is what a crawler sees.
    expect(liveValueOf({ kind: "entry.seo.set", field: "description" }, payload)).toBe("D");
    expect(liveValueOf({ kind: "entry.partnerNote.set", partnerIndex: 0 }, payload)).toBe("N");
    expect(liveValueOf({ kind: "person.biography.set" }, payload)).toBe("B");
    expect(liveValueOf({ kind: "faq.update", faqId: "f1", field: "answer" }, payload)).toBe("A");
  });
});

test.describe("the acknowledgement list is a backlog, not a mute", () => {
  const ack = JSON.parse(readFileSync("content/feelstack/drift-gate-acknowledged.json", "utf8")) as {
    acknowledged: { opId: string; reason: string; mismatch: string }[];
  };

  test("every acknowledged entry names a specific, actionable reason", () => {
    expect(ack.acknowledged.length).toBeGreaterThan(0);
    for (const entry of ack.acknowledged) {
      expect(entry.opId).toMatch(/^OP-/);
      expect(entry.reason.length, `${entry.opId} has no written reason`).toBeGreaterThan(80);
      expect(entry.mismatch).toMatch(/!=/);
    }
  });

  test("ids are unique, so an entry cannot be silently double-counted", () => {
    const ids = ack.acknowledged.map((a) => a.opId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("the gate fails when an acknowledged field stops drifting", () => {
    // Without this, the list rots into a permanent exemption.
    const source = readFileSync("scripts/content-drift-gate.mjs", "utf8");
    expect(source).toContain("resolvedButStillListed");
    expect(source).toContain("no longer drift");
  });

  test("an unreachable CMS is a distinct exit code from drift", () => {
    const source = readFileSync("scripts/content-drift-gate.mjs", "utf8");
    expect(source).toContain("process.exit(3)");
  });
});

test.describe("fixture provenance", () => {
  const envelope = { type: "content_entry", route: { path: "/x", locale: "en" }, data: { id: "1" } };

  test("the checksum ignores key order but not content", () => {
    expect(contentChecksum(envelope)).toBe(
      contentChecksum({ data: { id: "1" }, route: { locale: "en", path: "/x" }, type: "content_entry" }),
    );
    expect(contentChecksum(envelope)).not.toBe(contentChecksum({ ...envelope, data: { id: "2" } }));
  });

  test("provenance itself is excluded from the checksum, or every refresh would drift forever", () => {
    const withProv = { ...envelope, [PROVENANCE_KEY]: { fetchedAt: "2026-01-01T00:00:00.000Z" } };
    expect(contentChecksum(withProv)).toBe(contentChecksum(envelope));
    expect(hasDrifted(withProv, envelope)).toBe(false);
    expect(withoutProvenance(withProv)).toEqual(envelope);
  });

  test("drift is detected on a real content change", () => {
    expect(hasDrifted(envelope, { ...envelope, data: { id: "2" } })).toBe(true);
  });

  test("canonicalize sorts recursively, including inside arrays", () => {
    expect(JSON.stringify(canonicalize({ b: 1, a: [{ d: 1, c: 2 }] }))).toBe('{"a":[{"c":2,"d":1}],"b":1}');
  });

  test("provenance records only non-secret facts, and the API by HOST not URL", () => {
    const p = buildProvenance({
      apiUrl: "https://cms.invalid/api?token=SUPER_SECRET",
      siteKey: "blue-diamond-medical",
      route: "/x",
      locale: "en",
      checksum: "sha256:abc",
      fetchedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(p.apiHost).toBe("cms.invalid");
    // A full URL could carry a query string, and a query string is a place a
    // secret can hide.
    expect(JSON.stringify(p)).not.toContain("SUPER_SECRET");
    expect(JSON.stringify(p)).not.toContain("token");
    expect(p.route).toBe("/x");
    expect(p.locale).toBe("en");
    expect(p.fixtureSchemaVersion).toBe(1);
    expect(p.contentChecksum).toBe("sha256:abc");
  });

  test("the refresher refuses to record a cross-locale fallback", () => {
    // An Arabic fixture holding English content would make every test that
    // reads it assert that the wrong language is correct.
    const source = readFileSync("scripts/feelstack-refresh-fixtures.mjs", "utf8");
    expect(source).toContain("LOCALE_INTEGRITY_FAILED");
    expect(source).toContain("usedFallback");
  });

  test("the refresher never sends a credential — the resolve endpoint is public", () => {
    const source = readFileSync("scripts/feelstack-refresh-fixtures.mjs", "utf8");
    expect(source).not.toMatch(/Authorization|Bearer|FEELSTACK_ADMIN|_SECRET/);
  });
});
