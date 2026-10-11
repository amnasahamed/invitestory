# Delivery expand / activate transition — local, unpublished

This document supersedes the rollout, rollback and fresh-legacy-sales statements in `delivery-v2-local-review.md` and the earlier `/workspace/delivery-release-preflight.md`. Prior patches are preserved. Nothing has been pushed or deployed.

## Contract and scope

The compatibility transition applies to the existing **enabled secure checkout gateway**. Before deployment, verify the actual production gateway is enabled and source-equivalent to the reviewed legacy contract. The old website also contains an unsigned fallback when integration is disabled; this preparation does not restore that path or claim uninterrupted operation for that unverified configuration. Config errors, malformed responses and disabled checkout remain fail-closed.

Legacy requests retain legacy prices and promises, including Dearly's included 24-hour first draft and Email RSVP. The expanded backend accepts fresh legacy requests before and after activation so cached clients are not stranded or charged terms they never saw. New v2 offers remove included expedited delivery from Dearly and charge exactly one selected speed: INR 0/799/1499 or USD 0/9/18 for 48/24/12-hour first draft. Dearly remains INR4999/USD75 with included Email RSVP. The user approved USD12 at $18.

This means cached legacy clients can continue receiving the old Dearly benefit after activation. A universal immediate retirement of that benefit would conflict with preserving cached-client checkout; retiring legacy sales requires a separate migration decision. No automatic v2-to-v1 retry is allowed.

## Stages

1. **Verify production before any push.** Resolve actual provider/domain/Worker targets, active source/version IDs, Git auto-deploy triggers, secure gateway state and usable rollback targets. See `delivery-production-access.md`. GitHub source access alone is insufficient.
2. **Expand backend with v2 activation absent/off.** Deploy the compatible backend only after verification. It accepts fresh v1 with unchanged terms, retains pending v1/v2 retries and reconciliation, and rejects fresh v2 until activated. No schema migration or new infrastructure is required.
3. **Deploy bridge website and neutral static copy.** The website uses explicit legacy terms against a healthy old server or expanded server with activation off. It offers v2 only with verified version/currency capabilities and activation on. Publish the reviewed Dearly submodule object before the parent gitlink through the verified non-automatic-publication sequence; determine exact order from provider triggers, not assumption.
4. **Verify the staged deployment using read-only capabilities and approved mock/staging checks.** Do not create live orders or payments. Confirm the expanded server is serving every checkout path and the correct website build/submodule is active.
5. **Activate separately.** The existing code input `WEBSITE_DELIVERY_V2_ENABLED` must be set to `"1"` on the verified staff Worker environment. This is an explicit production configuration action, not performed here. It requires authorized existing-account access and a coordinated operator change. No credentials, infrastructure or bindings are created. Config-loaded new pages adopt v2; cached/open legacy pages remain v1. There is no mandatory checkout pause.

## Client/server matrix

| Client / reviewed offer | Legacy secure server | Expanded server, flag off | Expanded server, flag on |
| --- | --- | --- | --- |
| Cached legacy client | v1 legacy terms | v1 legacy terms | v1 legacy terms |
| Bridge page selecting a fresh offer | Legacy terms, v1 | Legacy terms, v1 | Verified v2 terms, v2 |
| Already-open bridge legacy drawer | v1 legacy terms | v1 legacy terms | v1 original terms |
| Already-reviewed v2 offer | Never send as v1; incompatible server blocks | Fresh v2 rejected clearly; no downgrade | v2 selected terms |
| Existing pending legacy attempt | Original legacy ID/amount | Original legacy ID/amount | Original legacy ID/amount |
| Existing pending v2 attempt | Not a safe rollback target | Original ID/amount/snapshot | Original ID/amount/snapshot |

The drawer contract is frozen when opened. Activation or config completion cannot silently change that reviewed contract; reopening explicitly selects current offers. Currency changes must keep the reviewed contract and reset speed choices consistently. A v2 request rejected during deactivation retains its attempt identity; the buyer receives an explanation and can explicitly reopen/review the available offer or review the saved payment. That isolated stale-offer rejection is not a planned outage of fresh legacy sales.

