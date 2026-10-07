# Mobile clarity and sales flow — 7 October 2026

Scope: the existing homepage and digital-wedding-invitations page. Keep the warm paper palette, serif headings, restrained interaction feedback and existing checkout. No hero video was added.

## Changes

- Explain the deliverable as a personalized interactive invitation website, shared as one link. Define RSVP as guest replies.
- Add a brief choose → book → send details → review explanation beside the catalogue.
- Move collection pricing immediately after the catalogue, ahead of the long proof section.
- Make the Dearly showcase expandable on mobile; retain its full desktop presentation. Keep package details available through an expandable comparison.
- Move wedding guides below the final booking prompt and remove the second testimonial carousel. Original customer chat screenshots remain inspectable.
- Replace vague Dearly and Luxury descriptions with opening style, events, RSVP and draft timing. Dearly does not inherit a claim of WhatsApp RSVP from Luxury.
- Collection buttons lead to designs in that collection. Booking a selected design retains that design’s price and destination rather than asking buyers to choose another package.
- Move Express selection into order review, where the total includes chosen extras.
- Consistently describe the first draft as within 48 hours, or 24 hours with Express / Dearly, after payment and complete details. Approval precedes sharing.
- On mobile, show the iframe at the actual available phone width without scaling its text. Put navigation, save, close and full-demo controls in a separate top row; retain the desktop phone presentation and 3D controls.
- Increase small offer, policy, progress and reassurance text; shorten mobile preview action labels.

## Verification

Eight automated tests pass, including the new regression for selected design price, collection and booking destination across currency changes and direct order selections. JavaScript syntax checks and Git whitespace checks pass.

Browser checks cover 320×740, 390×844, 430×932 and 1280×900. No document-level horizontal overflow was observed. Mobile preview uses the available width; desktop phone sizing and arrow positions restore correctly. Premium / Luxury collection navigation, expandable comparison, Dearly price and included extras, Escape dismissal and the alternate page were checked. No payment was submitted.

This verifies the changed interface and existing test coverage; it does not measure conversion improvement or certify all hosted templates.

## External template follow-up

Lakeview’s lamp image has this malformed source in the external iframe:

`.https://media.invitestory.in/lakeview-lanterns/assets/opener-diya-v1.png`

The template owner must remove the leading dot so the source starts with `https://`. The template source is not present in this repository, and parent-page code cannot edit its cross-origin document. The external template also needs its opener checked at short mobile heights; its own composition overlaps near the bottom on short viewports.

An existing Wax Seal Royale Tilda script logs a cross-origin `isPagePreview` error. It originates in that external template, not the changed parent page.
