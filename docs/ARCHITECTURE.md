# Architecture

How a Blue Diamond page is built, rendered, routed, styled, and made findable.
Companions: `FEELSTACK.md` (CMS contract), `DEPLOYMENT.md` (release, redirects,
launch), `CONTENT_MODEL.md` (content, provenance, media).

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
content depends on hydration. Verifiable rather than aspirational: build for
production and `curl` any route — every heading, body paragraph, entity link,
breadcrumb and JSON-LD block is in the initial HTML.

## 2. Rendering model

Almost every route is **statically generated** (`generateStaticParams` over the
route registry) and served from the prerender cache. The exceptions are
genuinely request-dependent:

| Route | Why dynamic |
|---|---|
| `[locale]/contact` | reads `searchParams` (product/topic prefill) |
| `[locale]/shop/category/[categoryId]`, `[locale]/shop/concern/[concernId]` | no `generateStaticParams` |
| `[locale]/medical/botox/[conditionId]` | feature-gated subtree |
| `robots.txt`, `sitemap.xml` | request-time `SITE_LAUNCHED` gate |
| `/api/version`, `/api/feelstack/revalidate`, `/llms.txt` | route handlers |

`dynamic = "force-dynamic"` is deliberately **not** used on content pages: it
forces every `fetch` to `no-store`, which would destroy the cache-tag model.
Where build-time prerendering must be avoided, the absence of
`generateStaticParams` is what does it.

`src/app/[locale]/layout.tsx` **is** the root layout — Next 16's
`next/root-params` allows a dynamic segment above it, so there is no
`src/app/layout.tsx`.

## 3. What was taken from Dfeelings, and what was not

Dfeelings was the architectural reference, studied from its live production
build and its JS-free HTML. Three deliberate departures.

| | Dfeelings | Blue Diamond |
|---|---|---|
| Routing | one catch-all `/[lang]/[...slug]` owning every content page | typed entity routes plus the route registry |
| Rendering | dynamic SSR every request (`cache-control: private, no-cache, no-store`) | statically generated; the HTML itself is cached, not only the data |
| Cache | time-based ISR only (`revalidate: 30`), no webhook | tagged fetch cache + HMAC publish webhook |
| Errors | one `try/catch` per call returning `null`; an outage and a missing page are indistinguishable | typed `FeelStackResult`, eight classified codes, outage never becomes a 404 |
| Sitemap | flat list, no `lastmod`, no alternates on the main sitemap | per-URL `xhtml:link` alternates for both locales |
| Schema | Organization/LocalBusiness, WebSite; Service + FAQPage + BreadcrumbList on service pages | the above plus Physician, MedicalWebPage, Product, CollectionPage/ContactPage/AboutPage, breadcrumbs on every non-home page |

Typed routes were kept rather than collapsed into a catch-all because the route
registry is the approved, SEO-audited URL inventory, and because a typed route
can prerender and carry an entity-specific schema a generic resolver cannot. A
generic FeelStack resolver still exists for CMS-owned informational pages.

Two things Dfeelings has that were **not** copied: its blanket error-swallowing
(the single biggest reason `src/lib/feelstack/` was written as a rewrite rather
than a port), and a generic CMS "block" renderer — which Dfeelings does not
actually have either; it hardcodes one component per page key in a large
`switch`. Blue Diamond's `src/templates/*Template.tsx` is the same shape, one
component per `TemplateType`.

Dfeelings' own FeelStack calls target a different, older API surface
(`/posts/slug/:slug`, `/case-studies/published`) than the
`/public/v1/sites/:siteKey/…` endpoints this project uses, so its client could
not be used to confirm the endpoint contract. See `FEELSTACK.md` §1.

## 4. Server / client split

Client Components are interaction only, and each is one of: a form
(`ContactForm`, `ConsultationRequestForm`), a disclosure/navigation control
(`Header`, `MobileNav`, `LanguageSwitch`, `sheet`), an animation wrapper
(`ScrollReveal`, `StatsCounters`), an interactive widget (`BeforeAfterSlider`,
`ConcernExplorer`), or the `error.tsx` boundary (a framework requirement).

None fetches page content. Data is resolved in the Server Component and passed
down already normalized.

`src/lib/feelstack/*` deliberately does **not** import `server-only`: the
modules are pure logic that the contract tests exercise outside Next's build
pipeline, and the one real credential (`FEELSTACK_REVALIDATE_SECRET`) is read
only in the webhook Route Handler, which is never bundled for the client. The
`server-only` package was removed from `package.json` — it was listed but never
imported anywhere.

