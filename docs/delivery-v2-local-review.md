# Delivery v2: coordinated local implementation, release held

This supersedes the partial implementation status in delivery-change-review.md. The original local preparation commit f7c0aaa35317017fe559f05c66cd69bdac5082c4 and /workspace/invitestory-delivery-local.patch remain preserved.

Bases: website main 50a1dae241971030772a50fdb9e0a2025258e1b8 (remote main rechecked unchanged); staff d46fb571396c886a164e89a1f983dc8e1a706f88; Dearly submodule 8422091867db8952f31e9571552e39c5642ea6aa. Staff source is now available and inspected. Deployed-source equivalence is not verified. No applicable AGENTS.md was present in either repository.

## Delivered locally

New INR purchases use one first-draft speed: standard 48h included, 24h +799, or 12h +1499. New INR Dearly no longer includes expedited delivery; Email RSVP remains included. Prices are calculated by the staff server using the actual design catalogue or package base. The website has exclusive radios, consistent total/breakdown/upsell/reassurance, INR-specific copy across landing pages and Dearly, and USD-preserving currency switching. Currency changes reset the delivery choice; no USD 12h price is exposed or inferred.

The new contract is capability gated; no configuration or environment flag was provisioned. New INR sales are disabled without explicit server support and enablement. The existing USD legacy path, prices and Dearly benefits remain unchanged. New v2 INR payloads omit express, causing an old server to reject them rather than silently ignore the new speed. Both client capability checking and response acknowledgement are required; a version/speed/promise/price/currency mismatch blocks the payment SDK and preserves the pending key.

Immutable new delivery snapshots reach browser success summaries, thank-you receipts, existing staff payment intake display and the existing ledger note when linking payment to an order. Legacy express=true remains 24h forever; no historical row, payment, hash, ledger note or promise is rewritten. Versioned receipts with malformed/missing snapshots show an unavailable promise instead of guessing a legacy one.

Saved payment attempts can be explicitly reviewed and resumed from the drawer. This replays the original serialized request, original token and UUID, shows the saved server price/promise, then offers a separate Continue button. Existing uncertain/completed attempts stay blocked for reconciliation. No IDs are discarded or silently rotated, including PR6 multi-attempt history.

## Coordinated contract

Staff config adds checkoutContracts:[1,2] and deliveryV2SalesEnabled. The latter is true only when the new opt-in input WEBSITE_DELIVERY_V2_ENABLED is '1'. It defaults off. The same-origin website gateway retains its existing authentication/verification and forwards these fields.

V2 request: checkoutVersion:2, deliverySpeed:standard_48h|express_24h|express_12h, currency:INR, tier, designId (optional), emailRsvp:Boolean, clientKey and optional token. Browser verification adds turnstileToken, which the existing gateway validates/removes. Unknown or contradictory v2 properties, express, invalid versions/speeds and USD v2 are rejected server-side.

V2 response: existing orderId/keyId/amount/currency plus checkoutVersion:2, deliverySpeed and deliverySnapshot:{speed,firstDraftHours,surcharge,currency:'INR',startsAfter:'payment_and_complete_details'}. Amount and surcharge are minor units. New snapshots are saved in the existing selection_json. Fingerprints exclude the snapshot, but include the versioned canonical selection; legacy canonical JSON order/hash is unchanged. Existing pending attempts return stored amounts and snapshots before sales gates. No database migration is required.

The unrelated /api/commerce/order OpenAPI timing declarations were not a valid server contract. The unsupported speed enum/payment metadata were removed; the old path is marked unverified/deprecated and the new checkout contract is explicitly described as unpublished. This does not claim deployed support.

## Validation

