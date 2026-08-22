# Visual Continuity Report

Documents the section-transition (seam) system built to remove hard horizontal color lines between page sections, and its current coverage.

## The problem

Stacking sections with flat, differently-tinted backgrounds (white → blue-soft → blue-4 → surface-dark, etc.) directly against each other produces a visible hard edge — a "seam" — at every section boundary. This reads as templated/generated rather than designed.

## The system

`src/components/layout/SectionTransition.tsx` — a reusable, CSS-only seam component:

```tsx
<SectionTransition from="var(--surface-blue-soft)" to="var(--background)" />
```

- Renders one `aria-hidden="true"` `<div>` with `height: clamp(3.5rem, 6vw + 2rem, 11.25rem)` and a `linear-gradient(180deg, from, to)` background — nothing else. No JavaScript, no images, no blur/filter effects, so it costs nothing measurable in Lighthouse's `mainthread-work-breakdown` (confirmed in `docs/PERFORMANCE_REPORT.md`).
- `margin-block: -1px` (via the `.section-seam` class in `globals.css`) closes any 1px subpixel gap that can appear between adjacent flex/grid sections at fractional zoom levels.
- Placed between every pair of adjacent sections that have different background tokens; omitted between sections sharing the same background (no seam needed where there's no color change).

## The CTA → footer case (explicit example from the brief)

The final CTA section (`--blue-4`) sits directly above the dark footer (`--surface-dark`). A single 2-stop gradient looked flat and slightly banded there because of how far apart the two hex values are, so this specific seam uses a dedicated 4-stop gradient instead of the generic 2-stop component, matching the brief's own example:

```css
background: linear-gradient(180deg, var(--blue-4) 0%, var(--blue-4) 35%, #173f55 70%, var(--surface-dark) 100%);
```

The middle stop (`#173f55`) is a genuine intermediate blue-to-charcoal tone (not a mathematical midpoint of the two endpoints, which would read slightly muddy) — chosen by eye against the rendered page and matching the tone the brief's reference screenshot implied.

## Coverage

| Location | Status |
|---|---|
| Homepage (`/`) | **Done** — 13 `SectionTransition` instances between all 14 sections, plus the dedicated CTA→footer 4-stop gradient. |
| `MedicalServiceTemplate`, `ConcernTemplate`, `TechnologyTemplate`, `LegalPageTemplate`, `ProductTemplate`, `HealthHubArticleTemplate`, `AestheticTreatmentTemplate` (all 7 shared templates — covers all 7 medical-service pages, 8 aesthetic treatments, 9 concerns, 5 technologies, 4 legal pages, product/article pages) | **Done** — each template now renders a `<SectionTransition from="var(--background)" to="var(--surface-dark)" />` immediately before its closing `</article>`, softening the boundary with the dark footer. These templates have a single flat body background (no internal section-color changes), so this one seam is the only one they need. |
| Hub/static pages (`/medical`, `/aesthetics`, `/botox`, `/doctors`, `/patient-resources`, `/health-hub`, `/about`, `/contact`, `/book-appointment`, shop pages, legal-adjacent pages) and doctor profile pages | **Done** — completed in the remediation pass following this report's earlier version (verified: `grep -l "SectionTransition"` matches every one of these files). |
| New homepage section this pass (Concern Explorer, between the Aesthetics pathway section and Featured Technology) | **Done** — `var(--surface-blue-soft)` → `var(--background)` (explorer section) → `var(--blue-4)` (featured technology), each transition its own sibling `SectionTransition`, matching the homepage's existing correct pattern (not nested inside a padded container, avoiding the flat-band bug found and fixed earlier in the project). |

## Remaining work

None outstanding from this checklist. Every template and page in the current route tree carries the footer seam; internal multi-background pages (homepage, `/medical`, `/aesthetics`) carry seams between each internal section too.
