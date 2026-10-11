> Historical preparation record. Superseded by [coordinated v2 implementation review](delivery-v2-local-review.md); original findings below describe the earlier source-blocked stage.

# Delivery speeds: unpublished local preparation

Status: RELEASE HOLD. Partial implementation only; not ready for checkout or publication.
Base: main 50a1dae241971030772a50fdb9e0a2025258e1b8, verified with read-only ls-remote on 2026-10-10.
No AGENTS.md or applicable .agents skills were present in this workspace/repository. Existing public agent customization skills do not govern repository editing.

## Prepared changes

- Isolated local proposal at docs/delivery-preview/index.html, with a pure display-estimate model. INR standard 48h is included; 24h +799 and 12h +1499 are mutually exclusive. All hours start after payment and complete details, including overnight. INR Dearly has optional speed upgrades and included Email RSVP.
- USD keeps current base prices, +$9 24h, and Dearly included 24h/Email RSVP. No 12h USD price. Switching a 12h INR selection to USD resets it to standard (or Dearly's existing included 24h). This is a preview choice, not a payment migration.
- The prototype is under docs/, excluded from deployed assets by the existing .assetsignore. No production page imports its policy. Checkout is disabled.
- Existing production client rejects proposed deliverySpeed/deliveryAddon/deliveryHours fields before fallback, verification, retry mutation or payment requests. This is a compatibility guard, not server authorization.
- Existing order drawer blocks payment SDK opening if the server quote differs from its displayed amount or currency, preserving the pending retry identity.
- Historic receipts and production express Boolean semantics remain unchanged: true means 24h, never 12h.

## Exact blocking dependency

The authoritative route is POST https://staff.invitestory.in/api/website/checkout. website-bridge.js forwards the same-origin /api/website/checkout to WEBSITE_PORTAL_ORIGIN, configured in wrangler.jsonc and .env.example. docs/website-portal-rollout.md names staff repository src/website_payments.ts as the package/add-on price authority, and src/website_catalogue.ts as the generated catalogue. The staff source repository is absent here; older documentation identifies its local name as staff.invitestory-main. A remote repository URL or current server commit was not inferred.

The known request is designId, tier, currency, express:Boolean, emailRsvp:Boolean, optional token, clientKey and turnstileToken (verification token removed by bridge). Existing response amount is minor units, plus currency, orderId and keyId. This does not establish server support for 12h or charging Dearly for 24h. Do not overload express=true with 12h or invent a new accepted schema/version.

Needed before activation: inspect actual checkout validation and server pricing, agree a single mutually exclusive speed field/price contract, preserve historical order snapshots and existing idempotency mappings, return and persist the purchased speed and promise with the authoritative quote, and test payment reconciliation/receipts using mocks. Confirm behavior for existing unpaid retries whose Dearly prices/benefits differ from new orders. Do not mutate paid orders or silently rotate uncertain retry IDs. USD 12h price and any change to USD Dearly benefits need explicit product scope; keep existing USD behavior meanwhile.

## Remaining integration/copy work (deliberately not advertised as implemented)

Once the server contract is known, update scripts.js package/drawer forced Dearly selection, charging exclusion, totals, extras, checkout metadata and FAQ; sales.js comparison/planner/upsell/delivery labels; index.html and digital-wedding-invitations.html duplicated visible copy and structured FAQ; dearly.html marketing metadata and content; and the separate dearly submodule copy (currently pinned 8422091867db8952f31e9571552e39c5642ea6aa). Dearly Email RSVP stays included.

paid-order.js plus receipt rendering/serialization in scripts.js and receipt.html must use explicit new-order speed snapshots while legacy express=true remains 24h. Do not rewrite old receipt interpretation or existing paid promises. Keep the revision window distinct from first-draft turnaround.

openapi.json currently declares standard_24h/express_12h on /api/commerce/order, a different placeholder commerce endpoint with inconsistent payment declarations. It is NOT evidence of support in /api/website/checkout. Its timing/schema needs reconciliation with implemented routes, not a speculative rename that claims backend support. Actual storefront and these copies remain unchanged in this patch. PR4 WhatsApp work was not duplicated.

## Validation and evidence

- npm test: 91 passing, zero failing.
- python -m unittest discover -s tests -p '*_test.py': 10 run, 9 passed, 1 skipped because cwebp is unavailable.
- npm run build:bundle: passed. Full npm run build was intentionally not invoked because it can upload sourcemaps; the local build component was run directly.
- python tests/delivery-browser-qa.py: installed Chromium, Python Playwright, local HTTP server, all external browser requests blocked. 390x844 mobile and 1440x900 desktop passed across all tiers/speeds, exclusive radio selection, totals, RSVP, INR/USD switching, disabled checkout, no horizontal overflow and no page errors.
- Browser mock portal: rejected request, reload and A→B→A retry identity retention, rollback to exact current-main client retaining both IDs, unsupported speed rejection before a request, and legacy receipt interpretation all passed.
- Additional unit checks cover server amount/currency mismatch and rejection before SDK opening; historical Dearly receipt benefits; unknown speed fields before disabled-integration fallback. Existing full suite covers UUID/crypto/storage failure/concurrency and checkout submission behavior.
- Independent agent review: no blocking issue in this LIMITED scope; independently reran 46 relevant tests, all passing. Its preview-copy finding was fixed before browser QA. It explicitly confirmed the full delivery feature remains blocked.
- Screenshots: /tmp/delivery-preview-390.png and /tmp/delivery-preview-1440.png (mobile screenshot visually inspected).
- git diff --check passed. No real checkout, payment, message, infrastructure change or personal-data mutation occurred. No push, PR, merge or deployment.

## Safe rollback

Revert the local task commit to the verified main base if desired. This patch neither changes checkout identity serialization nor migrates storage. Browser rollback to 50a1dae confirms existing A/B IDs survive. Keep PR6's multi-attempt reader/writer and UUID protections: do not roll back past PR6, clear session storage, or deploy a pre-PR6 reader that discards the attempts history. Historic paid records and receipts require no rollback. No server/data changes exist to undo. A future full-feature rollback will require coordinated server support for previously sold speed snapshots and pending retry IDs; do not remove that support when hiding new choices.
