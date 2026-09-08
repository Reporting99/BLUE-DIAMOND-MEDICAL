# SkinMedica — archived catalogue

Retired **2026-09-07**. Blue Diamond Medical stopped carrying the SkinMedica line and now carries **Myriade** only.

This is the complete, human-readable record of everything SkinMedica that was published on the site — all 23 approved products, their exact approved prices and sizes, the full bilingual detail copy, every product FAQ, and the source behind every claim. It is the archive a non-developer can read; the machine-readable twin is [`skinmedica-catalogue.json`](skinmedica-catalogue.json) and the code of record is [`src/features/products/archive/skinmedica.ts`](../../src/features/products/archive/skinmedica.ts).

## Status

| | |
|---|---|
| Products archived | 23 |
| Published product pages withdrawn | 46 (EN + AR) |
| Feature flag | `skinMedicaEnabled: false` — `src/config/features.ts` |
| Old product URLs | 301 → `/shop` (`src/lib/routing/moved-routes.ts`) |
| Legacy site URLs | `/about-skinmedica-products/f/*` → `/en/shop`, single hop |
| Restoring the line | flip the flag to `true` and deploy — no content is rewritten |

Nothing here is deleted. The flag is off because the instruction was that the line is stopped *currently*.

## Where SkinMedica used to appear

| Place | What it was | What it is now |
|---|---|---|
| `/shop` hub intro + CTA | named the SkinMedica line | names Myriade; CTA is "Contact the Clinic About Our Products" |
| `/shop` product grid | 23 SkinMedica cards ahead of the Myriade ones | Myriade only |
| `/shop/category/*` | 7 SkinMedica-only groupings (cleansers, serums, moisturizers, retinol, eye-care, scar-care, treatment-systems) | those 7 routes no longer exist — they would have been empty listing pages |
| Homepage product section | eyebrow "SKINMEDICA", 6 SkinMedica products | eyebrow "MYRIADE", 6 Myriade products |
| Homepage FAQ | two questions naming SkinMedica | same two questions, brand-neutral |
| `/contact?topic=skinmedica` | "Ask About SkinMedica" | "Ask About Our Products" — the old `?topic=skinmedica` link still resolves to it |
| Media manifest | a `pending` `skinmedica-collection` photo slot | removed |
| Sitemap | 46 product URLs | none |

## Price list, as approved

Verbatim from the client-approved catalogue (`Blue-Diamond-Medical-Website-Content-Extraction_1(4).docx`). These are the prices that were published; they are a record of what was approved, not a current quotation.

| # | Product | Size | Price (CAD) |
|---:|---|---|---:|
| 1 | Lumivive® System Day, Night | 28.4 g | $285.00 CAD |
| 2 | TNS® Eye Repair | 14.2 g | $108.00 CAD |
| 3 | Vitamin C+E Complex | 28.3 g | $108.00 CAD |
| 4 | Facial Cleanser | 177.4 ml | $40.00 CAD |
| 5 | AHA/BHA Exfoliating Cleanser | 177.4 ml | $50.00 CAD |
| 6 | Retinol Complex 0.25 | 29.6 g | $66.00 CAD |
| 7 | Retinol Complex 0.5 | 29.6 g | $83.00 CAD |
| 8 | Retinol Complex 1.0 | 29.6 g | $99.00 CAD |
| 9 | Lytera® 2.0 Pigment Brightening Serum | 60 ml | $170.00 CAD |
| 10 | AHA/BHA Cream | 56.7 g | $46.00 CAD |
| 11 | Daily Physical Defense® SPF 34 | 85 ml | $51.00 CAD |
| 12 | Total Defense + Repair SPF 34 (Tinted) | 65 g | $75.00 CAD |
| 13 | Total Defense + Repair SPF 34 (Clear) | 65 g | $75.00 CAD |
| 14 | Dermal Repair Cream | 48 g | $136.00 CAD |
| 15 | Rejuvenative Moisturizer | 56.7 g | $62.00 CAD |
| 16 | Replenish Hydrating Cream | 56.7 g | $70.00 CAD |
| 17 | TNS Ceramide Treatment Cream® | 56.7 g | $72.00 CAD |
| 18 | Ultra Sheer Moisturizer | 56.7 g | $62.00 CAD |
| 19 | Scar Recovery Gel with Centelline® (Small) | 14.2 g | $46.00 CAD |
| 20 | Scar Recovery Gel with Centelline® (Large) | 56.7 g | $108.00 CAD |
| 21 | TNS® Advanced+ Serum | 28.4 g | $330.00 CAD |
| 22 | TNS Recovery Complex® | 28.4 g | $250.00 CAD |
| 23 | HA5® Rejuvenating Hydrator | 56.7 g | $196.00 CAD |

Lowest $40.00 CAD · highest $330.00 CAD · all 23 combined $2588.00 CAD.

## The 23 products in full

### 1. Lumivive® System Day, Night

- **Arabic name:** نظام لوميفيف® (نهار، ليل)
- **id:** `lumivive-system`
- **Retired URLs:** `/en/shop/lumivive-system-day-night` · `/ar/المتجر/نظام-لوميفيف-نهار-ليل`
- **Price:** $285.00 CAD
- **Size:** 28.4 g
- **Categories:** treatment-systems
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A two-step day-and-night system: a daytime step formulated to help shield skin from blue light and environmental stress, and a nighttime step formulated to support skin's overnight repair process.
- AR: نظام من خطوتين للنهار والليل: خطوة نهارية مصممة للمساعدة في حماية البشرة من الضوء الأزرق والإجهاد البيئي، وخطوة ليلية مصممة لدعم عملية إصلاح البشرة أثناء الليل.

**What it is**

- EN: A two-bottle treatment system (Day, Night), not a single product — both bottles are included in this one price/size record.
- AR: نظام علاجي من زجاجتين (نهار، ليل) وليس منتجًا واحدًا — كلتا الزجاجتين مشمولتان بهذا السعر والحجم.

**Product type**

- EN: Two-step antioxidant treatment system
- AR: نظام علاجي مضاد للأكسدة من خطوتين

**Where it sits in a routine**

- EN: After cleansing and toning, before other treatment products and moisturizer — Day in the morning, Night in the evening.
- AR: بعد التنظيف والتونر، وقبل باقي منتجات العلاج والمرطب — خطوة النهار صباحًا وخطوة الليل مساءً.

**Key characteristics**

1. EN: Two-step system: Day and Night formulas
   AR: نظام من خطوتين: تركيبة نهارية وأخرى ليلية
2. EN: Contains antioxidants including Coenzyme Q10, Niacinamide, Panthenol, Peptides, Shea Butter, and Vitamin E, per manufacturer information
   AR: يحتوي على مضادات أكسدة تشمل إنزيم Q10، النياسيناميد، البانثينول، الببتيدات، زبدة الشيا، وفيتامين E، وفق معلومات الشركة المصنّعة

**How to use**

- EN: Apply 1 pump of the Day formula in the morning and 1 pump of the Night formula in the evening, after cleansing and toning, to face, neck, and décolletage.
- AR: ضعوا ضغطة واحدة من تركيبة النهار صباحًا وضغطة واحدة من تركيبة الليل مساءً، بعد التنظيف والتونر، على الوجه والرقبة وأعلى الصدر.


**Related products:** `vitamin-c-e-complex`, `tns-eye-repair`

**Questions and answers (6)**

1. **Is this one product or two?**
   It's a two-bottle system — a Day formula and a Night formula — sold together as one record at this price and size.
   - سؤال: هل هذا منتج واحد أم اثنان؟
   - جواب: هو نظام من زجاجتين — تركيبة نهارية وأخرى ليلية — تُباع معًا بهذا السعر والحجم.
2. **When do I use each bottle?**
   The Day formula in the morning and the Night formula in the evening, both after cleansing and toning.
   - سؤال: متى أستخدم كل زجاجة؟
   - جواب: تركيبة النهار صباحًا وتركيبة الليل مساءً، وكلتاهما بعد التنظيف والتونر.
3. **What is Lumivive designed to help with?**
   Per manufacturer information, the Day formula is designed to help shield skin from blue light and environmental stress, and the Night formula is designed to support the skin's overnight repair process.
   - سؤال: ما الذي صُمم نظام لوميفيف للمساعدة فيه؟
   - جواب: وفق معلومات الشركة المصنّعة، صُممت تركيبة النهار للمساعدة في حماية البشرة من الضوء الأزرق والإجهاد البيئي، وصُممت تركيبة الليل لدعم عملية إصلاح البشرة أثناء الليل.
4. **Where do I apply it?**
   Face, neck, and décolletage.
   - سؤال: أين أضعه؟
   - جواب: الوجه والرقبة وأعلى الصدر.
5. **Can I combine this with other SkinMedica products?**
   This is a routine question best confirmed with the clinic directly, since it depends on your full regimen.
   - سؤال: هل يمكنني الجمع بينه وبين منتجات أخرى من سكين ميديكا؟
   - جواب: هذا سؤال يتعلق بروتين العناية ويُفضَّل تأكيده مباشرة مع العيادة، لأنه يعتمد على نظام عنايتكم الكامل.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly — see the notice above.
   - سؤال: كيف أتأكد من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية — راجعوا الإشعار أعلاه.

**Sources**

- https://www.skinmedica.com/us/product-category/correction/96202.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 2. TNS® Eye Repair

- **Arabic name:** TNS® لإصلاح محيط العين
- **id:** `tns-eye-repair`
- **Retired URLs:** `/en/shop/tns-eye-repair` · `/ar/المتجر/تي-إن-إس-لإصلاح-محيط-العين`
- **Price:** $108.00 CAD
- **Size:** 14.2 g
- **Categories:** eye-care
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A treatment for the skin around the eyes, combining SkinMedica's TNS® growth-factor technology with peptides and vitamins A, C, and E.
- AR: علاج لبشرة محيط العين، يجمع بين تقنية TNS® لعوامل النمو من سكين ميديكا والببتيدات وفيتامينات A وC وE.

**What it is**

- EN: An eye-area cream formulated for fine lines, wrinkles, skin tone, and texture around the eyes, per manufacturer information.
- AR: كريم لمنطقة العين مصمم للخطوط الدقيقة والتجاعيد ولون وملمس البشرة حول العين، وفق معلومات الشركة المصنّعة.

**Product type**

- EN: Eye-area treatment cream
- AR: كريم علاجي لمحيط العين

**Where it sits in a routine**

- EN: As a targeted treatment step for the eye area, within a broader skincare routine.
- AR: كخطوة علاجية موجّهة لمنطقة العين، ضمن روتين عناية أوسع.

**Key characteristics**

1. EN: Contains TNS® growth-factor technology, peptides, and vitamins A, C, and E, per manufacturer information
   AR: يحتوي على تقنية TNS® لعوامل النمو، وببتيدات، وفيتامينات A وC وE، وفق معلومات الشركة المصنّعة
2. EN: Formulated for the eye area specifically
   AR: مصمم خصيصًا لمنطقة العين

**How to use**

- EN: Apply to the skin around the eyes as directed by the product packaging or your provider; avoid direct contact with the eyes.
- AR: يُطبَّق على الجلد المحيط بالعين وفق تعليمات العبوة أو مقدم الرعاية؛ يُتجنَّب ملامسة العين مباشرة.


