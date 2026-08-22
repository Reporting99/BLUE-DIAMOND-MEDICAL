# Webhook Security Report

Endpoint: `POST /api/feelstack/revalidate`. HTTP adapter: `src/app/api/feelstack/revalidate/route.ts`. Business logic (unit-testable, no Next.js server required): `src/lib/feelstack/webhook-handler.ts`.

Still returns **501 for every request** on this deployment — `FEELSTACK_REVALIDATE_SECRET` is unset (`.env.example`, `docs/DEPLOYMENT_GUIDE.md`). Nothing here is live; this is the readiness state.

## Protections implemented

| Protection | Implementation | Test |
|---|---|---|
| Timing-safe HMAC verification | `src/lib/security/hmac.ts` `verifyHmacSignature` — `node:crypto` `timingSafeEqual`, pre-existing, unchanged | `tests/security/feelstack-webhook.spec.ts` "valid/invalid/wrong-secret signature" |
| Timestamp validation | Same function, 5-minute freshness window, pre-existing, unchanged | "expired timestamp (>5 minutes old) is rejected" |
| **Replay protection** (new this pass) | `webhook-handler.ts` — in-memory `Map<signature, expiresAt>`; the *same* valid signature replayed within the freshness window is rejected on its second use | "the same valid request replayed a second time is rejected" |
| Three-pass path decoding + normalization | `decodeAndNormalizePath()` — up to 3 rounds of `decodeURIComponent`, rejects any result containing a `..` segment at any decode depth, collapses `.`/duplicate slashes | 5 dedicated tests: single/double/triple-encoded traversal, normal path, trailing-slash normalization |
| Route allowlisting | `isAllowlistedPath()` against `src/config/routes.ts`-derived set — unchanged from the pre-existing implementation, now applied to the *normalized* path | "a path not on the allowlist is rejected end-to-end even with a valid signature" |
| Strict method | Only `POST` is exported from the route module — Next.js 405s anything else by convention | not independently re-tested this pass (framework-level guarantee) |
| Strict content-type | Requires `application/json`, else `415` | "non-JSON content type is rejected" |
| Body-size limit | 64 KB, checked against both the `Content-Length` header *and* the actual received body length (so a lying/missing header can't bypass it) | "oversized body (header)" + "oversized actual body even if Content-Length lies" |
| SSRF protection | N/A for this endpoint — it never makes an outbound request based on payload content; `revalidateTag`/`revalidatePath` operate on this app's own cache, not a fetched URL | — |
| DNS pinning | N/A, same reason — no outbound resolution happens in this handler | — |
| No open redirects | This endpoint returns JSON only, never a redirect | — |
| No secret logging | `console.warn` calls log a fixed string only, never `payload`, `signature`, or `secret` | "a rejected request never logs the configured secret or the signature value" — asserts the literal secret and signature values never appear in any `console.warn` call |
| Unsupported event rejected | `feelstackWebhookBodySchema` (Zod union) rejects any `event` value outside the fixed enum | "unsupported event name is rejected" |

All 22 webhook tests in `tests/security/feelstack-webhook.spec.ts` pass (verified as part of the 60/60 new-test run and the 376/376 full-suite run, both 2026-08-22).

## Known limitations (not fabricated fixes)

1. **Replay guard is single-instance (in-memory `Map`).** Correct for one server process; a multi-instance/serverless deployment needs a shared store (Redis/KV) for the guard to hold across instances. Not implemented — no real infrastructure credentials were available this session to wire one, and fabricating a Redis client against nothing would violate the "never guess missing architecture" rule. Flagged as a pre-deployment blocker in `docs/FINAL_BLUE_FEELSTACK_REPORT.md`.
2. **Structured webhook payload contract is forward-declared, not confirmed live.** No webhook sender exists in the recovered Dfeelings source (it has none at all — see `docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md` §3) and no live FeelStack webhook documentation was available. The legacy `{ path }` shape this deployment already shipped is unaffected and still works; the new `{ event, siteKey, locale?, entityId?, path? }` shape must be reconciled against FeelStack's real sender before go-live.
3. **DNS pinning / SSRF protection were not implemented** because this handler has no code path that performs outbound network resolution based on request content — they don't apply here, not omitted by oversight. If a future FeelStack webhook payload ever includes a URL this handler must fetch, both protections would need to be added at that point.
