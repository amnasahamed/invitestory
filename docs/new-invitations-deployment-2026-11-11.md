# Invitation collection deployment — 11 November 2026

- Website production version: `5082d32a-c626-47ac-b25c-ab66c19198c0`.
- Website domains: `invitestory.in`, `www.invitestory.in`.
- Previous website version: `1f9efc00-925c-4678-b2a8-30c3d7e361ee`.
- Payment-service production version: `e4bc23fa-6796-43ef-8d9b-5838ad7a48e3`.
- Previous payment-service version: `b63e8f74-aa82-48ab-b1dc-fe12b44e3375`.

Eight new designs (IDs 40–47) were deployed. IDs 40, 41, 42 and 46 cost
₹1,999; IDs 43, 44, 45 and 47 cost ₹2,999. The payment service's independent
approved-design catalogue was updated to match the website.

Validation includes the 142 website tests, 80 payment/preview service tests,
TypeScript checks, deployment packaging, and live browser checks of all eight
deep links and order drawers at 390 and 1440 px widths. Live invitation media,
generated decorative assets, personalized names and opening interactions were
also checked in Chromium. Personalization now starts at DOM readiness rather
than waiting for all media downloads. Live checks also found a canonical HTML
redirect loop on the campaign and Dearly aliases; the worker now requests the
extensionless asset URLs directly.

Live browser tests block writes: they do not create leads, submit sample RSVPs,
place live orders or charge a card. Payment-provider behavior was verified
with a simulated SDK locally; actual payment capture is outside this smoke test.

Browser evidence is saved under `/tmp/invitestory-live-*.json` and
`/tmp/invitestory-live-*.log` on this machine.

## Follow-up: real gateway checks without payment

At the user's request, all eight designs were subsequently taken through real
Cloudflare verification and into Razorpay checkout in normal Chrome. No contact
details or payment credentials were entered, and no payment was authorized.
The headless browser timed out during verification; normal Chrome succeeded.

A read-only production query confirmed exactly one pending INR checkout for
each design ID 40–47: IDs 40, 41, 42 and 46 at 199900 paise; IDs 43, 44, 45 and
47 at 299900 paise. All eight remained pending, with no captured payment in the
checked records. Retry checks reused their original unpaid orders. These pending
records were retained for audit and retry consistency.

Gateway screenshots: `/tmp/invitestory-gulabi-checkout.jpg` and
`/tmp/invitestory-noor-mahal-checkout.jpg`. Payment capture and post-payment
fulfilment remain untested because the user explicitly prohibited real charges.
