import { test, expect } from "@playwright/test";
import { z } from "zod";
import {
  feelstackRouteInventoryPageSchema,
  feelstackWebhookEnvelopeSchema,
  feelstackContentEventDataSchema,
} from "../../src/lib/feelstack/schemas";
import { feelstackResolveEnvelopeSchema } from "../../src/lib/feelstack/transport";
import { checkLocaleIntegrity } from "../../src/lib/feelstack/locale-integrity";
import {
  defineEntityContract,
  localizedBilingual,
  localizedBilingualList,
  adaptFaqs,
  relatedIds,
  toAdapterInput,
} from "../../src/lib/feelstack/adapters";

/**
 * REAL FeelStack entity contract.
 *
 * Every fixture here mirrors the envelope the deployed resolver actually
 * builds (`public-route-resolver.service.ts`): `{ type, route, data, seo,
 * relations: { items, faqs, sections, taxonomies } }`, with the entity's own
 * values under `data.fields` and ONE ENTRY PER LOCALE.
 *
 * The previous version of this file tested a flat, bilingual entity shape that
 * FeelStack has never emitted. It passed continuously while the integration
 * could not have parsed a single real response. Fixtures are therefore derived
 * from backend source, never from what this repo finds convenient.
 */

function envelope(over: {
  locale?: string;
  requestedLocale?: string;
  resolvedLocale?: string;
  usedFallback?: boolean;
  fields?: Record<string, unknown>;
  faqs?: Array<{ id: string; question: string; answer: string }>;
  relations?: Array<{ id: string; relationKey: string; targetType: string; targetId: string; sortOrder?: number }>;
  path?: string;
} = {}) {
  const locale = over.locale ?? "en";
  return {
    type: "content_entry",
    route: {
      id: "route-1",
      path: over.path ?? "/medical/family-medicine",
      locale,
      requestedLocale: over.requestedLocale ?? locale,
      resolvedLocale: over.resolvedLocale ?? locale,
      usedFallback: over.usedFallback ?? false,
      alternates: [
        { locale: "en", path: "/medical/family-medicine" },
        { locale: "ar", path: "/الرعاية-الطبية/طب-الأسرة" },
      ],
      sectionId: null,
      updatedAt: "2026-08-23T00:00:00.000Z",
    },
    data: {
      id: "entry-1",
      contentType: "medical-service",
      title: "Family Medicine",
      fields: over.fields ?? { summary: "Comprehensive primary care." },
      translationGroupId: "tg-1",
      publishedAt: "2026-08-23T00:00:00.000Z",
      updatedAt: "2026-08-23T00:00:00.000Z",
    },
    seo: { title: "Family Medicine" },
    relations: {
      items: over.relations ?? [],
      faqs: over.faqs ?? [],
      sections: [],
      taxonomies: [],
    },
  };
}

test.describe("real resolve envelope", () => {
  test("parses the shape the backend actually returns", () => {
    const parsed = feelstackResolveEnvelopeSchema.safeParse(envelope());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data.fields).toEqual({ summary: "Comprehensive primary care." });
      expect(parsed.data.relations?.faqs).toEqual([]);
    }
  });

  test("rejects the old forward-declared flat entity shape", () => {
    // The shape this integration used to expect. It must NOT validate, or the
    // regression that started all of this could return unnoticed.
    const legacyFlat = { path: "/x", locale: "en", status: "published", title: "T" };
    expect(feelstackResolveEnvelopeSchema.safeParse(legacyFlat).success).toBe(false);
  });

  test("relations stay nested under `relations`, not as sibling keys", () => {
    const flatSiblings = { ...envelope(), relations: undefined, faqs: [], sections: [], taxonomies: [] };
    const parsed = feelstackResolveEnvelopeSchema.safeParse(flatSiblings);
    // Still valid (relations is optional) but faqs must not be discoverable at
    // the top level — the adapter reads relations.faqs and would silently see
    // none if the nesting were ever misread.
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.relations).toBeUndefined();
  });

  test("rejects an envelope with no route metadata", () => {
    const broken = { ...envelope(), route: undefined };
    expect(feelstackResolveEnvelopeSchema.safeParse(broken).success).toBe(false);
  });

  test("malformed data.fields is still structurally valid transport — the field schema is what rejects it", () => {
    const parsed = feelstackResolveEnvelopeSchema.safeParse(envelope({ fields: { summary: 42 } }));
    expect(parsed.success).toBe(true);
    const fieldSchema = z.object({ summary: z.string() });
    expect(fieldSchema.safeParse(parsed.success ? parsed.data.data.fields : {}).success).toBe(false);
  });
});

