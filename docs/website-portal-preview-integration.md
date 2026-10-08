# Website preview capture and staff portal integration

Prepared 8 October 2026 from the local website and staff portal source. This is a proposed implementation plan, not a deployed integration. Production database state and provider configuration were not inspected.

## Existing implementation

- Website `index.html` and `preview-names.js`: first preview prompts for two names, supports skipping, and stores names in sessionStorage. No lead submission is made.
- Website `scripts.js`: design share links identify the design, not the personalisation. Razorpay success is handled in the browser; no Razorpay webhook implementation was found in either source tree.
- Portal `src/db/conversations.ts`: customers are keyed by normalised phone number; conversations also distinguish the business WhatsApp number.
- Portal `src/db/pasted_leads.ts`: lead records carry staff ownership and feed sales metrics. `src/lead_attribution.ts` optionally creates them when a mapped staff introduction matches in the first five messages. Website capture should not manufacture staff ownership or count as staff effort.
- Portal `src/db/customer.ts` and `src/db/jobs.ts`: existing customer profiles, jobs, payment states and order links can be used for conversion reconciliation.
- Portal `src/notify.ts`, `src/inbox.ts`, `src/inbox_delivery.ts`: Gupshup template sending, persisted outbound intents, duplicate-send protection, and service-window checks already exist. The inbox composer requires an authorised staff actor; automation needs an explicit system sending path rather than a fabricated salesperson.
- Portal `src/index.ts` and `wrangler.jsonc`: Cloudflare Worker, D1, queues, and a five-minute scheduled task are already configured.
- Customer preview marketing consent and reminder scheduling were not found. Internal staff WhatsApp alert consent is a separate purpose and cannot substitute for customer consent.

## Proposed customer experience

Keep the current optional names dialog. Add an optional WhatsApp number and an unchecked permission control naming InviteStory, preview delivery, and up to two purchase reminders. Personalisation continues when no number is supplied or capture fails; only consented contacts enter messaging automation. Update the current browser-only privacy wording when server storage is introduced.

Initial rollout: one purchase reminder approximately 30–60 minutes after inactivity, configurable and disabled by default until provider templates and conversion suppression are ready. Five-minute cron resolution is sufficient. Do not repeat reminders when the visitor edits names or changes designs.

## Proposed additive database changes

Final names and migration number must be chosen against the portal migration history at implementation time.

| Table | Purpose | Key fields |
| --- | --- | --- |
| website_preview_enquiries | Website interest independent of staff lead attribution | id, customer_id, nullable pasted_lead_id, nullable order_id, design_id/slug, couple names, campaign source, status, created_at, last_activity_at, expiry, client submission key |
| customer_messaging_consents | Durable permission and withdrawal history by purpose | customer_id, purpose, granted/revoked event, wording version, source, recorded_at |
| website_preview_followups | Scheduled delivery and cancellation audit | enquiry_id, step, due_at, state, cancellation reason, nullable outbound message_id, unique enquiry/step |

Use the existing customers table for contact identity. Multiple enquiry attempts can belong to one customer; retry keys prevent duplicate submissions. Do not overwrite existing staff ownership. Consent from an unverified typed number is not proof of ownership: evaluate verification before enabling automated sends to arbitrary form inputs, and limit repeated requests per phone as well as per IP.

## Backend and frontend contract

1. A dedicated public capture route accepts bounded, validated input; it never exposes staff sessions or Gupshup credentials. Apply rate limiting and bot protection. Prefer a same-origin website endpoint forwarding to the portal with server credentials/service binding; if using a direct portal endpoint, configure exact allowed origins and independent abuse controls. Origin checks alone are not authentication or bot protection.
2. Normalise the phone with the portal's existing utility and find/create the customer. Preserve established customer identity and staff ownership. Resolve existing lead/order links without inserting a fake staff claim.
3. Persist enquiry and consent before scheduling. Capture a selected design identifier validated against the catalogue, campaign attribution, and a stable retry key. Keep personal data out of analytics events and routine logs.
4. Create a high-entropy, expiring restore token for a personalised preview. Store its hash, avoid putting phone/names in URLs, and expose only the limited preview data needed by the website. Return visits restore names to sessionStorage and open the selected design. Do not give the token access to customer records or order data.
5. Show a Website enquiries view and preview context within authorised customer/lead screens. Keep website acquisition metrics separate from salesperson attribution; allow the existing claim/assignment flow to link records later.

## Reminder and conversion handling

