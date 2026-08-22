# FeelStack Integration

The CMS contract, its failure semantics, and the decisions behind them. Code is
the source of truth; this describes what it implements and why.

**Current state: nothing is live.** `FEELSTACK_API_URL` and
`FEELSTACK_REVALIDATE_SECRET` are unset, `FEELSTACK_CONTENT_MODE` defaults to
`static`, and the webhook returns 501 for every request. Every page renders
from `src/content/*.ts`. The adapter is complete and every entity route is
wired; provisioning is what remains.

---

## 1. Endpoints

Two, both public and unauthenticated:

- `GET {FEELSTACK_API_URL}/public/v1/sites/:siteKey/resolve?path=&locale=`
- `GET {FEELSTACK_API_URL}/public/v1/sites/:siteKey/routes?locale=`

No authorization header is sent to either — they are intentionally public, so a
header would leak a credential to no purpose.

**Not verified against a live instance.** No live endpoint or admin API
documentation has been available in any session so far. These shapes are
carried forward from this repo's own adapter rather than guessed; see
`ARCHITECTURE.md` §3 for why the Dfeelings source could not be used to confirm
them (it calls a different, older surface).

## 2. Content modes

`FEELSTACK_CONTENT_MODE` (`src/lib/feelstack/content-mode.ts`):

| Mode | Behaviour |
|---|---|
| `static` (default) | Local `src/content/*.ts` only. `resolvePageContent` returns the fallback without any network request. |
| `hybrid` | FeelStack first; local content is used **only** when the CMS confirms the entity is absent — never when the CMS is unreachable. |
| `cms` | FeelStack authoritative, no fallback. |

Setting `hybrid`/`cms` without `FEELSTACK_API_URL` + `FEELSTACK_SITE_KEY` is a
startup configuration error, not a silent downgrade to `static`.

The distinction that matters: **`CONTENT_NOT_FOUND` and `CMS_UNAVAILABLE` are
different things.** A confirmed-absent entity 404s. An outage never does — it
throws, so a CMS incident cannot silently 404 the whole site and have that
indexed as mass content deletion.

## 3. Result contract

`src/lib/feelstack/contracts.ts`:

```ts
type FeelStackResult<T> =
  | { ok: true; data: T; requestId?: string }
  | { ok: false;
      error: "NOT_FOUND" | "TIMEOUT" | "NETWORK_ERROR" | "UPSTREAM_ERROR"
           | "INVALID_RESPONSE" | "INVALID_SITE" | "LOCALE_MISMATCH" | "CONFIGURATION_ERROR";
      status?: number; requestId?: string; message?: string }
```

`CONFIGURATION_ERROR` is thrown as `FeelStackConfigurationError`, never
returned — a misconfiguration must not look like a recoverable runtime failure.

### Failure classification

| Situation | Code | Behaviour |
|---|---|---|
| Confirmed unpublished/missing | `NOT_FOUND` | `notFound()` → real 404 |
| HTTP 404 | `NOT_FOUND` | `notFound()` → real 404 |
| Timeout (5s `AbortController`) | `TIMEOUT` | throws → `error.tsx` |
| Network failure | `NETWORK_ERROR` | throws → `error.tsx` |
| FeelStack 5xx | `UPSTREAM_ERROR` | throws → `error.tsx` |
| Malformed JSON / wrong shape | `INVALID_RESPONSE` | throws → `error.tsx` |
| Wrong locale / bad site key | `LOCALE_MISMATCH` / `INVALID_SITE` | throws — no silent locale swap |
| Missing env in hybrid/cms | `CONFIGURATION_ERROR` | throws at startup |

Retries: GET only, at most once, and only for network failures or 502/503/504.
Never for 400, invalid site key, or locale mismatch — those are not transient.

**No outage code ever reaches `notFound()`.** `page-resolver.ts`'s `NOT_FOUND`
branch is the only one that calls `staticFallback()`; every other branch either
returns CMS data or throws. `tests/contracts/failure-classification.spec.ts`
asserts this per code.

**Nothing matches on error prose.** `classifyHttpStatus` switches on the numeric
status; `classifyThrown` switches on the JS error *type* (`AbortError`,
`TypeError`, `SyntaxError`), never a message string. The tests construct errors
with synthetic messages and assert on the code, so an upstream wording change
cannot alter behaviour.

### A real Next.js limitation, documented rather than papered over

`notFound()` is the only App Router primitive that sets a specific non-200
status from a Server Component; an `error.tsx` boundary renders a generic error
response and cannot return 503. Verified against this repo's actual Next.js
16.3.2 docs in `node_modules`. Mitigation: the full classification (code,
status, request id, locale, path) is captured by `logFeelstackEvent()` *before*
the throw, so the cause survives even though the rendered response is generic.
Route Handlers are not subject to this — the webhook returns precise statuses.

## 4. Entity coverage

Every entity route resolves through `resolvePageContent`. Each CMS schema
`.transform()`s into exactly its local domain type, which is what lets the CMS
branch and the static fallback share one type parameter — enforced at compile
time by the assertions in `tests/contracts/feelstack-schemas.spec.ts`.

