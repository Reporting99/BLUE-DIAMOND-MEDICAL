import { test, expect } from "@playwright/test";

/**
 * Malformed URLs must never be a 500.
 *
 * Reproduced against the deployed green slot on 2026-08-26 before the guard
 * in src/proxy.ts:
 *
 *   /en/%%%%    -> 500, and nothing in the journal. It fails inside Next's
 *                 own request handling, so no route or error boundary in
 *                 this app could have caught it.
 *   /en/a%00b   -> 500, and this one IS in the journal:
 *                   Failed to update prerender cache for /en/a\x00b
 *                   TypeError [ERR_INVALID_ARG_VALUE]: The argument 'path'
 *                   must be a string, Uint8Array, or URL without null bytes.
 *                   Received '…/.next/server/app/en/a\x00b.segments'
 *                 Rendering SUCCEEDED; the 500 came from writing the
 *                 prerender cache to a filename containing a NUL byte.
 *
 * A 5xx here is worse than cosmetic: it is what monitoring pages on, and a
 * crawler that hits one treats the site as unhealthy rather than the URL as
 * bad. These are malformed URIs, not missing pages, so they are a 400.
 */

const MALFORMED = [
  ["bare percent signs", "/en/%%%%"],
  ["truncated Arabic escape", "/ar/%D8%"],
  ["lone percent", "/en/%"],
  ["invalid escape characters", "/en/%zz"],
  ["encoded NUL byte", "/en/a%00b"],
  ["malformed at the root", "/%%%%"],
  ["incomplete multi-byte escape", "/en/foo%E0%A4A"],
  ["encoded CR LF", "/en/a%0d%0ab"],
];

for (const [label, path] of MALFORMED) {
  test(`${label} (${path}) is refused, never a 500`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(
      response.status(),
      `${path} must not produce a server error`,
    ).toBeLessThan(500);
    expect(response.status()).toBe(400);
  });
}

/**
 * The guard runs on the RAW pathname before anything else, so the risk it
 * carries is over-rejection. These pin the shapes that must keep working —
 * in particular Arabic, which reaches the proxy percent-encoded and is the
 * whole point of the canonical route set.
 */
const VALID = [
  ["English locale root", "/en", 200],
  ["Arabic locale root", "/ar", 200],
  ["English canonical page", "/en/aesthetics/concerns/acne-scars", 200],
  [
    "percent-encoded Arabic canonical",
    "/ar/%D8%A7%D9%84%D8%AA%D8%AC%D9%85%D9%8A%D9%84-%D8%A7%D9%84%D8%B7%D8%A8%D9%8A/%D8%A7%D9%84%D9%85%D8%AE%D8%A7%D9%88%D9%81-%D8%A7%D9%84%D8%AC%D9%85%D8%A7%D9%84%D9%8A%D8%A9/%D9%86%D8%AF%D8%A8%D8%A7%D8%AA-%D8%AD%D8%A8-%D8%A7%D9%84%D8%B4%D8%A8%D8%A7%D8%A8",
    200,
  ],
  ["unknown path is still a real 404", "/en/genuinely-not-a-page", 404],
  ["unknown Arabic path is still a real 404", "/ar/%D9%84%D8%A7-%D9%8A%D9%88%D8%AC%D8%AF", 404],
] as const;

for (const [label, path, expected] of VALID) {
  test(`${label} is unaffected by the guard`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(expected);
  });
}

test("a Latin Arabic alias still redirects in exactly one hop", async ({
  request,
}) => {
  // The guard sits above the legacy/alias lookup, so a regression there
  // would silently disable every Arabic alias redirect.
  const response = await request.get("/ar/aesthetics/concerns/acne-scars", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(301);
  const location = response.headers()["location"];
  expect(location).toBeTruthy();

  const next = await request.get(location, { maxRedirects: 0 });
  expect(next.status(), "the destination must not redirect again").toBe(200);
});

test("query strings survive the guard untouched", async ({ request }) => {
  const response = await request.get("/en?utm_source=audit", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(200);
});