- Reuse provider delivery and message history infrastructure, with an explicit automation actor/path that does not trigger staff sales attribution.
- Use approved templates for business-initiated messages; a form submission does not open the customer service window.
- Before dispatch, recheck current consent, enquiry conversion, linked orders, active human handling, last activity and contact-wide frequency limits. Cancel queued reminders on withdrawal, purchase or staff takeover. Honour STOP and provider/inbox opt-out events centrally.
- Claim due work atomically and use stable delivery keys. Provider timeouts with uncertain outcomes must not cause blind resend. Reuse existing outbound recovery behaviour where possible and add distinct automation audit context.
- Link website checkout to an enquiry with a server-controlled reference. Add signed Razorpay webhook verification and idempotent payment reconciliation; never trust the browser success callback as proof of payment. Inspect the existing accounting/order creation workflow before deciding how verified payments create or update jobs and ledger entries.
- Reconcile portal orders and direct WhatsApp payments to the enquiry. Phone matching helps find candidates but must not equate an unrelated historical order with purchase of this preview; provide staff linking/override and conservative suppression during ambiguity.

## Implementation sequence and validation

1. Add schema, capture/restore routes, permission records, and portal enquiry visibility. Connect optional website capture; leave sends disabled.
2. Add verified payment linkage, staff conversion reconciliation, central opt-out handling and staff pause/takeover.
3. Add one reminder through the existing delivery infrastructure, with a feature switch and approved configured template.
4. Verify normalisation, retry idempotency, existing owner preservation, consent revocation, cross-device restore, access boundaries, forged/replayed payment events, conversion cancellation, concurrent cron claims and uncertain provider outcomes. Run portal typecheck and relevant tests, and website preview regression tests.

Migrations should first be applied locally. Production migrations, provider template configuration and deployment are separate rollout operations, not completed by this plan.

## Required payment reconciliation work

Payment reconciliation is part of this build, not an optional later enhancement. The website currently uses a browser callback for successful Razorpay checkout. The integration must establish a durable server-side payment reference so verified payments can stop follow-ups even when the customer closes the tab or never opens WhatsApp.

- Create the Razorpay order on the backend using server-calculated catalogue prices, selected add-ons and currency. Persist its association with the preview enquiry when one exists; checkout must also work for visitors who did not provide a number.
- Pass the server-issued Razorpay order ID into checkout. Do not trust frontend amounts, design prices, enquiry IDs or a browser-reported success as payment authority.
- Verify webhook signatures against the exact raw request body using a server-only webhook secret. Validate event shape, expected merchant order, amount, currency and captured payment state before updating records.
- Persist webhook receipts/payment references with uniqueness constraints. Duplicate events, delayed callbacks and out-of-order events must not create duplicate orders, ledger credits, conversions or notifications, or regress a captured payment to pending.
- Reuse the portal's existing order and ledger functions and their accounting invariants. Link the payment to the existing order when available; otherwise use an explicit website payment intake record for staff reconciliation if the current order workflow requires details not yet collected. Do not invent design assignments or staff sales credit to satisfy required fields.
- Mark the linked enquiry converted and cancel pending follow-ups as soon as the captured payment is verified, without waiting for staff to finish order intake. Recheck suppression immediately before provider dispatch; cancellation cannot recall a message already accepted by the provider.
- Allow authorised staff to link an enquiry to an order paid through WhatsApp/direct UPI and record the conversion through the existing workflow. Do not mark every enquiry for a phone as purchased merely because an old order exists.
- Separate abandoned checkout, failed payment, pending payment and captured payment. Payment errors may offer help but must not repeatedly reset the reminder allowance.
- Document required environment secrets, webhook endpoint/event subscriptions and local validation steps. Do not put credentials in source, browser JavaScript or the proposal.

## Ready-to-paste Codex build request

