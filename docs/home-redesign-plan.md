# InviteStory homepage redesign

## What we sell, and who buys it
InviteStory sells a personalized, hosted digital wedding invitation, built by a team after booking. The buyer receives an invitation link with their story, photos, music, event details, maps and RSVP. It is a service purchase with a design choice, rather than an invitation editor.

The primary audience inferred from the catalogue and payment flow is Indian couples and their families. They need cultural fit, an attractive first impression, an understandable price, family approval and reliable delivery. Mobile browsing and sharing on WhatsApp are central to the journey. These are working audience assumptions, not research findings.

## Current state
The previous pass improved access to pricing and booking, but did not create a convincing studio identity. Small angled artwork, a muted beige canvas, repeated green buttons, generic section composition and a long stack of disclosures make the page feel assembled. The product's opening animation and rich artwork are hidden inside the demo. Real customer evidence exists but is presented as a bulky screenshot carousel. Navigation, gallery controls and booking details compete for attention.

## Target
A distinctive invitation showroom with the clarity of modern mobile commerce. The emotional invitation experience comes first; the service and purchase terms remain explicit. Light mineral surfaces, the brand's forest accent, larger Cormorant display typography and restrained Outfit controls. Cormorant is retained because wedding stationery and the existing brand use an editorial manuscript language. Artwork keeps each design's original colors.

Design variance 8, motion intensity 5, visual density 3. Native CSS and the existing vanilla JavaScript stack; no framework migration. Motion explains selection, reveal and focus. No scroll hijacking or autoplay audio.

## Section-by-section decisions
| Section | Current problem | Intended result | Implementation |
| --- | --- | --- | --- |
| Navigation | Two rows dominate the phone and currency looks like a dashboard control | Compact brand navigation with easy design/pricing access | Single compact header, mobile menu, currency retained |
| Hero | Thumbnails and a generic promise hide the product | A memorable introduction with a tangible invitation to open | Large editorial title, one main CTA, full-scale authentic envelope, selectable signature palettes |
| Product experience | Rich opening animation is invisible on the homepage | Show what guests experience before asking the buyer to commit | User-controlled real opening film, concise explanation of story, events and RSVP |
| Catalogue | Dense controls and competing card actions | Browse visual styles, preview, save and compare | Six curated designs, spacious unboxed image gallery, discreet controls, all designs still available |
| Personalization | Generic stationery image does not explain the service | Make the team's work and customer's responsibilities clear | Three deliberate steps; payment, complete details, first draft and approval stated plainly |
| Customer evidence | Many screenshot cards dominate and duplicate quotes | Credible human proof with readable context | Three real quotes, selectable original conversations, full-size lightbox retained |
| Collections/pricing | Generic software subscription cards | Compare the actual invitation experiences and total one-time prices | Artwork-led collection rows, clear inclusion differences, optional detail and direct selected-design booking |
| Dearly collection | Duplicate flagship section makes a long detour | Optional deeper exploration without competing with the main catalogue | Keep accessible collection detail, compact layout and consistent styling |
| FAQ | Long list; buying concerns lack hierarchy | Answer payment, timing, revisions and refund objections | Five priority questions, correctly functioning accessible disclosure, all other answers retained |
| Final invitation/footer | Another generic sales box | A composed ending with clear next step and accessible support | Large invitation typography, one primary browse action, service contact and legal links |
| Preview/booking | Homepage and overlays feel like different products | Seamless selection to review, with correct totals | Consistent mineral/forest controls, touch targets, existing payment and tracking retained |

## Reference study
- [Paperless Post wedding invitations](https://www.paperlesspost.com/cards/group/wedding-invitations): authentic invitation artwork and clear visual browsing. Adapt the product emphasis, not its self-service model.
- [Apple iPhone](https://www.apple.com/iphone/): deliberate product staging, clear visual hierarchy and progressive technical detail. Adapt mobile clarity, not glass ornament.
- [Aesop](https://www.aesop.com/): controlled editorial commerce and room for the product to lead. Do not copy its palette or brand voice.

## Process and acceptance checks
1. Audit the live page and source; preserve prices, product claims, URLs, legal content and conversion tracking.
2. Recompose the hero and product experience using existing authentic product assets.
3. Replace the accumulating homepage CSS with a coherent scoped design system; rework each section's rhythm and interactions.
4. Inspect in the browser at narrow phone, larger phone and desktop sizes. Verify no horizontal overflow, usable touch controls and readable type.
5. Exercise palette selection, film play/pause, catalogue filtering, saving, previews, selected-design booking, currency, FAQ and supporting disclosures. Stop before payment.
6. Run existing meaningful tests and syntax checks, inspect visual screenshots, correct any issues and report the finished local result.

Success means a coherent, visually distinctive and usable purchase journey. Conversion uplift requires traffic and measurement; it cannot be inferred from screenshots.

## Completed validation
- Rebuilt locally on 7 October 2026, with direct section-by-section browser inspection.
- Verified responsive layouts at 320px, 390px and 1440px; no horizontal page overflow. Compact phone navigation and 44px palette controls confirmed.
- Exercised the real opening film, palette changes, catalogue refinements, saving/removing a design, customer proof, FAQ, preview, currency and booking review. Corrected inherited card sizing and an overlapping Save control during final checks.
- Confirmed a Dearly selection continues into booking at ₹4,999 with Email RSVP and Express included. Stopped before payment.
- Existing eight conversion-flow tests pass; JavaScript syntax and diff whitespace checks pass.
- Preview and booking styling now follows the homepage. Actual mobile and desktop screenshots saved for the completion handoff.
- This completes the design and functional pass. Sales conversion improvement remains a hypothesis to measure with real traffic.

## Browsing-first revision: Airbnb reference
The user chose “Make browsing the main experience, with designs visible sooner.” Studied the live [Airbnb homepage](https://www.airbnb.com/) for search prominence, image-led browsing, familiar heart saves and concise prices. Applied these principles to invitation shopping while retaining InviteStory's service, actual artwork and forest accent.

- Replaced the large editorial opening with a compact, plain-language heading and introduction.
- Brought search, style filters and the design grid immediately below the header. The film, service explanation and palettes now follow browsing.
- Used a white discovery surface, restrained controls and four desktop/two phone columns.
- Added 44px heart save controls over the artwork, including selected-state feedback and existing shortlist persistence.
- Search, Dearly filtering, saving/removing and preview-to-price continuity verified in the browser. Layout checked at 320px, 390px and 1440px with no horizontal overflow. Existing eight tests remain passing.
