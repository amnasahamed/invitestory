window.deliverySalesVersion=2;
// Purchase guidance stays on the catalogue; invitations remain in their own iframes.
const discovery = { savedOnly: false, recommendations: null, shared: null };
let salesOrderFocus = null;
let salesBookingDismissed = false;
let salesPricingNoteObserver = null;

function salesSaveButton(item) {
  const saved = previewFavourites.has(item.id);
  return `<button type="button" class="sales-save-design" onclick="toggleSavedDesign(${item.id})" aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${item.name} ${saved ? "from" : "to"} shortlist">${document.body.classList.contains("browse-home") ? `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" fill="${saved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.7"/></svg>` : saved ? "Saved" : "Save"}</button>`;
}

function getDiscoveryDesigns(items) {
  if (discovery.savedOnly) return items.filter(item => previewFavourites.has(item.id));
  const ids = discovery.recommendations || discovery.shared;
  if (ids) return ids.map(id => items.find(item => item.id === id)).filter(Boolean);
  return items;
}

function resetDiscovery() {
  discovery.savedOnly = false;
  discovery.recommendations = null;
  discovery.shared = null;
  const url = new URL(location.href);
  url.searchParams.delete("shortlist");
  history.replaceState(history.state, "", url);
}

function browseAllDesigns() {
  resetFilters();
  document.getElementById("templates-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showSavedDesigns() {
  resetFilters();
  discovery.savedOnly = true;
  renderCatalogue();
}

function toggleSavedDesign(id) {
  const item = TEMPLATE_DATABASE.find(design => design.id === id);
  if (!item) return;
  const wasSaved = previewFavourites.has(id);
  if (wasSaved) previewFavourites.delete(id);
  else previewFavourites.add(id);
  try { localStorage.setItem("invitestory_favourites", JSON.stringify([...previewFavourites])); } catch (_) {}
  if (!wasSaved) {
    const prices = getItemPrices(item);
    trackConversionEvent("save_design", { content_ids: [String(id)], content_name: item.name, value: currentCurrency === "INR" ? prices.priceINR : prices.priceUSD, currency: currentCurrency });
  }
  const restoreCardFocus = document.activeElement?.classList.contains("sales-save-design");
  syncPreviewFavourite();
  if (discovery.savedOnly) renderCatalogue();
  else {
    const button = document.querySelector(`#template-card-${id} .sales-save-design`);
    if (button) {
      button.setAttribute("aria-pressed", String(!wasSaved));
      button.setAttribute("aria-label", `${wasSaved ? "Save" : "Remove"} ${item.name} ${wasSaved ? "to" : "from"} shortlist`);
      if (document.body.classList.contains("browse-home")) button.querySelector('path')?.setAttribute('fill', wasSaved ? 'none' : 'currentColor');
      else button.textContent = wasSaved ? "Save" : "Saved";
      button.classList.remove("sales-save-confirm");
    }
  }
  renderSavedDesigns();
  if (restoreCardFocus) (document.querySelector(`#template-card-${id} .sales-save-design`) || document.querySelector("#saved-designs button, .sales-style-finder summary"))?.focus({preventScroll:true});
  if (typeof InviteInteractions !== "undefined") InviteInteractions.savedChanged(id, wasSaved);
  if (!wasSaved && !document.body.classList.contains("browse-home")) {
    document.querySelector(`#template-card-${id} .sales-save-design`)?.classList.add("sales-save-confirm");
    showToast({ design: item, title: `${item.name} saved`, message: "It’s in your shortlist. Compare your favourites with your partner or family.", type: "success", duration: 3000 });
  }
}

function resumeDesign(id) {
  const item = TEMPLATE_DATABASE.find(design => design.id === id);
  if (!item) return;
  trackConversionEvent("resume_design", { content_ids: [String(id)], content_name: item.name });
  openPreview(id);
}

function lastChosenDesign() {
  try {
    const stored = JSON.parse(localStorage.getItem("invitestory_selected_design") || "null");
    return TEMPLATE_DATABASE.find(item => item.id === stored?.id) || null;
  } catch (_) { return null; }
}

function dismissMobileBookingBar() {
  salesBookingDismissed = true;
  updateMobileBookingBar();
}

function bookChosenDesign() {
  const item = lastChosenDesign();
  if (item) openOrderDrawerForTemplate(item.id);
}

function updateMobileBookingBar() {
  const bar = document.getElementById("sales-mobile-booking");
  if (!bar) return;
  const item = lastChosenDesign();
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  const hero = document.querySelector(".hero");
  const pastHero = !hero || hero.getBoundingClientRect().bottom < 80;
  const overlay = document.querySelector(".interaction-sheet[open], #preview-modal.is-open, #order-drawer-modal.is-open, #wa-lightbox.active, #payment-success-modal.is-open");
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || "");
  const note = document.getElementById("pricing-selected-design");
  const noteRect = note?.getBoundingClientRect?.();
  const selectedBookingVisible = Boolean(note && !note.hidden && noteRect && noteRect.bottom > 68 && noteRect.top < window.innerHeight - 80);
  const visible = Boolean(item && mobile && pastHero && !selectedBookingVisible && !overlay && !typing && !salesBookingDismissed);
  bar.hidden = !visible;
  document.body.classList.toggle("sales-has-booking-shortcut", visible);
  if (!item) return;
  const key = `${item.id}:${currentCurrency}`;
  if (bar.dataset.renderKey === key) return;
  bar.dataset.renderKey = key;
  const image = bar.querySelector("img");
  image.src = item.image;
  bar.querySelector("strong").textContent = item.name;
  bar.querySelector("small").textContent = `${formatPrice(getItemPrices(item).priceINR, getItemPrices(item).priceUSD)}${document.body.classList.contains("atelier-home") ? "" : " · Personalized for you"}`;
  const book = bar.querySelector(".sales-mobile-book-btn");
  book.setAttribute("aria-label", `Choose ${item.name} and review the price`);
}

function setupMobileSalesLayout() {
  const mobile = window.matchMedia("(max-width: 760px)");
  const catalogue = document.getElementById("catalogue-header");
  const dearly = document.getElementById("dearly-collection");
  const proof = document.querySelector(".social-proof");
  const how = document.getElementById("how-it-works");
  const tiers = document.querySelector(".tier-floating-nav");
  const controls = document.querySelector(".controls-card");
  const previewControls = document.querySelector(".preview-footer-controls");
  const arrows = [...document.querySelectorAll(".preview-side-arrow")].filter(arrow => !arrow.closest(".preview-browse-controls"));
  const arrowHomes = arrows.map(arrow => {
    const home = document.createComment("Desktop preview arrow position");
    arrow.before(home);
    return home;
  });
  // Designs lead into the buying decision; optional collection browsing stays out of that path.
  const staticBrowseLayout = document.body.classList.contains("browse-home");
  if (!staticBrowseLayout && catalogue && pricingSection) catalogue.after(pricingSection);
  let dearlyDetails = document.querySelector(".sales-dearly-showcase");
  if (!dearlyDetails && dearly && pricingSection) {
    dearlyDetails = document.createElement("details");
    dearlyDetails.className = "sales-dearly-showcase";
    dearlyDetails.innerHTML = '<summary>Explore the Dearly collection <span>Wax-seal designs · Email RSVP · Review delivery at checkout</span></summary>';
    pricingSection.after(dearlyDetails);
    dearlyDetails.appendChild(dearly);
  }
  if (!staticBrowseLayout) {
    if (proof && pricingSection) (dearlyDetails || pricingSection).after(proof);
    if (how && document.body.classList.contains("studio-home") && catalogue) catalogue.after(how);
    else if (how && proof) proof.after(how);
  }
  const guides = document.querySelector(".guides-section");
  const finalCta = document.querySelector(".final-cta");
  if (!staticBrowseLayout && guides && finalCta) finalCta.after(guides);
  const tiersHome = tiers ? document.createComment("Tier navigation desktop position") : null;
  if (tiersHome) tiers.before(tiersHome);
  const studio = document.body.classList.contains("studio-home");
  if (!staticBrowseLayout && studio && how && proof) how.after(proof);
  const viewModes = document.querySelector(".view-mode-toggle-wrap");
  const finder = document.querySelector(".sales-style-finder");
  const viewModesHome = document.createComment("View mode desktop position");
  const finderHome = document.createComment("Style finder desktop position");
  let refine = null;
  if (studio && controls && !tiers?.classList.contains("home-collection-nav")) {
    viewModes?.before(viewModesHome);
    finder?.before(finderHome);
    refine = document.createElement("details");
    refine.className = "studio-mobile-refine";
    refine.innerHTML = '<summary>Refine designs</summary><div class="studio-refine-body"></div>';
    controls.appendChild(refine);
  }
  const apply = () => {
    if (refine) {
      refine.hidden = false;
      const panel = refine.querySelector(".studio-refine-body");
      if (viewModes) panel.appendChild(viewModes);
      if (finder) panel.appendChild(finder);
    }
    if (dearlyDetails) dearlyDetails.open = studio ? false : !mobile.matches;
    arrows.forEach((arrow, index) => {
      if (mobile.matches && previewControls) previewControls.appendChild(arrow);
      else arrowHomes[index].after(arrow);
    });
    if (typeof schedulePreviewScale === "function") schedulePreviewScale();
    if (tiers && controls) {
      const inlineTiers = !tiers.classList.contains("home-collection-nav") && (mobile.matches || document.body.classList.contains("studio-home"));
      tiers.classList.toggle("sales-inline-tiers", inlineTiers);
      if (inlineTiers) {
        (studio && refine ? refine.querySelector(".studio-refine-body") : controls).appendChild(tiers);
        tiers.setAttribute("aria-hidden", "false");
      } else tiersHome.after(tiers);
    }
    document.querySelectorAll(".sales-order-disclosure, .studio-package-details").forEach(details => { details.open = !mobile.matches; });
    updateMobileBookingBar();
  };
  document.body.insertAdjacentHTML("beforeend", '<aside id="sales-mobile-booking" class="sales-mobile-booking" aria-label="Your selected invitation" hidden><img alt="" width="32" height="42"><div><strong></strong><small></small></div><button type="button" class="sales-mobile-book-btn" onclick="bookChosenDesign()">Choose design</button><button type="button" class="sales-mobile-book-close" onclick="dismissMobileBookingBar()" aria-label="Hide booking shortcut">×</button></aside>');
  apply();
  mobile.addEventListener("change", apply);
  const heroForShortcut = () => document.querySelector(".hero");
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; updateMobileBookingBar(); });
  };
  if (heroForShortcut()) {
    const heroObserver = new IntersectionObserver(schedule, { rootMargin: "-80px 0px 0px 0px" });
    heroObserver.observe(heroForShortcut());
  }
  document.addEventListener("focusin", schedule);
  document.addEventListener("focusout", schedule);
  const observer = new MutationObserver(schedule);
  document.querySelectorAll("#preview-modal, #order-drawer-modal, #wa-lightbox, #payment-success-modal").forEach(modal => observer.observe(modal, { attributes: true, attributeFilter: ["class"] }));
}

