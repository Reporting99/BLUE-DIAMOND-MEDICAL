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
 *
 * Passing `undefined` DELETES the variable rather than setting it to the
 * string "undefined" — that distinction is what makes an "absent variable"
 * assertion mean anything. Restoration happens in a `finally`, so a failing
 * expectation inside `run` still leaves the environment as it was found.
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
  /**
   * Every assertion here runs inside `withLaunchFlag`, never against whatever
   * SITE_LAUNCHED the runner happens to carry. `isSiteLaunched` has a DEFAULT
   * PARAMETER (`value = process.env.SITE_LAUNCHED`), so any call that does not
   * pin the environment is really testing the shell the suite was invoked
   * from, and would flip with it.
   */
  test("fails closed for every non-exact value", () => {
    // Deliberately NOT including `undefined`: passing it explicitly resolves
    // the default parameter and reads the environment instead of the argument,
    // which is the opposite of what this test is for. The absent-variable case
    // has its own test below.
    const notLaunched = [
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

    // Pinned to the LAUNCHED value on purpose. If any assertion below ever
    // stopped reading its argument and fell through to the environment, it
    // would see "true" and fail loudly — rather than passing for the wrong
    // reason, which is exactly how this test used to be able to mislead.
    withLaunchFlag("true", () => {
      for (const value of notLaunched) {
        expect(
          isSiteLaunched(value),
          `expected NOT launched for ${JSON.stringify(value)}`,
        ).toBe(false);
      }
    });
  });

  test("fails closed when SITE_LAUNCHED is absent from the environment", () => {
    // No argument: this is how production calls it (robots.ts, sitemap.ts,
    // proxy.ts), so the default parameter is the code path under test.
    withLaunchFlag(undefined, () => {
      expect(isSiteLaunched()).toBe(false);
    });
  });

  test("an ambient SITE_LAUNCHED cannot make the absent-variable case pass falsely", () => {
    // Regression guard for a real failure mode: the absent-variable assertion
    // above is only meaningful if it actively neutralises a value that is
    // present. Run it against a deliberately polluted environment and prove
    // both halves — that the assertion still fails closed, AND that the
    // pollution was genuinely there to be neutralised. Without the second
    // half, the first could pass simply because nothing was ever set.
    const previous = process.env.SITE_LAUNCHED;
    process.env.SITE_LAUNCHED = "true";
    try {
      withLaunchFlag(undefined, () => {
        expect(isSiteLaunched()).toBe(false);
      });
      expect(
        isSiteLaunched(),
        "ambient SITE_LAUNCHED=true was not actually in effect, so the assertion above proved nothing",
      ).toBe(true);
    } finally {
      if (previous === undefined) delete process.env.SITE_LAUNCHED;
      else process.env.SITE_LAUNCHED = previous;
    }
  });

  test("explicitly passing undefined reads the environment, not the argument", () => {
    // Encodes the trap so nobody puts `undefined` back into the value list:
    // under the default parameter, `isSiteLaunched(undefined)` is identical to
    // `isSiteLaunched()` and therefore tracks the environment.
    withLaunchFlag("true", () => {
      expect(isSiteLaunched(undefined)).toBe(true);
    });
    withLaunchFlag(undefined, () => {
      expect(isSiteLaunched(undefined)).toBe(false);
    });
  });

  test("opens only for the exact string \"true\"", () => {
    // Pinned unset, so the launched result can only come from the argument.
    withLaunchFlag(undefined, () => {
      expect(isSiteLaunched("true")).toBe(true);
    });
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
  // sitemap() is async: it may consult FeelStack for CMS-owned pages that have
  // no local route entry (src/app/sitemap.ts). In the default `static` content
  // mode that branch makes no network request and returns nothing, so these
  // assertions still cover the local-registry inventory exactly as before.
  test("publishes no URL inventory when unlaunched", async () => {
    expect(await withLaunchFlag(undefined, () => sitemap())).toEqual([]);
  });

  test("publishes the real route inventory once launched", async () => {
    const entries = await withLaunchFlag("true", () => sitemap());
    expect(entries.length).toBeGreaterThan(0);
    // Nothing may ever point at a temporary or runtime hostname.
    for (const entry of entries) {
      expect(entry.url).toContain("https://bluediamondmedical.ca/");
    }
  });
});
