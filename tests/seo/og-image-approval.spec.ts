import { test, expect } from "@playwright/test";
import { imageManifest } from "../../src/lib/media/image-manifest";
import { imagekitIsConfigured } from "../../src/config/imagekit";

/**
 * A social card may only publish an asset the manifest has APPROVED.
 *
 * Every on-page image in this app already obeys that rule: `ImageKitImage`
 * renders the FacetTile placeholder until an asset's manifest status flips to
 * "approved". `og:image` was the one surface that did not. It gated on
 * `imagekitIsConfigured` alone, so a configured build published whatever path
 * a page handed it — and the homepage handed it
 * `/blue-diamond/home/home-hero-blue-diamond.png`, whose entry is
 * `status: "pending"`. Verified 2026-09-07 against a build with the endpoint
 * configured: the tag was emitted, and the CDN served it.
 *
 * og:image is the worst surface on which to publish something unapproved. An
 * on-page image is seen by a visitor who is already here and is corrected by
 * the next deploy; a social card is scraped once and cached by Facebook, X and
 * LinkedIn for as long as they choose to keep it. "Not approved to show on the
 * page" cannot mean "approved for every share of that page".
 *
 * This runs in whichever mode the suite is in. Unconfigured, no og:image is
 * emitted at all and the test passes on the vacuous branch — which is why it
 * also asserts, in that mode, that the tag really is absent rather than
 * pointing somewhere unchecked.
 */

const APPROVED_PATHS = new Set(
  imageManifest.filter((a) => a.status === "approved").map((a) => a.path),
);

/** Pages that carry a social card, plus a couple that should not invent one. */
const PAGES = ["/en", "/ar", "/en/about", "/en/medical/minor-procedures", "/en/shop"];

for (const path of PAGES) {
  test(`og:image is approved or absent — ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status(), `${path} did not resolve`).toBeLessThan(400);

    const images = await page
      .locator('meta[property="og:image"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("content") ?? ""));

    if (!imagekitIsConfigured) {
      // With no CDN there is no URL that could be served, so the honest
      // output is no tag — not a link into an endpoint this build does not
      // have.
      expect(images, `${path} emitted an og:image with no ImageKit configured`).toEqual([]);
      return;
    }

    for (const url of images) {
      // The delivery URL is the library path plus a transformation query, so
      // the path is recoverable from it and can be checked against the
      // manifest. Matching on the path rather than the whole URL keeps this
      // independent of the og-image preset's exact transformation string.
      const libraryPath = new URL(url).pathname.replace(
        /^\/[^/]+(?=\/blue-diamond\/)/,
        "",
      );
      expect(
        APPROVED_PATHS.has(libraryPath),
        `${path} publishes an og:image whose manifest entry is not approved: ${libraryPath}`,
      ).toBe(true);
    }
  });
}

test("no approved manifest asset is missing a path", () => {
  // The check above is only as good as the manifest's own paths. An entry with
  // an empty or duplicate path would let an unapproved asset match one.
  const approved = imageManifest.filter((a) => a.status === "approved");
  for (const a of approved) {
    expect(a.path, `${a.id} has no path`).toMatch(/^\/blue-diamond\/.+/);
  }
  const paths = approved.map((a) => a.path);
  expect(new Set(paths).size, "two approved assets share a path").toBe(paths.length);
});
