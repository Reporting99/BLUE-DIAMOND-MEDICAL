import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — brief §39. Suites: tests/e2e, tests/accessibility
 * (axe-core), tests/redirects (one test per legacy-redirect row),
 * tests/seo (route-registry/sitemap/canonical/hreflang validators),
 * tests/unit (static analysis — image usage). tests/visual is reserved
 * for future visual-regression coverage.
 */
/**
 * Dedicated loopback port for the test server. Deliberately NOT 3000 (held by
 * FeelStack's cms-ui on this host) and NOT 3030/3031 (reserved for Blue
 * Diamond's own future runtime), so a test run can never collide with either.
 */
const TEST_SERVER_PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3457);
const TEST_SERVER_URL = `http://127.0.0.1:${TEST_SERVER_PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: TEST_SERVER_URL,
    trace: "on-first-retry",
  },
  webServer: {
    // CI already runs `npm run build` as its own step before Playwright —
    // rebuilding here too would double the work. Locally, build+start
    // keeps a single command self-sufficient for a fresh checkout.
    // The STANDALONE server, not `next start`. next.config.ts sets
    // `output: "standalone"`, which `next start` explicitly does not
    // support — Next says so on every boot — and running it anyway
    // produced intermittent 500s ("client reference manifest … does not
    // exist") on gated routes, failing ~26 tests for reasons unrelated to
    // the app. scripts/serve-standalone.sh assembles and runs the exact
    // server shape production runs. CI has already built, so it skips the
    // build; a local run does it.
    command: process.env.CI
      ? `scripts/serve-standalone.sh --no-build`
      : `scripts/serve-standalone.sh`,
    url: TEST_SERVER_URL,
    // NEVER reuse whatever happens to be listening. This used to be
    // `!process.env.CI`, which on this shared VPS meant a local
    // `npx playwright test` silently ran the whole suite against ANOTHER
    // TENANT's server: port 3000 is FeelStack's production cms-ui, Blue
    // Diamond has no runtime of its own, so nothing else would ever claim
    // the port first. The suite passed against a stranger's app.
    //
    // A dedicated loopback port plus reuseExistingServer:false makes that
    // impossible: the run either starts its own server or fails loudly.
    // 127.0.0.1 rather than the default 0.0.0.0 so a test server is never
    // publicly reachable on this box.
    reuseExistingServer: false,
    timeout: 120_000,
    // The suite validates LAUNCHED behaviour — populated sitemap, `Sitemap:`
    // in robots.txt, indexable pages — so the server runs with the gate open.
    // Production defaults to the opposite (see src/config/launch.ts): the
    // flag is absent, so the site is not indexable. The unlaunched branch is
    // covered by tests/unit/prelaunch-guard.spec.ts, which asserts the gate
    // directly rather than needing a second server.
    env: {
      ...process.env,
      SITE_LAUNCHED: "true",
      PORT: String(TEST_SERVER_PORT),
      HOSTNAME: "127.0.0.1",
    },
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
  ],
});
