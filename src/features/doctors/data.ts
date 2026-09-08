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
 * CL-030 IS SUPERSEDED for English, 2026-09-07. It recorded that the client
 * had approved each biography's then-current wording and that nothing should
 * "improve" it. The client has since commissioned a native-Canadian-English
 * editorial pass over the whole site, naming physician profiles explicitly and
 * supplying a worked before/after for Dr. Omonijo. The English biographies
 * below are therefore edited: grammar, article and preposition errors,
 * run-on sentences, and unearned superlatives are gone.
 *
 * FACTS ARE UNTOUCHED. No qualification, institution, date, year count,
 * hospital privilege, certification, clinical interest or procedure was added,
 * removed or altered in any biography. Only the sentences carrying them
 * changed. If the client wants the pre-edit wording back, it is one revert
 * away and the audit report lists every change.
 *
 * ARABIC IS UNCHANGED throughout, so the two locales remain out of step for
 * Dr. Farhat and Dr. Gwea exactly as CL-028/CL-029 already recorded.
 */
export const doctors: Doctor[] = [
  {
    id: "mohamed-farhat",
    routeId: "doctor-farhat",
    name: { en: "Dr. Mohamed Farhat", ar: "د. محمد فرحات" },
    credentials: { en: "Family Physician · Founder", ar: "طبيب أسرة · المؤسس" },
    bio: {
      en: "Dr. Mohamed Farhat is a family physician with over 30 years in practice, and the founder of Blue Diamond Medical. He looks after patients across the full range of family medicine, from managing long-term medical conditions to performing minor surgical procedures in the clinic.\n\nAlongside his family practice, Dr. Farhat has completed advanced training in cosmetic medicine. He offers Botox, dermal fillers, RF microneedling, and laser therapies for skin concerns such as aging, pigmentation, scarring, and uneven texture.\n\nHe also provides hair restoration treatments: laser hair restoration combined with PRP, PRP on its own, and PRP injections to support scalp health and hair regrowth. He performs PRP injections under the eyes to soften the appearance of dark circles and refresh the skin, and these can be paired with microneedling to support skin renewal and collagen stimulation.\n\nHis warm manner, attention to detail, and patient-centred approach have made him a trusted physician in the community.",
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
      en: "Dr. Omaima Saeed is a family physician with postgraduate training in Family Medicine from Pakistan, now practising in Calgary. She provides comprehensive, patient-centred care for patients of all ages, with clinical interests in preventive medicine, women's health, and compassionate, stigma-free mental health support. She is one of the physicians leading Blue Diamond Medical's full-time walk-in clinic.",
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
    /* CL-034 recorded this biography as client-approved verbatim, explicitly
       barring "shortening, rewriting, summarising or grammar correction".
       The 2026-09-07 editorial pass overrides that for English only — see the
       file header. This profile carried the most non-native English on the
       site: "board certified FROM the College" (takes "by"), "in Labour and
       Delivery unit" (missing article), "women health" (missing possessive),
       "has Masters in" (missing article and apostrophe), "well child visits"
       (missing hyphen), and three sentences running on through a repeated
       "and she". Every credential, institution, date and clinical interest is
       preserved exactly. The closing "Blue Diamond Medical is proud to have
       her as part of our team" is dropped: it slipped from third person into
       first, and no other profile ends with a house compliment.

       The CL-027 availability sentence is still rendered BELOW this text by
       the profile template, never spliced into it. Arabic is a client
       dependency (see the file header) and is kept as approved. */
    bio: {
      en: "Dr. Hamdi completed her Family Medicine residency at the University of Calgary in 2015, followed by additional training (R3) in maternity and newborn care. She has practised family medicine in Calgary ever since, and joined Blue Diamond Medical in 2023.\n\nShe also works in the Labour and Delivery unit at Peter Lougheed Hospital and maintains a shared-care practice with the Lougheed Maternity Group (LMG).\n\nDr. Hamdi is certified by the College of Family Physicians of Canada (CFPC) and has been granted Fellowship of the College (FCFP). She is an Assistant Clinical Professor at the University of Calgary and holds a Master's degree in Health Science Education from the University of Alberta.\n\nShe cares for a wide range of health concerns, including chronic disease, women's health (contraceptive management and IUD insertion, menopause, and prenatal and maternity care), well-child visits, and mental health. She is also certified to provide Botox injections for pain management as well as cosmetic indications.",
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
      en: "Dr. Omonijo has 12 years of experience in community and hospital settings. She completed her Family Medicine residency in the United Kingdom and enjoys caring for patients and their families. She is one of the physicians leading Blue Diamond Medical's full-time walk-in clinic.",
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
      en: "Dr. Bakare has been a family physician since 2006 and also works as a hospitalist, maintaining his hospital credentials alongside his practice here. He has extensive experience in chronic disease management, palliative care, and teaching. His clinical interests include minor skin lesion excision and intra-articular injections for the knee, shoulder, and ankle, all of which are done in-house.",
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
      en: "Dr. Ahmed Gwea completed his Family Medicine residency at Hamad Medical Corporation in Qatar and holds a Diploma in Dermatology from the Royal College of Physicians of Ireland. He provides compassionate, patient-centred care, with a focus on preventive health, health promotion, chronic disease management, and mental well-being. His clinical interests include dermatology, minor office-based and dermatological procedures, and plasma therapy. He places particular emphasis on helping patients feel comfortable, informed, and supported in their care. He is one of the physicians leading Blue Diamond Medical's full-time walk-in clinic.",
      ar: "أكمل الدكتور أحمد جويع إقامته في طب الأسرة في مؤسسة حمد الطبية بقطر، ويحمل دبلومًا في الأمراض الجلدية من الكلية الملكية للأطباء في أيرلندا. تشمل اهتماماته السريرية الأمراض الجلدية والطب الوقائي وتعزيز الصحة وإدارة الأمراض المزمنة. وهو من الأطباء الذين يقودون العيادة بدون موعد بدوام كامل في بلو دايموند الطبية.",
    },
    practicesAesthetics: false,
    image: { path: `${MEDIA_ROOT}/doctors/gwea.jpg`, status: "pending" },
    bookingChannel: "family-doctor",
  },
];
