// scripts/itinerary-ics.js — the per-event .ics buttons inside the cards.

import { weddingData as d } from "../content/wedding-data.js";
import { downloadEventIcs } from "./calendar.js";

export function initItineraryIcs() {
	document.querySelectorAll("[data-ics]").forEach((btn) => {
		if (btn.__icsBound) return;
		btn.__icsBound = true;
		btn.addEventListener("click", () => {
			const ev = d.events.find((e) => e.id === btn.dataset.ics);
			if (ev) downloadEventIcs(d, ev);
		});
	});
}
