import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { feelstackResolveEnvelopeSchema } from "../../src/lib/feelstack/transport";
import { parseMediaAssignments } from "../../src/lib/feelstack/media";
import { toAdapterInput } from "../../src/lib/feelstack/adapters";
import { productCmsContract } from "../../src/features/products/cms-contract";
import { products } from "../../src/features/products/data";

/**
 * A product's assigned photograph must beat anything this repository hardcodes.
 *
 * The catalogue rendered placeholders for months while 19 approved packshots
 * sat in the media library, and the fix was never in the frontend — the
 * contract already read `productPrimary`. What was missing was any test that
 * would notice if that stopped being true. This is that test.
 *
 * The fixture is the literal production response for
 * `GET /public/v1/sites/<site>/resolve?path=/shop/tns-recovery-complex&locale=en`,
 * not a hand-written envelope. Asserting a shape someone invented is how the
 * original gap survived review; asserting against what the CMS actually sends
 * is what catches the next one.
 */
const envelope = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "tests", "fixtures", "feelstack", "product-media-resolve-en.json"),
    "utf8",
  ),
);

function adapt(raw: unknown) {
  const parsed = feelstackResolveEnvelopeSchema.parse(raw);
  const fields = productCmsContract.fields.parse(parsed.data.fields);
  const { media } = parseMediaAssignments(parsed.media);
  return productCmsContract.adapt(toAdapterInput(parsed, "en", fields, media));
}

test("the fixture is a real productPrimary assignment, not a placeholder", () => {
  const { media } = parseMediaAssignments(feelstackResolveEnvelopeSchema.parse(envelope).media);
  expect(media).toHaveLength(1);
  expect(media[0].slot).toBe("productPrimary");
  expect(media[0].status).toBe("approved");
  expect(media[0].path).toMatch(/^\/blue-diamond\/shop\//);
});

test("the assigned image is what the product renders", () => {
  const product = adapt(envelope);
  expect(product.images).toHaveLength(1);
  expect(product.images[0].path).toBe("/blue-diamond/shop/22_TNS_Recovery_Complex.jpg");
  expect(product.images[0].status).toBe("approved");
});

test("the assignment REPLACES the static record rather than joining it", () => {
  // Two photographs of one product in one gallery -- the real one and the
  // placeholder it replaced -- is a content bug, not a richer gallery.
  const product = adapt(envelope);
  expect(product.images).toHaveLength(1);
  expect(product.images.map((i) => i.path)).not.toContain("");
});

test("a product with no assignment renders a placeholder, never an image", () => {
  // The invariant that matters: without an assignment nothing reaches
  // "approved", and ImageKitImage requests bytes only at "approved". So no
  // path is fetched, whatever a stale record happens to hold.
  //
  // It does hold one. The CMS `images` field still carries the legacy
  // /blue-diamond/products/skinmedica/<slug>.jpg guess this repository used
  // to generate and which was imported along with the catalogue -- a location
  // no asset has ever occupied. It is inert while the status stays "pending",
  // and it is CMS content rather than something this repository can fix, but
  // approving one of those records would produce a 404 image. This test is
  // what would catch that, because an approved fallback fails it.
  const product = adapt({ ...envelope, media: [] });
  expect(product.images.length).toBeGreaterThan(0);
  for (const image of product.images) {
    expect(image.status, "no assignment must never yield an approved image").not.toBe("approved");
  }
});

test("no static product record fabricates an ImageKit path", () => {
  // The static catalogue is a fallback for products the CMS has not reached.
  // A fallback may say "no image"; it may not claim to know where one lives.
  for (const product of products) {
    for (const image of product.images) {
      expect(image.path, `${product.id} must not guess an image path`).toBe("");
      expect(image.status, `${product.id} static record must stay unapproved`).not.toBe("approved");
    }
  }
});

test("every product still carries alt text for the placeholder it renders", () => {
  // An empty path is fine; an empty alt is an accessibility regression.
  for (const product of products) {
    for (const image of product.images) {
      expect(image.alt.en.length, `${product.id} en alt`).toBeGreaterThan(0);
      expect(image.alt.ar.length, `${product.id} ar alt`).toBeGreaterThan(0);
    }
  }
});
