# InviteStory retargeting preparation

Status: website events and campaign materials prepared. No advertising account, audiences, campaign or budget has been changed. Platform/account and daily budget remain to be supplied.

The site already configures GA4 G-JS52597LF1 and Meta Pixel 877558961848422. Google Ads account and conversion-label settings are currently empty. These IDs come from existing source; account ownership and live receipt of events have not been verified.

Local browser verification reported that Meta blocks this preview origin under the pixel's traffic permission settings. This may be the expected exclusion of localhost. Check receipt on invitestory.in in Events Manager after deployment; if the live domain is also blocked, the account owner must correct the allowlist before running the campaign.

## Events and audience rules

| Visitor action | GA4 event | Meta event | Use |
| --- | --- | --- | --- |
| Opens a design preview | select_design | ViewContent | Recover interest in the same design |
| Saves a design | save_design | AddToWishlist | High-intent shortlist audience |
| Opens an order drawer | view_order | Custom view_order | Viewed offer, did not necessarily start payment |
| Opens Razorpay from the drawer | begin_checkout | InitiateCheckout | Payment-intent audience |
| Completes payment | purchase | Purchase | Primary sales conversion and buyer exclusion |
| Opens WhatsApp enquiry | whatsapp_click | Contact | Enquiry; never counted as a paid order |
| Shares saved designs | share_shortlist | Custom share_shortlist | Family consideration audience |
| Uses style finder | style_finder_complete | Custom style_finder_complete | Discovery engagement |

Design previews, saves, payment starts and purchases include content_ids. GA4 also receives items[].item_id. IDs match design-inventory.csv. Email addresses, guest data, names entered by customers, wedding dates and planner dates are not added to these new events.

Suggested initial audiences, subject to sufficient eligible traffic:

1. Payment started in the last 7 days, excluding purchasers. Creative: the selected invitation, its actual total/base price, draft approval and revision allowance. Do not promise an unselected add-on.
2. Saved or viewed an order in the last 14 days, excluding purchasers and the payment-started audience. Creative: the exact design, its opening, and what the package includes.
3. Previewed a design in the last 30 days, excluding purchasers and the two higher-intent audiences. Creative: revisit the live demo or compare the three packages.

Exclude confirmed buyers for 180 days as an initial setting; also reconcile purchases made through WhatsApp/direct UPI. Website events alone cannot identify every offline purchase. Do not optimize for Contact/WhatsApp clicks as if they were purchases.

Use broad geography appropriate to the business. No demographic or religion-based personalization is part of this implementation. Restrict to the intended existing-visitor audiences; verify platform targeting settings do not expand an intended retargeting-only audience.

## Creative and destinations

Run `node marketing/build-design-inventory.mjs` after changing design names or prices. It builds a CSV with all 35 designs, IDs, public image references, prices, RSVP channel, copy and preview deep links. This is a design inventory, not a promise that a particular platform will accept it as a commerce catalogue feed. Product catalogue eligibility and required feed schema must be verified in the selected ad account. Without a catalogue, use collection/design-specific ads matched to preview activity.

Three prepared copy angles:

**Revisit the design**

Headline: “[Design name], made for your wedding”

Text: “Still imagining your wedding in [Design name]? Open the live invitation again. Personalized by our team for [actual package price], with music, venue directions and [actual RSVP channel].”

Destination: the matching ?design= preview from the CSV. Use the exact design thumbnail. The Dearly video must be advertised at Dearly’s ₹4,999 price, not as the ₹1,999 Premium opening.

**Resolve payment hesitation**

Headline: “Your invitation, with a team to make it yours”

Text: “Choose the design. Share your details. Review your draft before final approval, with free revision requests for 24 hours after draft delivery. Premium from ₹1,999, with WhatsApp RSVP included.”

Destination: https://invitestory.in/?utm_source=meta&utm_medium=paid_social&utm_campaign=checkout_remarketing#pricing

**Dearly demonstration**

Headline: “A wax seal. A beautiful reveal. Your wedding story.”

Text: “The Dearly collection, personalized for your wedding. ₹4,999, with Email RSVP and 24h express included. First draft within 24h after payment and complete details.”

Asset: dearly/aubergine-magnolia/media/opening.mp4, the existing Dearly opening demonstration.

Destination: https://invitestory.in/?design=magnolia-reverie&utm_source=meta&utm_medium=paid_social&utm_campaign=dearly_remarketing

For Google, change utm_source to google and utm_medium to the selected campaign type. Keep one campaign identifier per audience so sales can be attributed accurately.

## Activation and measurement

Before activation, supply the platform, account and daily budget. Verify the matching pixel/property and event receipt in the platform, configure audiences and buyer exclusions, then prepare a paused campaign for review. Google additionally needs the GA4–Google Ads link and advertising features/audience sharing configured. No pixel ID change or extra tag installation is necessary just to define GA4 event audiences.

Frequency controls depend on the selected campaign type. Start with a short audience window, monitor frequency and fatigue, and rotate creative. Set a cap where supported; do not assume every campaign offers one.

Compare paid-order rate, revenue per visitor, average order value, spend per confirmed purchase, and enquiry-to-paid-order rate. A browser Purchase callback is a useful signal; use captured Razorpay transactions as the sales source of truth. Server-side verification/webhook reconciliation is not implemented by this change.

References checked during preparation: [Google remarketing setup](https://developers.google.com/tag-platform/devguides/remarketing), [GA4 audience inclusion and purchaser exclusions](https://support.google.com/analytics/answer/12799863?hl=en), [GA4 audience sharing to Google Ads](https://support.google.com/analytics/answer/9267572?hl=en). Meta’s reference endpoint could not be retrieved during this session; verify its current catalogue and audience requirements in the selected account before uploading or activating.
