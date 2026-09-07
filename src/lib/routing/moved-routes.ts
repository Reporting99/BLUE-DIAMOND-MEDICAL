import { concerns } from "@/features/concerns/data";

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

export const movedRoutes: Record<string, string> = {
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
