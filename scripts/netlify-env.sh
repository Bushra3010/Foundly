#!/usr/bin/env bash
# Sets the production environment variables for the Foundly site on Netlify,
# then starts a fresh deploy. Secrets are generated on this machine and are
# never printed. Run from the project folder:  bash scripts/netlify-env.sh
#
# Needs: netlify CLI logged in (netlify login), python3, openssl.
set -euo pipefail

SITE_ID="${SITE_ID:-fad674ef-1b05-436c-937b-c61e6e8c09c9}"   # Netlify site "foundlyai"
APP_URL="${APP_URL:-https://foundly.co.in}"
SUPABASE_REF="${SUPABASE_REF:-asofelasqhgbypwmxxru}"
POOLER_HOST="${POOLER_HOST:-aws-0-ap-southeast-1.pooler.supabase.com}"

ACCOUNT_ID=$(netlify api getSite --data "{\"site_id\":\"$SITE_ID\"}" | python3 -c 'import sys,json; s=json.load(sys.stdin); print(s["account_id"])')
SITE_NAME=$(netlify api getSite --data "{\"site_id\":\"$SITE_ID\"}" | python3 -c 'import sys,json; print(json.load(sys.stdin)["name"])')
echo "Configuring Netlify site: $SITE_NAME ($APP_URL)"

echo
echo "Supabase database password (Supabase > Project Settings > Database)."
echo "If you don't know it, click 'Reset database password' there first."
read -r -s -p "Database password: " DB_PASSWORD; echo
[ -n "$DB_PASSWORD" ] || { echo "No password entered."; exit 1; }
read -r -p "Admin email(s) for /admin, comma separated: " ADMIN_EMAILS
[ -n "$ADMIN_EMAILS" ] || { echo "No admin email entered."; exit 1; }

ENCODED=$(DB_PASSWORD="$DB_PASSWORD" python3 -c 'import os,urllib.parse; print(urllib.parse.quote(os.environ["DB_PASSWORD"], safe=""))')
DATABASE_URL="postgresql://postgres.${SUPABASE_REF}:${ENCODED}@${POOLER_HOST}:6543/postgres"

set_var() {
  local key="$1" value="$2"
  netlify api deleteEnvVar --data "{\"account_id\":\"$ACCOUNT_ID\",\"site_id\":\"$SITE_ID\",\"key\":\"$key\"}" >/dev/null 2>&1 || true
  KEY="$key" VALUE="$value" python3 -c 'import json,os; print(json.dumps([{"key":os.environ["KEY"],"values":[{"context":"all","value":os.environ["VALUE"]}]}]))' > "$TMP_BODY"
  netlify api createEnvVars --data "{\"account_id\":\"$ACCOUNT_ID\",\"site_id\":\"$SITE_ID\",\"body\":$(cat "$TMP_BODY")}" >/dev/null
  echo "  set $key"
}

has_var() {
  netlify api getEnvVar --data "{\"account_id\":\"$ACCOUNT_ID\",\"site_id\":\"$SITE_ID\",\"key\":\"$1\"}" >/dev/null 2>&1
}

# Generated secrets are created once and kept. Changing ENCRYPTION_KEY later
# would make stored integration passwords unreadable.
set_secret_once() {
  if has_var "$1"; then echo "  kept $1 (already set)"; else set_var "$1" "$(openssl rand -hex 32)"; fi
}

TMP_BODY=$(mktemp); trap 'rm -f "$TMP_BODY"' EXIT
echo
echo "Setting environment variables:"
set_var DATABASE_URL "$DATABASE_URL"
set_var APP_URL "$APP_URL"
set_var ADMIN_EMAILS "$ADMIN_EMAILS"
set_secret_once APP_SECRET
set_secret_once ENCRYPTION_KEY
set_secret_once CRON_SECRET

echo
echo "Starting a fresh deploy so the new values take effect..."
netlify api createSiteBuild --data "{\"site_id\":\"$SITE_ID\"}" >/dev/null
echo "Done. Wait about two minutes, then open $APP_URL/signup and $APP_URL/admin."