**Related products:** `lumivive-system`, `dermal-repair-cream`

**Questions and answers (6)**

1. **What is TNS Eye Repair formulated for?**
   The eye area specifically — fine lines, wrinkles, tone, and texture, per manufacturer information.
   - سؤال: لماذا صُمم TNS لإصلاح محيط العين؟
   - جواب: لمنطقة العين تحديدًا — الخطوط الدقيقة والتجاعيد واللون والملمس، وفق معلومات الشركة المصنّعة.
2. **What is TNS®?**
   TNS® is SkinMedica's growth-factor technology, used across several products in this catalogue.
   - سؤال: ما هو TNS®؟
   - جواب: TNS® هي تقنية عوامل النمو من سكين ميديكا، وتُستخدم في عدة منتجات ضمن هذه القائمة.
3. **Can this go near my eyes safely?**
   It's formulated for the eye area, but avoid direct contact with the eyes themselves — confirm technique with your provider.
   - سؤال: هل يمكن استخدامه بأمان قرب العينين؟
   - جواب: هو مصمم لمنطقة العين، لكن يُتجنَّب ملامسة العين نفسها مباشرة — يُنصح بتأكيد طريقة الاستخدام مع مقدم الرعاية.
4. **What size does this come in?**
   14.2 g.
   - سؤال: ما الحجم المتوفر؟
   - جواب: 14.2 غرام.
5. **Is this the same TNS used in TNS Recovery Complex?**
   It's the same underlying SkinMedica TNS® growth-factor technology, formulated here specifically for the eye area.
   - سؤال: هل هذا TNS نفسه المستخدم في TNS Recovery Complex؟
   - جواب: هي التقنية نفسها لعوامل النمو TNS® من سكين ميديكا، مصممة هنا خصيصًا لمنطقة العين.
6. **How do I ask the clinic about this product?**
   Contact Blue Diamond Medical Clinic directly for current availability and to discuss whether it suits your routine.
   - سؤال: كيف أستفسر عن هذا المنتج من العيادة؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية لمعرفة التوفر الحالي ومناقشة مدى ملاءمته لروتينكم.

**Sources**

- https://skinmedica.com/products/targeted/tnseyerepair — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 3. Vitamin C+E Complex

- **Arabic name:** مركب فيتامين C+E
- **id:** `vitamin-c-e-complex`
- **Retired URLs:** `/en/shop/vitamin-c-e-complex` · `/ar/المتجر/مركب-فيتامين-سي-إي`
- **Price:** $108.00 CAD
- **Size:** 28.3 g
- **Categories:** serums
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A morning antioxidant serum combining vitamin C and vitamin E, formulated to release gradually through the day.
- AR: سيروم صباحي مضاد للأكسدة يجمع بين فيتامين C وفيتامين E، مصمم للتحرر تدريجيًا خلال اليوم.

**What it is**

- EN: A vitamin C and E antioxidant serum for daytime use.
- AR: سيروم مضاد للأكسدة بفيتاميني C وE للاستخدام النهاري.

**Product type**

- EN: Antioxidant serum
- AR: سيروم مضاد للأكسدة

**Where it sits in a routine**

- EN: Each morning after cleansing, toning, and (if used) TNS Recovery Complex, and before moisturizer.
- AR: كل صباح بعد التنظيف والتونر، وبعد TNS Recovery Complex (إن استُخدم)، وقبل المرطب.

**Key characteristics**

1. EN: Contains Ascorbic Acid (vitamin C), Tetrahexyldecyl Ascorbate (a lipid-soluble vitamin C ester), and Tocopherol (vitamin E), per manufacturer information
   AR: يحتوي على حمض الأسكوربيك (فيتامين C)، وTetrahexyldecyl Ascorbate (شكل ذواب في الدهون من فيتامين C)، وTocopherol (فيتامين E)، وفق معلومات الشركة المصنّعة
2. EN: Formulated for gradual release through the day
   AR: مصمم للتحرر التدريجي خلال اليوم

**How to use**

- EN: Apply a single pump into the hand and gently apply to the entire face (neck and chest if desired) each morning.
- AR: ضعوا ضغطة واحدة في راحة اليد وطبّقوها بلطف على الوجه بالكامل (والرقبة والصدر إذا رغبتم) كل صباح.


**Related products:** `lumivive-system`, `daily-physical-defense-spf-34`

**Questions and answers (6)**

1. **When should I apply this?**
   In the morning, after cleansing/toning and before moisturizer.
   - سؤال: متى أضع هذا المنتج؟
   - جواب: في الصباح، بعد التنظيف/التونر وقبل المرطب.
2. **What vitamins does it contain?**
   Vitamin C (as Ascorbic Acid and Tetrahexyldecyl Ascorbate) and vitamin E (as Tocopherol), per manufacturer information.
   - سؤال: ما الفيتامينات التي يحتوي عليها؟
   - جواب: فيتامين C (على شكل حمض الأسكوربيك وTetrahexyldecyl Ascorbate) وفيتامين E (على شكل Tocopherol)، وفق معلومات الشركة المصنّعة.
3. **Should I still wear sunscreen with this?**
   An antioxidant serum doesn't replace sunscreen — daily sun protection is a separate, important step.
   - سؤال: هل ما زلت بحاجة لواقي الشمس مع هذا المنتج؟
   - جواب: لا يُغني السيروم المضاد للأكسدة عن واقي الشمس — الحماية اليومية من الشمس خطوة منفصلة ومهمة.
4. **How much do I use?**
   A single pump, applied to the entire face and optionally neck and chest.
   - سؤال: ما الكمية المستخدمة؟
   - جواب: ضغطة واحدة، تُطبَّق على الوجه بالكامل وبشكل اختياري على الرقبة والصدر.
5. **What size is this?**
   28.3 g.
   - سؤال: ما الحجم؟
   - جواب: 28.3 غرام.
6. **How do I check current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.dermstore.com/p/skinmedica-vitamin-c-plus-e-complex/11289692/ — Dermstore — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)

---

### 4. Facial Cleanser

- **Arabic name:** غسول الوجه
- **id:** `facial-cleanser`
- **Retired URLs:** `/en/shop/facial-cleanser` · `/ar/المتجر/غسول-الوجه`
- **Price:** $40.00 CAD
- **Size:** 177.4 ml
- **Categories:** cleansers
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A foaming daily cleanser formulated for all skin types, with panthenol to support healthy-looking skin.
- AR: غسول رغوي للاستخدام اليومي مصمم لجميع أنواع البشرة، مع البانثينول لدعم مظهر بشرة صحي.

**What it is**

- EN: A foaming face wash intended to remove dirt, oil, and makeup.
- AR: غسول رغوي للوجه مخصص لإزالة الأوساخ والزيوت ومستحضرات المكياج.

**Product type**

- EN: Foaming facial cleanser
- AR: غسول رغوي للوجه

**Where it sits in a routine**

- EN: First step of a skincare routine, morning and/or evening.
- AR: الخطوة الأولى في روتين العناية بالبشرة، صباحًا و/أو مساءً.

**Key characteristics**

1. EN: Foaming formula for all skin types, per manufacturer information
   AR: تركيبة رغوية لجميع أنواع البشرة، وفق معلومات الشركة المصنّعة
2. EN: Contains panthenol
   AR: تحتوي على البانثينول

**How to use**

- EN: Wet the face, apply a small amount, work into a lather, and rinse thoroughly.
- AR: بلّلوا الوجه، ضعوا كمية صغيرة، دلّكوها حتى تتكوّن رغوة، ثم اشطفوا جيدًا.


**Related products:** `aha-bha-exfoliating-cleanser`

**Questions and answers (6)**

1. **What skin types is this for?**
   It's described by the manufacturer as suitable for all skin types.
   - سؤال: لأي أنواع بشرة يناسب هذا المنتج؟
   - جواب: تصفه الشركة المصنّعة بأنه مناسب لجميع أنواع البشرة.
2. **Morning, evening, or both?**
   It can be used as the first step of a morning and/or evening routine.
   - سؤال: صباحًا أم مساءً أم كليهما؟
   - جواب: يمكن استخدامه كخطوة أولى في الروتين الصباحي و/أو المسائي.
3. **Is this different from the AHA/BHA Exfoliating Cleanser?**
   Yes — this is a standard foaming cleanser without exfoliating acids; the AHA/BHA Exfoliating Cleanser is a separate, exfoliating product.
   - سؤال: هل يختلف عن غسول AHA/BHA المقشر؟
   - جواب: نعم — هذا غسول رغوي عادي دون أحماض مقشرة؛ أما غسول AHA/BHA المقشر فهو منتج منفصل ومقشر.
4. **What size is this?**
   177.4 ml.
   - سؤال: ما الحجم؟
   - جواب: 177.4 مل.
5. **Does this contain fragrance?**
   Not confirmed by the research for this record — ask the clinic if fragrance-free formulation matters for your skin.
   - سؤال: هل يحتوي على عطر؟
   - جواب: لم يتأكد ذلك من خلال البحث لهذا السجل — يُرجى سؤال العيادة إذا كانت التركيبة الخالية من العطور مهمة لبشرتكم.
6. **How do I confirm price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/facial-cleansers/ — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 5. AHA/BHA Exfoliating Cleanser

- **Arabic name:** غسول مقشر AHA/BHA
- **id:** `aha-bha-exfoliating-cleanser`
- **Retired URLs:** `/en/shop/aha-bha-exfoliating-cleanser` · `/ar/المتجر/غسول-مقشر-aha-bha`
- **Price:** $50.00 CAD
- **Size:** 177.4 ml
- **Categories:** cleansers
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: An exfoliating cleanser combining alpha- and beta-hydroxy acids to cleanse and exfoliate in one step.
- AR: غسول مقشر يجمع بين أحماض ألفا وبيتا هيدروكسي للتنظيف والتقشير في خطوة واحدة.

**What it is**

- EN: A daily-use exfoliating facial cleanser.
- AR: غسول وجه مقشر للاستخدام اليومي.

**Product type**

- EN: AHA/BHA exfoliating cleanser
- AR: غسول مقشر بأحماض AHA/BHA

**Where it sits in a routine**

- EN: First step of a routine, replacing a standard cleanser.
- AR: الخطوة الأولى في الروتين، بديلًا عن الغسول العادي.


**How to use**

- EN: Moisten skin with warm water, apply a small amount to fingertips, gently exfoliate in small circular motions, and rinse thoroughly. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.
- AR: بلّلوا البشرة بماء دافئ، ضعوا كمية صغيرة على أطراف الأصابع، ودلّكوا بلطف بحركات دائرية صغيرة، ثم اشطفوا جيدًا. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء.

**When to use**

- EN: Can be used up to twice daily (morning and evening); those with sensitive skin may start with once daily and increase gradually as tolerated.
- AR: يمكن استخدامه حتى مرتين يوميًا (صباحًا ومساءً)؛ ومن لديهم بشرة حساسة قد يبدؤون بمرة واحدة يوميًا ويزيدون تدريجيًا حسب التحمل.


**Sun-sensitivity warning**

- EN: Contains an alpha-hydroxy acid (AHA), which may increase skin's sensitivity to sunburn. Use a sunscreen and limit sun exposure while using this product and for a week following discontinuation.
- AR: يحتوي على حمض ألفا هيدروكسي (AHA)، ما قد يزيد من حساسية البشرة لحروق الشمس. استخدموا واقي شمس وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه.