## Rollback

Turn v2 activation off on the **expanded server** and retain its v2 readers, immutable selections, webhook reconciliation and request IDs. Fresh legacy checkout remains available; new pages use legacy offers. Open v2 pages cannot silently switch terms. Existing pending v1/v2 attempts remain resumable under their original price and promise regardless of activation.

Do not deploy pre-v2 backend binaries after any v2 attempt exists. Do not clear session storage, replace uncertain UUIDs, rewrite old promises or restore a frontend that discards migrated retry history. Keep the bridge frontend available to resume all attempts. A code rollback must target a verified compatible version, not merely a previous commit. No production rollback is needed for this task because nothing was published.

## Operational actions still pending

- Existing production account access and deployment/source verification, including actual auto-deploy behavior and compatible rollback IDs.
- Separate activation flag change in the verified environment, after both stages are verified. No flag provisioned locally or remotely.
- Staff must verify both payment and complete details, then track the purchased elapsed-hour commitment (including overnight) through the existing process. No complete-details timestamp or automated deadline is invented.
- Legacy contract retirement is intentionally outside this transition. Existing cached clients retain their displayed benefit.

Tests and final local commit identifiers are recorded in the task completion report. All browser/provider testing uses mocks only.

## Local validation evidence

- Website full suite: 116/116 pass (`/tmp/delivery-staged-tests-final.log`); final local bundle passes (`/tmp/delivery-staged-bundle-final.log`).
- Expanded backend: focused 39/39 pass; typecheck passes; full suite 601 pass / one existing dashboard-copy failure reproduced on unchanged main. Logs: `/tmp/staff-expand-focused.log`, `/tmp/staff-expand-typecheck.log`, `/tmp/staff-expand-full.log`.
- Browser matrix: actual index at 390×844 and landing page at 1440×900, INR and USD, with mocked portal/payment SDK only. Tests cover old server and expanded inactive server fresh legacy purchases for all tiers, Dearly included24/RSVP, activation after a legacy drawer opens, cached v2 request rejection on deactivation, known withdrawal blocking without downgrade, exact legacy/v2 saved retries after rollback, original UUIDs, receipts and currency capability limits. Final log: `/tmp/delivery-staged-browser-final.log`.
- Earlier browser regression remains passing: original-main retry serialization and A/B/A/reload IDs, backend rejection, historic receipts, and isolated proposal layout. Log: `/tmp/delivery-staged-retry-browser.log`.
- Python suite: 9 pass / one skip (`cwebp` unavailable). Local bundling passes. No upload-capable build wrapper or live-test script was run.

## Mixed cached assets

All changed storefront/receipt asset references use the coordinated revision `20261010-delivery-bridge-2`. Query versions prevent new HTML from reusing old cached assets, but do not pin old URLs to historical bytes. Runtime checks therefore require compatible sales/receipt readers, any installed interaction layer and delivery controls before displaying v2. A new script with an old integration can use only the resolved healthy secure legacy capability; it cannot infer v2 from raw config. Missing v2 readers also block versioned saved-payment continuation with a refresh instruction and preserve stored IDs. No unsigned fallback is introduced.

Actual local Chromium matrix additionally tests original main assets, old main with new helper scripts, and old integration/sales/interactions/receipt/HTML mixed individually with the new runtime. Those seven checkout cases retain Dearly's original USD75/24h promise, produce one legacy SDK open and have no uncaught page errors. Two additional receipt mixes show the correct snapshot or a refresh message, for nine passing scenarios total. Independent sequencing review passed; 66 targeted tests were independently rerun successfully (`/tmp/independent-staged-review-tests.log`).

Receipt compatibility also handles new receipt HTML with an old reader by requesting refresh rather than asserting a wrong promise, and old receipt HTML with the new reader by recovering only an explicitly versioned snapshot from the receipt URL. Historic `express=true` remains 24 hours. A fully old cached receipt page AND old reader cannot understand a v2 snapshot; before activation, verify the actual provider cache policy and that new versioned receipt URLs serve compatible HTML/assets. Do not call old receipt binaries a safe rollback target. No cache purge/configuration was performed.