function renderSavedDesigns() {
  const mount = document.getElementById("saved-designs");
  if (!mount) return;
  const saved = TEMPLATE_DATABASE.filter(item => previewFavourites.has(item.id));
  const last = lastChosenDesign();
  mount.dataset.hasChoices = String(Boolean(saved.length || last));
  mount.dataset.savedCount = String(saved.length);
  mount.innerHTML = `<div class="saved-designs-heading"><div><strong>Your shortlist${saved.length ? ` (${saved.length})` : ""}</strong><p>${saved.length ? "Keep your favourites together. Choose with your partner or family." : "Tap Save on a design to keep it here for later, on this device."}</p></div>
    ${saved.length ? '<div class="sales-inline-actions"><button type="button" onclick="showSavedDesigns()">View saved designs</button><button type="button" onclick="shareSavedDesigns()">Share with partner or family</button></div>' : ""}</div>
    ${last ? `<button type="button" class="sales-resume" onclick="resumeDesign(${last.id})"><img src="${last.image}" alt="" width="44" height="56"><span>Continue with <strong>${last.name}</strong><small>${formatPrice(getItemPrices(last).priceINR, getItemPrices(last).priceUSD)} · Revisit this design</small></span><span aria-hidden="true">↗</span></button>` : ""}`;
  updateMobileBookingBar();
}

