# FeelStack Contracts

## Endpoints used

Two, both public/unauthenticated, per the brief's own spec and matching this repo's pre-existing adapter (`src/lib/feelstack/client.ts`, built before this pass):

- `GET {FEELSTACK_API_URL}/public/v1/sites/:siteKey/resolve?path=&locale=` — resolves one path's content for a locale.
- `GET {FEELSTACK_API_URL}/public/v1/sites/:siteKey/routes?locale=` — lists all routes FeelStack knows about for a locale.

**Not independently re-verified against a live FeelStack instance this session** — no live endpoint or admin API documentation was available (see `docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md` §0, §2). Carried forward unchanged from the pre-existing adapter rather than guessed from scratch.

No authorization header is sent to either endpoint (brief §4: "Never send authorization headers to endpoints that are intentionally public").

## Result contract

`src/lib/feelstack/contracts.ts`:

```ts
type FeelStackResult<T> =
  | { ok: true; data: T; requestId?: string }
  | {
      ok: false;
      error: "NOT_FOUND" | "TIMEOUT" | "NETWORK_ERROR" | "UPSTREAM_ERROR"
           | "INVALID_RESPONSE" | "INVALID_SITE" | "LOCALE_MISMATCH" | "CONFIGURATION_ERROR";
      status?: number;
      requestId?: string;
      message?: string;
    };
```

Matches the brief's suggested shape exactly, plus `CONFIGURATION_ERROR` (thrown as `FeelStackConfigurationError`, never returned as a result — a config problem must never look like a normal, recoverable failure).

## Schemas (`src/lib/feelstack/schemas.ts`)

| Schema | Validates | Status |
|---|---|---|
| `feelstackResolveResponseSchema` | `/resolve` response | Pre-existing, carried forward |
| `feelstackRoutesResponseSchema` | `/routes` response | Pre-existing, carried forward |
| `feelstackApiErrorSchema` | Optional structured error envelope, best-effort | New — unconfirmed against a live API, documented as such |
| `cmsMedicalServiceSchema` | `medical-service` entity | New, wired into `medical/[serviceId]` |
| `cmsDoctorSchema` | `doctor` entity | New, schema only |
| `cmsProductSchema` | `product` entity | New, schema only |
| `feelstackWebhookBodySchema` | Inbound webhook body (union of legacy `{path}` and structured `{event,...}`) | New — the structured shape is a forward declaration, see `docs/WEBHOOK_SECURITY_REPORT.md` |

## Contract-test coverage (brief §18)

`tests/contracts/feelstack-schemas.spec.ts` (13 tests, all passing): valid resolve response, valid routes response, malformed/non-object routes body, missing required fields, invalid locale, invalid content-status enum value (this content model has no generic "block type" — see architecture map §3 — so the closest equivalent, an invalid enum on the one discriminated field that exists, is what's tested), valid/invalid `cmsMedicalServiceSchema` payloads, and all four webhook-body-schema branches (legacy shape, structured shape, unsupported event, unrecognized shape). "Invalid site key" is tested at the resolver level, not the schema level — see `tests/contracts/failure-classification.spec.ts` and `docs/ERROR_HANDLING_REPORT.md`.
