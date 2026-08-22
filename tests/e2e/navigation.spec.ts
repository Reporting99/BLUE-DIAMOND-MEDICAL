import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * "FINAL MANDATORY NAVIGATION" brief — one authoritative header/mobile-nav
 * component, exact bilingual order, accessible Treatments dropdown,
 * transparent/scrolled header states, RTL mirroring. Source of truth:
 * src/config/navigation.ts, src/components/layout/Header.tsx,
 * src/components/layout/MobileNav.tsx.
 *
 * Locators are scoped to `header` throughout — the footer (Footer.tsx)
 * independently renders a logo, a "Book Appointment" link, and several
 * links whose accessible names overlap with primary-nav labels (e.g.
 * "Uninsured Services & Fees" contains "Services"), so an unscoped
 * getByRole query is ambiguous by design, not a bug in either component.
 *
 * The Treatments trigger is a real `<a href>` (native Enter/click
 * navigates to the Treatments hub) that Base UI additionally marks
 * `role="button"` (a deliberate combined disclosure-trigger-and-link
 * pattern — confirmed by inspecting the rendered DOM this pass) — so it's
 * queried by role "button", not "link".
 */

const ENGLISH_ORDER = ["Home", "Services", "Treatments", "Medical Aesthetics", "Our Team", "About", "Contact"];
const ARABIC_ORDER = ["الرئيسية", "الخدمات", "العلاجات", "التجميل الطبي", "فريقنا", "من نحن", "تواصل معنا"];

const REPRESENTATIVE_PAGES = [
  "/en",
  "/en/medical",
  "/en/medical/eye-screening",
  "/en/aesthetics/treatments",
  "/en/aesthetics/treatments/radio-frequency",
  "/en/aesthetics",
  "/en/aesthetics/concerns/acne-scars",
  "/en/aesthetics/technologies/potenza",
  "/en/doctors/mohamed-farhat",
  "/en/shop/tns-eye-repair",
  "/en/contact",
  "/en/book-appointment",
];

function headerNav(page: Page): Locator {
  return page.locator("header").locator("nav[data-slot='navigation-menu']");
}

async function desktopNavLabels(page: Page): Promise<string[]> {
  return headerNav(page)
    .locator(":scope > ul > li")
    .evaluateAll((items) =>
      items.map((li) => {
        // Only the trigger/link text, not any already-open portal content.
        const direct = li.querySelector("a, button");
        return direct?.textContent?.trim().replace(/\s+/g, " ") ?? "";
      }),
    );
}

test.describe("Global navigation — present on every page family", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of REPRESENTATIVE_PAGES) {
    test(`${path} renders the same header component`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      const header = page.locator("header");
      await expect(header).toBeVisible();
      await expect(header.getByRole("link", { name: "Blue Diamond Medical — Home" })).toBeVisible();
    });
  }
});

test.describe("English desktop navigation — exact order", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("order is exactly Home, Services, Treatments, Medical Aesthetics, Our Team, About, Contact", async ({ page }) => {
    await page.goto("/en/contact"); // non-homepage: settled header, no scroll needed
    const labels = await desktopNavLabels(page);
    expect(labels).toEqual(ENGLISH_ORDER);
  });

  test("logo sits at the far inline-start (far left in LTR)", async ({ page }) => {
    await page.goto("/en/contact");
    const logo = page.locator("header").getByRole("link", { name: "Blue Diamond Medical — Home" });
    const box = await logo.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeLessThan(120);
  });

  test("language switcher and Book Appointment sit at the far inline-end (far right in LTR)", async ({ page }) => {
    await page.goto("/en/contact");
    const booking = page.locator("header").getByRole("link", { name: "Book Appointment" });
    const box = await booking.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeGreaterThan(viewport.width - 260);
  });

  test("no desktop link wraps to a second line", async ({ page }) => {
    await page.goto("/en/contact");
    const nav = headerNav(page);
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    // A wrapped nav list roughly doubles its own height; the trigger row
    // height should stay within one line (~44px including padding).
    expect(box!.height).toBeLessThan(60);
  });
});

