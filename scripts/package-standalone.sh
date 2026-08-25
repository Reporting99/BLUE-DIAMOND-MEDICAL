#!/usr/bin/env bash
# Packages a Next.js standalone build into the release artifact the deploy
# workflow ships.
#
# Lives in the repository rather than inline in the workflow so it can be run
# and tested BEFORE pushing. It previously existed only inside
# deploy-production.yml, which is why a repository/workflow mismatch --
# asserting a public/ directory this app does not have -- could only ever be
# discovered by a failed production deployment.
#
# Usage:  scripts/package-standalone.sh <release-sha> <output-dir>
# Emits:  <output-dir>/blue-diamond-<sha>.tar.gz  and prints artifact metadata.
set -euo pipefail

RELEASE_SHA="${1:?release sha required}"
OUT_DIR="${2:?output dir required}"

RELEASE_DIR="${OUT_DIR}/blue-diamond-release"
ARTIFACT_NAME="blue-diamond-${RELEASE_SHA}.tar.gz"
ARTIFACT_PATH="${OUT_DIR}/${ARTIFACT_NAME}"

rm -rf "$RELEASE_DIR"
rm -f "$ARTIFACT_PATH"
mkdir -p "$RELEASE_DIR"

test -d .next/standalone
test -f .next/standalone/server.js
test -s .next/BUILD_ID
test -d .next/static
# public/ is deliberately NOT asserted. It is optional in Next.js, and this app
# genuinely has none: its only static asset is src/app/favicon.ico, served
# through the App Router file convention. The currently deployed release has no
# public/ directory either and serves correctly. Asserting it here is what made
# Deploy Production fail at this step under `set -e`.

# -L dereferences symlinks: the server-side script rejects any archive
# containing a link, because extracting one as root is a write primitive
# outside the release directory.
cp -RL --preserve=mode,timestamps .next/standalone/. "$RELEASE_DIR/"

# `next build` with output: "standalone" does NOT copy these; they have to be
# placed alongside the server explicitly.
rm -rf "$RELEASE_DIR/.next/static"
mkdir -p "$RELEASE_DIR/.next/static"
cp -RL --preserve=mode,timestamps .next/static/. "$RELEASE_DIR/.next/static/"

rm -rf "$RELEASE_DIR/public"
if [ -d public ]; then
  mkdir -p "$RELEASE_DIR/public"
  cp -RL --preserve=mode,timestamps public/. "$RELEASE_DIR/public/"
fi

install -m 644 .next/BUILD_ID "$RELEASE_DIR/.next/BUILD_ID"

# The release identity /api/version reports and the deploy script verifies.
printf '%s\n' "$RELEASE_SHA" > "$RELEASE_DIR/.release-sha"

# Runtime secrets stay on the server. A release artifact must never carry
# configuration, or a rollback would restore stale configuration with old code.
rm -f "$RELEASE_DIR/.env" "$RELEASE_DIR/.env.production" "$RELEASE_DIR/.env.local"

test -f "$RELEASE_DIR/server.js"
test -s "$RELEASE_DIR/.next/BUILD_ID"
test -d "$RELEASE_DIR/.next/static"
test -s "$RELEASE_DIR/.release-sha"
# Mirrors the copy above: only required when the source tree has one.
if [ -d public ]; then test -d "$RELEASE_DIR/public"; fi

EXTRACTED_SHA="$(tr -d '\r\n' < "$RELEASE_DIR/.release-sha")"
if [ "$EXTRACTED_SHA" != "$RELEASE_SHA" ]; then
  echo "::error::Release SHA verification failed." >&2
  exit 1
fi

if find "$RELEASE_DIR" \( -type l -o -type b -o -type c -o -type p -o -type s \) -print -quit | grep -q .; then
  echo "::error::Release contains symbolic links or unsupported file types." >&2
  exit 1
fi

node --check "$RELEASE_DIR/server.js"

tar -czf "$ARTIFACT_PATH" -C "$RELEASE_DIR" .
gzip -t "$ARTIFACT_PATH"

ARTIFACT_SIZE="$(stat -c '%s' "$ARTIFACT_PATH")"
ARTIFACT_SHA256="$(sha256sum "$ARTIFACT_PATH" | awk '{print $1}')"

if [ "$ARTIFACT_SIZE" -le 0 ] || [ "$ARTIFACT_SIZE" -gt 2147483648 ]; then
  echo "::error::Artifact size is invalid or exceeds 2 GiB." >&2
  exit 1
fi

echo "Artifact: $ARTIFACT_NAME ($ARTIFACT_SIZE bytes, sha256 $ARTIFACT_SHA256)"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  {
    echo "artifact_path=$ARTIFACT_PATH"
    echo "artifact_name=$ARTIFACT_NAME"
    echo "artifact_sha256=$ARTIFACT_SHA256"
  } >> "$GITHUB_OUTPUT"
fi
