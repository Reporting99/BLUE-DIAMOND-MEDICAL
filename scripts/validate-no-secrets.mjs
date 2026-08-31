#!/usr/bin/env node
// scripts/validate-no-secrets.mjs
//
// CI gate against committed secrets and against server-only values reaching the
// browser bundle. Four distinct failures, all easy to introduce and hard to
// catch in review:
//
//   1. A tracked .env file, or a secret value written into .env.example.
//      Anything that lands in either is in git history permanently.
//   2. A server-only variable referenced under a NEXT_PUBLIC_ name. Next.js
//      inlines every NEXT_PUBLIC_ variable into the client bundle at build
//      time, so this is not a theoretical exposure — it is publication.
//   3. A server-only variable read from a Client Component, which compiles
//      into that same bundle.
//   4. A credential-shaped literal committed anywhere in source.
//
// Plain Node with no dependencies, so it
// adds nothing to package.json and runs anywhere `node` does.
//
// Salvaged and adapted from the abandoned feat/feelstack-production-foundation
// branch (9c3b1b1), which was never merged. Two deliberate changes from that
// original:
//
//   * `.env.example` may carry values for explicitly approved PUBLIC keys.
//     The original enforced a names-only template, which this repo does not
//     follow: the ImageKit CDN endpoint, the FeelStack site key, the content
//     mode and the public site URL are all committed on purpose, because they
//     are public facts and the app already defaults to them in source. A
//     names-only rule would have failed on the very first run. The allowlist
//     below is the policy, and anything outside it still fails closed.
//   * A .env file is a failure only when it is TRACKED. The original failed
//     whenever one merely existed, which would fire on every developer machine
//     with a normal untracked .env.local.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const failures = [];

/**
 * Keys allowed to carry a value in .env.example.
 *
 * A key earns a place here only if its value is public by nature — something a
 * visitor could read off the site or a CDN URL anyway. Adding a key here is a
 * policy decision, so keep the reason with it.
 */
const PUBLIC_ENV_KEYS = new Map([
  ["NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT", "public CDN base; src/config/imagekit.ts defaults to it"],
  ["NEXT_PUBLIC_SITE_URL", "the public canonical origin"],
  ["FEELSTACK_SITE_KEY", "site identifier, not a credential; the frontend pins it"],
  ["FEELSTACK_CONTENT_MODE", "a mode name: static | hybrid | cms"],
]);

/**
 * Variables that must never be public. A NEXT_PUBLIC_ prefix on any of these,
 * or a read from a Client Component, ships it to the browser.
 */
const SERVER_ONLY_VARIABLES = [
  "IMAGEKIT_PRIVATE_KEY",
  "FEELSTACK_API_URL",
  "FEELSTACK_SITE_KEY",
  "FEELSTACK_REVALIDATE_SECRET",
  "FEELSTACK_CONTENT_MODE",
  "CONTACT_DELIVERY_PROVIDER",
  // Server-only on purpose: the pre-launch indexing gate must not be inlined
  // into the client bundle, or a build could be made indexable from the
  // browser side. See docs/DEPLOYMENT.md.
  "SITE_LAUNCHED",
];

/** Shapes that are credentials wherever they appear. */
const CREDENTIAL_PATTERNS = [
  { name: "GitHub token", pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { name: "AWS access key id", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "private key block", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: "Google API key", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: "Slack token", pattern: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { name: "Stripe live key", pattern: /\bsk_live_[0-9A-Za-z]{20,}\b/ },
  { name: "ImageKit private key", pattern: /\bprivate_[A-Za-z0-9+/]{20,}={0,2}\b/ },
];

// --- 1. no TRACKED env file, and .env.example carries public values only ----

let tracked = [];
try {
  tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean);
} catch {
  // Not a git checkout (a release artifact, say) — skip the tracked-file rule
  // rather than failing a build for a condition it cannot evaluate.
}

for (const file of tracked) {
  const base = path.basename(file);
  if (base === ".env.example") continue;
  if (base === ".env" || base.startsWith(".env.")) {
    failures.push(`${file} is tracked by git; environment files must never be committed.`);
  }
}

if (existsSync(".env.example")) {
  const lines = readFileSync(".env.example", "utf8").split("\n");
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separator = trimmed.indexOf("=");
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (value.length === 0) return; // names-only entry, always fine

    if (!PUBLIC_ENV_KEYS.has(key)) {
      failures.push(
        `.env.example:${index + 1} — ${key} carries a value but is not an approved public key. ` +
          `Either leave it empty, or add it to PUBLIC_ENV_KEYS in this script with a reason.`,
      );
      return;
    }

    // An approved key still must not carry something credential-shaped: the
    // allowlist grants "this key may have a value", not "anything goes here".
    for (const { name, pattern } of CREDENTIAL_PATTERNS) {
      if (pattern.test(value)) {
        failures.push(`.env.example:${index + 1} — ${key} contains what looks like a ${name}.`);
      }
    }
  });
}

// --- 2/3. server-only values must not be public, or read from the client ----

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, out);
    } else if (/\.(ts|tsx|mjs|js|jsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const sourceFiles = walk("src");

for (const file of sourceFiles) {
  const relative = path.relative(process.cwd(), file);
  const source = readFileSync(file, "utf8");

  for (const variable of SERVER_ONLY_VARIABLES) {
    if (source.includes(`NEXT_PUBLIC_${variable}`)) {
      failures.push(`${relative} references NEXT_PUBLIC_${variable}; that would ship it to the browser.`);
    }
  }

  // Only the directive at the top of a file creates a client boundary; the
  // string appearing in a comment lower down does not, and this repo has
  // several such comments explaining why a module is NOT a client component.
  const isClientComponent = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*|\s)*["']use client["']/.test(source);
  if (!isClientComponent) continue;

  for (const variable of SERVER_ONLY_VARIABLES) {
    if (new RegExp(`process\\.env\\.${variable}\\b`).test(source)) {
      failures.push(`${relative} is a Client Component and reads ${variable}.`);
    }
  }

  // Any non-public env read in a Client Component is inlined and public.
  for (const match of source.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g)) {
    const name = match[1];
    if (!name.startsWith("NEXT_PUBLIC_")) {
      failures.push(
        `${relative} is a Client Component and reads process.env.${name}; ` +
          `only NEXT_PUBLIC_ variables may be read from the client.`,
      );
    }
  }
}

// --- 4. no credential-shaped literal anywhere in source -------------------

for (const file of [...sourceFiles, ...walk("scripts"), ...walk("tests"), ...walk("ops")]) {
  const relative = path.relative(process.cwd(), file);
  const source = readFileSync(file, "utf8");
  for (const { name, pattern } of CREDENTIAL_PATTERNS) {
    if (pattern.test(source)) {
      failures.push(`${relative} appears to contain a ${name}.`);
    }
  }
}

// --- report ----------------------------------------------------------------

if (failures.length > 0) {
  console.error("Secret validation FAILED:\n");
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("");
  process.exit(1);
}

console.log("No secrets detected.");
