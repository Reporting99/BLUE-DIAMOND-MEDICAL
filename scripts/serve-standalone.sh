#!/usr/bin/env bash
# Builds (unless told not to) and serves this app the way PRODUCTION serves
# it: the Next.js standalone server, `node .next/standalone/server.js`.
#
# Why this exists: next.config.ts sets `output: "standalone"`, and Next warns
# on every run that `next start` "does not work with output: standalone".
# The Playwright harness used `next start` anyway, and the resulting server
# intermittently 500'd with
#   Invariant: The client reference manifest for route "…" does not exist
# on exactly the routes whose client manifests standalone packaging places
# elsewhere. That turned a green suite red for reasons that had nothing to
# do with the application, and — worse — meant the suite was never exercising
# the server shape production actually runs.
#
# The copy steps below mirror scripts/package-standalone.sh, deliberately:
# `next build` does not place .next/static (or public/) inside
# .next/standalone, so both the release artifact and this script have to.
#
# Usage: scripts/serve-standalone.sh [--no-build]
# Env:   PORT (default 3457), HOSTNAME (default 127.0.0.1)
set -euo pipefail

PORT="${PORT:-3457}"
HOSTNAME="${HOSTNAME:-127.0.0.1}"

if [ "${1:-}" != "--no-build" ]; then
  # Clear the previous standalone bundle FIRST. `next build` regenerates it,
  # but it does not guarantee removing prerendered HTML that a later build no
  # longer produces -- and a stale .next/standalone/.next/server is invisible:
  # every route still returns 200, from the PREVIOUS build's markup. That cost
  # a full CL-033 verification cycle, where the suite reported the Aesthetics
  # split hero missing on every route while the freshly built
  # .next/server/app/en/aesthetics.html contained it. Only the copy the
  # harness actually serves was old.
  #
  # Deliberately not done under --no-build: there the caller has already built
  # and this directory is the artifact under test.
  rm -rf .next/standalone
  npm run build
fi

test -f .next/standalone/server.js
test -s .next/BUILD_ID
test -d .next/static

rm -rf .next/standalone/.next/static
mkdir -p .next/standalone/.next/static
cp -RL --preserve=mode,timestamps .next/static/. .next/standalone/.next/static/

if [ -d public ]; then
  rm -rf .next/standalone/public
  mkdir -p .next/standalone/public
  cp -RL --preserve=mode,timestamps public/. .next/standalone/public/
fi

# package-standalone.sh installs BUILD_ID beside the server; mirror it, or the
# harness runs a layout production never ships.
install -m 644 .next/BUILD_ID .next/standalone/.next/BUILD_ID

# Give the standalone server the same environment `next start` would give it.
#
# `next build` loads .env.local, so the prerendered HTML is built WITH the CMS
# configured. The standalone server does not: it starts with whatever the shell
# hands it. Every page then re-renders at request time -- these routes carry
# `s-maxage=45`, so a suite running longer than that revalidates them -- against
# an unconfigured client, which resolves no CMS media at all. The routes still
# return 200, so it presents as content quietly disappearing partway through a
# run rather than as an error: the CL-033 Aesthetics split heroes were present
# on a freshly built page and gone by the time the suite reached them.
#
# Production passes real environment variables to this same server, so loading
# the local env file here is what makes the harness match it.
# Existing variables WIN, which is what `next start` does and what the harness
# needs: playwright.config.ts passes SITE_LAUNCHED=true to exercise launched
# behaviour, and sourcing the file wholesale would quietly overwrite it with the
# repository's own SITE_LAUNCHED=false -- emptying robots.txt and the sitemap
# for the three tests that assert them.
load_env_file() {
  [ -f "$1" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ""|\#*) continue ;; esac
    case "$line" in *=*) ;; *) continue ;; esac
    key=${line%%=*}
    value=${line#*=}
    case "$key" in *[!A-Za-z0-9_]*) continue ;; esac
    if [ -z "$(eval "printf '%s' \"\${$key:-}\"")" ]; then
      export "$key=$value"
    fi
  done < "$1"
}
load_env_file .env
load_env_file .env.local

exec env PORT="$PORT" HOSTNAME="$HOSTNAME" node .next/standalone/server.js
