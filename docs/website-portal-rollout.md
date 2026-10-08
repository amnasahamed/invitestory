# Website preview integration

## Behaviour

The optional name prompt accepts a WhatsApp number only when the visitor grants the displayed preview/reminder permission. Names-only previews continue locally. Consent is versioned as `preview-reminders-v1`; the checkbox starts unchecked. Capturing contact details never assigns a salesperson or creates an attributed staff lead.

After capture the website offers a WhatsApp confirmation link containing `PREVIEW <challenge>`. The existing authenticated live inbound webhook verifies the challenge only for that same phone number. Historical messages cannot activate sending. Automated sends require confirmation, current consent and an enabled reminder setting. STOP revokes the contact's preview-reminder permission.

Saved preview links contain an expiring bearer token in the URL fragment; names and phone numbers are not in the link. Tokens are stored as hashes and expire after 30 days. The restore secret derives the token for outgoing messages. Avoid rotating this secret without a migration plan; rotation invalidates existing links/delivery verification.

Two persisted message steps exist: requested preview delivery and one reminder (45 minutes after last website activity by default). The five-minute scheduler processes due work. Names/design edits do not replenish the allowance. Automation pauses for staff ownership, linked orders, opt-out or verified purchase. Provider uncertainty is held for reconciliation and is never blindly retried. It cannot recall a message already accepted by WhatsApp.

The current implementation reuses the Gupshup provider adapter, account selection, conversations/messages and delivery-status webhook processing. It uses a dedicated persisted automation job claim rather than the human inbox outbox: the latter requires an active authorised staff sender. Automation messages are excluded from staff introduction attribution. Existing staff-authored outbound queue behaviour is preserved.

## Staff workflow

Open **Website enquiries** in the portal navigation. Managers/admins see the queue and payment intakes. Sales staff see their own and unclaimed enquiries, respecting existing conversation ownership. Designers cannot access this screen.

- Claim/take over uses the existing lead creation workflow explicitly, preserves an existing owner, assigns an unowned sales conversation and pauses automated reminders. Administrators assign leads through the existing staff assignment workflow.
- Pause stops pending reminders. Opt out revokes contact-level reminder permission.
- Link paid order records a conversion only for a visible paid/part-paid order belonging to the same customer. An old order discovered by phone alone is not treated as the new preview's conversion.
- Captured website payments enter **Website payment intake** and suppress reminders immediately. Staff create/choose the real order through the existing workflow, then use **Reconcile to order**. This invokes `postPayment` with stable Razorpay references, verifies the recorded receipt and avoids duplicate credits. No fictitious salesperson, designer or order is generated to fill missing booking details.

## Configuration

Keep both integration and sending switches off until configuration and staging verification are complete. No real customer sends or production migrations are part of local implementation.

Website Worker secrets/configuration:

| Name | Purpose |
| --- | --- |
| WEBSITE_INTEGRATION_ENABLED | `0` by default; set `1` for rollout |
| WEBSITE_PORTAL_ORIGIN | `https://staff.invitestory.in` |
| WEBSITE_BRIDGE_SECRET | Random shared server-only secret, at least 32 characters |
| WEBSITE_TURNSTILE_SITE_KEY | Public site key for the actual website hosts |
| WEBSITE_TURNSTILE_SECRET | Server-side Turnstile validation secret |
| WEBSITE_ALLOW_LOCAL | Optional `1` solely for a localhost portal during development |

Portal Worker secrets:

| Name | Purpose |
| --- | --- |
| WEBSITE_BRIDGE_SECRET | Same server-only secret as the website |
| WEBSITE_RESTORE_SECRET | Separate stable random secret, at least 32 characters |
| WEBSITE_PREVIEW_TEMPLATE_ID | Approved Gupshup template for requested preview delivery |
| WEBSITE_REMINDER_TEMPLATE_ID | Approved marketing template for purchase reminder |
| RAZORPAY_KEY_ID | Same merchant key ID used by website checkout |
| RAZORPAY_KEY_SECRET | Merchant API secret, portal only |
| RAZORPAY_WEBHOOK_SECRET | Separate webhook signing secret, portal only |

Reuse the existing Gupshup configuration and sales business-number setting. Both templates receive three parameters in order: customer first name, invitation design name, full saved-preview link. Include an opt-out instruction in the approved template; do not label a purchase reminder as an order-status utility message. Configure Turnstile hosts and validate both `capture` and `checkout` actions. The server fails closed on bot-verification failure; personalisation itself remains available.

Website `/api/website/*` routes are same-origin server proxies. They send server credentials to the portal and never forward staff cookies. The website Worker config runs these API routes before static assets. The Node development server also supports the gateway. When integration is explicitly disabled, the existing preview and checkout remain available. A configured gateway returning a server error hides capture controls and blocks checkout with an actionable error; it never silently falls back to unsigned checkout. Capture controls require payment API and webhook configuration as well as the restore secret and business number.

Configure Razorpay webhook URL `https://staff.invitestory.in/api/webhooks/razorpay` for `payment.captured`, `payment.authorized`, and `payment.failed`. Raw-body HMAC validation, captured-state/amount/currency checks and durable event/payment references protect reconciliation. Authorized/failed events never regress a captured payment. Website order creation calculates catalogue/add-on prices on the server and works without a preview contact. A timeout creating a provider order is held for staff/provider reconciliation rather than silently making another chargeable order.

## Local validation and rollout

Migration `0069_website_previews.sql` is additive. Apply the full migration history to an isolated local D1 database before deploying code that reads the new tables. The SQLite fallback suite also applies the complete history to an in-memory database, never production.

From the staff repository:

```sh
npm run typecheck
npm test -- test/website_previews.test.ts
# Fallback if workerd cannot open a localhost listener; requires Node 24+:
node node_modules/vitest/vitest.mjs run --config test/website-sqlite.config.mjs
```

From the website repository:

```sh
node --test tests/*.test.mjs
# Regenerate and review server pricing when catalogue/add-ons change:
node tools/build-website-catalogue.mjs /Users/amnas/Desktop/staff.invitestory-main/src/website_catalogue.ts
```

The generator covers design catalogue prices. Package bases and add-on prices in `src/website_payments.ts` must also remain aligned with `scripts.js`; changes require review/tests.

Rollout sequence:

1. Review both repositories' diffs, preserve existing unrelated changes, and back up D1. Apply migrations locally, then run typecheck and integration/regression suites.
2. Configure a staging environment, test-mode Razorpay keys/webhooks, approved template IDs and Turnstile. Keep customer messaging disabled.
3. Verify capture, incoming number confirmation, cross-device restoration, payment webhook reconciliation, staff order linking, STOP, pause and duplicate-request handling with synthetic contacts.
4. As a separate authorised rollout, apply production migration and deploy the portal first, with sending off. Configure the website gateway, then deploy the website and enable integration.
5. Verify confirmed website payments suppress reminders before enabling `website_reminders_enabled` in the portal. Start with one reminder and monitor confirmed purchases, delivery failures and opt-outs.

Pending sends can be disabled immediately with the portal setting; disable the website integration flag to revert to names-only preview and the pre-existing checkout path. Preserve payment reconciliation/webhook handling for previously created Razorpay orders.

Known boundary: the migration expires access tokens but does not automatically delete enquiry/consent/payment audit records. Define a retention policy before broad rollout; preserve accounting records according to the business's existing retention requirements. Refunds/chargebacks remain in the existing accounting workflow; they must not restart purchase reminders.