**Related products:** `facial-cleanser`, `aha-bha-cream`

**Questions and answers (6)**

1. **How often can I use this?**
   Up to twice daily; sensitive skin should start with once daily and increase gradually as tolerated.
   - سؤال: كم مرة يمكنني استخدامه؟
   - جواب: حتى مرتين يوميًا؛ ويُنصح من لديهم بشرة حساسة بالبدء بمرة واحدة يوميًا والزيادة تدريجيًا حسب التحمل.
2. **Does this make my skin more sun-sensitive?**
   Yes — it contains an AHA, which can increase sun sensitivity. Use sunscreen and limit sun exposure while using it and for a week after stopping.
   - سؤال: هل يزيد هذا المنتج من حساسية بشرتي للشمس؟
   - جواب: نعم — يحتوي على حمض AHA قد يزيد من حساسية الشمس. استخدموا واقي الشمس وقلّلوا التعرض للشمس أثناء الاستخدام ولمدة أسبوع بعد التوقف.
3. **What if it gets in my eyes?**
   Rinse eyes thoroughly with water.
   - سؤال: ماذا لو دخل في عينيّ؟
   - جواب: اشطفوا العينين جيدًا بالماء.
4. **Can I use this with the AHA/BHA Cream too?**
   Both are acid-based products from the same category — ask the clinic how to combine them safely for your skin.
   - سؤال: هل يمكنني استخدامه مع كريم AHA/BHA أيضًا؟
   - جواب: كلاهما منتجان يحتويان على أحماض من الفئة نفسها — يُرجى سؤال العيادة عن كيفية الجمع بينهما بأمان لبشرتكم.
5. **What size is this?**
   177.4 ml.
   - سؤال: ما الحجم؟
   - جواب: 177.4 مل.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/facial-cleansers/20086695.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 6. Retinol Complex 0.25

- **Arabic name:** مركب الريتينول 0.25
- **id:** `retinol-complex-025`
- **Retired URLs:** `/en/shop/retinol-complex-0-25` · `/ar/المتجر/مركب-الريتينول-٠٫٢٥`
- **Price:** $66.00 CAD
- **Size:** 29.6 g
- **Categories:** retinol
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: The lowest of three Retinol Complex strengths — a starting point for those new to retinol.
- AR: أخف تركيزات مركب الريتينول الثلاثة — نقطة بداية مناسبة لمن هم جدد على استخدام الريتينول.

**What it is**

- EN: A retinol treatment, evening use only.
- AR: علاج بالريتينول، للاستخدام المسائي فقط.

**Product type**

- EN: Retinol serum/cream, 0.25% strength
- AR: سيروم/كريم ريتينول بتركيز 0.25%

**Where it sits in a routine**

- EN: In the evening, after cleansing and toning, before moisturizer.
- AR: مساءً، بعد التنظيف والتونر، وقبل المرطب.


**How to use**

- EN: Apply a single pump in the evening after cleansing and toning and before moisturizer, to the entire face. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.
- AR: ضعوا ضغطة واحدة مساءً بعد التنظيف والتونر وقبل المرطب، على الوجه بالكامل. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء.

**When to use**

- EN: If new to retinol, start with twice-weekly use, gradually increasing to every other night, then nightly or as tolerated.
- AR: إذا كنتم جددًا على الريتينول، ابدؤوا باستخدامه مرتين أسبوعيًا، ثم زيدوا تدريجيًا إلى ليلة بعد ليلة، ثم يوميًا أو حسب التحمل.

**Warnings**

1. EN: Mild redness, peeling, and irritation are expected effects when using this product.
   AR: الاحمرار الخفيف والتقشر والتهيج آثار متوقعة عند استخدام هذا المنتج.

**Sun-sensitivity warning**

- EN: Use daily sun protection with SPF 30 or higher and limit sun exposure while using this product and for a week following discontinuation.
- AR: استخدموا واقي شمس يوميًا بعامل حماية SPF 30 أو أعلى، وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه.

**Pregnancy warning**

- EN: Do not use if pregnant, lactating, or planning to become pregnant.
- AR: لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل.

**Related products:** `retinol-complex-05`, `retinol-complex-10`, `dermal-repair-cream`

**Questions and answers (6)**

1. **How is this different from Retinol Complex 0.5 and 1.0?**
   Same product line at a lower retinol strength — a starting point for those new to retinol.
   - سؤال: كيف يختلف عن مركب الريتينول 0.5 و1.0؟
   - جواب: نفس خط المنتج بتركيز ريتينول أخف — نقطة بداية جيدة لمن هم جدد على الريتينول.
2. **Can I use this if pregnant or breastfeeding?**
   No — do not use if pregnant, lactating, or planning to become pregnant.
   - سؤال: هل يمكن استخدامه أثناء الحمل أو الرضاعة؟
   - جواب: لا — لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل.
3. **How often should I use it when starting out?**
   Twice weekly at first, gradually increasing to every other night and then nightly or as tolerated.
   - سؤال: كم مرة أستخدمه عند البدء؟
   - جواب: مرتين أسبوعيًا في البداية، ثم زيادة تدريجية إلى ليلة بعد ليلة ثم يوميًا أو حسب التحمل.
4. **Do I need sunscreen while using this?**
   Yes — SPF 30 or higher daily, with limited sun exposure, during use and for a week after stopping.
   - سؤال: هل أحتاج واقي شمس أثناء استخدامه؟
   - جواب: نعم — عامل حماية SPF 30 أو أعلى يوميًا، مع تقليل التعرض للشمس، أثناء الاستخدام ولمدة أسبوع بعد التوقف.
5. **Is redness normal?**
   Mild redness, peeling, and irritation are expected effects.
   - سؤال: هل الاحمرار أمر طبيعي؟
   - جواب: الاحمرار الخفيف والتقشر والتهيج آثار متوقعة.
6. **How do I confirm price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/correction/20086707.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 7. Retinol Complex 0.5

- **Arabic name:** مركب الريتينول 0.5
- **id:** `retinol-complex-05`
- **Retired URLs:** `/en/shop/retinol-complex-0-5` · `/ar/المتجر/مركب-الريتينول-٠٫٥`
- **Price:** $83.00 CAD
- **Size:** 29.6 g
- **Categories:** retinol
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: The mid-strength Retinol Complex — for those who have built tolerance beyond the 0.25 strength.
- AR: التركيز المتوسط من مركب الريتينول — لمن بنوا تحملًا يتجاوز تركيز 0.25.

**What it is**

- EN: A retinol treatment, evening use only.
- AR: علاج بالريتينول، للاستخدام المسائي فقط.

**Product type**

- EN: Retinol serum/cream, 0.5% strength
- AR: سيروم/كريم ريتينول بتركيز 0.5%

**Where it sits in a routine**

- EN: In the evening, after cleansing and toning, before moisturizer.
- AR: مساءً، بعد التنظيف والتونر، وقبل المرطب.


**How to use**

- EN: Apply a single pump in the evening after cleansing and toning and before moisturizer, to the entire face. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.
- AR: ضعوا ضغطة واحدة مساءً بعد التنظيف والتونر وقبل المرطب، على الوجه بالكامل. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء.

**When to use**

- EN: Typically for those already tolerating a lower retinol strength; increase frequency gradually as tolerated.
- AR: عادة لمن يتحملون بالفعل تركيزًا أخف من الريتينول؛ يُزاد التكرار تدريجيًا حسب التحمل.

**Warnings**

1. EN: Mild redness, peeling, and irritation are expected effects when using this product.
   AR: الاحمرار الخفيف والتقشر والتهيج آثار متوقعة عند استخدام هذا المنتج.

**Sun-sensitivity warning**

- EN: Use daily sun protection with SPF 30 or higher and limit sun exposure while using this product and for a week following discontinuation.
- AR: استخدموا واقي شمس يوميًا بعامل حماية SPF 30 أو أعلى، وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه.

**Pregnancy warning**

- EN: Do not use if pregnant, lactating, or planning to become pregnant.
- AR: لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل.

**Related products:** `retinol-complex-025`, `retinol-complex-10`, `dermal-repair-cream`

**Questions and answers (6)**

1. **Should I start with this strength or the 0.25?**
   Those new to retinol typically start lower and work up — ask your provider what's appropriate for you.
   - سؤال: هل أبدأ بهذا التركيز أم بتركيز 0.25؟
   - جواب: من هم جدد على الريتينول يبدؤون عادة بتركيز أخف ثم يتدرجون — يُرجى سؤال مقدم الرعاية عمّا يناسبكم.
2. **Can I use this if pregnant or breastfeeding?**
   No — do not use if pregnant, lactating, or planning to become pregnant.
   - سؤال: هل يمكن استخدامه أثناء الحمل أو الرضاعة؟
   - جواب: لا — لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل.
3. **Do I need sunscreen while using this?**
   Yes — SPF 30 or higher daily, with limited sun exposure, during use and for a week after stopping.
   - سؤال: هل أحتاج واقي شمس أثناء استخدامه؟
   - جواب: نعم — عامل حماية SPF 30 أو أعلى يوميًا، مع تقليل التعرض للشمس، أثناء الاستخدام ولمدة أسبوع بعد التوقف.
4. **Is redness normal?**
   Mild redness, peeling, and irritation are expected effects.
   - سؤال: هل الاحمرار أمر طبيعي؟
   - جواب: الاحمرار الخفيف والتقشر والتهيج آثار متوقعة.
5. **What size is this?**
   29.6 g.
   - سؤال: ما الحجم؟
   - جواب: 29.6 غرام.
6. **How do I confirm price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/correction/94921.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 8. Retinol Complex 1.0

- **Arabic name:** مركب الريتينول 1.0
- **id:** `retinol-complex-10`
- **Retired URLs:** `/en/shop/retinol-complex-1-0` · `/ar/المتجر/مركب-الريتينول-١٫٠`
- **Price:** $99.00 CAD
- **Size:** 29.6 g
- **Categories:** retinol
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: The highest of three Retinol Complex strengths, for skin that has already built tolerance to retinol.
- AR: أعلى تركيزات مركب الريتينول الثلاثة، لبشرة بنت بالفعل تحملًا للريتينول.

**What it is**

- EN: A retinol treatment, evening use only.
- AR: علاج بالريتينول، للاستخدام المسائي فقط.

**Product type**

- EN: Retinol serum/cream, 1.0% strength
- AR: سيروم/كريم ريتينول بتركيز 1.0%

**Where it sits in a routine**

- EN: In the evening, after cleansing and toning, before moisturizer.
- AR: مساءً، بعد التنظيف والتونر، وقبل المرطب.


**How to use**

- EN: Apply a single pump in the evening after cleansing and toning and before moisturizer, to the entire face. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.
- AR: ضعوا ضغطة واحدة مساءً بعد التنظيف والتونر وقبل المرطب، على الوجه بالكامل. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء.

**When to use**

- EN: Typically for those already tolerating a lower retinol strength well.
- AR: عادة لمن يتحملون بالفعل تركيزًا أخف من الريتينول بشكل جيد.

**Warnings**

1. EN: Mild redness, peeling, and irritation are expected effects when using this product.
   AR: الاحمرار الخفيف والتقشر والتهيج آثار متوقعة عند استخدام هذا المنتج.