| Entity | Local source | Schema | Route |
|---|---|---|---|
| Medical service | `content/medical-services.ts` | `cmsMedicalServiceSchema` | `medical/[serviceId]` |
| Doctor | `types/doctor.ts` | `cmsDoctorSchema` | `doctors/[doctorId]` |
| Aesthetic treatment | `content/treatments.ts` | `cmsAestheticTreatmentSchema` | `aesthetics/treatments/[treatmentId]` |
| Concern | `content/concerns.ts` | `cmsAestheticConcernSchema` | `aesthetics/concerns/[concernId]` |
| Technology | `content/technologies.ts` | `cmsTechnologySchema` | `aesthetics/technologies/[technologyId]` |
| Product | `content/products.ts` | `cmsProductSchema` | `shop/[productId]` |
| Health Hub article | `content/health-hub-articles.ts` | `cmsHealthHubArticleSchema` | `health-hub/[articleId]` |
| Legal page | `content/legal-pages.ts` | `cmsLegalPageSchema` | `[legalPageId]` |

FAQs, prices, and ImageKit paths are **not** standalone entities — they travel
embedded in their parent entity, as they do locally. Media is stored as
ImageKit path strings on the owning entity, never as binaries.

Not yet CMS-backed: navigation and footer (`src/config/navigation.ts`), and
per-route SEO copy (`getRouteMetadata`). Cache tags exist for all three.

## 5. Cache tags

Registry: `src/lib/feelstack/cache-tags.ts`. Rules:
`src/lib/feelstack/revalidation.ts`. Both directions are enforced by
`tests/cache/cache-tag-coverage.spec.ts`, which walks every builder and asserts
a matching invalidation entry, and rejects any rule naming a tag that does not
exist.

Every tag has all three of the things a working invalidation model requires:

- **Producer** — `entityCacheTags()` builds the detail + index + page tag set,
  and `resolveEntity` passes it to `fetch(..., { next: { tags } })`.
- **Owner** — the entity family the tag names.
- **Invalidation event** — the `invalidationCoverage` matrix.

> Historical note worth keeping: the producer side was missing until this pass.
> The registry, the matrix, the webhook and the coverage test were all correct
> and complete, yet no fetch ever attached a tag, so every `revalidateTag()`
> call matched nothing and a publish would have silently no-opped. The coverage
> test could not catch it — it only ever checked that tags had *consumers*.

Rules that hold: product changes invalidate detail + shop index + sitemap;
article changes invalidate detail + Health Hub index + sitemap; route changes
invalidate routes + sitemap + navigation + the affected page; locale-scoped
events invalidate only that locale; unrelated events cause no global purge.

## 6. Webhook

`POST /api/feelstack/revalidate` — HTTP adapter in
`src/app/api/feelstack/revalidate/route.ts`, logic in
`src/lib/feelstack/webhook-handler.ts` (unit-testable without a server).

| Protection | Implementation |
|---|---|
| Timing-safe HMAC | `src/lib/security/hmac.ts`, `crypto.timingSafeEqual` |
| Timestamp freshness | 5-minute window |
| Replay protection | in-memory `Map<signature, expiresAt>`; a valid signature is rejected on second use |
| Path traversal | up to 3 rounds of `decodeURIComponent`, rejects `..` at any depth, collapses `.`/duplicate slashes |
| Route allowlist | derived from `src/config/routes.ts`, applied to the *normalized* path |
| Content-type | `application/json` required, else 415 |
| Body size | 64 KB, checked against both `Content-Length` **and** the actual body, so a lying header cannot bypass it |
| Event allowlist | Zod union rejects any event outside the enum |
| No secret logging | log calls emit fixed strings only; asserted by test |

Uses `revalidateTag(tag, { expire: 0 })` — the single-argument form is removed
in Next.js 16, and `profile: "max"` would serve stale content, which is wrong
for a publish webhook.

SSRF protection and DNS pinning do not apply: this handler makes no outbound
request based on payload content. If a future payload ever carries a URL to
fetch, both must be added then.

### Known limitations — not fabricated fixes

1. **Replay guard is single-instance.** An in-memory `Map` is correct for one
   process; a multi-instance deployment needs a shared store (Redis/KV). A
   pre-deployment blocker for multi-instance, not for the current single-slot
   Blue/Green model.
2. **The structured payload shape is a forward declaration.** No live FeelStack
   webhook sender or documentation has been available, and the recovered
   Dfeelings source has no webhook at all (it uses time-based ISR only). The
   legacy `{ path }` shape still works unchanged; the
   `{ event, siteKey, locale?, entityId?, path? }` shape must be reconciled
   against the real sender before go-live.

## 7. Before any real migration

No provisioning CLI, admin API shape, or import script is documented here,
because none has been observed. Guessing one would be exactly the invented
architecture this project prohibits.

1. Provision the Blue Diamond FeelStack site and obtain its real `siteKey`.
   The frontend pins `blue-diamond-medical` and refuses any other, so a `.env`
   copied from another tenant fails loudly rather than serving another site's
   content.
2. Obtain FeelStack's write/admin/import API documentation.
3. Set `FEELSTACK_API_URL`, `FEELSTACK_SITE_KEY`, `FEELSTACK_REVALIDATE_SECRET`
   in the real environment — never committed.
4. Reconcile the webhook payload shape against the real sender (§6.2).
5. Move to `hybrid` **one entity family at a time**, starting with
   `medical-service`. Verify with the Playwright suite plus the contract and
   failure-classification tests before extending to the next.
6. Use the §4 table as the checklist for what has and has not been migrated.
