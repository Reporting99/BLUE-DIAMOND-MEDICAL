import { test, expect, type Page } from "@playwright/test";

/**
 * The sitewide visual system — heroes, card imagery, the branded fallback,
 * Before/After, scroll reveal, and the two pieces of blue scroll chrome.
 *
 * WHY THIS FILE EXISTS. Everything it covers was introduced in one pass and
 * was, until this spec, verified only by eye and by axe's incidental
 * side-effects. Three real defects in that pass reached a browser before being
 * caught: the Before/After badges each hid behind the other layer, a
 * `data-reveal` wrapper round the price table could never satisfy the reveal
 * observer's threshold and stayed invisible forever, and the scroll-to-top
 * arrow vanished into the footer it was drawn over. None of those were
 * type errors, lint errors, or axe violations. Each one is asserted here.
 *
 * WHAT IS DELIBERATELY NOT ASSERTED. Beauty. These tests check structural
 * facts a regression would break — a hero's visual actually spans the
 * viewport, a listing's cards actually contain a picture, a slider's handle
 * actually moves the seam — not whether the result looks good.
 */

/** Routes that open with a `PageHero`, i.e. everything except the exceptions
 *  listed in HERO_EXCEPTIONS below and the homepage, which has its own. */
const HERO_ROUTES: Array<{ en: string; ar: string; label: string }> = [
  { label: "medical hub", en: "/en/medical", ar: "/ar/الرعاية-الطبية" },
  { label: "aesthetics hub", en: "/en/aesthetics", ar: "/ar/التجميل-الطبي" },
  { label: "treatments index", en: "/en/aesthetics/treatments", ar: "/ar/التجميل-الطبي/العلاجات" },
  { label: "technologies index", en: "/en/aesthetics/technologies", ar: "/ar/التجميل-الطبي/التقنيات" },
  { label: "concerns index", en: "/en/aesthetics/concerns", ar: "/ar/التجميل-الطبي/المخاوف-الجمالية" },
  { label: "before/after", en: "/en/aesthetics/before-after", ar: "/ar/التجميل-الطبي/قبل-وبعد" },
  { label: "pricing", en: "/en/aesthetics/pricing", ar: "/ar/التجميل-الطبي/الأسعار" },
  { label: "treatment detail", en: "/en/aesthetics/treatments/rf-microneedling", ar: "/ar/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية" },
  { label: "technology detail", en: "/en/aesthetics/technologies/potenza", ar: "/ar/التجميل-الطبي/التقنيات/بوتنزا" },
  { label: "medical service detail", en: "/en/medical/eye-screening", ar: "/ar/الرعاية-الطبية/فحص-العين" },
  { label: "botox hub", en: "/en/botox", ar: "/ar/بوتوكس" },
  { label: "doctors index", en: "/en/doctors", ar: "/ar/الأطباء" },
  { label: "about", en: "/en/about", ar: "/ar/من-نحن" },
  { label: "contact", en: "/en/contact", ar: "/ar/تواصل-معنا" },
  { label: "shop", en: "/en/shop", ar: "/ar/المتجر" },
  { label: "health hub", en: "/en/health-hub", ar: "/ar/المركز-المعرفي" },
  { label: "patient resources", en: "/en/patient-resources", ar: "/ar/موارد-المرضى" },
  { label: "book appointment", en: "/en/book-appointment", ar: "/ar/حجز-موعد" },
  { label: "careers", en: "/en/careers", ar: "/ar/الوظائف" },
];

/**
 * The two routes that deliberately do NOT open with a full-bleed hero.
 *
 * Both are already image-led: a doctor page puts the portrait beside the bio,
 * a product page puts the product beside its details. A hero above either
 * would push the thing the visitor came to look at below the fold and repeat
 * the same picture twice. They are exceptions by decision, so they are
 * asserted as exceptions — the test below requires each to carry a large
 * image near its `h1`, which is what makes the exception legitimate rather
 * than an omission.
 */
const HERO_EXCEPTIONS = [
  { label: "doctor detail", path: "/en/doctors/mohamed-farhat" },
  { label: "product detail", path: "/en/shop/tns-eye-repair" },
];

/** The visual a hero renders: a real ImageKit `<img>`, or the branded SVG
 *  FacetTile that stands in until one is uploaded and approved. */