**Sun-sensitivity warning**

- EN: Use daily sun protection with SPF 30 or higher and limit sun exposure while using this product and for a week following discontinuation.
- AR: استخدموا واقي شمس يوميًا بعامل حماية SPF 30 أو أعلى، وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه.

**Pregnancy warning**

- EN: Do not use if pregnant, lactating, or planning to become pregnant.
- AR: لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل.

**Related products:** `retinol-complex-025`, `retinol-complex-05`, `dermal-repair-cream`

**Questions and answers (6)**

1. **Is this the strongest Retinol Complex?**
   Yes — 1.0 is the highest of the three strengths in this line.
   - سؤال: هل هذا أقوى تركيز من مركب الريتينول؟
   - جواب: نعم — تركيز 1.0 هو الأعلى بين التركيزات الثلاثة في هذا الخط.
2. **Should I start here if I'm new to retinol?**
   Typically not — this strength is intended for skin already tolerating a lower strength well. Ask your provider.
   - سؤال: هل أبدأ بهذا التركيز إذا كنت جديدًا على الريتينول؟
   - جواب: عادة لا — هذا التركيز مخصص لبشرة تتحمل بالفعل تركيزًا أخف بشكل جيد. يُرجى استشارة مقدم الرعاية.
3. **Can I use this if pregnant or breastfeeding?**
   No — do not use if pregnant, lactating, or planning to become pregnant.
   - سؤال: هل يمكن استخدامه أثناء الحمل أو الرضاعة؟
   - جواب: لا — لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل.
4. **Do I need sunscreen while using this?**
   Yes — SPF 30 or higher daily, with limited sun exposure, during use and for a week after stopping.
   - سؤال: هل أحتاج واقي شمس أثناء استخدامه؟
   - جواب: نعم — عامل حماية SPF 30 أو أعلى يوميًا، مع تقليل التعرض للشمس، أثناء الاستخدام ولمدة أسبوع بعد التوقف.
5. **Is redness normal?**
   Mild redness, peeling, and irritation are expected effects.
   - سؤال: هل الاحمرار أمر طبيعي؟
   - جواب: الاحمرار الخفيف والتقشر والتهيج آثار متوقعة.
6. **How do I confirm price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/correction/20086711.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 9. Lytera® 2.0 Pigment Brightening Serum

- **Arabic name:** سيروم لايتيرا® 2.0 لتفتيح التصبغات
- **id:** `lytera-2-pigment-brightening-serum`
- **Retired URLs:** `/en/shop/lytera-2-pigment-brightening-serum` · `/ar/المتجر/سيروم-لايتيرا-٢-لتفتيح-التصبغات`
- **Price:** $170.00 CAD
- **Size:** 60 ml
- **Categories:** serums
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: An evening serum formulated to address the appearance of stubborn skin discoloration.
- AR: سيروم مسائي مصمم لمعالجة مظهر تصبغات البشرة العنيدة.

**What it is**

- EN: A pigment-brightening serum.
- AR: سيروم لتفتيح التصبغات.

**Product type**

- EN: Pigment-brightening serum
- AR: سيروم لتفتيح التصبغات

**Where it sits in a routine**

- EN: In the evening, as a treatment step.
- AR: مساءً، كخطوة علاجية.


**How to use**

- EN: Apply a single pump to the face and neck each evening.
- AR: ضعوا ضغطة واحدة على الوجه والرقبة كل مساء.


**Sun-sensitivity warning**

- EN: As with other pigment-focused treatments, daily sun protection is important while addressing discoloration — confirm specific guidance with your provider.
- AR: كما هو الحال مع العلاجات الأخرى الموجهة للتصبغات، تُعد الحماية اليومية من الشمس مهمة أثناء معالجة التصبغ — يُرجى تأكيد الإرشادات المحددة مع مقدم الرعاية.

**Name mapping note**

- EN: Current official product listings sometimes name this "Lytera 2.0 Pigment Correcting Serum"; the approved catalogue's "Pigment Brightening Serum" naming is preserved as the published name.
- AR: تُدرج بعض المصادر الرسمية الحالية هذا المنتج باسم "Lytera 2.0 Pigment Correcting Serum"؛ وقد تم اعتماد تسمية "Pigment Brightening Serum" من القائمة المعتمدة كاسم منشور.

**Related products:** `retinol-complex-025`, `daily-physical-defense-spf-34`

**Questions and answers (6)**

1. **When do I use this serum?**
   In the evening, one pump applied to the face and neck.
   - سؤال: متى أستخدم هذا السيروم؟
   - جواب: مساءً، ضغطة واحدة تُطبَّق على الوجه والرقبة.
2. **What is this formulated to address?**
   The appearance of stubborn skin discoloration, per manufacturer information.
   - سؤال: لماذا صُمم هذا السيروم؟
   - جواب: مظهر تصبغات البشرة العنيدة، وفق معلومات الشركة المصنّعة.
3. **Do I need sunscreen while using this?**
   Daily sun protection is generally important with pigment-focused treatments — confirm specific guidance with your provider.
   - سؤال: هل أحتاج واقي شمس أثناء استخدامه؟
   - جواب: الحماية اليومية من الشمس مهمة بشكل عام مع علاجات التصبغ — يُرجى تأكيد الإرشادات مع مقدم الرعاية.
4. **Is this the same as "Lytera 2.0 Pigment Correcting Serum"?**
   Some current listings use "Correcting" rather than "Brightening" in the name — same underlying product line; the approved catalogue name is used here.
   - سؤال: هل هذا هو نفسه "Lytera 2.0 Pigment Correcting Serum"؟
   - جواب: تستخدم بعض القوائم الحالية كلمة "Correcting" بدل "Brightening" في الاسم — لكنه خط المنتج نفسه؛ ويُستخدم هنا الاسم المعتمد في القائمة.
5. **What size is this?**
   60 ml.
   - سؤال: ما الحجم؟
   - جواب: 60 مل.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/ — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 10. AHA/BHA Cream

- **Arabic name:** كريم AHA/BHA
- **id:** `aha-bha-cream`
- **Retired URLs:** `/en/shop/aha-bha-cream` · `/ar/المتجر/كريم-aha-bha`
- **Price:** $46.00 CAD
- **Size:** 56.7 g
- **Categories:** treatment-systems
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A leave-on AHA/BHA exfoliating cream, distinct from the AHA/BHA Exfoliating Cleanser, which is rinsed off.
- AR: كريم مقشر بأحماض AHA/BHA يُترك على البشرة، ويختلف عن غسول AHA/BHA المقشر الذي يُشطف.

**What it is**

- EN: An acid-based exfoliating treatment cream, sometimes listed by the manufacturer as "AHA/BHA Exfoliating Cream."
- AR: كريم علاجي مقشر يعتمد على الأحماض، وتُدرجه الشركة المصنّعة أحيانًا باسم "AHA/BHA Exfoliating Cream".

**Product type**

- EN: AHA/BHA exfoliating cream
- AR: كريم مقشر بأحماض AHA/BHA

**Where it sits in a routine**

- EN: As a leave-on treatment step, per your provider's guidance.
- AR: كخطوة علاجية تُترك على البشرة، وفق إرشادات مقدم الرعاية.


**How to use**

- EN: Apply as directed by your provider; avoid the eye area, and rinse thoroughly with water if contact occurs.
- AR: يُطبَّق وفق إرشادات مقدم الرعاية؛ يُتجنَّب منطقة العين، ويُشطف جيدًا بالماء في حال الملامسة.


**Sun-sensitivity warning**

- EN: Contains an alpha-hydroxy acid (AHA), which may increase skin's sensitivity to sunburn. Use sunscreen, wear protective clothing, and limit sun exposure while using this product and for a week following discontinuation.
- AR: يحتوي على حمض ألفا هيدروكسي (AHA)، ما قد يزيد من حساسية البشرة لحروق الشمس. استخدموا واقي الشمس، وارتدوا ملابس واقية، وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه.

**Related products:** `aha-bha-exfoliating-cleanser`, `retinol-complex-025`

**Questions and answers (6)**

1. **Is this the same as the AHA/BHA Exfoliating Cleanser?**
   No — the cleanser is rinsed off; this cream is a leave-on treatment.
   - سؤال: هل هذا هو نفسه غسول AHA/BHA المقشر؟
   - جواب: لا — الغسول يُشطف، بينما هذا الكريم علاج يُترك على البشرة.
2. **Does this increase sun sensitivity?**
   Yes — it contains an AHA. Use sunscreen, protective clothing, and limit sun exposure during use and for a week after stopping.
   - سؤال: هل يزيد هذا المنتج من حساسية الشمس؟
   - جواب: نعم — يحتوي على حمض AHA. استخدموا واقي الشمس والملابس الواقية، وقلّلوا التعرض للشمس أثناء الاستخدام ولمدة أسبوع بعد التوقف.
3. **What if it gets in my eyes?**
   Rinse thoroughly with water.
   - سؤال: ماذا لو دخل في عينيّ؟
   - جواب: اشطفوا جيدًا بالماء.
4. **What size is this?**
   56.7 g.
   - سؤال: ما الحجم؟
   - جواب: 56.7 غرام.
5. **How do I know how often to use it?**
   Ask your provider — leave-on acid treatments are typically introduced gradually.
   - سؤال: كيف أعرف عدد مرات الاستخدام؟
   - جواب: يُرجى سؤال مقدم الرعاية — إذ تُدخَل العلاجات الحمضية التي تُترك على البشرة عادة بشكل تدريجي.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/brighteners/20086693.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 11. Daily Physical Defense® SPF 34

- **Arabic name:** واقي الشمس اليومي® SPF 34
- **id:** `daily-physical-defense-spf-34`
- **Retired URLs:** `/en/shop/daily-physical-defense-spf-34` · `/ar/المتجر/واقي-الشمس-اليومي-spf-34`
- **Price:** $51.00 CAD
- **Size:** 85 ml
- **Categories:** sunscreen
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: An oil-free, fragrance-free dual-mineral sunscreen providing broad-spectrum UVA/UVB protection.
- AR: واقي شمس معدني مزدوج، خالٍ من الزيوت والعطور، يوفر حماية واسعة الطيف من أشعة UVA/UVB.

**What it is**

- EN: A daily mineral (physical) sunscreen with active ingredients Titanium Dioxide 5.0% and Zinc Oxide 6.0%, per manufacturer information.
- AR: واقي شمس معدني (فيزيائي) للاستخدام اليومي، بمكونين فعالين هما ثاني أكسيد التيتانيوم 5.0% وأكسيد الزنك 6.0%، وفق معلومات الشركة المصنّعة.

**Product type**

- EN: Broad-spectrum mineral sunscreen, SPF 34
- AR: واقي شمس معدني واسع الطيف، SPF 34

**Where it sits in a routine**

- EN: The last step of a morning routine.
- AR: الخطوة الأخيرة في الروتين الصباحي.

**Key characteristics**

1. EN: Oil-free and fragrance-free, per manufacturer information
   AR: خالٍ من الزيوت والعطور، وفق معلومات الشركة المصنّعة
2. EN: Contains caffeine and green tea antioxidant, per manufacturer information
   AR: يحتوي على الكافيين ومضاد أكسدة الشاي الأخضر، وفق معلومات الشركة المصنّعة