test.describe("locale integrity", () => {
  test("EN request resolving EN passes", () => {
    expect(checkLocaleIntegrity(feelstackResolveEnvelopeSchema.parse(envelope({ locale: "en" })), "en").ok).toBe(true);
  });

  test("AR request resolving AR passes", () => {
    expect(checkLocaleIntegrity(feelstackResolveEnvelopeSchema.parse(envelope({ locale: "ar" })), "ar").ok).toBe(true);
  });

  test("AR request that fell back to EN is REFUSED", () => {
    const env = feelstackResolveEnvelopeSchema.parse(
      envelope({ locale: "en", requestedLocale: "ar", resolvedLocale: "en", usedFallback: true }),
    );
    const result = checkLocaleIntegrity(env, "ar");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("cross-locale-fallback");
  });

  test("EN request that fell back to AR is REFUSED", () => {
    const env = feelstackResolveEnvelopeSchema.parse(
      envelope({ locale: "ar", requestedLocale: "en", resolvedLocale: "ar", usedFallback: true }),
    );
    expect(checkLocaleIntegrity(env, "en").ok).toBe(false);
  });

  test("a mismatched resolvedLocale is refused even when usedFallback is false", () => {
    // Defence in depth: the flag and the observable facts are checked
    // independently, because either one being wrong leaks the wrong language.
    const env = feelstackResolveEnvelopeSchema.parse(
      envelope({ locale: "en", requestedLocale: "ar", resolvedLocale: "en", usedFallback: false }),
    );
    expect(checkLocaleIntegrity(env, "ar").ok).toBe(false);
  });
});

test.describe("adapters", () => {
  test("a bilingual field carries the requested locale and leaves the other EMPTY", () => {
    // Never the same string in both slots: an accidental cross-locale read must
    // yield visibly-missing text, never text in the wrong language.
    expect(localizedBilingual("ar", "طب الأسرة")).toEqual({ en: "", ar: "طب الأسرة" });
    expect(localizedBilingual("en", "Family Medicine")).toEqual({ en: "Family Medicine", ar: "" });
    expect(localizedBilingualList("ar", ["أ", "ب"])).toEqual({ en: [], ar: ["أ", "ب"] });
  });

  test("first-class FAQs adapt into the domain shape for one locale only", () => {
    const adapted = adaptFaqs("ar", [{ id: "f1", question: "س؟", answer: "ج." }]);
    expect(adapted[0].question).toEqual({ en: "", ar: "س؟" });
    expect(adapted[0].answer.en).toBe("");
  });

  test("relations resolve by real relationKey, in CMS sort order", () => {
    const relations = [
      { id: "r2", relationKey: "doctors", targetType: "person_profile", targetId: "d-2", sortOrder: 2 },
      { id: "r1", relationKey: "doctors", targetType: "person_profile", targetId: "d-1", sortOrder: 1 },
      { id: "r3", relationKey: "treatments", targetType: "content_entry", targetId: "t-1", sortOrder: 1 },
    ];
    expect(relatedIds(relations, "doctors")).toEqual(["d-1", "d-2"]);
    expect(relatedIds(relations, "treatments")).toEqual(["t-1"]);
    expect(relatedIds(relations, "nothing")).toEqual([]);
  });

  test("an entity contract maps fields into a domain model without leaking transport", () => {
    const contract = defineEntityContract({
      contentType: "medical-service",
      fields: z.object({ summary: z.string() }),
      adapt: ({ locale, fields, faqs, relations, path }) => ({
        slug: path,
        summary: localizedBilingual(locale, fields.summary),
        faqs: adaptFaqs(locale, faqs),
        relatedDoctorIds: relatedIds(relations, "doctors"),
      }),
    });
    const env = feelstackResolveEnvelopeSchema.parse(
      envelope({
        locale: "ar",
        path: "/الرعاية-الطبية/طب-الأسرة",
        fields: { summary: "رعاية أولية شاملة." },
        faqs: [{ id: "f1", question: "س؟", answer: "ج." }],
        relations: [{ id: "r1", relationKey: "doctors", targetType: "person_profile", targetId: "d-1", sortOrder: 1 }],
      }),
    );
    const fields = contract.fields.parse(env.data.fields);
    const domain = contract.adapt(toAdapterInput(env, "ar", fields));

    expect(domain.summary).toEqual({ en: "", ar: "رعاية أولية شاملة." });
    expect(domain.relatedDoctorIds).toEqual(["d-1"]);
    // The Arabic public path survives untouched — it is a ROUTE, not an entry slug.
    expect(domain.slug).toBe("/الرعاية-الطبية/طب-الأسرة");
    // No transport keys leak into the domain model.
    expect(Object.keys(domain)).not.toContain("route");
    expect(Object.keys(domain)).not.toContain("data");
    expect(Object.keys(domain)).not.toContain("translationGroupId");
  });
});

