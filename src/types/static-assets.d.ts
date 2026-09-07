/**
 * Type declarations for static asset imports (`import mark from "@/assets/…png"`).
 *
 * WHY THIS FILE EXISTS, AND WHY IT IS COMMITTED.
 *
 * Next generates `next-env.d.ts`, which carries
 * `/// <reference types="next/image-types/global" />` — the declaration that
 * makes a `.png` import type-check. That file is **gitignored** and is written
 * by `next build` / `next dev`.
 *
 * CI runs Typecheck BEFORE Build (.github/workflows/ci.yml), so on a fresh
 * checkout `next-env.d.ts` does not exist yet and every static image import
 * fails with:
 *
 *   error TS2307: Cannot find module '@/assets/brand/blue-diamond-mark.png'
 *
 * It passes on any developer machine that has ever built, which is exactly the
 * kind of difference that only ever shows up in CI. Committing the reference
 * makes the typecheck independent of build order and of whether a generated
 * file happens to be present.
 *
 * It re-uses Next's own declarations rather than hand-rolling `declare module
 * "*.png"`, so the imported value keeps its real `StaticImageData` type —
 * `.src`, `.width`, `.height` — instead of degrading to `any`.
 */
/// <reference types="next/image-types/global" />
