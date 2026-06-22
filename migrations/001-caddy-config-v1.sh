#!/usr/bin/env bash
# Migration 001 — bring private.Caddyfile up to canonical "config v1".
#
# Why: the self-updater never re-runs install.sh, so an install whose Caddyfile predates
# the current preview rules (e.g. the `forward_auth` session gate) never receives them.
# This regenerates the Caddyfile to the canonical form install.sh now produces.
#
# Safety (see migrations/README.md): idempotent (skips if already v1), recovers the
# per-install values that aren't in .env.local (animal list + Caddy port) by PARSING the
# existing file, VALIDATES the new config before swapping, backs up the old one, and
# RESTORES it if the reload fails — never leaves a broken config live (Caddy fronts the
# whole app). If anything is uncertain it skips cleanly (exit 0) rather than risk it.
#
# Keep the generated body in sync with install.sh's Caddy block. Bump the version +
# add a new migration (002-…) when those rules change.

set -uo pipefail

CADDY_CONFIG_VERSION=1
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CADDYFILE="$INSTALL_DIR/private.Caddyfile"
MARKER="# termato-caddy-config-version: ${CADDY_CONFIG_VERSION}"

skip() { echo "001-caddy: $1 — skipping (no change)"; exit 0; }
fail() { echo "001-caddy: $1" >&2; exit 1; }

# Tunnel/animal installs only — a plain port-pattern (legacy) or non-tunnel box has no
# animal preview blocks here. .env.local carries the authoritative per-install config.
[ -f "$CADDYFILE" ]   || skip "no private.Caddyfile (not a tunnel install or custom proxy)"
[ -f "$INSTALL_DIR/.env.local" ] || skip "no .env.local"
set -a; . "$INSTALL_DIR/.env.local"; set +a

APP_HOST="${TERMATO_APP_HOST:-}"
DOMAIN="${TERMATO_COOKIE_DOMAIN:-${TERMATO_PREVIEW_DOMAIN:-}}"
USERNAME="${TERMATO_USERNAME:-}"
PORT_BASE="${TERMATO_PORT_BASE:-}"
APP_PORT="${PORT:-3002}"
[ -n "$APP_HOST" ] && [ -n "$DOMAIN" ] && [ -n "$USERNAME" ] && [ -n "$PORT_BASE" ] \
  || skip "missing APP_HOST/DOMAIN/USERNAME/PORT_BASE in .env.local"

# Already at this version? (filename-tracking already guarantees once-only; this is a
# second guard so a manual re-run is a no-op too.)
if head -1 "$CADDYFILE" | grep -qF "$MARKER"; then skip "already at config v$CADDY_CONFIG_VERSION"; fi

# Need the caddy binary to validate — without it we won't risk a swap.
CADDY_BIN="$INSTALL_DIR/bin/caddy"; [ -x "$CADDY_BIN" ] || CADDY_BIN="$(command -v caddy || true)"
[ -n "$CADDY_BIN" ] && [ -x "$CADDY_BIN" ] || skip "no caddy binary to validate with"
command -v pm2 >/dev/null 2>&1 || skip "pm2 not found (can't reload caddy)"

# Recover values NOT in .env.local from the existing file.
APP_HOST_RE="${APP_HOST//./\\.}"; USERNAME_RE="${USERNAME//./\\.}"; DOMAIN_RE="${DOMAIN//./\\.}"
CADDY_PORT="$(sed -nE "s#^http://${APP_HOST_RE}:([0-9]+) \{.*#\1#p" "$CADDYFILE" | head -1)"
[ -n "$CADDY_PORT" ] || skip "could not recover Caddy port from existing config"
# Animal list, in band order (= the order of preview blocks in the file).
mapfile -t ANIMALS < <(sed -nE "s#^http://([a-z0-9]+)-${USERNAME_RE}\.${DOMAIN_RE}:[0-9]+ \{.*#\1#p" "$CADDYFILE")
[ "${#ANIMALS[@]}" -gt 0 ] || skip "no preview blocks found to recover animal list"
# Sanity: env PORT_BASE must match the file's first preview port (i=0 → PORT_BASE).
grep -qE "reverse_proxy 127\.0\.0\.1:${PORT_BASE} \{" "$CADDYFILE" \
  || skip "PORT_BASE ($PORT_BASE) doesn't match existing config — config drifted, not touching it"

