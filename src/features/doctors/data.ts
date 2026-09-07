import { MEDIA_ROOT } from "@/config/imagekit";
import type { Doctor } from "./types";

/**
 * ARABIC TRANSLATION IS A CLIENT DEPENDENCY (CL-028, CL-029).
 *
 * The client supplied new, exact English biographies for Dr. Mohamed Farhat
 * and Dr. Ahmed Gwea and no Arabic rendering of either. Their previously
 * approved Arabic biographies are therefore kept as-is rather than being
 * machine-translated from the new English — publishing an invented Arabic
 * medical biography is the one thing this repository never does. The two
 * locales are consequently out of step for these two records until approved
 * Arabic copy arrives; see the completion report's Blocked items section.
 *
 * CL-030: every other biography is untouched. The client approved their
 * current wording, so nothing here expands, shortens or "improves" them.
 */
export const doctors: Doctor[] = [
  {
    id: "mohamed-farhat",
    routeId: "doctor-farhat",
    name: { en: "Dr. Mohamed Farhat", ar: "د. محمد فرحات" },
    credentials: { en: "Family Physician · Founder", ar: "طبيب أسرة · المؤسس" },
    bio: {
      en: "Dr. Mohamed Farhat is a highly experienced family physician with over 30 years of dedicated practice. He is known for his exceptional clinical expertise, compassionate approach, and commitment to delivering high\u2011quality care to every patient. Over the course of his career, Dr. Farhat has developed extensive skills in managing a wide range of medical conditions, performing minor surgical procedures, and providing comprehensive family medicine services.\n\nAlongside his strong medical background, Dr. Farhat has completed advanced training in cosmetic medicine. He offers a variety of aesthetic treatments, including Botox, dermal fillers, RF microneedling, and laser therapies for multiple skin concerns such as aging, pigmentation, scarring, and texture irregularities.\n\nDr. Farhat also specializes in hair restoration treatments. He provides laser hair restoration combined with PRP, PRP\u2011only hair restoration, and PRP injections for enhanced scalp health and hair regrowth. In addition, he performs PRP injections under the eyes to improve dark circles, rejuvenate the skin, and restore a brighter, refreshed appearance. These treatments can be complemented with microneedling for optimal skin renewal and collagen stimulation.\n\nWith a blend of medical precision and aesthetic artistry, Dr. Farhat is dedicated to helping patients look and feel their best. His warm manner, attention to detail, and patient\u2011centered approach make him a trusted physician within the community.",
      ar: "الدكتور محمد فرحات طبيب أسرة بخبرة تتجاوز 30 عامًا. أسّس عيادة بلو دايموند الطبية في ويست سبرينغز عام 2022، ولديه خبرة واسعة في طب الأسرة، والإجراءات الجراحية البسيطة، والخدمات التجميلية بما فيها البوتوكس وعلاج البلازما الغنية بالصفائح الدموية (PRP).",
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
      en: "Dr. Omaima Saeed is a family physician with postgraduate training in Family Medicine from Pakistan, now practicing in Calgary. She provides comprehensive, patient-centred care across all ages, with clinical interests in preventive medicine, women's health, and compassionate, stigma-free mental health support. She is one of the physicians leading Blue Diamond Medical's full-time Walk-In Clinic.",
      ar: "الدكتورة أميمة سعيد طبيبة أسرة حاصلة على تدريب عالٍ في طب الأسرة من باكستان، وتمارس حاليًا في كالغاري. تقدّم رعاية شاملة تتمحور حول المريض لجميع الأعمار، وتهتم سريريًا بالطب الوقائي وصحة المرأة والدعم النفسي المتعاطف الخالي من الوصم. وهي من الأطباء الذين يقودون العيادة بدون موعد بدوام كامل في بلو دايموند الطبية.",
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
      /**
       * CL-025. The identity card prints her name and title in BOTH English
       * and Arabic, which is correct on the Arabic site and misleading on the
       * English one: an English-language visitor reading Arabic script beside
       * her name reasonably infers she speaks or reads Arabic, and no
       * approved source says that. English surfaces therefore fall back to
       * the branded FacetTile, exactly as they did before this asset existed.
       * Her English name, title, biography and booking actions are untouched.
       */
      locales: ["ar"],
    },
    bookingChannel: "family-doctor",
  },
  {
    id: "reem-hamdi",
    routeId: "doctor-hamdi",
    name: { en: "Dr. Reem Hamdi", ar: "د. ريم حمدي" },
    credentials: { en: "Family Physician", ar: "طبيبة أسرة" },
    /* CL-034 — client-approved biography, verbatim. The pasted "&#x20;"
       artifacts are decoded as ordinary spaces and nothing else is changed:
       no shortening, rewriting, summarising or grammar correction. The
       CL-027 availability sentence is rendered BELOW this text by the
       profile template, never spliced into the approved copy. Arabic is a
       client dependency (see the file header) — the previously approved
       Arabic biography is kept rather than machine-translated. */
    bio: {
      en: "Dr. Hamdi finished her Family Medicine Residency at the University of Calgary in 2015 followed by additional training (R3) in maternity and newborn care. She has been practicing Family Medicine in Calgary since then and she joined our clinic in 2023.\n\nShe also works at Peter Lougheed Hospital in Labour and Delivery unit and she has a shared care practice with the Lougheed Maternity Group (LMG).\n\nDr. Hamdi is board certified from the College of Family Physicians of Canada (CFPC) and has been granted Fellowship in the College of Family Physicians of Canada (FCFP). She is also an Assistant Clinical Professor at the University of Calgary and has Masters in Health Science Education from the University of Alberta.\n\nShe manages a wide range of health conditions including chronic disease, women health (including contraceptive management and IUD insertion, menopause, prenatal and maternity care), well child visits and mental health. She is also certified for Botox injections for pain management in addition to cosmetic indications.\n\nBlue Diamond Medical is proud to have her as part of our team.",
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
      en: "Dr. Omonijo has 12 years of experience across community and hospital settings and completed her Family Medicine residency in the United Kingdom. She is one of the physicians leading Blue Diamond Medical's full-time Walk-In Clinic.",
      ar: "تتمتع الدكتورة أومونيجو بخبرة 12 عامًا في المجتمعات الطبية والمستشفيات، وأكملت إقامتها في طب الأسرة في المملكة المتحدة. وهي من الأطباء الذين يقودون العيادة بدون موعد بدوام كامل في بلو دايموند الطبية.",
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
      en: "Dr. Ahmed Gwea completed his Family Medicine residency at Hamad Medical Corporation in Qatar and holds a Diploma in Dermatology from the Royal College of Physicians of Ireland. He is dedicated to providing compassionate, patient-centred care, with a focus on preventive health, health promotion, chronic disease management, and mental well-being. His clinical interests include dermatology, dermatological and minor office-based procedures, and plasma therapy, with an emphasis on helping patients feel comfortable, informed, and supported in their care. He is one of the physicians leading Blue Diamond Medical's full-time Walk-In Clinic.",
      ar: "أكمل الدكتور أحمد جويع إقامته في طب الأسرة في مؤسسة حمد الطبية بقطر، ويحمل دبلومًا في الأمراض الجلدية من الكلية الملكية للأطباء في أيرلندا. تشمل اهتماماته السريرية الأمراض الجلدية والطب الوقائي وتعزيز الصحة وإدارة الأمراض المزمنة. وهو من الأطباء الذين يقودون العيادة بدون موعد بدوام كامل في بلو دايموند الطبية.",
    },
    practicesAesthetics: false,
    image: { path: `${MEDIA_ROOT}/doctors/gwea.jpg`, status: "pending" },
    bookingChannel: "family-doctor",
  },
];