**How to use**

- EN: Dispense onto the back of the hand and apply generously to the face and other sun-exposed areas (neck and chest if desired).
- AR: ضعوا الكمية على ظهر اليد وطبّقوها بسخاء على الوجه والمناطق المعرضة للشمس (والرقبة والصدر إذا رغبتم).

**When to use**

- EN: Apply in the morning as the last step of your routine, or as needed; reapply at least every 2 hours if in direct sunlight.
- AR: يُطبَّق صباحًا كخطوة أخيرة في الروتين، أو حسب الحاجة؛ ويُعاد التطبيق كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس.


**Related products:** `total-defence-repair-spf-34-tinted`, `total-defence-repair-spf-34-clear`, `vitamin-c-e-complex`

**Questions and answers (6)**

1. **Is this a chemical or mineral sunscreen?**
   Mineral (physical) — with Titanium Dioxide and Zinc Oxide as the active ingredients, per manufacturer information.
   - سؤال: هل هو واقي شمس كيميائي أم معدني؟
   - جواب: معدني (فيزيائي) — بمكونين فعالين هما ثاني أكسيد التيتانيوم وأكسيد الزنك، وفق معلومات الشركة المصنّعة.
2. **How often do I reapply?**
   At least every 2 hours if in direct sunlight.
   - سؤال: كم مرة أعيد التطبيق؟
   - جواب: كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس.
3. **Is it fragrance-free?**
   Yes, per manufacturer information.
   - سؤال: هل هو خالٍ من العطور؟
   - جواب: نعم، وفق معلومات الشركة المصنّعة.
4. **Where do I apply it?**
   Face and other sun-exposed areas, with neck and chest if desired.
   - سؤال: أين أضعه؟
   - جواب: الوجه والمناطق المعرضة للشمس، مع الرقبة والصدر إذا رغبتم.
5. **How is this different from Total Defence + Repair?**
   Both are SPF 34 sunscreens from the same catalogue; ask the clinic which suits your routine and skin type.
   - سؤال: كيف يختلف عن Total Defence + Repair؟
   - جواب: كلاهما واقيا شمس بعامل SPF 34 من القائمة نفسها؛ يُرجى سؤال العيادة عن الأنسب لروتينكم ونوع بشرتكم.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://dermshop.ca/products/skinmedica-daily-physical-defense%C2%AE-broad-spectrum-spf-34 — Dermshop.ca — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)

---

### 12. Total Defense + Repair SPF 34 (Tinted)

- **Arabic name:** واقي الشمس الشامل + الإصلاح SPF 34 (ملون)
- **id:** `total-defence-repair-spf-34-tinted`
- **Retired URLs:** `/en/shop/total-defence-repair-spf-34-tinted` · `/ar/المتجر/واقي-الشمس-الشامل-والإصلاح-spf-34-ملون`
- **Price:** $75.00 CAD
- **Size:** 65 g
- **Categories:** sunscreen
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A broad-spectrum SPF 34 sunscreen with sheer tinted coverage, for daily use.
- AR: واقي شمس واسع الطيف بعامل SPF 34 مع تغطية لونية خفيفة، للاستخدام اليومي.

**What it is**

- EN: A tinted broad-spectrum sunscreen.
- AR: واقي شمس ملون واسع الطيف.

**Product type**

- EN: Broad-spectrum sunscreen, SPF 34, tinted
- AR: واقي شمس واسع الطيف، SPF 34، ملون

**Where it sits in a routine**

- EN: The last step of a morning routine.
- AR: الخطوة الأخيرة في الروتين الصباحي.


**How to use**

- EN: Apply generously to face and other sun-exposed areas as the last step of your morning routine; reapply at least every 2 hours if in direct sunlight.
- AR: طبّقوه بسخاء على الوجه والمناطق المعرضة للشمس كخطوة أخيرة في الروتين الصباحي؛ ويُعاد التطبيق كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس.


**Name mapping note**

- EN: The approved catalogue used the British/Canadian spelling "Defence"; the manufacturer's own current naming (confirmed on the official skinmedica.ca product URL and multiple Canadian retailers) uses "Defense." The current official name is used here; the approved price and size are unchanged.
- AR: استخدمت القائمة المعتمدة الإملاء البريطاني/الكندي "Defence"؛ بينما تستخدم الشركة المصنّعة حاليًا تسمية "Defense" (تم التأكد من ذلك عبر رابط المنتج الرسمي على skinmedica.ca وعدة متاجر كندية معتمدة). يُستخدم هنا الاسم الرسمي الحالي، مع الحفاظ على السعر والحجم المعتمدين دون تغيير.

**Related products:** `total-defence-repair-spf-34-clear`, `daily-physical-defense-spf-34`

**Questions and answers (6)**

1. **Is this tinted or clear?**
   Tinted — with sheer coverage. A clear version is also available as a separate product.
   - سؤال: هل هو ملون أم شفاف؟
   - جواب: ملون — بتغطية خفيفة. يتوفر أيضًا إصدار شفاف كمنتج منفصل.
2. **Why does the product name say "Defense" instead of "Defence"?**
   "Defense" is the manufacturer's current official spelling, confirmed on the official product URL and Canadian retailers — the approved price and size are unchanged.
   - سؤال: لماذا يُكتب اسم المنتج "Defense" بدلًا من "Defence"؟
   - جواب: "Defense" هو الإملاء الرسمي الحالي للشركة المصنّعة، وتم التأكد منه عبر رابط المنتج الرسمي والمتاجر الكندية — مع بقاء السعر والحجم المعتمدين دون تغيير.
3. **How often do I reapply?**
   At least every 2 hours if in direct sunlight.
   - سؤال: كم مرة أعيد التطبيق؟
   - جواب: كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس.
4. **What SPF does this provide?**
   SPF 34, broad spectrum.
   - سؤال: ما درجة الحماية SPF التي يوفرها؟
   - جواب: SPF 34، حماية واسعة الطيف.
5. **What size is this?**
   65 g.
   - سؤال: ما الحجم؟
   - جواب: 65 غرام.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://dermshop.ca/products/skinmedica-total-defense-repair-spf-34 — Dermshop.ca — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)
- https://www.skinmedica.ca/products/protect/totaldefenserepairspf34tinted — SkinMedica official Canadian site (skinmedica.ca) — URL confirmed via search result title; direct fetch was blocked by the site's own access controls (retrieved 2026-08-22)

---

### 13. Total Defense + Repair SPF 34 (Clear)

- **Arabic name:** واقي الشمس الشامل + الإصلاح SPF 34 (شفاف)
- **id:** `total-defence-repair-spf-34-clear`
- **Retired URLs:** `/en/shop/total-defence-repair-spf-34-clear` · `/ar/المتجر/واقي-الشمس-الشامل-والإصلاح-spf-34-شفاف`
- **Price:** $75.00 CAD
- **Size:** 65 g
- **Categories:** sunscreen
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A broad-spectrum SPF 34 sunscreen in a clear, untinted formula, for daily use.
- AR: واقي شمس واسع الطيف بعامل SPF 34 بتركيبة شفافة دون لون، للاستخدام اليومي.

**What it is**

- EN: A clear broad-spectrum sunscreen.
- AR: واقي شمس شفاف واسع الطيف.

**Product type**

- EN: Broad-spectrum sunscreen, SPF 34, untinted
- AR: واقي شمس واسع الطيف، SPF 34، دون لون

**Where it sits in a routine**

- EN: The last step of a morning routine.
- AR: الخطوة الأخيرة في الروتين الصباحي.


**How to use**

- EN: Apply generously to face and other sun-exposed areas as the last step of your morning routine; reapply at least every 2 hours if in direct sunlight.
- AR: طبّقوه بسخاء على الوجه والمناطق المعرضة للشمس كخطوة أخيرة في الروتين الصباحي؛ ويُعاد التطبيق كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس.


**Name mapping note**

- EN: The approved catalogue used the British/Canadian spelling "Defence"; the manufacturer's own current naming uses "Defense." The current official name is used here; the approved price and size are unchanged.
- AR: استخدمت القائمة المعتمدة الإملاء البريطاني/الكندي "Defence"؛ بينما تستخدم الشركة المصنّعة حاليًا تسمية "Defense". يُستخدم هنا الاسم الرسمي الحالي، مع الحفاظ على السعر والحجم المعتمدين دون تغيير.

**Related products:** `total-defence-repair-spf-34-tinted`, `daily-physical-defense-spf-34`

**Questions and answers (6)**

1. **Is this tinted?**
   No — this is the clear, untinted version. A tinted version is also available as a separate product.
   - سؤال: هل هو ملون؟
   - جواب: لا — هذا هو الإصدار الشفاف دون لون. يتوفر أيضًا إصدار ملون كمنتج منفصل.
2. **How does this differ from Daily Physical Defense?**
   Both are SPF sunscreens in this catalogue; ask the clinic which formula and finish suits your routine.
   - سؤال: كيف يختلف عن Daily Physical Defense؟
   - جواب: كلاهما واقيا شمس بعامل SPF ضمن هذه القائمة؛ يُرجى سؤال العيادة عن التركيبة والملمس الأنسب لروتينكم.
3. **How often do I reapply?**
   At least every 2 hours if in direct sunlight.
   - سؤال: كم مرة أعيد التطبيق؟
   - جواب: كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس.
4. **What SPF does this provide?**
   SPF 34, broad spectrum.
   - سؤال: ما درجة الحماية SPF التي يوفرها؟
   - جواب: SPF 34، حماية واسعة الطيف.
5. **What size is this?**
   65 g.
   - سؤال: ما الحجم؟
   - جواب: 65 غرام.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://dermshop.ca/products/skinmedica-total-defense-repair-spf-34 — Dermshop.ca — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)

---

### 14. Dermal Repair Cream

- **Arabic name:** كريم إصلاح البشرة
- **id:** `dermal-repair-cream`
- **Retired URLs:** `/en/shop/dermal-repair-cream` · `/ar/المتجر/كريم-إصلاح-البشرة`
- **Price:** $136.00 CAD
- **Size:** 48 g
- **Categories:** moisturizers
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: An ultra-rich facial cream intended to intensely hydrate and help replenish moisture, suited to normal-to-dry skin.
- AR: كريم وجه غني القوام مخصص للترطيب المكثف والمساعدة في استعادة رطوبة البشرة، ويناسب البشرة العادية إلى الجافة.

**What it is**

- EN: A rich moisturizing cream with antioxidant vitamins C and E and sodium hyaluronate, per manufacturer information.
- AR: كريم مرطب غني بفيتاميني C وE المضادين للأكسدة وهيالورونات الصوديوم، وفق معلومات الشركة المصنّعة.

**Product type**

- EN: Rich moisturizing cream
- AR: كريم مرطب غني القوام

**Where it sits in a routine**

- EN: As the moisturizing step of a routine, appropriate for normal-to-dry skin.
- AR: كخطوة الترطيب في الروتين، ويناسب البشرة العادية إلى الجافة.

**Key characteristics**

1. EN: Contains Tetrahexyldecyl Ascorbate and Tocopheryl Acetate (antioxidant vitamin C and E forms) and Sodium Hyaluronate, per manufacturer information
   AR: يحتوي على Tetrahexyldecyl Ascorbate وTocopheryl Acetate (أشكال مضادة للأكسدة من فيتاميني C وE) وهيالورونات الصوديوم، وفق معلومات الشركة المصنّعة