const VISUAL = "img, svg[role='img'], svg[aria-hidden='true']";

/**
 * Scrolls the page in overlapping half-viewport steps, then waits for every
 * `[data-reveal]` element to reach `.is-revealed` — a real reader's journey,
 * not an injected class. Returns nothing; throws through `expect.poll` if any
 * element never reveals.
 */
async function scrollThroughAndSettle(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 800;
  const step = Math.max(200, Math.floor(viewport / 2));
  for (let y = 0; y < height; y += step) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(80);
  }
  // Land on the true bottom last. The observer's root is shrunk 8% at the
  // bottom (rootMargin "0px 0px -8%"), so an element sitting in that final
  // band is not "seen" until the page is scrolled all the way down — and the
  // stepped loop above stops one step short of the end. It also re-reads the
  // height, because a page that grew while being walked has a bottom that
  // moved.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);

  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
            .filter((el) => !el.classList.contains("is-revealed"))
            .map((el) => `${el.tagName}.${el.className}`.slice(0, 80)),
        ),
      {
        // Generous because the reveal itself is an 800ms transition plus up to
        // 270ms of stagger, and CI machines are shared. The assertion is exact;
        // only the patience is loose.
        timeout: 12000,
        message: "every [data-reveal] element must reach .is-revealed after a real scroll-through",
      },
    )
    .toEqual([]);
}

// ---------------------------------------------------------------------------
// 1. HEROES
// ---------------------------------------------------------------------------

test.describe("Heroes", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: the homepage hero is one full-background image, not a split composition`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const hero = page.locator("#main-content section").first();
      const heroBox = await hero.boundingBox();
      expect(heroBox, "the homepage must open with a hero section").toBeTruthy();

      // The defining property of the redesign: ONE visual covering the whole
      // section, rather than the previous two half-width panels clipped into
      // cards. A composition of two 50%-wide images would fail the width
      // assertion; a small decorative tile would fail the height one.
      const visuals = hero.locator(VISUAL);
      const boxes = await visuals.evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { w: r.width, h: r.height };
        }),
      );
      const fullBleed = boxes.filter((b) => b.w >= 1440 * 0.98 && b.h >= heroBox!.height * 0.9);
      expect(fullBleed.length, `expected one viewport-spanning hero visual, got boxes ${JSON.stringify(boxes)}`).toBeGreaterThanOrEqual(1);

      // And the copy sits over it, not beside it.
      const h1 = page.getByRole("heading", { level: 1 }).first();
      await expect(h1).toBeVisible();
      const h1Box = (await h1.boundingBox())!;
      expect(h1Box.y, "the H1 must sit inside the hero section").toBeLessThan(heroBox!.y + heroBox!.height);
    });
  }

  for (const route of HERO_ROUTES) {
    for (const locale of ["en", "ar"] as const) {
      test(`${locale}: ${route.label} opens with a full-bleed hero`, async ({ page }) => {
        const response = await page.goto(route[locale]);
        expect(response?.status(), `${route[locale]} must render`).toBe(200);

        const hero = page.locator("#main-content section").first();
        const heroBox = await hero.boundingBox();
        expect(heroBox, `${route.label} must open with a hero section`).toBeTruthy();

        const boxes = await hero.locator(VISUAL).evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return { w: r.width, h: r.height };
          }),
        );
        const fullBleed = boxes.filter((b) => b.w >= 1440 * 0.98 && b.h >= heroBox!.height * 0.9);
        expect(
          fullBleed.length,
          `${route.label} (${locale}) has no viewport-spanning hero visual; boxes: ${JSON.stringify(boxes)}`,
        ).toBeGreaterThanOrEqual(1);

        // The hero owns the page's H1, and it is legible over the wash.
        const h1 = page.getByRole("heading", { level: 1 }).first();
        await expect(h1).toBeVisible();
      });
    }
  }

  for (const exception of HERO_EXCEPTIONS) {
    test(`${exception.label} is a deliberate exception: image-led, not hero-led`, async ({ page }) => {
      await page.goto(exception.path);
      const h1 = page.getByRole("heading", { level: 1 }).first();
      await expect(h1).toBeVisible();

      // No full-bleed hero here by design — but the page must still be
      // image-led, which is the whole justification for the exception. A
      // substantial visual (>= a quarter of the viewport wide) must render
      // above the fold alongside the heading.
      const boxes = await page.locator(`#main-content ${VISUAL}`).evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { w: r.width, h: r.height, y: r.top };
        }),
      );
      const substantial = boxes.filter((b) => b.w >= 1440 * 0.25 && b.h >= 200 && b.y < 900);
      expect(
        substantial.length,
        `${exception.label} must stay image-led above the fold; boxes: ${JSON.stringify(boxes.slice(0, 6))}`,
      ).toBeGreaterThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. CARD IMAGERY AND THE BRANDED FALLBACK
