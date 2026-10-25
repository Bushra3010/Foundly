# Deployment

1. **Database:** create a Postgres database (Supabase, Neon or similar). Set `DATABASE_URL` and run `DATABASE_URL=... npm run db:migrate`.
2. **Secrets:** set `APP_URL`, `APP_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET` and `ADMIN_EMAILS`. Generate each secret with `openssl rand -hex 32`.
3. **Email:** set `RESEND_API_KEY` and `MAIL_FROM`. Sign-in fails in production without them.
4. **Website requests:** set `ADMIN_EMAILS` to the team members who build websites. Each new request emails them and appears in `/admin/websites`.
5. **No customer site hosting:** Foundly doesn't host owners' websites, so no wildcard DNS, custom domains or media storage are needed.
6. **Crons:** `vercel.json` schedules `/api/cron/monitoring` and `/api/cron/daily` once a day each (the Hobby plan allows daily crons only). Vercel sends `Authorization: Bearer $CRON_SECRET`.
7. **Payments:** set `PAYMENT_PROVIDER=razorpay`, the API keys, plan ids and webhook secret. Point the Razorpay webhook at `/api/webhooks/payments/razorpay`. Set the `PLAN_PRICE_*_INR` values, then turn on `BILLING_ENFORCED=true` when you're ready.
8. **Providers:** follow [providers.md](providers.md) and set `MONITOR_VALIDATED_PROVIDERS`.
9. **Connect listings (optional):** owners can link an existing Google Business Profile or Facebook Page/Instagram account with one click instead of pasting links. Google: create an OAuth client (Web) in Google Cloud with redirect URI `APP_URL/api/connect/google/callback`, enable the Business Profile APIs and request API access in the Business Profile dashboard; set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Facebook: create a Meta app with Facebook Login, redirect URI `APP_URL/api/connect/facebook/callback`, and request `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata` and `instagram_basic` in App Review for public use; set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`. For Google, a refresh token is stored encrypted (ENCRYPTION_KEY) so Foundly can keep the connected listing's description, phone and website updated after each change; For Facebook, the chosen Page's long-lived token is stored encrypted so Foundly can keep the Page's about, phone and website updated. Once a week, on a weekday picked from its id, the daily cron resubmits each business's public pages to search engines and refreshes its connected listings (Free workspaces are skipped when `BILLING_ENFORCED=true`); owners who opted into emails get a monthly reminder to confirm their details.
10. **Backups:** run the restore drill in [runbooks/backup-restore.md](runbooks/backup-restore.md) before taking payments.

Production refuses to start the test payment mode, and requires `APP_SECRET` and `ENCRYPTION_KEY` the first time they're used.