- Website npm test: 101 passing, zero failures.
- Website Python suite: 10 run, 9 passed, 1 skipped because cwebp is unavailable.
- npm run build:bundle passed. The full build wrapper can upload sourcemaps, so only its local bundling step was run.
- Staff typecheck passed. Focused integration/delivery tests: 30 passing. Final full suite: 592 passed, 1 failed across 80 files. The single test/views.test.ts:250 dashboard-copy failure reproduces on pristine d46fb571 (13 passing/1 failing in that baseline test file). No unrelated fix was made.
- tests/delivery-v2-browser-qa.py: actual index.html at 390x844 and digital-wedding-invitations.html at 1440x900, installed Chromium/Python Playwright/local HTTP. All external requests blocked, portal and SDK mocked. Covers all tier/speed totals, exclusive selection, price breakdown, USD legacy behavior, currency reset, rejection and mismatched amounts, double clicks, reload UUID retention, sales-disabled rollback with saved review/resume, 12h receipts, old Dearly 24h receipts, malformed v2 receipt handling, and old-server gate. No uncaught page errors. Mobile screenshot visually inspected; it exposed a stale breakdown row which was corrected and tested.
- Original proposal/browser retry regression harness retained. Unit cases additionally cover unknown/contradictory input, acknowledgement mismatch, fresh-sales gates, original-token retry replay, legacy hash compatibility, concurrent claims, captured webhook reconciliation after rollback, immutable snapshots, staff display/ledger note and all catalogue INR combinations.
- Separate independent reviewers examined backend compatibility/idempotency and frontend behavior. Reported strict-input, copy, saved-design metadata and receipt issues were corrected. Final frontend targeted rerun before the last receipt-edge fix was 53/53; full suite and browser QA were rerun after fixes.
- Evidence logs: /tmp/delivery-v2-tests-final.log, /tmp/staff-delivery-tests-final.log, /tmp/staff-full-tests-final.log, /tmp/staff-baseline-views.log. Screenshots: /tmp/delivery-v2-390.png and /tmp/delivery-v2-1440.png.

## Remaining blockers and manual operations

This remains unfinished and NOT release-ready. USD 12h pricing/currency scope is unresolved; USD remains legacy. Actual deployed staff source/config/migration equivalence has not been verified. The release hold prohibits pushes, PRs, merges, deployment, provider requests and infrastructure changes; none were performed.

Timing begins only after BOTH payment and complete details, with elapsed hours including overnight as confirmed by the user. No verified complete-details timestamp or corresponding deadline workflow exists in the reviewed integration. Staff must manually verify the two conditions and track the purchased commitment in the existing process. The patch records/displays the promise; it does not invent timestamps, schedule staff deadlines, change authentication or collect new personal data.

IMPORTANT cutover availability constraint: fresh legacy INR orders are rejected by the new staff code even when the new-sales flag is off. A backend-first rollout without coordinated frontend activation pauses new INR sales. Existing pending INR retries and USD purchases remain supported. This requires a separately authorized coordinated cutover, not blind independent deployments. The unrelated baseline dashboard test failure also remains documented.

## Safe rollback

Before any real v2 purchases exist, the local commits can be reverted without data changes. After v2 attempts/purchases exist, safe rollback means disable new INR sales while keeping these client/server readers, exact retry serialization, immutable snapshots, webhook reconciliation and staff promise rendering. Browser QA verifies hidden new choices, disabled new INR Pay, and successful explicit v2 saved-payment continuation. Staff tests verify existing v2 replay and captured-payment reconciliation with sales disabled.

Do not roll back to an old server that cannot recognize v2 retries or an old frontend that could misinterpret new receipt links. Do not remove PR6 multi-attempt support, clear session storage, rewrite old promises or manufacture replacement UUIDs. This patch makes no production changes requiring an undo.

## Local deliverables

Website incremental and combined patches, staff patch and Dearly submodule patch are separate /workspace artifacts. The combined website patch includes the preserved first preparation commit. Dearly's local commit is referenced by the website gitlink; its patch and bundle must accompany that change because no submodule commit was pushed. All local branches/commits and final hashes are reported in the task response.
