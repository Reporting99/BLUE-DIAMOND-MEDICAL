import type { AestheticConcern } from "./types";

/**
 * Source: Blue-Diamond-Medical-Website-Content-Extraction_1.docx. Several
 * concern pages on the legacy site linked their "learn more" to
 * /laser-hair-removal even where the concern (redness, spider veins, sun
 * damage) has nothing to do with hair removal and everything to do with
 * general laser skin treatment — the extraction doc itself flags a similar
 * mislink elsewhere ("Ultra Treatment — links to /prp-therapy, mislabeled").
 * Rather than propagate that apparent CMS bug, those concerns are
 * cross-linked here to Laser Skin Treatments, whose own content explicitly
 * covers redness, spider veins, and pigmentation. Flagged with
 * `correctedFromSource: true`. See docs/CONTENT_MODEL.md.
 */
export const concerns: AestheticConcern[] = [
  /**
   * Unwanted Hair and Hair Loss are concern-level entry points added when the
   * Aesthetics IA became concern-first — the "Treatments" menu IS the concern
   * list, so the two hair problems a visitor actually arrives with needed a
   * door of their own. Neither entry invents anything: every sentence below is
   * approved Laser Hair Removal / PRP Hair Restoration content from
   * Blue-Diamond-Medical-Website-Content-Extraction_1.docx, restated as the
   * patient's problem rather than as the device. The treatment pages stay live
   * and carry the full detail — src/features/aesthetics/data/treatments.ts.
   */
  {
    id: "unwanted-hair",
    slug: "unwanted-hair",
    slugAr: "الشعر-غير-المرغوب-فيه",
    title: { en: "Unwanted Hair", ar: "الشعر غير المرغوب فيه" },
    summary: {
      en: "Shaving, waxing, plucking, and depilatories are time-consuming and give only temporary results. Laser hair removal at Blue Diamond Medical offers long-lasting reduction anywhere on the body, and the Skintel™ melanin reader allows the laser to be set safely for all skin types.",
      ar: "تقليل دائم لنمو الشعر في أي منطقة من الجسم باستخدام نظام ليزر Cynosure Elite+™، مع قارئ الميلانين Skintel™ الذي يتيح علاجًا آمنًا لجميع أنواع البشرة.",
    },
    commonPresentations: {
      en: "Unwanted hair is treated on the face, back, legs, chest, underarms, bikini area, and upper lip — the Elite iQ™ device can be used anywhere on the body.",
      ar: "يُعالَج الشعر غير المرغوب فيه في الوجه، والظهر، والساقين، والصدر، والإبطين، ومنطقة البكيني، والشفة العليا — ويمكن استخدام جهاز Elite iQ™ في أي منطقة من الجسم.",
    },
    contributingFactors: {
      en: "Hair grows in a three-phase cycle — anagen (active growth), catagen, and telogen (resting). Only follicles in the anagen phase respond fully to laser energy, which is why hair returns between sessions and why a course of treatments is needed.",
      ar: "ينمو الشعر ضمن دورة من ثلاث مراحل — النمو النشط، ثم مرحلة الانتقال، ثم مرحلة الراحة. ولا تستجيب لطاقة الليزر بشكل كامل سوى البصيلات في مرحلة النمو النشط، ولهذا يعود الشعر بين الجلسات ويلزم إجراء سلسلة منها.",
    },
    relatedTreatmentIds: ["laser-hair-removal"],
    relatedConcernIds: ["razor-bumps"],
    faqs: [
      {
        question: { en: "How does Elite iQ™ work?", ar: "كيف يعمل جهاز Elite iQ™؟" },
        answer: {
          en: "It uses the Skintel™ device — the first melanin reader on the market cleared by both Health Canada and the FDA — allowing safe treatment of all skin types and areas.",
          ar: "يستخدم جهاز Skintel™ — أول قارئ ميلانين معتمد من هيئة الصحة الكندية وإدارة الغذاء والدواء الأمريكية — مما يتيح علاجًا آمنًا لجميع أنواع البشرة والمناطق.",
        },
      },
      {
        question: { en: "How many laser hair removal treatments will I need?", ar: "كم عدد الجلسات التي سأحتاجها؟" },
        answer: {
          en: "Treatment times vary by area, but a session usually takes less than 30 minutes. Multiple sessions are needed because not all hairs are actively growing at once. Book a consultation to discuss the areas you would like treated.",
          ar: "تختلف مدة الجلسة حسب المنطقة، لكنها عادة أقل من 30 دقيقة. ويلزم عدة جلسات لأن الشعر لا ينمو كله في وقت واحد. تحدثوا مع مقدم الرعاية لتحديد استشارة ومناقشة المناطق المطلوب علاجها.",
        },
      },
      {
        question: { en: "Where are these treatments performed?", ar: "أين تُجرى هذه العلاجات؟" },
        answer: {
          en: "All Elite iQ™ treatments are performed exclusively at Citizen Studio, 45 Greenbriar Dr NW, Calgary, AB T3B 5N4 — not at the West Springs clinic.",
          ar: "تُجرى جميع علاجات Elite iQ™ حصريًا في Citizen Studio، 45 Greenbriar Dr NW، كالغاري، AB T3B 5N4 — وليس في عيادة ويست سبرينغز.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "hair-loss",
    slug: "hair-loss",
    slugAr: "تساقط-الشعر",
    title: { en: "Hair Loss", ar: "تساقط الشعر" },
    summary: {
      en: "Thinning hair and early hair loss affect both men and women, and often begin gradually enough that they are noticed first in a mirror or a photograph. Blue Diamond Medical offers PRP hair restoration, performed by Dr. Farhat, which may support fuller growth. A consultation establishes the likely cause before any treatment is planned.",
      ar: "حقن البلازما الغنية بالصفائح الدموية في فروة الرأس لتنشيط البصيلات الخاملة وتعزيز نمو شعر أكثف وأكمل — يُجريها الدكتور فرحات.",
    },
    commonPresentations: {
      en: "Individuals noticing thinning hair or early hair loss.",
      ar: "الأشخاص الذين يلاحظون ترقق الشعر أو تساقطه المبكر.",
    },
    relatedTreatmentIds: ["prp-hair-restoration"],
    faqs: [
      {
        question: { en: "How does PRP address hair loss?", ar: "كيف تعالج البلازما تساقط الشعر؟" },
        answer: {
          en: "PRP is a regenerative serum created from the patient's own blood. After a blood draw, plasma is separated and concentrated into a serum rich in growth factors that stimulate inactive hair follicles and improve scalp blood circulation.",
          ar: "البلازما الغنية بالصفائح الدموية مصل تجديدي يُستخرج من دم المريض نفسه. بعد سحب عينة دم، يُفصَل البلازما ويُركَّز في مصل غني بعوامل النمو التي تُنشّط بصيلات الشعر الخاملة وتُحسّن الدورة الدموية في فروة الرأس.",
        },
      },
      {
        question: { en: "Who performs PRP at Blue Diamond Medical?", ar: "من يُجري علاج البلازما في بلو دايموند الطبية؟" },
        answer: {
          en: "PRP treatments are performed by Dr. Farhat, combining advanced technique with personalized care.",
          ar: "يُجري الدكتور فرحات علاجات البلازما، جامعًا بين التقنية المتقدمة والرعاية الشخصية.",
        },
      },
      {
        question: { en: "How many sessions will I need?", ar: "كم عدد الجلسات التي سأحتاجها؟" },
        answer: {
          en: "Most people benefit from a series of 3–4 treatments spaced a few weeks apart; maintenance sessions may be recommended. Each session takes 30 to 60 minutes depending on the treatment area, with little to no downtime.",
          ar: "يستفيد معظم الأشخاص من سلسلة من 3 إلى 4 جلسات بفاصل بضعة أسابيع؛ قد يُنصح بجلسات صيانة لاحقًا. وتستغرق كل جلسة من 30 إلى 60 دقيقة حسب المنطقة المعالجة، مع تعافٍ محدود أو معدوم.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "acne-scars",
    slug: "acne-scars",
    slugAr: "ندبات-حب-الشباب",
    title: { en: "Acne Scars", ar: "ندبات حب الشباب" },
    summary: {
      en: "Comprehensive care for acne scarring — medical consultations, prescriptions where necessary, and RF microneedling and laser treatments to reduce scarring, under the supervision of one of our physicians.",
      ar: "رعاية شاملة لندبات حب الشباب — استشارات طبية، ووصفات عند الحاجة، وعلاجات بالإبر الدقيقة بالترددات الراديوية والليزر لتقليل الندبات، تحت إشراف أحد أطبائنا.",
    },
    relatedTreatmentIds: ["rf-microneedling"],
    faqs: [
      {
        question: { en: "How does care for acne scarring start?", ar: "كيف تبدأ رعاية ندبات حب الشباب؟" },
        answer: {
          en: "With a medical consultation — from there, a physician may recommend a prescription where necessary, alongside treatments like RF microneedling and laser.",
          ar: "تبدأ باستشارة طبية — وبناءً عليها، قد يوصي الطبيب بوصفة طبية عند الحاجة، إلى جانب علاجات مثل الإبر الدقيقة بالترددات الراديوية والليزر.",
        },
      },
      {
        question: { en: "Is this care physician-supervised?", ar: "هل هذه الرعاية تحت إشراف طبي؟" },
        answer: {
          en: "Yes — every step, from consultation to treatment, is supervised by one of our physicians.",
          ar: "نعم — تخضع كل خطوة، من الاستشارة إلى العلاج، لإشراف أحد أطبائنا.",
        },
      },
      {
        question: { en: "Which treatment is used for acne scarring?", ar: "ما العلاج المستخدم لندبات حب الشباب؟" },
        answer: {
          en: "RF microneedling is the treatment linked to this concern; a physician will confirm what's appropriate for your specific scarring during your consultation.",
          ar: "تُستخدم الإبر الدقيقة بالترددات الراديوية لهذه المخاوف؛ وسيؤكد الطبيب ما يناسب حالة ندباتكم تحديدًا خلال الاستشارة.",
        },
      },
      {
        question: { en: "Will a prescription always be part of my care?", ar: "هل ستكون الوصفة الطبية جزءًا من رعايتي دائمًا؟" },
        answer: {
          en: "Not necessarily — prescriptions are provided where necessary, based on your physician's assessment.",
          ar: "ليس بالضرورة — تُقدَّم الوصفات عند الحاجة، بناءً على تقييم طبيبكم.",
        },
      },
      {
        question: { en: "How do I book a consultation?", ar: "كيف أحجز استشارة؟" },
        answer: {
          en: "Through Mikata, our external booking system. For all aesthetic treatment appointments, book a 20-minute consultation with Dr. Farhat.",
          ar: "عبر نظام Mikata، نظام الحجز الخارجي الخاص بنا. تبدأ جميع مواعيد العلاجات التجميلية باستشارة مع الطبيب.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "rosacea-redness",
    slug: "rosacea-redness",
    slugAr: "الوردية-والاحمرار",
    title: { en: "Rosacea & Redness", ar: "الوردية والاحمرار" },
    summary: {
      en: "The gentle flush of rosacea can escalate into redness that's distressing to live with. We take a holistic approach, starting with a full medical consultation to discuss what can be achieved — laser treatments often work best for this condition.",
      ar: "قد يتطور احمرار الوردية الخفيف إلى احمرار مزعج. نتبع نهجًا شاملًا يبدأ باستشارة طبية كاملة لمناقشة النتائج الممكنة — وغالبًا ما تكون علاجات الليزر الأنسب لهذه الحالة.",
    },
    relatedTreatmentIds: ["laser-skin-treatments"],
    correctedFromSource: true,
    faqs: [
      {
        question: { en: "Where does treatment for rosacea and redness start?", ar: "من أين يبدأ علاج الوردية والاحمرار؟" },
        answer: {
          en: "With a full medical consultation to discuss what can realistically be achieved for your specific presentation.",
          ar: "تبدأ باستشارة طبية كاملة لمناقشة النتائج الممكنة واقعيًا لحالتكم تحديدًا.",
        },
      },
      {
        question: { en: "What treatment is generally used for rosacea and redness?", ar: "ما العلاج المستخدم عادةً للوردية والاحمرار؟" },
        answer: {
          en: "Laser treatments often work best for this condition — Laser Skin Treatments is the relevant treatment page.",
          ar: "غالبًا ما تكون علاجات الليزر الأنسب لهذه الحالة — وصفحة علاجات الليزر للبشرة هي الصفحة ذات الصلة.",
        },
      },
      {
        question: { en: "Will rosacea come back after treatment?", ar: "هل تعود الوردية بعد العلاج؟" },
        answer: {
          en: "Results and their duration vary by individual — your physician will discuss realistic expectations for your case during the consultation.",
          ar: "تختلف النتائج ومدتها من شخص لآخر — سيناقش طبيبكم التوقعات الواقعية لحالتكم خلال الاستشارة.",
        },
      },
      {
        question: { en: "Is rosacea the same as general facial redness?", ar: "هل الوردية هي نفسها الاحمرار العام للوجه؟" },
        answer: {
          en: "Rosacea is one cause of facial redness; a physician consultation is the way to understand what's contributing to your specific redness.",
          ar: "الوردية هي أحد أسباب احمرار الوجه؛ والاستشارة الطبية هي الوسيلة لفهم ما يسهم في احمرار وجهكم تحديدًا.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "dry-skin",
    slug: "dry-skin",
    slugAr: "جفاف-البشرة",
    title: { en: "Dry Skin", ar: "جفاف البشرة" },
    summary: {
      en: "Calgary's climate is unusually harsh on skin. Using RF microneedling to infuse topicals — including moisturizers and pigment regulators — we help skin stay nourished and comfortable for months after treatment.",
      ar: "يُعد مناخ كالغاري قاسيًا بشكل خاص على البشرة. باستخدام الإبر الدقيقة بالترددات الراديوية لإدخال المستحضرات الموضعية — بما فيها المرطبات ومنظمات الصبغة — نساعد البشرة على البقاء رطبة ومشرقة لأشهر بعد العلاج.",
    },
    relatedTreatmentIds: ["rf-microneedling"],
    faqs: [
      {
        question: { en: "Does Calgary's climate affect dry skin?", ar: "لماذا يُذكر مناخ كالغاري عند الحديث عن العناية بالبشرة الجافة؟" },
        answer: {
          en: "Calgary's climate is unusually harsh on skin, which is part of why ongoing nourishment support can be worthwhile for many patients here.",
          ar: "مناخ كالغاري قاسٍ بشكل خاص على البشرة، وهو أحد أسباب أهمية دعم الترطيب المستمر لكثير من المرضى هنا.",
        },
      },
      {
        question: { en: "How does RF microneedling help with dry skin?", ar: "كيف تساعد الإبر الدقيقة بالترددات الراديوية في علاج جفاف البشرة؟" },
        answer: {
          en: "It's used to infuse topicals — including moisturizers and pigment regulators — helping skin stay nourished for months after treatment.",
          ar: "تُستخدم لإدخال المستحضرات الموضعية — بما فيها المرطبات ومنظمات الصبغة — مما يساعد البشرة على البقاء رطبة لأشهر بعد العلاج.",
        },
      },
      {
        question: { en: "How long does the nourishing effect last?", ar: "كم تدوم فائدة الترطيب؟" },
        answer: {
          en: "Effects can last for months after treatment, though this varies by individual.",
          ar: "قد تستمر الفائدة لأشهر بعد العلاج، إلا أن ذلك يختلف من شخص لآخر.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "fine-lines-wrinkles",
    slug: "fine-lines-wrinkles",
    slugAr: "الخطوط-الدقيقة-والتجاعيد",
    title: { en: "Fine Lines & Wrinkles", ar: "الخطوط الدقيقة والتجاعيد" },
    summary: {
      en: "Fine lines and wrinkles develop as skin gradually loses collagen and elasticity. Blue Diamond Medical offers radiofrequency and RF microneedling treatments that may soften their appearance and firm the skin, planned around your skin type and goals during a consultation.",
      ar: "تقنيات متطورة لتنعيم الخطوط الدقيقة والتجاعيد ومحوها، إلى جانب خيارات شدّ البشرة لمختلف أنواعها — علاجات مخصصة تناسب كل حالة.",
    },
    relatedTreatmentIds: ["rf-microneedling", "radio-frequency"],
    faqs: [
      {
        question: { en: "What treatments address fine lines and wrinkles?", ar: "ما العلاجات التي تعالج الخطوط الدقيقة والتجاعيد؟" },
        answer: {
          en: "RF microneedling and radiofrequency skin tightening are the two treatments connected to this concern, suited to different skin types.",
          ar: "الإبر الدقيقة بالترددات الراديوية وشدّ البشرة بالترددات الراديوية هما العلاجان المرتبطان بهذه المخاوف، ويناسبان أنواع بشرة مختلفة.",
        },
      },
      {
        question: { en: "Is treatment the same for everyone?", ar: "هل العلاج نفسه لكل الأشخاص؟" },
        answer: {
          en: "No — each treatment is planned around your own skin during a consultation.",
          ar: "لا — العلاجات مخصصة وتُصمَّم بحسب بشرتكم تحديدًا خلال الاستشارة.",
        },
      },
      {
        question: { en: "Do these treatments also help with skin tightening, not just lines?", ar: "هل تساعد هذه العلاجات أيضًا على شدّ البشرة، وليس فقط الخطوط؟" },
        answer: {
          en: "Yes — skin-tightening options are available alongside the line-smoothing treatments, for all skin types.",
          ar: "نعم — تتوفر خيارات شدّ البشرة إلى جانب علاجات تنعيم الخطوط، لمختلف أنواع البشرة.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "skin-laxity",
    slug: "skin-laxity",
    slugAr: "ترهل-البشرة",
    title: { en: "Skin Laxity", ar: "ترهل البشرة" },
    summary: {
      en: "Skin loses firmness as the collagen and elastin that support it gradually decline. Radiofrequency treatment at Blue Diamond Medical warms the deeper layers of the skin to encourage collagen production, which may help tighten and smooth areas of laxity on the face and body. Sessions take about 15 minutes, most patients find them comfortable, and downtime is usually minimal. Results vary, and a consultation confirms whether the treatment suits you.",
      ar: "تُحفّز موجات الترددات الراديوية إنتاج الكولاجين والإيلاستين لشدّ البشرة وتنعيمها في مختلف مناطق الجسم — علاج سريع وغير مؤلم (نحو 15 دقيقة) بنتائج واضحة ودون تعافٍ.",
    },
    relatedTreatmentIds: ["radio-frequency"],
    faqs: [
      {
        question: { en: "How does radiofrequency treatment address skin laxity?", ar: "كيف يعالج علاج الترددات الراديوية ترهل البشرة؟" },
        answer: {
          en: "It promotes collagen and elastin production, which helps tighten and smooth skin across the body.",
          ar: "يحفّز إنتاج الكولاجين والإيلاستين، مما يساعد على شدّ البشرة وتنعيمها في مختلف مناطق الجسم.",
        },
      },
      {
        question: { en: "How long does a radiofrequency session take?", ar: "كم تستغرق الجلسة؟" },
        answer: {
          en: "About 15 minutes.",
          ar: "نحو 15 دقيقة.",
        },
      },
      {
        question: { en: "Is there downtime after treatment?", ar: "هل هناك فترة تعافٍ بعد العلاج؟" },
        answer: {
          en: "This treatment is not typically associated with downtime, though your physician will confirm what to expect for the area being treated.",
          ar: "لا يرتبط هذا العلاج بأي فترة تعافٍ.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "spider-veins",
    slug: "spider-veins",
    slugAr: "الأوردة-العنكبوتية",
    title: { en: "Spider Veins", ar: "الأوردة العنكبوتية" },
    summary: {
      en: "Damaged blood vessels under the skin that can appear red, blue, or purple. They are generally harmless, though many patients find them distracting. Laser treatment may reduce their appearance on the face and legs, and most patients describe the sessions as quick and comfortable. Results vary, and a consultation confirms whether it suits you.",
      ar: "أوعية دموية تالفة تحت الجلد قد تظهر باللون الأحمر أو الأزرق أو الأرجواني — غير ضارة عادةً لكنها مزعجة جماليًا. يمكن لعلاجات الليزر إزالتها من أي منطقة في الجسم بسرعة ودون ألم.",
    },
    relatedTreatmentIds: ["laser-skin-treatments"],
    correctedFromSource: true,
    faqs: [
      {
        question: { en: "Are spider veins a health concern?", ar: "هل الأوردة العنكبوتية مشكلة صحية؟" },
        answer: {
          en: "They're generally harmless but can be unsightly — treatment is typically for cosmetic reasons, though your physician will assess your specific case.",
          ar: "غير ضارة عادةً لكنها قد تكون مزعجة جماليًا — ويكون العلاج عادةً لأسباب تجميلية، إلا أن طبيبكم سيقيّم حالتكم تحديدًا.",
        },
      },
      {
        question: { en: "Where on the body can spider veins be treated?", ar: "أين على الجسم يمكن علاج الأوردة العنكبوتية؟" },
        answer: {
          en: "Anywhere on the body.",
          ar: "في أي منطقة من الجسم.",
        },
      },
      {
        question: { en: "What causes the discolouration in spider veins?", ar: "ما سبب تغير اللون في الأوردة العنكبوتية؟" },
        answer: {
          en: "They're damaged blood vessels under the skin, which can appear red, blue, or purple.",
          ar: "هي أوعية دموية تالفة تحت الجلد، وقد تظهر باللون الأحمر أو الأزرق أو الأرجواني.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "sun-damage-pigmentation",
    slug: "sun-damage-pigmentation",
    slugAr: "تلف-الشمس-والتصبغ",
    title: { en: "Sun Damage & Pigmentation", ar: "تلف الشمس والتصبغ" },
    summary: {
      en: "Sun spots, liver spots, and uneven pigmentation build up after years of sun exposure. Laser treatment at Blue Diamond Medical may reduce how visible they are and even out skin tone. The number of sessions depends on the depth and extent of the pigmentation, and results vary between patients.",
      ar: "يمكن تقليل بقع الشمس والبقع الكبدية الناتجة عن التعرض للشمس بسهولة باستخدام تقنيات الليزر المتطورة لدينا.",
    },
    relatedTreatmentIds: ["laser-skin-treatments", "ultra"],
    correctedFromSource: true,
    faqs: [
      {
        question: { en: "What causes sun spots and pigmentation?", ar: "ما سبب بقع الشمس والتصبغ؟" },
        answer: {
          en: "Years of sun exposure. Sun spots, liver spots, and uneven pigmentation build up gradually over time.",
          ar: "التعرض للشمس على مدى سنوات.",
        },
      },
      {
        question: { en: "What treatments address sun damage and pigmentation?", ar: "ما العلاجات التي تعالج تلف الشمس والتصبغ؟" },
        answer: {
          en: "Laser Skin Treatments and the Ultra laser are the two treatments connected to this concern.",
          ar: "علاجات الليزر للبشرة وليزر الترا هما العلاجان المرتبطان بهذه المخاوف.",
        },
      },
      {
        question: { en: "Is sun damage/pigmentation the same as \"liver spots\"?", ar: "هل تلف الشمس/التصبغ هو نفسه \"البقع الكبدية\"؟" },
        answer: {
          en: "Liver spots are one common form of this — both are addressed by the same treatment pathway.",
          ar: "البقع الكبدية هي أحد الأشكال الشائعة لهذا التصبغ — ويُعالج كلاهما بنفس مسار العلاج.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "skin-revitalization",
    slug: "skin-revitalization",
    slugAr: "تجديد-البشرة",
    title: { en: "Skin Revitalization", ar: "تجديد البشرة" },
    summary: {
      en: "Harsh weather and daily stresses can leave skin looking tired. A session takes under 45 minutes and can leave skin looking refreshed, with a natural glow and a softer appearance to fine lines and wrinkles.",
      ar: "قد يترك الطقس القاسي وضغوط الحياة اليومية أثرهما على مظهر البشرة. يمكننا تجديد نضارة البشرة خلال أقل من 45 دقيقة، وإظهار توهجها الطبيعي، وتقليل ظهور الخطوط الدقيقة والتجاعيد.",
    },
    relatedTreatmentIds: ["laser-skin-treatments", "rf-microneedling"],
    faqs: [
      {
        question: { en: "How long does a skin revitalization treatment take?", ar: "كم يستغرق علاج تجديد البشرة؟" },
        answer: {
          en: "Under 45 minutes.",
          ar: "أقل من 45 دقيقة.",
        },
      },
      {
        question: { en: "What does skin revitalization address?", ar: "ما الذي يعالجه تجديد البشرة؟" },
        answer: {
          en: "Skin that looks tired from harsh weather and daily stress, including the appearance of fine lines and wrinkles.",
          ar: "البشرة التي تبدو متعبة بسبب الطقس القاسي وضغوط الحياة اليومية، بما يشمل ظهور الخطوط الدقيقة والتجاعيد.",
        },
      },
      {
        question: { en: "Which treatments are used for skin revitalization?", ar: "ما العلاجات المستخدمة لتجديد البشرة؟" },
        answer: {
          en: "Laser Skin Treatments and RF microneedling.",
          ar: "علاجات الليزر للبشرة والإبر الدقيقة بالترددات الراديوية.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "razor-bumps",
    slug: "razor-bumps",
    slugAr: "حبوب-الحلاقة",
    title: { en: "Razor Bumps", ar: "حبوب الحلاقة" },
    summary: {
      en: "Razor bumps form when shaved hairs curl back into the skin, and they can be uncomfortable and prone to infection where ingrown hairs are also present. Laser hair removal at Blue Diamond Medical addresses the underlying cause by reducing the hair that produces them, which may improve both comfort and skin texture. Results vary, and a consultation confirms whether the treatment suits your skin and hair type.",
      ar: "مزعجة وقابلة للإصابة عند اقترانها بالشعر النامي تحت الجلد. يمكن لتقنياتنا إزالة حبوب الحلاقة، وعلاج السبب الجذري، ومنحكم بشرة أنعم وأكثر نعومة بعلاج طفيف التوغل.",
    },
    relatedTreatmentIds: ["laser-hair-removal"],
    faqs: [
      {
        question: { en: "Why are razor bumps a concern beyond appearance?", ar: "لماذا تُعدّ حبوب الحلاقة مشكلة تتجاوز المظهر؟" },
        answer: {
          en: "They're uncomfortable and prone to infection, especially when combined with ingrown hairs.",
          ar: "فهي مزعجة وقابلة للإصابة، خصوصًا عند اقترانها بالشعر النامي تحت الجلد.",
        },
      },
      {
        question: { en: "Does treatment just remove the bumps, or address the cause?", ar: "هل يقتصر العلاج على إزالة الحبوب أم يعالج السبب أيضًا؟" },
        answer: {
          en: "Both — treatment addresses the underlying cause as well as the visible bumps.",
          ar: "كلاهما — يعالج العلاج السبب الجذري إلى جانب الحبوب الظاهرة.",
        },
      },
      {
        question: { en: "Which treatment is used for razor bumps?", ar: "ما العلاج المستخدم لحبوب الحلاقة؟" },
        answer: {
          en: "Laser hair removal.",
          ar: "إزالة الشعر بالليزر.",
        },
      },
      {
        question: { en: "Is this a minimally invasive treatment?", ar: "هل هذا علاج طفيف التوغل؟" },
        answer: {
          en: "Yes — laser hair removal is non-surgical and minimally invasive.",
          ar: "نعم.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
];

export function getConcern(slug: string): AestheticConcern | undefined {
  return concerns.find((c) => c.slug === slug);
}
