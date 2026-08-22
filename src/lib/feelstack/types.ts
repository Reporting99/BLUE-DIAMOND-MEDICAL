/**
 * @deprecated Re-export shim only. The FeelStack response schemas moved to
 * `./schemas.ts` (brief §1 target structure: `contracts.ts` / `schemas.ts`
 * / `errors.ts` as separate files). Kept so any external reference to
 * `src/lib/feelstack/types` does not break; import from `./schemas`
 * directly in new code.
 */
export * from "./schemas";