2. EN: Formulated for normal-to-dry skin
   AR: مصمم للبشرة العادية إلى الجافة

**How to use**

- EN: Apply to face (and neck if desired) as the moisturizing step of your routine.
- AR: يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم.


**Related products:** `retinol-complex-025`, `tns-ceramide-treatment-cream`

**Questions and answers (6)**

1. **What skin type is this formulated for?**
   Normal-to-dry skin, per manufacturer information.
   - سؤال: لأي نوع بشرة صُمم هذا الكريم؟
   - جواب: البشرة العادية إلى الجافة، وفق معلومات الشركة المصنّعة.
2. **What does it contain?**
   Antioxidant vitamin C and E forms and sodium hyaluronate, per manufacturer information.
   - سؤال: ما مكوناته؟
   - جواب: أشكال مضادة للأكسدة من فيتاميني C وE، وهيالورونات الصوديوم، وفق معلومات الشركة المصنّعة.
3. **Does this contain ceramides?**
   The research for this record didn't confirm ceramides as a primary ingredient — TNS Ceramide Treatment Cream is SkinMedica's dedicated ceramide-focused product.
   - سؤال: هل يحتوي على السيراميد؟
   - جواب: لم يؤكد البحث الخاص بهذا السجل احتواءه على السيراميد كمكون أساسي — يُعد كريم TNS العلاجي بالسيراميد منتج سكين ميديكا المخصص للسيراميد.
4. **When do I apply this in my routine?**
   As the moisturizing step, typically after any treatment serums.
   - سؤال: متى أطبّق هذا الكريم ضمن روتيني؟
   - جواب: كخطوة الترطيب، عادة بعد أي سيروم علاجي.
5. **What size is this?**
   48 g.
   - سؤال: ما الحجم؟
   - جواب: 48 غرام.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/dry-skin/20086508.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 15. Rejuvenative Moisturizer

- **Arabic name:** مرطب منشط
- **id:** `rejuvenative-moisturizer`
- **Retired URLs:** `/en/shop/rejuvenative-moisturizer` · `/ar/المتجر/مرطب-منشط`
- **Price:** $62.00 CAD
- **Size:** 56.7 g
- **Categories:** moisturizers
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A moisturizing cream formulated to restore and maintain skin's natural moisture balance.
- AR: كريم مرطب مصمم لاستعادة توازن رطوبة البشرة الطبيعي والحفاظ عليه.

**What it is**

- EN: A daily moisturizer.
- AR: مرطب للاستخدام اليومي.

**Product type**

- EN: Moisturizing cream
- AR: كريم مرطب

**Where it sits in a routine**

- EN: As the moisturizing step of a routine.
- AR: كخطوة الترطيب في الروتين.


**How to use**

- EN: Apply to face (and neck if desired) as the moisturizing step of your routine.
- AR: يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم.


**Related products:** `ultra-sheer-moisturizer`, `replenish-hydrating-cream`

**Questions and answers (6)**

1. **What does this moisturizer do?**
   It's formulated to help restore and maintain the skin's natural moisture balance, per manufacturer information.
   - سؤال: ماذا يفعل هذا المرطب؟
   - جواب: صُمم للمساعدة في استعادة توازن رطوبة البشرة الطبيعي والحفاظ عليه، وفق معلومات الشركة المصنّعة.
2. **When do I apply it?**
   As the moisturizing step of your routine, morning and/or evening.
   - سؤال: متى أطبّقه؟
   - جواب: كخطوة الترطيب في روتينكم، صباحًا و/أو مساءً.
3. **How is this different from Ultra Sheer Moisturizer?**
   Both are moisturizers in this catalogue with different formulations — ask the clinic which suits your skin type.
   - سؤال: كيف يختلف عن مرطب Ultra Sheer؟
   - جواب: كلاهما مرطبان ضمن هذه القائمة بتركيبتين مختلفتين — يُرجى سؤال العيادة عن الأنسب لنوع بشرتكم.
4. **What size is this?**
   56.7 g.
   - سؤال: ما الحجم؟
   - جواب: 56.7 غرام.
5. **Is this suitable for all skin types?**
   Not confirmed by the research for this specific record — ask the clinic about suitability for your skin.
   - سؤال: هل يناسب جميع أنواع البشرة؟
   - جواب: لم يتأكد ذلك من خلال البحث الخاص بهذا السجل — يُرجى سؤال العيادة عن مدى ملاءمته لبشرتكم.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/moisturizers/ — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 16. Replenish Hydrating Cream

- **Arabic name:** كريم ترطيب مجدد
- **id:** `replenish-hydrating-cream`
- **Retired URLs:** `/en/shop/replenish-hydrating-cream` · `/ar/المتجر/كريم-ترطيب-مجدد`
- **Price:** $70.00 CAD
- **Size:** 56.7 g
- **Categories:** moisturizers
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A hydrating cream formulated to restore moisture levels for smoother, softer, more balanced-feeling skin.
- AR: كريم ترطيب مصمم لاستعادة مستويات الرطوبة لبشرة أكثر نعومة وتوازنًا.

**What it is**

- EN: A daily hydrating moisturizer.
- AR: مرطب ترطيبي للاستخدام اليومي.

**Product type**

- EN: Hydrating cream
- AR: كريم ترطيب

**Where it sits in a routine**

- EN: As the moisturizing step of a routine.
- AR: كخطوة الترطيب في الروتين.

**Key characteristics**

1. EN: Contains chamomile-derived bisabolol, green tea antioxidant, vitamin C, and glycerin, per manufacturer information
   AR: يحتوي على مادة bisabolol المستخلصة من البابونج، ومضاد أكسدة الشاي الأخضر، وفيتامين C، والجليسرين، وفق معلومات الشركة المصنّعة

**How to use**

- EN: Apply to face (and neck if desired) as the moisturizing step of your routine.
- AR: يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم.


**Related products:** `rejuvenative-moisturizer`, `dermal-repair-cream`

**Questions and answers (6)**

1. **What ingredients help calm the skin?**
   Chamomile-derived bisabolol, per manufacturer information.
   - سؤال: ما المكونات التي تساعد على تهدئة البشرة؟
   - جواب: مادة bisabolol المستخلصة من البابونج، وفق معلومات الشركة المصنّعة.
2. **Does this brighten skin tone?**
   It contains vitamin C, which the manufacturer describes as helping restore radiance.
   - سؤال: هل يعمل على تفتيح لون البشرة؟
   - جواب: يحتوي على فيتامين C، الذي تصفه الشركة المصنّعة بأنه يساعد على استعادة النضارة.
3. **When do I apply it?**
   As the moisturizing step of your routine.
   - سؤال: متى أطبّقه؟
   - جواب: كخطوة الترطيب في روتينكم.
4. **What size is this?**
   56.7 g.
   - سؤال: ما الحجم؟
   - جواب: 56.7 غرام.
5. **Is this suited to sensitive skin?**
   The manufacturer describes it as nourishing and soothing; confirm suitability for sensitive skin with the clinic.
   - سؤال: هل يناسب البشرة الحساسة؟
   - جواب: تصفه الشركة المصنّعة بأنه مغذٍ ومهدئ؛ يُرجى تأكيد ملاءمته للبشرة الحساسة مع العيادة.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.dermstore.com/p/skinmedica-replenish-hydrating-cream/11289675/ — Dermstore — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)

---

### 17. TNS Ceramide Treatment Cream®

- **Arabic name:** كريم TNS العلاجي بالسيراميد®
- **id:** `tns-ceramide-treatment-cream`
- **Retired URLs:** `/en/shop/tns-ceramide-treatment-cream` · `/ar/المتجر/كريم-tns-العلاجي-بالسيراميد`
- **Price:** $72.00 CAD
- **Size:** 56.7 g
- **Categories:** moisturizers
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A moisture cream formulated to help heal, mend, and soothe severely dry, damaged, or compromised skin.
- AR: كريم ترطيب مصمم للمساعدة في شفاء وإصلاح وتهدئة البشرة الجافة جدًا أو التالفة أو المتضررة.

**What it is**

- EN: A barrier-repair cream combining SkinMedica's TNS® technology, peptides, and a patented ceramide complex, per manufacturer information.
- AR: كريم لإصلاح حاجز البشرة يجمع بين تقنية TNS® من سكين ميديكا، والببتيدات، ومركب سيراميد مسجل براءة اختراع، وفق معلومات الشركة المصنّعة.

**Product type**

- EN: Ceramide barrier-repair cream
- AR: كريم لإصلاح حاجز البشرة بالسيراميد

**Where it sits in a routine**

- EN: As the moisturizing step, particularly for very dry or compromised skin.
- AR: كخطوة الترطيب، خصوصًا للبشرة الجافة جدًا أو المتضررة.


**How to use**

- EN: Apply to face (and neck if desired) as the moisturizing step of your routine.
- AR: يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم.


**Related products:** `dermal-repair-cream`, `replenish-hydrating-cream`

**Questions and answers (6)**

1. **Who is this cream formulated for?**
   Skin that is severely dry, damaged, or compromised, per manufacturer information.
   - سؤال: لمن صُمم هذا الكريم؟
   - جواب: البشرة الجافة جدًا أو التالفة أو المتضررة، وفق معلومات الشركة المصنّعة.
2. **What technology does it use?**
   SkinMedica's TNS® technology, peptides, and a patented ceramide complex, per manufacturer information.
   - سؤال: ما التقنية التي يستخدمها؟
   - جواب: تقنية TNS® من سكين ميديكا، والببتيدات، ومركب سيراميد مسجل براءة اختراع، وفق معلومات الشركة المصنّعة.
3. **How is this different from Dermal Repair Cream?**
   Both are rich moisturizers; this one is specifically ceramide-focused for barrier repair — ask the clinic which suits your skin.
   - سؤال: كيف يختلف عن كريم إصلاح البشرة؟
   - جواب: كلاهما مرطبان غنيان؛ إلا أن هذا الكريم مخصص للسيراميد لإصلاح حاجز البشرة — يُرجى سؤال العيادة عن الأنسب لبشرتكم.
4. **When do I apply it?**
   As the moisturizing step of your routine.
   - سؤال: متى أطبّقه؟
   - جواب: كخطوة الترطيب في روتينكم.
5. **What size is this?**
   56.7 g.
   - سؤال: ما الحجم؟
   - جواب: 56.7 غرام.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.dermstore.com/p/skinmedica-tns-ceramide-treatment-cream/11289681/ — Dermstore — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)

---

### 18. Ultra Sheer Moisturizer

- **Arabic name:** مرطب خفيف فائق
- **id:** `ultra-sheer-moisturizer`
- **Retired URLs:** `/en/shop/ultra-sheer-moisturizer` · `/ar/المتجر/مرطب-خفيف-فائق`
- **Price:** $62.00 CAD
- **Size:** 56.7 g
- **Categories:** moisturizers
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A lightweight, oil-free moisturizer enriched with vitamins C and E.
- AR: مرطب خفيف القوام وخالٍ من الزيوت، مدعّم بفيتاميني C وE.

**What it is**

- EN: A daily lightweight moisturizer.
- AR: مرطب خفيف للاستخدام اليومي.

**Product type**

