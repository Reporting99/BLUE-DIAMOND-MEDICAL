import type { AestheticTreatment } from "@/features/aesthetics/types";

/**
 * Every field traces to Blue-Diamond-Medical-Website-Content-Extraction_1.docx
 * (bluediamondmedicalaesthetics.ca section) — see docs/CONTENT_MODEL.md.
 * "Cosmetic Botox" and "Skin Tightening" from the brief's route list are
 * built (route, typed data, template — see `gatedTreatments` below) but
 * kept feature-flagged off since the only available source content for
 * each would duplicate the Botox hub / Radiofrequency page rather than
 * add anything unique. See docs/CONTENT_MODEL.md.
 */
export const treatments: AestheticTreatment[] = [
  {
    id: "laser-hair-removal",
    slug: "laser-hair-removal",
    slugAr: "إزالة-الشعر-بالليزر",
    title: { en: "Laser Hair Removal", ar: "إزالة الشعر بالليزر" },
    summary: {
      en: "Long-lasting hair reduction on suitable areas of the face and body using the Cynosure Elite+™ laser system. Treatment areas and suitability are assessed during consultation.",
      ar: "تقليل دائم لنمو الشعر في أي منطقة من الجسم باستخدام نظام ليزر Cynosure Elite+™.",
    },
    serviceLocationNote: {
      en: "All Elite iQ™ treatments are performed exclusively at Citizen Studio, 45 Greenbriar Dr NW, Calgary, AB T3B 5N4 — not at the West Springs clinic.",
      ar: "تُجرى جميع علاجات Elite iQ™ حصريًا في Citizen Studio، 45 Greenbriar Dr NW، كالغاري، AB T3B 5N4 — وليس في عيادة ويست سبرينغز.",
    },
    howItWorks: {
      en: "Hair grows in a three-phase cycle: anagen (active growth), catagen (a brief transition when the hair follicle regresses) and telogen (resting). The laser emits light energy absorbed by melanin in the hair follicle and shaft, damaging the follicle and reducing regrowth. Follicles in the anagen phase respond best, so multiple treatments are needed.",
      ar: "ينمو الشعر ضمن دورة من ثلاث مراحل — النمو النشط، ثم مرحلة الانتقال، ثم مرحلة الراحة. يُصدر الليزر طاقة ضوئية تمتصها صبغة الميلانين في بصيلة الشعر، ما يُضعفها ويُبطئ نموها. تستجيب البصيلات في مرحلة النمو النشط بشكل أفضل، لذا يلزم إجراء جلسات متعددة لاستهداف الشعر النامي فعليًا.",
    },
    treatmentAreas: {
      en: ["Face", "Back", "Legs", "Chest", "Underarms", "Bikini area", "Upper lip"],
      ar: ["الوجه", "الظهر", "الساقان", "الصدر", "الإبطان", "منطقة البكيني", "الشفة العليا"],
    },
    preparation: {
      en: "Shave the treatment area beforehand so the laser's energy is delivered effectively.",
      ar: "يُنصح بحلاقة المنطقة المراد علاجها مسبقًا لضمان وصول طاقة الليزر بفعالية.",
    },
    comfortLevel: {
      en: "You may feel cold air and a slight snapping sensation and hear a beep during treatment.",
      ar: "قد تشعرون بهواء بارد وإحساس خفيف يشبه النقر أثناء العلاج.",
    },
    resultTimeline: {
      en: "Hairs present at the time of treatment fall out over the following weeks. Regrowth becomes thinner and lighter with each subsequent treatment; multiple sessions are needed since not all hairs are actively growing at once.",
      ar: "يتساقط الشعر الموجود وقت العلاج خلال الأسابيع التالية. يصبح الشعر النامي أرق وأخف مع كل جلسة، ويلزم عدة جلسات لأن الشعر لا ينمو كله في وقت واحد.",
    },
    technologyIds: ["elite-iq"],
    relatedConcernIds: ["razor-bumps"],
    faqs: [
      {
        question: { en: "How does Elite iQ™ work?", ar: "كيف يعمل جهاز Elite iQ™؟" },
        answer: {
          en: "Elite iQ™ uses the Skintel™ melanin reader to help the practitioner select settings for your skin. Suitability depends on your skin, hair and treatment area.",
          ar: "يستخدم جهاز Skintel™ — أول قارئ ميلانين معتمد من هيئة الصحة الكندية وإدارة الغذاء والدواء الأمريكية — مما يتيح علاجًا آمنًا لجميع أنواع البشرة والمناطق.",
        },
      },
      {
        question: { en: "Is this treatment right for me?", ar: "هل هذا العلاج مناسب لي؟" },
        answer: {
          en: "Elite iQ™ can treat a range of skin types and body areas. Your physician will assess your skin, hair and medical history to determine whether treatment is appropriate.",
          ar: "يمكن استخدام جهاز Elite iQ™ بأمان على جميع أنواع البشرة وفي أي منطقة من الجسم. ناقشوا ملاءمته لكم مع مقدم الرعاية.",
        },
      },
      {
        question: { en: "How many laser hair removal treatments will I need?", ar: "كم عدد الجلسات التي سأحتاجها؟" },
        answer: {
          en: "Several sessions are needed, because only the hairs that are actively growing respond to each treatment. A session usually takes less than 30 minutes, depending on the area. Book a consultation to discuss the areas you would like treated.",
          ar: "تختلف مدة الجلسة حسب المنطقة، لكنها عادة أقل من 30 دقيقة. تحدثوا مع مقدم الرعاية لتحديد استشارة ومناقشة المناطق المطلوب علاجها.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "laser-skin-treatments",
    slug: "laser-skin-treatments",
    slugAr: "علاجات-البشرة-بالليزر",
    title: { en: "Laser Skin Treatments", ar: "علاجات البشرة بالليزر" },
    summary: {
      en: "Laser treatment for a smoother complexion, brighter sun-damaged skin, benign pigmented lesions, and visible face and leg veins. Each protocol is tailored to your skin tone and the concern being treated.",
      ar: "معدات ليزر متطورة لتنعيم البشرة، وتفتيح البقع الناتجة عن التلف، وإزالة الآفات الصبغية الحميدة، وعلاج الأوردة في الوجه والساقين.",
    },
    howItWorks: {
      en: "A Laser Facial is suited to sun-damaged skin, red or ruddy complexions, light telangiectasia (spider veins), and uneven pigmentation — most often on the face but usable almost anywhere on the body. Each protocol is tailored to skin tone and needs.",
      ar: "علاج الوجه بالليزر مناسب للبشرة المتضررة من الشمس، والبشرة المحمرّة، وتوسع الشعيرات الدموية الخفيف (الأوردة العنكبوتية)، والتصبغ غير المتجانس — غالبًا على الوجه لكن يمكن تطبيقه في أي منطقة تقريبًا. يُصمَّم كل بروتوكول وفق لون البشرة واحتياجاتها.",
    },
    preparation: {
      en: "Avoid sun exposure for one week before a Laser Facial treatment.",
      ar: "يُنصح بتجنب التعرض للشمس لمدة أسبوع قبل جلسة علاج الوجه بالليزر.",
    },
    suggestedCourse: {
      en: "Laser Facial: 3–6 treatments usually required for lasting results. Benign pigmented lesions: more even colour is often visible in as few as 2 treatments, with a full course of 4 at 3–4 week intervals. Vascular treatments (spider veins): often clear in as few as 2 treatments, spaced 4–8 weeks apart.",
      ar: "علاج الوجه بالليزر: عادة 3 إلى 6 جلسات لنتائج دائمة. الآفات الصبغية الحميدة: تجانس ملحوظ في اللون خلال جلستين فقط، وبرنامج كامل من 4 جلسات بفاصل 3-4 أسابيع. علاجات الأوعية الدموية (الأوردة العنكبوتية): تُزال خلال جلستين فقط، بفاصل 4-8 أسابيع.",
    },
    faqs: [
      {
        question: { en: "What skin concerns can laser skin treatments address?", ar: "ما مخاوف البشرة التي يمكن أن تعالجها علاجات الليزر؟" },
        answer: {
          en: "Sun-damaged skin, red or ruddy complexions, light spider veins, uneven pigmentation, and benign pigmented lesions.",
          ar: "البشرة المتضررة من الشمس، والبشرة المحمرّة، والأوردة العنكبوتية الخفيفة، والتصبغ غير المتجانس، والآفات الصبغية الحميدة.",
        },
      },
      {
        question: { en: "Is treatment only for the face?", ar: "هل يقتصر العلاج على الوجه فقط؟" },
        answer: {
          en: "It's most often used on the face, but the underlying laser technology can be used almost anywhere on the body.",
          ar: "يُستخدم غالبًا على الوجه، إلا أن تقنية الليزر نفسها يمكن تطبيقها في أي منطقة تقريبًا من الجسم.",
        },
      },
      {
        question: { en: "How should I prepare for a Laser Facial?", ar: "كيف أستعد لعلاج الوجه بالليزر؟" },
        answer: {
          en: "Avoid sun exposure for one week beforehand.",
          ar: "يُنصح بتجنب التعرض للشمس لمدة أسبوع قبل الجلسة.",
        },
      },
      {
        question: { en: "How many sessions does a Laser Facial usually take?", ar: "كم جلسة يستغرق علاج الوجه بالليزر عادةً؟" },
        answer: {
          en: "Usually 3–6 treatments for lasting results.",
          ar: "عادة 3 إلى 6 جلسات لنتائج دائمة.",
        },
      },
      {
        question: { en: "How many sessions for pigmented lesions or spider veins specifically?", ar: "كم جلسة تلزم للآفات الصبغية أو الأوردة العنكبوتية تحديدًا؟" },
        answer: {
          en: "Benign pigmented lesions: more even colour is often visible in as few as 2 treatments, with a full course of 4 at 3–4 week intervals. Vascular treatments (spider veins): often clear in as few as 2 treatments, spaced 4–8 weeks apart.",
          ar: "الآفات الصبغية الحميدة: تجانس ملحوظ في اللون خلال جلستين فقط، مع برنامج كامل من 4 جلسات بفاصل 3-4 أسابيع. علاجات الأوعية الدموية (الأوردة العنكبوتية): تُزال خلال جلستين فقط، بفاصل 4-8 أسابيع.",
        },
      },
      {
        question: { en: "Is each treatment protocol the same for every patient?", ar: "هل بروتوكول العلاج نفسه لكل مريض؟" },
        answer: {
          en: "No — each protocol is tailored to skin tone and individual needs.",
          ar: "لا — يُصمَّم كل بروتوكول وفق لون البشرة والاحتياجات الفردية.",
        },
      },
    ],
    relatedConcernIds: ["sun-damage-pigmentation", "spider-veins", "rosacea-redness", "skin-revitalization"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "radio-frequency",
    slug: "radio-frequency",
    slugAr: "الترددات-الراديوية",
    title: { en: "Radiofrequency", ar: "الترددات الراديوية" },
    summary: {
      en: "Non-invasive tightening and smoothing of skin all over the body using RF waves (TempSure), improving tone and reducing the appearance of fine lines and wrinkles.",
      ar: "شدّ وتنعيم غير جراحي للبشرة في مختلف مناطق الجسم باستخدام موجات الترددات الراديوية (TempSure)، لتحسين ملمس البشرة وتقليل ظهور الخطوط الدقيقة والتجاعيد.",
    },
    howItWorks: {
      en: "A handheld device passes RF waves across the treatment area in a circular motion, gently raising the skin's temperature. The resulting heat penetrates the skin layers and stimulates collagen and elastin production for firmer, more youthful-looking skin.",
      ar: "يُمرَّر جهاز محمول موجات الترددات الراديوية على المنطقة المعالجة بحركة دائرية، مما يرفع درجة حرارة البشرة تدريجيًا. تُحفّز الحرارة الناتجة إنتاج الكولاجين والإيلاستين لبشرة أكثر تماسكًا وشبابًا.",
    },
    comfortLevel: {
      en: "Most patients find it comfortable, and often describe a warm, massage-like sensation.",
      ar: "غير مؤلم — يصف معظم المرضى شعورًا علاجيًا يشبه التدليك.",
    },
    duration: {
      en: "Face and neck treatments (handheld roller over face, neck, and décolletage) take 40–90 minutes depending on area. Body areas are treated with non-invasive pads over about 20 minutes.",
      ar: "تستغرق علاجات الوجه والرقبة (بجهاز محمول على الوجه والرقبة وأعلى الصدر) بين 40 و90 دقيقة حسب المنطقة. تُعالَج مناطق الجسم بواسطة وسائد غير جراحية خلال نحو 20 دقيقة.",
    },
    downtime: {
      en: "Downtime is not typically expected, although individual responses vary. Most patients can return to their usual activities right away. Follow your clinician's advice about sunscreen after treatment.",
      ar: "لا يوجد تعافٍ يُذكر — يمكنكم متابعة حياتكم اليومية فورًا. يُنصح باستخدام واقي شمس طبي للحفاظ على النتائج.",
    },
    resultTimeline: {
      en: "Results are gradual rather than immediate — skin looks fresher within a few days, but the most noticeable results appear about 6–8 weeks after the first treatment.",
      ar: "ليست نتيجتها فورية — تبدو البشرة أكثر انتعاشًا خلال أيام قليلة، لكن أبرز النتائج تظهر بعد نحو 6-8 أسابيع من الجلسة الأولى.",
    },
    suggestedCourse: {
      en: "A course of 3–5 treatments spaced 4–6 weeks apart is recommended. Results may last up to two years, although individual responses vary.",
      ar: "تُقدَّم أفضل النتائج بعد 3-5 جلسات بفاصل 4-6 أسابيع، مع استمرار النتائج الإيجابية حتى عامين.",
    },
    faqs: [
      {
        question: { en: "Does radiofrequency treatment hurt?", ar: "هل علاج الترددات الراديوية مؤلم؟" },
        answer: {
          en: "Most patients find it comfortable and describe a warm, massage-like sensation rather than pain.",
          ar: "غير مؤلم — يصف معظم المرضى شعورًا علاجيًا يشبه التدليك.",
        },
      },
      {
        question: { en: "How long does a radiofrequency session take?", ar: "كم تستغرق الجلسة؟" },
        answer: {
          en: "Face and neck treatments take 40–90 minutes depending on the area; body areas are treated with non-invasive pads over about 20 minutes.",
          ar: "تستغرق علاجات الوجه والرقبة بين 40 و90 دقيقة حسب المنطقة؛ وتُعالَج مناطق الجسم بواسطة وسائد غير جراحية خلال نحو 20 دقيقة.",
        },
      },
      {
        question: { en: "Is there any downtime?", ar: "هل هناك فترة تعافٍ؟" },
        answer: {
          en: "Virtually none — you can return to your usual activities right away. A medical-grade sunscreen is recommended afterward to protect results.",
          ar: "لا يوجد تعافٍ يُذكر — يمكنكم متابعة حياتكم اليومية فورًا. يُنصح باستخدام واقي شمس طبي بعد العلاج للحفاظ على النتائج.",
        },
      },
      {
        question: { en: "When will I see results?", ar: "متى ستظهر النتائج؟" },
        answer: {
          en: "Results are gradual rather than immediate — skin looks fresher within a few days, but the most noticeable results appear roughly 6–8 weeks after the first treatment.",
          ar: "ليست نتيجتها فورية — تبدو البشرة أكثر انتعاشًا خلال أيام قليلة، لكن أبرز النتائج تظهر بعد نحو 6-8 أسابيع من الجلسة الأولى.",
        },
      },
      {
        question: { en: "How many sessions are recommended, and how long do results last?", ar: "كم عدد الجلسات الموصى بها، وكم تدوم النتائج؟" },
        answer: {
          en: "A course of 3–5 treatments spaced 4–6 weeks apart is recommended. Results may last up to two years, although individual responses vary.",
          ar: "تُقدَّم أفضل النتائج بعد 3-5 جلسات بفاصل 4-6 أسابيع، مع استمرار النتائج الإيجابية حتى عامين.",
        },
      },
    ],
    technologyIds: ["tempsure"],
    relatedConcernIds: ["skin-laxity", "fine-lines-wrinkles"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "rf-microneedling",
    slug: "rf-microneedling",
    slugAr: "الإبر-الدقيقة-بالترددات-الراديوية",
    title: { en: "RF Microneedling", ar: "الإبر الدقيقة بالترددات الراديوية" },
    summary: {
      en: "The Potenza RF microneedling system adds radiofrequency energy to mechanical microneedling for enhanced skin tightening alongside the benefits of micro-injury stimulation.",
      ar: "يضيف نظام Potenza طاقة الترددات الراديوية إلى تقنية الإبر الدقيقة الميكانيكية، لشدّ أعمق للبشرة إلى جانب فوائد التحفيز بالإصابات الدقيقة.",
    },
    howItWorks: {
      en: "RF energy is delivered through small needles into the dermis, heating the underlying layers to stimulate collagen and elastin production and support skin tightening. Treatments are not limited to the face and may help with skin laxity after weight loss. Results vary.",
      ar: "تُوصَّل طاقة الترددات الراديوية عبر إبر دقيقة إلى عمق الأدمة، فتُسخّن الطبقات العميقة وتُحفّز الشدّ وإنتاج الكولاجين والإيلاستين — بنتائج أسرع وأوضح من الإبر الدقيقة التقليدية. لا تقتصر العلاجات على الوجه، وهي مفيدة بشكل خاص لشدّ البشرة بعد فقدان الوزن.",
    },
    concernsTreated: {
      en: ["Skin scarring, including acne scars", "Loose or less toned skin", "Dark spots", "Enlarged pores", "Wrinkles"],
      ar: ["ندبات الجلد بما فيها ندبات حب الشباب", "بشرة أكثر تماسكًا ونضارة", "تقليل البقع الداكنة", "التحكم بحجم المسام", "تقليل التجاعيد"],
    },
    duration: {
      en: "Typically around 30 minutes. A topical anaesthetic is applied and can take up to 45 minutes to become fully effective.",
      ar: "نحو 30 دقيقة عادةً. يُطبَّق مخدر موضعي قد يستغرق حتى 45 دقيقة ليصبح فعالًا بالكامل.",
    },
    comfortLevel: {
      en: "A topical numbing agent removes most of the discomfort. Most patients say they can feel the needles working but do not find it painful. A member of the clinical team stays with you throughout, and treatment can be stopped at any point.",
      ar: "يُزيل المخدر معظم الانزعاج — يشعر المرضى بوخز الإبر دون ألم حقيقي. يراقب مقدمو الرعاية الجلسة باستمرار، ويمكن إيقافها في أي وقت.",
    },
    resultTimeline: {
      en: "Some changes may be noticeable soon after treatment, with gradual improvement over several weeks and treatments. More than one session is usually recommended.",
      ar: "غالبًا ما تظهر النتائج فورًا، لكن جلسة واحدة لا تكفي لنتائج دائمة.",
    },
    suggestedCourse: {
      en: "Three- and five-session packages are recommended to build and maintain firmer, refreshed-looking skin.",
      ar: "يُنصح ببرامج من 3 أو 5 جلسات للحصول على بشرة متجددة ومتماسكة بشكل مستمر.",
    },
    downtime: {
      en: "Downtime is usually minimal. Redness, minor swelling and pinpoint bleeding can occur and typically settle within three days. Minor bumps or, rarely, micro-crusting can also occur. Contact the clinic if you have concerns about your recovery.",
      ar: "تعافٍ محدود — يُنصح بتجنب التمارين الشاقة والتعرض للشمس لمدة 48 ساعة، ثم يمكن استئناف النشاط المعتاد مع استخدام واقٍ شمسي جيد.",
    },
    // Restored from the supplied RF microneedling source. The ambiguous
    // "celluloid" mask and unapproved infusion agents remain in the review register.
    aftercare: {
      en: "Avoid strenuous exercise and sun exposure for 48 hours after treatment. Follow your clinician's instructions about sunscreen and other skin care products before resuming your usual routine.",
      ar: "",
    },
    safetyContraindications: {
      en: [
        "Pregnant or breastfeeding",
        "Active skin lesions or active acne",
        "Open wounds in or around the treatment area",
        "Any active infections",
        "A pacemaker or other implanted electrical device",
        "Prior gold thread rejuvenation treatments",
        "A propensity for keloid formation",
      ],
      ar: [
        "الحمل أو الرضاعة",
        "آفات جلدية نشطة أو حب شباب نشط",
        "جروح مفتوحة في المنطقة المستهدفة أو حولها",
        "أي عدوى نشطة",
        "جهاز تنظيم ضربات القلب أو أي جهاز كهربائي مزروع",
        "علاجات تجديد سابقة بخيوط الذهب",
        "استعداد لتكوّن الندبات الجدرية (الكيلويد)",
      ],
    },
    technologyIds: ["potenza"],
    relatedConcernIds: ["acne-scars", "dry-skin", "fine-lines-wrinkles", "skin-revitalization"],
    faqs: [
      {
        question: { en: "How is RF microneedling different from standard microneedling?", ar: "لماذا الإبر الدقيقة بالترددات الراديوية بدل الإبر الدقيقة التقليدية؟" },
        answer: {
          en: "Potenza delivers focused RF technology to heat the skin, triggering the body's natural response to increase collagen and elastin production, resulting in enhanced skin revitalization.",
          ar: "يوصل جهاز Potenza طاقة ترددات راديوية مركزة لتسخين البشرة، ما يُحفّز استجابة الجسم الطبيعية لزيادة إنتاج الكولاجين والإيلاستين، فتتجدد البشرة بشكل أعمق.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "ultra",
    slug: "ultra",
    slugAr: "الترا",
    title: { en: "Ultra Treatment", ar: "علاج الترا" },
    summary: {
      en: "Ultra is a laser treatment used to improve skin tone and texture and address mild to moderate age spots, freckles, sun spots, benign pigmented lesions, sun damage, melasma and post-inflammatory hyperpigmentation. Suitability is assessed during a consultation.",
      ar: "ليزر بتعافٍ محدود يُجدّد البشرة ويمنحها لونًا أكثر إشراقًا وملمسًا أفضل — لعلاج البقع العمرية الخفيفة إلى المتوسطة، والنمش، وبقع الشمس، والآفات الصبغية، وتلف الشمس، والتقرن السفعي، والكلف، وفرط التصبغ بعد الالتهاب.",
    },
    treatmentAreas: { en: ["Face", "Neck", "Chest"], ar: ["الوجه", "الرقبة", "الصدر"] },
    duration: {
      en: "10–20 minutes depending on the area treated — sometimes called a \"Lunchtime Facial.\"",
      ar: "10-20 دقيقة حسب المنطقة المعالجة — يُطلق عليه أحيانًا \"علاج وقت الغداء\".",
    },
    comfortLevel: {
      en: "Discomfort is variable, described as mild to moderate; a topical numbing cream may be applied to minimize it.",
      ar: "الانزعاج متفاوت، يُوصف بأنه خفيف إلى متوسط؛ يمكن استخدام كريم تخدير موضعي لتقليله.",
    },
    downtime: {
      en: "Mild redness can occur after treatment and usually lessens over the following day. Most patients can resume their usual activities. Skin may feel dry and sandpaper-like for 5–6 days as it exfoliates; full healing may take 5–7 days.",
      ar: "احمرار خفيف بعد العلاج؛ يمكن استئناف الأنشطة الطبيعية فورًا. قد يستغرق التعافي الكامل 5-7 أيام، تكون خلالها البشرة جافة وخشنة الملمس أثناء تقشرها — وهذا أمر طبيعي.",
    },
    resultTimeline: {
      en: "Results may appear after a single treatment or require several visits depending on the condition.",
      ar: "قد تظهر النتائج بعد جلسة واحدة أو تتطلب عدة زيارات حسب الحالة.",
    },
    aftercare: {
      en: "Follow your practitioner's advice about when to apply makeup while your skin heals.",
      ar: "",
    },
    faqs: [
      {
        question: { en: "What can Ultra treatment address?", ar: "ما الذي يعالجه علاج الترا؟" },
        answer: {
          en: "Mild to moderate age spots, freckles, sun spots, benign pigmented lesions, sun damage, melasma and post-inflammatory hyperpigmentation. Your physician will assess the skin changes before recommending treatment.",
          ar: "البقع العمرية الخفيفة إلى المتوسطة، والنمش، وبقع الشمس، والآفات الصبغية، وتلف الشمس، والتقرن السفعي، والكلف، وفرط التصبغ بعد الالتهاب.",
        },
      },
      {
        question: { en: "Why is Ultra sometimes called a \"Lunchtime Facial\"?", ar: "لماذا يُسمى علاج الترا أحيانًا بـ\"علاج وقت الغداء\"؟" },
        answer: {
          en: "Because a session takes only 10–20 minutes depending on the area treated.",
          ar: "لأن الجلسة تستغرق فقط 10-20 دقيقة حسب المنطقة المعالجة.",
        },
      },
      {
        question: { en: "What's recovery like after Ultra treatment?", ar: "كيف يكون التعافي بعد علاج الترا؟" },
        answer: {
          en: "Mild redness can occur after treatment and usually lessens over the following day. Most patients can resume their usual activities. Skin may feel dry and sandpaper-like for 5–6 days as it exfoliates; full healing may take 5–7 days.",
          ar: "يظهر احمرار خفيف بعد العلاج ويمكن استئناف الأنشطة الطبيعية فورًا. قد يستغرق التعافي الكامل 5-7 أيام، تكون خلالها البشرة جافة وخشنة الملمس أثناء تقشرها — وهذا أمر طبيعي ضمن العملية.",
        },
      },
      {
        question: { en: "Will one Ultra treatment be enough?", ar: "هل تكفي جلسة واحدة؟" },
        answer: {
          en: "Results may appear after a single treatment or require several visits, depending on the condition being treated.",
          ar: "قد تظهر النتائج بعد جلسة واحدة أو تتطلب عدة زيارات، حسب الحالة المُعالَجة.",
        },
      },
    ],
    technologyIds: ["ultra"],
    relatedConcernIds: ["sun-damage-pigmentation", "skin-revitalization"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "prp-hair-restoration",
    slug: "prp-hair-restoration",
    slugAr: "استعادة-الشعر-بالبلازما",
    title: { en: "PRP Hair Restoration", ar: "استعادة الشعر بالبلازما" },
    summary: {
      en: "Platelet-rich plasma injected into the scalp to stimulate inactive hair follicles and support denser, fuller growth. Performed by Dr. Farhat; results vary between patients.",
      ar: "حقن البلازما الغنية بالصفائح الدموية في فروة الرأس لتنشيط البصيلات الخاملة وتعزيز نمو شعر أكثف وأكمل — يُجريها الدكتور فرحات.",
    },
    howItWorks: {
      en: "Platelet-rich plasma (PRP) is prepared from the patient's own blood. After a blood draw, the blood is processed to concentrate platelets in plasma. The platelets release growth factors involved in tissue repair. PRP is injected into the scalp to support hair growth; results vary.",
      ar: "البلازما الغنية بالصفائح الدموية مصل تجديدي يُستخرج من دم المريض نفسه. بعد سحب عينة دم، يُفصَل البلازما ويُركَّز في مصل غني بعوامل النمو التي تُنشّط بصيلات الشعر الخاملة وتُحسّن الدورة الدموية في فروة الرأس.",
    },
    whoItsFor: {
      en: "Individuals noticing thinning hair or early hair loss.",
      ar: "الأشخاص الذين يلاحظون ترقق الشعر أو تساقطه المبكر.",
    },
    downtime: { en: "Sessions are quick with little to no downtime.", ar: "الجلسات سريعة وتتطلب تعافيًا محدودًا أو معدومًا." },
    duration: { en: "30 to 60 minutes depending on the treatment area.", ar: "من 30 إلى 60 دقيقة حسب المنطقة المعالجة." },
    suggestedCourse: {
      en: "Most people benefit from a series of 3–4 treatments spaced a few weeks apart; maintenance sessions may be recommended.",
      ar: "يستفيد معظم الأشخاص من سلسلة من 3 إلى 4 جلسات بفاصل بضعة أسابيع؛ قد يُنصح بجلسات صيانة لاحقًا.",
    },
    relatedTreatmentIds: ["prp-skin-rejuvenation"],
    faqs: [
      {
        question: { en: "Who performs PRP at Blue Diamond Medical?", ar: "من يُجري علاج البلازما في بلو دايموند الطبية؟" },
        answer: {
          en: "PRP treatments are performed by Dr. Farhat.",
          ar: "يُجري الدكتور فرحات علاجات البلازما، جامعًا بين التقنية المتقدمة والرعاية الشخصية.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "prp-skin-rejuvenation",
    slug: "prp-skin-rejuvenation",
    slugAr: "تجديد-البشرة-بالبلازما",
    title: { en: "PRP Skin Rejuvenation", ar: "تجديد البشرة بالبلازما" },
    summary: {
      en: "PRP used topically or via microinjections to smooth fine lines and wrinkles, improve tone and elasticity, and reduce the appearance of acne scars and pigmentation.",
      ar: "تُستخدم البلازما الغنية بالصفائح الدموية موضعيًا أو عبر حقن دقيقة لتنعيم الخطوط الدقيقة والتجاعيد، وتحسين نضارة البشرة ومرونتها، وتقليل ندبات حب الشباب والتصبغ — يُعرف أحيانًا باسم \"فيشل مصاص الدماء\".",
    },
    howItWorks: {
      en: "Platelet-rich plasma prepared from the patient's own blood is applied to the skin or delivered by microinjections. Platelet-derived growth factors may support collagen production and skin renewal; results vary.",
      ar: "يُستخدم المصل الغني بعوامل النمو المشتق من دم المريض نفسه — ذاته المستخدم لاستعادة الشعر — على البشرة، لتحفيز إنتاج الكولاجين وبشرة أكثر تماسكًا وشبابًا دون أي مواد اصطناعية.",
    },
    duration: { en: "30 to 60 minutes depending on the treatment area.", ar: "من 30 إلى 60 دقيقة حسب المنطقة المعالجة." },
    suggestedCourse: {
      en: "Most people benefit from a series of 3–4 treatments spaced a few weeks apart; maintenance sessions may be recommended.",
      ar: "يستفيد معظم الأشخاص من سلسلة من 3 إلى 4 جلسات بفاصل بضعة أسابيع؛ قد يُنصح بجلسات صيانة لاحقًا.",
    },
    faqs: [
      {
        question: { en: "Why is PRP skin rejuvenation sometimes called a \"vampire facial\"?", ar: "لماذا يُعرف تجديد البشرة بالبلازما أحيانًا باسم \"فيشل مصاص الدماء\"؟" },
        answer: {
          en: "Because it uses the patient's own blood — plasma is separated and applied topically or via microinjections.",
          ar: "لأنه يستخدم دم المريض نفسه — إذ تُفصَل البلازما وتُطبَّق موضعيًا أو عبر حقن دقيقة.",
        },
      },
      {
        question: { en: "What can PRP skin rejuvenation address?", ar: "ما الذي يعالجه تجديد البشرة بالبلازما؟" },
        answer: {
          en: "Fine lines and wrinkles, skin tone and elasticity, acne scars, and pigmentation.",
          ar: "الخطوط الدقيقة والتجاعيد، ونضارة البشرة ومرونتها، وندبات حب الشباب، والتصبغ.",
        },
      },
      {
        question: { en: "Does this use any synthetic additives?", ar: "هل يستخدم هذا العلاج أي مواد اصطناعية؟" },
        answer: {
          en: "PRP is prepared from your own blood. Ask your physician which preparation products are used and whether anything is added as part of your treatment.",
          ar: "لا — يُستخدم المصل نفسه الغني بعوامل النمو والمشتق من دم المريض، والمستخدم أيضًا لاستعادة الشعر بالبلازما، دون أي مواد اصطناعية.",
        },
      },
      {
        question: { en: "How long does a session take, and how many will I need?", ar: "كم تستغرق الجلسة، وكم عدد الجلسات التي سأحتاجها؟" },
        answer: {
          en: "30 to 60 minutes depending on the treatment area. Most people benefit from a series of 3–4 treatments spaced a few weeks apart, with maintenance sessions sometimes recommended.",
          ar: "من 30 إلى 60 دقيقة حسب المنطقة المعالجة. يستفيد معظم الأشخاص من سلسلة من 3 إلى 4 جلسات بفاصل بضعة أسابيع، وقد يُنصح بجلسات صيانة لاحقًا.",
        },
      },
    ],
    relatedConcernIds: ["fine-lines-wrinkles", "acne-scars", "skin-revitalization"],
    relatedTreatmentIds: ["prp-hair-restoration"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "tempsure-vitalia",
    slug: "tempsure-vitalia",
    slugAr: "تمبشور-فيتاليا",
    title: { en: "TempSure Vitalia", ar: "تمبشور فيتاليا" },
    summary: {
      en: "TempSure Vitalia is a non-surgical radiofrequency device. If you have pelvic floor or sexual health concerns, a consultation with Dr. Farhat can help assess your symptoms and discuss appropriate treatment options.",
      ar: "جهاز يُعالج العديد من مشاكل قاع الحوض والصحة الجنسية التي تواجهها النساء في مختلف الأعمار ومراحل الحياة — تعاني منها نحو امرأة من كل ثلاث، وغالبًا بصمت.",
    },
    whoItsFor: {
      en: "Women experiencing pelvic floor or sexual health concerns who want to discuss whether this simple, in-clinic procedure may be right for them.",
      ar: "النساء اللواتي يواجهن مخاوف متعلقة بقاع الحوض أو الصحة الجنسية، ويرغبن بمناقشة ما إذا كان هذا الإجراء البسيط داخل العيادة مناسبًا لهن.",
    },
    faqs: [
      {
        question: { en: "Can I discuss pelvic floor or sexual health concerns at a consultation?", ar: "ما مدى شيوع المشاكل التي يعالجها TempSure Vitalia؟" },
        answer: {
          en: "Yes. You can discuss these symptoms with Dr. Farhat. Assessment is needed to identify the cause and consider appropriate treatment options.",
          ar: "تعاني نحو امرأة من كل ثلاث من مشاكل قاع الحوض أو الصحة الجنسية في مرحلة ما، وغالبًا بصمت.",
        },
      },
      {
        question: { en: "Is this a surgical procedure?", ar: "هل هذا إجراء جراحي؟" },
        answer: {
          en: "No. TempSure Vitalia is a straightforward, non-surgical procedure carried out in the clinic.",
          ar: "لا — يُوصف بأنه إجراء بسيط يُجرى داخل العيادة.",
        },
      },
      {
        question: { en: "Who is this treatment for?", ar: "لمن هذا العلاج؟" },
        answer: {
          en: "Women experiencing pelvic floor or sexual health concerns at any age or life stage, who want to discuss whether it may be right for them.",
          ar: "النساء اللواتي يواجهن مخاوف متعلقة بقاع الحوض أو الصحة الجنسية في أي عمر أو مرحلة من الحياة، ويرغبن بمناقشة مدى ملاءمته لهن.",
        },
      },
    ],
    technologyIds: ["tempsure-vitalia"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
];

/**
 * Fully built (route entry, typed bilingual data, reusable template — the
 * same AestheticTreatmentTemplate used for published treatments) but
 * gated behind a feature flag, per explicit instruction: do not silently
 * omit brief-required routes, and do not publish duplicate content either.
 *
 * - Cosmetic Botox: the source's only content for this is the treatment-
 *   area list already live on /botox (frown lines, forehead lines, crow's
 *   feet, etc.) — a separate page with the same facts would be duplicate
 *   content, not a unique page. Kept minimal/honest here (no fabricated
 *   duration/downtime/etc.) and gated behind `cosmeticBotoxTreatmentPageEnabled`.
 * - Skin Tightening: the source's only content for this *is* the Radio
 *   Frequency/TempSure page — "skin tightening" is that treatment's
 *   stated function, not a distinct procedure. Gated behind
 *   `skinTighteningTreatmentPageEnabled`.
 *
 * See docs/CONTENT_MODEL.md and docs/CONTENT_MODEL.md.
 */
export const gatedTreatments: (AestheticTreatment & { requiresFeature: string })[] = [
  {
    id: "cosmetic-botox",
    slug: "cosmetic-botox",
    slugAr: "بوتوكس-تجميلي",
    title: { en: "Cosmetic Botox", ar: "بوتوكس تجميلي" },
    summary: {
      en: "Cosmetic Botox for frown lines, forehead lines, crow's feet, and more — administered by Dr. Farhat and Dr. Hamdi. See the full treatment-area list on our Botox page.",
      ar: "بوتوكس تجميلي لخطوط العبوس والجبين وقدم الغراب وغيرها — يُجريه الدكتور فرحات. راجعوا القائمة الكاملة لمناطق العلاج في صفحة البوتوكس لدينا.",
    },
    relatedTreatmentIds: [],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
    requiresFeature: "cosmeticBotoxTreatmentPageEnabled",
  },
  {
    id: "skin-tightening",
    slug: "skin-tightening",
    slugAr: "شد-البشرة",
    title: { en: "Skin Tightening", ar: "شد البشرة" },
    summary: {
      en: "Skin tightening at Blue Diamond is delivered through our Radiofrequency (TempSure) treatment — see that page for the full clinical detail.",
      ar: "يُقدَّم شدّ البشرة في بلو دايموند عبر علاج الترددات الراديوية (TempSure) — راجعوا تلك الصفحة للتفاصيل السريرية الكاملة.",
    },
    relatedTreatmentIds: ["radio-frequency"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
    requiresFeature: "skinTighteningTreatmentPageEnabled",
  },
];

export function getTreatment(slug: string): AestheticTreatment | undefined {
  return treatments.find((t) => t.slug === slug);
}

export function getGatedTreatment(slug: string) {
  return gatedTreatments.find((t) => t.slug === slug);
}
