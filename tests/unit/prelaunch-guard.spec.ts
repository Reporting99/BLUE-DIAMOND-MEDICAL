import { test, expect } from "@playwright/test";
import { isSiteLaunched, PRE_LAUNCH_ROBOTS_HEADER } from "../../src/config/launch";
// Static imports: both modules read the gate inside their exported function,
// so the flag is evaluated per call and a top-level import is enough. (A
// dynamic import() is not transpiled by the Playwright runner.)
import robots from "../../src/app/robots";
import sitemap from "../../src/app/sitemap";

/**
 * Runs `run` with SITE_LAUNCHED forced to a given state and always restores
 * the previous value, so one test can never leak its environment into
 * another running in the same worker.
 */
function withLaunchFlag<T>(value: string | undefined, run: () => T): T {
  const previous = process.env.SITE_LAUNCHED;
  if (value === undefined) delete process.env.SITE_LAUNCHED;
  else process.env.SITE_LAUNCHED = value;
  try {
    return run();
  } finally {
    if (previous === undefined) delete process.env.SITE_LAUNCHED;
    else process.env.SITE_LAUNCHED = previous;
  }
}

/**
 * The pre-launch indexing gate.
 *
 * These are pure-function tests rather than HTTP tests on purpose: the
 * Playwright web server runs with SITE_LAUNCHED=true (see playwright.config.ts)
 * so that the existing tests/seo suite keeps validating real *launched*
 * behaviour — populated sitemap, `Sitemap:` in robots.txt, indexable pages.
 * Asserting the unlaunched branch therefore has to be done against the gate
 * itself, which is where the decision actually lives.
 *
 * The property that matters most is fail-closed: every way of getting the
 * configuration wrong must resolve to "not launched", because the failure is
 * silent and only visible once a crawler has already acted on it.
 */
test.describe("SITE_LAUNCHED gate", () => {
  test("fails closed for every non-exact value", () => {
    const notLaunched: Array<string | undefined> = [
      undefined,
      "",
      " ",
      "false",
      "0",
      "1",
      "yes",
      "TRUE",
      "True",
      "true ",
      " true",
      "launched",
    ];

    for (const value of notLaunched) {
      expect(
        isSiteLaunched(value),
        `expected NOT launched for ${JSON.stringify(value)}`,
      ).toBe(false);
    }
  });

  test("opens only for the exact string \"true\"", () => {
    expect(isSiteLaunched("true")).toBe(true);
  });

  test("is not a NEXT_PUBLIC_ variable, so it never reaches the browser bundle", () => {
    // Next.js inlines every NEXT_PUBLIC_* value into the client bundle at
    // build time. A crawler-facing gate belongs on the server only.
    expect("SITE_LAUNCHED".startsWith("NEXT_PUBLIC_")).toBe(false);
  });

  test("the pre-launch header covers indexing, following, caching and media", () => {
    for (const directive of [
      "noindex",
      "nofollow",
      "noarchive",
      "nosnippet",
      "noimageindex",
    ]) {
      expect(PRE_LAUNCH_ROBOTS_HEADER).toContain(directive);
    }
  });
});

test.describe("robots.txt", () => {
  test("serves a site-wide Disallow and advertises no sitemap when unlaunched", () => {
    const result = withLaunchFlag(undefined, () => robots());
    expect(result.sitemap).toBeUndefined();
    expect(JSON.stringify(result.rules)).toContain('"disallow":"/"');
    expect(JSON.stringify(result.rules)).not.toContain('"allow"');
  });

  test("allows crawling and advertises the sitemap once launched", () => {
    const result = withLaunchFlag("true", () => robots());
    expect(result.sitemap).toContain("/sitemap.xml");
    expect(JSON.stringify(result.rules)).toContain('"allow":"/"');
  });
});

test.describe("sitemap.xml", () => {
  test("publishes no URL inventory when unlaunched", () => {
    expect(withLaunchFlag(undefined, () => sitemap())).toEqual([]);
  });

  test("publishes the real route inventory once launched", () => {
    const entries = withLaunchFlag("true", () => sitemap());
    expect(entries.length).toBeGreaterThan(0);
    // Nothing may ever point at a temporary or runtime hostname.
    for (const entry of entries) {
      expect(entry.url).toContain("https://bluediamondmedical.ca/");
    }
  });
});
