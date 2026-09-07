import { test, expect, type Locator } from "@playwright/test";

/**
 * The logo, specifically: that a real image of the client's mark reaches the
 * page, in both locales, in the header and in the footer.
 *
 * Nothing in the suite covered this before. The logo used to be an inline
 * `<svg>` recreation that could not fail to render, and when it was replaced
 * by the client's supplied file (CL-001) the mark became an `<img>` with a
 * `src` that is chosen at build time — the ImageKit delivery URL when the
 * manifest entry is `approved`, the copy bundled in the build otherwise
 * (src/lib/media/brand-mark.ts). Both are legitimate; a placeholder is not.
 *
 * That is the failure this file exists to catch. Every other image on the
 * site degrades to the FacetTile brand placeholder when its asset is missing
 * or unapproved, which is the right behaviour for a photograph and the wrong
 * one for a logo: an abstract tile where the clinic's name should be reads as
 * a broken site, and it would do so on every route at once. So these assert
 * the element is an `<img>` pointing at the mark AND that the browser
 * actually decoded bytes (`naturalWidth > 0`) — a 404 leaves the element in
 * the DOM with the right `src` and nothing on screen.
 */

const LOCALES = [
  { locale: "en", home: "Blue Diamond Medical — Home" },
  { locale: "ar", home: "بلو دايموند الطبية — الصفحة الرئيسية" },
] as const;

/**
 * Both legitimate sources for the mark, and nothing else.
 *
 * `/_next/static/media/blue-diamond-medical-mark.<hash>.png` is the copy bundled in
 * the build — what renders when the manifest entry is not `approved` OR when
 * NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is unset, which is the case in CI: it has
 * no .env, so `imagekitIsConfigured` is false there and this fallback is what
 * the suite actually exercises. The webpack content hash is why this is a
 * pattern and not a literal -- and why the class allows a HYPHEN. Turbopack
 * emits hashes such as `32xu51t6-hluu`, so `[a-z0-9]+` matches only the ones
 * that happen not to contain `-`. It passed for two years on that luck; the
 * first hash with a hyphen failed all five of these assertions at once, and
 * only in CI, because a local run has a `.env` and takes the ImageKit branch
 * instead.
 *
 * The ImageKit form is what production serves. Matching the endpoint rather
 * than just the filename is deliberate: "some host is serving something
 * called blue-diamond-medical-mark.png" is not the assertion — the approved CDN is.
 */
const BUNDLED_MARK = /^\/_next\/static\/media\/blue-diamond-medical-mark\.[a-z0-9-]+\.png$/i;
const IMAGEKIT_MARK = /^https:\/\/ik\.imagekit\.io\/[a-z0-9]+\/blue-diamond\/brand\/blue-diamond-medical-mark\.png(\?|$)/i;

async function expectRenderedMark(mark: Locator) {
  await expect(mark).toHaveCount(1);
  const src = await mark.getAttribute("src");
  expect(
    src && (BUNDLED_MARK.test(src) || IMAGEKIT_MARK.test(src)),
    `logo src must be the bundled mark or the ImageKit copy, got: ${src}`,
  ).toBe(true);
  // Decoded, not merely present: a broken URL still matches the src above.
  await expect
    .poll(() => mark.evaluate((el) => (el as HTMLImageElement).naturalWidth), { timeout: 10_000 })
    .toBeGreaterThan(0);
  // The mark keeps its own aspect — a stretched logo is a brand violation
  // (docs/UI_UX_FOUNDATION.md §1.1), and `w-auto` off a fixed height is what
  // guarantees it.
  const box = await mark.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width / box!.height).toBeCloseTo(424 / 519, 1);
}

for (const { locale, home } of LOCALES) {
  test.describe(`brand mark — /${locale}`, () => {
    test("the header renders the supplied mark, not a placeholder tile", async ({ page }) => {
      await page.goto(`/${locale}`);
      const logo = page.locator("header").getByRole("link", { name: home });
      await expectRenderedMark(logo.locator("img"));
      // FacetTile is the placeholder every unapproved asset falls back to.
      // The logo must never be one.
      await expect(logo.locator("svg")).toHaveCount(0);
    });

    test("the footer renders the same mark", async ({ page }) => {
      await page.goto(`/${locale}`);
      const logo = page.locator("footer").getByRole("link", { name: home });
      await expectRenderedMark(logo.locator("img"));
    });
  });
}

test("the About hero lock-up renders the mark", async ({ page }) => {
  await page.goto("/en/about");
  const lockup = page.getByRole("img", { name: "Blue Diamond Medical" }).first();
  await expectRenderedMark(lockup.locator("img"));
});

test("the favicon is the brand mark, not the Next.js scaffold default", async ({ request }) => {
  const response = await request.get("/favicon.ico");
  expect(response.status()).toBe(200);
  const body = await response.body();
  // The scaffold favicon Next ships is exactly 25,931 bytes and shipped in
  // this repository until 2026-09-06. Asserting the size alone would be
  // brittle; asserting it is NOT that specific file is the real requirement.
  expect(body.byteLength).not.toBe(25_931);
  expect(body.byteLength).toBeGreaterThan(0);
  // ICO magic: reserved=0, type=1 (icon).
  expect([body[0], body[1], body[2], body[3]]).toEqual([0, 0, 1, 0]);
});