// ---------------------------------------------------------------------------

test.describe("Listing cards carry imagery", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  /**
   * `cards` is a per-listing selector rather than one clever heuristic.
   * The listings genuinely differ in markup — MediaCard is a link wrapping a
   * heading, ProductCard is a link inside `li.group` whose title is a
   * paragraph — and a selector loose enough to catch all of them also catches
   * breadcrumbs, pills and CTAs, which correctly have no imagery. Naming each
   * one keeps the assertion about cards.
   */
  const LISTINGS = [
    { label: "medical services", path: "/en/medical", cards: "#main-content a:has(h3)", min: 6 },
    { label: "treatments", path: "/en/aesthetics/treatments", cards: "#main-content a:has(h2)", min: 6 },
    { label: "technologies", path: "/en/aesthetics/technologies", cards: "#main-content a:has(h2)", min: 4 },
    { label: "products", path: "/en/shop", cards: "#main-content li.group > a", min: 8 },
    { label: "doctors", path: "/en/doctors", cards: "#main-content a:has(h2)", min: 6 },
  ];

  for (const listing of LISTINGS) {
    test(`every ${listing.label} card renders a visual`, async ({ page }) => {
      await page.goto(listing.path);
      await scrollThroughAndSettle(page);

      // Every card must contain a picture — an approved ImageKit <img>, or the
      // FacetTile that stands in for it. "No image yet" is not allowed to mean
      // "no image slot": that is what made these listings read as empty boxes.
      const result = await page.evaluate(
        ({ cardSelector, visualSelector }) => {
          const cards = Array.from(document.querySelectorAll<HTMLElement>(cardSelector));
          return {
            total: cards.length,
            missing: cards
              .filter((card) => !card.querySelector(visualSelector))
              .map((card) => card.textContent?.trim().slice(0, 60) ?? "(untitled)")
              .slice(0, 8),
          };
        },
        { cardSelector: listing.cards, visualSelector: VISUAL },
      );

      expect(result.total, `${listing.label} should render at least ${listing.min} cards`).toBeGreaterThanOrEqual(listing.min);
      expect(result.missing, `these ${listing.label} cards render no image and no fallback visual`).toEqual([]);
    });
  }

  test("the FacetTile fallback varies between sibling cards rather than repeating one composition", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments");
    await scrollThroughAndSettle(page);

    // Each FacetTile composition defines gradients keyed `facet-bg-<role>-<n>`
    // where n is the variant index, so the set of distinct ids in a listing is
    // the set of distinct compositions drawn. One id across a dozen cards is
    // the "same missing image repeated" failure this system exists to prevent.
    const variants = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll("linearGradient[id^='facet-bg-']")).map((el) => el.id);
      return Array.from(new Set(ids));
    });

    // Only meaningful while the tiles are still placeholders. Once real
    // photography is approved there are no gradients to count, and the
    // assertion above (every card has a visual) is the one that matters.
    test.skip(variants.length === 0, "no FacetTile placeholders on this page — real imagery is approved");
    expect(variants.length, `expected several facet compositions, saw: ${variants.join(", ")}`).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// 3. BEFORE / AFTER
// ---------------------------------------------------------------------------

