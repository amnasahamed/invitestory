# InviteStory: 50 interaction candidates → 12 to build

Status: all 12 selected interactions implemented locally, in sequence, on 7 October 2026. Browser verification and automated checks are recorded below. No deployment or payment was performed.

## Audience and experience goal
Couples and families are choosing a digital invitation together. They need to recognize their style, understand what guests will experience, agree on a design, and trust the one-time price and personalization service. Delight should grow from those moments.

Reference: [Google Design's Airbnb case study](https://design.google/library/airbnb-invites-you-in) describes clear conversational language, image-led browsing, shared-element transitions and prompt feedback. It is a historical case study, not a description of every current Airbnb feature. [Apple's motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion) supports purposeful feedback. The shortlist below guided the InviteStory implementation.

## Initial pool of 50
★ indicates selected. Candidates are alternatives, not a request to ship all 50.

### Discover
1. ★ Search expands into a focused phone sheet with useful suggestions.
2. ★ Style filters update results with a clear count and restrained visual continuity.
3. ★ A three-choice visual style finder returns three explained recommendations.
4. Search remembers recent queries on this device, with clear history removal.
5. No-results view offers two useful ways to broaden the search.
6. Optional budget slider shows actual matching package prices.
7. Optional celebration/tradition selector narrows compatible artwork.
8. Sort sheet offers price and collection sorting with a visible selection.
9. A deliberate “Surprise me” action reveals one available design.
10. Search suggestions include thumbnails of exact matching designs.

### Explore the invitation
11. ★ Artwork expands from its card into the preview, and returns to the same card.
12. ★ Tap to open the real envelope/reveal, with replay and explicit sound control.
13. ★ Guest walkthrough offers Opening, Story, Events and RSVP chapters where supported.
14. Swipe between same-design stills before opening the live demo.
15. Pinch or tap to enlarge illustrated details, with obvious reset.
16. Compare still artwork with its live motion using a two-state toggle.
17. A lightweight preview poster remains visible while the live demo loads.
18. A thumb-friendly next/previous control browses designs without closing preview.
19. Optional “Try our names” provides a clearly marked local sample, not a promised draft.
20. Optional music samples play only after an explicit tap, one track at a time.

### Decide together
21. ★ Save heart provides tactile-looking feedback and an accessible shortlist tray.
22. ★ Compare up to three designs with consistent artwork and inclusion rows.
23. ★ Share a family shortlist that opens to the exact saved designs and prices.
24. ★ Switch between genuine available palette variants with a short crossfade.
25. A pinned favourite remains at the top of your personal shortlist.
26. Removing a saved design offers Undo without a blocking confirmation.
27. Name a shortlist, such as “Our wedding picks”, locally on this device.
28. Attach a private local note to a design for later discussion.
29. A separate optional voting link collects family preferences; requires a backend.
30. Swipe a shortlist as a small deck, with equally usable button alternatives.

### Understand the service
31. Package cards expand to reveal inclusions without losing their price and action.
32. Timing estimator visualizes complete details → draft → review → share.
33. Tap a delivery step to see an example of what the customer supplies.
34. Customer quote selections crossfade into the corresponding original chat.
35. Review screenshot opens from its thumbnail and closes back to its origin.
36. RSVP selector explains the actual WhatsApp/email guest flows side by side.
37. Tap event examples to see how several celebrations appear in one invitation.
38. A venue example demonstrates directions without asking for location access.
39. FAQ answers expand in place with readable spacing and clear expanded states.
40. “Ask a human” opens a context-specific WhatsApp enquiry prepared for review.

### Book and return
41. ★ A calm booking sheet keeps the chosen artwork, inclusions and live total together.
42. ★ Resume restores filters, scroll and selection across preview/back/return.
43. Optional extras update a visible itemized price with brief change feedback.
44. Booking review provides a simple details checklist before payment.
45. Delivery-date choices show an estimate based on complete-details submission.
46. Payment handoff uses a clear loading state, duplicate-click protection and retry.
47. Post-payment next-step checklist lets the customer track details submission.
48. Draft review supports a structured revision list; requires a delivery workflow.
49. Approved invitation offers copy/share with explicit success feedback.
50. A restrained completion animation celebrates a verified successful booking.

## Why these 12
Selection was qualitative, using five criteria: helps the buyer decide; makes the actual product tangible; works one-handed on a phone; fits existing assets and infrastructure; earns its motion through clear feedback. Similar ideas were merged into a single feature rather than counted twice. These are hypotheses, not measured conversion winners.

Decorative tilt, automatic audio, scroll hijacking and floating particles were excluded before the candidate pool. Voting, draft editing and post-payment workflow ideas remain later possibilities because they require services beyond the homepage. The 12 below form one coherent journey.

