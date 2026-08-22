# SEO / GEO / AEO Validation

## What this pass changed for SEO

Nothing, in the default (`static`) content mode — `generateMetadata()` in `src/app/[locale]/medical/[serviceId]/page.tsx` still derives `title`/`description` from the same `MedicalServiceContent` shape it always did; `resolvePageContent()` just returns that shape from a different source depending on `FEELSTACK_CONTENT_MODE`. In `hybrid`/`cms` mode (not active in this deployment), the same metadata call now legitimately reflects CMS-edited copy instead of only the static file — this is the intended behavior, not a regression: an editor changing a service's summary in FeelStack should change its meta description.

CMS failure pages (brief §5: "CMS failure pages must not emit misleading SEO metadata") — a thrown `FeelStackUnavailableError` never reaches `generateMetadata` with fabricated success metadata: `resolvePageContent` throws *before* returning any data, so `generateMetadata` never runs past the throw point for that request; the resulting `error.tsx` boundary carries no `generateMetadata` export at all (Next.js error boundaries don't participate in the metadata system), so no misleading title/description/canonical is ever emitted for an outage.

## Validation run (2026-08-22, this pass, `chromium-desktop`)

`tests/seo/seo-validators.spec.ts` — **all passing**:
- Route registry integrity: no duplicate EN paths, no duplicate AR paths, no duplicate route ids, every gated route is noindex + excluded from sitemap.
- Sitemap contains every published route in both locales; contains no gated route.
- `robots.txt` references the sitemap and disallows `/api/`.
- Canonical/hreflang: homepage self-referencing canonical + reciprocal hreflang; Arabic homepage canonicalizes to the Arabic URL, never English.
- `MedicalWebPage` structured data matches visible content for both a medical-service page and an aesthetic-treatment page.
- `llms.txt` served as plain text, mentions both languages.

`tests/seo/broken-links.spec.ts` — every internal link discovered across live pages resolves (not 404). `tests/seo/no-disclaimer-text.spec.ts` — no prohibited repeated disclaimer text in either language.

`tests/redirects/legacy-redirects.spec.ts` — all 29 legacy redirects still resolve to their corrected targets.

## Not independently re-validated this pass

- **GEO/AEO** (Calgary/West Springs entity relevance, answer-first summaries, FAQ usefulness) — no automated check for these exists in this repo's suite beyond the structured-data schema match already covered above; this pass didn't author or edit any visible copy, so nothing here was at risk of regressing, but it also wasn't independently re-audited.
- **Lighthouse** (brief §20 targets: Performance/Accessibility/Best-Practices/SEO ≥ the stated thresholds) — requires deployed infrastructure per the brief's own instruction ("Target Lighthouse on deployed infrastructure") and this build has not been deployed (`docs/DEPLOYMENT_GUIDE.md`: "No deployment has been performed"). Not run; not claimed.
- **`chromium-mobile` Playwright project** — not re-run this pass for time (see `docs/AFTER_FEELSTACK_ROUTE_INVENTORY.md`).

No SEO regression is claimed beyond what the automated suite above actually exercised.
