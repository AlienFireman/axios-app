#!/usr/bin/env bash
# Template for an update migration. Copy to `NNN-slug.sh` (e.g. 001-regenerate-caddy.sh)
# to make it run. This file's name does not match the runner's pattern, so it never runs.
#
# Contract (see README.md): runs ONCE per install, cwd = install root, .env.local present,
# bundled node on PATH. Exit 0 = success (recorded); non-zero halts + retries next update.
# MUST be idempotent and own its own safety (validate-before-swap for service configs).
set -euo pipefail

INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$INSTALL_DIR"

# Load this install's config (USERNAME, DOMAIN, APP_HOST, ports, …).
[ -f .env.local ] && set -a && . ./.env.local && set +a

# --- Idempotency guard: bail early if the change is already in place. ---
# Example:
#   target="$INSTALL_DIR/private.Caddyfile"
#   grep -q 'forward_auth' "$target" && { echo "already applied"; exit 0; }

# --- Do the work into a TEMP file, validate, back up, swap, reload. ---
# Example (Caddy):
#   tmp="$(mktemp)"
#   ...write new config to "$tmp"...
#   "$INSTALL_DIR/bin/caddy" validate --config "$tmp" --adapter caddyfile
#   cp "$target" "$target.bak.$(date +%s)"
#   mv "$tmp" "$target"
#   pm2 restart termato-caddy --update-env

echo "template migration — no-op"
exit 0
