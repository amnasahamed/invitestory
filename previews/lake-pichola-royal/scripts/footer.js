// scripts/footer.js — copy-the-hashtag button (with confetti) and Back-to-Top.

import { weddingData as d } from "../content/wedding-data.js";
import { icon } from "./icons.js";

export function initFooter() {
	const hashtagBtn = document.getElementById("footer-hashtag");
	const copied = document.getElementById("footer-copied");
	const topBtn = document.getElementById("footer-top");
	if (hashtagBtn) {
		// markup for the two icon states (the original swaps copy → check)
		const idleIcon = hashtagBtn.querySelector("svg")?.outerHTML || "";
		const checkIcon = icon(
			"check",
			"h-4 w-4 text-emerald-400 animate-bounce"
		);
		hashtagBtn.addEventListener("click", () => {
			// clipboard.writeText returns a promise — a bare try/catch would not
			// catch a rejection (e.g. document not focused), so chain .catch().
			Promise.resolve(
				navigator.clipboard?.writeText(d.hashtag)
			).catch(() => {
				/* clipboard unavailable */
			});
			const svg = hashtagBtn.querySelector("svg");
			if (svg) svg.outerHTML = checkIcon;
			if (copied) {
				copied.hidden = false;
				setTimeout(() => {
					copied.hidden = true;
					const done = hashtagBtn.querySelector("svg");
					if (done) done.outerHTML = idleIcon;
				}, 2500);
			}
			try {
				window.confetti({
					particleCount: 50,
					spread: 70,
					origin: { y: 0.8 },
					colors: ["#dfb141", "#ffd768", "#c41e3a", "#ffffff"],
				});
			} catch (e) {
				/* confetti unavailable */
			}
		});
	}

	topBtn?.addEventListener("click", () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
}
