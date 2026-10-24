# Runbook: backups and restore

Target: daily backups and a tested restore. RPO 24 hours, RTO 8 hours (PRD §15).

## Production (Postgres, e.g. Supabase)
- Turn on the provider's daily backups or point-in-time recovery.
- Also take an independent daily logical dump: `DATABASE_URL=... scripts/backup.sh` writes `backups/<timestamp>.dump`. Store it off-site.

## Restore drill (do this before accepting paying users, then quarterly)
1. Create an empty database and run `RESTORE_URL=... scripts/restore.sh backups/<file>.dump`.
2. Point a staging deployment at it (`DATABASE_URL`) and run `npm run db:migrate` (it should report nothing to apply).
3. Check that a known owner can sign in, their profile renders at `/b/<slug>`, their website request or connected website is shown, and the AI Visibility evidence opens.
4. Record how long it took and the dump's age in this file's log below.

## Local development
The embedded database lives in `.data/pglite`. Stop the dev server and copy the folder to back it up.

## Drill log
| Date | Dump age | Restore time | Result |
| --- | --- | --- | --- |
