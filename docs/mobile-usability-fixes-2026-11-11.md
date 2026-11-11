# Mobile usability fixes — 11 November 2026

The live mobile audit identified an overflowing Dearly header, a cramped landscape
invitation viewer, small secondary controls, and an oversized header logo.

## Changes

- Dearly uses a compact header below 600 px, with accessible text navigation and
  a 44×44 WhatsApp icon button. The desktop action retains its full text label.
- The viewer uses a two-column layout on short landscape screens, giving the
  invitation the full available height and keeping actions in a separate column.
  At 844×390, the artwork grows from about 74×160 to 157×340 px.
- The full-preview link is a sibling of the scaled artwork rather than a child,
  so its 44 px-high target cannot be clipped by the narrow invitation card.
- Personalization Back, Close and Reset controls and campaign currency buttons
  have at least 44×44 targets. The country-code selector uses 16 px text.
- Homepage, campaign, Dearly and thank-you headers use `assets/logo-header.webp`
  with intrinsic dimensions. It is 5,986 bytes versus 141,468 bytes for the former
  header PNG (95.8% smaller). The original asset is retained for existing metadata
  and other references.
- Updated stylesheet and viewer-script URLs prevent stale cached mobile styles.

## Verification

- All 143 existing Node tests pass; production build and deployment dry run pass.
- `tests/mobile-layout.browser.cjs` exercises Chrome and WebKit at 320×568,
  360×800, 390×844, 430×932, 568×320, 667×375, 844×390, 1024×768 and 1440×900.
- Checks include settled-font header width, touch-target geometry, INR/USD
  switching, preview layout, actual full-preview link opening, both name-form
  steps, form scrolling at a reduced 500 px viewport height, and the visible
  booking button. Requests that write data are blocked throughout.
- The first full local matrix passed all 18 configurations. Four additional local
  runs verified the full-preview popup and reduced-height form in both engines.
- All 18 browser configurations also passed against production after deployment,
  including the actual full-preview popup and shortened form-viewport checks.
- Phone rotation passed separately in both engines with the viewer already open.

The deployed website version is `7857f6fa-cb58-49f1-a777-5e04d5d53997`.
These are browser-engine and touch/viewport tests, not a claim of testing on a
physical iPhone, its native keyboard, or every Safari version. No leads, RSVP
submissions, provider orders or charges were created in this verification.

## Repeating the browser checks

Install Playwright and its WebKit browser in the test environment. Run:

```sh
INVITESTORY_PLAYWRIGHT=/absolute/path/to/node_modules/playwright \
INVITESTORY_QA_ORIGIN=https://www.invitestory.in \
node tests/mobile-layout.browser.cjs
```

Omit the origin for the local server on port 7100. Optional environment variables
are `INVITESTORY_QA_ENGINES`, `INVITESTORY_QA_SIZES`, `INVITESTORY_QA_REPORT` and
`INVITESTORY_CHROME_PATH`. The package path can be omitted when Playwright is
installed in the project's normal module search path.
