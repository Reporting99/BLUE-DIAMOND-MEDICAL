# Accessibility Report

Target: WCAG 2.2 AA. Automated coverage so far: `@axe-core/playwright` scanning every built page (`tests/accessibility/axe.spec.ts`), `wcag2a` + `wcag2aa` + `wcag22aa` rule sets.

## Result as of this build

**28/28 sampled pages pass with zero axe violations, on both desktop and mobile viewports** — 23 English pages plus 5 Arabic pages (`/ar`, `/ar/تواصل-معنا`, `/ar/حجز-موعد`, `/ar/الأطباء`, `/ar/الأطباء/محمد-فرحات`, `/ar/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية`) covering the highest RTL/interactive-risk surface: a form, external booking links, a doctor profile (RTL name + hijab photo layout), a treatment page with an FAQ accordion, and the doctors grid. Arabic coverage was previously homepage-only — a real gap, found by an independent review and closed this pass. Command: `npx playwright test tests/accessibility --project=chromium-desktop` / `--project=chromium-mobile`.

**Methodology fix**: the scan now scrolls through the real page (in overlapping half-viewport steps, each followed by a poll for the genuine `IntersectionObserver`-driven `.is-revealed` state, not a fixed sleep) before scanning, then does one final poll confirming every `[data-reveal]` element on the page reached its resting state — exactly what a real visitor's scroll would trigger. An earlier version of this test injected `.is-revealed` directly via `page.evaluate()`, which was a test-only workaround rather than a test of the real interaction; that approach is no longer used anywhere in this suite.

Every new component added in the Part 2 content-enrichment pass (`ConcernExplorer`, `BeforeAfterSlider`/`Gallery`, the numbered technology-storytelling sections, doctor/FAQ cross-links on aesthetics templates) introduced only one new violation, found and fixed — see below. Everything else held up without needing to be reapplied.

## Real bugs the scan caught and fixed during this build (not hypothetical — verified before/after)

1. **`FacetTile` SVG had no accessible name.** Every placeholder image (`role="img"`) failed `svg-img-alt`. Fixed by threading the image's real alt text through to the SVG's `aria-label`, or marking it `aria-hidden` when genuinely decorative. See `src/components/media/FacetTile.tsx`.
2. **Hero eyebrow label and 404 label used `text-secondary` (blue-1, 2.9:1 on white)** — fails AA for text even though `docs/UI_UX_FOUNDATION.md` §2.2 explicitly documented this exact failure mode in advance. Fixed to `text-primary` (blue-3, 6.2:1). See `src/app/[locale]/page.tsx`, `src/app/[locale]/not-found.tsx`.
3. **Homepage final-CTA heading and button** sat on a solid `bg-primary` section but inherited near-identical foreground colors (1.24:1 and 3.11:1 respectively) from a global heading rule and the `secondary` button variant. Fixed with an explicit `text-primary-foreground` heading and a white outline button. See `src/app/[locale]/page.tsx`.
4. **Scrollable fee tables had no keyboard access** on narrow viewports — `overflow-x-auto` wrapper divs around the uninsured-services fee tables became horizontally scrollable with no way to scroll them via keyboard (axe's `scrollable-region-focusable`, mobile project only). Fixed by adding `tabIndex={0}` + `role="region"` + `aria-labelledby` pointing at each table's heading. See `src/components/medical/FeeTable.tsx`.
5. **A decorative numeral used a low-opacity color that failed contrast** — the new numbered technology-storytelling section (`TechnologyTemplate.tsx`'s `NumberedStep`) styled its "01/02/03" markers as `text-primary/40` (40% opacity), which measures below the large-text 3:1 threshold. `aria-hidden="true"` on the element does *not* exempt it from axe's contrast check — that attribute only affects assistive-tech reading, not what a sighted low-vision visitor sees rendered on screen. Fixed by using solid `text-primary` at full opacity, de-emphasized through smaller size and regular weight instead of opacity. Caught by this pass's own axe run on `/en/aesthetics/technologies/potenza`, verified fixed by re-running that specific test in isolation.

## New components this pass — accessibility notes

- **`ConcernExplorer`**: a plain server-rendered grid of real `<Link>` elements, deliberately not a client-side filter/search widget — this means full keyboard and screen-reader semantics come from the browser's native anchor handling for free, with no custom ARIA to get wrong. Verified via the axe suite (rendered on both the homepage and `/aesthetics/concerns`, both scanned).
- **`BeforeAfterSlider`**: built on a native `<input type="range">` rather than a custom draggable `<div>`, specifically so keyboard operation (arrow keys, Home/End), the accessible name/value announcement, and RTL mirroring all come from the browser instead of hand-rolled pointer-event and ARIA code. Not yet covered by the axe suite directly — the route it lives on (`/aesthetics/before-after`) is gated (`beforeAfterEnabled: false`) and currently renders its honest empty state (zero approved pairs), so there's no live interactive instance to scan yet. This is a real, tracked gap: add the route to `tests/accessibility/axe.spec.ts` once real before/after content exists and the flag is on, with a manual keyboard pass (arrow-key drag) alongside it.

## Manually verified in this build

- Keyboard: `Tab` reaches skip-link first (`tests/e2e/homepage.spec.ts`); mobile drawer opens/closes and `Escape` closes it, focus returns to trigger (Base UI Dialog primitive, tested).
- Focus-visible: never suppressed — `:focus-visible` rule in `globals.css` is unconditional.
- Headings: sequential h1→h2→h3 on every built page (no skipped levels).
- RTL: `dir="rtl"`/`lang="ar"` verified on `<html>` for `/ar` (`tests/e2e/locale-routing.spec.ts`).
- Forms: labelled inputs, `aria-invalid`/`aria-describedby` wiring, `role="alert"` error/status regions (`src/components/forms/ContactForm.tsx`).

This checkpoint's mobile scan (the fee-table fix above) is also the first evidence the `chromium-mobile` axe project catches things `chromium-desktop` doesn't — both projects should keep running on every future page.

## Not yet done (needs a human pass, not just automation)

- Screen-reader walkthrough (VoiceOver/NVDA) of the mega-menu, mobile drawer, and contact form.
- 200%-zoom and text-reflow manual check.
- Arabic screen-reader pronunciation review (ties into `docs/TRANSLATION_REVIEW_REPORT.md`).
- Every future page must be added to `tests/accessibility/axe.spec.ts`'s `pages` array — it is not run automatically against new routes yet.
