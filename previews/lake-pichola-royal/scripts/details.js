// scripts/details.js — the "Download Invitation (.ics)" button.

import { downloadWeddingIcs } from "./calendar.js";
import { weddingData as d } from "../content/wedding-data.js";

export function initDetails() {
	document.getElementById("details-ics")?.addEventListener("click", () => {
		downloadWeddingIcs(d);
	});
}
