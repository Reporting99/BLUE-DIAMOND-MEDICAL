# Dfeelings → Blue Diamond Architecture Map

Records what was actually found in the recovered Dfeelings source, what was adopted, what was deliberately rejected, and the scope decision that governed this pass. Written 2026-08-22.

## 0. Artifact status (mandatory safety rules 1–9)

- **`DFEELINGS_FEELSTACK_FINAL_AUDIT.md`** — not found. Searched this repo's `docs/`, all of `Desktop`, and all of `Downloads`. Several *differently-named* Dfeelings audit documents exist in Downloads (`Dfeelings-Audit-SEO-GEO-AEO-UIUX-2026-07-07.pdf`, `dfeelings-full-site-audit.pdf`, `DFEELINGS_SEO_GEO_AEO_Audit_Report.pdf`, `DFeelings_Final_Consolidated_Report.pdf`, etc.) but none matches this exact filename.
- **Recovered Dfeelings production source, commit `a9aa3b4e…`** — a candidate was found at `C:\Users\user\Downloads\dfeelings\` (a complete Next.js project), but it has **no `.git` directory**, so the specific commit cannot be verified. It was used as a **read-only, unverified-provenance reference** per explicit user direction, not modified, not built, not installed into.
- Per explicit user instruction, this pass proceeded on that basis rather than stopping, with every unverifiable claim flagged below rather than asserted.

## 1. What Dfeelings actually is

Not a medical clinic reference implementation — `dfeelings.com` is a digital-marketing-agency site (Amman, Jordan) with a large surface of unrelated product features: URL shortener (`/s/[shortCode]`), "link-in-bio" pages (`/l/[slug]`), a full auth system (login/signup/password-reset/Google OAuth), a client dashboard, and a marketing content site. Confirmed live values found in this recovered copy (env var **names** only, no values read or copied): `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_FEELSTACK_API_URL` = `https://feelstack.dfeelings.com/api`, `PROJECT_ID`. This confirms FeelStack is a real, separate backend product Dfeelings' own site consumes — not something invented for this brief — which is the one load-bearing fact this inspection needed to establish.

## 2. What was adopted from Dfeelings

| Pattern | Dfeelings' implementation | Adopted into Blue Diamond as |
|---|---|---|
| Locale-prefixed routing | `app/[lang]/...` | Already present in Blue Diamond (`app/[locale]/...`) — pre-existing parity, nothing to change. |
| One resolver entry point per request | `getPageInfoFromSlugArray()` + a big `switch` in `[...slug]/page.tsx` mapping a resolved "key" to a hardcoded content component | Blue Diamond's existing `src/templates/*Template.tsx` (one template component per `TemplateType`, see `src/types/route.ts`) is the structural equivalent — already at parity, not changed. |
| FeelStack's real public API shape | Not directly observable — Dfeelings' own `src/lib/api.ts` calls a *different*, older surface (`/posts/slug/:slug`, `/case-studies/published`, `/posts/published`) than the `/public/v1/sites/:siteKey/resolve` + `/routes` endpoints this brief specifies. Blue Diamond's pre-existing adapter (`src/lib/feelstack/client.ts`, from an earlier pass) already targeted the brief's stated endpoints. | Kept the pre-existing endpoint shape; did not switch to Dfeelings' older surface — the brief's own two-endpoint spec is the more specific, current instruction, and this repo's own client already matched it. |
| Per-fetch ISR tags (`next: { tags: [...] }`) | Ad hoc per call site, e.g. `tags: ['posts']`, `tags: [`post-${slug}`]` | Adopted the *concept* (Next.js cache tags), rejected the ad hoc placement — centralized in `src/lib/feelstack/cache-tags.ts` per brief §8. |
| `revalidateTag` second-argument requirement | N/A (Dfeelings targets an older Next.js; no `revalidateTag` call found anywhere in its `src/app/api/`) | Discovered independently against **this repo's actual Next.js 16.3.2**, not from Dfeelings — see §4 below. |

## 3. What was deliberately rejected

