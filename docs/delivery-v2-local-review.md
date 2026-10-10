# Delivery v2: INR and USD implementation, unpublished

> Historical implementation report. The later [staged release plan](delivery-staged-release.md) supersedes rollout/rollback, fresh-legacy rejection, inactive-UI and associated test-count statements below. [Production access evidence](delivery-production-access.md) records the remaining publication gates. Prior patches are preserved.

Latest scope: user approved USD12 at double the existing USD24 fee, i.e. $18. All NEW versioned orders in both currencies use 48h standard, optional 24h (+799 INR / $9) or 12h (+1499 INR / $18). Dearly includes Email RSVP but no free expedited speed for new INR or USD purchases. Base prices and other offers are unchanged. The USD price question is resolved; publication remains held.

Bases: website main 50a1dae241971030772a50fdb9e0a2025258e1b8; staff d46fb571396c886a164e89a1f983dc8e1a706f88; Dearly submodule 8422091867db8952f31e9571552e39c5642ea6aa. Earlier local commits f7c0aaa and 1dd5fab (website), 42973e8 (staff), and 0b68781 (Dearly), plus their existing patches, remain preserved. This report supersedes the earlier INR-only scope. Actual deployed-source equivalence is unverified. No applicable AGENTS.md was present in either repository.

## Behavior and contract

Exactly one speed is selected and charged. Dearly versioned totals are INR4999/5798/6498 and USD75/84/93 for 48/24/12h, with Email RSVP included. Other package bases and RSVP add-on prices are unchanged. First draft is due after BOTH payment and complete details; elapsed hours include overnight. Existing paid and pending purchases retain original prices and promises.

The website selector, totals, breakdown, upsell, first-draft reassurance, FAQs, landing pages, Dearly copy and local demonstration support both currencies. Switching currency explicitly resets the selection to standard and updates all fee labels. No currency conversion estimate is used for the approved USD fees.

Config advertises checkoutContracts:[1,2], deliveryV2Currencies:['INR','USD'] and deliveryV2SalesEnabled. The sales flag requires the new opt-in WEBSITE_DELIVERY_V2_ENABLED input to equal '1'; no configuration was provisioned. If a currency list is present the client requires a valid array containing the requested currency. An absent list retains compatibility with the earlier INR-only v2 contract, never implying USD support. An old pre-v2 server, an INR-only server for USD, malformed capability data or a disabled gateway cannot open new checkout.

V2 request: checkoutVersion:2, deliverySpeed:standard_48h|express_24h|express_12h, currency:INR|USD, tier, optional designId, emailRsvp:Boolean, clientKey and optional token. Browser verification adds turnstileToken; the existing gateway validates/removes it. V2 omits the legacy express field so old servers reject it rather than silently ignore the new speed. Unknown/contradictory fields, invalid speeds/versions and unsupported currencies fail closed.

V2 response: existing orderId/keyId/amount/currency plus checkoutVersion:2, deliverySpeed and deliverySnapshot:{speed,firstDraftHours,surcharge,currency,startsAfter:'payment_and_complete_details'}. Amount/surcharge are minor units: INR fees 0/79900/149900; USD 0/900/1800. The browser requires exact version, speed, hours, currency, fee and start-condition acknowledgement; an amount/currency mismatch prevents SDK opening and retains the pending identity.

The staff server uses the real catalogue design price or existing package base. Immutable new snapshots are stored in existing selection_json and propagated to receipts, staff payment intake display and the existing ledger note when a payment is linked. No migration or new personal data is needed. Historical rows, ledger entries, paid promises and legacy normalized selection/hash serialization are not rewritten. Legacy express=true always means24h, never12h. Prior INR-v2 hash shape and snapshot property ordering/values also remain unchanged.

Saved payment review replays the exact original serialized request/token/UUID. It shows the stored server amount and promise before a separate Continue action. Existing uncertain/creating/completed attempts remain blocked for reconciliation; no ID is silently rotated or dropped. The server resolves existing pending attempts before gating fresh purchases. New receipts use the immutable snapshot; malformed/missing versioned snapshots display an unavailable promise rather than inventing a legacy48h promise.

The old /api/commerce/order OpenAPI timing enum/payment metadata was not the secure checkout contract. It remains documented as unverified/deprecated; the versioned /api/website contract is explicitly unpublished.

## Validation