## The shortlisted plans

| # / candidate | Trigger → experience | Value | Scope / dependencies | Acceptance check |
| --- | --- | --- | --- | --- |
| 1 / 1 — Focused search | Tap search → a phone sheet opens with example traditions and exact matches; desktop stays inline. Clear/Done/Back are obvious. | Reduces uncertainty about what to type. | M; existing database, search and accessible sheet. | Open without changing results; closing restores query and focus; no keyboard overlap. |
| 2 / 2 — Responsive style browsing | Tap a style → selected state responds immediately; result count changes; matching artwork settles with a short fade. | Makes cause and effect obvious. | S; existing filter state. | Preserve scroll; announce result count; rapid taps show only the latest choice; zero-results recovery. |
| 3 / 3 — Find our three | Optional visual questions: feeling, tradition, package → three real matches, each with a short reason. Back revises any answer. | Helps buyers who do not know design vocabulary. | M; upgrade existing deterministic finder and catalog metadata. No AI/backend required. | Explain matching honestly; show fewer than three when needed; “See all” restores ordinary browsing. |
| 4 / 11 — Card-to-preview continuity | Tap artwork → the same artwork enlarges as preview chrome appears; closing returns to the original card. | Feels like entering an invitation rather than opening a disconnected popup. | M; same-origin poster transition then iframe handoff. Never animate or manipulate a cross-origin iframe. | Preview starts loading immediately; slow connection keeps poster and retry visible; close restores position/focus. |
| 5 / 12 — Open the invitation | Tap its seal/opening button → the actual reveal plays; explicit Replay and Sound actions remain available. | Demonstrates the emotional product at the moment of interest. | M; real existing assets, per-design behavior. Works with compatible templates, not a generic seal pasted on every collection. | Never autoplay sound; replay works; pause offscreen; still poster remains available. |
| 6 / 13 — See it as a guest | Choose Opening / Invitation / Events / RSVP → navigate actual sections of the demonstration with a small progress indicator. | Explains what a guest gets beyond the cover. | L; requires a documented message/navigation interface in each supported demo. Fallback is a normal full-demo link. | Chapter controls work only where supported; RSVP is explicitly a sample; no fake RSVP submission. |
| 7 / 21 — A shortlist that feels alive | Tap heart → a short scale/fill response, count update and “Saved · View” feedback; open a thumb-friendly shortlist sheet. | Makes comparison and returning easy. | M; existing local favourites; keep accessible names. | No page jump; state survives reload; remove/Undo works; feedback does not block browsing. |
| 8 / 22 — Compare our favourites | Select two or three saved designs → swipe between aligned artwork columns; inclusions, price and timing remain comparable. | Resolves the final choice without repeatedly opening/closing demos. | M; database and package facts. On phone show one design plus a visible next-design cue, not a squeezed desktop table. | Price/RSVP differences correct; save state retained; clear booking action for each design. |
| 9 / 23 — Choose with family | Share shortlist → native share when available, copy-link fallback; recipient sees the same design IDs and can preview each. | Supports the real collaborative buying decision. | S–M; enhance existing share flow. No login, recipient tracking or voting required. | Handles cancelled sharing calmly; current prices used; large/invalid links recover; note that local edits are not live-synced. |
| 10 / 24 — Explore the real palettes | Tap an available variant → authentic artwork crossfades and name/price/selection update together. | Lets buyers explore personality without leaving a design family. | M; explicit variant mapping. Separate designs remain separate selections. | Never recolor arbitrary artwork or imply unsupported custom colors; booking uses the exact chosen variant. |
| 11 / 41 — Review without doubt | Tap Review & book → chosen artwork, package, one-time total and editable extras appear in a calm sheet. Total changes immediately and briefly highlights. | Gives reassurance at the highest-friction step. | M; refine existing drawer and pricing logic; combine candidate 43 into this feature. | Dearly includes Email RSVP/Express correctly; currency and selection persist; errors stay beside the relevant field; no payment auto-submit. |
| 12 / 42 — Pick up where we left off | Close preview, press browser Back, or return later → filters and position restore; offer a discreet “Continue with…” prompt for the last chosen design. | Makes interruption feel natural instead of losing work. | M; URL/history plus safe local persistence, versioned and clearable. | Back closes the overlay first; retain query and focus; no unwanted automatic reopening; restore safely if a design is unavailable. |

Sizes are relative planning estimates: S = contained enhancement; M = interaction spanning state and several surfaces; L = cross-demo integration. They are not delivery-time promises.

## Delivery sequence
1. **Foundation and browsing:** 1, 2, 7, 12. Unify sheets, focus management, history and feedback before layering effects.
2. **Product immersion:** 4, 5, 10. Prototype transitions on a phone with actual assets, slow loading and interruption.
3. **Making the choice:** 3, 8, 9. Keep the finder optional and family sharing lightweight.
4. **Decision confidence:** 11, then 6 after compatible demos expose reliable chapter navigation.

