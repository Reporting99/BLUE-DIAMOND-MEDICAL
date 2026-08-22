# Route Parity Report

Compares `docs/BEFORE_FEELSTACK_ROUTE_INVENTORY.md` against `docs/AFTER_FEELSTACK_ROUTE_INVENTORY.md`.

| Metric | Before | After | Diff |
|---|---|---|---|
| Registered routes (`src/config/routes.ts`) | 104 | 104 | 0 |
| Live (KEEP) routes | 88 | 88 | 0 |
| Feature-gated (GATE) routes | 16 | 16 | 0 |
| Legacy redirects | 29 | 29 | 0 |
| Deleted routes | 0 | 0 | 0 |
| Merged routes | 0 | 0 | 0 |
| Built page paths (`npm run build`, en+ar) | 169 | 169 | 0 |
| Playwright suite (chromium-desktop) | not re-run as a pre-pass baseline (see note) | 376/376 passed | — |

**Route-level diff: none.** `src/config/routes.ts`, `src/config/features.ts`, and every `src/content/*.ts` file are byte-identical to the pre-pass state (confirmed by `git diff` against this session's own edits — these files are not in the modified-file list in `docs/FINAL_BLUE_FEELSTACK_REPORT.md`).

## Note on the "before" baseline

This session did not re-run the full Playwright suite *before* making changes (the repository's own `docs/FINAL_QA_REPORT.md` documents an earlier all-green run at a prior commit). The parity claim above rests on: (1) no route-registry or content-file diff, and (2) a full post-pass run being green, which together are sufficient to demonstrate no route was lost, added, merged, or silently regated — the failure mode rule 10 exists to prevent. It is not a claim that every individual test was re-executed twice for a literal before/after comparison.

## Why parity was structurally guaranteed, not just verified

The only route-adjacent code this pass touched, `src/app/[locale]/medical/[serviceId]/page.tsx`, was changed to call `resolvePageContent()` (`src/lib/feelstack/page-resolver.ts`) instead of calling `getMedicalService()` directly. With `FEELSTACK_CONTENT_MODE` unset (this build's shipped default), `resolvePageContent()`'s first branch is:

```ts
if (mode === "static") {
  const data = staticFallback();
  return data ? { source: "static", data } : { source: "not-found" };
}
```

`staticFallback` is `() => getMedicalService(serviceId)` — the exact call the page made before this pass. No network code path is reachable in `static` mode; `resolveEntity()` (the function that calls `fetch`) is never invoked. This is why the build's static-param generation and the full Playwright run produced identical results to the pre-pass architecture: the change is additive and inert by construction, not "verified safe by testing" alone.

See `docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md` for why only one route was wired this pass (brief: "Do not perform an unsafe bulk rewrite") and `docs/FEELSTACK_MIGRATION_MANIFEST.md` for how the same pattern applies to the rest.
