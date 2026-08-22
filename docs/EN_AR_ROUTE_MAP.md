# English ↔ Arabic Route Map

Required Part-1 deliverable — covers **every** registered route, live and gated, not just the live 50. Source of truth is always `src/config/routes.ts`; this is a generated-by-hand mirror, verified against it this pass.

**100% EN/AR path parity confirmed** — every one of the 102 registered routes has both `path.en` and `path.ar` populated (enforced structurally by the `RouteEntry` type, which makes `path` a required `{ en; ar }` object — there is no code path that could register an English-only route). This is also asserted by `tests/seo/seo-validators.spec.ts`.

## Live routes (50 — full detail, matches `docs/EN_AR_ROUTE_MAP.md`'s KEEP list)

See `docs/EN_AR_ROUTE_MAP.md` for the complete existing table — verified current and accurate this pass, no changes needed. Reproduced summary:

| Section | EN root | AR root |
|---|---|---|
| Home | `/` | `/` |
| Medical | `/medical` (+7 services, +1 pricing) | `/الرعاية-الطبية` |
| Aesthetics | `/aesthetics` (+ treatments/concerns/technologies hubs and 22 leaf pages) | `/التجميل-الطبي` |
| Botox | `/botox` | `/بوتوكس` |
| Doctors | `/doctors` (+6 profiles) | `/الأطباء` |
| Patient Resources | `/patient-resources` | `/موارد-المرضى` |
| Health Hub | `/health-hub` | `/المركز-المعرفي` |
| About | `/about` | `/من-نحن` |
| Careers | `/careers` | `/الوظائف` |
| Contact | `/contact` | `/تواصل-معنا` |
| Book Appointment | `/book-appointment` | `/حجز-موعد` |

## Gated routes (52 — Arabic slugs already written, ready the moment each flag flips)

| Section | EN root | AR root |
|---|---|---|
| Medical Botox | `/medical/botox` (+3 conditions) | `/الرعاية-الطبية/بوتوكس` |
| Cosmetic Botox / Skin Tightening | `/aesthetics/treatments/cosmetic-botox`, `/aesthetics/treatments/skin-tightening` | `/التجميل-الطبي/العلاجات/بوتوكس-تجميلي`, `.../شد-البشرة` |
| Aesthetics pricing | `/aesthetics/pricing` | `/التجميل-الطبي/الأسعار` |
| Consultation request | `/aesthetics/consultation` | `/التجميل-الطبي/طلب-استشارة` |
| Before & After | `/aesthetics/before-after` | `/التجميل-الطبي/قبل-وبعد` |
| Legal (4 pages) | `/terms`, `/privacy-policy`, `/accessibility`, `/medical-disclaimer` | Arabic slugs per `src/content/legal-pages.ts` |
| Shop (41 routes: hub, 8 categories, 6 concerns, 23 products, cart, checkout, shipping) | `/shop/...` | `/المتجر/...` |

## Known translation-review flags

- `doctor-gwea`'s Arabic slug (`محمد-فرحات` sibling pattern, transliteration of "Gwea") is pending native-speaker confirmation — tracked in `docs/TRANSLATION_REVIEW_REPORT.md`, not a blocker (the page still renders and functions correctly either way; this is a spelling-refinement flag, not a missing-content flag).
- SkinMedica product Arabic names and detail content (23 products) are professional-convention transliterations/translations and original bilingual copy, not yet reviewed by a native Arabic-speaking marketing reviewer — flagged in `docs/TRANSLATION_REVIEW_REPORT.md`.

## Verification

`tests/seo/seo-validators.spec.ts` — "no duplicate English paths," "no duplicate Arabic paths," "Sitemap contains every published route in both locales" — all passing. `src/proxy.ts`'s `arabicToCanonicalPath` map is auto-derived from this exact registry, so a route added here with both paths populated is automatically reachable via its pretty Arabic URL with zero additional code.