## Interaction contract
- Button feedback approximately 120–180ms; sheet/preview changes approximately 220–320ms. The actual invitation film follows its authored timing.
- Motion never delays loading or a booking action. Avoid animation queues during repeated taps.
- Prefer transform and opacity; reserve image/video loading for near-visible or explicitly requested content.
- Respect reduced motion with immediate state changes or minimal fades. Every gesture has a labelled button alternative.
- At least 44px touch controls, visible focus, accessible expanded/pressed states, polite result announcements, focus return and ordinary browser Back.
- Use one consistent sheet pattern. Do not stack sheets or compete with the booking shortcut.
- Test on real iOS Safari and Android Chrome when devices are available, plus narrow layouts, keyboard, slow connections and interrupted loading.

## Measurement
Primary outcomes: design preview → booking review → verified payment completion. Supporting signals: time to first useful preview, save → revisit, compare → chosen design, share → reopened shortlist. Track error/retry rate, accidental actions and abandonment as guardrails. Do not use animation engagement as a substitute for sales or usability evidence. Add analytics only after defining the event and preserving the existing consent behavior.


## Local implementation and verification

| Interaction | Delivered | Verified locally |
| --- | --- | --- |
| 1. Focused search | Native phone sheet, useful suggestions, exact thumbnails, live counts, clear and results actions. Desktop remains inline. | Magnolia search returns one real design; closing and Back preserve the query. |
| 2. Style browsing | Immediate pressed state, restrained fade, announced count, clear-search and see-all recovery. | Dearly filter shows four designs; All shows 35. |
| 3. Find our three | Three optional visual questions, deterministic real matches and reasons, answer revision. | Botanical/Dearly returns compatible designs; automated tests cover tradition, package and empty matches. |
| 4. Preview continuity | Artwork transition, loading poster, retry after a slow load, focus and scroll return. | Open/close returns to the same catalogue; transitions respect reduced motion. Slow-load retry is implemented but was not network-throttled in this session. |
| 5. Invitation opening | Real reveal, replay, explicit sound and pause on close. | Magnolia opening/replay exercised in browser. All four Dearly demos use the same preview adapter. |
| 6. Guest walkthrough | Four actual chapters; sample RSVP cannot send responses. | Events/RSVP navigation and sample submission confirmed; sample status says no reply was sent. |
| 7. Shortlist | Heart feedback, saved count, native tray, Remove and Undo. | Removal/Undo and persistent selection exercised; temporary test saves removed afterwards. |
| 8. Comparison | Two or three actual designs, consistent inclusions, swipe snapping plus buttons. | Phone Next control and two aligned desktop columns verified; correct package prices/RSVP shown. |
| 9. Family sharing | Review actual choices, native share or copy link, exact bounded IDs and currency. | Copy/recipient URL verified with two designs; automated tests cover duplicates, invalid IDs and length limits. Native OS share was not invoked. |
| 10. Available palettes | Four authentic Dearly variants; title, artwork, demo, price and booking selection move together. | Magnolia → Something Blue selects the Cobalt Iris demo and correct price. |
| 11. Booking review | Itemized one-time total, included/optional extras, restrained total-change feedback. | Premium ₹1,999 + Express ₹799 = ₹2,798; Dearly ₹4,999 includes both extras. Automated tests cover all collections/currencies. |
| 12. Return continuity | Overlay-aware Back, versioned browsing persistence, safe restoration, reset action, existing chosen-design prompt. | Booking → preview → catalogue Back sequence, search/filter retention and reload verified; automated tests cover expired/invalid state. |

### Scope and quality checks
- Replay, sound, chapter navigation and palette controls are available on the four locally hosted Dearly demos: Magnolia, Camellia, Something Blue and Dahlia. Other collections retain their existing live previews and full-demo links.
- Preview tools sit behind “Explore this invitation”; short phone viewports can scroll the tools without scrolling the background. Native sheets trap focus; the preview has keyboard boundary handling and the existing booking drawer retains its focus handling.
- Browser checks covered narrow layouts and a 1440px desktop layout, with no page-level horizontal overflow in the checked views. These were browser viewport checks, not physical iOS/Android device certification.
- `npm test`: 11 passing checks. JavaScript syntax and `git diff --check` passed. Existing pricing, payment handoff and analytics behavior are preserved. No measured conversion uplift is claimed.
- Implementation: `interactions.js`, `interactions.css`, integration hooks in `scripts.js`/`sales.js`, and an explicitly opt-in `studio-preview=1` adapter in the four Dearly scripts.
