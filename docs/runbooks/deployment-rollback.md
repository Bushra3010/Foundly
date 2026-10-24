# Runbook: deployment rollback

## Platform (the app itself)
1. Roll back to the previous deployment in your host. On Vercel, use `vercel rollback` or promote the previous deployment.
2. Migrations are additive (new tables and columns). Rolling back the app with a newer schema is safe. Never run down-migrations against production without a fresh backup (see backup-restore.md).
3. Check `/`, `/directory`, a published `/b/<slug>` profile, sign-in, the owner dashboard and `/admin/websites`.
