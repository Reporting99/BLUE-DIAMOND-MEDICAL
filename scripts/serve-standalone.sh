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

exec env PORT="$PORT" HOSTNAME="$HOSTNAME" node .next/standalone/server.js
