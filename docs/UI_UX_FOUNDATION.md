# Blue Diamond Medical — UI/UX Foundation

Status: **Approved for implementation**. This document is the single source of truth for visual and interaction decisions. Any component that contradicts it should be treated as a bug.

Sources consulted: `BLUE DIAMOND LOGO DOCUMENT[10519].pdf` (Decca Design Inc., official brand doc), `Blue-Diamond-Medical-Website-Content-Extraction_1.docx` (Dfeelings content extraction of the two live sites), and direct instructions in the build brief. See `docs/CONTENT_MODEL.md`.

---

## 1. Brand Interpretation

The Blue Diamond Medical mark is a four-facet diamond with a single continuous heartbeat/ECG line running through its vertical axis, available in a 4-tone blue variant and a 4-tone grey variant. It reads as: **precision (facets, geometric construction) + life/vitality (the heartbeat) + calm (cool blue family, no warm/alarm colors)**.

The clinic is one entity, not two. Medical Care and Medical Aesthetics are *practice areas under one physician-led clinic*, not separate brands — the same doctors, the same address family (main clinic + one satellite for Elite iQ™), the same trust signals. Every place the site currently implies two separate businesses (the legacy `bluediamondmedicalaesthetics.ca` site, its own copyright line and separate phone number) is being intentionally unified under `bluediamondmedical.ca` with one navigation, one design system, one voice, and consistent contact info per section (medical vs. aesthetics phone numbers differ in the source data and are kept distinct only where the underlying phone line is genuinely separate — see `docs/CONTENT_MODEL.md`).

### 1.1 Logo Protection Rules

- The logo (diamond + heartbeat) is never redrawn, recolored outside the 8 approved swatches, stretched, rotated, cropped, given a gradient, drop shadow, outline, or additional elements.
- Minimum clear space around the logo = the height of the diamond mark itself, on all four sides.
- Minimum digital width: 120px for the full lock-up, 32px for the icon-only mark (header/mobile), 24px absolute floor (favicon-adjacent contexts only).
- Approved backgrounds: white, `--surface` near-white, brand primary blue (reversed/white lock-up only), photography with verified contrast.
- The 4-blue variant is the default; the 4-grey variant is for contexts where color must be suppressed (print, single-color print, watermarks) — never used interchangeably for decoration.
- The signature "facet line" motif (§21) is visually related but is explicitly **not** the logo and must never be presented as a logo variant.

### 1.2 Brand Voice

**We are:**
- **Composed, not clinical-cold** — calm confidence, plain language over jargon.
- **Physician-led, not sales-led** — describe what a treatment or service *is* and *involves*; never oversell outcomes.
- **Welcoming in two languages equally** — Arabic content is authored with the same care as English, not translated as an afterthought.
- **Direct** — "Book with Dr. Farhat" not "Unlock your journey to wellness."

**We don't sound like:** a beauty spa ("Your Glow On Your Terms" from the legacy site is a tone we retire), a hospital intake form, or a template health-tech SaaS.

**Sample rewrite** — Before (legacy site): *"Experience the best in beauty and rejuvenation without delay."* After: *"Physician-led aesthetic treatments, delivered in the same clinic that manages your family's health."*

---

## 2. Color Tokens

Exact values from the approved logo document (RGB confirmed, HEX derived):

| Token | Hex | RGB | Role |
|---|---|---|---|
| `--blue-1` | `#5999BF` | 89,153,191 | Secondary accent, icon strokes, light hover |
| `--blue-2` | `#88B9D7` | 136,185,215 | Tints, section washes, dividers |
| `--blue-3` | `#296589` | 41,101,137 | Primary interactive (buttons, links) |
| `--blue-4` | `#1D5678` | 29,86,120 | Headings, highest-contrast text-on-white |
| `--grey-1` | `#9F9F9F` | 159,159,159 | Disabled text, faint borders |
| `--grey-2` | `#BEBEBE` | 190,190,190 | Dividers, input borders |
| `--grey-3` | `#707070` | 112,112,112 | Body secondary text, wordmark alt color |
| `--grey-4` | `#636363` | 99,99,99 | Muted captions |

No gold, pink, purple, champagne, or beauty-spa hues anywhere in the system. The only non-brand hues are functional: a desaturated red for errors and a desaturated green for success, both kept low-chroma so they read as clinical status colors, not alarm/celebration colors.

