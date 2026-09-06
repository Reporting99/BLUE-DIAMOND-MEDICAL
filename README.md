# Blue Diamond Medical

Bilingual (English/Arabic) Next.js site for Blue Diamond Medical Clinic — family medicine, walk-in care, and physician-led medical aesthetics in West Springs, Calgary. Canonical domain: `bluediamondmedical.ca`.

**Status:** the full route inventory (81 registered routes — 50 live/public, 31 built but feature-flagged off pending real content) plus templates, the ImageKit and FeelStack adapters, and the test suite are complete. See `docs/ROUTING.md` for the full route table and `docs/CONTENT_MODEL.md` for what's gated and why.

## Prerequisites

- **Node.js 20.19.5** — pinned in `.nvmrc` and `package.json` `engines`. A different major is not supported; the build and the production server are verified only on 20.x.
- **npm** — `package-lock.json` is the lockfile. Do not add a second one (yarn/pnpm).
- No database, cache service or platform SDK is required. The build emits a standalone Node server (`.next/standalone/server.js`) and runs on any Node-compatible host.

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
| `npm run validate:secrets` | Repository secret scan (`scripts/validate-no-secrets.mjs`) |
| `npm run validate` | typecheck + lint + secret scan + build, in order |

## Environment variables

Copy `.env.example` to `.env.local` for development. `.env.example` is the
authoritative list: it documents every variable name, its default, and what the
application does when the variable is unset. Every credential-backed path fails
closed, which is why a build with none of them set is green and safe.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit delivery endpoint (public, inlined into the bundle) |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit public key (public, safe in the browser) |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key — **secret**, server-side only |
| `FEELSTACK_API_URL` / `FEELSTACK_SITE_KEY` / `FEELSTACK_PROJECT_ID` | FeelStack CMS read integration |
| `FEELSTACK_CONTENT_MODE` | `static` \| `hybrid` \| `cms` |
| `FEELSTACK_REVALIDATE_SECRET` | HMAC secret for `POST /api/feelstack/revalidate` — **secret** |
| `FEELSTACK_PREVIEW_SECRET` | Shared secret for the `/api/draft` preview entry — **secret** |
| `FEELSTACK_ADMIN_*`, `BEFORE_AFTER_STAGE_DIR` | `scripts/import-before-after.mjs` only — **secret**, never read at runtime |
| `CONTACT_DELIVERY_PROVIDER` | Contact-form delivery adapter id |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin |
| `SITE_LAUNCHED` | Pre-launch indexing gate — leave unset until launch is authorised |

**Secrets are never committed.** No real `.env` file belongs in this repository —
only `.env.example`, which carries variable names and placeholder values. Real
values are configured through the chosen hosting provider's environment
settings (for this deployment, the per-slot runtime env files described in
`docs/DEPLOYMENT.md`). Anything marked **secret** above must stay server-side:
never move one behind a `NEXT_PUBLIC_` prefix, which would inline it into the
browser bundle. If a credential has ever been committed or shared, rotate it.

## Deployment

The application is deployment-neutral: `npm run build` produces a standalone
Node server and `npm run start` serves it. There is no vendor adapter, edge
runtime or platform-specific configuration in the build. `docs/DEPLOYMENT.md`
describes the Blue/Green release model this project uses, but nothing in the
source depends on it.

## Architecture

- **Next.js 16 App Router**, Server Components by default, Turbopack.
- **Locale routing**: `src/app/[locale]/layout.tsx` is the true root layout (owns `<html lang dir>`); `src/proxy.ts` (Next 16's renamed `middleware`) handles `/ → /en/`, legacy 301s, and rewriting pretty Arabic URLs (e.g. `/ar/الأطباء`) to their canonical English-slug physical routes.
- **Design system**: `docs/UI_UX_FOUNDATION.md` is the source of truth; tokens live in `src/app/globals.css` (Tailwind v4 `@theme`), fonts in `src/lib/fonts.ts` (Fraunces + IBM Plex Sans + IBM Plex Sans Arabic + IBM Plex Mono).
- **UI primitives**: shadcn/ui `base-nova` style, built on `@base-ui/react` (not Radix — components use a `render` prop, not `asChild`).
- **Config layer** (`src/config/`): `site.ts`, `routes.ts` (bilingual route registry — single source for nav/sitemap/hreflang/canonicals), `features.ts` (feature flags), `booking.ts` (centralized external booking URLs), `clinic-hours.ts`, `imagekit.ts`.
- **Media**: `src/components/shared/ImageKitImage.tsx` wraps the official `@imagekit/next` SDK (`ImageKitProvider` in the root layout) and is the only sanctioned way to render a production image; it falls back to a code-generated "Facet Tile" placeholder (never a stock photo) whenever ImageKit isn't configured or an asset isn't `"approved"`.
- **Content**: doctor data in `src/features/doctors/data.ts`, UI copy in `src/i18n/dictionaries/{en,ar}.ts`, page-specific bilingual copy inline per page component, plus a dedicated typed data file per feature module under `src/features/` (medical services, treatments, concerns, technologies, products, legal pages, Health Hub articles).
- **Forms**: `src/features/contact/components/ContactForm.tsx` + `src/app/[locale]/contact/actions.ts` — Zod validation, sanitization, rate limiting, honeypot spam protection, and a delivery adapter that fails closed (no false "sent" confirmations) until a real provider is configured. `ConsultationRequestForm` follows the same pattern, gated off.
- **FeelStack CMS adapter**: `src/lib/feelstack/` — typed, Zod-validated, timeout+retry client; `POST /api/feelstack/revalidate` is HMAC-verified with a route allowlist. Not active without real credentials.
- **Commerce**: none. The catalogue is content only. `shop/cart`, `shop/checkout` and `shop/shipping-returns` exist as routes but `notFound()` behind `shopCheckoutEnabled`, and no payment, cart or shipping provider is integrated.
- **Feature-gated routes**: any route not yet backed by approved content is fully built (registry entry, typed model, template) but calls `notFound()` while its flag in `src/config/features.ts` is off — see `docs/CONTENT_MODEL.md`.

## Testing

```bash
npx playwright install chromium   # first time only
npx playwright test               # all projects
npx playwright test tests/accessibility  # axe-core WCAG scan only
```

## Documentation

Start with these four; everything else is detail they link to.

| Document | Covers |
|---|---|
| `docs/ARCHITECTURE.md` | rendering model, routing, server/client split, SEO + GEO/AEO, entity graph, media, testing |
| `docs/FEELSTACK.md` | CMS contract, content modes, failure semantics, cache tags, webhook, migration steps |
| `docs/DEPLOYMENT.md` | Blue/Green release model, pre-launch indexing guard, pre-deploy checklist, DNS cutover, CI |
| `docs/CONTENT_MODEL.md` | entity types, bilingual rules, approval and provenance, feature gating, how to add content |

Four more carry the supporting detail:

| Document | Covers |
|---|---|
| `docs/ROUTING.md` | EN/AR route tables, the route registry, routing decisions, legacy redirect map |
| `docs/MEDIA.md` | ImageKit setup, the media manifest, import status and image replacement tracking |
| `docs/SEO.md` | schema inventory and the search-intent map |
| `docs/UI_UX_FOUNDATION.md` | design system, tokens, motion rules and visual-continuity record |
