# Website improvements from PostHog

Reviewed 9 October 2026 in Safari's themelon profile, InviteStory project **652540**. The separate DIY project **639028** was excluded.

## Evidence and limits

The Web Analytics report's last-30-days view showed 145 visitors, 220 pageviews and 165 sessions. Mobile accounted for 114 visitors (about 79%); desktop 30 and tablet 1. Bounce rate was rounded to 15%, with 14.5% on the `/` path, and average session duration was 3m 50s. Internal/test traffic was not excluded in that view, so these are a baseline, not clean customer-only conversion figures.

The report showed three rageclicks. Their count alone does not identify the failing control or establish a cause. Event Definitions contained five automatic events (`$autocapture`, `$pageleave`, `$pageview`, `$rageclick`, `$web_vitals`) and no custom product events. Conversion goals were unconfigured. There was no measured purchase funnel from which to claim a specific checkout drop-off.

## Changes

- Restore visible Explore designs and Ask on WhatsApp actions at the top of the mobile homepage. Show the existing starting price, inclusions and draft timing before scrolling.
- Open the invitation immediately. Keep name personalization available through Try your names, instead of automatically placing a form over the first preview.
- Label tappable catalogue artwork View invitation and support Enter/Space activation with visible keyboard focus. Keep mobile search at 16px to avoid input zoom.
- Send existing product interactions to the site's existing PostHog project without changing its public project key. Analytics failure cannot block previews, enquiries or payments.
- Disable capture on localhost/loopback so local testing does not inflate this baseline. Cross-subdomain cookies are enabled; they do not join data collected under a different project key.

## Event definitions

| Event | Trigger and interpretation |
| --- | --- |
| `catalogue_cta_clicked` | Hero Explore designs click |
| `catalogue_viewed` | Catalogue section enters the viewport, once per page load |
| `catalogue_filtered` | Collection/style changed; includes current result count |
| `catalogue_searched` | Nonempty search after a 650ms pause; length and result count only |
| `template_viewed` | Design selected/opened; not proof the frame finished loading |
| `template_preview_ready` | Preview controller confirms loaded content; deduplicated per controller version |
| `preview_names_applied` | Names applied; actual name values excluded |
| `template_saved`, `template_resumed`, `shortlist_shared`, `style_finder_completed` | Existing discovery actions |
| `pricing_viewed`, `collection_viewed` | Pricing section exposure and existing package interaction |
| `whatsapp_cta_clicked` | Enquiry intent; includes location and design where available. Does not prove a message was sent or an order was placed |
| `order_cta_clicked` | Booking review opened |
| `checkout_started` | Payment SDK checkout initiated |
| `checkout_unavailable` | Gateway or SDK could not open; fixed reason values |
| `checkout_cancelled`, `payment_failed` | Payment modal dismissed without success, or SDK failure callback |
| `payment_succeeded` | Browser payment success callback with a payment ID; deduplicated within the page; marked `payment_confirmation=browser_callback` |
| `diy_editor_cta_clicked` | Link to the DIY editor clicked; does not measure activity within the separate DIY project |

Known designs carry `template_id`, `template_name`, `template_slug`, `style` and `collection`. Amount and currency are supplied on relevant conversion actions. Custom events whitelist metadata and exclude names, phone numbers, raw searches and WhatsApp message contents. This does not change the existing automatic-capture/replay configuration.

`payment_succeeded` is client evidence, not server-verified revenue or a fulfilled order. A verified backend payment event would be required for financial reporting.

## Measurement after deployment

1. Confirm a real production preview emits `template_viewed` and `template_preview_ready` in project 652540.
2. Create a booking funnel: `$pageview` → `template_viewed` → `order_cta_clicked` → `checkout_started` → `payment_succeeded`. Filter to invitestory.in and break down by device and collection.
3. Track WhatsApp separately: `$pageview` → `template_viewed` → `whatsapp_cta_clicked`. Also compare enquiry intent from the hero directly, without requiring a preview.
4. Compare preview-selected versus preview-ready events, searches with zero results, checkout failures and rageclick replays. Investigate the affected controls before further changes.
5. Compare mobile outcomes across equivalent pre/post periods with internal traffic excluded. The new events have no historical backfill, and the current sample cannot establish a conversion uplift.

Local changes are not deployed. Automated validation: 59 tests, JavaScript syntax checks and server bundle build. Browser validation covers mobile/desktop layout, keyboard preview activation, optional names, search, collection filters and currency. No payment or WhatsApp message was sent during testing.
