# Runbook: deployment rollback

## Platform (the app itself)
1. Roll back to the previous deployment in your host. On Vercel, use `vercel rollback` or promote the previous deployment.
2. Migrations are additive (new tables and columns). Rolling back the app with a newer schema is safe. Never run down-migrations against production without a fresh backup (see backup-restore.md).
3. Check `/`, `/directory`, a live `/s/<slug>`, sign-in and the owner dashboard.

## A customer website
Customer sites point at immutable versions. To roll one back:
- **Owner:** My Website → Published versions → "Make version N live".
- **Support:** the owner must do it. Support access is read-only by design.

A publish binds one validated version in a single transaction, so a partial publish can't show as a success.
