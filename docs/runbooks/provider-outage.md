# Runbook: AI provider outage

**Symptoms:** the Admin → Overview provider health table shows a falling valid/attempts ratio, owner runs end as `partial` or `failed`, and observations have status `unavailable` or `timeout`.

**Impact is contained.** A provider failure only affects that source's observations. Failed observations are not charged (reservations settle on valid answers only) and are excluded from metrics, so they never become zero visibility. Profiles, listings and website requests don't depend on monitoring.

1. Check the provider's status page and confirm the error class in a few observations (`/admin` → support view → recent checks, or query `observations.error_message`).
2. If the outage is prolonged, remove the provider from `MONITOR_VALIDATED_PROVIDERS` and redeploy. New runs skip it, and the UI shows it as "Awaiting validation".
3. Leave interrupted runs alone. The daily `/api/cron/monitoring` resumes `queued` runs and runs stuck in `running` for more than 30 minutes. Captured observations are skipped by their idempotency key, so nothing is billed twice. To resume a run immediately, use Admin → Overview → Resume.
4. After recovery, add the provider back. The next weekly run proceeds normally; don't backfill by re-running past weeks.
