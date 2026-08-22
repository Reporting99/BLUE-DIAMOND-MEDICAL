import { test, expect } from "@playwright/test";
import {
  feelstackResolveResponseSchema,
  feelstackRoutesResponseSchema,
  cmsMedicalServiceSchema,
  feelstackWebhookBodySchema,
} from "../../src/lib/feelstack/schemas";

/**
 * FeelStack contract tests — brief §18 "FeelStack contracts": valid page
 * response, valid route response, malformed JSON, missing required
 * fields, invalid block type (n/a — no generic block model, see
 * docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md §3), invalid locale.
 */
test.describe("FeelStack schemas", () => {
  test("accepts a valid resolve response", () => {
    const parsed = feelstackResolveResponseSchema.safeParse({
      path: "/medical/eye-screening",
      locale: "en",
      status: "published",
      title: "Eye Screening",
    });
    expect(parsed.success).toBe(true);
  });

  test("rejects an invalid locale", () => {
    const parsed = feelstackResolveResponseSchema.safeParse({
      path: "/medical/eye-screening",
      locale: "fr",
      status: "published",
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects a response missing required fields", () => {
    const parsed = feelstackResolveResponseSchema.safeParse({ locale: "en", status: "published" });
    expect(parsed.success).toBe(false);
  });

  test("rejects an unexpected status enum value (invalid block/content-status type)", () => {
    const parsed = feelstackResolveResponseSchema.safeParse({
      path: "/medical/eye-screening",
      locale: "en",
      status: "archived", // not one of draft|published|disabled
    });
    expect(parsed.success).toBe(false);
  });

  test("accepts a valid routes response", () => {
    const parsed = feelstackRoutesResponseSchema.safeParse({
      routes: [{ path: "/medical/eye-screening", status: "published" }],
    });
    expect(parsed.success).toBe(true);
  });

  test("rejects malformed JSON shape for routes (not an object)", () => {
    const parsed = feelstackRoutesResponseSchema.safeParse(["not", "an", "object"]);
    expect(parsed.success).toBe(false);
  });

  test("cmsMedicalServiceSchema accepts a valid, complete entity and strips CMS-only fields", () => {
    const parsed = cmsMedicalServiceSchema.safeParse({
      id: "eye-screening",
      slug: "eye-screening",
      slugAr: "فحص-العين",
      title: { en: "Eye Screening", ar: "فحص العين" },
      summary: { en: "Summary", ar: "ملخص" },
      relatedDoctorIds: ["doctor-farhat"],
      bookingChannel: "eye-screening",
      status: "published",
      updatedAt: "2026-08-01T00:00:00Z",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("status");
      expect(parsed.data).not.toHaveProperty("updatedAt");
      expect(parsed.data.sourceVerified).toBe(true);
    }
  });

  test("cmsMedicalServiceSchema rejects an invalid bookingChannel", () => {
    const parsed = cmsMedicalServiceSchema.safeParse({
      id: "eye-screening",
      slug: "eye-screening",
      slugAr: "فحص-العين",
      title: { en: "Eye Screening", ar: "فحص العين" },
      summary: { en: "Summary", ar: "ملخص" },
      relatedDoctorIds: [],
      bookingChannel: "not-a-real-channel",
      status: "published",
    });
    expect(parsed.success).toBe(false);
  });

  test("webhook body schema accepts the legacy {path} shape", () => {
    const parsed = feelstackWebhookBodySchema.safeParse({ path: "/en/medical/eye-screening" });
    expect(parsed.success).toBe(true);
  });

  test("webhook body schema accepts the structured {event, siteKey} shape", () => {
    const parsed = feelstackWebhookBodySchema.safeParse({
      event: "medical-service.updated",
      siteKey: "blue-diamond-medical",
      locale: "en",
      entityId: "eye-screening",
    });
    expect(parsed.success).toBe(true);
  });

  test("webhook body schema rejects an unsupported event name", () => {
    const parsed = feelstackWebhookBodySchema.safeParse({
      event: "totally-made-up-event",
      siteKey: "blue-diamond-medical",
    });
    expect(parsed.success).toBe(false);
  });

  test("webhook body schema rejects an unrecognized shape entirely", () => {
    const parsed = feelstackWebhookBodySchema.safeParse({ foo: "bar" });
    expect(parsed.success).toBe(false);
  });
});
