# Error Handling Report

## Classification rules implemented (brief §5)

| Situation | Code | Frontend behavior | Where |
|---|---|---|---|
| Confirmed unpublished/missing route | `NOT_FOUND` (no static fallback in hybrid mode, or `static` mode with nothing local) | `notFound()` → real 404 | `page-resolver.ts` → caller |
| HTTP 404 with valid contract | `NOT_FOUND` | `notFound()` → real 404 | `errors.ts:classifyHttpStatus` |
| Timeout (`AbortError`) | `TIMEOUT` | Throws `FeelStackUnavailableError` → `error.tsx` boundary | `client.ts` (5s `AbortController`) |
| Network failure (`TypeError` from `fetch`) | `NETWORK_ERROR` | Throws `FeelStackUnavailableError` → `error.tsx` | `errors.ts:classifyThrown` |
| FeelStack 5xx | `UPSTREAM_ERROR` | Throws `FeelStackUnavailableError` → `error.tsx` | `errors.ts:classifyHttpStatus` |
| Malformed JSON | `INVALID_RESPONSE` | Throws `FeelStackUnavailableError` → `error.tsx` | `client.ts` (JSON.parse catch) |
| Schema-valid JSON, wrong shape | `INVALID_RESPONSE` | Throws `FeelStackUnavailableError` → `error.tsx` | `client.ts` (Zod `safeParse` failure) |
| Wrong locale (HTTP 401/403/409-class from resolver) | `LOCALE_MISMATCH`/`INVALID_SITE` | Throws `FeelStackUnavailableError` — controlled failure, **no** silent redirect (equivalence was never verified) | `page-resolver.ts` |
| Invalid/missing site key at startup | `CONFIGURATION_ERROR` | Throws `FeelStackConfigurationError` — never caught into a 404 anywhere in the call chain | `content-mode.ts:assertFeelstackEnvValid` |

None of the above five outage codes ever fall through to `notFound()`. The single place that could make that mistake — `page-resolver.ts`'s `NOT_FOUND` branch — is the *only* branch that calls `staticFallback()`; every other branch either returns `{ source: "cms" }` or throws. This is enforced by tests, not just by inspection: `tests/contracts/failure-classification.spec.ts` has one test per outage code asserting it throws `FeelStackUnavailableError` and never resolves to `{ source: "not-found" }`.

## Why the error boundary can't set a real 503

Verified against `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md` and `.../file-conventions/error.md` for this repo's actual Next.js 16.3.2: `notFound()` is the only App-Router primitive that sets a specific non-200 HTTP status from a Server Component; `error.tsx` boundaries render as a generic error response (framework-controlled, not configurable to 503 from the boundary itself). This is a genuine Next.js limitation, not an implementation gap here — documented rather than silently worked around with something that would misrepresent what's actually happening. **Mitigation implemented:** the full classification (code, HTTP status, request ID, locale, path) is captured in a structured server-side log (`errors.ts:logFeelstackEvent`) *before* the throw, so the real cause is never lost even though the boundary's own rendered response is generic. The Route Handler webhook (`src/app/api/feelstack/revalidate/route.ts`), unlike a page, *can* and does return precise statuses (501/401/415/413/400/200) since Route Handlers aren't subject to this limitation.

## Prose-independence (brief §6)

Nothing in the classification path matches on upstream error text. `classifyHttpStatus` switches on the numeric HTTP status; `classifyThrown` switches on the JS error's *type* (`DOMException`/`AbortError` name, `TypeError`, `SyntaxError`), not its message string. `tests/contracts/failure-classification.spec.ts` constructs errors with arbitrary/synthetic messages (`new TypeError("fetch failed")`, `new DOMException("aborted", "AbortError")`) and asserts on the *code*, not the message — proving a changed upstream wording can't change classification, satisfying brief §18's "Changed human-readable message does not cause 500" requirement structurally (there is no code path left that reads a message to decide behavior).

## Structured logging (brief §5)

`logFeelstackEvent()` accepts a closed set of fields (`category`, `httpStatus`, `locale`, `path`, `requestId`, `upstreamContext`) — there is no parameter through which a secret, header, or raw response body could be passed. Verified in `tests/security/feelstack-webhook.spec.ts`'s "no secret in logs" test (webhook path) and by code review of every `logFeelstackEvent` call site in `client.ts`/`page-resolver.ts` (none pass anything beyond the closed field set).