function renderDiscoveryStatus(count) {
  const footer = document.getElementById("catalogue-discovery-footer");
  const status = document.getElementById("discovery-status");
  if (!footer || !status) return;
  status.textContent = discovery.savedOnly ? `${count} saved ${count === 1 ? "design" : "designs"}` : discovery.recommendations ? `${count} recommendations for your style` : discovery.shared ? `${count} designs in this shared shortlist` : `${count} ${count === 1 ? "design" : "designs"} to explore`;
  footer.innerHTML = `<button type="button" class="sales-browse-all" onclick="browseAllDesigns()">Reset and browse all designs</button>`;
  if (discovery.savedOnly && count === 0) {
    // renderCatalogue supplies the empty-state container immediately after this call.
    queueMicrotask(() => {
      const empty = templatesGrid.querySelector(".no-results");
      if (empty) empty.innerHTML = '<h3>No saved designs here yet</h3><p>Browse the collection and tap Save on your favourites.</p><button type="button" class="sales-browse-all" onclick="browseAllDesigns()">Browse designs</button>';
    });
  }
}

function findStyleMatches(event) {
  event.preventDefault();
  const style = document.getElementById("finder-style").value;
  const tier = Number(document.getElementById("finder-package").value);
  const styles = { traditional: ["traditional", "south-indian"], modern: ["modern", "minimalist"], royal: ["royal", "palace"], botanical: ["botanical", "floral", "garden", "watercolor"], illustrated: ["quirky", "ghibli", "anime"] };
  const matches = TEMPLATE_DATABASE.filter(item => !tier || item.tier === tier).map(item => {
    const text = `${item.style} ${item.tags.join(" ")} ${item.desc}`.toLowerCase();
    return { item, score: styles[style].filter(tag => text.includes(tag)).length };
  }).filter(match => match.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  resetFilters();
  discovery.recommendations = matches.map(match => match.item.id);
  renderCatalogue();
  const explanation = document.getElementById("finder-explanation");
  explanation.textContent = matches.length ? `Chosen for their ${document.getElementById("finder-style").selectedOptions[0].text.toLowerCase()} style${tier ? ` in ${packageName(tier)}` : ", across the collection"}. Preview them to see which feels like you.` : "No exact match in that package. Try another package or browse the full collection.";
  trackConversionEvent("style_finder_complete", { style, package_tier: tier, content_ids: matches.map(match => String(match.item.id)) });
  templatesGrid.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function shareSavedDesigns() {
  if (typeof InviteInteractions !== "undefined" && document.body.classList.contains("browse-home")) { InviteInteractions.openFamilyShare(); return; }
  const saved = TEMPLATE_DATABASE.filter(item => previewFavourites.has(item.id)).slice(0, 12);
  if (!saved.length) return;
  const url = new URL("https://invitestory.in/");
  url.searchParams.set("shortlist", saved.map(item => item.id).join(","));
  const text = `Help me choose our wedding invitation:\n${saved.map(item => `${item.name} · ${formatPrice(getItemPrices(item).priceINR, getItemPrices(item).priceUSD)}`).join("\n")}\n\nEach is personalized by InviteStory. Open the shortlist to try the live previews.`;
  try {
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      await navigator.share({ title: "Our wedding invitation shortlist", text, url: url.href });
    } else {
      await navigator.clipboard.writeText(`${text}\n${url.href}`);
      showToast({ title: "Shortlist copied", message: "Paste the link into your chat with your partner or family.", type: "success" });
    }
    trackConversionEvent("share_shortlist", { content_ids: saved.map(item => String(item.id)) });
  } catch (error) {
    if (error.name !== "AbortError") showToast({ title: "Could not share the shortlist", message: "Try again, or use Share inside an individual design preview.", type: "error" });
  }
}

function customerProof(reviewIndex) {
  const isFamily = reviewIndex === 5;
  return `<button type="button" class="sales-proof-open" onclick="openLightbox(${reviewIndex})" aria-label="Read the original customer chat"><img src="assets/reviews/review-${isFamily ? "06" : "07"}.webp" alt="Customer WhatsApp chat" width="54" height="62" loading="lazy"><span><q>${isFamily ? "Sir everyone like it" : "Thank You Mam for making this invitation beautiful"}</q><small>${isFamily ? "Shared with the family" : "From a customer’s WhatsApp chat"} · Read the original</small></span></button>`;
}

function packageComparison() {
  const premium = formatPrice(TIER_BASE_PRICE[2].inr, TIER_BASE_PRICE[2].usd);
  const luxury = formatPrice(TIER_BASE_PRICE[3].inr, TIER_BASE_PRICE[3].usd);
  const dearly = formatPrice(TIER_BASE_PRICE[4].inr, TIER_BASE_PRICE[4].usd);
  const email = formatPrice(ADDONS.emailRsvp.priceINR, ADDONS.emailRsvp.priceUSD);
  const express = formatPrice(ADDONS.express.priceINR, ADDONS.express.priceUSD);
  const fastest = formatPrice(1499, 18);
  const newDelivery = typeof usesNewDelivery === "function" && usesNewDelivery();
  return `<details class="sales-package-comparison"><summary id="package-comparison-title">Compare RSVP, events and draft timing</summary><p>Every design belongs to one collection. Compare what is included before you choose.</p>
    <div class="sales-comparison-scroll" tabindex="0" role="region" aria-label="Compare all three invitation packages"><table><caption class="sales-visually-hidden">Invitation package prices, opening styles, RSVP and delivery</caption><thead><tr><th scope="col">Your invitation</th><th scope="col">Premium<br><span>${premium}</span></th><th scope="col">Luxury<br><span>${luxury}</span></th><th scope="col">Dearly<br><span>${dearly}</span></th></tr></thead><tbody>
      <tr><th scope="row">The opening</th><td>Story-led layouts</td><td>Cinematic reveals</td><td>Botanical wax-seal opening</td></tr>
      <tr><th scope="row">Wedding events</th><td>Up to 5</td><td>All your events</td><td>All your events</td></tr>
      <tr><th scope="row">Music, photos & maps</th><td>Included</td><td>Included</td><td>Included</td></tr>
      <tr><th scope="row">Guest replies</th><td>WhatsApp RSVP included</td><td>WhatsApp RSVP included</td><td>Email RSVP included</td></tr>
      <tr><th scope="row">Email RSVP</th><td>Optional +${email}</td><td>Optional +${email}</td><td>Included at no extra cost</td></tr>
      <tr><th scope="row">First draft*</th><td>Within 48h</td><td>Within 48h</td><td>Within ${newDelivery ? "48" : "24"}h</td></tr>
      <tr><th scope="row">24h express</th><td>Optional +${express}</td><td>Optional +${express}</td><td>${newDelivery ? `Optional +${express}` : "Included"}</td></tr>
      ${newDelivery ? `<tr><th scope="row">12h first draft</th><td>Optional +${fastest}</td><td>Optional +${fastest}</td><td>Optional +${fastest}</td></tr>` : ""}
      <tr><th scope="row">See the difference</th><td><button type="button" onclick="openPreview(1)">Preview Premium</button></td><td><button type="button" onclick="openPreview(21)">Preview Luxury</button></td><td><button type="button" onclick="openPreview(35)">Preview Dearly</button></td></tr>
    </tbody></table></div><p class="sales-comparison-footnote">*After payment and complete details. New-order speeds are subject to availability at checkout; existing orders keep their purchased promise. Review before final approval. Free revision requests for 24 hours after your first draft.</p></details>`;
}

function renderSalesPricing() {
  const container = pricingSection?.querySelector(".container");
  if (!container) return;
  container.querySelector(".pricing-grid").insertAdjacentHTML("beforebegin", `<p class="sales-value-price">Your welcome, wedding schedule and venue directions in one link. No extra charge for guest 50 or guest 500.</p>${packageComparison()}`);
  container.querySelector(".pricing-reassurance")?.remove();
  container.insertAdjacentHTML("beforeend", `
    <section class="sales-delivery-planner" aria-labelledby="delivery-planner-title"><div><h3 id="delivery-planner-title">When do you want to start inviting?</h3><p>Leave time to review your draft before sharing it with your guests.</p></div><div class="sales-planner-fields"><label>Payment + complete details ready on<input type="date" id="planner-ready-date"></label><label>Want to share invitations by<input type="date" id="planner-share-date"></label></div><p id="delivery-plan-result" aria-live="polite">Choose your dates to compare standard and express delivery.</p><button type="button" class="sales-text-button" onclick="askDeliveryOnWhatsApp()">Check delivery with our team</button></section>`);
  const ready = document.getElementById("planner-ready-date");
  const share = document.getElementById("planner-share-date");
  const today = salesLocalDate(new Date());
  ready.min = today;
  ready.value = today;
  share.min = today;
  ready.addEventListener("change", updateDeliveryPlan);
  share.addEventListener("change", updateDeliveryPlan);
  updateSalesPrices();
  renderSavedDesigns();
  updateSelectedDesignNote();
  setupStudioPricing(container);
}

function updateSelectedDesignNote(item = lastChosenDesign()) {
  const note = document.getElementById("pricing-selected-design");
  if (!note) return;
  note.hidden = !item;
  if (!item) return;
  if (document.body.classList.contains("studio-home")) {
    note.innerHTML = `<img src="${item.image}" alt="" width="44" height="56"><span><strong>${item.name}</strong><small>${packageName(item.tier)} · ${formatPrice(getItemPrices(item).priceINR, getItemPrices(item).priceUSD)} · Personalized for you</small></span><button type="button" class="sales-text-button" onclick="openOrderDrawerForTemplate(${item.id})">Review &amp; book →</button>`;
    if (typeof IntersectionObserver !== "undefined") {
      if (!salesPricingNoteObserver) salesPricingNoteObserver = new IntersectionObserver(() => updateMobileBookingBar(), { rootMargin: "-68px 0px -80px 0px" });
      salesPricingNoteObserver.disconnect();
      salesPricingNoteObserver.observe(note);
    }
    updateMobileBookingBar();
    return;
  }
  note.innerHTML = `<span><strong>${item.name}</strong> · ${packageName(item.tier)} · ${formatPrice(getItemPrices(item).priceINR, getItemPrices(item).priceUSD)}<br>This design’s collection sets its price. Optional extras are shown before payment.</span><button type="button" class="sales-text-button" onclick="openOrderDrawerForTemplate(${item.id})">Review this design &amp; book →</button>`;
}

function updateSalesPrices() {
  document.querySelectorAll("[data-sales-price]").forEach(element => {
    const base = TIER_BASE_PRICE[Number(element.dataset.salesPrice)];
    if (base) element.textContent = `${element.dataset.salesPricePrefix || (element.closest(".hero-offer-line") ? "From " : "")}${formatPrice(base.inr, base.usd)}`;
  });
  const packageSelect = document.getElementById("finder-package");
  if (packageSelect) [2, 3, 4].forEach(tier => {
    packageSelect.querySelector(`[value="${tier}"]`).textContent = `${packageName(tier)} · ${formatPrice(TIER_BASE_PRICE[tier].inr, TIER_BASE_PRICE[tier].usd)}`;
  });
}

function salesLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function updateDeliveryPlan() {
  const readyInput = document.getElementById("planner-ready-date");
  const shareInput = document.getElementById("planner-share-date");
  const result = document.getElementById("delivery-plan-result");
  if (!readyInput.value || !shareInput.value) {
    result.textContent = "Choose your dates to compare standard and express delivery.";
    return;
  }
  if (!readyInput.validity.valid || !shareInput.validity.valid) {
    result.textContent = "Choose today or a future date to plan your invitation.";
    return;
  }
  const ready = new Date(`${readyInput.value}T12:00:00`);
  const share = new Date(`${shareInput.value}T12:00:00`);
  const standardDraft = new Date(ready);
  standardDraft.setDate(standardDraft.getDate() + 2);
  const expressDraft = new Date(ready);
  expressDraft.setDate(expressDraft.getDate() + 1);
  const dateLabel = date => date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const dates = `Estimated draft dates: standard ${dateLabel(standardDraft)}; express ${dateLabel(expressDraft)}. `;
  const days = Math.round((Date.UTC(share.getFullYear(), share.getMonth(), share.getDate()) - Date.UTC(ready.getFullYear(), ready.getMonth(), ready.getDate())) / 86400000);
  if (days < 0) result.textContent = "Your complete details need to arrive before your planned sharing date. Ask us what is possible.";
  else if (days < 2) result.textContent = `${dates}That is a tight turnaround. Express is within 24h after payment + complete details, then you have a 24h revision window. Check with us before booking.`;
  else if (days < 3) result.textContent = `${dates}Express gives you more room to review: a first draft within 24h, then a 24h revision window. Check the speed and included benefits shown at checkout. Existing promises stay unchanged.`;
  else result.textContent = `${dates}Standard gives you a first draft within 48h, then a 24h window for revision requests. Send complete details early so you have time to review.`;
}

function askDeliveryOnWhatsApp() {
  const last = TEMPLATE_DATABASE[previewState.currentIndex];
  const message = `Hi InviteStory! ${last ? `I’m interested in ${last.name} (${packageName(last.tier)}). ` : ""}Can you help me check the delivery timeline before I book?`;
  trackConversionEvent("whatsapp_click", { cta_location: "delivery_planner", content_name: last?.name || "Delivery enquiry" });
  window.open(`https://wa.me/918281583882?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

function updateSalesOrder() {
  if (typeof PreviewThemes !== "undefined") PreviewThemes.apply(document.getElementById("order-drawer-modal"), orderDrawerState.isPackage ? null : orderDrawerState.template, true);
  const modal = document.getElementById("order-drawer-modal");
  if (!modal) return;
  const tier = orderDrawerState.tier;
  const isDearly = tier === 4;
  const newDelivery = typeof orderUsesNewDelivery === "function" && orderUsesNewDelivery();
  const express = isDearly || document.getElementById("order-drawer-addon-express")?.checked;
  const hours = typeof deliveryHoursForOrder === "function" ? deliveryHoursForOrder() : (express ? 24 : 48);
  const chosenStep = document.getElementById("sales-chosen-step");
  if (chosenStep) chosenStep.textContent = orderDrawerState.isPackage ? "Package chosen" : "Design chosen";
  const essentials = document.getElementById("sales-order-essentials");
  if (essentials) essentials.textContent = `Your music · Venue maps · ${isDearly ? "Email" : "WhatsApp"} RSVP included`;
  const rsvp = document.getElementById("sales-order-rsvp");
  if (rsvp) rsvp.textContent = isDearly ? "Email RSVP included. Email notifications contain guest names and an Excel download option." : "WhatsApp RSVP included. Guests reply directly on WhatsApp.";
  const delivery = document.getElementById("order-drawer-delivery-tag");
  if (delivery) delivery.textContent = `First draft within ${hours}h`;
  const reassurance = modal.querySelector(".order-drawer-guarantee");
  if (reassurance) reassurance.textContent = `First draft within ${hours}h after payment and complete details.`;
  const firstDraft = modal.querySelectorAll(".order-step-title")[2];
  if (firstDraft) firstDraft.textContent = `First draft within ${hours}h`;
  const expressDescription = document.getElementById("order-addon-express-sub");
  if (expressDescription) expressDescription.textContent = isDearly && !newDelivery ? "First draft within 24h, included with Dearly" : "First draft within 24h after payment + complete details";
  const upgrade = document.getElementById("sales-dearly-suggestion");
  if (upgrade) {
    const email = document.getElementById("order-drawer-addon-email-rsvp")?.checked;
    const showUpgrade = tier === 3 && email;
    upgrade.hidden = !showUpgrade;
    if (showUpgrade) {
      const deliveryCost = newDelivery ? deliveryFeeForOrder() : 0;
      const dearlyPrice = packageBasePrice(4) + deliveryCost;
      const difference = orderDrawerState.total - dearlyPrice;
      const cost = formatPrice(TIER_BASE_PRICE[4].inr + (currentCurrency === "INR" ? deliveryCost : 0), TIER_BASE_PRICE[4].usd + (currentCurrency === "USD" ? deliveryCost : 0));
      upgrade.innerHTML = `<strong>A Dearly suite is ${cost}, with Email RSVP included${newDelivery ? ` and the same ${hours}h first-draft speed` : " + express included"}.</strong><p>${difference >= 0 ? `Your current selection is ${difference === 0 ? "the same price" : `${formatPrice(currentCurrency === "INR" ? difference : 0, currentCurrency === "USD" ? difference : 0)} more`}.` : "Compare the package before choosing."} Dearly has its own four botanical designs and a wax-seal opening. Your current design stays selected unless you choose another.</p><button type="button" onclick="compareDearlyFromOrder()">Compare the four Dearly designs</button>`;
    }
  }
  if (typeof InviteInteractions !== "undefined") InviteInteractions.syncOrder();
}

function compareDearlyFromOrder() {
  trackConversionEvent("consider_dearly", { content_name: orderDrawerState.template?.name || "Luxury Package", content_ids: orderDrawerState.template ? [String(orderDrawerState.template.id)] : [], value: orderDrawerState.total, currency: currentCurrency });
  closeOrderDrawer(false);
  if (previewModal?.classList.contains("is-open")) closePreview(false);
  history.replaceState({modalOpen:false}, "", location.pathname);
  resetFilters();
  selectTier(4);
  document.getElementById("catalogue-header").scrollIntoView({ behavior: "smooth", block: "start" });
}

function onSalesOrderOpen() {
  salesOrderFocus = document.activeElement;
  hideToast();
  const item = orderDrawerState.template;
  if (item) {
    try { localStorage.setItem("invitestory_selected_design", JSON.stringify({ id: item.id, name: item.name })); } catch (_) {}
    salesBookingDismissed = false;
    renderSavedDesigns();
    updateSelectedDesignNote(item);
  }
  document.body.classList.add("sales-order-open");
  document.querySelector("#order-drawer-modal .order-drawer-close")?.focus();
  const content = document.querySelector("#order-drawer-modal .order-drawer-content");
  if (content) content.scrollTop = 0;
  updateSalesOrder();
  updateMobileBookingBar();
  if (typeof InviteInteractions !== "undefined") InviteInteractions.orderOpened();
}

function onSalesOrderClose() {
  document.body.classList.remove("sales-order-open");
  updateMobileBookingBar();
  if (salesOrderFocus?.isConnected) salesOrderFocus.focus();
}

function syncSalesPreview(item) {
  salesBookingDismissed = false;
  renderSavedDesigns();
  const share = document.getElementById("preview-footer-share-btn");
  if (share) {
    share.setAttribute("aria-label", "Share this design with your partner or family");
    share.querySelector("span").textContent = "Share design";
  }
  const context = document.getElementById("sales-preview-context");
  if (context) context.textContent = `${item.tier === 4 ? "Email" : "WhatsApp"} RSVP included · One-time payment`;
}

function setupSalesGuidance() {
  if (!templatesGrid) return;
  const catalogueHeader = document.querySelector(".catalogue-section-header");
  if (!document.body.classList.contains("studio-home")) catalogueHeader?.insertAdjacentHTML("beforeend", '<div class="sales-catalogue-guide"><p><strong>We personalize it. You approve and share.</strong><br>Choose a design, book securely, then send your details on WhatsApp. Review your draft before it goes final.</p><a href="#pricing">See what each collection includes →</a></div>');
  let mount = document.getElementById("invitation-discovery");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "invitation-discovery";
    document.querySelector(".controls-card").before(mount);
  }
  mount.innerHTML = `<div id="saved-designs" class="sales-saved-designs"></div><details class="sales-style-finder"><summary>Not sure where to start? Find three designs for your style.</summary><form id="style-finder-form"><label>The feeling we like<select id="finder-style"><option value="traditional">Traditional</option><option value="modern">Modern & minimal</option><option value="royal">Royal & cinematic</option><option value="botanical">Floral & botanical</option><option value="illustrated">Illustrated & playful</option></select></label><label>Our package<select id="finder-package"><option value="0">Show all packages</option><option value="2">Premium</option><option value="3">Luxury</option><option value="4">Dearly</option></select></label><button type="submit">Find our three designs</button></form><p id="finder-explanation" aria-live="polite"></p></details><p id="discovery-status" class="sales-discovery-status" aria-live="polite"></p>`;
  if (!document.getElementById("catalogue-discovery-footer")) templatesGrid.insertAdjacentHTML("afterend", '<div id="catalogue-discovery-footer" class="catalogue-discovery-footer"></div>');
  document.getElementById("style-finder-form").addEventListener("submit", findStyleMatches);
  const sharedIds = (new URLSearchParams(location.search).get("shortlist") || "").split(",").map(Number).filter(id => TEMPLATE_DATABASE.some(item => item.id === id));
  if (sharedIds.length) { discovery.shared = [...new Set(sharedIds)].slice(0, 12); }
  document.getElementById("hero-customer-proof")?.insertAdjacentHTML("beforeend", customerProof(6));
  const content = document.querySelector("#order-drawer-modal .order-drawer-content");
  if (content) {
    const header = content.querySelector(".order-drawer-header");
    const title = content.querySelector(".order-drawer-title");
    if (title) title.textContent = "Make it yours.";
    const subtitle = content.querySelector(".order-drawer-subtitle");
    if (subtitle) subtitle.textContent = "We personalize it for you. Share your details on WhatsApp after booking.";
    header?.insertAdjacentHTML("afterend", '<ol class="sales-booking-progress" aria-label="Booking steps"><li><span aria-hidden="true">✓</span> <span id="sales-chosen-step">Design chosen</span></li><li aria-current="step">Review price</li><li>We personalize</li></ol>');
    content.querySelector(".order-drawer-card")?.insertAdjacentHTML("afterend", '<p id="sales-order-essentials" class="sales-order-essentials"></p>');
    const payText = document.getElementById("order-drawer-cta-text");
    if (payText) payText.textContent = "Pay";
    content.querySelector(".order-drawer-features ul")?.insertAdjacentHTML("beforeend", '<li id="sales-order-rsvp"></li>');
    content.querySelector(".order-drawer-addons")?.insertAdjacentHTML("afterend", '<aside id="sales-dearly-suggestion" class="sales-dearly-suggestion" hidden></aside>');
    content.querySelector(".order-drawer-total-bar")?.insertAdjacentHTML("afterend", `<p class="sales-order-terms">Hosting until one month after your event ends. Free revision requests for 24 hours after your first draft. <a href="refund-and-editing-policy.html" target="_blank" rel="noopener">Refund &amp; editing policy</a></p><div class="sales-customer-proof sales-order-proof">${customerProof(5)}</div>`);
    content.querySelector(".order-step-desc")?.insertAdjacentHTML("afterend", '<p class="sales-policy-note">Customization starts after payment and complete details. <a href="refund-and-editing-policy.html" target="_blank" rel="noopener">Refund & editing policy</a></p>');
    const immediate = content.querySelectorAll(".order-step-desc")[1];
    if (immediate) immediate.textContent = "Send your names, dates, venues and photos using our short checklist.";
    const support = content.querySelector(".order-drawer-wa-btn");
    if (support) support.lastChild.textContent = " Ask about this design & delivery";
    const details = document.createElement("details");
    details.className = "sales-order-disclosure";
    const summary = document.createElement("summary");
    summary.textContent = "Order details & what happens after payment";
    details.appendChild(summary);
    for (const selector of [".order-drawer-features", ".order-drawer-steps-box"]) {
      const section = content.querySelector(selector);
      if (section) details.appendChild(section);
    }
    const supportBlock = content.querySelector(".order-drawer-wa-alt");
    if (supportBlock) supportBlock.before(details);
    else content.appendChild(details);
  }
  const toolbar = document.querySelector(".preview-modal-toolbar");
  if (toolbar) toolbar.insertAdjacentHTML("beforeend", '<p id="sales-preview-context" class="sales-preview-context"></p>');
  const faq = FAQS.find(item => item.q === "We have multiple functions (Haldi, Mehendi, Sangeet…). Is that covered?");
  if (faq) faq.a = "Premium includes up to five events. Luxury and Dearly cover all your wedding events, with schedules and venue directions in one invitation link.";
  if (!FAQS.some(item => item.q === "How do WhatsApp RSVP and Email RSVP differ?")) FAQS.unshift({ q: "How do WhatsApp RSVP and Email RSVP differ?", a: "Premium and Luxury include WhatsApp RSVP: guests send their replies to you on WhatsApp. Email RSVP is an optional ₹2,000 add-on. Dearly includes Email RSVP at no extra cost. Email notifications include guest names and an option to download an Excel file; there is no separate dashboard." });
  renderFaqs();
  renderSavedDesigns();
  updateSalesPrices();
  renderCatalogue();
  updateSalesOrder();
  setupMobileSalesLayout();
  setupStudioSalesSections();
  const selected = TEMPLATE_DATABASE[previewState.currentIndex];
  if (selected) syncSalesPreview(selected);
  document.addEventListener("keydown", event => {
    if (document.querySelector(".interaction-sheet[open]")) return;
    if (document.getElementById("wa-lightbox")?.classList.contains("active")) return;
    const modal = document.getElementById("order-drawer-modal");
    if (!modal?.classList.contains("is-open") || event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select, [tabindex="0"]')].filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
}

document.addEventListener("DOMContentLoaded", setupSalesGuidance);


function setupStudioPricing(container) {
  if (!document.body.classList.contains("studio-home")) return;
  const heading = container.querySelector(".section-title");
  if (heading) heading.textContent = "Choose your kind of invitation.";
  const descriptions = ["Interactive invitation", "Cinematic invitation", "Wax-seal invitation"];
  const openings = ["Story-led layouts", "Cinematic reveals", "Floral wax-seal reveal"];
  const collections = ["Premium", "Luxury", "Dearly"];
  container.querySelectorAll(".pricing-card").forEach((card, index) => {
    const features = card.querySelector(".pricing-card-features");
    if (!features) return;
    const details = document.createElement("details");
    details.className = "studio-package-details";
    details.open = !window.matchMedia("(max-width: 760px)").matches;
    details.innerHTML = '<summary>See everything included</summary>';
    features.before(details);
    details.appendChild(features);
    const tagline = card.querySelector(".pricing-card-tagline");
    if (tagline) tagline.innerHTML = `<strong>${descriptions[index]}</strong><dl class="sales-package-facts"><div><dt>Opening</dt><dd>${openings[index]}</dd></div><div><dt>Guest replies</dt><dd>${index === 2 ? "Email RSVP included" : "WhatsApp RSVP included"}</dd></div><div><dt>First draft</dt><dd>Within ${index === 2 && !(typeof usesNewDelivery === "function" && usesNewDelivery()) ? "24" : "48"}h*</dd></div></dl>`;
    const browseLabel = card.querySelector("[data-pay-label]");
    if (browseLabel) browseLabel.textContent = `Browse ${collections[index]} designs`;
    const note = card.querySelector(".pkg-microcopy");
    if (note) note.textContent = "*After payment and complete details. Approve your draft before sharing.";
  });
  const grid = container.querySelector(".pricing-grid");
  const comparison = container.querySelector(".sales-package-comparison");
  if (grid && comparison) grid.after(comparison);
  const value = container.querySelector(".sales-value-price");
  if (value) value.textContent = "Every collection includes personalization, music, venue maps and unlimited sharing. Hosting until one month after your event ends. One-time payment.";
  if (typeof setupHomeCollectionCards === "function") setupHomeCollectionCards(container);
  const planner = container.querySelector(".sales-delivery-planner");
  if (planner) {
    const timing = document.createElement("details");
    timing.className = "studio-timing-check";
    timing.innerHTML = '<summary>Need it soon? Check your draft timing</summary>';
    planner.before(timing);
    timing.appendChild(planner);
  }
}

function setupStudioSalesSections() {
  if (!document.body.classList.contains("studio-home")) return;
  const list = document.getElementById("faq-list");
  const priority = ["How long does customisation take?", "Can I see a draft before it's final?", "How do I pay?", "How do WhatsApp RSVP and Email RSVP differ?", "What about refunds?"];
  if (list) {
    const items = [...list.querySelectorAll(".faq-item")];
    priority.forEach(question => {
      const item = items.find(item => item.querySelector(".faq-question > span").textContent === question);
      if (item) list.appendChild(item);
    });
    const more = document.createElement("details");
    more.className = "studio-more-questions";
    more.innerHTML = '<summary>More questions about your invitation</summary>';
    items.filter(item => !priority.includes(item.querySelector(".faq-question > span").textContent)).forEach(item => more.appendChild(item));
    list.appendChild(more);
  }
  const budget = document.querySelector(".budget-section");
  const guides = document.querySelector(".guides-section");
  const final = document.querySelector(".final-cta");
  if (budget && guides && final) {
    const extras = document.createElement("details");
    extras.className = "studio-other-options";
    extras.innerHTML = '<summary>DIY options and wedding guides</summary>';
    final.before(extras);
    extras.append(budget, guides);
  }
  const proof = document.getElementById("hero-customer-proof");
  const proofSubtitle = document.querySelector(".social-proof .section-subtitle");
  if (proof && proofSubtitle) proofSubtitle.after(proof);
  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
