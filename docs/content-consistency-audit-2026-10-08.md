# Content consistency audit — 8 October 2026

Scope: local source of 132 public HTML pages: seven core pages and 125 blog pages (124 articles plus index). Also checked generated catalogue/pricing/comparison/FAQ/order/notification/WhatsApp copy in scripts.js, sales.js, interactions.js, home.js, paid-order.js, preview-names.js; metadata and structured-data counts. Imported invitation demos contain sample wedding content, intentionally different from customer order details.

This is a content audit of the local working copy, not a claim that all production fulfilment, email integrations or access controls have been tested. No deployment or real purchase performed.

Validation: 26 existing/updated automated tests pass. Regression coverage checks Dearly showroom USD pricing and that retired extras cannot enter WhatsApp orders. Rendered homepage inspected after confirmed copy updates.

## Findings

### 1. Delivery: first draft versus finished invitation
Status: Resolved — user confirmed standard 48h, Dearly 24h and ₹799 Express 24h
Main catalogue promises a first draft within 48h; Express and Dearly within 24h after payment and complete details. Older blog CTAs promise a finished live link within 24h without an Express surcharge. Dearly standalone also promises a ready-to-share link in 24h. Aligned blog fulfilment claims, Dearly standalone, terms, receipt and paid WhatsApp summary around first-draft delivery after payment and complete details.
Locations: scripts.js:4548; paid-order.js:8; dearly.html:789; blog/ultimate-guide-digital-wedding-invitations.html; terms.html:76; thank-you.html:41; llms.txt:3

### 2. USD pricing differs
Status: Resolved — use checkout prices throughout
Checkout prices are $29 / $45 / $75. 52 blog files contain older $15 / $30 / $49 prices. Dearly standalone metadata and showroom updateTierLabels still say $80, while Dearly visible standalone price is $75. Corrected the old blog prices, standalone metadata and showroom updater to $29 / $45 / $75.
Locations: scripts.js:3613; dearly.html:50; blog/paperless-eco-friendly-wedding-invites.html:159; blog/rajmahal-palace-luxury-wedding-website.html:132

### 3. Requirements before versus after payment
Status: Resolved from user clarification
Details can arrive before or after payment. Work starts only when payment and complete details are received. Policy formerly required all details prior to payment; corrected.
Locations: refund-and-editing-policy.html:95

### 4. Bespoke INR starting price
Status: Resolved from user clarification
Official starting price is ₹12,000. Aligned homepage/landing preview FAQs, modal, dynamic header, blog header, WhatsApp prefill and associated INR event value.
Locations: index.html:983; scripts.js:3624; scripts.js:4672; blog/index.html:209

### 5. Bespoke USD starting price
Status: Resolved — user specified 30% above INR equivalent
Bespoke remains ₹12,000 in INR. USD is $161: ₹12,000 × 1.30 ÷ 97.006 = $160.8148, rounded up to a whole dollar. Uses the 7 October 2026 USD/INR closing rate from https://www.investing.com/currencies/usd-inr-historical-data. Fixed quote, not a live exchange-rate fetch. Header, modal, WhatsApp enquiry and enquiry analytics share one price definition.
Locations: scripts.js:3624; scripts.js:4672

### 6. Dashboard claims versus actual RSVP service
Status: Resolved from user clarification
There is no email dashboard. Email RSVP provides notifications with guest names and an Excel download option within the email. Removed customer dashboard claims from primary pages/generated pricing/FAQs and affected blog guidance. This is a copy correction; fulfilment email functionality was not independently verified.
Locations: index.html:633; scripts.js:1211; sales.js:528; blog/30-days-before-wedding-to-do-list.html:114

### 7. Dearly optional photo gallery unclear
Status: Resolved from user clarification
Photo gallery is included in ₹4,999 when requested; clarified package features, FAQs, template descriptions and standalone page.
Locations: index.html:634; scripts.js:4556; dearly.html:797

### 8. ₹299 add-on is called two different services
Status: Resolved — user confirmed there is no ₹299 add-on
ADDONS.lang says Extra Event Tab; legacy template checkout/payment notes say Multi-Language. Removed the retired add-on definition, calculators, WhatsApp order handling and payment notes. This is in legacy template purchase helpers; current order drawer exposes Express and Email RSVP.
Locations: scripts.js:893; scripts.js:1740

### 9. Catalogue counts
Status: Resolved from catalogue data
There are 35 catalogue designs. Homepage structured-data offerCount was 31; blog browse buttons said 25. Corrected explicit totals to 35. “30+” remains true. Blog contains 124 articles plus its index.
Locations: index.html:136; blog/* header browse buttons

### 10. Old Telugu-template INR price
Status: Resolved from current INR catalogue pricing
Toran Telugu and Kalyana Mandapam are ₹1,999 Premium catalogue designs; the Telugu guide advertised them as ₹999 and now shows ₹1,999. Separate DIY/reveal ₹999 products are distinct and should not be conflated.
Locations: blog/telugu-digital-wedding-invitation-guide.html:132; scripts.js catalogue

### 11. “Private link” implies access controls
Status: Resolved — user confirmed private invitation links are not needed
Removed private-link claims from policy, terms, order steps, blog copy and metadata. Invitations are described as shareable links. Privacy policy now explains that anyone with the link can open it, including people it is forwarded to. This change updates wording; it does not alter access-control settings.
Locations: privacy-policy.html:91; refund-and-editing-policy.html:121; dearly.html:789

### 12. Special RSVP / transport / calendar claims vary by design
Status: Resolved — user confirmed special features are quoted extras
Special features are available on request and cost extra based on requirements. Updated per-event restrictions, custom RSVP fields, meal preferences, Google Sheets and transport integration claims so they are not represented as included package features. Added a shared FAQ and policy note requiring a confirmed quote, scope and delivery impact before custom work.
Locations: blog/vip-guest-digital-invitation-management.html:114; blog/digital-wedding-invitation-trends-2026.html:169; blog/diya-haveli-royal-jaipur-wedding-card.html:126

### 13. Undefined optional charges and scope
Status: Ambiguity, not a proven contradiction
Re-editing after 24h and hosting extensions use “nominal fee” without amounts. Custom domain duration/renewal and bespoke delivery scope need a quote or a disclosed basis. Refund eligibility before customization starts is not explicitly explained, although “all sales final” is qualified by work commencing.
Locations: refund-and-editing-policy.html:85; refund-and-editing-policy.html:111; refund-and-editing-policy.html:129; index.html bespoke modal

### 14. Privacy disclosure versus tracking
Status: Factual disclosure updated; no legal compliance review performed
Added a description of existing Google Analytics, Meta Pixel, Microsoft Clarity and browser storage, including attribution identifiers. Describes current behaviour without claiming data is sold or making a legal compliance guarantee.
Locations: index.html tracking scripts; scripts.js attribution and conversion events; privacy-policy.html
