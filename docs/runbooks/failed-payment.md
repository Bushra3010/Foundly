# Runbook: failed payment

1. The provider sends a failure webhook (Razorpay: `subscription.halted` or `subscription.pending`). The subscription becomes `past_due` with `grace_until` set 14 days ahead. Features stay on.
2. The owner sees a banner in Settings. Content is **never** deleted for non-payment.
3. If the grace period passes and `BILLING_ENFORCED=true`, the daily cron (`/api/cron/daily`) takes the website offline. Versions, leads and data are kept and can still be exported. Republishing works as soon as payment succeeds.
4. Webhooks are deduplicated by `(provider, event_id)`. A replayed event returns `duplicate` and changes nothing, so it's safe to ask the provider to resend.
5. **Refunds:** issue them in the provider dashboard. The `refund.processed` event is recorded. If credits should be removed, use Admin → Support → Adjust credits with the refund reference as the reason.

Before launch, validate with the provider: settlement timing, GST invoices, mandate limits for UPI and cards, and the exact event names for your account.
