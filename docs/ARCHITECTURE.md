# Architecture

How a Blue Diamond page is rendered, where its data comes from, and how its SEO
signals are produced. Companion documents: `FEELSTACK.md` (CMS contract),
`DEPLOYMENT.md` (release model), `CONTENT_MODEL.md` (content types and
approval).

---

## 1. The principle

```
FeelStack (or local content)
      ↓  server data layer            src/lib/feelstack/page-resolver.ts
      ↓  Server Component / SSG       src/app/[locale]/**/page.tsx
      ↓  full HTML                    content, headings, links, JSON-LD
      ↓  Client Components            interaction only
```

**No SEO-critical content is ever fetched in the browser.** Nothing in
`src/app` calls FeelStack from a Client Component, and no page's primary
content depends on hydration. This is verifiable rather than aspirational: run
a production build and `curl` any route — every heading, body paragraph, entity
link, breadcrumb and JSON-LD block is in the initial HTML.

## 2. Rendering model

Almost every route is **statically generated** (`generateStaticParams` over the
route registry), then served from the prerender cache. The exceptions are
genuinely request-dependent:

| Route | Why dynamic |
|---|---|
| `[locale]/contact` | reads `searchParams` (product/topic prefill) |
| `[locale]/shop/category/[categoryId]`, `[locale]/shop/concern/[concernId]` | no `generateStaticParams` |
| `[locale]/medical/botox/[conditionId]` | feature-gated subtree |
| `robots.txt`, `sitemap.xml` | request-time `SITE_LAUNCHED` gate (`DEPLOYMENT.md` §3) |
| `/api/version`, `/api/feelstack/revalidate`, `/llms.txt` | route handlers |

`dynamic = "force-dynamic"` is deliberately **not** used on content pages: it
forces every `fetch` to `no-store`, which would destroy the cache-tag model.
Where build-time prerendering must be avoided, the absence of
`generateStaticParams` is what does it.

### How this differs from Dfeelings

Dfeelings was the architectural reference. Blue Diamond follows its principles
and departs from it in three deliberate places.

| | Dfeelings | Blue Diamond |
|---|---|---|
| Routing | one catch-all `/[lang]/[...slug]` owning every content page | typed entity routes (`/doctors/[doctorId]`, `/medical/[serviceId]`, …) plus the route registry |
| Rendering | dynamic SSR on every request; `cache-control: private, no-cache, no-store` | statically generated; HTML itself is cached, not only the data |
| Cache | time-based ISR only (`revalidate: 30`), no webhook | tagged fetch cache + HMAC-verified publish webhook |
| Error handling | one `try/catch` per call returning `null`; an outage and a missing page are indistinguishable | typed `FeelStackResult`, eight classified codes, outage never becomes a 404 |
| Sitemap | flat list, no `lastmod`, no alternates on the main sitemap | per-URL `xhtml:link` alternates for both locales |
| Schema | `Organization`/`LocalBusiness`, `WebSite`; `Service` + `FAQPage` + `BreadcrumbList` on service pages | the above plus `Physician`, `MedicalWebPage`, `Product`, `CollectionPage`/`ContactPage`/`AboutPage`, breadcrumbs on every non-home page |

Typed routes were kept rather than collapsed into a catch-all because the route
registry is the approved, SEO-audited URL inventory, and because a typed route
can prerender and carry an entity-specific schema that a generic resolver
cannot. A generic FeelStack page resolver still exists for CMS-owned
informational pages.

## 3. Server / client split

Client Components are interaction only, and each is one of: a form
(`ContactForm`, `ConsultationRequestForm`), a disclosure/navigation control
(`Header`, `MobileNav`, `LanguageSwitch`, `sheet`), an animation wrapper
(`ScrollReveal`, `StatsCounters`), an interactive widget (`BeforeAfterSlider`,
`ConcernExplorer`), or the `error.tsx` boundary (a framework requirement).

None of them fetches page content. Data is resolved in the Server Component and
passed down already-normalized.

`src/lib/feelstack/*` deliberately does **not** import `server-only`: the
modules are pure logic that the contract tests exercise outside Next's build
pipeline, and the one real credential (`FEELSTACK_REVALIDATE_SECRET`) is read
only in the webhook Route Handler, which is never bundled for the client. The
`server-only` package was removed from `package.json` — it was listed but never
imported anywhere.

## 4. Routing and locales

`src/config/routes.ts` is the single registry. Nav, breadcrumbs, canonicals,
hreflang and the sitemap all read from it, so a route cannot appear in one and
not another.