- Website npm test: 107 passed, zero failures. Final log /tmp/delivery-usd-tests-final.log.
- Website Python suite: 10 run, 9 passed, one skipped because cwebp is unavailable.
- npm run build:bundle passed. The build wrapper can upload sourcemaps, so only the local bundling step was run.
- Staff typecheck passed. Focused delivery/integration tests: 35 passed. Final full suite: 597 passed, one failed (598 tests,80 files). The test/views.test.ts:250 dashboard-copy failure reproduces on pristine d46fb571 (13 passed/one failed in that baseline file); no unrelated fix was made. Evidence /tmp/staff-usd-typecheck.log, /tmp/staff-usd-focused.log, /tmp/staff-usd-full.log and /tmp/staff-baseline-views.log.
- tests/delivery-v2-browser-qa.py uses the actual index.html at390x844 and digital-wedding-invitations.html at1440x900, each in INR and USD. Installed Chromium, Python Playwright, local HTTP; external requests blocked and portal/payment SDK mocked. Normal clicks, no forced interaction. All tiers/speeds/totals, exclusivity, Dearly RSVP, breakdowns, fee labels, currency reset, backend rejection, amount/currency mismatch, double clicks, reload UUID persistence, rollback with fresh sales disabled, saved legacy INR AND USD resume, v2 resume, historic/new/malformed receipts and old-server/INR-only capability gates passed. No uncaught page errors.
- tests/delivery-browser-qa.py: isolated proposal layout plus original legacy rejection/reload/A-B-A/rollback-to-original-main identity regression passed. Proposal now uses approved USD18.
- Backend tests cover every design and currency, strict/contradictory input, authoritative pricing, concurrent claims, provider uncertainty/mismatch, frozen pre-USD INR snapshot/hash, historical INR/USD retries with sales disabled, webhook reconciliation after rollback, staff display and ledger propagation.
- Independent backend and frontend reviewers found no remaining code blockers. Frontend61 targeted tests passed; final capability refinement25 checkout tests passed. Documentation was corrected to match the absent-versus-explicit currency-list semantics. git diff --check passed.
- Screenshots: /tmp/delivery-v2-INR-390.png, /tmp/delivery-v2-USD-390.png, /tmp/delivery-v2-INR-1440.png, /tmp/delivery-v2-USD-1440.png. USD mobile screenshot visually inspected: +$9/+$18, Dearly RSVP included, $93 total at12h.

Latest USD75 copy correction verification: full website suite107/107 passed again (/tmp/dearly-base75-tests.log); Chromium at390x844 and1440x900 verified dearly/index.html and dearly.html both show USD75, checkout totals75/84/93, included RSVP and unchanged INR4999 (/tmp/dearly-base75-browser.log). Active Dearly/main price-copy search found no remaining USD80 reference. Historical audit documents and prior test evidence/bundles are preserved. Exact latest files: dearly/index.html, dearly/README.md, the parent dearly gitlink and this review document. Staff application and pricing code are unchanged.

## Remaining blockers and operational limits

The release hold still forbids pushes, PR publication, merges, deployments, real orders/payments and infrastructure/credential changes; none occurred. Production source/configuration/migration equivalence and a coordinated rollout remain unverified/unperformed. The known baseline dashboard test failure remains separate from this work.

No verified complete-details timestamp exists in this integration. Staff must verify payment plus complete details and manually track the purchased elapsed-hour promise through their existing process. The patch does not invent timestamps, automatically alter deadlines, modify authentication or add personal data. Operational ownership of that manual start remains necessary before release.

Cutover availability: fresh legacy purchases in BOTH currencies are now rejected, even when the new-sales flag is off. Deploying the backend before coordinated client/capability activation would pause all fresh website sales. Existing pending INR/USD legacy and v2 payments remain supported. No production flag was changed.

Resolved with explicit user approval to keep Dearly at USD75: corrected the stale USD80 display in dearly/index.html and the related base-price row in dearly/README.md. README timing documentation now matches the already-approved delivery options. Authoritative checkout/catalogue bases remain INR4999 / USD75. Other tiers, add-on prices, historical orders and pending payment amounts were not changed. Historical audit documents retain their original findings.

## Safe rollback and local delivery

Before any real v2 attempt exists, local commits can be reverted without data changes. After v2 attempts/purchases exist, disable NEW sales in both currencies while retaining these client/server readers, original retry serialization, immutable snapshots, reconciliation and staff promise display. Browser QA verifies hidden fresh speed choices, disabled new Pay, and saved legacy INR/USD and v2 continuation; backend tests verify replay and captured reconciliation while sales are disabled.

Do not downgrade to readers that lose USD-v2/INR-v2 support, remove PR6 history, clear session storage, overwrite promises or replace uncertain UUIDs. Do not restore fresh legacy checkout as a rollback shortcut. Earlier patches remain available but are not safe runtime rollback targets once newer-contract purchases exist.

Updated website/staff/Submodule incremental and combined patches are separate /workspace artifacts. The newest Dearly gitlink references a LOCAL commit; its matching bundle accompanies the patch so the exact object is available without any remote push. Existing patch artifacts remain unchanged. Latest local hashes and artifact links are in the task response.