## 5. Routing

`src/config/routes.ts` is the single registry. Nav, breadcrumbs, canonicals,
hreflang and the sitemap all read from it, so a route cannot appear in one and
not another. Entity routes are *generated* from the content files
(`medicalServices.map(...)`, `doctors.map(...)`), so a slug cannot drift between
content and registry.

**104 route entries**: 74 live and indexed (148 sitemap URLs across both
locales), 16 feature-flagged off, and 14 live but deliberately out of the
sitemap (cart, checkout and similar non-indexable pages). Every entry has a real
page file, a typed bilingual content model, and a template — there is no
"planned but not built" category. Gated routes return a genuine 404, are absent
from nav and sitemap, and never render a "Coming soon" page
(`tests/e2e/gated-routes.spec.ts`).

These counts are derived from `src/config/routes.ts`, not maintained by hand; a
test recomputes the expected sitemap size from the registry so it cannot drift.

| Section | EN root | AR root |
|---|---|---|
| Home | `/` | `/` |
| Medical | `/medical` (+7 services, +uninsured fees) | `/الرعاية-الطبية` |
| Aesthetics | `/aesthetics` (+treatments/concerns/technologies hubs, 22 leaf pages) | `/التجميل-الطبي` |
| Botox | `/botox` | `/بوتوكس` |
| Doctors | `/doctors` (+6 profiles) | `/الأطباء` |
| Patient Resources | `/patient-resources` | `/موارد-المرضى` |
| Health Hub | `/health-hub` | `/المركز-المعرفي` |
| About / Careers / Contact / Book | `/about`, `/careers`, `/contact`, `/book-appointment` | `/من-نحن`, `/الوظائف`, `/تواصل-معنا`, `/حجز-موعد` |
| Shop (catalogue live; cart/checkout gated) | `/shop/...` | `/المتجر/...` |

### Locales

Every one of the 104 routes has both `path.en` and `path.ar` populated —
enforced structurally by `RouteEntry`, which makes `path` a required
`{ en; ar }` object, so no code path can register an English-only route.
Arabic uses real slugs (`/ar/الرعاية-الطبية`), never English slugs under `/ar/`.

The English path is the canonical physical route; `src/proxy.ts` rewrites the
pretty Arabic URL onto it, using a map auto-derived from the same registry — a
route added with both paths is automatically reachable via its Arabic URL with
no extra code. Alternates always point at the address a visitor actually sees.

### Route rules held (and two real bugs they caught)

One authoritative page per doctor; treatments, concerns and technologies stay
separate; medical Botox stays separate from cosmetic Botox; doctors are not
re-published under Medical or Aesthetics; no duplicate pages for the same
intent; no thin or "Coming soon" pages; no redirect chains
(`tests/redirects/legacy-redirects.spec.ts` asserts single-hop for every row).

Auditing legacy redirects against actual content location found two genuine
misroutes: `/terms-and-conditions` and `/privacy-policy` pointed at
`/en/aesthetics`, an unrelated marketing page; and `/primary-care-network`
pointed at the generic Patient Resources hub when the legacy PCN content
actually lives on `/medical/after-hours-care`. Both retargeted.

Two naming ambiguities were resolved rather than guessed. `/en/services` is a
plain redirect alias to the real `/en/medical` hub (`next.config.ts`) rather
than a second indexable page. "Cosmetic Botox" and "Skin Tightening" appear in
the Treatments dropdown by their approved display names but link to the live
pages that already carry their approved content (`/botox` and Radio Frequency
respectively) — their own detail pages stay gated because their only source
content is already published elsewhere.

Redirect tables live in `DEPLOYMENT.md` §5; the source of truth is
`src/lib/seo/legacy-redirects.ts`.

## 6. SEO

Metadata is generated server-side by `generateMetadata` → `getRouteMetadata`
(`src/lib/seo/metadata.ts`), deriving title, description, canonical and
alternates from the route registry. Canonicals are always self-referencing — an
Arabic page is never canonicalized to its English counterpart. Where a page's
description feeds both metadata and JSON-LD it is hoisted to one
`PAGE_DESCRIPTION` constant so the two cannot drift.

- **hreflang** — `en-CA`, `ar-CA`, `x-default` (English) on every page, in both
  page metadata and per-URL sitemap alternates.