- EN: Lightweight, oil-free moisturizer
- AR: مرطب خفيف وخالٍ من الزيوت

**Where it sits in a routine**

- EN: As the moisturizing step of a routine, for those who prefer a lighter finish.
- AR: كخطوة الترطيب في الروتين، لمن يفضلون ملمسًا أخف.

**Key characteristics**

1. EN: Oil-free formula, per manufacturer information
   AR: تركيبة خالية من الزيوت، وفق معلومات الشركة المصنّعة
2. EN: Contains vitamins C and E, per manufacturer information
   AR: تحتوي على فيتاميني C وE، وفق معلومات الشركة المصنّعة

**How to use**

- EN: Apply to face (and neck if desired) as the moisturizing step of your routine.
- AR: يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم.


**Related products:** `rejuvenative-moisturizer`, `vitamin-c-e-complex`

**Questions and answers (6)**

1. **Is this oil-free?**
   Yes, per manufacturer information.
   - سؤال: هل هو خالٍ من الزيوت؟
   - جواب: نعم، وفق معلومات الشركة المصنّعة.
2. **How is this different from Rejuvenative Moisturizer?**
   Both are moisturizers in this catalogue; this one is positioned as a lighter, sheer finish — ask the clinic which suits your skin type.
   - سؤال: كيف يختلف عن مرطب Rejuvenative؟
   - جواب: كلاهما مرطبان ضمن هذه القائمة؛ إلا أن هذا المرطب أخف وأكثر شفافية في الملمس — يُرجى سؤال العيادة عن الأنسب لنوع بشرتكم.
3. **What vitamins does it contain?**
   Vitamins C and E, per manufacturer information.
   - سؤال: ما الفيتامينات التي يحتوي عليها؟
   - جواب: فيتامينا C وE، وفق معلومات الشركة المصنّعة.
4. **When do I apply it?**
   As the moisturizing step of your routine.
   - سؤال: متى أطبّقه؟
   - جواب: كخطوة الترطيب في روتينكم.
5. **What size is this?**
   56.7 g.
   - سؤال: ما الحجم؟
   - جواب: 56.7 غرام.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/moisturizers/20087354.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 19. Scar Recovery Gel with Centelline® (Small)

- **Arabic name:** جل علاج الندبات بالسنتيلين® (صغير)
- **id:** `scar-recovery-gel-small`
- **Retired URLs:** `/en/shop/scar-recovery-gel-with-centelline-small` · `/ar/المتجر/جل-علاج-الندبات-بالسنتيلين-صغير`
- **Price:** $46.00 CAD
- **Size:** 14.2 g
- **Categories:** scar-care
- **Size variant of:** `scar-recovery-gel-large`
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A lightweight gel formulated to help minimize the appearance of scars, in the smaller of two approved sizes.
- AR: جل خفيف القوام مصمم للمساعدة في تقليل مظهر الندبات، بالحجم الأصغر من حجمين معتمدين.

**What it is**

- EN: A scar-appearance gel built around Centelline®, a complex of Centella asiatica, Bulbine frutescens, and Oleuropein, per manufacturer information.
- AR: جل لمظهر الندبات يعتمد على مركب Centelline®، وهو مزيج من نبات Centella asiatica وBulbine frutescens وOleuropein، وفق معلومات الشركة المصنّعة.

**Product type**

- EN: Scar-appearance gel
- AR: جل لمظهر الندبات

**Where it sits in a routine**

- EN: Applied directly to a healed scar area, not as part of a general facial routine.
- AR: يُطبَّق مباشرة على منطقة الندبة الملتئمة، وليس كجزء من الروتين العام للوجه.


**How to use**

- EN: Apply morning and evening after the wound has healed, directly to scars, on smaller incisions and everyday cuts. Continue use until the scar appears flat and without redness.
- AR: يُطبَّق صباحًا ومساءً بعد التئام الجرح، مباشرة على الندبات، على الشقوق الصغيرة والجروح اليومية. يُستمر الاستخدام حتى يصبح مظهر الندبة مسطحًا وخاليًا من الاحمرار.

**Warnings**

1. EN: This is a cosmetic gel, not a medical scar-removal treatment — individual outcomes vary and are never guaranteed.
   AR: هذا جل تجميلي وليس علاجًا طبيًا لإزالة الندبات — تختلف النتائج من شخص لآخر ولا تُضمن أبدًا.

**Related products:** `scar-recovery-gel-large`

**Questions and answers (6)**

1. **What is Centelline®?**
   A complex of Centella asiatica, Bulbine frutescens, and Oleuropein, formulated to help minimize the appearance of scars, per manufacturer information.
   - سؤال: ما هو Centelline®؟
   - جواب: مركب من نبات Centella asiatica وBulbine frutescens وOleuropein، مصمم للمساعدة في تقليل مظهر الندبات، وفق معلومات الشركة المصنّعة.
2. **When do I start using this?**
   After the wound has healed — not on an open wound.
   - سؤال: متى أبدأ باستخدام هذا الجل؟
   - جواب: بعد التئام الجرح — وليس على جرح مفتوح.
3. **Does this guarantee my scar will disappear?**
   No — results vary by individual, and this is a cosmetic gel, not a guaranteed medical treatment.
   - سؤال: هل يضمن هذا المنتج اختفاء الندبة؟
   - جواب: لا — تختلف النتائج من شخص لآخر، وهذا جل تجميلي وليس علاجًا طبيًا مضمونًا.
4. **What's the difference between this and the large size?**
   Same product, different size — 14.2 g here versus 56.7 g for the large size.
   - سؤال: ما الفرق بين هذا الحجم والحجم الكبير؟
   - جواب: المنتج نفسه بحجم مختلف — 14.2 غرام هنا مقابل 56.7 غرام للحجم الكبير.
5. **How long do I use it for?**
   Until the scar appears flat and without redness, per manufacturer guidance.
   - سؤال: كم من الوقت أستخدمه؟
   - جواب: حتى يصبح مظهر الندبة مسطحًا وخاليًا من الاحمرار، وفق إرشادات الشركة المصنّعة.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/products/correct/scarrecoverygelcentelline — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 20. Scar Recovery Gel with Centelline® (Large)

- **Arabic name:** جل علاج الندبات بالسنتيلين® (كبير)
- **id:** `scar-recovery-gel-large`
- **Retired URLs:** `/en/shop/scar-recovery-gel-with-centelline-large` · `/ar/المتجر/جل-علاج-الندبات-بالسنتيلين-كبير`
- **Price:** $108.00 CAD
- **Size:** 56.7 g
- **Categories:** scar-care
- **Size variant of:** `scar-recovery-gel-small`
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A lightweight gel formulated to help minimize the appearance of scars, in the larger of two approved sizes.
- AR: جل خفيف القوام مصمم للمساعدة في تقليل مظهر الندبات، بالحجم الأكبر من حجمين معتمدين.

**What it is**

- EN: A scar-appearance gel built around Centelline®, a complex of Centella asiatica, Bulbine frutescens, and Oleuropein, per manufacturer information.
- AR: جل لمظهر الندبات يعتمد على مركب Centelline®، وهو مزيج من نبات Centella asiatica وBulbine frutescens وOleuropein، وفق معلومات الشركة المصنّعة.

**Product type**

- EN: Scar-appearance gel
- AR: جل لمظهر الندبات

**Where it sits in a routine**

- EN: Applied directly to a healed scar area, not as part of a general facial routine.
- AR: يُطبَّق مباشرة على منطقة الندبة الملتئمة، وليس كجزء من الروتين العام للوجه.


**How to use**

- EN: Apply morning and evening after the wound has healed, directly to scars. Continue use until the scar appears flat and without redness.
- AR: يُطبَّق صباحًا ومساءً بعد التئام الجرح، مباشرة على الندبات. يُستمر الاستخدام حتى يصبح مظهر الندبة مسطحًا وخاليًا من الاحمرار.

**Warnings**

1. EN: This is a cosmetic gel, not a medical scar-removal treatment — individual outcomes vary and are never guaranteed.
   AR: هذا جل تجميلي وليس علاجًا طبيًا لإزالة الندبات — تختلف النتائج من شخص لآخر ولا تُضمن أبدًا.

**Related products:** `scar-recovery-gel-small`

**Questions and answers (6)**

1. **Why choose the large size?**
   For a larger scar area or more extended use — ask the clinic which size suits your situation.
   - سؤال: لماذا أختار الحجم الكبير؟
   - جواب: لمنطقة ندبة أكبر أو استخدام أطول — يُرجى سؤال العيادة عن الحجم الأنسب لحالتكم.
2. **When do I start using this?**
   After the wound has healed — not on an open wound.
   - سؤال: متى أبدأ باستخدام هذا الجل؟
   - جواب: بعد التئام الجرح — وليس على جرح مفتوح.
3. **Does this guarantee my scar will disappear?**
   No — results vary by individual, and this is a cosmetic gel, not a guaranteed medical treatment.
   - سؤال: هل يضمن هذا المنتج اختفاء الندبة؟
   - جواب: لا — تختلف النتائج من شخص لآخر، وهذا جل تجميلي وليس علاجًا طبيًا مضمونًا.
4. **What's the difference between this and the small size?**
   Same product, different size — 56.7 g here versus 14.2 g for the small size.
   - سؤال: ما الفرق بين هذا الحجم والحجم الصغير؟
   - جواب: المنتج نفسه بحجم مختلف — 56.7 غرام هنا مقابل 14.2 غرام للحجم الصغير.
5. **How long do I use it for?**
   Until the scar appears flat and without redness, per manufacturer guidance.
   - سؤال: كم من الوقت أستخدمه؟
   - جواب: حتى يصبح مظهر الندبة مسطحًا وخاليًا من الاحمرار، وفق إرشادات الشركة المصنّعة.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/products/correct/scarrecoverygelcentelline — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 21. TNS® Advanced+ Serum

- **Arabic name:** سيروم TNS® المتقدم+
- **id:** `tns-advanced-plus-serum`
- **Retired URLs:** `/en/shop/tns-advanced-plus-serum` · `/ar/المتجر/سيروم-tns-المتقدم-بلس`
- **Price:** $330.00 CAD
- **Size:** 28.4 g
- **Categories:** serums
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A serum built on SkinMedica's TNS® growth-factor technology, formulated to support collagen production and cellular activity.
- AR: سيروم يعتمد على تقنية TNS® لعوامل النمو من سكين ميديكا، ومصمم لدعم إنتاج الكولاجين والنشاط الخلوي.

**What it is**

- EN: A growth-factor serum. Per manufacturer information, it contains 450 total growth factors, described as more than any previous TNS formulation.
- AR: سيروم بعوامل النمو. وفق معلومات الشركة المصنّعة، يحتوي على 450 عامل نمو إجمالًا، وتصفه الشركة بأنه يفوق أي تركيبة سابقة من TNS.

**Product type**

- EN: Growth-factor serum
- AR: سيروم بعوامل النمو

**Where it sits in a routine**

- EN: Morning and evening, after cleansing and toning; if used with TNS Recovery Complex, apply Recovery Complex first, then this serum.
- AR: صباحًا ومساءً، بعد التنظيف والتونر؛ وعند استخدامه مع TNS Recovery Complex، يُطبَّق Recovery Complex أولًا ثم هذا السيروم.


**How to use**

