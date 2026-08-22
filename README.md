# Blue Diamond Medical

Bilingual (English/Arabic) Next.js site for Blue Diamond Medical Clinic — family medicine, walk-in care, and physician-led medical aesthetics in West Springs, Calgary. Canonical domain: `bluediamondmedical.ca`.

**Status:** 104 registered routes — 74 live and indexed (148 sitemap URLs across both locales), 16 fully built but feature-flagged off pending real content, and 14 live but deliberately out of the sitemap. Templates, the ImageKit and FeelStack adapters and the test suite are complete. See `docs/ARCHITECTURE.md` §5 for routing and `docs/CONTENT_MODEL.md` §5 for what's gated and why.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/en`. Arabic lives at `/ar`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Local dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright (`tests/e2e` + `tests/accessibility`) |
| `npm run validate` | typecheck + lint + build, in order |

## Architecture

- **Next.js 16 App Router**, Server Components by default, Turbopack.
- **Locale routing**: `src/app/[locale]/layout.tsx` is the true root layout (owns `<html lang dir>`); `src/proxy.ts` (Next 16's renamed `middleware`) handles `/ → /en/`, legacy 301s, and rewriting pretty Arabic URLs (e.g. `/ar/الأطباء`) to their canonical English-slug physical routes.
- **Design system**: `docs/ARCHITECTURE.md` is the source of truth; tokens live in `src/app/globals.css` (Tailwind v4 `@theme`), fonts in `src/lib/fonts.ts` (Fraunces + IBM Plex Sans + IBM Plex Sans Arabic + IBM Plex Mono).
- **UI primitives**: shadcn/ui `base-nova` style, built on `@base-ui/react` (not Radix — components use a `render` prop, not `asChild`).
- **Config layer** (`src/config/`): `site.ts`, `routes.ts` (bilingual route registry — single source for nav/sitemap/hreflang/canonicals), `features.ts` (feature flags), `booking.ts` (centralized external booking URLs), `clinic-hours.ts`, `imagekit.ts`.
- **Media**: `src/components/media/ImageKitImage.tsx` wraps the official `@imagekit/next` SDK (`ImageKitProvider` in the root layout) and is the only sanctioned way to render a production image; it falls back to a code-generated "Facet Tile" placeholder (never a stock photo) whenever ImageKit isn't configured or an asset isn't `"approved"`.
- **Content**: doctor data in `src/types/doctor.ts`, UI copy in `src/i18n/dictionaries/{en,ar}.ts`, page-specific bilingual copy inline per page component, plus dedicated typed content files under `src/content/` (medical services, treatments, concerns, technologies, products, legal pages, Health Hub articles).
- **Forms**: `src/components/forms/ContactForm.tsx` + `src/app/[locale]/contact/actions.ts` — Zod validation, sanitization, rate limiting, honeypot spam protection, and a delivery adapter that fails closed (no false "sent" confirmations) until a real provider is configured. `ConsultationRequestForm` follows the same pattern, gated off.
- **FeelStack CMS adapter**: `src/lib/feelstack/` — typed, Zod-validated, timeout+retry client; `POST /api/feelstack/revalidate` is HMAC-verified with a route allowlist. Not active without real credentials.
- **Commerce adapter**: `src/lib/commerce/adapter.ts` — provider-agnostic interface ready for a real Shopify/Stripe implementation; `NullCommerceAdapter` is the current no-op.
- **Feature-gated routes**: any route not yet backed by approved content is fully built (registry entry, typed model, template) but calls `notFound()` while its flag in `src/config/features.ts` is off — see `docs/CONTENT_MODEL.md`.

## Testing

```bash
npx playwright install chromium   # first time only
npx playwright test               # all projects
npx playwright test tests/accessibility  # axe-core WCAG scan only
```

## Documentation

Four documents. Everything is in one of them.

| Document | Covers |
|---|---|
| `docs/ARCHITECTURE.md` | rendering model, routing and locales, server/client split, SEO, GEO/AEO and the entity graph, the design system, media, testing |
| `docs/CONTENT_MODEL.md` | entity types, bilingual rules, sources and provenance, open content conflicts, feature gating, media and the ImageKit import, booking |
| `docs/FEELSTACK.md` | CMS contract, content modes, failure semantics, cache tags, webhook, migration steps |
| `docs/DEPLOYMENT.md` | Blue/Green release model, pre-launch indexing guard, pre-deploy checklist, redirect tables, DNS cutover, CI |
