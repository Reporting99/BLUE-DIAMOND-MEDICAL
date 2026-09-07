import { test, expect } from "@playwright/test";
import {
  normalizeImagekitEndpoint,
  imagekitConfig,
  imagekitIsConfigured,
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
