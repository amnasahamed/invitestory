# Catalogue and booking audit — 6 November 2026

Scope: catalogue presentation, public artwork/preview availability, filter clarity,
selection handoff and booking prices. The hero design and section order are locked.

## Findings and changes

- All 30 public designs have local artwork. Six intentionally hidden designs remain
  excluded by the existing shared catalogue filter.
- Default browsing deliberately shows eight designs across all three collections.
  Added an explicit “Showing 8 of 30” status and a top-level View all action.
  Active collection/style/search context and a clear reset now appear above results.
- Four Dearly artwork files existed, but their local application entry points did
  not. Catalogue previews now use their existing hosted demos, with cross-origin
  load completion handled by the preview controller. Other designs retain local demos.
- The mobile booking shortcut only recognized the previous `.hero` selector.
  It now recognizes `#invitation-archive` and stays hidden while the hero is visible.
- Catalogue-only stylesheet improves full-artwork portrait framing, typography,
  filter visibility, price/collection labels and review-button consistency.
- No payment prices, package promises, section order or hero geometry were changed.

## Verification

- Syntax checks passed for sales.js, scripts.js and archive-hero.js's existing build.
- 54 sales and preview-controller tests passed, including a new regression covering
  Dearly hosted routing, readiness and frame cleanup.
- Production bundle built successfully.
- Browser checks: fresh default eight-design mix, expansion/reset to 30,
  Dearly four-result filter, hosted Magnolia preview ready, and Magnolia selection
  carried into booking at INR 4,999 and USD 75.
- Mobile booking shortcut was hidden over the hero.
- All four hosted Dearly demo homepages returned HTTP 200.

## Existing limitation

The local checkout displays “New bookings are currently unavailable.” Price and
design handoff were verified; no payment was initiated and no payment configuration
was changed. The missing local Dearly applications remain missing; their hosted
demos are used rather than substituting unrelated previews.

## Next bounded review

Review the refined catalogue before changing any other section. Features, process,
reviews, pricing and FAQ retain their current order and content.