- **Sitemap** — generated from the registry, filtered to
  `inSitemap && indexing === "index"` and to enabled features, plus any
  FeelStack-published page with no local route entry once the content mode is
  not `static`. A test recomputes the expected URL count from the registry
  rather than hardcoding it, so it cannot silently drift.
- **Gated routes are noindex by construction** — a test asserts every route
  with `requiresFeature` also has `indexing: "noindex"` and `inSitemap: false`
  in the registry, not merely that today's flag values happen to hide it.
- **robots.txt** — allows all except `/api/` and query-string variants; points
  at the sitemap. Gated entirely by `SITE_LAUNCHED` (see `DEPLOYMENT.md` §3).
- **llms.txt** — matches what is actually live; no unpublished claims.
- **301 redirects** for both legacy domains, exact-match, no chains.

### Structured data

| Type | Where |
|---|---|
| `MedicalClinic` + `Physician` + `WebSite` graph | homepage |
| `Physician` | every doctor profile |
| `MedicalWebPage` | medical service, treatment, concern, technology pages |
| `Product` | product detail pages |
| `CollectionPage` | doctors, medical, aesthetics, shop, health hub, and the three aesthetics listings |
| `ContactPage` / `AboutPage` / `WebPage` | contact / about / remaining informational pages |
| `FAQPage` | homepage and every template with a populated `faqs` field |
| `BreadcrumbList` | every non-home page, alongside a visible trail |

Builders live in `src/components/seo/` (`JsonLd`, `PhysicianSchema`,
`MedicalWebPageSchema`, `PageSchema`, `FaqPageSchema`, `Breadcrumbs`) plus
`src/lib/seo/entity-graph.ts`.

Open Graph images resolve through ImageKit's `og-image` preset via the SDK's
`buildSrc()` when ImageKit is configured, and are omitted entirely when it is
not. Currently wired on the homepage only — extending it to other routes is
mechanical once real per-page imagery exists.

Not yet emitted: `Article` schema, which stays moot while Health Hub has zero
published articles.

## 7. GEO / AEO

The goal is that an answer engine can extract facts and traverse relationships
without executing JavaScript or guessing at card markup.

**Semantic HTML.** One `<h1>` per page, `<main>`, `<article>` for entity
detail, `<section>` per topic, `<nav>` for breadcrumbs, `<dl>` for FAQs, real
`<table>` markup for fee schedules (not styled `<div>` grids). Entity names in
listings are headings, not styled paragraphs.

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

**Every edge is derived, never authored.** The doctor→service relationship is
the *inverse* of `MedicalServiceContent.relatedDoctorIds`, which is itself
source-verified. Reading an approved fact backwards invents nothing. Doctors the
source never links get no such section rather than a filled-in one.

**Omission is a feature.** No `award`, `aggregateRating`, `review`, `alumniOf`,
`medicalLicense`, `priceRange` or `geo` is emitted, because the approved source
does not carry them. Saturday/Sunday hours are omitted rather than published as
closed: `clinic-hours.ts` records them as "not confirmed, closed by default" —
a UI default, not a verified business fact — and wrong hours in local search
misdirect patients. FAQ schema is always generated from the same array the page
renders.

**Answer-first copy.** Service and treatment templates lead with a one-paragraph
summary before any subheading, so a snippet extractor does not have to assemble
the answer from fragments. Homepage FAQs answer immediately rather than
deflecting to a link.

**Consistent NAP.** Name/address/phone appear verbatim in header, footer,
contact page, homepage and the `MedicalClinic` node, and "West Springs,
Calgary, Alberta" appears in body copy, not only in schema — extractable from
rendered text alone.

**Internal linking** uses real `<a>`/`<Link>` elements throughout: listings link
to detail pages, services link to physicians, physicians link back to services,
treatments link to concerns and technologies. No crawl-critical link depends on
JavaScript.

**Search intent.** Each route targets one clear intent, recorded per route in
git history rather than duplicated here. Queries the approved source cannot
support a dedicated page for — vaccinations, women's health, pediatrics, mental
health, driver's/immigration medicals, hair loss as a *concern* — deliberately
have no route: creating one would either duplicate an existing page or assert a
service the source never confirms. No search-volume figures are claimed
anywhere, because no approved data source backs them.

## 8. Design system

`UI_UX_FOUNDATION` was the approved source of truth for this section; a
component contradicting it should be treated as a bug.

### Brand

