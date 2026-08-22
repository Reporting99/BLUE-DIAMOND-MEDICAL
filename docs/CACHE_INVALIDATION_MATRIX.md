# Cache Invalidation Matrix

Registry: `src/lib/feelstack/cache-tags.ts`. Invalidation rules: `src/lib/feelstack/revalidation.ts`. Enforced by `tests/cache/cache-tag-coverage.spec.ts` (8 tests, all passing).

## Coverage (brief §8 minimum list — all 24 present)

| Cache tag | Invalidating event(s) |
|---|---|
| `site` | `site-settings.updated` |
| `siteSettings` | `site-settings.updated` |
| `routes` | `route.changed` |
| `page` | `page.published`, `page.unpublished`, `page.updated`, `route.changed` |
| `navigation` | `navigation.updated`, `route.changed` |
| `footer` | `footer.updated` |
| `seo` | `page.published`, `page.updated` |
| `sitemap` | `route.changed`, `page.published`, `page.unpublished`, `product.updated`, `health-hub-article.published`, `health-hub-article.updated` |
| `doctorsIndex` / `doctor` | `doctor.updated` |
| `medicalServicesIndex` / `medicalService` | `medical-service.updated` |
| `aestheticTreatmentsIndex` / `aestheticTreatment` | `aesthetic-treatment.updated` |
| `concernsIndex` / `concern` | `concern.updated` |
| `technologiesIndex` / `technology` | `technology.updated` |
| `productsIndex` / `product` | `product.updated` |
| `healthHubIndex` / `healthHubArticle` | `health-hub-article.published`, `health-hub-article.updated` |
| `legalPagesIndex` / `legalPage` | `legal-page.updated` |
| `bookingConfig` | `booking-config.updated` |

**Completeness is enforced by test, not just this table**: `tests/cache/cache-tag-coverage.spec.ts` walks every key exported from `cacheTags` and asserts a non-empty entry exists in `invalidationCoverage`, and separately that `invalidationCoverage` references no key that isn't a real tag builder (catches typos in either direction).

## Specific rules verified (brief §8)

- **Product changes** invalidate product detail + shop index (`productsIndex`) + sitemap. Verified: `tests/cache/cache-tag-coverage.spec.ts` "product changes invalidate the product detail, shop index, and sitemap".
- **Article changes** invalidate article detail + Health Hub index + sitemap. Verified: same file, "article changes...".
- **Route changes** invalidate route inventory + sitemap + navigation (both locales) + the affected page tag. Verified: same file, "route changes...".
- **Locale-specific changes invalidate only that locale.** `tagsForEvent()` takes an optional `locale`; when present, only that locale's tag variants are built. Verified: "navigation changes invalidate navigation only for the given locale, not both".
- **No global purges for non-global events.** `footer.updated` does not touch `sitemap`/`routes`. Verified: "an unrelated event invalidates nothing (no global purge)".

## Known limitation

The structured webhook event/payload contract (`event`, `siteKey`, `locale`, `entityId`, `path`) that feeds `tagsForEvent()` is a **forward declaration**, not confirmed against a real FeelStack webhook sender — none exists in the recovered Dfeelings source to derive it from (Dfeelings uses time-based ISR only). Documented in `docs/WEBHOOK_SECURITY_REPORT.md` and `docs/FEELSTACK_MIGRATION_MANIFEST.md`; the legacy `{ path }`-only shape this deployment already shipped continues to work unchanged.
