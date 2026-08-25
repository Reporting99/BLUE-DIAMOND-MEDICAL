#!/usr/bin/env bash
# Parses the trusted stdout of /usr/local/sbin/deploy-blue-diamond and emits
# validated GITHUB_OUTPUT lines.
#
# Why this exists: the post-deploy verification used to learn the serving port
# by reading /home/blue-diamond/deployments/active-release.env over SSH. That
# file is deliberately root:blue-diamond 0640 and the deploy user is
# deliberately NOT in the runtime group, so the read failed with "Permission
# denied" and turned a fully successful release into a red workflow. The deploy
# script already announces where it landed on its own stdout; that is the
# trusted channel, and it needs no privilege the deploy user does not have.
#
# Fails closed. A missing, duplicated, malformed or mismatched value is an
# error, never a default: picking one of two contradictory answers is how a
# verification step ends up confirming the wrong slot.
#
# Usage: parse-deploy-output.sh <deploy-stdout-file> <requested-sha>
# Emits: active_port=<3030|3031>
#        active_slot=<blue|green>
#        release_sha=<40-hex>
set -euo pipefail

LOG_FILE="${1:?deploy stdout file required}"
REQUESTED_SHA="${2:?requested sha required}"

if [ ! -s "$LOG_FILE" ]; then
  echo "::error::Deploy produced no output to verify." >&2
  exit 1
fi

# Anchored so a value mentioned inside a log sentence cannot be mistaken for
# the declaration itself.
count_key() { grep -cE "^${1}=" "$LOG_FILE" || true; }
read_key() { grep -E "^${1}=" "$LOG_FILE" | head -n 1 | cut -d= -f2- | tr -d '\r'; }

for key in ACTIVE_PORT RELEASE_SHA ACTIVE_SLOT; do
  n="$(count_key "$key")"
  if [ "$n" -eq 0 ]; then
    echo "::error::Deploy output did not declare ${key}." >&2
    exit 1
  fi
  if [ "$n" -gt 1 ]; then
    echo "::error::Deploy output declared ${key} ${n} times; refusing to choose between them." >&2
    exit 1
  fi
done

ACTIVE_PORT="$(read_key ACTIVE_PORT)"
RELEASE_SHA="$(read_key RELEASE_SHA)"
ACTIVE_SLOT="$(read_key ACTIVE_SLOT)"

case "$ACTIVE_PORT" in
  3030|3031) ;;
  *)
    echo "::error::ACTIVE_PORT=${ACTIVE_PORT:-empty} is not a Blue Diamond slot port." >&2
    exit 1
    ;;
esac

case "$ACTIVE_SLOT" in
  blue|green) ;;
  *)
    echo "::error::ACTIVE_SLOT=${ACTIVE_SLOT:-empty} is not a Blue Diamond slot." >&2
    exit 1
    ;;
esac

# Slot and port must agree, or one of them is stale.
case "${ACTIVE_SLOT}:${ACTIVE_PORT}" in
  blue:3030|green:3031) ;;
  *)
    echo "::error::ACTIVE_SLOT=${ACTIVE_SLOT} does not match ACTIVE_PORT=${ACTIVE_PORT}." >&2
    exit 1
    ;;
esac

if ! printf '%s' "$RELEASE_SHA" | grep -qE '^[0-9a-f]{40}$'; then
  echo "::error::RELEASE_SHA=${RELEASE_SHA:-empty} is not a 40-character hex SHA." >&2
  exit 1
fi

if [ "$RELEASE_SHA" != "$REQUESTED_SHA" ]; then
  echo "::error::Deploy reported ${RELEASE_SHA} but ${REQUESTED_SHA} was requested." >&2
  exit 1
fi

if ! grep -qE '^DEPLOYMENT_SUCCESS$' "$LOG_FILE"; then
  echo "::error::Deploy output does not contain DEPLOYMENT_SUCCESS." >&2
  exit 1
fi

printf 'active_port=%s\n' "$ACTIVE_PORT"
printf 'active_slot=%s\n' "$ACTIVE_SLOT"
printf 'release_sha=%s\n' "$RELEASE_SHA"