```text
Build the website preview-to-staff-portal integration described in:
/Users/amnas/Desktop/invitestory-main/docs/website-portal-preview-integration.md

Work across these two repositories:
- Website: /Users/amnas/Desktop/invitestory-main
- Staff portal: /Users/amnas/Desktop/staff.invitestory-main

Read the applicable repository instructions and inspect the current code and migration history before editing. Implement the complete local integration, including frontend changes, portal backend routes, additive D1 migrations, portal UI, payment reconciliation, reminder scheduling, opt-out handling and meaningful tests. Use the proposal as the starting design and adapt it to the actual architecture, documenting material deviations.

Keep the preview free and the current name-personalisation step skippable. Add an optional WhatsApp number and explicit unchecked permission for preview delivery and up to two purchase reminders. Names-only personalisation must still work. Start with one reminder, defaulting to 45 minutes after inactivity, with a configurable delay and a global sending switch disabled by default. A website capture failure must not block previewing or checkout.

Reuse existing customers, phone normalisation, staff lead ownership, orders, ledger rules, Gupshup messaging, business-number routing and delivery recovery. Store website enquiries separately from staff-attributed leads. Do not create fake staff claims, overwrite existing owners, inflate staff metrics or misclassify automated messages as staff introductions. Add preview context to authorised portal screens and a website-enquiries view with claim/link, pause and conversion actions.

Implement secure capture and expiring preview restoration across devices. Keep provider credentials server-side and personal information out of URLs, analytics events and routine logs. Add validation, retry idempotency, rate limits and abuse protection; explicitly address number ownership before enabling automated sends. Preserve existing customer names when updating a known contact unless changed through an authorised workflow. Update privacy and consent wording to match the actual storage and messaging behaviour.

Implement backend Razorpay order creation with server-calculated prices, raw-body webhook signature verification, durable payment-to-enquiry linkage and idempotent captured-payment reconciliation. Checkout must work without a preview lead. Integrate with existing order/ledger workflows without duplicate credits or fabricated assignments. Verified payment must mark the enquiry converted and cancel follow-ups even if the browser closes. Also support linking portal-recorded WhatsApp/direct UPI orders to enquiries. Do not infer a new conversion solely from a historical order for the same phone.

Persist reminder jobs, claim them atomically, and recheck consent, payment/conversion, inactivity, contact frequency limits and staff takeover before dispatch. Use approved business-initiated templates and the existing outbound infrastructure through an explicit automation path. Honour opt-outs centrally. Do not blindly resend after uncertain provider responses. Keep sending disabled until the required configured templates and verification controls are ready, and document any external configuration that remains.

Apply migrations to an isolated local database first. Run portal typecheck and focused integration tests, plus relevant website preview/checkout regression tests. Cover duplicate submissions, existing staff ownership, privacy/access boundaries, restore expiry, opt-outs, forged/replayed/out-of-order payment events, manual conversions, simultaneous scheduler runs, cancellation and uncertain sends. Finish the local implementation and validation; do not deploy, apply production migrations or send real customer messages as part of this build request.

Provide a concise report of changed files, migrations, test results, required environment variables/provider setup and exact rollout steps. If a required secret or external service is unavailable, complete the testable local work using mocks, state the limitation clearly, and do not claim the live integration is working.
```


## Local implementation status — 8 October 2026

The frontend integration and portal backend have been implemented, synchronized into both repositories and validated locally. Existing unrelated changes in both repositories were preserved. The local implementation itself did not deploy, apply production migrations or send real customer messages. The subsequent authorised portal deployment is recorded below.

Implemented: optional consented WhatsApp capture in the existing name form; incoming WhatsApp number confirmation; expiring cross-device preview restoration; customer-linked website enquiries; staff claim/pause/opt-out/conversion controls; customer preview context; server-priced Razorpay order creation; signed idempotent captured-payment reconciliation; staff reconciliation through the existing ledger; persisted reminder scheduling with suppression, contact limits and uncertain-send protection; integration and sending switches disabled by default.

The dedicated automation job table reuses provider/account selection, message history and delivery-status processing rather than the human inbox outbox, whose active staff sender requirement would incorrectly attribute automated sends. Automated messages are excluded from both staff-name matching and the five-message opening allowance.

Validation: 50 website tests pass; the expanded 15-test portal integration suite passes using isolated SQLite with all migrations applied; the initial 12-test suite also passed in the Cloudflare Worker/D1 runtime. Portal TypeScript checking passes. Live provider configuration and browser end-to-end staging validation remain rollout steps.

Configuration and rollout instructions are in `docs/WEBSITE_PREVIEW_INTEGRATION.md` in the staff repository and the website copy `docs/website-portal-rollout.md`. Migration: `0069_website_previews.sql`. Required external configuration: shared bridge secret, restore secret, Turnstile keys, Razorpay API/webhook secrets and approved preview/reminder templates. Keep messaging off until verified staging payment suppression and opt-out checks pass.

## Production portal deployment — 8 October 2026

The user ran Wrangler against the configured Cloudflare account and reported successful application of migrations `0067_production_automation.sql`, `0068_whatsapp_business_numbers.sql` and `0069_website_previews.sql` to `accounts-db`, followed by deployment of `accounts-portal` to `staff.invitestory.in`. Deployed version: `848449ca-5906-47e0-a3aa-11d3a064ce1b`.

Live browser verification confirmed `/health` returns `{"ok":true}` and `/api/website/config` rejects requests without the bridge credential with `{"error":"Unauthorized"}`. This verifies reachability and the API authentication guard; configured capture, payments and customer messaging have not been verified live.

The website can now be pushed to GitHub with the integration disabled by default. Enabling WhatsApp capture and server checkout still requires the secrets, Turnstile, Razorpay webhook and end-to-end checks documented in the rollout guide. Keep `website_reminders_enabled` off until those checks succeed.
