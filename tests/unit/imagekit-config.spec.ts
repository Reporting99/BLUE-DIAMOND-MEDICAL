import { test, expect } from "@playwright/test";
import { buildSrc } from "@imagekit/javascript";
import {
  normalizeImagekitEndpoint,
  imagekitConfig,
  imagekitIsConfigured,
  imagePresets,
} from "../../src/config/imagekit";

/**
 * The configured/unconfigured decision, tested directly.
 *
 * The application has exactly two legitimate brand-mark sources — the approved
 * ImageKit endpoint when one is configured, the copy bundled into the build
 * when none is (src/lib/media/brand-mark.ts) — and `imagekitIsConfigured` is
 * the single switch between them. It was previously derived from
 * `imagekitConfig.urlEndpoint.length > 0`, and because that field falls back to
 * the committed `DEFAULT_URL_ENDPOINT` constant the switch could only ever
 * report `true`. A build with no ImageKit at all still emitted live CDN URLs,
 * so the fallback branch was dead in every environment that lacked a `.env` —
 * including CI, whose brand-mark run was quietly asserting against real network
 * delivery it was documented NOT to exercise.
 *
 * A pure resolver is what makes the blank-string cases assertable at all: they
 * cannot be reached through `process.env` here, because Next inlines
 * `NEXT_PUBLIC_*` at BUILD time — by the time this file runs, the value is
 * already frozen into the bundle and assigning to `process.env` changes
 * nothing. Testing the function is therefore not a convenience, it is the only
 * honest way to cover the branch.
 */
test.describe("normalizeImagekitEndpoint", () => {
  test("treats every flavour of blank as unconfigured", () => {
    // `??` catches only the first of these. The rest are what a
    // declared-but-empty variable actually looks like: an empty GitHub Actions
    // `vars.` entry, a bare `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=` line, a
    // copy-paste that carried whitespace.
    for (const blank of [undefined, null, "", " ", "\t", "\n", "   \t \n "]) {
      expect(normalizeImagekitEndpoint(blank), JSON.stringify(blank)).toBeNull();
    }
  });

  test("keeps a real endpoint, trimmed", () => {
    expect(normalizeImagekitEndpoint("https://ik.imagekit.io/oq92dh6zib")).toBe(
      "https://ik.imagekit.io/oq92dh6zib",
    );
    expect(normalizeImagekitEndpoint("  https://ik.imagekit.io/oq92dh6zib  ")).toBe(
      "https://ik.imagekit.io/oq92dh6zib",
    );
  });

  test("collapses trailing slashes so one endpoint is one value", () => {
    // Otherwise `${endpoint}/${path}` yields a double slash and ImageKit
    // serves a 404 for a path that is, character for character, correct.
    for (const raw of [
      "https://ik.imagekit.io/oq92dh6zib/",
      "https://ik.imagekit.io/oq92dh6zib//",
      " https://ik.imagekit.io/oq92dh6zib/ ",
    ]) {
      expect(normalizeImagekitEndpoint(raw)).toBe("https://ik.imagekit.io/oq92dh6zib");
    }
  });
});

test.describe("imagekit environment state", () => {
  test("configured-ness follows the environment, not the committed default", () => {
    // Whichever mode this run is in, the two must agree — that agreement is
    // the property that broke. `imagekitIsConfigured` must never be true
    // merely because `DEFAULT_URL_ENDPOINT` exists.
    const fromEnv = normalizeImagekitEndpoint(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT);
    expect(imagekitIsConfigured).toBe(fromEnv !== null);
  });

  test("a URL is always buildable, configured or not", () => {
    // The provider in the root layout and `imagekitSrc` both need a string.
    // Falling back to the approved account keeps a deployment that forgot the
    // variable pointing at the right place; it just no longer claims to be
    // configured.
    expect(imagekitConfig.urlEndpoint).toMatch(/^https:\/\/[^/]+\/.+$/);
    expect(imagekitConfig.urlEndpoint.endsWith("/")).toBe(false);
  });
});

/**
 * Cache-busting version parameter — built the exact way `ImageKitImage`
 * builds it: `queryParameters` alongside `transformation`, both handed to the
 * same `@imagekit/next`/`@imagekit/javascript` URL builder used in
 * production (`buildSrc` — see `imagekitSrc` in src/config/imagekit.ts). This
 * exercises the SDK's own combination of the two rather than a hand-rolled
 * string, so a future SDK change that alters how it merges them would fail
 * this test instead of silently shipping a broken or colliding URL.
 */
test.describe("cache-busting version query parameter", () => {
  test("appends the version as its own query param alongside the transform", () => {
    const url = buildSrc({
      urlEndpoint: imagekitConfig.urlEndpoint,
      src: "/blue-diamond/treatments/rf-microneedling-hero.png",
      transformation: [imagePresets.hero],
      queryParameters: { v: "3f7c1a9e-0000-4000-8000-000000000001" },
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("v")).toBe("3f7c1a9e-0000-4000-8000-000000000001");
    // The transform is still present and untouched — the version param is
    // additive, never a replacement for the crop/format/quality string.
    expect(parsed.searchParams.get("tr")).toBeTruthy();
  });

  test("the version param never collides with or overwrites the transform param", () => {
    const withVersion = buildSrc({
      urlEndpoint: imagekitConfig.urlEndpoint,
      src: "/blue-diamond/treatments/rf-microneedling-hero.png",
      transformation: [imagePresets.hero],
      queryParameters: { v: "some-id" },
    });
    const withoutVersion = buildSrc({
      urlEndpoint: imagekitConfig.urlEndpoint,
      src: "/blue-diamond/treatments/rf-microneedling-hero.png",
      transformation: [imagePresets.hero],
    });
    const trWith = new URL(withVersion).searchParams.get("tr");
    const trWithout = new URL(withoutVersion).searchParams.get("tr");
    // Adding `v` must not change the `tr` transform string at all.
    expect(trWith).toBe(trWithout);
    expect(new URL(withoutVersion).searchParams.has("v")).toBe(false);
  });

  test("omitting the version produces the exact same URL as before this change", () => {
    // Graceful fallback: a caller with no version (a stale cached URL, a
    // static/manifest asset that never carried one) renders precisely the
    // pre-existing URL — no `?v=undefined`, no empty `v=`, nothing appended.
    const url = buildSrc({
      urlEndpoint: imagekitConfig.urlEndpoint,
      src: "/blue-diamond/treatments/rf-microneedling-hero.png",
      transformation: [imagePresets.hero],
    });
    expect(url).not.toContain("v=undefined");
    expect(url).not.toContain("?v=");
    expect(url).not.toContain("&v=");
    expect(() => new URL(url)).not.toThrow();
  });
});
