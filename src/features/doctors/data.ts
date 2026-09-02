import { MEDIA_ROOT } from "@/config/imagekit";
import type { Doctor } from "./types";

export const doctors: Doctor[] = [
  {
    id: "mohamed-farhat",
    routeId: "doctor-farhat",
    name: { en: "Dr. Mohamed Farhat", ar: "د. محمد فرحات" },
    credentials: { en: "Family Physician · Founder", ar: "طبيب أسرة · المؤسس" },
    bio: {
      en: "Dr. Mohamed Farhat is a family physician with more than 28 years of experience. He founded Blue Diamond Medical in West Springs in 2022 and has a wide range of skills across family practice, minor surgical procedures, and cosmetic services, including Botox and PRP therapy.",
      ar: "الدكتور محمد فرحات طبيب أسرة بخبرة تتجاوز 28 عامًا. أسّس عيادة بلو دايموند الطبية في ويست سبرينغز عام 2022، ولديه خبرة واسعة في طب الأسرة، والإجراءات الجراحية البسيطة، والخدمات التجميلية بما فيها البوتوكس وعلاج البلازما الغنية بالصفائح الدموية (PRP).",
    },
    practicesAesthetics: true,
    image: { path: `${MEDIA_ROOT}/doctors/farhat.jpg`, status: "pending" },
    bookingChannel: "family-doctor",
  },
  {
    id: "omaima-saeed",
    routeId: "doctor-saeed",
    name: { en: "Dr. Omaima Saeed", ar: "د. أميمة سعيد" },
    credentials: { en: "Family Physician", ar: "طبيبة أسرة" },
    bio: {
      en: "Dr. Omaima Saeed is a family physician with postgraduate training in Family Medicine from Pakistan, now practicing in Calgary. She provides comprehensive, patient-centred care across all ages, with clinical interests in preventive medicine, women's health, and compassionate, stigma-free mental health support.",
      ar: "الدكتورة أميمة سعيد طبيبة أسرة حاصلة على تدريب عالٍ في طب الأسرة من باكستان، وتمارس حاليًا في كالغاري. تقدّم رعاية شاملة تتمحور حول المريض لجميع الأعمار، وتهتم سريريًا بالطب الوقائي وصحة المرأة والدعم النفسي المتعاطف الخالي من الوصم.",
    },
    practicesAesthetics: false,
    /**
     * CONSENT-PROTECTED, NON-PHOTOGRAPHIC.
     *
     * `photoDeclined: true` is a recorded refusal of photography and it stays
     * exactly as it was: `isHardOverride` (lib/feelstack/media-slots.ts) still
     * treats this record as outranking the CMS, so no media assignment,
     * importer or later pass can ever attach a portrait to Dr. Saeed. That is
     * the guarantee, and nothing below weakens it.
     *
     * What changed is only WHAT IS SHOWN INSTEAD. The empty path rendered the
     * generic FacetTile — the same abstract swatch used for any entity whose
     * media has not arrived — so a deliberate, documented decision was
     * presented to visitors as a missing image. This asset is a designed
     * identity card carrying her name, her professional title (both in EN and
     * AR, so one file serves both locales) and the brand's facet geometry.
     *
     * It contains NO likeness: no photograph, no silhouette, no generated or
     * inferred portrait, no stock substitute. Anyone editing this record must
     * keep it that way — replacing this path with a portrait would override a
     * person's refusal, which is the one thing this whole pipeline exists to
     * prevent (docs/CONTENT_MODEL.md, docs/UI_UX_FOUNDATION.md §18).
     *
     * `status: "approved"` because this is the record the three doctor
     * surfaces read directly, and it is the ONLY control point for her tile —
     * a CMS assignment can never reach her, so gating it on one would gate it
     * on something with no effect. The same asset is registered in FeelStack
     * (`/blue-diamond/team/blue-diamond-team-dr-omaima-saeed-identity.webp`)
     * with its consent metadata for the media library's own audit trail.
     */
    image: {
      path: `${MEDIA_ROOT}/team/blue-diamond-team-dr-omaima-saeed-identity.webp`,
      status: "approved",
      photoDeclined: true,
    },
    bookingChannel: "family-doctor",
  },
  {
    id: "reem-hamdi",
    routeId: "doctor-hamdi",
    name: { en: "Dr. Reem Hamdi", ar: "د. ريم حمدي" },
    credentials: { en: "Family Physician", ar: "طبيبة أسرة" },
    bio: {
      en: "Dr. Reem Hamdi has practiced family medicine since 2015, graduating from the Family Medicine Residency Program at the University of Calgary with additional training in maternity and newborn care. She holds a Master's degree in health science education from the University of Alberta.",
      ar: "تمارس الدكتورة ريم حمدي طب الأسرة منذ عام 2015، وتخرّجت من برنامج إقامة طب الأسرة في جامعة كالغاري، مع تدريب إضافي في رعاية الأمومة والمواليد. تحمل درجة الماجستير في تعليم علوم الصحة من جامعة ألبرتا.",
    },
    practicesAesthetics: false,
    image: { path: `${MEDIA_ROOT}/doctors/hamdi.jpg`, status: "pending" },
    bookingChannel: "family-doctor",
  },
  {
    id: "omonijo",
    routeId: "doctor-omonijo",
    name: { en: "Dr. Omonijo", ar: "د. أومونيجو" },
    credentials: { en: "Family Physician", ar: "طبيبة أسرة" },
    bio: {
      en: "Dr. Omonijo has 12 years of experience across community and hospital settings and completed her Family Medicine residency in the United Kingdom. She is part of Blue Diamond Medical's full-time Walk-In Clinic team.",
      ar: "تتمتع الدكتورة أومونيجو بخبرة 12 عامًا في المجتمعات الطبية والمستشفيات، وأكملت إقامتها في طب الأسرة في المملكة المتحدة. وهي جزء من فريق العيادة بدون موعد بدوام كامل في بلو دايموند الطبية.",
    },
    practicesAesthetics: false,
    image: { path: `${MEDIA_ROOT}/doctors/omonijo.jpg`, status: "pending" },
    bookingChannel: "family-doctor",
  },
  {
    id: "bakare",
    routeId: "doctor-bakare",
    name: { en: "Dr. Bakare", ar: "د. باكاري" },
    credentials: {
      en: "Family Physician · Hospitalist · Assistant Clinical Professor, University of Calgary",
      ar: "طبيب أسرة · طبيب مستشفى · أستاذ سريري مساعد، جامعة كالغاري",
    },
    bio: {
      en: "Dr. Bakare has been a family physician since 2006 and currently maintains hospital credentials as a hospitalist. He has extensive experience in chronic disease management, palliative care, and teaching, with clinical interests including minor skin lesion excision and intra-articular injections for knee, shoulder, and ankle conditions — all available in-house.",
      ar: "يمارس الدكتور باكاري طب الأسرة منذ عام 2006، ويحتفظ حاليًا باعتماد طبيب مستشفى. لديه خبرة واسعة في إدارة الأمراض المزمنة والرعاية التلطيفية والتدريس، ويهتم سريريًا باستئصال الآفات الجلدية البسيطة والحقن داخل المفصل لحالات الركبة والكتف والكاحل، وجميعها متاحة داخل العيادة.",
    },
    practicesAesthetics: false,
    image: { path: `${MEDIA_ROOT}/doctors/bakare.jpg`, status: "pending" },
    bookingChannel: "family-doctor",
  },
  {
    id: "ahmed-gwea",
    routeId: "doctor-gwea",
    name: { en: "Dr. Ahmed Gwea", ar: "د. أحمد جويع" },
    credentials: {
      en: "Family Physician · Diploma in Dermatology, RCPI",
      ar: "طبيب أسرة · دبلوم في الأمراض الجلدية، الكلية الملكية للأطباء في أيرلندا",
    },
    bio: {
      en: "Dr. Ahmed Gwea completed his Family Medicine residency at Hamad Medical Corporation in Qatar and holds a Diploma in Dermatology from the Royal College of Physicians of Ireland. His clinical interests include dermatology, preventive medicine, health promotion, and chronic disease management.",
      ar: "أكمل الدكتور أحمد جويع إقامته في طب الأسرة في مؤسسة حمد الطبية بقطر، ويحمل دبلومًا في الأمراض الجلدية من الكلية الملكية للأطباء في أيرلندا. تشمل اهتماماته السريرية الأمراض الجلدية والطب الوقائي وتعزيز الصحة وإدارة الأمراض المزمنة.",
    },
    practicesAesthetics: false,
    image: { path: `${MEDIA_ROOT}/doctors/gwea.jpg`, status: "pending" },
    bookingChannel: "family-doctor",
  },
];
