# Preview performance measurement

The existing PostHog integration now receives lifecycle events directly from the preview controller. These changes collect production data after deployment; they do not create a dashboard or demonstrate a sales improvement.

| Event | Meaning | Additional properties |
| --- | --- | --- |
| `template_preview_started` | A new attempt begins | `preview_trigger`: open, retry, or names_changed |
| `template_preview_ready` | The expected invitation has usable content and its required styles | `load_time_ms` |
| `template_preview_delayed` | The attempt is still not ready at eight seconds | `waiting_reason`: styles_pending or content_pending |
| `template_preview_ended` | Closing, switching designs, reloading, or leaving the page ends the attempt | `preview_ready`, `exit_reason` |

All events include design metadata, `elapsed_ms`, `retry_count`, and `preview_device` (mobile or desktop viewport). Names, contact details, form values and preview URLs are excluded. Localhost capture is disabled. Analytics exceptions do not block the viewer.

## How to assess results

- Compare median and 90th-percentile `load_time_ms` by design and mobile/desktop viewport. Separate initial openings from retries and name changes using preceding started events.
- Inspect eight-second delays by design and waiting reason. A delay is not a proven failure: the invitation may recover.
- Count ended attempts with `preview_ready = false`, grouped by close, switch, or page_exit. Keep retries and names_changed separate from visitors leaving the preview.
- Use started attempts as the denominator when comparing delay and early-exit rates. A single visitor can make multiple attempts; do not equate attempt counts with unique buyers.
- Compare the purchase journey: `$pageview` → `template_viewed` → `template_preview_ready` → `order_cta_clicked` → `checkout_started` → `payment_succeeded`. Analyse direct checkout and WhatsApp enquiries separately because they can bypass the preview.
- Browser payment callbacks are an existing frontend signal. Reconcile with confirmed payment records before treating them as booked revenue.

Repeated iframe load notifications emit readiness once per attempt. Page exit ends measurement once; browser-cache restoration of an already open viewer is not counted as a new load attempt. Page-exit event delivery is best effort, so missing end events do not prove abandonment or success.

Keep the current event names and production project. Review real data before deciding which designs to optimize; prioritize heavily visited designs with long readiness times or high early-exit rates.
