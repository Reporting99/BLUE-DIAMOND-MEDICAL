#!/usr/bin/env bash
# Fails if the deploy workflow has regained the ability to build the app.
#
# BUILD ONCE, DEPLOY ONCE is a property of the pipeline, not of a document. The
# defect this repository actually suffered was a second `npm ci && next build`
# inside .github/workflows/deploy-production.yml, rebuilding a SHA that CI had
# already built and tested and re-resolving live FeelStack content while doing
# it -- so a transient CMS timeout could fail a release that was already proven
# green. Removing those steps fixes it once; this script is what stops them
# coming back, because "we removed it" is not an invariant and a comment is not
# a gate.
#
# WHAT IS FORBIDDEN: building or installing THIS APPLICATION in the deploy
# workflow -- `next build`, `npm run build`, `npm ci`, `npm install`, `yarn
# install`, `pnpm install`, `npm run validate`.
#
# WHAT IS NOT: npm in general. Installing a distributed CLI tool (`npm install
# -g <tool>`, `npx <tool>`) is fine and deliberately still allowed -- the point
# is the application's own build, not the package manager. A line may also opt
# out explicitly with the marker below, which forces the exemption to be
# written down and reviewed rather than assumed:
#
#     # allow-build-command: <reason>
#
# Usage: scripts/assert-no-app-build.sh [workflow ...]
set -euo pipefail

WORKFLOWS=("$@")
if [ ${#WORKFLOWS[@]} -eq 0 ]; then
  WORKFLOWS=(".github/workflows/deploy-production.yml")
fi

# Anchored to a command position (start of line, after a pipe/;/&&, or after a
# YAML `run:`) so that prose in a comment -- this file is full of it, and so is
# the workflow -- cannot trip the guard. Comment lines are stripped first
# regardless.
FORBIDDEN_PATTERN='(^|[|;&]|run:[[:space:]]*)[[:space:]]*(npx[[:space:]]+next[[:space:]]+build|next[[:space:]]+build|npm[[:space:]]+(ci|install)([[:space:]]|$)|npm[[:space:]]+run[[:space:]]+(build|validate)|yarn[[:space:]]+(install|build)|pnpm[[:space:]]+(install|build))'

status=0

for workflow in "${WORKFLOWS[@]}"; do
  if [ ! -f "$workflow" ]; then
    echo "::error::$workflow does not exist."
    status=1
    continue
  fi

  # `-n` keeps the original line numbers through the comment strip, so the
  # error names the line a human has to open.
  offenders="$(
    grep -n '' "$workflow" \
      | grep -v 'allow-build-command:' \
      | grep -vE 'npm[[:space:]]+install[[:space:]]+(-g|--global)([[:space:]]|$)' \
      | sed 's/^\([0-9]*\):[[:space:]]*#.*$/\1:/' \
      | grep -E "[0-9]+:.*${FORBIDDEN_PATTERN}" || true
  )"

  if [ -n "$offenders" ]; then
    echo "::error::$workflow builds or installs the application. The deployable"
    echo "::error::artifact is produced ONCE by ci.yml (job release-artifact) and only"
    echo "::error::downloaded here. See docs/RELEASE_ARCHITECTURE_AUDIT.md."
    printf '%s\n' "$offenders" | while IFS= read -r line; do
      echo "  ${workflow}:${line}"
    done
    status=1
  else
    echo "ok: $workflow contains no application build or install command"
  fi
done

# The positive half of the invariant: the deploy workflow must actually consume
# a CI-produced artifact. A workflow that neither builds nor downloads anything
# would pass the check above while deploying nothing at all.
DEPLOY_WORKFLOW=".github/workflows/deploy-production.yml"
if [ -f "$DEPLOY_WORKFLOW" ]; then
  for required in "gh run download" "sha256sum -c" "release-\${RELEASE_SHA}"; do
    if ! grep -qF -- "$required" "$DEPLOY_WORKFLOW"; then
      echo "::error::$DEPLOY_WORKFLOW no longer contains '${required}' -- it must download and verify the CI artifact."
      status=1
    fi
  done
  [ "$status" -eq 0 ] && echo "ok: $DEPLOY_WORKFLOW downloads and verifies the CI-built artifact"
fi

exit "$status"
