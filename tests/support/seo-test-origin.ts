/**
 * The throwaway origin the test harness injects as SITE_URL.
 *
 * Why a fake domain at all: the launched code paths — populated sitemap,
 * `Sitemap:` in robots.txt, absolute canonical/hreflang/og:url tags — only
 * exist once a valid https origin is configured. Verifying them requires an
 * origin. Naming the real future domain here would put a hard-coded production
 * domain back into the repository, which is exactly what this pass removed.
 *
 * `.invalid` is reserved by RFC 2606 and is guaranteed never to resolve, so
 * this value cannot be reached by a crawler, cannot be confused for a real
 * deployment, and is obvious in any output it leaks into.
 *
 * It lives HERE, under tests/, and nowhere else:
 *   - no file under src/ may reference it (asserted by
 *     tests/seo/site-url-config.spec.ts)
 *   - it is never written to .env, .env.example, or any build artifact
 *   - production builds supply their own SITE_URL and never read this file
 *
 * Overridable via SEO_TEST_ORIGIN so a run can point at a real staging origin
 * without editing the repository.
 */
export const SEO_TEST_ORIGIN = process.env.SEO_TEST_ORIGIN ?? "https://seo-test.invalid";
