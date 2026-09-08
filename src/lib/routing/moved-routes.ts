import { concerns } from "@/features/concerns/data";
import { features } from "@/config/features";
import { archivedSkinMedicaProducts } from "@/features/products/archive/skinmedica";

/**
 * Permanent 301s for URLs this app itself used to serve and has since moved —
 * distinct from `legacyRedirects`, which maps URLs of the *previous websites*.
 *
 * The one migration in here is the Aesthetics IA becoming concern-first. Skin
 * concerns stopped being a parallel /aesthetics/concerns branch and became the
 * Treatments entry points themselves, so every concern page changed address:
 *
 *   /en/aesthetics/concerns/acne-scars -> /en/aesthetics/treatments/acne-scars
 *
 * These URLs are not hypothetical: nine of them are the live targets of
 * legacy 301s in legacy-redirects.ts (/acne-scar-removal, /sun-damage, and so
 * on), and they carry whatever equity the old aesthetics domain passed on.
 * Deleting them would 404 the destination of a redirect we ship on purpose.
 * Those legacy entries were re-pointed at the new URLs in the same pass, so
 * nothing chains — a visitor from /acne-scar-removal still lands in one hop,
 * and this table catches anyone arriving from an index or a bookmark of the
 * old in-app URL.
 *
 * Keyed by the FULL locale-prefixed path, because the Arabic URL moves too:
 * only the parent segment changes (المخاوف-الجمالية -> العلاجات), the concern's
 * own Arabic slug is untouched. The Latin-slug form under /ar is listed as
 * well, since proxy.ts would otherwise have redirected it to the approved
 * Arabic path — a route that no longer exists — before this table was
 * consulted. Every entry lands on a live 200 in one hop, and
 * tests/redirects/moved-routes.spec.ts asserts exactly that.
 */
const OLD_EN_HUB = "/aesthetics/concerns";
const OLD_AR_HUB = "/التجميل-الطبي/المخاوف-الجمالية";
const NEW_EN_HUB = "/aesthetics/treatments";
const NEW_AR_HUB = "/التجميل-الطبي/العلاجات";

/**
 * The 23 archived SkinMedica product pages (2026-09-07).
 *
 * Blue Diamond stopped carrying SkinMedica, so `products` no longer contains
 * these records and `src/config/routes.ts` no longer builds a route for any of
 * them — /en/shop/lumivive-system-day-night and its 45 siblings would 404. They
 * were indexed, they are the targets of the /about-skinmedica-products/f/*
 * legacy 301s, and they are what anyone's bookmark or a search result points
 * at, so each one 301s to the catalogue hub instead: the visitor lands on a
 * live page showing what the clinic actually carries now.
 *
 * /shop, not a per-product replacement: there is no Myriade equivalent of any
 * given SkinMedica SKU, and pointing a retinol serum at an unrelated product
 * would be a claim the clinic never made.
 *
 * DERIVED from the archive itself, and empty while `skinMedicaEnabled` is
 * true. Both halves matter: a hand-written table would drift from the archive,
 * and a static one would keep 301ing the products away from themselves the day
 * the flag comes back — the redirect and the catalogue cannot disagree.
 */
const ARCHIVED_PRODUCT_REDIRECTS: Record<string, string> = features.skinMedicaEnabled
  ? {}
  : Object.fromEntries(
      archivedSkinMedicaProducts.flatMap((product) => [
        [`/en/shop/${product.slug}`, "/en/shop"],
        [`/ar/المتجر/${product.slugAr}`, "/ar/المتجر"],
        // The Latin-slug form under /ar, for the same reason the concern
        // entries below list one: proxy.ts would otherwise rewrite it to the
        // approved Arabic path first and land on a route that no longer exists.
        [`/ar/shop/${product.slug}`, "/ar/المتجر"],
      ]),
    );

export const movedRoutes: Record<string, string> = {
  ...ARCHIVED_PRODUCT_REDIRECTS,
  [`/en${OLD_EN_HUB}`]: `/en${NEW_EN_HUB}`,
  [`/ar${OLD_AR_HUB}`]: `/ar${NEW_AR_HUB}`,
  [`/ar${OLD_EN_HUB}`]: `/ar${NEW_AR_HUB}`,
  ...Object.fromEntries(
    concerns.flatMap((c) => [
      [`/en${OLD_EN_HUB}/${c.slug}`, `/en${NEW_EN_HUB}/${c.slug}`],
      [`/ar${OLD_AR_HUB}/${c.slugAr}`, `/ar${NEW_AR_HUB}/${c.slugAr}`],
      [`/ar${OLD_EN_HUB}/${c.slug}`, `/ar${NEW_AR_HUB}/${c.slugAr}`],
    ]),
  ),
};
