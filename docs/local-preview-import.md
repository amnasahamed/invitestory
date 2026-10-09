# Local invitation previews

All 35 catalogue previews now load from the main website origin: 31 imported
production exports at `/previews/<design>/` and four existing Dearly templates
at `/dearly/<design>/?studio-preview=1`. Embedded iframe previews use
the local URLs. “Open full demo” uses the original hosted URL
from the catalogue.

The complete production exports were already available in
`/Users/amnas/Desktop/invitestory_optimised_templates-main`. Importing those
avoided an incomplete crawl of the public demo hosts. Original files remain
untouched; each import report records their SHA-256 hashes.

## Size and quality

Imported image/video assets decreased from 270,817,850 to 212,713,609 bytes:
58,104,241 bytes saved (21.45%). Sharing byte-identical fonts saves another
7,021,332 bytes. Total savings are 65,125,573 bytes, approximately 65.1 MB.
These are stored asset savings, not a measured page-load speed improvement.

Images use lossless WebP with `cwebp -z 9 -exact -metadata all`. Each candidate
must preserve decoded RGBA pixels, ICC and EXIF data and be smaller than the
original. Animated images and unsupported formats stay intact. Already-small
JPEG/WebP files remain in their original format when conversion is larger.
The four existing Dearly designs had no smaller verified lossless candidates.

MP4 indexing is moved to the beginning using FFmpeg stream copying when the
result is no larger. Video/audio streams are never re-encoded. SVG, audio,
fonts and other formats retain their original content. Lossless compression
cannot make every format smaller, nor restore detail previously lost in a JPEG.

Shared fonts have content-addressed filenames and an immutable cache header.
Only the selected invitation iframe loads, rather than all 35 previews at once.
HTTP text compression and response headers must be checked after deployment.

## Export compatibility

Mirrored media uses `assets/artwork/` paths. Paths containing the former media
hostname were blocked by the browser client and showed broken decorative images
in Seashell Vows. Staging and finalization apply this migration automatically;
`python3 tools/localize_preview_media.py` also repairs existing exports without
changing asset bytes. Original import reports retain their source paths.

Run `python3 tools/audit_design_assets.py` to check literal asset references in
all 35 designs, including Dearly. It checks HTML, CSS, bundled media, fonts and
module-relative paths. `python3 -m unittest discover -s tests -p '*_test.py'`
includes the catalogue audit and path-resolution regression checks.
The October 9 audit is saved in `docs/design-assets-audit.json`, with separate
image, media, font and JavaScript validation results. These are local checks;
browser interaction and live deployment verification are recorded separately.

Noor-e-Zahra uses its existing mosque illustration in the venue card because
the export did not include the referenced map image. Diya Haveli exposes its
optional music control only when `WEDDING_DATA.media.audio` is configured;
the export's default audio path had no corresponding file. Social-preview
images also use valid local artwork rather than template placeholders.

The importer fixes root asset paths, router basenames, missing optimized-image
references, vendor/editable-data name collisions and malformed archived bundle
declarations. Missing optional Lenis chunks fall back to native scrolling;
missing Aurora chunks omit that optional decorative overlay. The originals
did not contain these chunks. Tilda's unavailable analytics loader is removed.

Diya Haveli and Gilded Hall retain recoverable React hydration warnings from
their archived SSR snapshots. React recovers and renders both invitations;
the warnings remain visible in the console and in
`window.InvitationDemoDiagnostics.recoveries`, separate from uncaught errors.

Demo form submits are intercepted to prevent real responses. External maps,
WhatsApp links and original third-party services still need their providers.
Importing static assets does not recreate backend services. Visitors see an optional name dialog on their first preview in a browser tab.
They can apply both names or skip it. A compact “Add your names” / “Edit names”
button beside the design title reopens the dialog; the large form no longer
occupies the toolbar. Existing saved names suppress the initial prompt. Names are stored in sessionStorage
for the current tab and applied before editable data renders. A per-template
name map covers static text and late-rendered content. Reset restores sample
names. Full demos on external hosts keep their original samples. Photos, family
details, event dates and other content remain samples.