The mark is a four-facet diamond with a continuous ECG line: precision + life +
calm. The clinic is **one entity** — Medical Care and Medical Aesthetics are
practice areas under one physician-led clinic, not two brands, which is why the
legacy aesthetics site's separate identity is unified here.

Logo rules: never redrawn, recolored outside the approved swatches, stretched,
rotated, cropped, or given gradients/shadows/outlines. Clear space = the height
of the diamond mark on all sides. Minimum width 120px full lock-up, 32px
icon-only, 24px absolute floor. The 4-blue variant is default; 4-grey is for
color-suppressed contexts only. The "facet line" motif (below) is related to
but is **not** the logo.

Voice: composed not clinical-cold; physician-led not sales-led; equally
welcoming in both languages; direct. "Book with Dr. Farhat", not "Unlock your
journey to wellness." The legacy site's "Your Glow On Your Terms" register is
retired.

### Color

| Token | Hex | Role |
|---|---|---|
| `--blue-1` | `#5999BF` | secondary accent, icon strokes, light hover |
| `--blue-2` | `#88B9D7` | tints, section washes, dividers |
| `--blue-3` | `#296589` | primary interactive (buttons, links) |
| `--blue-4` | `#1D5678` | headings, highest-contrast text on white |
| `--grey-1` | `#9F9F9F` | disabled text, faint borders |
| `--grey-2` | `#BEBEBE` | dividers, input borders |
| `--grey-3` | `#707070` | body secondary text |
| `--grey-4` | `#636363` | muted captions |

No gold, pink, purple or champagne anywhere. The only non-brand hues are a
desaturated red for errors and a desaturated green for success, both low-chroma
so they read as clinical status, not alarm or celebration.

Semantic tokens (`--color-primary`, `--color-surface`, `--color-text-primary`,
`--color-error`, …) are defined in `src/app/globals.css` as Tailwind v4
`@theme` entries. **No raw hex in components** — primitives are referenced only
when defining semantic tokens.

Contrast, verified: `--blue-4` on white 8.5:1; `--blue-3` on white 6.2:1;
`--grey-3` on white 4.6:1 (AA at ≥16px). `--blue-1` is **2.9:1 and fails AA for
text** — restricted to large decorative elements, icon strokes ≥3px and non-text
UI. `--grey-1` (2.5:1) is decorative/disabled only.

### Typography

The approved lock-up uses Segoe UI Symbol Bold, a Windows system font with no
reliable web delivery and no Arabic — it lives only inside the static logo
asset, never as live text. A deliberate, documented substitution.

| Role | Face |
|---|---|
| EN display | **Fraunces** (variable) — editorial serif, large sizes only |
| EN body / UI | **IBM Plex Sans** |
| AR display + body | **IBM Plex Sans Arabic** — a genuine sibling of the EN body face, the single biggest lever against Arabic feeling like an afterthought |
| Data (prices, hours, fees) | **IBM Plex Mono** |

All four load via `next/font/google` with `display: swap`, subset per locale.

EN scale: display-1 56/1.08 (clamp 36/1.15), display-2 40/1.15, h3 28/1.25, h4
20/1.35, body-lg 18/1.6, body 16/1.6, caption 14/1.5, mono-data 14/1.4.

AR scale runs larger and looser for equivalent readability: display-1 48/1.35
(clamp 32/1.4), display-2 36/1.4, h3 26/1.5, body 17/1.85, caption 14/1.7. No
Arabic weight below 400 for body text. Numerals stay Western/Latin digits in
both locales so phone numbers and prices never reverse — a deliberate choice,
flagged for client confirmation in `CONTENT_MODEL.md`.

### Layout

4px-based spacing scale. Section rhythm 96px desktop / 56px mobile. Container
`max-width: 1280px`, gutters 24/16px. Grid 12/8/4 columns. Breakpoints
`sm 375 · md 768 · lg 1024 · xl 1280 · 2xl 1440`.

Radius `sm 4 · md 8 · lg 12 · full 999` — pills for status chips only, never
primary CTAs. Shadows are minimal and single-purpose: resting, hover, focus
ring. No glassmorphism, no glow, no shadow-as-decoration.

Image ratios: hero 16:9–21:9 desktop / 4:5 mobile (a separate composition, not
a crop); doctor portrait 4:5; service 3:2; concern 1:1; technology 4:3; product
1:1; article 16:9; OG 1.91:1; before/after matched pairs 3:4.

