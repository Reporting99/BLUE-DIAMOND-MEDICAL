import type { AestheticTreatment } from "@/types/aesthetics";

/**
 * Every field traces to Blue-Diamond-Medical-Website-Content-Extraction_1.docx
 * (bluediamondmedicalaesthetics.ca section) — see docs/CONTENT_APPROVAL_MATRIX.md.
 * "Cosmetic Botox" and "Skin Tightening" from the brief's route list are
 * built (route, typed data, template — see `gatedTreatments` below) but
 * kept feature-flagged off since the only available source content for
 * each would duplicate the Botox hub / Radio Frequency page rather than
 * add anything unique. See docs/MISSING_CONTENT_REPORT.md.
 */
export const treatments: AestheticTreatment[] = [
  {
    id: "laser-hair-removal",
    slug: "laser-hair-removal",
    slugAr: "إزالة-الشعر-بالليزر",
    title: { en: "Laser Hair Removal", ar: "إزالة الشعر بالليزر" },
    summary: {
      en: "Long-lasting hair reduction anywhere on the body using the Cynosure Elite+™ laser system.",
      ar: "تقليل دائم لنمو الشعر في أي منطقة من الجسم باستخدام نظام ليزر Cynosure Elite+™.",
    },
    serviceLocationNote: {
      en: "All Elite iQ™ treatments are performed exclusively at Citizen Studio, 45 Greenbriar Dr NW, Calgary, AB T3B 5N4 — not at the West Springs clinic.",
      ar: "تُجرى جميع علاجات Elite iQ™ حصريًا في Citizen Studio، 45 Greenbriar Dr NW، كالغاري، AB T3B 5N4 — وليس في عيادة ويست سبرينغز.",
    },
    howItWorks: {
      en: "Hair grows in a three-phase cycle — anagen (active growth), catagen, and telogen (resting). The laser emits light energy absorbed by melanin in the hair follicle, damaging it and impairing regrowth. Follicles in the anagen phase respond best, so multiple treatments are needed to catch hair actively growing.",
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
      en: "You may feel cold air and a slight beep or snapping sensation during treatment.",
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
          en: "It uses the Skintel™ device — the first Health Canada and FDA cleared melanin reader on the market — allowing safe treatment of all skin types and areas.",
          ar: "يستخدم جهاز Skintel™ — أول قارئ ميلانين معتمد من هيئة الصحة الكندية وإدارة الغذاء والدواء الأمريكية — مما يتيح علاجًا آمنًا لجميع أنواع البشرة والمناطق.",
        },
      },
      {
        question: { en: "Is this treatment right for me?", ar: "هل هذا العلاج مناسب لي؟" },
        answer: {
          en: "The Elite iQ™ device can be safely used on all skin types and anywhere on the body. Talk with your provider to discuss candidacy.",
          ar: "يمكن استخدام جهاز Elite iQ™ بأمان على جميع أنواع البشرة وفي أي منطقة من الجسم. ناقشوا ملاءمته لكم مع مقدم الرعاية.",
        },
      },
      {
        question: { en: "How many treatments will I need?", ar: "كم عدد الجلسات التي سأحتاجها؟" },
        answer: {
          en: "Treatment times vary by area but typically take less than 30 minutes. Speak to your provider for a consultation to discuss treatment areas.",
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
      en: "State-of-the-art laser equipment for smoother complexions, brightening damaged skin, removing benign pigmented lesions, and treating face and leg veins.",
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
      en: "Laser Facial: 3–6 treatments usually required for lasting results. Benign pigmented lesions: visible uniformity of color in as little as 2 treatments, full course of 4 treatments at 3–4 week intervals. Vascular treatments (spider veins): eliminated in as little as 2 treatments, spaced 4–8 weeks apart.",
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
          en: "Benign pigmented lesions: visible uniformity of color in as little as 2 treatments, with a full course of 4 at 3–4 week intervals. Vascular treatments (spider veins): eliminated in as little as 2 treatments, spaced 4–8 weeks apart.",
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
    title: { en: "Radio Frequency", ar: "الترددات الراديوية" },
    summary: {
      en: "Non-invasive tightening and smoothing of skin all over the body using RF waves (TempSure), improving tone and reducing the appearance of fine lines and wrinkles.",
      ar: "شدّ وتنعيم غير جراحي للبشرة في مختلف مناطق الجسم باستخدام موجات الترددات الراديوية (TempSure)، لتحسين ملمس البشرة وتقليل ظهور الخطوط الدقيقة والتجاعيد.",
    },
    howItWorks: {
      en: "A handheld device passes RF waves across the treatment area in a circular motion, gently raising the skin's temperature. The resulting heat penetrates the skin layers and stimulates collagen and elastin production for firmer, more youthful skin.",
      ar: "يُمرَّر جهاز محمول موجات الترددات الراديوية على المنطقة المعالجة بحركة دائرية، مما يرفع درجة حرارة البشرة تدريجيًا. تُحفّز الحرارة الناتجة إنتاج الكولاجين والإيلاستين لبشرة أكثر تماسكًا وشبابًا.",
    },
    comfortLevel: {
      en: "Not painful — most patients report a therapeutic, massage-like effect.",
      ar: "غير مؤلم — يصف معظم المرضى شعورًا علاجيًا يشبه التدليك.",
    },
    duration: {
      en: "Face and neck treatments (handheld roller over face, neck, and décolletage) take 40–90 minutes depending on area. Body areas are treated with non-invasive pads over about 20 minutes.",
      ar: "تستغرق علاجات الوجه والرقبة (بجهاز محمول على الوجه والرقبة وأعلى الصدر) بين 40 و90 دقيقة حسب المنطقة. تُعالَج مناطق الجسم بواسطة وسائد غير جراحية خلال نحو 20 دقيقة.",
    },
    downtime: {
      en: "Virtually no downtime — you're free to return to normal daily life immediately. A medical-grade sunscreen is recommended to protect and preserve results.",
      ar: "لا يوجد تعافٍ يُذكر — يمكنكم متابعة حياتكم اليومية فورًا. يُنصح باستخدام واقي شمس طبي للحفاظ على النتائج.",
    },
    resultTimeline: {
      en: "Not an instant-fix procedure — skin looks fresher within a few days, but the most noticeable results appear approximately 6–8 weeks after the first treatment.",
      ar: "ليست نتيجتها فورية — تبدو البشرة أكثر انتعاشًا خلال أيام قليلة، لكن أبرز النتائج تظهر بعد نحو 6-8 أسابيع من الجلسة الأولى.",
    },
    suggestedCourse: {
      en: "3–5 treatments 4–6 weeks apart provide optimal results, with positive effects lasting up to 2 years.",
      ar: "تُقدَّم أفضل النتائج بعد 3-5 جلسات بفاصل 4-6 أسابيع، مع استمرار النتائج الإيجابية حتى عامين.",
    },
    faqs: [
      {
        question: { en: "Does Radio Frequency treatment hurt?", ar: "هل علاج الترددات الراديوية مؤلم؟" },
        answer: {
          en: "It's not painful — most patients report a therapeutic, massage-like effect.",
          ar: "غير مؤلم — يصف معظم المرضى شعورًا علاجيًا يشبه التدليك.",
        },
      },
      {
        question: { en: "How long does a session take?", ar: "كم تستغرق الجلسة؟" },
        answer: {
          en: "Face and neck treatments take 40–90 minutes depending on the area; body areas are treated with non-invasive pads over about 20 minutes.",
          ar: "تستغرق علاجات الوجه والرقبة بين 40 و90 دقيقة حسب المنطقة؛ وتُعالَج مناطق الجسم بواسطة وسائد غير جراحية خلال نحو 20 دقيقة.",
        },
      },
      {
        question: { en: "Is there any downtime?", ar: "هل هناك فترة تعافٍ؟" },
        answer: {
          en: "Virtually none — you can return to normal daily life immediately. A medical-grade sunscreen is recommended afterward to protect results.",
          ar: "لا يوجد تعافٍ يُذكر — يمكنكم متابعة حياتكم اليومية فورًا. يُنصح باستخدام واقي شمس طبي بعد العلاج للحفاظ على النتائج.",
        },
      },
      {
        question: { en: "When will I see results?", ar: "متى ستظهر النتائج؟" },
        answer: {
          en: "It isn't an instant-fix procedure — skin looks fresher within a few days, but the most noticeable results appear roughly 6–8 weeks after the first treatment.",
          ar: "ليست نتيجتها فورية — تبدو البشرة أكثر انتعاشًا خلال أيام قليلة، لكن أبرز النتائج تظهر بعد نحو 6-8 أسابيع من الجلسة الأولى.",
        },
      },
      {
        question: { en: "How many sessions are recommended, and how long do results last?", ar: "كم عدد الجلسات الموصى بها، وكم تدوم النتائج؟" },
        answer: {
          en: "3–5 treatments spaced 4–6 weeks apart provide optimal results, with positive effects lasting up to 2 years.",
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
    title: { en: "RF Micro-Needling", ar: "الإبر الدقيقة بالترددات الراديوية" },
    summary: {
      en: "The Potenza RF microneedling system adds radiofrequency energy to mechanical microneedling for enhanced skin tightening alongside the benefits of micro-injury stimulation.",
      ar: "يضيف نظام Potenza طاقة الترددات الراديوية إلى تقنية الإبر الدقيقة الميكانيكية، لشدّ أعمق للبشرة إلى جانب فوائد التحفيز بالإصابات الدقيقة.",
    },
    howItWorks: {
      en: "RF energy is delivered via small needles deep into the dermis, heating underlying layers to cause tightening and stimulate collagen and elastin production — producing faster, more dramatic results than non-RF micro-needling. Treatments aren't limited to the face and are particularly useful for toning and retracting skin post-weight-loss.",
      ar: "تُوصَّل طاقة الترددات الراديوية عبر إبر دقيقة إلى عمق الأدمة، فتُسخّن الطبقات العميقة وتُحفّز الشدّ وإنتاج الكولاجين والإيلاستين — بنتائج أسرع وأوضح من الإبر الدقيقة التقليدية. لا تقتصر العلاجات على الوجه، وهي مفيدة بشكل خاص لشدّ البشرة بعد فقدان الوزن.",
    },
    concernsTreated: {
      en: ["Skin scarring, including acne scars", "Firmer, more toned skin", "Reduction in dark spots", "Control of large pores", "Reduction in wrinkles"],
      ar: ["ندبات الجلد بما فيها ندبات حب الشباب", "بشرة أكثر تماسكًا ونضارة", "تقليل البقع الداكنة", "التحكم بحجم المسام", "تقليل التجاعيد"],
    },
    duration: {
      en: "Typically around 30 minutes. A topical anesthetic is applied and can take up to 45 minutes to become fully effective.",
      ar: "نحو 30 دقيقة عادةً. يُطبَّق مخدر موضعي قد يستغرق حتى 45 دقيقة ليصبح فعالًا بالكامل.",
    },
    comfortLevel: {
      en: "The numbing agent removes most discomfort — patients report feeling the needling but not actual pain. Providers monitor continuously and treatment can be halted at any time.",
      ar: "يُزيل المخدر معظم الانزعاج — يشعر المرضى بوخز الإبر دون ألم حقيقي. يراقب مقدمو الرعاية الجلسة باستمرار، ويمكن إيقافها في أي وقت.",
    },
    resultTimeline: {
      en: "Effects can usually be seen straight away, but one session isn't enough for lasting results.",
      ar: "غالبًا ما تظهر النتائج فورًا، لكن جلسة واحدة لا تكفي لنتائج دائمة.",
    },
    suggestedCourse: {
      en: "3- and 5-session packages are recommended for continuous, rejuvenated, firm skin.",
      ar: "يُنصح ببرامج من 3 أو 5 جلسات للحصول على بشرة متجددة ومتماسكة بشكل مستمر.",
    },
    downtime: {
      en: "Minimal downtime — avoid strenuous exercise and sun exposure for 48 hours; otherwise resume regular activities with good SPF.",
      ar: "تعافٍ محدود — يُنصح بتجنب التمارين الشاقة والتعرض للشمس لمدة 48 ساعة، ثم يمكن استئناف النشاط المعتاد مع استخدام واقٍ شمسي جيد.",
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
        question: { en: "Why RF micro-needling vs. non-RF micro-needling?", ar: "لماذا الإبر الدقيقة بالترددات الراديوية بدل الإبر الدقيقة التقليدية؟" },
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
      en: "A low-downtime laser that rejuvenates the skin, giving it a brighter tone and improved texture — treating mild to moderate age spots, freckles, sun spots, pigmented lesions, sun damage, actinic keratosis, melasma, and postinflammatory hyperpigmentation.",
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
      en: "Mild redness following treatment; normal activities can resume immediately. Full healing may take 5–7 days, during which skin has a dry, sandpaper-like texture as it exfoliates — this is normal.",
      ar: "احمرار خفيف بعد العلاج؛ يمكن استئناف الأنشطة الطبيعية فورًا. قد يستغرق التعافي الكامل 5-7 أيام، تكون خلالها البشرة جافة وخشنة الملمس أثناء تقشرها — وهذا أمر طبيعي.",
    },
    resultTimeline: {
      en: "Results may appear after a single treatment or require several visits depending on the condition.",
      ar: "قد تظهر النتائج بعد جلسة واحدة أو تتطلب عدة زيارات حسب الحالة.",
    },
    faqs: [
      {
        question: { en: "What can Ultra treatment address?", ar: "ما الذي يعالجه علاج الترا؟" },
        answer: {
          en: "Mild to moderate age spots, freckles, sun spots, pigmented lesions, sun damage, actinic keratosis, melasma, and postinflammatory hyperpigmentation.",
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
          en: "Mild redness follows treatment and normal activities can resume immediately. Full healing may take 5–7 days, during which skin has a dry, sandpaper-like texture as it exfoliates — this is a normal part of the process.",
          ar: "يظهر احمرار خفيف بعد العلاج ويمكن استئناف الأنشطة الطبيعية فورًا. قد يستغرق التعافي الكامل 5-7 أيام، تكون خلالها البشرة جافة وخشنة الملمس أثناء تقشرها — وهذا أمر طبيعي ضمن العملية.",
        },
      },
      {
        question: { en: "Will one session be enough?", ar: "هل تكفي جلسة واحدة؟" },
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
      en: "Platelet-Rich Plasma injected into the scalp to stimulate inactive hair follicles and promote denser, fuller hair growth — performed by Dr. Farhat.",
      ar: "حقن البلازما الغنية بالصفائح الدموية في فروة الرأس لتنشيط البصيلات الخاملة وتعزيز نمو شعر أكثف وأكمل — يُجريها الدكتور فرحات.",
    },
    howItWorks: {
      en: "PRP is a regenerative serum created from the patient's own blood. After a blood draw, plasma is separated and concentrated into a serum rich in growth factors that stimulate inactive hair follicles and improve scalp blood circulation.",
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
          en: "PRP treatments are performed by Dr. Farhat, combining advanced technique with personalized care.",
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
      en: 'PRP used topically or via microinjections to smooth fine lines and wrinkles, improve tone and elasticity, and reduce acne scars and pigmentation — often called the "vampire facial."',
      ar: "تُستخدم البلازما الغنية بالصفائح الدموية موضعيًا أو عبر حقن دقيقة لتنعيم الخطوط الدقيقة والتجاعيد، وتحسين نضارة البشرة ومرونتها، وتقليل ندبات حب الشباب والتصبغ — يُعرف أحيانًا باسم \"فيشل مصاص الدماء\".",
    },
    howItWorks: {
      en: "The same patient-derived, growth-factor-rich serum used for hair restoration is applied to the skin, boosting collagen production for firmer, more youthful skin using no synthetic additives.",
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
          en: "No — it uses the same patient-derived, growth-factor-rich serum used for PRP hair restoration, with no synthetic additives.",
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
      en: "Equipment addressing many pelvic floor issues and sexual health concerns that women experience at all ages and stages of life — roughly 1 in 3 women, often in silence.",
      ar: "جهاز يُعالج العديد من مشاكل قاع الحوض والصحة الجنسية التي تواجهها النساء في مختلف الأعمار ومراحل الحياة — تعاني منها نحو امرأة من كل ثلاث، وغالبًا بصمت.",
    },
    whoItsFor: {
      en: "Women experiencing pelvic floor or sexual health concerns who want to discuss whether this simple, in-clinic procedure may be right for them.",
      ar: "النساء اللواتي يواجهن مخاوف متعلقة بقاع الحوض أو الصحة الجنسية، ويرغبن بمناقشة ما إذا كان هذا الإجراء البسيط داخل العيادة مناسبًا لهن.",
    },
    faqs: [
      {
        question: { en: "How common are the concerns TempSure Vitalia addresses?", ar: "ما مدى شيوع المشاكل التي يعالجها TempSure Vitalia؟" },
        answer: {
          en: "Roughly 1 in 3 women experience pelvic floor or sexual health concerns at some point, often in silence.",
          ar: "تعاني نحو امرأة من كل ثلاث من مشاكل قاع الحوض أو الصحة الجنسية في مرحلة ما، وغالبًا بصمت.",
        },
      },
      {
        question: { en: "Is this a surgical procedure?", ar: "هل هذا إجراء جراحي؟" },
        answer: {
          en: "No — it's described as a simple, in-clinic procedure.",
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
 * See docs/MISSING_CONTENT_REPORT.md and docs/CONTENT_APPROVAL_MATRIX.md.
 */
export const gatedTreatments: (AestheticTreatment & { requiresFeature: string })[] = [
  {
    id: "cosmetic-botox",
    slug: "cosmetic-botox",
    slugAr: "بوتوكس-تجميلي",
    title: { en: "Cosmetic Botox", ar: "بوتوكس تجميلي" },
    summary: {
      en: "Cosmetic Botox for frown lines, forehead lines, crow's feet, and more — administered by Dr. Farhat. See the full treatment-area list on our Botox page.",
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
      en: "Skin tightening at Blue Diamond is delivered through our Radio Frequency (TempSure) treatment — see that page for the full clinical detail.",
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