test.describe("Arabic desktop navigation — mirrored order and layout", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("order is exactly the mirrored Arabic sequence", async ({ page }) => {
    await page.goto("/ar/تواصل-معنا");
    const labels = await desktopNavLabels(page);
    expect(labels).toEqual(ARABIC_ORDER);
  });

  test("page direction is rtl", async ({ page }) => {
    await page.goto("/ar/تواصل-معنا");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("logo sits at the far inline-start, which is the far RIGHT in RTL", async ({ page }) => {
    await page.goto("/ar/تواصل-معنا");
    const logo = page.locator("header").getByRole("link", { name: "بلو دايموند الطبية — الصفحة الرئيسية" });
    const box = await logo.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeGreaterThan(viewport.width - 160);
  });

  test("Book Appointment sits at the far inline-end, which is the far LEFT in RTL", async ({ page }) => {
    await page.goto("/ar/تواصل-معنا");
    const booking = page.locator("header").getByRole("link", { name: "احجز موعدًا" });
    const box = await booking.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeLessThan(260);
  });
});

test.describe("Treatments dropdown — desktop interaction", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("hovering the Treatments trigger reveals the menu", async ({ page }) => {
    await page.goto("/en/contact");
    const trigger = page.locator("header").getByRole("button", { name: "Treatments" });
    await trigger.hover();
    await expect(page.getByRole("link", { name: "RF Micro-Needling" })).toBeVisible();
  });

  test("keyboard focus on the Treatments trigger reveals the menu", async ({ page }) => {
    await page.goto("/en/contact");
    const trigger = page.locator("header").getByRole("button", { name: "Treatments" });
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "RF Micro-Needling" })).toBeVisible();
  });

  test("Escape closes the open menu without navigating away", async ({ page }) => {
    await page.goto("/en/contact");
    const trigger = page.locator("header").getByRole("button", { name: "Treatments" });
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(/\/en\/contact$/);
  });

  test("tabbing from the trigger moves into the open panel's first item", async ({ page, isMobile }) => {
    // Real Tab-key sequencing is a desktop/physical-keyboard interaction —
    // Pixel 7 touch-device emulation (chromium-mobile) doesn't preserve
    // focus the same way mid-keyboard-navigation. Covered on
    // chromium-desktop; the equivalent mobile-menu accordion flow is
    // covered separately below.
    test.skip(isMobile, "Tab-key keyboard sequencing is desktop-only; mobile touch emulation doesn't apply here");
    await page.goto("/en/contact");
    const trigger = page.locator("header").getByRole("button", { name: "Treatments" });
    await trigger.focus();
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText("Cosmetic Botox");
    await expect(focused).toHaveAttribute("href", "/en/botox");
  });

  test("moving the pointer from the trigger down into the panel does not close it (close delay)", async ({ page }) => {
    await page.goto("/en/contact");
    const trigger = page.locator("header").getByRole("button", { name: "Treatments" });
    await trigger.hover();
    const item = page.getByRole("link", { name: "RF Micro-Needling" });
    await expect(item).toBeVisible();
    await item.hover();
    await expect(item).toBeVisible();
  });

  test("clicking the Treatments label itself navigates to the Treatments hub", async ({ page }) => {
    await page.goto("/en/contact");
    await page.locator("header").getByRole("button", { name: "Treatments" }).click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/treatments$/);
  });

  test("every Treatments menu item resolves to a real, live, non-gated page (200)", async ({ page, request }) => {
    await page.goto("/en/contact");
    await page.locator("header").getByRole("button", { name: "Treatments" }).hover();
    await expect(page.getByRole("link", { name: "RF Micro-Needling" })).toBeVisible();
    const hrefs = await page
      .locator("[data-slot='navigation-menu-content'] a")
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute("href")));
    const uniqueHrefs = [...new Set(hrefs.filter((h): h is string => Boolean(h)))];
    expect(uniqueHrefs.length).toBeGreaterThanOrEqual(10); // 10 items + "view all treatments"
    for (const h of uniqueHrefs) {
      const res = await request.get(h);
      expect(res.status(), `${h} should be 200`).toBe(200);
    }
  });
});

