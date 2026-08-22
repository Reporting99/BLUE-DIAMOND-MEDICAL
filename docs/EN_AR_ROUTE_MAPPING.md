# English ↔ Arabic Route Mapping

Every route below has meaningful Arabic slugs, not English slugs under `/ar/`. See `src/config/routes.ts` for the registry these are generated from.

| English | Arabic |
|---|---|
| `/en` | `/ar` |
| `/en/medical` | `/ar/الرعاية-الطبية` |
| `/en/aesthetics` | `/ar/التجميل-الطبي` |
| `/en/botox` | `/ar/بوتوكس` |
| `/en/doctors` | `/ar/الأطباء` |
| `/en/doctors/mohamed-farhat` | `/ar/الأطباء/محمد-فرحات` |
| `/en/doctors/omaima-saeed` | `/ar/الأطباء/أميمة-سعيد` |
| `/en/doctors/reem-hamdi` | `/ar/الأطباء/ريم-حمدي` |
| `/en/doctors/omonijo` | `/ar/الأطباء/أومونيجو` |
| `/en/doctors/bakare` | `/ar/الأطباء/باكاري` |
| `/en/doctors/ahmed-gwea` | `/ar/الأطباء/أحمد-جويع` (transliteration pending doctor/native-speaker confirmation — see `docs/TRANSLATION_REVIEW_REPORT.md`) |
| `/en/medical/eye-screening` | `/ar/الرعاية-الطبية/فحص-العين` |
| `/en/medical/after-hours-care` | `/ar/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` |
| `/en/medical/chronic-disease-management` | `/ar/الرعاية-الطبية/إدارة-الأمراض-المزمنة` |
| `/en/medical/preventive-care` | `/ar/الرعاية-الطبية/الرعاية-الوقائية` |
| `/en/medical/weight-management` | `/ar/الرعاية-الطبية/إدارة-الوزن` |
| `/en/medical/pain-management` | `/ar/الرعاية-الطبية/إدارة-الألم` |
| `/en/medical/minor-procedures` | `/ar/الرعاية-الطبية/الإجراءات-البسيطة` |
| `/en/medical/uninsured-services` | `/ar/الرعاية-الطبية/الخدمات-غير-المشمولة` |
| `/en/aesthetics/treatments` (+ 8 treatment pages) | `/ar/التجميل-الطبي/العلاجات` (+ matching Arabic slugs) |
| `/en/aesthetics/concerns` (+ 9 concern pages) | `/ar/التجميل-الطبي/المخاوف-الجمالية` (+ matching Arabic slugs) |
| `/en/aesthetics/technologies` (+ 5 technology pages) | `/ar/التجميل-الطبي/التقنيات` (+ matching Arabic slugs) |
| `/en/patient-resources` | `/ar/موارد-المرضى` |
| `/en/health-hub` | `/ar/المركز-المعرفي` |
| `/en/about` | `/ar/من-نحن` |
| `/en/careers` | `/ar/الوظائف` |
| `/en/contact` | `/ar/تواصل-معنا` |
| `/en/book-appointment` | `/ar/حجز-موعد` |

## How this is implemented

Next.js's file-system router can't hold two differently-named folders (`doctors` vs `الأطباء`) resolving to the same dynamic segment tree, so:

1. Every page physically lives under its **English** slug (e.g. `src/app/[locale]/doctors/[doctorId]/page.tsx`, `src/app/[locale]/medical/[serviceId]/page.tsx`, `src/app/[locale]/aesthetics/treatments/[treatmentId]/page.tsx`).
2. `src/proxy.ts` rewrites the pretty Arabic URL to the canonical English-slug path **on the same locale**, invisibly to the visitor (`NextResponse.rewrite`, not a redirect — the address bar keeps the Arabic URL).
3. `src/lib/seo/metadata.ts` and `src/config/routes.ts#href()` always compute canonical/hreflang/nav links from the registry, so nothing hardcodes either slug outside that one file.

Verified in `tests/e2e/locale-routing.spec.ts` ("pretty Arabic doctor-hub URL resolves without a redirect loop") — this test caught a real bug (percent-encoded pathnames from `request.nextUrl.pathname` need `decodeURIComponent()` before matching the Arabic slug map) during this build.
