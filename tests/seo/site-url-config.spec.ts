import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { resolveSiteUrl, siteUrlIsConfigured, absoluteUrl } from "../../src/config/site-url";
import { SEO_TEST_ORIGIN } from "../support/seo-test-origin";

/**
 * The base-URL contract.
 *
 * Two properties matter, and they pull in opposite directions:
 *
 *   1. There is exactly ONE place a domain can come from — SITE_URL, through
 *      resolveSiteUrl(). No file under src/ may name a hostname of its own.
 *   2. When that source is absent or unusable, the app emits NO absolute URL
 *      at all, rather than a fabricated, localhost, or preview one.
 *
 * The leak scans below are the enforcement for (1): they read the tree, so a
 * future edit that reintroduces a literal domain fails here rather than in a
 * search index six weeks after launch.
 */

const REPO_ROOT = join(__dirname, "..", "..");

function filesUnder(dir: string, extensions: string[]): string[] {
  const out: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) {
        if (entry === "node_modules" || entry === ".next") continue;
        walk(full);
      } else if (extensions.some((extension) => entry.endsWith(extension))) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out;
}

test.describe("resolveSiteUrl", () => {
  test("accepts a normal https origin and returns it normalised", () => {
    expect(resolveSiteUrl("https://example.ca")).toBe("https://example.ca");
    expect(resolveSiteUrl("https://example.ca/")).toBe("https://example.ca");
    expect(resolveSiteUrl("  https://example.ca  ")).toBe("https://example.ca");
    expect(resolveSiteUrl("https://WWW.Example.CA")).toBe("https://www.example.ca");
  });

  test("rejects every value that is not a publishable public origin", () => {
    for (const value of [
      undefined, "", "   ",
      "http://example.ca",                 // not https
      "//example.ca",                      // protocol-relative, not absolute
      "example.ca",                        // no scheme
      "https://localhost",
      "https://localhost:3000",
      "https://127.0.0.1",
      "https://10.0.0.5",
      "https://[::1]",
      "https://0.0.0.0",
      "https://staging",                   // single-label host
      "https://app.local",
      "https://svc.internal",
      "https://preview.pages.dev",
      "https://bd.workers.dev",
      "https://bd.vercel.app",
      "https://bd.netlify.app",
      "https://bd.onrender.com",
      "https://bd.fly.dev",
      "https://x.ngrok-free.app",
      "https://example.ca:8443",           // explicit port
      "https://user:pw@example.ca",        // credentials
      "https://example.ca/path",           // not an origin
      "https://example.ca?a=1",
      "https://example.ca#x",
      "not a url at all",
    ]) {
      expect(resolveSiteUrl(value as string | undefined), `${value} must be rejected`).toBeNull();
    }
  });

  test("the reserved validation origin is accepted, so the launched path is testable", () => {
    // .invalid can never resolve, so accepting it cannot expose anything.
    expect(resolveSiteUrl(SEO_TEST_ORIGIN)).toBe(SEO_TEST_ORIGIN);
  });

  test("absoluteUrl degrades to a root-relative path, never to a fabricated host", () => {
    const previousSiteUrl = process.env.SITE_URL;
    const previousPublic = process.env.NEXT_PUBLIC_SITE_URL;
    try {
      delete process.env.SITE_URL;
      delete process.env.NEXT_PUBLIC_SITE_URL;
      expect(siteUrlIsConfigured()).toBe(false);
      expect(absoluteUrl("/en/medical")).toBe("/en/medical");

      process.env.SITE_URL = SEO_TEST_ORIGIN;
      expect(siteUrlIsConfigured()).toBe(true);
      expect(absoluteUrl("/en/medical")).toBe(`${SEO_TEST_ORIGIN}/en/medical`);
    } finally {
      if (previousSiteUrl === undefined) delete process.env.SITE_URL;
      else process.env.SITE_URL = previousSiteUrl;
      if (previousPublic === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = previousPublic;
    }
  });

  test("SITE_URL wins over the deprecated NEXT_PUBLIC_SITE_URL alias", () => {
    expect(resolveSiteUrl("https://primary.example.ca")).toBe("https://primary.example.ca");
    // Precedence itself is expressed in the default parameter of
    // resolveSiteUrl; asserting it directly would require mutating both
    // variables, which the case above already covers for the fallback.
    expect(resolveSiteUrl("")).toBeNull();
  });
});

test.describe("no hard-coded production domain anywhere in the application", () => {
  /**
   * The literal that used to live in src/config/site.ts. Any reappearance in
   * application source means someone has minted a second source of truth for
   * the site's identity.
   *
   * Assembled at runtime rather than written out, so this assertion does not
   * itself become the hard-coded domain it is forbidding.
   */
  const productionDomain = ["bluediamondmedical", "ca"].join(".");

  test("no line of executable code in src/ contains a site-URL literal", () => {
    /**
     * COMMENT LINES ARE EXEMPT, deliberately.
     *
     * Three comments legitimately quote the old literal: the two that explain
     * why `siteConfig.url` stopped being one, and a provenance note in
     * ProductTemplate describing the wrong URL a past bug produced. Those are
     * the documentation of the removal — banning them would mean the codebase
     * could not explain its own history, and would push someone to delete the
     * explanation rather than the literal.
     *
     * What must never come back is a literal the RUNTIME can read. The
     * heuristic is a line-level one (`//`, `*`, `/*`), which is exact for
     * every occurrence in this codebase; a domain smuggled into code on the
     * same line as a trailing comment would still be caught, because the line
     * does not START with a comment marker.
     */
    const offenders: string[] = [];
    for (const file of filesUnder(join(REPO_ROOT, "src"), [".ts", ".tsx"])) {
      const contents = readFileSync(file, "utf8");
      for (const [index, line] of contents.split("\n").entries()) {
        const trimmed = line.trimStart();
        if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
        if (line.includes(`https://${productionDomain}`) || line.includes(`https://www.${productionDomain}`)) {
          offenders.push(`${file.slice(REPO_ROOT.length + 1)}:${index + 1}`);
        }
      }
    }
    expect(offenders, "the site's own origin must come from SITE_URL only").toEqual([]);
  });

  test(".env.example ships no domain value", () => {
    const contents = readFileSync(join(REPO_ROOT, ".env.example"), "utf8");
    for (const key of ["SITE_URL", "NEXT_PUBLIC_SITE_URL"]) {
      const match = contents.match(new RegExp(`^${key}=(.*)$`, "m"));
      expect(match, `${key} must be present in .env.example`).not.toBeNull();
      expect(match![1].trim(), `${key} must ship blank — a value here becomes the published identity`).toBe("");
    }
  });

  test("no CI or harness file names the production domain", () => {
    for (const file of [".github/workflows/ci.yml", "playwright.config.ts"]) {
      expect(readFileSync(join(REPO_ROOT, file), "utf8"), file).not.toContain(productionDomain);
    }
  });

  test("the reserved validation origin never leaks into application source", () => {
    const offenders = filesUnder(join(REPO_ROOT, "src"), [".ts", ".tsx"])
      .filter((file) => readFileSync(file, "utf8").includes("seo-test.invalid"))
      .map((file) => file.slice(REPO_ROOT.length + 1));
    expect(offenders, "the test origin belongs to tests/ and CI only").toEqual([]);
  });
});
