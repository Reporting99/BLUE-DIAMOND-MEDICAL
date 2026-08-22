import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — brief §39. Suites: tests/e2e, tests/accessibility
 * (axe-core), tests/redirects (one test per legacy-redirect row),
 * tests/seo (route-registry/sitemap/canonical/hreflang validators),
 * tests/unit (static analysis — image usage). tests/visual is reserved
 * for future visual-regression coverage.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // CI already runs `npm run build` as its own step before Playwright —
    // rebuilding here too would double the work. Locally, build+start
    // keeps a single command self-sufficient for a fresh checkout.
    command: process.env.CI ? "npm run start" : "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // The suite validates LAUNCHED behaviour — populated sitemap, `Sitemap:`
    // in robots.txt, indexable pages — so the server runs with the gate open.
    // Production defaults to the opposite (see src/config/launch.ts): the
    // flag is absent, so the site is not indexable. The unlaunched branch is
    // covered by tests/unit/prelaunch-guard.spec.ts, which asserts the gate
    // directly rather than needing a second server.
    env: { ...process.env, SITE_LAUNCHED: "true" },
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
  ],
});
