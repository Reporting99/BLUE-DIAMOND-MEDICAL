# Deployment Guide

No deployment has been performed — this build has only run locally (`npm run dev`, `npm run build && npm run start`, and Playwright against a local server). This document describes how to deploy once approved; it does not authorize doing so.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values as they become available
npm run dev
```

## Local production build

```bash
npm run validate   # typecheck + lint + build
npm run start
```

## Before any real deployment

1. **Provision ImageKit** — set `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`. Upload the doctor photos and clinic imagery listed in `docs/IMAGE_REPLACEMENT_MANIFEST.md`, then flip each asset's `status` to `"approved"` in its referencing component.
2. **Provision FeelStack** — the adapter is already built (`src/lib/feelstack/`) and typechecks/builds without these set; provide `FEELSTACK_API_URL`, `FEELSTACK_SITE_KEY`, `FEELSTACK_REVALIDATE_SECRET` to activate it.
3. **Choose and wire a contact-form delivery provider** — set `CONTACT_DELIVERY_PROVIDER` and implement the corresponding branch in `src/lib/forms/contact-delivery.ts` (currently every submission fails closed with a "please call us" fallback, by design, until this is done).
4. **Replace the recreated logo SVG** (`src/components/layout/Logo.tsx`) with Decca Design Inc.'s master vector file.
5. **Run the full validation suite**: `npm run validate` (typecheck + lint + build) and `npx playwright test` (all projects, all browsers you intend to support) — must be 100% green.
6. **Run a real Lighthouse pass** and fill in `docs/PERFORMANCE_REPORT.md` with actual numbers.
7. **Get sign-off on `docs/CONTENT_APPROVAL_MATRIX.md` and `docs/TRANSLATION_REVIEW_REPORT.md`** — no page should go live with unreviewed medical claims or unreviewed Arabic copy.
8. **DNS cutover** — see `docs/DNS_LEGACY_DOMAIN_GUIDE.md`. Requires explicit approval before any change.

## CI (prepared, not yet pushed to a remote)

`.github/workflows/ci.yml` exists and runs: `npm ci`, typecheck, lint, build, install Playwright browsers, then the full Playwright suite — failing the pipeline on any red step, uploading the HTML report and test-results on failure, and never deploying. Not yet pushed to any remote per the brief's own restriction.

## Hosting target

Not yet decided in this build. Next.js 16 with Turbopack, Server Components, Server Actions (used by the contact form), and ISR-ready sitemap/routes means Vercel is the lowest-friction target, but any Node.js-compatible host that supports the Next.js adapter works. This is a decision for the client/team, not made unilaterally here.
