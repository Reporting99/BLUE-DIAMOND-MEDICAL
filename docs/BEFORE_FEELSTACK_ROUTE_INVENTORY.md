# Before-FeelStack Route Inventory

Captured 2026-08-22, immediately before the "Dfeelings architecture parity / FeelStack integration" pass, from `src/config/routes.ts` at commit `4880be859e58235d6f0d10a25294d2fe0f4d03e0` (branch `master`).

This is a snapshot pointer, not a re-derivation: the authoritative, already-audited inventory is `docs/FINAL_ROUTE_INVENTORY.md` (104 registered routes: 88 KEEP/live, 16 GATE/feature-flagged, 0 MERGE, 0 DELETE, 0 REQUIRES CLIENT APPROVAL, plus 29 REDIRECT legacy URLs in `docs/REDIRECT_MAP.md`). That file was current as of this commit and nothing in this pass touched `src/config/routes.ts`, `src/config/features.ts`, or any `src/content/*.ts` file, so its counts stand unchanged as the "before" baseline.

## What this pass could change vs. couldn't

Per the brief's rule 10 ("No loss of Blue Diamond pages, content, routes... Do not delete, rename, or redirect Blue Diamond routes before producing an exact route comparison") and the explicit scope decision recorded in `docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md`, this pass:

- Did **not** add, remove, rename, or redirect any route.
- Did **not** change `src/config/routes.ts`, `src/config/features.ts`, or any `src/content/*.ts` file.
- Did add a new content-resolution layer (`FEELSTACK_CONTENT_MODE`) that, in its default `static` value, is a documented no-op for every route — verified by the production build (`npm run build`) generating the identical 169 static/SSG page paths across both locales that this route registry already implies, and by the full Playwright suite (376/376 passing on `chromium-desktop`) passing unchanged.

## Build-verified route count at this commit

`npm run build` output (2026-08-22, this pass, before any FeelStack behavior changes):

- 169 generated page paths across `en`/`ar` (static + SSG), matching `src/config/routes.ts`'s 88 live entries × 2 locales minus the routes that collapse to a single dynamic segment printout in the build summary, plus the always-dynamic routes (`/[locale]/contact`, `/[locale]/medical/botox/[conditionId]`, `/[locale]/shop/category/[categoryId]`, `/[locale]/shop/concern/[concernId]`) and the 3 non-locale routes (`/robots.txt`, `/sitemap.xml`, `/llms.txt`) plus `/api/feelstack/revalidate`.
- See `docs/AFTER_FEELSTACK_ROUTE_INVENTORY.md` for the identical post-pass count and `docs/ROUTE_PARITY_REPORT.md` for the diff (none).
