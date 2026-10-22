#!/usr/bin/env bash
# Logical backup of the production database. Usage: DATABASE_URL=... scripts/backup.sh
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL}"
mkdir -p backups
out="backups/$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" > "$out"
echo "Wrote $out ($(du -h "$out" | cut -f1))"