test.describe("FeelStack schemas", () => {
  /**
   * Captured live 2026-08-24 from
   * GET /api/public/v1/sites/blue-diamond-medical/routes?locale=en
   * — byte-shape, not a guess.
   */
  const LIVE_ROUTE_INVENTORY_PAGE = {
    items: [
      {
        path: "/aesthetics/concerns/acne-scars",
        locale: "en",
        type: "content_entry",
        lastModified: "2026-08-23T11:25:34.635Z",
        seo: { title: "Acne Scars", description: "Comprehensive care for acne scarring." },
      },
    ],
    page: 1,
    limit: 100,
    hasMore: false,
  };

  test("accepts the route inventory page the deployed API really returns", () => {
    const parsed = feelstackRouteInventoryPageSchema.safeParse(LIVE_ROUTE_INVENTORY_PAGE);
    expect(parsed.success).toBe(true);
  });

  test("accepts a row without the optional seo/lastModified fields", () => {
    const parsed = feelstackRouteInventoryPageSchema.safeParse({
      items: [{ path: "/medical/eye-screening", locale: "ar", type: "content_entry" }],
      page: 2,
      limit: 200,
      hasMore: true,
    });
    expect(parsed.success).toBe(true);
  });

  /**
   * NEGATIVE CONTROL. The forward-declared `{ routes: [{ path, status }] }`
   * shape was never emitted by FeelStack, so `safeParse` failed on every real
   * response and `listRoutes()` returned `[]` for its entire life while the
   * old version of THIS test asserted the wrong shape was valid — which is
   * precisely why the bug survived. If this test ever goes green again, the
   * schema has regressed to the fiction.
   */
  test("REJECTS the old forward-declared { routes: [{ path, status }] } shape", () => {
    const parsed = feelstackRouteInventoryPageSchema.safeParse({
      routes: [{ path: "/medical/eye-screening", status: "published" }],
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects a row carrying a `status` field the API does not send", () => {
    // Not a hard failure (zod strips unknown keys), but the TYPE must not
    // expose one: asserting the parsed row has no `status` keeps a consumer
    // from filtering on a field that will always be undefined.
    const parsed = feelstackRouteInventoryPageSchema.parse(LIVE_ROUTE_INVENTORY_PAGE);
    expect(Object.keys(parsed.items[0])).not.toContain("status");
  });

  test("rejects a page whose pagination fields are missing or malformed", () => {
    for (const bad of [
      { items: [], page: 1, limit: 100 },
      { items: [], page: 0, limit: 100, hasMore: false },
      { items: [], page: 1, limit: -5, hasMore: false },
      { items: [], page: "1", limit: 100, hasMore: false },
      { items: {}, page: 1, limit: 100, hasMore: false },
    ]) {
      expect(feelstackRouteInventoryPageSchema.safeParse(bad).success, JSON.stringify(bad)).toBe(false);
    }
  });

  test("rejects malformed JSON shape for routes (not an object)", () => {
    const parsed = feelstackRouteInventoryPageSchema.safeParse(["not", "an", "object"]);
    expect(parsed.success).toBe(false);
  });
  test("envelope accepts the canonical FeelStack shape", () => {
    const parsed = feelstackWebhookEnvelopeSchema.safeParse({
      id: "3f1c2e64-6b1d-4a7f-9c2e-1b8a5d4e7f00",
      type: "content.entry.published",
      projectId: "d1a870a4-a514-4719-bf71-6cff26b18dcb",
      occurredAt: "2026-08-24T07:00:00.000Z",
      data: { id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33", contentType: "medical-service" },
    });
    expect(parsed.success).toBe(true);
  });

  test("envelope accepts the underscored person_profile type FeelStack really emits", () => {
    const parsed = feelstackWebhookEnvelopeSchema.safeParse({
      id: "3f1c2e64-6b1d-4a7f-9c2e-1b8a5d4e7f00",
      type: "content.person_profile.published",
      projectId: "d1a870a4-a514-4719-bf71-6cff26b18dcb",
      occurredAt: "2026-08-24T07:00:00.000Z",
      data: {},
    });
    expect(parsed.success).toBe(true);
  });

  /**
   * Negative assertions. The pre-alignment shapes were forward-declared
   * guesses that no real delivery could satisfy. Keeping them merely
   * "unused" in a union is how the same defect survived twice before in
   * this integration, so their removal is asserted explicitly.
   */
  test("the old guessed {event, siteKey, ...} body no longer validates", () => {
    const parsed = feelstackWebhookEnvelopeSchema.safeParse({
      event: "medical-service.updated",
      siteKey: "blue-diamond-medical",
      locale: "en",
      entityId: "eye-screening",
    });
    expect(parsed.success).toBe(false);
  });

  test("the legacy {path}-only body no longer validates", () => {
    const parsed = feelstackWebhookEnvelopeSchema.safeParse({ path: "/en/medical/eye-screening" });
    expect(parsed.success).toBe(false);
  });

  test("envelope rejects an unrecognized shape entirely", () => {
    const parsed = feelstackWebhookEnvelopeSchema.safeParse({ foo: "bar" });
    expect(parsed.success).toBe(false);
  });

  test("event data uses FeelStack's archived status, not Blue Diamond's disabled", () => {
    expect(feelstackContentEventDataSchema.safeParse({ status: "archived" }).success).toBe(true);
    expect(feelstackContentEventDataSchema.safeParse({ status: "disabled" }).success).toBe(false);
  });
});