The pattern is editorial and asymmetric — 7/5 or 8/4 splits, alternating
full-bleed bands and contained text, mixed-scale grids rather than a uniform
repeated card grid. Numbered steps appear only where the content is a genuine
sequence. Explicitly rejected: warm-cream/terracotta "AI editorial" default,
near-black + neon, gold/pink spa palettes, neumorphism, uniform card grids, and
a repeated diamond icon beside every heading.

### The facet line

A single diagonal edge derived from one facet seam of the logo (not the whole
diamond, not the heartbeat), at 8–12°, in `--blue-2`/`--blue-1` at low weight:
hero framing (one clipped corner), section-seam dividers, a one-corner card
hover accent, and the abstract branded tile used where no photo exists. It never
becomes a repeated icon, a 3D object, a glow loop, or a stand-in for content.

### Section seams

`src/components/layout/SectionTransition.tsx` removes hard horizontal color
lines between sections: one `aria-hidden` div, `height: clamp(3.5rem, 6vw +
2rem, 11.25rem)`, a `linear-gradient(180deg, from, to)`, and
`margin-block: -1px` to close subpixel gaps. No JavaScript, no images, no
filters. Placed between adjacent sections with different background tokens,
omitted where the background does not change.

The CTA→footer boundary uses a dedicated 4-stop gradient
(`--blue-4 → #173f55 → --surface-dark`) because a 2-stop gradient banded across
that distance; the middle stop is a genuine intermediate tone chosen by eye, not
a mathematical midpoint. Every template and page carries the footer seam.

### RTL

`dir` is set at `<html>` per locale via the `[locale]` layout, never toggled by
a client script. Full mirroring: nav order, breadcrumb arrows, form field order,
chevrons, card order, drawer direction. Logical properties (`text-start`/`ms-`)
throughout, never physical `left`/`right`. The logo lock-up stays internally LTR
but moves to the trailing edge. Numerals, phone numbers and prices stay in LTR
runs inside RTL paragraphs.

### Accessibility

WCAG 2.2 AA baseline: 4.5:1 body text, 3:1 large text and UI. Sequential
headings, never skipped for styling. Locale-specific alt text on every image;
decorative facet elements `aria-hidden`. Visible labels, never placeholder-only;
inline **and** summary errors, announced via `role="alert"`; errors never
signalled by color alone. Touch targets ≥24×24 CSS px with a 44px practical
floor for primary mobile actions and 8px minimum gaps. Tested at 200% zoom.

Every custom component implements the relevant ARIA APG pattern via Base UI
primitives rather than a bespoke `onClick`. Focus rings are never suppressed. A
skip-to-content link is the first focusable element.

Desktop mega-menu opens on click **and** keyboard, never hover-only; `Escape`
closes and restores focus; arrows move within, `Tab` exits forward. The mobile
drawer opens from the trailing edge, traps focus, returns it on close, and
closes on button, `Escape`, backdrop tap and route change. "Book Appointment"
stays a persistent sticky CTA on mobile, never buried in an accordion.

`prefers-reduced-motion: reduce` collapses every animation to instant. No motion
is load-bearing. Animation budget: transforms and opacity only, one orchestrated
entrance per section, hover interactions ≤200ms. No autoplay background video
anywhere. Only the hero is a large above-the-fold image; everything else
lazy-loads.

Verified by `tests/accessibility/` (axe-core, plus a reduced-motion suite).

## 9. Caching

Tagged fetch cache with targeted invalidation, no global purges. Producer, owner
and invalidation event for every tag: `FEELSTACK.md` §5.

## 10. Media

ImageKit is the only permitted remote host — `next.config.ts` derives
`remotePatterns` from the endpoint and stays empty if unset, so there is no
wildcard image policy. All images go through `ImageKitImage`, enforced by
`tests/unit/image-usage.spec.ts`, which also forbids direct `next/image`
imports, local `/images/` paths and unapproved remote hosts.

Every asset carries an approval `status`; only `"approved"` renders the real CDN
path, everything else renders the FacetTile placeholder. Details, manifest and
import procedure: `CONTENT_MODEL.md` §6.

## 11. Testing

`npm run validate` (typecheck + lint + build) plus the Playwright suite under
`tests/`: `e2e`, `accessibility` (axe-core, reduced motion), `seo` (route
registry, sitemap, canonical, hreflang, broken links), `redirects` (one per
legacy row), `contracts` (FeelStack schemas + failure classification), `cache`
(tag coverage), `security` (webhook, booking allowlist), and `unit` (image
usage, catalogue integrity, pre-launch gate, deployment ops).
