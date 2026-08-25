#!/usr/bin/env bash
# Runs Playwright and preserves its REAL exit code even when the log is shortened.
#
# Why this exists: a local run was reported as "1234 passed" and merged toward
# CI as if green, because the command was piped straight into `tail`. A pipe
# returns the exit status of its LAST element, so tail's 0 masked Playwright's
# 1 -- and `tail -12` also cut off the "86 failed" summary line, which sits
# ABOVE the flaky/skipped/passed lines. The run had 86 failures.
#
# Never pipe the test command directly into a pager or tail. Write the full log
# to a file, capture the status, then shorten for display.
set -uo pipefail

LOG_FILE="${PLAYWRIGHT_LOG:-/tmp/bd-playwright-full.log}"
TAIL_LINES="${PLAYWRIGHT_TAIL:-50}"

set +e
npx playwright test "$@" > "$LOG_FILE" 2>&1
status=$?
set -e

echo "----- last ${TAIL_LINES} lines of ${LOG_FILE} -----"
tail -n "$TAIL_LINES" "$LOG_FILE"
echo "-------------------------------------------------"

# Surface the counts explicitly, wherever they appear in the log.
grep -E '^[[:space:]]+[0-9]+[[:space:]]+(passed|failed|flaky|skipped|did not run)' "$LOG_FILE" || true

echo "PLAYWRIGHT_EXIT=${status}"
exit "$status"