### 2.1 Semantic Tokens (Tailwind v4 `@theme`, OKLCH-safe HSL triplets so `/opacity` modifiers work)

```
--color-primary:            var(--blue-3)   /* #296589 */
--color-primary-hover:      var(--blue-4)   /* #1D5678 */
--color-primary-foreground: #FFFFFF
--color-secondary:          var(--blue-1)   /* #5999BF */
--color-accent:             var(--blue-2)   /* #88B9D7, tints only */
--color-background:         #FFFFFF
--color-surface:            #F5F8FA         /* blue-2 tinted at ~5%, not generic cream */
--color-surface-muted:      #EEF3F6
--color-text-primary:       var(--blue-4)   /* headings */
--color-text-body:          #2B2E33         /* nearly-black, not pure #000 */
--color-text-secondary:     var(--grey-3)
--color-border:             var(--grey-2)
--color-focus:               var(--blue-3)  /* 3px focus ring, see §12 */
--color-error:               #B3261E
--color-error-surface:       #FBEAE9
--color-success:             #2E6B4F
--color-success-surface:     #EAF3EE
```

Rule: **no raw hex in components.** Every color reference goes through a semantic token; primitives (`--blue-1..4`, `--grey-1..4`) are only referenced when defining semantic tokens, never directly in a `.tsx` file.

### 2.2 Contrast Verification

