// scripts/main.js — entry point: composes the page from the section modules
// and starts every behaviour script.

import { weddingData as d } from "../content/wedding-data.js";

import { renderNavbar } from "../sections/navbar.js";
import { renderHero } from "../sections/hero.js";
import { renderStory } from "../sections/story.js";
import { renderCountdown } from "../sections/countdown.js";
import { renderItinerary } from "../sections/itinerary.js";
import { renderGallery } from "../sections/gallery.js";
import { renderDetails } from "../sections/details.js";
import { renderFooter } from "../sections/footer.js";
import { renderDock } from "../sections/dock.js";

import { initReveal } from "./reveal.js";
import { initCardTilt } from "./card-tilt.js";
import { initNavbar } from "./navbar.js";
import { initHero } from "./hero.js";
import { initCountdown } from "./countdown.js";
import { initItinerary } from "./itinerary.js";
import { initGallery } from "./gallery.js";
import { initDetails } from "./details.js";
import { initFooter } from "./footer.js";
import { initDock } from "./dock.js";
import { initEffects } from "./effects.js";

function compose() {
	const root = document.getElementById("root");
	if (!root) return;

	root.innerHTML = `
    <div class="relative min-h-screen bg-[#070b14] text-[#f8edd1] selection:bg-[#dfb141]/30 selection:text-[#ffd768]">
      <canvas id="pichola-canvas" class="pointer-events-none fixed inset-0 z-10 h-full w-full"></canvas>
      ${renderNavbar(d)}
      <main class="relative z-20">
        ${renderHero(d)}
        ${renderStory(d)}
        ${renderCountdown(d)}
        ${renderItinerary(d)}
        ${renderGallery(d)}
        ${renderDetails(d)}
        ${renderFooter(d)}
      </main>
      ${renderDock(d)}
    </div>`;
}

function start() {
	compose();
	initEffects();
	initNavbar();
	initHero();
	initReveal();
	initCardTilt();
	initCountdown(d);
	initItinerary();
	initGallery();
	initDetails();
	initFooter();
	initDock();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", start);
} else {
	start();
}