## Reproducing and checking

```sh
python3 tools/stage_local_previews.py --source /Users/amnas/Desktop/invitestory_optimised_templates-main --all
python3 tools/finalize_local_previews.py
python3 -m unittest discover -s tests -p '*_test.py'
npm test
```

Re-import replaces only generated preview folders with matching source reports.
Pillow and cwebp enable verified image compression; FFmpeg enables video remuxing.
Missing optimization tools retain original bytes. The downloader at
`tools/import_previews.py` is also available for future public-host imports;
every new crawl needs its own browser validation before catalogue activation.

`tests/preview-audit.html` sequentially checks all 35 designs in a mobile-sized
iframe for rendered content, failed initial images and startup errors. It also
supports `?offset=N&limit=M`. This checks initial rendering, not every gesture,
RSVP endpoint or lazy-loaded asset. Marigold and Seashell opening interactions
were checked manually. Import measurements are in `preview-import-summary.json`.

Final local validation: all 35 previews rendered with no failed initial images
or uncaught startup errors; two reported the SSR recoveries described above.
The catalogue iframe was verified on the homepage. The fullscreen link now
points to the original hosted demo rather than the local copy.
All 16 Node tests and five Python tests passed; all 103 imported JavaScript
files passed syntax checks. Original SHA-256 hashes still match for all 31
source templates. Browser results are saved in `preview-browser-audit.json`.

The changes are local and have not been deployed.

## Console repair, 8 October 2026

The archived Marigold and Toran exports reference missing paper textures, and
Sage references a missing jaali texture. These now use existing site SVGs at
`/assets/preview-paper-grain.svg` and `/assets/preview-jaali.svg`. Toran also
references an absent footer background; that uses its own existing hero-flatlay
image. These are decorative substitutions, not recovered originals or lossless
conversions of those absent files. The importer retains these fallbacks on
re-import when the originals are still missing.

Removed Lotus Leaf's unsupported `as="video"` link preload. The artwork flight
now skips zero-sized or non-finite rectangles, preventing infinite scale values
when a hidden poster is closed. Regression checks cover the animation and
bundle-relative image/video URLs (including backgrounds, which the prior
initial-image browser audit did not cover).

The iframe sandbox warning remains: same-origin access is required for tab
name storage and direct preview controls. Combining `allow-scripts` and
`allow-same-origin` does not provide a dependable security boundary for these
same-origin scripts. Proper isolation requires a separate preview origin and
an explicit messaging bridge. Removing the sandbox or its same-origin token
just to silence the warning would respectively weaken restrictions or break
current functionality. The two documented React SSR recoveries also remain.

29 Node tests and five importer tests pass. Modified bundles pass syntax checks.
A fresh browser visual check was not completed because the local server could
not bind under the current sandbox. These fixes have not been deployed.

## Name customization validation

All 35 data formats accept both custom names. Browser checks confirmed both
names in 34 initial invitation bodies with no initial image failures or uncaught
errors. Ganesha Gopuram shows a generic introduction first; after clicking
“Skip intro”, both custom names appeared in the heading, couple cards, closing,
calendar link and RSVP link. The previously documented SSR recovery warnings
remain. The Node suite now has 19 passing tests, including name mapping,
Unicode input, markup rejection and media/family-data preservation.

The first-preview prompt, skipping without repeat prompts, applying names,
editing names, and Escape closing only the name panel were browser-verified.
The initial prompt focuses its heading to avoid opening a mobile keyboard
before the visitor chooses to enter names.

The preview footer now keeps the title and Premium / Luxury / Dearly button switcher on one row.
Name editing sits in the browsing row: Back / Edit names / Save / Next. On
small screens, previous and next use arrow buttons with accessible labels.
The booking action and WhatsApp / share / FAQ row remain labeled. The layout
was checked at 390px and 320px widths without horizontal overflow, including
Luxury and Dearly switching, matching booking prices, and next-design browsing.