Every route has real Arabic slugs (`/ar/الرعاية-الطبية`), not English slugs
under `/ar/`. The English path is the canonical physical route; `src/proxy.ts`
rewrites the pretty Arabic URL onto it. Alternates always point at the address
a visitor actually sees. Full table: `EN_AR_ROUTE_MAP.md`.

Legacy URLs from both old domains 301 via `src/lib/seo/legacy-redirects.ts`
(`REDIRECT_MAP.md`).

## 5. SEO

Every indexable page generates metadata server-side through `generateMetadata`
→ `getRouteMetadata` (`src/lib/seo/metadata.ts`), which derives title,
description, canonical and alternates from the route registry. Canonicals are
always self-referencing — an Arabic page is never canonicalized to its English
counterpart.

Where a page's description is used by both `generateMetadata` and its JSON-LD,
it is hoisted to a single `PAGE_DESCRIPTION` constant so the two cannot drift.

The sitemap emits both locales with `xhtml:link` alternates per URL, filters to
`indexing === "index"` routes whose feature flag is on, and appends
FeelStack-published pages that have no local route entry once the content mode
is not `static`. Feature-gated routes are excluded by construction, so the
sitemap can never advertise a page that 404s.

Indexability is gated by `SITE_LAUNCHED` at three layers — see `DEPLOYMENT.md`
§3.

## 6. GEO / AEO

The goal is that an answer engine can extract facts and traverse relationships
without executing JavaScript or guessing at card markup.

**Semantic HTML.** One `<h1>` per page, `<main>`, `<article>` for entity
detail, `<section>` per topic, `<nav>` for breadcrumbs, `<dl>` for FAQs. Entity
names in listings are headings, not styled paragraphs.

**One entity graph, not per-page copies.** A single `MedicalClinic` node is
declared once with a stable `@id` and referenced everywhere else. Physician
nodes carry the same `@id` on the homepage and on the doctor's own profile, so
both describe one entity.

```
MedicalClinic ──employee──▶ Physician ──worksFor──▶ MedicalClinic
      │                          │
      ├──availableService──▶ MedicalProcedure ◀──knowsAbout──┘
      ├──areaServed──▶ City (Calgary, AB)
      └──openingHoursSpecification
```

Builders live in `src/components/seo/` (`JsonLd`, `PhysicianSchema`,
`MedicalWebPageSchema`, `PageSchema`, `FaqPageSchema`, `Breadcrumbs`) and
`src/lib/seo/entity-graph.ts`.

**Every edge is derived, never authored.** The doctor→service relationship is
the *inverse* of `MedicalServiceContent.relatedDoctorIds`, which is itself
source-verified. Reading an approved fact backwards invents nothing. Doctors the
source never links get no such section rather than a filled-in one.

**Omission is a feature.** No `award`, `aggregateRating`, `review`, `alumniOf`,
`medicalLicense`, `priceRange` or `geo` is emitted, because the approved source
does not carry them. Saturday/Sunday hours are omitted rather than published as
closed: `clinic-hours.ts` records them as "not confirmed, closed by default" —
a UI default, not a verified business fact — and wrong hours in local search
misdirect patients. FAQ schema is generated from the same array the page
renders, never a separate list.

**Internal linking** uses real `<a>`/`<Link>` elements throughout: listings link
to detail pages, services link to physicians, physicians link back to services,
treatments link to concerns and technologies. No crawl-critical link depends on
JavaScript.

## 7. Caching

Tagged fetch cache with targeted invalidation; no global purges. Producer,
owner and invalidation event for every tag are described in `FEELSTACK.md` §5.

## 8. Media

ImageKit is the only permitted remote image host (`next.config.ts`
`remotePatterns` is derived from the endpoint, empty if unset — no wildcard).
All images go through `ImageKitImage`, enforced by
`tests/unit/image-usage.spec.ts`, which also forbids direct `next/image`
imports, local `/images/` paths, and unapproved remote hosts.

Every asset carries an approval `status`; only `"approved"` renders the real
CDN path, everything else renders the FacetTile placeholder. Alt text comes
from verified bilingual content; decorative images use `alt=""`.

## 9. Testing

`npm run validate` (typecheck + lint + build) and the Playwright suite under
`tests/`: `e2e`, `accessibility` (axe-core), `seo` (route registry, sitemap,
canonical, hreflang, broken links), `redirects` (one per legacy row),
`contracts` (FeelStack schemas + failure classification), `cache` (tag
coverage), `security` (webhook, booking allowlist), and `unit` (static analysis
of image usage, catalogue integrity, pre-launch gate, deployment ops).