- `--blue-4` (#1D5678) on white: 8.5:1 — safe for all text sizes.
- `--blue-3` (#296589) on white: 6.2:1 — safe for body text and buttons.
- `--blue-1` (#5999BF) on white: 2.9:1 — **fails AA for text**; restricted to large decorative elements, icon strokes ≥3px, and non-text UI (dividers, tints). Never used for small text on white, correcting a failure mode the brief explicitly flags.
- `--grey-3` (#707070) on white: 4.6:1 — passes AA for body text at ≥16px.
- `--grey-1` (#9F9F9F) on white: 2.5:1 — decorative/disabled only, never body text.

---

## 3. Typography

### 3.1 The Wordmark Font Is Not a Web Body Font

The approved lock-up uses **Segoe UI Symbol – Bold** for "BLUE DIAMOND MEDICAL." Segoe UI Symbol is a Windows system symbol font with no reliable cross-platform web delivery and no Arabic support — it is used **only** inside the static logo asset itself, never set as live text. This substitution is a deliberate, documented decision, not a drift from brand.

### 3.2 Selected Type System

| Role | Typeface | Why |
|---|---|---|
| EN Display (H1/H2, pull quotes) | **Fraunces** (variable) | Warm, editorial serif with quiet character — signals "premium publication," not "beauty spa" or "generic SaaS." Used restrained: large sizes only. |
| EN Body / UI | **IBM Plex Sans** | Professional, highly legible, distinct from the ubiquitous Inter default. Same superfamily as the Arabic face below. |
| AR Display + Body | **IBM Plex Sans Arabic** | Genuinely matched sibling of the EN body face (same foundry, same design system) — Arabic headings use its Bold/SemiBold weight rather than forcing a mismatched serif that has no Arabic counterpart. This is the single biggest lever against Arabic feeling like an afterthought. |
| Data / prices / hours | **IBM Plex Mono** | Small, restrained use in pricing tables, fee schedules, hours — gives a "clinical precision" texture that doubles as the utility face called for in the process. |

All four are Google Fonts, loaded via `next/font/google` with `display: swap`, subset per locale (`latin` for EN faces, `arabic` for the AR face) to avoid layout shift and unnecessary payload.

### 3.3 Type Scale (EN)

| Token | Size / Line-height | Use |
|---|---|---|
| `--text-display-1` | 56/1.08 (clamp to 36/1.15 mobile) | Homepage hero H1 |
| `--text-display-2` | 40/1.15 (clamp to 30/1.2) | Section H2 |
| `--text-h3` | 28/1.25 | Card / subsection headings |
| `--text-h4` | 20/1.35 | Component headings |
| `--text-body-lg` | 18/1.6 | Lead paragraphs |
| `--text-body` | 16/1.6 | Default body |
| `--text-caption` | 14/1.5 | Captions, meta |
| `--text-mono-data` | 14/1.4, IBM Plex Mono | Prices, hours, fee tables |

### 3.4 Type Scale (AR)

Arabic requires taller line-heights and slightly larger body size for equivalent readability (denser letterforms, diacritics headroom):

| Token | Size / Line-height |
|---|---|
| `--text-display-1-ar` | 48/1.35 (clamp to 32/1.4 mobile) |
| `--text-display-2-ar` | 36/1.4 |
| `--text-h3-ar` | 26/1.5 |
| `--text-body-ar` | 17/1.85 |
| `--text-caption-ar` | 14/1.7 |

Rules: no Arabic weight below Regular (400) is used for body text (thin Arabic weights break legibility at screen sizes); numerals in Arabic pages stay Western/Latin digits (٠١٢ are not used) to match phone numbers, prices, and dates consistently across both locales — a deliberate, documented choice, not an oversight.

---

## 4. Spacing, Grid, Containers, Breakpoints

- Spacing scale (rem, 4px base): `1=4px 2=8px 3=12px 4=16px 5=20px 6=24px 8=32px 10=40px 12=48px 16=64px 20=80px 24=96px 32=128px`.
- Section vertical rhythm: 96px desktop / 56px mobile between major sections (`--space-section` / `--space-section-mobile`), never uniform card padding used as a stand-in for section rhythm.
- Container: `max-width: 1280px`, gutter 24px desktop / 16px mobile. Editorial sections may break the container intentionally (full-bleed image bands) — this is a layout *choice*, documented per template, not an accident.
- Grid: 12-column desktop, 8-column tablet, 4-column mobile. Hero and feature sections default to an asymmetric split (7/5 or 8/4), not centered — see §22.
- Breakpoints: `sm 375` `md 768` `lg 1024` `xl 1280` `2xl 1440`, tested per §37 of the master brief.

---

## 5. Image Ratios

| Role | Ratio | Notes |
|---|---|---|
| Hero desktop | 16:9 to 21:9 (art-directed) | Never a stretched square crop |
| Hero mobile | 4:5 | Separate composition, not a crop of desktop |
| Doctor portrait | 4:5 | Or abstract facet tile at same ratio when no photo (see §8) |
| Service / treatment cover | 3:2 | |
| Concern tile | 1:1 | |
| Technology image | 4:3 | |
| Product card | 1:1 | |
| Article cover | 16:9 | |
| Open Graph | 1.91:1 | |
| Before/after (when approved) | matched pair, 3:4 | Never displayed until approved media exists |

---

## 6. Radius & Shadow Rules

- Radius scale: `--radius-sm 4px` `--radius-md 8px` `--radius-lg 12px` `--radius-full 999px` (pills only for status/tag chips, never for primary CTAs — avoids the "beauty template" pill-button cliché the brief calls out).
- Shadows are minimal and single-purpose: `--shadow-sm` (resting card, 0 1px 2px), `--shadow-md` (hover/raised, 0 4px 12px), `--shadow-focus` (focus ring, see §12). No glassmorphism, no layered/glow shadows, no shadow-as-decoration.

---

## 7. Component States

Buttons, inputs, selects, cards, accordions, tabs all define, at minimum:

- **Default** — token colors above.
- **Hover** — background/border shifts one step toward `--blue-4`; 150–200ms `ease-out` transition; never an instant 0ms swap.
- **Focus-visible** — 3px `--color-focus` outline, 2px offset, never removed, never color-only (also a shape/position change on inputs).
- **Active** — background one step darker than hover, no transform/scale tricks that shift layout.
- **Disabled** — `--grey-1` text/border, `not-allowed` cursor, `aria-disabled`.
- **Loading** — inline spinner or skeleton, never a frozen button with no feedback; button text swaps to a progress state, width does not jump.
- **Error** — `--color-error` border + icon + text message adjacent to the field (never color alone) + `role="alert"` announcement; a focusable error summary at the top of longer forms links to each invalid field (per UX research, §31).
- **Success** — `--color-success` surface + icon + text, same non-color-alone rule.

---

## 8. RTL / LTR Behavior

- `dir="rtl"` / `dir="ltr"` set at the `<html>` level per locale via the `[locale]` segment layout — never toggled by a client script after hydration.
- Full mirroring: nav order, breadcrumb arrows, form field order, icon direction (chevrons, arrows), card image/text order, carousel controls, drawer slide-in direction.
- Logo lock-up stays LTR internally (it is a fixed asset) but its position in the header mirrors to the trailing edge in RTL, matching where a logo conventionally sits.
- Numerals, phone numbers, and prices stay LTR-run even inside RTL paragraphs (`dir="ltr"` inline span) so `825 413 1113` and `$150` never reverse digit order.
- Text alignment mirrors (`text-start`/`text-end` logical properties are used throughout instead of physical `text-left`/`text-right`).

---

## 9. Mobile Navigation

- Full-screen overlay drawer, opens from the trailing edge (right in LTR, left in RTL), closes on: explicit close button, `Escape`, backdrop tap, and route change.
- Focus is trapped inside the open drawer and returns to the trigger button on close.
- Top-level groups (Medical Care / Medical Aesthetics / Botox / Doctors / Patient Resources / Health Hub / Shop-if-enabled / About / Contact) are collapsible accordions, not a second-level flyout, to keep thumb reach reasonable.
- "Book Appointment" stays visible as a persistent sticky CTA bar on mobile, separate from the collapsible nav — it must never be buried inside an accordion.

## 10. Mega-Menu Behavior (Desktop)

- Trigger on click **and** keyboard `Enter`/`Space` — never hover-only (WCAG + touch-parity requirement from the brief).
- `Escape` closes and returns focus to the trigger; arrow keys move between menu items; `Tab` exits the menu forward in logical order.
- Menu content is grouped by intent (service type, not alphabetically), with Medical Care and Medical Aesthetics visually separated inside the "Care" mega-menu so the distinction is legible in under two seconds.
- Panel width and column count declared per breakpoint; content that doesn't fit truncates gracefully with a "View all" link — never silently clips.

---

## 11. Accessibility Requirements (WCAG 2.2 AA baseline)

- 4.5:1 minimum contrast for body text, 3:1 for large text/UI components (verified per §2.2).
- All interactive elements keyboard-reachable in visual order; no keyboard traps.
- All images carry locale-specific alt text (never a shared EN/AR alt string); decorative facet-motif elements are `aria-hidden`.
- Headings are sequential (h1→h2→h3, never skipped for styling).
- Forms: visible labels (never placeholder-only), inline + summary errors (§7), success/error announced via `aria-live`/`role="alert"`.
- Touch targets ≥24×24 CSS px minimum (WCAG 2.2), with a practical floor of 44px for primary mobile actions (booking CTA, nav triggers) and 8px minimum gap between adjacent targets.
- 200% zoom and text-only reflow tested with no clipped/overlapping content.

## 12. Keyboard Navigation

- Every custom component (mega-menu, accordion, tabs, dialog, drawer) implements the relevant ARIA APG pattern via shadcn/Radix primitives rather than a bespoke `onClick`-only implementation (§ ui-styling application below).
- Visible focus ring never suppressed (`outline: none` without a replacement is a lint-blocked pattern in this codebase).
- Skip-to-content link is the first focusable element on every page.

## 13. Reduced Motion

- Every animation is wrapped so `prefers-reduced-motion: reduce` collapses it to an instant (or near-instant, ≤50ms opacity) state — entrances, mega-menu transitions, carousel movement, hover reveals alike.
- No motion is load-bearing: content is fully usable and comprehensible with all motion removed.

## 14. Visual-Effect Performance Limits

- No autoplay background video anywhere, mobile or desktop.
- Hero images are the only "large" images above the fold; everything else below the fold lazy-loads.
- Blur-up placeholders only where a real ImageKit LQIP is available — never a fake blur on a missing image (that would misrepresent placeholder-vs-real).
- Animation budget: transforms/opacity only (no animating layout properties like `width`/`top`), max one orchestrated entrance per section, hover micro-interactions ≤200ms.

---

## 15. Selected Premium Medical Direction

**Pattern:** Editorial, asymmetric, generous white space, alternating full-bleed image bands and contained text sections. Not a hero-then-uniform-3-card-grid template.

**Palette in use:** Blue-4 for authority (headings), Blue-3 for action (buttons/links), Blue-1/Blue-2 reserved for tints, icon strokes, and the facet motif — never for small text.

**Typography in use:** Fraunces (EN display, restrained) + IBM Plex Sans (EN body) + IBM Plex Sans Arabic (AR display+body, matched family) + IBM Plex Mono (data).

**Layout concept:** Hero and major feature sections use a 7/5 or 8/4 asymmetric split rather than centered stacks. List content (treatments, concerns, doctors) uses a mixed-scale editorial grid — one or two larger feature tiles plus a denser row of smaller entries — instead of a uniform repeated card grid. Numbered steps are used **only** where the content is a genuine sequence (e.g., "What happens at a Botox consultation," a real 1→2→3→4 process) — never as decoration on non-sequential content like a treatments list.

## 16. Rejected Design Directions (and why)

| Direction | Why rejected |
|---|---|
| Warm cream background + high-contrast serif + terracotta accent | The generic "AI editorial" default (per frontend-design skill's own calibration list) — not derived from this brand's cool blue/grey identity. |
| Near-black background + single neon accent | Reads as tech/SaaS or nightlife, wrong register for a family clinic. |
| Gold/pink/champagne beauty-spa palette | Explicitly excluded by brief; also splits Medical from Aesthetics into two incompatible visual languages. |
| Neumorphism / soft-UI (initial ui-ux-pro-max style suggestion) | Its own accessibility-risk flag (contrast-dependent embossed surfaces) conflicts with the AA baseline; also trends "wellness app," not "physician-led clinic." Typography suggestion from the same search (Figtree/Noto Sans) was partially reused — see Skill Application Record. |
| Uniform rounded-card grid for every list (treatments, doctors, articles) | Explicitly excluded by brief as templated; replaced with the mixed-scale editorial grid in §15. |
| Repeated heartbeat/diamond icon beside every heading | Explicitly excluded; the facet motif (§21) appears structurally, not decoratively, and never beside headings. |

## 17. Signature Visual Element — "The Facet Line"

A single diagonal edge derived from one facet seam of the logo's diamond (not the whole diamond, not the heartbeat line) — a shallow-angle (8–12°) hairline or clipped-corner cut, always in `--blue-2` or `--blue-1` at low visual weight, applied to:

- Hero image framing (one clipped corner, not a full diamond crop).
- Section-seam dividers between alternating light/tinted sections (a single 1px diagonal stroke, not a repeated zigzag).
- Card hover states (a small triangular corner accent that animates in on hover/focus, out on leave — one corner only, never all four).
- The abstract branded tile used in place of a real doctor photo (§8/§18): two or three flat blue tones meeting at diagonal seams, echoing the logo's facet construction without reproducing it.

It never becomes a repeated icon beside headings, a large 3D object, a glow/animation loop, or a stand-in for real content.

---

## 18. Doctor Image Rules (binding)

- Dr. Saeed: no photo, ever. Abstract facet tile only.
- Dr. Gwea: abstract facet tile until a real photo is supplied; tracked in `docs/MEDIA.md` as pending.
- Dr. Bakare, Dr. Hamdi: intended to use approved ImageKit photos "temporarily," but no live ImageKit account/asset exists yet in this build — both render the abstract facet tile today, status `pending` in the media manifest, ready to flip to `approved` the moment real assets are uploaded. No stock or generated face is ever substituted.
- Dr. Farhat, Dr. Omonijo: same `pending` treatment — no approved photography has been supplied.
- All doctor cards render at identical dimensions whether photographed or tiled, so nothing shifts layout when real photos are added later.

---

## Skill Application Record

| Skill | Invoked | Decision it influenced | Rule carried into implementation |
|---|---|---|---|
| `brand` (ui-ux-pro-max) | Yes — logo-usage-rules.md and voice-framework.md read directly | Logo clear-space/minimum-size/approved-background rules (§1.1); brand voice traits and sample rewrite (§1.2) | Clear space = mark height; 120px min digital width; voice = composed/physician-led/direct, "Your Glow On Your Terms" tone retired |
| `design-system` (ui-ux-pro-max) | Yes — tailwind-integration.md read directly | Three-layer token architecture (primitive→semantic→component); HSL-space CSS variables so Tailwind opacity modifiers work | `--blue-*`/`--grey-*` primitives feed semantic tokens (§2.1) consumed only through Tailwind theme, never raw hex in components |
| `ui-ux-pro-max` | Yes — `--design-system` search run + domain searches (`ux`: mega-menu/nav, RTL/layout, forms, touch targets; `nextjs` stack) | Style output (Neumorphism/cyan-green) explicitly rejected (§16) but its typography lead (healthcare-mood Figtree/Noto Sans) informed the *decision to seek a matched EN/AR type superfamily*, resolved instead as Fraunces+IBM Plex (closer fit + real Arabic sibling). Nav/form/touch-target guidance adopted directly. | Keyboard-accessible mega-menu (§10), focusable error-summary pattern (§7/§11), 24px min touch target + 8px gap, Next.js 16: Server Components by default, client components pushed to leaves |
| `frontend-design` | Yes — full brainstorm/critique process run in-session | Editorial asymmetric layout over centered/template hero (§15); mixed-scale grid over uniform card grid; the Facet Line signature element (§17); rejected the three "AI-cliché" defaults explicitly (§16) | §15–§17 verbatim |
| `ui-styling` (ui-ux-pro-max) | Yes — shadcn stack guidance queried | Accordion/Tabs/Dialog use Radix-backed shadcn primitives, not bespoke `onClick` toggles; controlled dialog state | Applied across mega-menu, mobile drawer, accordions, FAQ, pricing tabs during implementation |
| `banner-design` (ui-ux-pro-max) | Yes — compositional rules only (safe-zone, single-CTA, max-2-typefaces, contrast) | Hero deliberately **does not** use the skill's AI-image-generation pipeline — project rules forbid fabricated stock/AI photography standing in for real clinic imagery. Composition guidance was extracted and applied to a code-built hero (facet-framed color/typography composition) instead of a generated visual. | Hero: copy separated from imagery per safe-zone logic, single CTA, real photography deferred to ImageKit with `pending` status |

No mandatory skill was unavailable; none was silently skipped or replaced.

---

## Open Items Carried to `docs/CONTENT_MODEL.md`

- All doctor photography (all 6 doctors) — pending, using abstract facet tiles.
- ImageKit account/credentials — not yet provisioned; system built against placeholder env vars, `status: pending` on every media reference.
- FeelStack endpoint/site key — not yet provisioned; adapter built with typed local fallback content.
- Aesthetic treatment pricing — not supplied (only uninsured medical-service fees and the legacy SkinMedica product price list were supplied); aesthetics pricing page stays feature-flagged off.
- Before/after photography — none supplied; feature-flagged off.
- Legal pages (Terms, Privacy) — legacy site shows literal "Coming soon" placeholders, which is explicitly not publishable; routes built but excluded from nav/sitemap/indexing until real legal copy is supplied.
- Product brand approval (SkinMedica) beyond the legacy price list — shop stays feature-flagged off pending explicit client approval per §18 of the master brief.

---

## Visual Continuity Report

Documents the section-transition (seam) system built to remove hard horizontal color lines between page sections, and its current coverage.

### The problem

Stacking sections with flat, differently-tinted backgrounds (white → blue-soft → blue-4 → surface-dark, etc.) directly against each other produces a visible hard edge — a "seam" — at every section boundary. This reads as templated/generated rather than designed.

### The system

`src/components/layout/SectionTransition.tsx` — a reusable, CSS-only seam component:

```tsx
<SectionTransition from="var(--surface-blue-soft)" to="var(--background)" />
```

- Renders one `aria-hidden="true"` `<div>` with `height: clamp(3.5rem, 6vw + 2rem, 11.25rem)` and a `linear-gradient(180deg, from, to)` background — nothing else. No JavaScript, no images, no blur/filter effects, so it costs nothing measurable in Lighthouse's `mainthread-work-breakdown`.
- `margin-block: -1px` (via the `.section-seam` class in `globals.css`) closes any 1px subpixel gap that can appear between adjacent flex/grid sections at fractional zoom levels.
- Placed between every pair of adjacent sections that have different background tokens; omitted between sections sharing the same background (no seam needed where there's no color change).

### The CTA → footer case (explicit example from the brief)

The final CTA section (`--blue-4`) sits directly above the dark footer (`--surface-dark`). A single 2-stop gradient looked flat and slightly banded there because of how far apart the two hex values are, so this specific seam uses a dedicated 4-stop gradient instead of the generic 2-stop component, matching the brief's own example:

```css
background: linear-gradient(180deg, var(--blue-4) 0%, var(--blue-4) 35%, #173f55 70%, var(--surface-dark) 100%);
```

The middle stop (`#173f55`) is a genuine intermediate blue-to-charcoal tone (not a mathematical midpoint of the two endpoints, which would read slightly muddy) — chosen by eye against the rendered page and matching the tone the brief's reference screenshot implied.

### Coverage

| Location | Status |
|---|---|
| Homepage (`/`) | **Done** — 13 `SectionTransition` instances between all 14 sections, plus the dedicated CTA→footer 4-stop gradient. |
| `MedicalServiceTemplate`, `ConcernTemplate`, `TechnologyTemplate`, `LegalPageTemplate`, `ProductTemplate`, `HealthHubArticleTemplate`, `AestheticTreatmentTemplate` (all 7 shared templates — covers all 7 medical-service pages, 8 aesthetic treatments, 9 concerns, 5 technologies, 4 legal pages, product/article pages) | **Done** — each template now renders a `<SectionTransition from="var(--background)" to="var(--surface-dark)" />` immediately before its closing `</article>`, softening the boundary with the dark footer. These templates have a single flat body background (no internal section-color changes), so this one seam is the only one they need. |
| Hub/static pages (`/medical`, `/aesthetics`, `/botox`, `/doctors`, `/patient-resources`, `/health-hub`, `/about`, `/contact`, `/book-appointment`, shop pages, legal-adjacent pages) and doctor profile pages | **Done** — completed in the remediation pass following this report's earlier version (verified: `grep -l "SectionTransition"` matches every one of these files). |
| New homepage section this pass (Concern Explorer, between the Aesthetics pathway section and Featured Technology) | **Done** — `var(--surface-blue-soft)` → `var(--background)` (explorer section) → `var(--blue-4)` (featured technology), each transition its own sibling `SectionTransition`, matching the homepage's existing correct pattern (not nested inside a padded container, avoiding the flat-band bug found and fixed earlier in the project). |

### Remaining work

None outstanding from this checklist. Every template and page in the current route tree carries the footer seam; internal multi-background pages (homepage, `/medical`, `/aesthetics`) carry seams between each internal section too.

---

## Header motion and footer tone — 2026-08-31 pass

### Header (`src/components/layout/Header.tsx`)

`fixed` on **every** route now, not only the homepage, with a static in-flow
spacer (`HEADER_HEIGHT_REST`) on non-homepage routes. That combination is what
makes an animated height safe: an out-of-flow header can shrink without moving
a pixel of page content, and the spacer never changes, so the scrolled state
cannot cause a layout shift.

| | Resting (scrollY ≤ 48) | Scrolled |
|---|---|---|
| Height | 84px | 72px |
| Homepage fill | transparent | `rgba(255,255,255,0.84)` + 16px blur |
| Other routes' fill | opaque `background` | same as homepage |
| Border / shadow | transparent / none | hairline + `0 1px 16px rgba(29,86,120,0.08)` |
| Inner row geometry | `max-w-[1280px]`, `px-4 lg:px-6` | **identical** |
| Transition | `420ms cubic-bezier(0.22,1,0.36,1)` on background-color, box-shadow, border-color, height |

The last row of that table is the substantive fix. The resting state used to
be full-bleed (`max-w-none` + `lg:px-16`) and the scrolled state a centred
1280px container, so scrolling dragged the logo and booking button sideways —
measured against the previous release: **69px at 1440, 184px at 1728, 280px at
1920**. Now measured at **0px at all three**. Nothing translates; only colour,
shadow, border and 12px of height animate.

### Footer tone

`--surface-dark` went from `#102f42` (near-navy) to `#1d5678` — the brand's own
blue-3, the deepest facet of the Blue Diamond mark itself. Measured relative
luminance **0.0254 → 0.0827**, i.e. 3.3× lighter, with link text still at
7.18:1, muted text at 5.84:1 and headings at 6.55:1 — all above WCAG AA.

Two knock-on values had to move with it, both because they were calibrated
against a much darker ground:
`--surface-dark-foreground-muted` (was `--grey-2` `#bebebe`, which measured
4.2:1 on the new ground — below AA) and `--surface-dark-border` (0.12 → 0.18
white). `--footer-text` / `--footer-text-muted` became solid colours instead of
rgba white so their contrast no longer depends on what is painted behind them.

`SiteClosingExperience`'s gradient stops lifted with the footer so the ramp
still ends on exactly `--surface-dark` and the seam stays invisible, and the
footer's own internal overlay dropped from 0.34 to 0.14 — at 0.34 it pulled the
footer's lower half back to roughly the old near-navy, cancelling the change.

### Reveal transforms

`[data-reveal="start"|"end"]` now translate **vertically** below `lg`. Their
±22px horizontal pre-reveal offset was the sole cause of the page extending
past the viewport at narrow widths — measured as 11px of real horizontal pan on
Arabic at 320px. `body` also moved from `overflow-x: hidden` to
`overflow-x: clip`: `hidden` makes body a scroll container and only suppressed
panning in one direction, which is why the RTL leak past the inline-start edge
survived it.
