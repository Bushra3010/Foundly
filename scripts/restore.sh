#!/usr/bin/env bash
# Restores a dump into an EMPTY database. Usage: RESTORE_URL=... scripts/restore.sh backups/<file>.dump
set -euo pipefail
: "${RESTORE_URL:?Set RESTORE_URL to an empty database}"
file="${1:?Pass the dump file}"
pg_restore --no-owner --no-privileges --exit-on-error --dbname "$RESTORE_URL" "$file"
echo "Restored $file"
