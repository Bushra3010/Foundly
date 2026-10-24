#!/usr/bin/env bash
# Copies Foundly's production environment variables from the Netlify site to
# the Vercel project, so both run with the same database and secrets.
# Values are never printed. Run from the project folder:
#
#   bash scripts/vercel-env.sh
#
# Needs: netlify CLI logged in to the account that owns the site, python3, curl.
set -euo pipefail

NETLIFY_SITE_ID="2e504b48-740e-4194-a3cc-8ec676317cd4"
NETLIFY_ACCOUNT_ID="6adbaddc8621ecb79ce7bea0"
VERCEL_PROJECT_ID="prj_qTbz5YB9X810qbz22XOxqZhe2972"
VERCEL_TEAM_ID="team_svDJtdSHmUUknzz3jaWv6qGv"

if [ -z "${VERCEL_TOKEN:-}" ]; then
  read -r -s -p "Vercel token: " VERCEL_TOKEN; echo
fi
[ -n "$VERCEL_TOKEN" ] || { echo "No Vercel token entered."; exit 1; }

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
netlify api getEnvVars --data "{\"account_id\":\"$NETLIFY_ACCOUNT_ID\",\"site_id\":\"$NETLIFY_SITE_ID\"}" > "$tmp" 2>/dev/null || {
  echo "Couldn't read the Netlify site. Run 'netlify switch' and pick kindbridgeapp@gmail.com, then try again."
  exit 1
}

VERCEL_TOKEN="$VERCEL_TOKEN" python3 - "$tmp" "$VERCEL_PROJECT_ID" "$VERCEL_TEAM_ID" <<'PY'
import json, os, sys, urllib.request

src, project, team = sys.argv[1], sys.argv[2], sys.argv[3]
token = os.environ["VERCEL_TOKEN"]
# Netlify-only settings are not copied; Vercel provides its own.
skip = {"NETLIFY", "NETLIFY_BLOBS_CONTEXT", "URL", "DEPLOY_URL", "SITE_ID"}

def value_for(entry):
    values = entry.get("values", [])
    for ctx in ("production", "all"):
        for v in values:
            if v.get("context") == ctx:
                return v.get("value")
    return values[0].get("value") if values else None

envs = []
for entry in json.load(open(src)):
    key, value = entry["key"], value_for(entry)
    if key in skip or not value:
        continue
    envs.append({"key": key, "value": value, "type": "encrypted", "target": ["production", "preview"]})

req = urllib.request.Request(
    f"https://api.vercel.com/v10/projects/{project}/env?upsert=true&teamId={team}",
    data=json.dumps(envs).encode(),
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as res:
    res.read()
print("Copied to Vercel:", ", ".join(sorted(e["key"] for e in envs)))
PY
