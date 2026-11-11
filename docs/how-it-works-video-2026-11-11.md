# How it works film — 11 November 2026

The homepage's existing `#how-it-works` section now includes the approved
45-second Kerala Sands film. Screens up to 767 px use the 1080×1920 portrait
film; wider screens use the 1920×1080 landscape film. Both sharing files are
about 3.3 MB and live in the repository under `assets/video/`, with matching
JPEG posters. The full-quality production masters are not shipped to visitors.

The native player has playback, seeking, volume and fullscreen controls, plays
inline on phones, and does not autoplay or fetch either film before Play.
Screen-size changes select the matching source and poster, preserving playback
position and whether the viewer was playing or paused. The mobile player appears
before the written steps. The HTML sources remain playable without JavaScript.
English captions are in the film; an accessible transcript and music attribution
are available directly below it. Written steps explain both website booking and
WhatsApp/payment-link booking.

Cloudflare Static Assets does not support HTTP byte ranges by itself. Safari
needs these for dependable video playback and seeking. The two films therefore
use a narrowly scoped Worker route and a streaming single-range response,
including open-ended and suffix ranges, HEAD, validators and unsatisfiable-range
responses. The implementation skips/slices streamed chunks instead of buffering
a whole movie for each viewer. Versioned assets use immutable caching. The
recorded file sizes are checked against the shipped MP4 files in the unit suite.

Reference: [Cloudflare Static Assets range limitation](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/#range-requests).

## Checks

- All 147 Node tests pass, including four new streaming/routing tests covering
  cross-chunk ranges, suffixes, open ends, invalid bounds, HEAD, validators,
  missing files and the actual shipped file sizes.
- Production build and Wrangler deployment dry run pass.
- Chrome and WebKit pass 22 viewport combinations from 320×568 through
  1440×900, including the 767/768 px format boundary and landscape phones.
- The same browser test passes two state-preserving rotation scenarios and
  four no-JavaScript playback scenarios, plus both HTTP streaming/cache checks.
- The desktop film in Chrome and the mobile film in WebKit both play all
  45 seconds on the actual homepage and reach the end without media errors.
- Each layout verifies the matching source and poster, native controls, no
  premature film requests, video dimensions, no horizontal overflow and no
  JavaScript errors. Representative cases also verify seeking and transcript.
- All 18 existing mobile regression configurations pass, including invitation
  browsing, full previews, name forms, booking controls and currency changes.
- Browser tests block analytics and non-GET requests. No customer messages,
  leads, orders, RSVP submissions or payments are created by these checks.

## Repeat browser checks

```sh
INVITESTORY_PLAYWRIGHT=/path/to/node_modules/playwright \
INVITESTORY_QA_ORIGIN=https://www.invitestory.in \
node tests/how-it-works.browser.cjs
```

For a local production-equivalent asset server, run the project-local Wrangler
with HTTPS and an isolated `--persist-to` directory, then use its origin. The
existing Node server also supports layout regression checks; the Cloudflare
runtime is needed to exercise the new Worker streaming behavior.

These are browser-engine tests, not tests on physical iPhones or Android phones.
