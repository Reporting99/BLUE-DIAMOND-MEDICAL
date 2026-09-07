import { test, expect } from "@playwright/test";
import { getRouteMetadata } from "../../src/lib/seo/metadata";
import { routes } from "../../src/lib/routing";
import { imageManifest } from "../../src/lib/media/image-manifest";
import { SEO_TEST_ORIGIN } from "../support/seo-test-origin";
import { locales } from "../../src/i18n/config";

/**
 * The page-metadata builder's contract, asserted directly rather than through
 * rendered HTML, so the UNCONFIGURED branch is testable — the harness server
 * always runs with an origin, so the no-domain state has no HTTP surface.
 */

const overrides = { description: { en: "Test description.", ar: "وصف تجريبي." } };

/**
 * The absolute URL a route SHOULD self-reference, trailing slash stripped.
 *
 * The homepage's registry path is "/", so a naive join gives "<origin>/en/",
 * which this app answers with a 308. absoluteRouteUrl normalises that away, so
 * the expectation has to as well — otherwise this file would contradict the
 * trailing-slash suite at the bottom of it.
 */
function expectedUrl(path: string, locale: string): string {
  const url = `${SEO_TEST_ORIGIN}/${locale}${path}`;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function withEnv<T>(vars: Record<string, string | undefined>, run: () => T): T {
  const previous = Object.fromEntries(Object.keys(vars).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return run();
  } finally {
    for (const [k, v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

const UNCONFIGURED = {
  SITE_URL: undefined,
  NEXT_PUBLIC_SITE_URL: undefined,
  INDEXING_ENABLED: undefined,
  SITE_LAUNCHED: undefined,
};
const CONFIGURED = {
  SITE_URL: SEO_TEST_ORIGIN,
  NEXT_PUBLIC_SITE_URL: undefined,
  INDEXING_ENABLED: "true",
  SITE_LAUNCHED: undefined,
};

test.describe("with no SITE_URL configured", () => {
  test("emits no canonical and no hreflang at all", () => {
    const metadata = withEnv(UNCONFIGURED, () => getRouteMetadata("home", "en", overrides));
    // Not "a relative canonical" — none. Next resolves a relative canonical
    // against metadataBase, which defaults to http://localhost:<port>.
    expect(metadata.alternates).toBeUndefined();
  });

  test("emits no absolute og:url", () => {
    const metadata = withEnv(UNCONFIGURED, () => getRouteMetadata("home", "en", overrides));
    expect(metadata.openGraph && "url" in metadata.openGraph).toBe(false);
  });

  test("still emits noindex, and still emits title and description", () => {
    const metadata = withEnv(UNCONFIGURED, () => getRouteMetadata("home", "en", overrides));
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBe(overrides.description.en);
  });

  test("no metadata value anywhere contains a host", () => {
    for (const locale of locales) {
      // A route with no OG image, so the only possible https value would be a
      // leaked site origin. (The homepage names an ImageKit asset, and an
      // ImageKit CDN URL is a legitimate https value that is not this site's
      // identity — testing it here would assert the wrong thing.)
      const metadata = withEnv(UNCONFIGURED, () => getRouteMetadata("contact", locale, overrides));
      const serialised = JSON.stringify(metadata);
      for (const needle of ["localhost", "127.0.0.1", "http://", "https://"]) {
        // ImageKit URLs are the one legitimate https value, and they are a CDN
        // asset host, not this site's identity — excluded by only running this
        // on a route with no OG image.
        expect(serialised, `unconfigured metadata must not contain ${needle}`).not.toContain(needle);
      }
    }
  });
});

test.describe("with a configured origin", () => {
  test("every route self-references its canonical in both locales", () => {
    for (const route of routes) {
      for (const locale of locales) {
        const metadata = withEnv(CONFIGURED, () => getRouteMetadata(route.id, locale, overrides));
        expect(metadata.alternates?.canonical).toBe(expectedUrl(route.path[locale], locale));
      }
    }
  });

  test("Arabic never canonicalises to English", () => {
    for (const route of routes) {
      const metadata = withEnv(CONFIGURED, () => getRouteMetadata(route.id, "ar", overrides));
      expect(String(metadata.alternates?.canonical)).toContain("/ar");
    }
  });

  test("hreflang is reciprocal, with x-default on the English URL", () => {
    for (const route of routes) {
      for (const locale of locales) {
        const languages = withEnv(CONFIGURED, () =>
          getRouteMetadata(route.id, locale, overrides),
        ).alternates?.languages as Record<string, string> | undefined;
        expect(languages?.["en-CA"]).toBe(expectedUrl(route.path.en, "en"));
        expect(languages?.["ar-CA"]).toBe(expectedUrl(route.path.ar, "ar"));
        expect(languages?.["x-default"]).toBe(languages?.["en-CA"]);
      }
    }
  });

  test("a noindex route stays noindex even with the gate fully open", () => {
    const noindexRoute = routes.find((r) => r.indexing === "noindex");
    expect(noindexRoute, "the registry should contain at least one noindex route").toBeTruthy();
    const metadata = withEnv(CONFIGURED, () => getRouteMetadata(noindexRoute!.id, "en", overrides));
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

test.describe("social metadata", () => {
  test("declares the alternate locale, matching the hreflang pair", () => {
    const en = withEnv(CONFIGURED, () => getRouteMetadata("home", "en", overrides));
    const ar = withEnv(CONFIGURED, () => getRouteMetadata("home", "ar", overrides));
    expect(en.openGraph?.locale).toBe("en_CA");
    expect((en.openGraph as { alternateLocale?: string }).alternateLocale).toBe("ar_CA");
    expect(ar.openGraph?.locale).toBe("ar_CA");
    expect((ar.openGraph as { alternateLocale?: string }).alternateLocale).toBe("en_CA");
  });

  test("never invents a Twitter/X account handle", () => {
    const metadata = withEnv(CONFIGURED, () => getRouteMetadata("home", "en", overrides));
    const twitter = metadata.twitter as Record<string, unknown> | undefined;
    expect(twitter?.site).toBeUndefined();
    expect(twitter?.creator).toBeUndefined();
  });

  test("falls back to a summary card when there is no approved OG image", () => {
    const metadata = withEnv(CONFIGURED, () =>
      getRouteMetadata("contact", "en", overrides),
    );
    expect((metadata.twitter as { card?: string }).card).toBe("summary");
    expect(metadata.openGraph && "images" in metadata.openGraph).toBe(false);
  });

  test("an OG image is emitted only for an APPROVED manifest asset", () => {
    // The homepage is the only route that names an og image. Whether it is
    // emitted must track that asset's approval status exactly — the same gate
    // the on-page <img> obeys — so a social card can never advertise bytes the
    // approval workflow has not released.
    const ogPath = "/blue-diamond/home/home-hero-blue-diamond.png";
    const asset = imageManifest.find((a) => a.path === ogPath);
    expect(asset, "the homepage OG asset must exist in the manifest").toBeTruthy();

    const metadata = withEnv(CONFIGURED, () => getRouteMetadata("home", "en", overrides));
    const hasImage = Boolean(metadata.openGraph && "images" in metadata.openGraph);
    expect(hasImage).toBe(asset!.status === "approved");
  });

  test("an emitted OG image carries the manifest alt text for its locale", () => {
    for (const locale of locales) {
      const metadata = withEnv(CONFIGURED, () => getRouteMetadata("home", locale, overrides));
      const images = (metadata.openGraph as { images?: { alt?: string }[] } | undefined)?.images;
      if (!images?.length) continue; // asset not approved — covered above
      const asset = imageManifest.find((a) => a.path === "/blue-diamond/home/home-hero-blue-diamond.png");
      expect(images[0].alt).toBe(asset!.alt[locale]);
    }
  });
});

/**
 * Trailing slashes.
 *
 * The homepage's registry path is "/", so joining it produced "<origin>/en/",
 * and this app serves with `trailingSlash: false` — "/en/" answers 308 to
 * "/en". The site's most important page therefore canonicalised through a
 * redirect, in both locales, and shipped two redirecting URLs in the sitemap.
 * Every other route's path starts with a real segment, which is why nothing
 * caught it.
 */
test.describe("no emitted URL ends in a trailing slash", () => {
  test("the homepage canonical is the bare locale root in both locales", () => {
    for (const locale of locales) {
      const metadata = withEnv(CONFIGURED, () => getRouteMetadata("home", locale, overrides));
      expect(metadata.alternates?.canonical).toBe(`${SEO_TEST_ORIGIN}/${locale}`);
    }
  });

  test("no canonical or hreflang URL on any route ends in a slash", () => {
    const offenders: string[] = [];
    for (const route of routes) {
      for (const locale of locales) {
        const metadata = withEnv(CONFIGURED, () => getRouteMetadata(route.id, locale, overrides));
        const urls = [
          String(metadata.alternates?.canonical ?? ""),
          ...Object.values((metadata.alternates?.languages ?? {}) as Record<string, string>),
        ];
        for (const url of urls) {
          // The origin itself is never emitted alone, so any trailing slash
          // here is a join artefact, not a root URL.
          if (url.endsWith("/")) offenders.push(`${route.id} (${locale}): ${url}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

/**
 * The approved-title override. Titles normally come from the route registry
 * and pick up the layout's `%s · Blue Diamond Medical` template; where the
 * client approved an exact string (/careers), it must be emitted verbatim.
 */
test.describe("client-approved exact titles", () => {
  const approved = { en: "Careers at Blue Diamond Medical | Join Our Team" };

  test("an approved locale gets an absolute title, opting out of the template", () => {
    const metadata = withEnv(CONFIGURED, () =>
      getRouteMetadata("careers", "en", { ...overrides, title: approved }),
    );
    expect(metadata.title).toEqual({ absolute: approved.en });
  });

  test("a locale with no approved title keeps the registry title", () => {
    const metadata = withEnv(CONFIGURED, () =>
      getRouteMetadata("careers", "ar", { ...overrides, title: approved }),
    );
    // A plain string still flows through the layout's title template, which is
    // what every un-overridden route does — no machine-translated title is
    // invented for Arabic just because English supplied one.
    expect(typeof metadata.title).toBe("string");
  });

  test("og:title and twitter:title match the approved title", () => {
    const metadata = withEnv(CONFIGURED, () =>
      getRouteMetadata("careers", "en", { ...overrides, title: approved }),
    );
    expect(metadata.openGraph?.title).toBe(approved.en);
    expect(metadata.twitter?.title).toBe(approved.en);
  });

  test("routes passing no override are completely unaffected", () => {
    const metadata = withEnv(CONFIGURED, () => getRouteMetadata("about", "en", overrides));
    expect(typeof metadata.title).toBe("string");
    expect(metadata.openGraph?.title).toBe(metadata.title);
  });
});
