// scripts/itinerary.js — day filter tabs (.ics / Google Cal buttons live in
// the section markup; only the tab switching happens here).

import { weddingData as d } from "../content/wedding-data.js";
import { renderItinerary } from "../sections/itinerary.js";
import { initCardTilt } from "./card-tilt.js";
import { initItineraryIcs } from "./itinerary-ics.js";

export function initItinerary() {
	const section = document.getElementById("itinerary");
	const tablist = section?.querySelector("#itinerary-tabs");
	const grid = section?.querySelector("#itinerary-grid");
	if (!tablist || !grid) return;

	let activeDay = "all";

	function paint() {
		// re-render only the cards + tabs, keeping the section in place
		const html = renderItinerary(d, activeDay);
		const tmp = document.createElement("div");
		tmp.innerHTML = html;
		tablist.innerHTML = tmp.querySelector("#itinerary-tabs").innerHTML;
		grid.innerHTML = tmp.querySelector("#itinerary-grid").innerHTML;
		grid.dataset.day = activeDay;
		initCardTilt();
		initItineraryIcs();
		bindTabs();
	}

	function bindTabs() {
		tablist.querySelectorAll("[data-day]").forEach((btn) => {
			btn.addEventListener("click", () => {
				if (btn.dataset.day === activeDay) return;
				activeDay = btn.dataset.day;
				paint();
			});
		});
	}

	bindTabs();
	initItineraryIcs();
}