# Spinner shown by handle_errors while a preview server is still starting (kept in sync
# with install.sh).
SPINNER_HTML='<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="2"><title>Starting server…</title><style>html,body{height:100%;margin:0}body{display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;background:#0b0b0c;color:#9aa0a6;font-size:14px}.s{display:flex;gap:10px;align-items:center}.d{width:14px;height:14px;border:2px solid #2a2a2e;border-top-color:#6366f1;border-radius:50%;animation:r .8s linear infinite}@keyframes r{to{transform:rotate(360deg)}}</style></head><body><div class="s"><div class="d"></div>Starting server…</div></body></html>'

TMP="$(mktemp)" || fail "mktemp failed"
trap 'rm -f "$TMP"' EXIT
{
  printf '%s\n\n' "$MARKER"
  printf '{\n\tadmin off\n\tauto_https off\n}\n\n'
  printf 'http://%s:%s {\n\tbind 127.0.0.1\n\treverse_proxy 127.0.0.1:%s\n}\n\n' "$APP_HOST" "$CADDY_PORT" "$APP_PORT"
  for i in "${!ANIMALS[@]}"; do
    host="${ANIMALS[$i]}-${USERNAME}.${DOMAIN}"
    pport=$((PORT_BASE + i))
    printf 'http://%s:%s {\n' "$host" "$CADDY_PORT"
    printf '\tbind 127.0.0.1\n'
    printf '\troute {\n'
    printf '\t\tforward_auth 127.0.0.1:%s {\n' "$APP_PORT"
    printf '\t\t\turi /api/auth/preview\n'
    printf '\t\t}\n'
    printf '\t\treverse_proxy 127.0.0.1:%s {\n' "$pport"
    printf '\t\t\theader_up Host "localhost:%s"\n' "$pport"
    printf '\t\t\theader_up -Origin\n'
    printf '\t\t\theader_up Cookie "termato_auth=[^;]*" "termato_auth=removed"\n'
    printf '\t\t\theader_down Content-Security-Policy "frame-ancestors https://%s"\n' "$APP_HOST"
    printf '\t\t\theader_down -X-Frame-Options\n'
    printf '\t\t\theader_down -Cache-Control\n'
    printf '\t\t\theader_down +Cache-Control "no-store, no-cache, max-age=0, must-revalidate"\n'
    printf '\t\t}\n'
    printf '\t}\n'
    printf '\thandle_errors {\n'
    printf '\t\theader Content-Type "text/html; charset=utf-8"\n'
    printf '\t\theader Content-Security-Policy "frame-ancestors https://%s"\n' "$APP_HOST"
    printf '\t\theader -X-Frame-Options\n'
    printf '\t\theader Cache-Control "no-store, no-cache, must-revalidate"\n'
    printf '\t\trespond 200 {\n\t\t\tbody `%s`\n\t\t}\n' "$SPINNER_HTML"
    printf '\t}\n}\n\n'
  done
} > "$TMP"

# Validate BEFORE touching the live config.
"$CADDY_BIN" validate --config "$TMP" --adapter caddyfile >/dev/null 2>&1 \
  || fail "generated config failed caddy validate — aborting (live config untouched)"

BACKUP="$CADDYFILE.bak.$(date +%s)"
cp "$CADDYFILE" "$BACKUP" || fail "could not back up existing config"
cp "$TMP" "$CADDYFILE"    || fail "could not write new config"

# Reload (admin API is off, so restart the managed caddy process). Restore on failure.
if pm2 restart termato-caddy --update-env >/dev/null 2>&1; then
  echo "001-caddy: regenerated to config v$CADDY_CONFIG_VERSION (${#ANIMALS[@]} preview hosts); backup at $BACKUP"
  exit 0
else
  cp "$BACKUP" "$CADDYFILE"
  pm2 restart termato-caddy --update-env >/dev/null 2>&1 || true
  fail "caddy reload failed — restored previous config from $BACKUP"
fi