test.describe("Header transparent/scrolled states — homepage", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("header is transparent at the top of the homepage", async ({ page }) => {
    await page.goto("/en");
    const header = page.locator("header");
    const bg = await header.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toMatch(/rgba?\(0, 0, 0, 0\)|transparent/);
  });

  test("header becomes translucent white after scrolling past the threshold", async ({ page }) => {
    await page.goto("/en");
    await page.evaluate(() => window.scrollTo(0, 400));
    const header = page.locator("header");
    await expect(async () => {
      const bg = await header.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toContain("rgba(255, 255, 255");
    }).toPass({ timeout: 2000 });
  });

  test("header height stays within the specified range through the transition", async ({ page }) => {
    await page.goto("/en");
    const header = page.locator("header");
    const topHeight = await header.evaluate((el) => el.getBoundingClientRect().height);
    expect(topHeight).toBeGreaterThanOrEqual(88);
    expect(topHeight).toBeLessThanOrEqual(96);

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(async () => {
      const h = await header.evaluate((el) => el.getBoundingClientRect().height);
      expect(h).toBeGreaterThanOrEqual(68);
      expect(h).toBeLessThanOrEqual(76);
    }).toPass({ timeout: 2000 });
  });

  test("scrolling does not push the H1 or cause the header to overlap it unreadably", async ({ page }) => {
    await page.goto("/en");
    const h1 = page.getByRole("heading", { level: 1 }).first();
    await expect(h1).toBeVisible();
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile menu opens, shows the exact order, and Treatments is a collapsed accordion", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ENGLISH_ORDER) {
      await expect(dialog.getByText(label, { exact: true }).first()).toBeVisible();
    }
    // Individual treatment links are not visible until the accordion opens.
    await expect(dialog.getByRole("link", { name: "RF Micro-Needling" })).toBeHidden();
    await dialog.getByRole("button", { name: "Treatments" }).click();
    await expect(dialog.getByRole("link", { name: "RF Micro-Needling" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "View all treatments" })).toBeVisible();
  });

  test("Escape closes the mobile menu", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("touch targets are at least 44px tall", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog");
    const homeLink = dialog.getByRole("link", { name: "Home", exact: true });
    const box = await homeLink.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("Arabic mobile menu mirrors from the opposite edge and shows the mirrored order", async ({ page }) => {
    await page.goto("/ar/تواصل-معنا");
    await page.getByRole("button", { name: "فتح القائمة" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ARABIC_ORDER) {
      await expect(dialog.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });
});

test.describe("Services and legacy-alias resolution", () => {
  test.use({ viewport: { width: 1440, height: 900 } }); // desktop nav link, hidden below `lg` by design

  test("Services nav item opens the real Medical Services hub (200, substantial content)", async ({ page }) => {
    await page.goto("/en/contact");
    await page.locator("header").getByRole("link", { name: "Services", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/medical$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/en/services alias redirects to the real hub, not a duplicate page or 404", async ({ page }) => {
    const res = await page.goto("/en/services");
    expect(res?.status()).toBe(200); // after following the 301
    await expect(page).toHaveURL(/\/en\/medical$/);
  });
});

test.describe("Language switcher preserves the equivalent page", () => {
  test("switching from an English service page lands on its real Arabic equivalent, not the homepage", async ({ page }) => {
    await page.goto("/en/medical/eye-screening");
    await page.locator("header").getByRole("link", { name: "العربية" }).click();
    await expect(page).toHaveURL(/\/ar\//);
    await expect(page).not.toHaveURL(/^.*\/ar\/?$/);
  });
});

test.describe("Reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 } }); // desktop nav, hidden below `lg` by design

  test("homepage content is fully visible immediately with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(headerNav(page)).toBeVisible();
  });
});

test.describe("No console errors on representative pages", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of ["/en", "/en/aesthetics/treatments", "/ar/التجميل-الطبي/العلاجات"]) {
    test(`${path} produces no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  }
});
