import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright's own generated output. Both are gitignored, so they can
    // never be committed, but `eslint .` still walks them whenever a run has
    // left them behind -- 257 errors from minified trace-viewer bundles that
    // are not this repository's code. CI only escapes it because lint happens
    // to run before Playwright.
    "playwright-report/**",
    "test-results/**",
    // vinext's Cloudflare Worker build output (gitignored). Same problem as
    // the Playwright directories above: `eslint .` walks it whenever a build
    // has left it behind, and the bundles are large enough that ESLint's
    // stylish formatter dies with "RangeError: Invalid string length" before
    // it can print anything -- so the lint step fails on generated code that
    // is not this repository's source.
    "dist/**",
    ".vinext/**",
  ]),
]);

export default eslintConfig;