- EN: Apply to the entire face (neck and chest if desired), morning and evening. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.
- AR: يُطبَّق على الوجه بالكامل (والرقبة والصدر إذا رغبتم)، صباحًا ومساءً. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء.


**Name mapping note**

- EN: The approved catalogue listed this as "TNS Advanced Plus Serum®." Current official and Canadian-retailer naming and trademark placement is "TNS® Advanced+ Serum" (confirmed on skinmedica.com and Dermstore.com) — used here; the approved price and size are unchanged.
- AR: أدرجت القائمة المعتمدة هذا المنتج باسم "TNS Advanced Plus Serum®". أما التسمية الرسمية الحالية وموضع العلامة التجارية المعتمدين لدى المتاجر الكندية فهما "TNS® Advanced+ Serum" (تم التأكد من ذلك عبر skinmedica.com وDermstore.com) — وقد اعتُمد هذا الشكل هنا، مع بقاء السعر والحجم المعتمدين دون تغيير.

**Related products:** `tns-recovery-complex`, `vitamin-c-e-complex`

**Questions and answers (6)**

1. **How many growth factors does this contain?**
   450 total growth factors, per manufacturer information — described as more than any previous TNS formulation.
   - سؤال: كم عامل نمو يحتوي هذا السيروم؟
   - جواب: 450 عامل نمو إجمالًا، وفق معلومات الشركة المصنّعة — وتصفه الشركة بأنه يفوق أي تركيبة سابقة من TNS.
2. **Why does the name differ slightly from the approved catalogue?**
   The approved catalogue listed "TNS Advanced Plus Serum®"; the current official naming/trademark styling is "TNS® Advanced+ Serum." The approved price and size are unchanged.
   - سؤال: لماذا يختلف الاسم قليلًا عن القائمة المعتمدة؟
   - جواب: أدرجت القائمة المعتمدة اسم "TNS Advanced Plus Serum®"؛ بينما التسمية الرسمية الحالية هي "TNS® Advanced+ Serum". مع بقاء السعر والحجم المعتمدين دون تغيير.
3. **Should I use this with TNS Recovery Complex?**
   If using both, apply TNS Recovery Complex first, then this serum, per manufacturer guidance.
   - سؤال: هل أستخدمه مع TNS Recovery Complex؟
   - جواب: عند استخدام كليهما، يُطبَّق TNS Recovery Complex أولًا، ثم هذا السيروم، وفق إرشادات الشركة المصنّعة.
4. **When do I apply this?**
   Morning and evening, after cleansing and toning.
   - سؤال: متى أطبّق هذا السيروم؟
   - جواب: صباحًا ومساءً، بعد التنظيف والتونر.
5. **What size is this?**
   28.4 g.
   - سؤال: ما الحجم؟
   - جواب: 28.4 غرام.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.dermstore.com/p/skinmedica-tns-advanced-serum-28.4g/12596429/ — Dermstore — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)
- https://www.skinmedica.com/us/skin-concern/fine-line-and-wrinkles/20086513.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 22. TNS Recovery Complex®

- **Arabic name:** مركب TNS للتعافي®
- **id:** `tns-recovery-complex`
- **Retired URLs:** `/en/shop/tns-recovery-complex` · `/ar/المتجر/مركب-tns-للتعافي`
- **Price:** $250.00 CAD
- **Size:** 28.4 g
- **Categories:** serums
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A concentrated growth-factor serum formulated to help reduce the appearance of fine lines and wrinkles while improving skin tone and texture.
- AR: سيروم مركّز بعوامل النمو مصمم للمساعدة في تقليل مظهر الخطوط الدقيقة والتجاعيد مع تحسين لون وملمس البشرة.

**What it is**

- EN: A growth-factor and exosome serum. Per manufacturer information, it contains over 1 trillion exosomes per bottle, described as the highest concentration of the brand's patented growth-factor blend.
- AR: سيروم بعوامل النمو والإكسوسومات. وفق معلومات الشركة المصنّعة، يحتوي على أكثر من تريليون إكسوسوم في كل زجاجة، وتصفه بأنه يحتوي على أعلى تركيز من مزيج عوامل النمو المسجل الخاص بالعلامة.

**Product type**

- EN: Growth-factor and exosome serum
- AR: سيروم بعوامل النمو والإكسوسومات

**Where it sits in a routine**

- EN: Morning and evening, after cleansing and toning; if used with TNS Advanced+ Serum, apply this first.
- AR: صباحًا ومساءً، بعد التنظيف والتونر؛ وعند استخدامه مع سيروم TNS المتقدم+، يُطبَّق هذا المنتج أولًا.


**How to use**

- EN: Apply to the entire face (neck and chest if desired), morning and evening. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.
- AR: يُطبَّق على الوجه بالكامل (والرقبة والصدر إذا رغبتم)، صباحًا ومساءً. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء.


**Related products:** `tns-advanced-plus-serum`, `vitamin-c-e-complex`

**Questions and answers (6)**

1. **What are exosomes?**
   The manufacturer describes this product as containing over 1 trillion exosomes per bottle as part of its growth-factor and protein blend.
   - سؤال: ما هي الإكسوسومات؟
   - جواب: تصف الشركة المصنّعة هذا المنتج بأنه يحتوي على أكثر من تريليون إكسوسوم في كل زجاجة ضمن مزيجه من عوامل النمو والبروتينات.
2. **Should this go before or after TNS Advanced+ Serum?**
   Before — apply TNS Recovery Complex first, then TNS Advanced+ Serum, per manufacturer guidance.
   - سؤال: هل يُستخدم قبل أم بعد سيروم TNS المتقدم+؟
   - جواب: قبل — يُطبَّق TNS Recovery Complex أولًا، ثم سيروم TNS المتقدم+، وفق إرشادات الشركة المصنّعة.
3. **When do I apply this?**
   Morning and evening, after cleansing and toning.
   - سؤال: متى أطبّق هذا السيروم؟
   - جواب: صباحًا ومساءً، بعد التنظيف والتونر.
4. **What is this formulated to help with?**
   The appearance of fine lines and wrinkles, and skin tone and texture, per manufacturer information.
   - سؤال: لماذا صُمم هذا السيروم؟
   - جواب: مظهر الخطوط الدقيقة والتجاعيد، ولون وملمس البشرة، وفق معلومات الشركة المصنّعة.
5. **What size is this?**
   28.4 g.
   - سؤال: ما الحجم؟
   - جواب: 28.4 غرام.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.skinmedica.com/us/product-category/correction/95863.html — SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source) (retrieved 2026-08-22)

---

### 23. HA5® Rejuvenating Hydrator

- **Arabic name:** مرطب HA5® المنشط
- **id:** `ha5-rejuvenative-hydrator`
- **Retired URLs:** `/en/shop/ha5-rejuvenative-hydrator` · `/ar/المتجر/مرطب-ha5-المنشط`
- **Price:** $196.00 CAD
- **Size:** 56.7 g
- **Categories:** moisturizers, serums
- **Approval status:** approved
- **Imagery:** no asset (status: pending)

**Overview**

- EN: A hydrating serum blending five forms of hyaluronic acid, for all skin types.
- AR: سيروم مرطب يجمع بين خمسة أشكال من حمض الهيالورونيك، لجميع أنواع البشرة.

**What it is**

- EN: A multi-molecular-weight hyaluronic acid serum with SkinMedica's VITISENSCE antioxidant technology, per manufacturer information.
- AR: سيروم بحمض الهيالورونيك متعدد الأوزان الجزيئية، مع تقنية VITISENSCE المضادة للأكسدة من سكين ميديكا، وفق معلومات الشركة المصنّعة.

**Product type**

- EN: Hyaluronic acid hydrating serum
- AR: سيروم مرطب بحمض الهيالورونيك

**Where it sits in a routine**

- EN: Twice daily; if used with other treatment products such as Lytera or a retinol product, apply this as the last step before moisturizer.
- AR: مرتين يوميًا؛ وعند استخدامه مع منتجات علاجية أخرى مثل Lytera أو منتج ريتينول، يُطبَّق كخطوة أخيرة قبل المرطب.

**Key characteristics**

1. EN: Blends five forms of hyaluronic acid, per manufacturer information
   AR: يجمع بين خمسة أشكال من حمض الهيالورونيك، وفق معلومات الشركة المصنّعة
2. EN: Formulated for all skin types
   AR: مصمم لجميع أنواع البشرة

**How to use**

- EN: Apply to face, neck, or décolleté twice daily.
- AR: يُطبَّق على الوجه والرقبة أو أعلى الصدر مرتين يوميًا.


**Name mapping note**

- EN: The approved catalogue listed this as "HA5 Rejuvenative Hydrator." Current official and Canadian-retailer naming (confirmed on multiple authorized retailers) is "HA5® Rejuvenating Hydrator" — used here; the approved price and size are unchanged.
- AR: أدرجت القائمة المعتمدة هذا المنتج باسم "HA5 Rejuvenative Hydrator". أما التسمية الرسمية الحالية لدى المتاجر الكندية المعتمدة (تم التأكد منها عبر عدة متاجر) فهي "HA5® Rejuvenating Hydrator" — وقد اعتُمد هذا الشكل هنا، مع بقاء السعر والحجم المعتمدين دون تغيير.

**Related products:** `lytera-2-pigment-brightening-serum`, `retinol-complex-025`

**Questions and answers (6)**

1. **Why does the name differ from the approved catalogue?**
   The approved catalogue listed "HA5 Rejuvenative Hydrator"; current official/retailer naming is "HA5® Rejuvenating Hydrator." The approved price and size are unchanged, and this is the same product.
   - سؤال: لماذا يختلف الاسم عن القائمة المعتمدة؟
   - جواب: أدرجت القائمة المعتمدة اسم "HA5 Rejuvenative Hydrator"؛ بينما التسمية الرسمية/التجارية الحالية هي "HA5® Rejuvenating Hydrator". مع بقاء السعر والحجم المعتمدين دون تغيير، وهو المنتج نفسه.
2. **How many types of hyaluronic acid does it contain?**
   Five forms, per manufacturer information.
   - سؤال: كم نوعًا من حمض الهيالورونيك يحتوي؟
   - جواب: خمسة أشكال، وفق معلومات الشركة المصنّعة.
3. **How often do I use it?**
   Twice daily.
   - سؤال: كم مرة أستخدمه؟
   - جواب: مرتين يوميًا.
4. **When do I apply it relative to other treatments?**
   If used with other treatment products, apply it as the last step before moisturizer.
   - سؤال: متى أطبّقه بالنسبة للعلاجات الأخرى؟
   - جواب: عند استخدامه مع منتجات علاجية أخرى، يُطبَّق كخطوة أخيرة قبل المرطب.
5. **What size is this?**
   56.7 g.
   - سؤال: ما الحجم؟
   - جواب: 56.7 غرام.
6. **How do I confirm current price and availability?**
   Contact Blue Diamond Medical Clinic directly.
   - سؤال: كيف أتحقق من السعر والتوفر الحاليين؟
   - جواب: تواصلوا مباشرة مع عيادة بلو دايموند الطبية.

**Sources**

- https://www.dermstore.com/p/skinmedica-ha5-rejuvenating-hydrator/11290631/ — Dermstore — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)
- https://dermshop.ca/collections/skinmedica — Dermshop.ca — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing (retrieved 2026-08-22)

---
