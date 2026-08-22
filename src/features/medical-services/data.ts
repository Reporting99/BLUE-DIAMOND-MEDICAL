import type { MedicalServiceContent } from "@/features/medical-services/types";

/**
 * Every field traces to Blue-Diamond-Medical-Website-Content-Extraction_1.docx
 * — see docs/CONTENT_MODEL.md. Where the source only listed a
 * service name with no detail (weight management, pain management), the
 * page stays short and honest rather than inventing clinical specifics.
 */
export const medicalServices: MedicalServiceContent[] = [
  {
    id: "eye-screening",
    slug: "eye-screening",
    slugAr: "فحص-العين",
    title: { en: "Eye Disease Screening", ar: "فحص أمراض العين" },
    summary: {
      en: "A collaboration with Euclid Telehealth offering AHS-covered eye disease screening at our clinic — in keeping with our belief that prevention is better than cure.",
      ar: "بالتعاون مع Euclid Telehealth، نقدّم فحصًا لأمراض العين مشمولًا بالتأمين الصحي في عيادتنا — انطلاقًا من إيماننا بأن الوقاية خير من العلاج.",
    },
    whoItsFor: {
      en: "All patients, especially diabetics and those with a family history of eye disease.",
      ar: "جميع المرضى، وخصوصًا مرضى السكري ومن لديهم تاريخ عائلي لأمراض العين.",
    },
    whatsIncluded: {
      en: [
        "A non-invasive, 20-minute eye disease screening",
        "Euclid Telehealth on-site once a month",
        "Early detection, prevention, and treatment guidance for vision loss",
      ],
      ar: [
        "فحص غير جراحي لأمراض العين مدته 20 دقيقة",
        "فريق Euclid Telehealth حاضر في العيادة مرة واحدة شهريًا",
        "الكشف المبكر والوقاية وإرشادات العلاج للحفاظ على البصر",
      ],
    },
    howAppointmentsWork: {
      en: "Based on your doctor's recommendation, Euclid Telehealth will contact you directly to schedule your screening.",
      ar: "بناءً على توصية طبيبكم، سيتواصل فريق Euclid Telehealth معكم مباشرة لتحديد موعد الفحص.",
    },
    relatedDoctorIds: [],
    bookingChannel: "eye-screening",
    contactNote: {
      en: "Euclid Telehealth patient support: patientsupport@euclidtelehealth.org or 1-800-511-5661.",
      ar: "دعم مرضى Euclid Telehealth: patientsupport@euclidtelehealth.org أو 1-800-511-5661.",
    },
    faqs: [
      {
        question: { en: "Is the eye disease screening covered by Alberta Health?", ar: "هل فحص أمراض العين مشمول بالتأمين الصحي لألبرتا؟" },
        answer: {
          en: "Yes — this screening is AHS-covered, provided through our collaboration with Euclid Telehealth.",
          ar: "نعم — هذا الفحص مشمول بالتأمين الصحي لألبرتا (AHS)، ويُقدَّم من خلال تعاوننا مع Euclid Telehealth.",
        },
      },
      {
        question: { en: "How do I get a screening appointment?", ar: "كيف أحصل على موعد للفحص؟" },
        answer: {
          en: "Your family doctor refers you based on clinical need; Euclid Telehealth then contacts you directly to schedule the visit, which takes place on-site at our clinic once a month.",
          ar: "يُحيلكم طبيب الأسرة بناءً على الحاجة السريرية، ثم يتواصل فريق Euclid Telehealth معكم مباشرة لتحديد الموعد، الذي يُجرى في عيادتنا مرة واحدة شهريًا.",
        },
      },
      {
        question: { en: "What does the screening involve?", ar: "ماذا يتضمن الفحص؟" },
        answer: {
          en: "It's a non-invasive screening that takes about 20 minutes, aimed at early detection of eye disease before symptoms appear.",
          ar: "هو فحص غير جراحي يستغرق نحو 20 دقيقة، ويهدف إلى الكشف المبكر عن أمراض العين قبل ظهور الأعراض.",
        },
      },
      {
        question: { en: "Who should consider this screening?", ar: "لمن يُنصح بهذا الفحص؟" },
        answer: {
          en: "It's available to all patients, and particularly relevant for people with diabetes or a family history of eye disease, since both are recognized risk factors for vision loss.",
          ar: "متاح لجميع المرضى، ويُنصح به بشكل خاص لمرضى السكري أو من لديهم تاريخ عائلي لأمراض العين، إذ يُعدّان من عوامل الخطر المعروفة لفقدان البصر.",
        },
      },
      {
        question: { en: "What happens if the screening finds something?", ar: "ماذا يحدث إذا أظهر الفحص وجود مشكلة؟" },
        answer: {
          en: "Euclid Telehealth provides guidance on next steps, which may include further testing or a referral, depending on what's found.",
          ar: "يقدّم فريق Euclid Telehealth إرشادات حول الخطوات التالية، والتي قد تشمل مزيدًا من الفحوصات أو إحالة طبية، بحسب النتائج.",
        },
      },
      {
        question: { en: "Who can I contact with questions about my screening?", ar: "بمن يمكنني التواصل للاستفسار عن فحصي؟" },
        answer: {
          en: "Euclid Telehealth's patient support team handles screening-specific questions directly — see their contact details above.",
          ar: "يتولى فريق دعم مرضى Euclid Telehealth الإجابة عن الاستفسارات المتعلقة بالفحص مباشرةً — راجعوا بيانات التواصل أعلاه.",
        },
      },
    ],
    sourceVerified: true,
  },
  {
    id: "after-hours-care",
    slug: "after-hours-care",
    slugAr: "الرعاية-خارج-أوقات-الدوام",
    title: { en: "After-Hours Care", ar: "الرعاية خارج أوقات الدوام" },
    summary: {
      en: "When the clinic is closed, our patients are referred to a partner Primary Care Network for urgent, non-emergency needs — not left without a path to care.",
      ar: "عند إغلاق العيادة، يُحال مرضانا إلى شبكة رعاية أولية شريكة لتلبية الاحتياجات العاجلة غير الطارئة — دون أن يبقوا دون خيار للرعاية.",
    },
    urgentCareNote: {
      en: "This referral pathway is for urgent, non-emergency needs only — it is not a substitute for calling 911 in a true emergency.",
      ar: "مسار الإحالة هذا مخصص للاحتياجات العاجلة غير الطارئة فقط — وهو لا يُغني عن الاتصال بالرقم 911 في حال وجود طارئ حقيقي.",
    },
    relatedDoctorIds: ["reem-hamdi", "mohamed-farhat"],
    bookingChannel: "family-doctor",
    externalPartners: [
      {
        name: "Mosaic Primary Care Network",
        url: "https://mosaicpcn.ca",
        note: { en: "For Dr. Hamdi's patients.", ar: "لمرضى الدكتورة حمدي." },
      },
      {
        name: "Calgary West Central Primary Care Network",
        url: "https://cwcpcn.com",
        note: { en: "For Dr. Farhat's patients.", ar: "لمرضى الدكتور فرحات." },
      },
    ],
    faqs: [
      {
        question: { en: "What counts as an urgent, non-emergency need?", ar: "ما الذي يُعدّ حاجة عاجلة غير طارئة؟" },
        answer: {
          en: "Concerns that need attention before your next scheduled appointment but aren't life-threatening — for example a worsening infection or a medication question. A true medical emergency always means 911 or the nearest emergency department, not this pathway.",
          ar: "هي حالات تحتاج إلى اهتمام قبل موعدكم القادم لكنها ليست مهددة للحياة — مثل عدوى تتفاقم أو استفسار عن دواء. أما حالة الطوارئ الطبية الحقيقية فتستوجب دائمًا الاتصال بالرقم 911 أو التوجه إلى أقرب قسم طوارئ، لا هذا المسار.",
        },
      },
      {
        question: { en: "Which Primary Care Network do I contact?", ar: "بأي شبكة رعاية أولية أتواصل؟" },
        answer: {
          en: "It depends on your family doctor: Dr. Hamdi's patients are referred to Mosaic Primary Care Network, and Dr. Farhat's patients to Calgary West Central Primary Care Network.",
          ar: "يعتمد ذلك على طبيب أسرتكم: يُحال مرضى الدكتورة حمدي إلى شبكة Mosaic للرعاية الأولية، بينما يُحال مرضى الدكتور فرحات إلى شبكة Calgary West Central للرعاية الأولية.",
        },
      },
      {
        question: { en: "Does this apply to every patient at the clinic?", ar: "هل ينطبق هذا على جميع مرضى العيادة؟" },
        answer: {
          en: "The after-hours pathway described here is documented for patients of Dr. Hamdi and Dr. Farhat specifically. If your family doctor is someone else, ask at your next visit which after-hours option applies to you.",
          ar: "المسار الموضّح هنا موثّق لمرضى الدكتورة حمدي والدكتور فرحات تحديدًا. إذا كان طبيب أسرتكم غير ذلك، يُرجى الاستفسار في زيارتكم القادمة عن خيار الرعاية خارج أوقات الدوام الخاص بكم.",
        },
      },
      {
        question: { en: "Is there a cost for after-hours PCN care?", ar: "هل هناك تكلفة للرعاية خارج أوقات الدوام عبر شبكة الرعاية الأولية؟" },
        answer: {
          en: "Contact the relevant Primary Care Network directly for their current fee and coverage information — this isn't something our clinic bills for, since the care is delivered by the PCN partner.",
          ar: "يُرجى التواصل مباشرة مع شبكة الرعاية الأولية المعنية للاستفسار عن الرسوم والتغطية الحالية — فعيادتنا لا تُصدر فواتير لهذه الخدمة، إذ تُقدَّم الرعاية من قِبل الشبكة الشريكة.",
        },
      },
      {
        question: { en: "What if I'm not sure whether it's an emergency?", ar: "ماذا لو لم أكن متأكدًا مما إذا كانت حالتي طارئة؟" },
        answer: {
          en: "When in doubt, treat it as an emergency and call 911 or go to the nearest emergency department. It's always safer to be assessed by emergency services than to wait.",
          ar: "عند الشك، تعاملوا مع الحالة كطارئة واتصلوا بالرقم 911 أو توجهوا إلى أقرب قسم طوارئ. من الأسلم دائمًا أن يتم تقييمكم من قبل خدمات الطوارئ بدلًا من الانتظار.",
        },
      },
    ],
    sourceVerified: true,
  },
  {
    id: "chronic-disease-management",
    slug: "chronic-disease-management",
    slugAr: "إدارة-الأمراض-المزمنة",
    title: { en: "Chronic Disease Management", ar: "إدارة الأمراض المزمنة" },
    summary: {
      en: "AHS-insured, ongoing management of chronic conditions through your family physician, with Dr. Bakare's particular focus on chronic disease management and palliative care.",
      ar: "إدارة مستمرة للأمراض المزمنة مشمولة بالتأمين الصحي عبر طبيب أسرتكم، مع تركيز خاص من الدكتور باكاري على إدارة الأمراض المزمنة والرعاية التلطيفية.",
    },
    whoItsFor: {
      en: "Patients living with an ongoing health condition that needs regular monitoring and a coordinated care plan.",
      ar: "المرضى الذين يعانون من حالة صحية مستمرة تتطلب متابعة منتظمة وخطة رعاية منسقة.",
    },
    relatedDoctorIds: ["bakare"],
    bookingChannel: "family-doctor",
    faqs: [
      {
        question: { en: "Is chronic disease management covered by Alberta Health?", ar: "هل إدارة الأمراض المزمنة مشمولة بالتأمين الصحي لألبرتا؟" },
        answer: {
          en: "Yes — this is provided as part of AHS-insured family medicine care.",
          ar: "نعم — تُقدَّم هذه الخدمة كجزء من رعاية طب الأسرة المشمولة بالتأمين الصحي لألبرتا (AHS).",
        },
      },
      {
        question: { en: "What kinds of conditions does this cover?", ar: "ما أنواع الحالات التي تشملها هذه الخدمة؟" },
        answer: {
          en: "Any ongoing health condition that needs regular monitoring and a coordinated plan — your family physician will discuss what that looks like for your specific situation.",
          ar: "أي حالة صحية مستمرة تحتاج إلى متابعة منتظمة وخطة رعاية منسقة — سيناقش طبيب أسرتكم ما يناسب حالتكم تحديدًا.",
        },
      },
      {
        question: { en: "Does Dr. Bakare only see patients for chronic disease management?", ar: "هل يستقبل الدكتور باكاري مرضى إدارة الأمراض المزمنة فقط؟" },
        answer: {
          en: "No — chronic disease management is one of Dr. Bakare's particular clinical interests, alongside palliative care, but any of our family physicians can provide this care.",
          ar: "لا — إدارة الأمراض المزمنة هي أحد اهتمامات الدكتور باكاري السريرية الخاصة، إلى جانب الرعاية التلطيفية، لكن أيًا من أطباء الأسرة لدينا يمكنه تقديم هذه الرعاية.",
        },
      },
      {
        question: { en: "How often will I need to be seen?", ar: "كم مرة سأحتاج إلى المراجعة؟" },
        answer: {
          en: "This depends entirely on your specific condition and care plan — your physician will set a monitoring schedule that's appropriate for you.",
          ar: "يعتمد ذلك كليًا على حالتكم وخطة رعايتكم — سيحدد طبيبكم جدول متابعة مناسبًا لكم.",
        },
      },
      {
        question: { en: "How do I book a chronic disease management visit?", ar: "كيف أحجز موعدًا لإدارة مرض مزمن؟" },
        answer: {
          en: "Book with your family doctor through Mika, the same system used for all family-medicine appointments at our clinic.",
          ar: "احجزوا مع طبيب أسرتكم عبر نظام Mika، وهو النظام نفسه المستخدم لجميع مواعيد طب الأسرة في عيادتنا.",
        },
      },
    ],
    sourceVerified: true,
  },
  {
    id: "preventive-care",
    slug: "preventive-care",
    slugAr: "الرعاية-الوقائية",
    title: { en: "Preventive Care", ar: "الرعاية الوقائية" },
    summary: {
      en: '"Prevention is better than cure" is at the core of how we practice — from vaccination to Dr. Saeed\'s clinical focus on preventive medicine and early intervention.',
      ar: '"الوقاية خير من العلاج" هو جوهر أسلوبنا في الممارسة الطبية — من التطعيمات إلى تركيز الدكتورة سعيد السريري على الطب الوقائي والتدخل المبكر.',
    },
    whatsIncluded: {
      en: ["Vaccination", "Preventive medicine and early-intervention care (Dr. Saeed)", "Referral for AHS-covered eye disease screening"],
      ar: ["التطعيمات", "الطب الوقائي والرعاية بالتدخل المبكر (الدكتورة سعيد)", "الإحالة لفحص أمراض العين المشمول بالتأمين الصحي"],
    },
    relatedDoctorIds: ["omaima-saeed"],
    bookingChannel: "family-doctor",
    faqs: [
      {
        question: { en: "What's included in preventive care here?", ar: "ما الذي تشمله الرعاية الوقائية هنا؟" },
        answer: {
          en: "Vaccination, preventive medicine and early-intervention care, and referral for AHS-covered eye disease screening when appropriate.",
          ar: "التطعيمات، والطب الوقائي والرعاية بالتدخل المبكر، والإحالة لفحص أمراض العين المشمول بالتأمين الصحي عند الحاجة.",
        },
      },
      {
        question: { en: "Is preventive care covered by Alberta Health?", ar: "هل الرعاية الوقائية مشمولة بالتأمين الصحي لألبرتا؟" },
        answer: {
          en: "Yes, as part of AHS-insured family medicine care.",
          ar: "نعم، كجزء من رعاية طب الأسرة المشمولة بالتأمين الصحي لألبرتا (AHS).",
        },
      },
      {
        question: { en: "Do I need to see Dr. Saeed specifically for preventive care?", ar: "هل يجب أن أراجع الدكتورة سعيد تحديدًا للرعاية الوقائية؟" },
        answer: {
          en: "Preventive medicine and early intervention is a particular clinical focus of Dr. Saeed's, but preventive care in general is available from any of our family physicians.",
          ar: "الطب الوقائي والتدخل المبكر هو تركيز سريري خاص لدى الدكتورة سعيد، إلا أن الرعاية الوقائية بشكل عام متاحة لدى أي من أطباء الأسرة في عيادتنا.",
        },
      },
      {
        question: { en: "Which vaccinations are available?", ar: "ما التطعيمات المتوفرة؟" },
        answer: {
          en: "Discuss which vaccinations are appropriate for you or your family with your physician at your appointment.",
          ar: "ناقشوا مع طبيبكم في موعدكم أي التطعيمات المناسبة لكم أو لعائلتكم.",
        },
      },
      {
        question: { en: "How do I book a preventive care visit?", ar: "كيف أحجز موعدًا للرعاية الوقائية؟" },
        answer: {
          en: "Book with your family doctor through Mika.",
          ar: "احجزوا مع طبيب أسرتكم عبر نظام Mika.",
        },
      },
    ],
    sourceVerified: true,
  },
  {
    id: "weight-management",
    slug: "weight-management",
    slugAr: "إدارة-الوزن",
    title: { en: "Weight Management", ar: "إدارة الوزن" },
    summary: {
      en: "AHS-insured weight management support as part of your comprehensive care with your family physician.",
      ar: "دعم إدارة الوزن المشمول بالتأمين الصحي كجزء من رعايتكم الشاملة مع طبيب أسرتكم.",
    },
    relatedDoctorIds: [],
    bookingChannel: "family-doctor",
    faqs: [
      {
        question: { en: "Is weight management covered by Alberta Health?", ar: "هل إدارة الوزن مشمولة بالتأمين الصحي لألبرتا؟" },
        answer: {
          en: "Yes — it's provided as part of AHS-insured family medicine care.",
          ar: "نعم — تُقدَّم كجزء من رعاية طب الأسرة المشمولة بالتأمين الصحي لألبرتا (AHS).",
        },
      },
      {
        question: { en: "What does weight management support involve?", ar: "ماذا يتضمن دعم إدارة الوزن؟" },
        answer: {
          en: "This is provided as part of your comprehensive, ongoing care with your family physician — they'll discuss an approach suited to your health history and goals.",
          ar: "تُقدَّم هذه الرعاية كجزء من رعايتكم الشاملة والمستمرة مع طبيب أسرتكم، الذي سيناقش معكم النهج المناسب لتاريخكم الصحي وأهدافكم.",
        },
      },
      {
        question: { en: "Do I need a referral for weight management support?", ar: "هل أحتاج إلى إحالة للحصول على دعم إدارة الوزن؟" },
        answer: {
          en: "No — raise it directly with your family physician at a regular appointment.",
          ar: "لا — يمكنكم طرح الموضوع مباشرة مع طبيب أسرتكم في موعد اعتيادي.",
        },
      },
      {
        question: { en: "How do I book this appointment?", ar: "كيف أحجز هذا الموعد؟" },
        answer: {
          en: "Book with your family doctor through Mika.",
          ar: "احجزوا مع طبيب أسرتكم عبر نظام Mika.",
        },
      },
    ],
    sourceVerified: true,
  },
  {
    id: "pain-management",
    slug: "pain-management",
    slugAr: "إدارة-الألم",
    title: { en: "Pain Management", ar: "إدارة الألم" },
    summary: {
      en: "AHS-insured pain management support from your family physician.",
      ar: "دعم إدارة الألم المشمول بالتأمين الصحي من طبيب أسرتكم.",
    },
    relatedDoctorIds: [],
    bookingChannel: "family-doctor",
    faqs: [
      {
        question: { en: "Is pain management covered by Alberta Health?", ar: "هل إدارة الألم مشمولة بالتأمين الصحي لألبرتا؟" },
        answer: {
          en: "Yes — it's provided as part of AHS-insured family medicine care.",
          ar: "نعم — تُقدَّم كجزء من رعاية طب الأسرة المشمولة بالتأمين الصحي لألبرتا (AHS).",
        },
      },
      {
        question: { en: "What kind of pain can I discuss with my family doctor?", ar: "ما نوع الألم الذي يمكنني مناقشته مع طبيب أسرتي؟" },
        answer: {
          en: "Any ongoing or recurring pain — your family physician will assess it and discuss an appropriate management approach as part of your care.",
          ar: "أي ألم مستمر أو متكرر — سيقيّم طبيب أسرتكم حالتكم ويناقش معكم نهج الإدارة المناسب ضمن رعايتكم.",
        },
      },
      {
        question: { en: "For minor in-clinic procedures related to pain, like joint injections, who provides those?", ar: "من يقدّم الإجراءات البسيطة داخل العيادة المتعلقة بالألم، مثل الحقن المفصلية؟" },
        answer: {
          en: "Dr. Bakare offers intra-articular injections for degenerative knee, shoulder, and ankle conditions in-house — see the Minor Procedures page for detail.",
          ar: "يقدّم الدكتور باكاري حقنًا مفصلية لحالات تنكس الركبة والكتف والكاحل داخل العيادة — راجعوا صفحة الإجراءات البسيطة للتفاصيل.",
        },
      },
      {
        question: { en: "How do I book a pain management appointment?", ar: "كيف أحجز موعدًا لإدارة الألم؟" },
        answer: {
          en: "Book with your family doctor through Mika.",
          ar: "احجزوا مع طبيب أسرتكم عبر نظام Mika.",
        },
      },
    ],
    sourceVerified: true,
  },
  {
    id: "minor-procedures",
    slug: "minor-procedures",
    slugAr: "الإجراءات-البسيطة",
    title: { en: "Minor Procedures", ar: "الإجراءات البسيطة" },
    summary: {
      en: "AHS-insured minor procedures including suture removal and application, with Dr. Bakare additionally offering in-house minor skin lesion excision and joint injections.",
      ar: "إجراءات بسيطة مشمولة بالتأمين الصحي تشمل إزالة الغرز وتركيبها، إضافةً إلى استئصال الآفات الجلدية البسيطة والحقن المفصلية داخل العيادة مع الدكتور باكاري.",
    },
    whatsIncluded: {
      en: [
        "Suture removal and application",
        "Minor skin lesion excision (Dr. Bakare)",
        "Intra-articular injections for degenerative knee, shoulder, and ankle conditions (Dr. Bakare)",
      ],
      ar: [
        "إزالة الغرز وتركيبها",
        "استئصال الآفات الجلدية البسيطة (الدكتور باكاري)",
        "حقن مفصلية لحالات تنكس الركبة والكتف والكاحل (الدكتور باكاري)",
      ],
    },
    relatedDoctorIds: ["bakare"],
    bookingChannel: "family-doctor",
    faqs: [
      {
        question: { en: "Are minor procedures covered by Alberta Health?", ar: "هل الإجراءات البسيطة مشمولة بالتأمين الصحي لألبرتا؟" },
        answer: {
          en: "Yes — the procedures listed here are AHS-insured.",
          ar: "نعم — الإجراءات المذكورة هنا مشمولة بالتأمين الصحي لألبرتا (AHS).",
        },
      },
      {
        question: { en: "What minor procedures are available?", ar: "ما الإجراءات البسيطة المتوفرة؟" },
        answer: {
          en: "Suture removal and application are available generally, and Dr. Bakare additionally offers minor skin lesion excision and intra-articular injections for degenerative knee, shoulder, and ankle conditions.",
          ar: "إزالة الغرز وتركيبها متاحة بشكل عام، ويقدّم الدكتور باكاري إضافةً إلى ذلك استئصال الآفات الجلدية البسيطة والحقن المفصلية لحالات تنكس الركبة والكتف والكاحل.",
        },
      },
      {
        question: { en: "Do I need to see Dr. Bakare specifically?", ar: "هل يجب أن أراجع الدكتور باكاري تحديدًا؟" },
        answer: {
          en: "For skin lesion excision and joint injections, yes — these are offered by Dr. Bakare in-house. Suture care is available more generally; ask at booking.",
          ar: "بالنسبة لاستئصال الآفات الجلدية والحقن المفصلية، نعم — يقدّمها الدكتور باكاري داخل العيادة. أما رعاية الغرز فمتاحة بشكل أعم؛ يُرجى الاستفسار عند الحجز.",
        },
      },
      {
        question: { en: "How do I book a minor procedure?", ar: "كيف أحجز موعدًا لإجراء بسيط؟" },
        answer: {
          en: "Book through Mika. If you specifically need Dr. Bakare for a skin lesion or joint injection, mention that when booking.",
          ar: "احجزوا عبر نظام Mika. وإذا كنتم بحاجة تحديدًا إلى الدكتور باكاري لآفة جلدية أو حقنة مفصلية، يُرجى ذكر ذلك عند الحجز.",
        },
      },
      {
        question: { en: "Is this the same as a walk-in visit?", ar: "هل هذا مماثل لزيارة بدون موعد مسبق؟" },
        answer: {
          en: "Minor procedures are typically booked as scheduled appointments rather than handled as a walk-in — book ahead through Mika.",
          ar: "عادةً ما تُحجز الإجراءات البسيطة كمواعيد مجدولة وليس كزيارة بدون موعد مسبق — يُرجى الحجز مسبقًا عبر نظام Mika.",
        },
      },
    ],
    sourceVerified: true,
  },
];

export function getMedicalService(slug: string): MedicalServiceContent | undefined {
  return medicalServices.find((s) => s.slug === slug);
}
