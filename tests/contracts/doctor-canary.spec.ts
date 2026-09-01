import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { feelstackResolveEnvelopeSchema, entityPayload } from "../../src/lib/feelstack/transport";
import { checkLocaleIntegrity } from "../../src/lib/feelstack/locale-integrity";
import { toAdapterInput } from "../../src/lib/feelstack/adapters";
import { doctorCmsContract, doctorPersonFieldsSchema } from "../../src/features/doctors/cms-contract";
import { doctors } from "../../src/features/doctors/data";

/**
 * First real canary — Dr. Mohamed Farhat.
 *
 * These fixtures are not hand-written. They are the verbatim responses of
 * `GET https://feelstack.dfeelings.com/api/public/v1/sites/blue-diamond-medical
 *      /resolve?path=/our-team/mohamed-farhat&locale={en,ar}`
 * captured immediately after the record was created, so this suite fails if the
 * live contract ever drifts from what the adapter expects.
 *
 * Every previous version of this integration passed its tests against a shape
 * the backend does not emit. Fixtures come from the wire now, never from what
 * the frontend finds convenient.
 */
const fixture = (locale: "en" | "ar") =>
  JSON.parse(
    readFileSync(path.join(process.cwd(), "tests", "fixtures", "feelstack", `doctor-resolve-${locale}.json`), "utf8"),
  );

const staticFarhat = doctors.find((d) => d.id === "mohamed-farhat")!;

test.describe("doctor canary — live envelope", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: the live response parses as a valid envelope`, () => {
      expect(feelstackResolveEnvelopeSchema.safeParse(fixture(locale)).success).toBe(true);
    });

    test(`${locale}: resolves its own locale with no fallback`, () => {
      const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
      expect(env.route.requestedLocale).toBe(locale);
      expect(env.route.resolvedLocale).toBe(locale);
      expect(env.route.locale).toBe(locale);
      expect(env.route.usedFallback).toBe(false);
      expect(checkLocaleIntegrity(env, locale).ok).toBe(true);
    });

    test(`${locale}: person_profile columns are read from data, not data.fields`, () => {
      const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
      expect(env.type).toBe("person_profile");
      // The trap this canary exposed: person_profile has no `fields` key, so
      // reading data.fields yields {} and every field silently goes missing.
      expect(env.data.fields).toBeUndefined();
      expect(entityPayload(env)).toHaveProperty("displayName");
    });
  }

  test("both locales share one translationGroupId", () => {
    const en = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const ar = feelstackResolveEnvelopeSchema.parse(fixture("ar"));
    expect(en.data.translationGroupId).toBeTruthy();
    expect(en.data.translationGroupId).toBe(ar.data.translationGroupId);
  });

  test("relations stay nested under `relations`", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    expect(Object.keys(env.relations ?? {}).sort()).toEqual(["faqs", "items", "sections", "taxonomies"]);
  });
});

test.describe("doctor adapter", () => {
  const adapt = (locale: "en" | "ar") => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
    const fields = doctorPersonFieldsSchema.parse(entityPayload(env));
    return doctorCmsContract.adapt(toAdapterInput(env, locale, fields));
  };

  test("EN maps onto the approved static record exactly", () => {
    const d = adapt("en");
    expect(d.id).toBe(staticFarhat.id);
    expect(d.routeId).toBe(staticFarhat.routeId);
    expect(d.name.en).toBe(staticFarhat.name.en);
    expect(d.credentials.en).toBe(staticFarhat.credentials.en);
    expect(d.bio.en).toBe(staticFarhat.bio.en);
    expect(d.practicesAesthetics).toBe(staticFarhat.practicesAesthetics);
    expect(d.bookingChannel).toBe(staticFarhat.bookingChannel);
    expect(d.image.status).toBe(staticFarhat.image.status);
  });

  test("AR maps onto the approved Arabic source exactly — no re-translation", () => {
    const d = adapt("ar");
    expect(d.name.ar).toBe(staticFarhat.name.ar);
    expect(d.credentials.ar).toBe(staticFarhat.credentials.ar);
    expect(d.bio.ar).toBe(staticFarhat.bio.ar);
  });

  test("the non-requested locale is left EMPTY, never the other language", () => {
    const en = adapt("en");
    const ar = adapt("ar");
    expect(en.name.ar).toBe("");
    expect(en.bio.ar).toBe("");
    expect(ar.name.en).toBe("");
    expect(ar.bio.en).toBe("");
    // And specifically: the Arabic render carries no English clinical prose.
    expect(JSON.stringify(ar)).not.toContain(staticFarhat.bio.en);
    expect(JSON.stringify(en)).not.toContain(staticFarhat.bio.ar);
  });

  test("ImageKit stays the media store — FeelStack holds only the reference", () => {
    const d = adapt("en");
    expect(d.image.path).toBe("/doctors/farhat.jpg");
    // No FeelStack asset id is used, and no duplicate upload is implied.
    expect(JSON.stringify(d)).not.toContain("mediaAssetId");
  });

  test("a bad bookingChannel is rejected rather than rendered", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const payload = entityPayload(env) as Record<string, unknown>;
    const broken = { ...payload, metadata: { ...(payload.metadata as object), bookingChannel: "walk-in" } };
    // person_profile.metadata is free-form, so the CMS accepts anything here.
    // This schema is the only guard, which is why it must be strict.
    expect(doctorPersonFieldsSchema.safeParse(broken).success).toBe(false);
  });
});
