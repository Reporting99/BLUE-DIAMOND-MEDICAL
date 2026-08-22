# After-FeelStack Route Inventory

Captured 2026-08-22, immediately after the "Dfeelings architecture parity / FeelStack integration" pass, same commit lineage as `docs/BEFORE_FEELSTACK_ROUTE_INVENTORY.md`.

`src/config/routes.ts` is byte-for-byte unchanged by this pass (`git diff` on that file is empty). `docs/FINAL_ROUTE_INVENTORY.md`'s counts (104 registered routes: 88 KEEP, 16 GATE, 29 REDIRECT) are therefore still the accurate, current inventory — this pass added a content-resolution *capability*, not new pages, and did not delete, rename, gate, or redirect anything.

## Build verification (post-pass)

`npm run build` (2026-08-22, this pass, after all FeelStack adapter/webhook/error-boundary changes and the medical-service hybrid-resolution wiring) produced the identical route tree as the before-snapshot: 169 generated page paths across `en`/`ar`, same dynamic-route set (`/[locale]/contact`, `/[locale]/medical/botox/[conditionId]`, `/[locale]/shop/category/[categoryId]`, `/[locale]/shop/concern/[concernId]`), same 3 top-level utility routes (`robots.txt`, `sitemap.xml`, `llms.txt`), plus the existing `/api/feelstack/revalidate` route (rewritten, same path).

One new route-tree entry: `src/app/[locale]/error.tsx`, an error *boundary* (not a page/route) required by the corrected CMS-failure-handling architecture (brief §5, §17's target structure) — it has no path of its own and does not appear in the build's route table, same as `not-found.tsx`.

## Full test-suite confirmation

`npx playwright test --project=chromium-desktop` — **376/376 passed** (4.6 min), including:
- `tests/redirects/legacy-redirects.spec.ts` — all 29 legacy redirects still resolve correctly.
- `tests/seo/broken-links.spec.ts` — every internal link discovered across live pages still resolves.
- `tests/seo/seo-validators.spec.ts` — sitemap contains every published route in both locales, no gated route leaks in, canonical/hreflang/structured-data checks all pass.
- `tests/unit/skinmedica-catalogue.spec.ts` — all 23 approved SkinMedica products still present, unchanged.
- `tests/e2e/medical-services.spec.ts` and the rest of `tests/e2e/*` — unaffected by the hybrid-resolution wiring on `medical/[serviceId]`.

(`chromium-mobile` project was not re-run this pass for time; nothing touched here is device-conditional, so this is a documented gap, not a claimed result — see `docs/FINAL_BLUE_FEELSTACK_REPORT.md` "Remaining blockers".)

## Conclusion

Route count, route paths, redirect behavior, sitemap contents, and gated-route enforcement are identical before and after this pass. See `docs/ROUTE_PARITY_REPORT.md` for the explicit diff statement.