1. **Blanket error-swallowing.** Every Dfeelings CMS call (`src/lib/api.ts`) follows the same shape:
   ```ts
   try {
     const response = await fetch(...)
     if (!response.ok) throw new Error(`Failed: ${response.status}`)
     return await response.json()
   } catch (error) {
     console.error(...)
     return null // or { items: [], total: 0 }
   }
   ```
   No HTTP-status differentiation, no Zod validation, no timeout/`AbortController`, no retry policy. A CMS outage and a confirmed-missing post produce the *identical* result (`null`/empty list) to the caller. This is exactly the anti-pattern brief §5/§6 says not to copy, and is the primary reason `src/lib/feelstack/client.ts`, `errors.ts`, and `contracts.ts` (`FeelStackResult<T>`, brief's own suggested shape) were built as a hard rewrite rather than a port.
2. **No generic block/renderer system.** The brief's target structure (§3) lists `components/blocks/`, "Block rendering," "Template selection" as if Dfeelings has a generic CMS block model. It does not — Dfeelings hardcodes one React component per page "key" in a `switch` statement (`[...slug]/page.tsx`, ~40 cases). There is nothing generic to port. Blue Diamond's existing `src/templates/*Template.tsx` + `TemplateType` union is the same shape (one component per type) and was left as-is rather than replaced with a fabricated generic block system that doesn't exist in the reference either.
3. **No webhook / on-demand revalidation.** Searched all of `src/app/api/` in the recovered source for `revalidate`, `webhook`, `hmac`, `signature` — zero matches. Dfeelings relies entirely on time-based ISR (`revalidate: 30`). Blue Diamond's existing HMAC-verified webhook (`src/app/api/feelstack/revalidate/route.ts`, built in an earlier pass) is strictly more advanced than anything in the reference; there was nothing to "reuse" from Dfeelings here despite brief §9's instruction to reuse Dfeelings' webhook patterns — documented as a contract limitation, not silently invented.
4. **Dfeelings' brand, copy, routes, and business config** — per brief §2, none of this was touched or referenced beyond the two structural facts above.

## 4. A load-bearing discovery outside Dfeelings entirely: this Next.js build is not stock Next.js

Per `AGENTS.md`'s own instruction ("read `node_modules/next/dist/docs/` before writing any code... heed deprecation notices"), the actual Next.js 16.3.2 docs in this repo's `node_modules` were read before implementing the webhook and cache-tag work, independent of anything found in Dfeelings:

- `revalidateTag(tag: string)` (single-argument) is **removed/type-error** in this build — `revalidateTag` now requires a second `profile` argument. Per `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`: *"For webhooks or third-party services that need immediate expiration, ... pass `{ expire: 0 }`"* — exactly this webhook's use case, so `revalidateTag(tag, { expire: 0 })` is what `src/app/api/feelstack/revalidate/route.ts` calls. Caught by `tsc --noEmit` during this pass (`TS2554: Expected 2 arguments, but got 1`), not by inspection alone.
- `error.js`/`error.tsx` file-convention semantics (props, `retry`, no page-level status-code control) were confirmed against `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md` and `.../file-conventions/error.md` before writing `src/app/[locale]/error.tsx` — see `docs/FEELSTACK.md` for the specific limitation this surfaced (no App Router API sets a precise non-404 HTTP status from a Server Component).

## 5. Scope decision: hybrid content-mode migration (this session, explicit user instruction)

Blue Diamond's pre-existing, documented architecture (`docs/DEPLOYMENT.md`, predating this pass) is: all page content lives in typed `src/content/*.ts`, and a FeelStack adapter exists but is inert (no env vars set). Migrating all ~20 dynamic route handlers to CMS resolution in one pass would be the "massive uncontrolled rewrite" brief §17 prohibits and would risk the "no loss of pages/content" guarantee (rule 10).

Resolved scope, confirmed with the user: build the **complete, production-ready adapter** (contracts, schemas, error classification, timeout/retry, cache tags, invalidation matrix, hardened webhook) now, gated behind a new `FEELSTACK_CONTENT_MODE` (`static` default / `hybrid` / `cms`, `src/lib/feelstack/content-mode.ts`), and wire **one representative route** (`medical/[serviceId]`) end-to-end as the proven pattern, rather than touching all routes unreviewed. See `docs/FEELSTACK.md` for the entity-by-entity mapping the rest of the routes follow when migrated.

## 6. Structure adaptation (brief §3)

The brief's target tree (`app/[locale]/[[...path]]/page.tsx` catch-all, `src/feelstack/*`) was **adapted**, not mechanically imposed, per §3's own instruction ("Adapt this structure to the actual repository instead of mechanically replacing working files"):

- No `[[...path]]` catch-all was introduced — Blue Diamond's explicit per-content-type routes (`medical/[serviceId]`, `aesthetics/concerns/[concernId]`, `shop/[productId]`, etc.) are the approved, SEO-audited route registry (`docs/ROUTE_DECISION_LOG.md`, `docs/EN_AR_ROUTE_MAP.md`) and rule 10 requires preserving them as-is.
- `src/feelstack/*` (brief's suggested path) → kept at the pre-existing `src/lib/feelstack/*` location rather than moved, per §3 "do not create duplicate clients, route resolvers, metadata systems."
- `app/[locale]/[[...path]]/{loading,error,not-found}.tsx` → adapted to `app/[locale]/error.tsx` (one shared boundary at the locale segment, since there is no catch-all segment to attach it to); `not-found.tsx` already existed at the same level and was left untouched.