test.describe("Before & After", () => {
  const BA = { en: "/en/aesthetics/before-after", ar: "/ar/التجميل-الطبي/قبل-وبعد" };

  /** Cards per row, derived from how many share the topmost row's y position. */
  async function cardsInFirstRow(page: Page): Promise<number> {
    return page.evaluate(() => {
      const items = Array.from(document.querySelectorAll<HTMLElement>("#main-content ul > li"))
        .filter((li) => li.querySelector("input[type='range']"))
        .map((li) => Math.round(li.getBoundingClientRect().top));
      if (items.length === 0) return 0;
      const first = Math.min(...items);
      // 4px tolerance for sub-pixel layout differences within one row.
      return items.filter((top) => Math.abs(top - first) <= 4).length;
    });
  }

  for (const [width, expected, label] of [
    [1440, 4, "desktop"],
    [820, 2, "tablet"],
    [390, 1, "mobile"],
  ] as const) {
    test(`${label} (${width}px) lays the gallery out ${expected} across`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BA.en);
      await scrollThroughAndSettle(page);
      expect(await cardsInFirstRow(page), `expected ${expected} comparison cards per row at ${width}px`).toBe(expected);
    });
  }

  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: both the Before and the After label are visible at the default handle position`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(BA[locale]);
      await scrollThroughAndSettle(page);

      const card = page
        .locator("#main-content ul > li")
        .filter({ has: page.locator("input[type='range']") })
        .first();

      // The regression this asserts: with the wrong layer clipped, the
      // "Before" badge sat under the after image and the "After" badge sat in
      // the region the clip removed, so at the default 50% NEITHER was on
      // screen. Both must be visible, and on opposite sides.
      const labels = locale === "ar" ? { before: "قبل", after: "بعد" } : { before: "Before", after: "After" };
      const before = card.getByText(labels.before, { exact: true }).first();
      const after = card.getByText(labels.after, { exact: true }).first();
      await expect(before).toBeVisible();
      await expect(after).toBeVisible();

      const beforeBox = (await before.boundingBox())!;
      const afterBox = (await after.boundingBox())!;
      expect(
        Math.abs(beforeBox.x - afterBox.x),
        "the two badges must sit on opposite sides of the frame, not on top of each other",
      ).toBeGreaterThan(80);
    });

    test(`${locale}: dragging the handle moves the reveal seam`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(BA[locale]);
      await scrollThroughAndSettle(page);

      const input = page.locator("input[type='range']").first();
      await input.scrollIntoViewIfNeeded();
      const box = (await input.boundingBox())!;

      // The control is the invisible range input stretched over the whole
      // picture, so the drag surface must BE the picture: a box only as wide
      // as a native range thumb means the stretch classes stopped applying.
      expect(box.width, "the drag surface must span the whole comparison frame").toBeGreaterThan(180);
      expect(box.height, "the drag surface must span the whole comparison frame").toBeGreaterThan(120);

      const startValue = Number(await input.inputValue());
      const clipBefore = await page.evaluate(() => {
        const layer = document.querySelector<HTMLElement>("[style*='clip-path']");
        return layer?.style.clipPath ?? "";
      });

      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.5, { steps: 12 });
      await page.mouse.up();

      const endValue = Number(await input.inputValue());
      expect(endValue, "dragging must change the slider value").not.toBe(startValue);

      const clipAfter = await page.evaluate(() => {
        const layer = document.querySelector<HTMLElement>("[style*='clip-path']");
        return layer?.style.clipPath ?? "";
      });
      expect(clipAfter, "the reveal seam must follow the handle").not.toBe(clipBefore);
    });

    test(`${locale}: the comparison is operable by keyboard`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(BA[locale]);
      await scrollThroughAndSettle(page);

      const input = page.locator("input[type='range']").first();
      await input.focus();
      const start = Number(await input.inputValue());
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      expect(Number(await input.inputValue()), "arrow keys must move the handle").not.toBe(start);
      // The visible frame, not the invisible input, must show the focus ring.
      const framed = await input.evaluate((el) => {
        const frame = el.parentElement!;
        return getComputedStyle(frame).outlineWidth;
      });
      expect(framed, "the comparison frame must take a visible focus ring").not.toBe("0px");
    });
  }
});

// ---------------------------------------------------------------------------
// 4. SCROLL REVEAL
// ---------------------------------------------------------------------------

test.describe("Scroll reveal", () => {
  const REVEAL_ROUTES = [
    "/en",
    "/ar",
    "/en/medical",
    "/en/aesthetics",
    "/en/aesthetics/treatments",
    "/en/aesthetics/technologies",
    "/en/aesthetics/before-after",
    "/en/shop",
    "/en/doctors",
    "/en/contact",
  ];

  for (const path of REVEAL_ROUTES) {
    test(`${path}: every revealable block becomes visible after scrolling`, async ({ page }) => {
      // These walk an entire page in half-viewport steps. The homepage alone
      // is sixteen sections tall, so the walk legitimately takes longer than
      // Playwright's 30s default — the same allowance tests/accessibility/
      // axe.spec.ts already makes for the same reason. This is extra time for
      // a genuinely long page, not a loosened assertion.
      test.slow();
      await page.goto(path);
      await scrollThroughAndSettle(page);
    });
  }

  /**
   * The price list is the page that broke. Its table is several screens tall,
   * and while it was wrapped in `data-reveal` the observer's 12% threshold —
   * 12% of the ELEMENT, not of the viewport — could never be satisfied, so the
   * whole price list stayed at opacity 0 permanently. Both locales, because
   * only the Arabic one failed CI and the cause was width-dependent.
   *
   * NOTE ON COVERAGE: this asserts the outcome (nothing stays invisible), not
   * the `tallObserver` routing in ScrollReveal directly. No route currently
   * renders a `data-reveal` element tall enough to exercise that branch, and
   * building one only for a test would mean injecting DOM the app never
   * produces. If a future page does grow one, this same assertion is what
   * will catch it.
   */
  for (const path of ["/en/aesthetics/pricing", "/ar/التجميل-الطبي/الأسعار"]) {
    test(`${path}: the full price list is visible, not stuck behind an unreachable reveal threshold`, async ({ page }) => {
      test.slow();
      await page.goto(path);
      await scrollThroughAndSettle(page);
      // And the price list itself really rendered, so "nothing hidden" cannot
      // pass by virtue of there being nothing there. PricingTable is a
      // description list rather than a <table> — one row is a term and its
      // price, not a grid of cells — so the rows are `dl > div`.
      const rows = await page.locator("#main-content dl > div").count();
      expect(rows, "the price list must render its rows").toBeGreaterThan(20);
      await expect(page.locator("#main-content dl").first()).toBeVisible();
    });
  }
});

// ---------------------------------------------------------------------------
// 5. BLUE SCROLL CHROME
// ---------------------------------------------------------------------------

test.describe("Scroll progress rail", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: the rail is empty at the top, fills as the page is scrolled, and is full at the bottom`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForLoadState("networkidle");

      const rail = page.locator(".scroll-progress-fill");
      await expect(rail).toHaveCount(1);

      const scaleX = () =>
        rail.evaluate((el) => {
          const t = getComputedStyle(el).transform;
          if (!t || t === "none") return 0;
          // matrix(a, b, c, d, tx, ty) — `a` is the horizontal scale.
          return Number(t.slice(t.indexOf("(") + 1).split(",")[0]);
        });

      /**
       * Scrolls to a fraction of the page and returns BOTH the rail's fill and
       * the browser's own scroll ratio, read in the same evaluate call.
       *
       * Comparing the two is the only stable way to assert this. Checking the
       * fill against the fraction that was *requested* is a race: a page whose
       * fonts and images are still settling keeps growing, so a scroll to
       * "25% of the height a moment ago" lands at 0.1% of the height a moment
       * later — which is exactly how this test first failed on the Arabic
       * homepage. Read together, the two numbers must agree whatever the page
       * is doing, because that agreement is the rail's actual contract.
       */
      const sample = async (fraction: number) => {
        await page.evaluate((f) => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo(0, Math.round(max * f));
        }, fraction);
        await page.waitForTimeout(300);
        return page.evaluate(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const el = document.querySelector<HTMLElement>(".scroll-progress-fill")!;
          const t = getComputedStyle(el).transform;
          return {
            expected: max > 0 ? window.scrollY / max : 0,
            actual: !t || t === "none" ? 0 : Number(t.slice(t.indexOf("(") + 1).split(",")[0]),
          };
        });
      };

      expect(await scaleX(), "the rail must be empty at the top of the page").toBeLessThan(0.02);
      await expect(rail).toHaveCSS("opacity", "0");

      // Two positions: the rail must agree with the page at each, and must
      // have advanced between them.
      const quarter = await sample(0.25);
      const threeQuarters = await sample(0.75);
      expect(
        Math.abs(quarter.actual - quarter.expected),
        `the rail must report the real scroll ratio (rail ${quarter.actual}, page ${quarter.expected})`,
      ).toBeLessThan(0.05);
      expect(
        Math.abs(threeQuarters.actual - threeQuarters.expected),
        `the rail must report the real scroll ratio (rail ${threeQuarters.actual}, page ${threeQuarters.expected})`,
      ).toBeLessThan(0.05);
      expect(threeQuarters.actual, "the rail must advance as the reader descends").toBeGreaterThan(quarter.actual);
      await expect(rail).toHaveCSS("opacity", "1");

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(250);
      expect(await scaleX(), "the rail must be full at the bottom").toBeGreaterThan(0.95);

      // It grows from the edge the language starts at.
      const origin = await rail.evaluate((el) => getComputedStyle(el).transformOrigin);
      const originX = Number(origin.split(" ")[0].replace("px", ""));
      const width = (await rail.boundingBox())!.width;
      if (locale === "ar") expect(originX, "RTL rail must grow from the right").toBeGreaterThan(width / 2);
      else expect(originX, "LTR rail must grow from the left").toBeLessThan(width / 2);
    });
  }
});

