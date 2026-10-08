# Preview and WhatsApp flow audit — 8 October 2026

## Deployment update — 9 October 2026

Corrective website deployment is confirmed by supplied Wrangler output: version `3e581978-2b98-41cc-9ead-c8fc33fc763f`, both `invitestory.in` and `www.invitestory.in` custom domains enabled, and the public Turnstile site key present. A subsequent browser check independently loaded the live homepage and preview dialog. WhatsApp saving appeared collapsed and optional; opening it showed an unchecked consent box promising exactly one follow-up. This also confirms the deployed website retrieved the revised staff consent wording. The workers.dev and preview-URL warnings concern those alternate URLs; the output confirms the two production custom domains remain enabled. Real message delivery and payment verification remain outstanding.

Subsequent IPv4-preferred website deployment succeeded as version `034597b3-2b38-49f0-acd3-2b657f3e5951`. Its warning and final triggers showed the two dashboard custom domains omitted from local configuration; its asset upload also included `dist/serve.mjs.map`. Corrected local configuration now explicitly retains `invitestory.in` and `www.invitestory.in`, records the public Turnstile site key, and excludes `/dist/` from static assets. The corrected configuration passed a Wrangler dry run. A corrective website deployment and domain/config verification are still required; do not treat the workers.dev-only deployment as full production completion.

The user supplied terminal output confirms that migration `0070_website_preview_delivery.sql` applied successfully to production and the staff portal deployed as version `1fbf2fc9-a2f2-443b-b47b-2e4810e6038b`. Staff typechecking, all 23 integration tests and the dashboard CSS build passed. All 54 website tests also passed.

The website Wrangler deployment then failed with `fetch failed`, so the revised website deployment is not confirmed. A website-only retry was submitted through the tool and is awaiting execution. The full deployment script need not be rerun. Independent public config checks were unavailable: the web tool could not access the endpoint and the browser reported `ERR_BLOCKED_BY_CLIENT`.

Earlier installation/pending notes below describe the audit-time state; the staff patch and migration are now applied according to the supplied successful deployment output. Real WhatsApp delivery, opt-out and payment checks remain outstanding.

## Customer experience

Names-only previews remain free and do not require a number. The revised website puts WhatsApp saving inside a collapsed optional section. A number alone is insufficient: the visitor must also select the consent checkbox and confirm the request from their WhatsApp account. Consent is cleared after each successful capture and on reset.

The revised consent promises a saved preview and one follow-up about ordering. This matches the two jobs: one requested preview message and one purchase follow-up.

The follow-up requires confirmed preview delivery and at least 60 minutes since both delivery and the last website activity. It runs only from 09:00 to before 20:00 India time, expires 24 hours after verification, and is limited to one purchase follow-up per contact in seven days. STOP revokes consent and cancels pending messages; other replies, including Help, pause follow-ups for staff handling. Captured purchases suppress reminders, including purchases through another newer preview for the same customer. Failed preview delivery cancels the follow-up. These rules reduce interruptions; they cannot guarantee how every customer will feel.

## Evidence and limits

- Website automated tests: 54 passed.
- Staged staff integration SQLite tests: 23 passed, with mocked messaging/payment providers.
- Existing webhook regression tests: 21 passed.
- Staged staff TypeScript check passed.
- Website Wrangler dry run completed successfully; its optional log write emitted a sandbox permission warning.
- Both staff patches passed `git apply --check` against the current checkout.
- Live website: entered Asha and Ravi with no phone number or consent; their names appeared in the Marigold Bhavan preview.
- The live website still showed the older phone fields and consent wording. The revised code has not been deployed.
- No real WhatsApp message, customer opt-out, payment, or production webhook reconciliation was exercised in this audit. The public config indicating enabled checkout does not prove those actions work.
- The production database messaging switch was not independently queried. Keep automated sending off until the controlled production checks below pass.

## Installation and rollout

Website changes are saved in this repository. Staff changes are staged in `/private/tmp/invitestory-natural-flow` and preserved in `docs/portal-natural-flow.patch`. Dashboard-variable preservation is in `docs/portal-dashboard-vars.patch`. The staff patch tool request is awaiting execution approval; application is not confirmed.

If applying manually, first inspect `git status` in the staff checkout. These patches are narrow and preserve unrelated edits; a full Wrangler deployment publishes the complete current checkout, so review any unrelated changes before deployment.

```sh
cd /Users/amnas/Desktop/staff.invitestory-main
git apply --check /Users/amnas/Desktop/invitestory-main/docs/portal-natural-flow.patch
git apply /Users/amnas/Desktop/invitestory-main/docs/portal-natural-flow.patch
git apply /Users/amnas/Desktop/invitestory-main/docs/portal-dashboard-vars.patch
npm run typecheck
npm run db:apply:remote
npm run deploy
```

Do not reapply a patch if it is already installed. Migration `0070_website_preview_delivery.sql` must precede deploying code that reads the new delivery column. It raises old reminder delays below 60 minutes and does not guess historical delivery times. `keep_vars` preserves dashboard template IDs and the website Turnstile public key across subsequent deployments.

After the staff deployment, deploy the revised website through the existing Git build flow. Verify the optional collapsed WhatsApp section and new consent wording.

Before enabling automatic sending, use an explicitly designated test recipient to verify saved-preview delivery, link restoration, Help pausing and STOP cancellation. Then verify a controlled payment is reconciled and cancels pending follow-ups, including a duplicate webhook. The user must perform any real payment. Also check the existing DIY site's webhook behavior on the shared Razorpay merchant; its implementation was unavailable locally.
