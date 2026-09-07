import { test, expect } from "@playwright/test";
import { isSiteLaunched, isIndexingEnabled, PRE_LAUNCH_ROBOTS_HEADER } from "../../src/config/launch";
import { SEO_TEST_ORIGIN } from "../support/seo-test-origin";
// Static imports: both modules read the gate inside their exported function,
// so the flag is evaluated per call and a top-level import is enough. (A
// dynamic import() is not transpiled by the Playwright runner.)
import robots from "../../src/app/robots";
import sitemap from "../../src/app/sitemap";
import { getRouteMetadata } from "../../src/lib/seo/metadata";

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
function setEnv(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function withEnv<T>(vars: Record<string, string | undefined>, run: () => T): T {
  const previous = Object.fromEntries(
    Object.keys(vars).map((key) => [key, process.env[key]]),
  );
  for (const [key, value] of Object.entries(vars)) setEnv(key, value);
  try {
    return run();
  } finally {
    for (const [key, value] of Object.entries(previous)) setEnv(key, value);
  }
}

/**
 * Runs `run` with the indexing flag forced to a given state AND a valid origin
 * present, so `value` is the only thing under test.
 *
 * Indexing now requires BOTH halves (src/config/launch.ts), so a helper that
 * set only the flag would make every "launched" assertion below fail for the
 * wrong reason — missing SITE_URL rather than the behaviour being asserted.
 * The origin is the reserved .invalid one, never a real domain.
 *
 * INDEXING_ENABLED is pinned too: it takes precedence over SITE_LAUNCHED, so
 * an ambient value in the runner's environment would otherwise silently
 * override the flag this helper is trying to set.
 */
function withLaunchFlag<T>(value: string | undefined, run: () => T): T {
  return withEnv(
    { SITE_LAUNCHED: value, INDEXING_ENABLED: undefined, SITE_URL: SEO_TEST_ORIGIN },
    run,
  );
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

/**
 * The gate is NOT request-time everywhere, and the difference is what makes a
 * launch silently fail.
 *
 * `robots.txt`, `sitemap.xml` and the `X-Robots-Tag` header are evaluated per
 * request, so flipping SITE_LAUNCHED on a running server changes them
 * immediately. Page `<meta robots>` is not: it comes from `getRouteMetadata`,
 * which runs during static generation, so the value is fixed in the build
 * artifact. An operator who sets SITE_LAUNCHED=true at runtime alone gets an
 * open robots.txt, a populated sitemap and no noindex header — and every page
 * still carrying `noindex, nofollow` in its HTML.
 *
 * See docs/DEPLOYMENT.md §3 for the layer table and the launch procedure.
 */
test.describe("meta robots is decided at generation time, not per request", () => {
  const overrides = { description: { en: "test", ar: "test" } };

  test("tracks the flag as it stood when the metadata was generated", () => {
    const generatedUnlaunched = withLaunchFlag(undefined, () =>
      getRouteMetadata("home", "en", overrides),
    );
    const generatedLaunched = withLaunchFlag("true", () =>
      getRouteMetadata("home", "en", overrides),
    );

    expect(generatedUnlaunched.robots).toEqual({ index: false, follow: false });
    expect(generatedLaunched.robots).toEqual({ index: true, follow: true });
  });

  test("a later flag change cannot alter metadata that was already generated", () => {
    // This is the whole point: for a statically generated page this object is
    // rendered into HTML during `npm run build`. Launching therefore requires
    // setting SITE_LAUNCHED in the BUILD environment and rebuilding — never a
    // runtime-only change.
    const baked = withLaunchFlag(undefined, () => getRouteMetadata("home", "en", overrides));

    withLaunchFlag("true", () => {
      expect(baked.robots).toEqual({ index: false, follow: false });
    });
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
    // Every entry is absolute, https, and on the CONFIGURED origin — asserted
    // against whatever SITE_URL was injected rather than against a hostname
    // written into this file. A test that pins the production domain is itself
    // a hard-coded production domain.
    for (const entry of entries) {
      expect(entry.url.startsWith(`${SEO_TEST_ORIGIN}/`)).toBe(true);
    }
  });
});

/**
 * The gate is the flag AND a valid public origin.
 *
 * Splitting these is what stops a deployment from becoming crawlable as a side
 * effect of an unrelated configuration change. Setting SITE_URL is something an
 * operator might do while wiring up a staging host; it must not, on its own,
 * publish a sitemap. And the flag without an origin would publish canonical
 * tags and sitemap entries with no trustworthy host in them.
 */
test.describe("indexing requires both the flag and a valid origin", () => {
  test("the flag alone is not enough", () => {
    withEnv({ SITE_LAUNCHED: "true", INDEXING_ENABLED: undefined, SITE_URL: undefined, NEXT_PUBLIC_SITE_URL: undefined }, () => {
      expect(isSiteLaunched()).toBe(true); // the flag really is set
      expect(isIndexingEnabled()).toBe(false); // and it still is not enough
    });
  });

  test("a valid origin alone is not enough", () => {
    withEnv({ SITE_LAUNCHED: undefined, INDEXING_ENABLED: undefined, SITE_URL: SEO_TEST_ORIGIN }, () => {
      expect(isIndexingEnabled()).toBe(false);
    });
  });

  test("both together open the gate", () => {
    withEnv({ SITE_LAUNCHED: undefined, INDEXING_ENABLED: "true", SITE_URL: SEO_TEST_ORIGIN }, () => {
      expect(isIndexingEnabled()).toBe(true);
    });
  });

  test("INDEXING_ENABLED takes precedence over the SITE_LAUNCHED alias", () => {
    withEnv({ INDEXING_ENABLED: "false", SITE_LAUNCHED: "true", SITE_URL: SEO_TEST_ORIGIN }, () => {
      expect(isIndexingEnabled()).toBe(false);
    });
  });

  test("an origin the resolver rejects cannot open the gate", () => {
    // Each of these is a hostname someone could plausibly paste in during a
    // staging bring-up. None is a publishable canonical identity.
    for (const origin of [
      "http://bluediamond.example.ca",  // not https
      "https://localhost",
      "https://127.0.0.1",
      "https://192.168.1.10",
      "https://bd-preview.pages.dev",
      "https://bd.workers.dev",
      "https://bd.vercel.app",
      "https://staging",                // single-label host
      "https://example.ca:8443",        // explicit port
      "https://example.ca/site",        // not an origin
      "not-a-url",
      "",
    ]) {
      withEnv({ INDEXING_ENABLED: "true", SITE_LAUNCHED: undefined, SITE_URL: origin }, () => {
        expect(isIndexingEnabled(), `${origin} must not be accepted as a canonical origin`).toBe(false);
      });
    }
  });
});