test.describe("Back-to-top arrow", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: hidden and unreachable at the top, offered once scrolled, and returns to the top`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForLoadState("networkidle");

      const button = page.locator("[data-back-to-top]");
      await expect(button).toHaveCount(1);

      // At the top it must be inert, not merely transparent: an invisible
      // control that can still be tabbed to or clicked is a trap.
      await expect(button).toHaveAttribute("inert", "");
      await expect(button).toHaveCSS("opacity", "0");

      await page.evaluate(() => window.scrollTo(0, 1400));
      await page.waitForTimeout(300);
      await expect(button).not.toHaveAttribute("inert", "");
      await expect(button).toHaveCSS("opacity", "1");
      await expect(button).toBeVisible();

      await button.click();
      await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 4000 }).toBeLessThanOrEqual(2);
    });

    test(`${locale}: the arrow stays legible over the footer, not just over light sections`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForLoadState("networkidle");
      const button = page.locator("[data-back-to-top]");

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      await expect(button).toBeVisible();

      // Over the footer the button is brand blue on brand blue. The white ring
      // is what separates the two, and it is drawn as a box-shadow ring — if
      // it is ever dropped, the control disappears into the footer exactly as
      // it did before this was fixed.
      const { shadow, overFooter } = await button.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const behind = document
          .elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          .some((node) => node.tagName === "FOOTER" || node.closest("footer") !== null);
        return { shadow: getComputedStyle(el).boxShadow, overFooter: behind };
      });
      expect(overFooter, "at the bottom of the page the arrow should be drawn over the footer").toBe(true);

      // Two facts, asserted separately because either one alone can regress:
      // that a 2px ring layer is drawn at all, and that its colour is light
      // enough to separate blue-on-blue. Tailwind v4 serialises `ring-white/70`
      // as `oklab(0.999994 … / 0.7)` rather than rgb, so the colour is matched
      // on lightness — an oklab L near 1, or a literal white — instead of on
      // one exact serialisation that a future Tailwind could change.
      expect(shadow, `the arrow must draw a 2px separating ring; got: ${shadow}`).toMatch(/0px 0px 0px 2px/);
      expect(shadow, `the separating ring must be light, not dark; got: ${shadow}`).toMatch(
        /oklab\(0\.9\d+|rgba?\(255,\s*255,\s*255/,
      );
    });
  }
});

// ---------------------------------------------------------------------------
// 6. REDUCED MOTION
// ---------------------------------------------------------------------------

test.describe("Reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of ["/en/aesthetics/before-after", "/en/aesthetics/treatments", "/en/shop"]) {
    test(`${path}: content is visible immediately and nothing animates`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains("reveal-active")), { timeout: 5000 })
        .toBe(true);

      // No scrolling at all: under reduced motion every revealable block is
      // visible from the first paint.
      const hidden = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
          (el) => getComputedStyle(el).opacity !== "1",
        ).length,
      );
      expect(hidden, "reduced motion must not leave content waiting on an observer").toBe(0);
    });
  }

  test("the Before/After drag hint does not animate under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/aesthetics/before-after");
    const hint = page.locator(".ba-drag-hint").first();
    await expect(hint).toHaveCount(1);
    const duration = await hint.evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(duration), `drag hint animation must collapse under reduced motion; got ${duration}`).toBeLessThanOrEqual(0.01);
  });
});
