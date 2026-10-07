# Mobile conversion update

Direction: retain InviteStory's warm paper, botanical imagery and wedding typography. Prioritize phone visitors using the audience information supplied by the owner. ENERGY 2 / RHYTHM 2 / MOTION 1; short feedback is functional, and the hero has no video.

## Incentives and intended effect

| Principle | Implementation | Intended effect |
| --- | --- | --- |
| Immediate feedback | Save changes instantly to Saved, with a short confirmation and 240ms emphasis. Other cards do not reload or animate again. Reduced motion disables the emphasis. | Make a real action feel acknowledged. |
| Ownership | The selected design and its price stay together in a mobile Review & book shortcut. Direct order selections update the remembered design too. | Help visitors return to their own choice. |
| Visible progress | Design chosen / Review & book / We personalize; the current step is explicit. Package orders say Package chosen. | Explain what is done and what happens next. |
| Easier first choice | Mobile order is hero, full catalogue, Dearly showcase. Six starting designs, a style finder and inline package filters remain available. | Reach affordable designs earlier and reduce initial overload. |
| Joint decision | Saved favourites persist and can be shared with a partner or family. | Support the real wedding decision process. |
| Confidence before payment | Chosen design, included RSVP channel, optional add-ons and a Pay & book action with the current total. Full inclusions and the post-booking process expand on demand. | Make the commitment and service clear. |
| Agency | The booking shortcut is dismissible and hides over the hero, during typing and inside other dialogs. Add-ons remain opt-in; Dearly's included extras are disabled and add no charge. | Keep visitors in control. |
| Comfortable touch use | Larger primary controls and inline filters; styles scroll within their own row. The selected-design shortcut is near the thumb and respects the device safe area. | Reduce interaction effort. |

These are conversion hypotheses. Their sales effect should be assessed with completed purchases, revenue per visitor, payment-start-to-purchase conversion and enquiries that become paid orders. No dopamine response or conversion uplift has been measured or claimed.

## Verification of the changed UI

- PASS mobile layout: tested 320px, 390px and 430px phone widths. Measured no document overflow at 320px and 390px. The hero remains without a video element.
- PASS desktop behavior: at 1280px, Dearly returns to its original position, tier navigation returns to its original location, disclosures open, and the mobile shortcut is hidden. Document width equals viewport width.
- PASS feedback: saved Toran Telugu, observed the Saved state, updated shortlist count and confirmation; removed and saved again without replacing all catalogue cards.
- PASS continuity: previewed Toran Telugu, closed its preview, opened Review & book, and verified the same design. A direct Marigold order subsequently updated the shortcut to Marigold.
- PASS control states: shortcut hides in preview and checkout, is dismissible, and is absent when the hero is visible. Inline Premium filter returns 19 designs; Royal/Luxury finder returns three matching designs.
- PASS pricing: optional Email RSVP added ₹2,000 to Premium. Dearly checkout stayed ₹4,999 with disabled included extras. Luxury plus Email RSVP showed $69 USD and accurately compared Dearly at $75.
- PASS progressive disclosure: opened the post-booking explanation; full inclusion and policy details remain accessible in the order sheet.
- PASS keyboard: Shift+Tab from drawer close wrapped to Pay & book, Tab returned to close, and Escape closed the sheet. Focus indicators remain visible.
- PASS compatibility: the existing digital-wedding-invitations page opens the same review sheet and correctly identifies Package chosen. No application console errors were observed.
- PASS source checks: seven automated tests pass; both JS syntax checks and git diff --check pass. Asset versions were updated to load the changed JS/CSS after deployment.

Browser testing stops before payment submission and sending WhatsApp messages. No deployment or advertising activation was performed. Existing unrelated pages, historical testimonials and payment settlement are outside this review.

## Design reasons and references

The smaller secondary hero action makes choosing the main action. Moving filters into the catalogue prevents two competing fixed bars. The selected-design shortcut has one booking action and an explicit dismiss button. Expandable service details reduce checkout length without removing information. The brief save emphasis marks actual saved state and follows reduced-motion preferences.

Explicit payment labels and visible known costs follow [Baymard's checkout guidance](https://baymard.com/learn/checkout-flow-ux-optimization). Touch-control sizing is informed by [Google's accessible tap-target guidance](https://web.dev/articles/accessible-tap-targets). Product discovery is informed by [Baymard's mobile-commerce research](https://baymard.com/research/mcommerce-usability); the specific layout is an InviteStory implementation choice.
