// scripts/countdown.js — ticks the countdown every second, pops changed
// digits (digit-pop, as the original build did) and handles the
// "Light a Diya & Release Lantern" button.

import { playChime, playBlessingSitar } from "./effects.js";
import {
	diyaIdleHtml,
	diyaLitHtml,
	DIYA_IDLE_CLASS,
	DIYA_LIT_CLASS,
} from "../sections/countdown.js";

const UNITS = ["days", "hours", "minutes", "seconds"];
const pad = (n) => String(n).padStart(2, "0");

function valuesFor(dateISO) {
	const total = Math.max(0, new Date(dateISO).getTime() - Date.now());
	return {
		done: total === 0,
		days: Math.floor(total / 864e5),
		hours: Math.floor(total / 36e5) % 24,
		minutes: Math.floor(total / 6e4) % 60,
		seconds: Math.floor(total / 1e3) % 60,
	};
}

export function initCountdown(d) {
	const root = document.getElementById("countdown");
	if (!root) return;

	const nodes = {};
	UNITS.forEach((u) => (nodes[u] = root.querySelector(`[data-countdown="${u}"]`)));
	const subtitle = root.querySelector("#countdown-digits")
		? root.querySelector(".font-royal.mt-2.text-xl")
		: null;

	function tick() {
		const v = valuesFor(d.date);
		UNITS.forEach((u) => {
			const el = nodes[u];
			if (!el) return;
			const next = pad(v[u]);
			if (el.textContent !== next) {
				el.textContent = next;
				el.classList.remove("digit-pop");
				void el.offsetWidth; // restart the animation
				el.classList.add("digit-pop");
			}
		});
		if (subtitle) {
			subtitle.textContent = v.done ? "We Are Married!" : "Until The Sacred Pheras";
		}
	}

	tick();
	setInterval(tick, 1000);

	/* ---- the diya button (one light per visit, like the original) ---- */
	const button = root.querySelector("#diya-button");
	const diyaCount = root.querySelector("#diya-count");
	const blessingCount = root.querySelector("#blessing-count");
	if (!button) return;

	button.addEventListener("click", () => {
		if (button.disabled) return;
		button.disabled = true;
		button.innerHTML = diyaLitHtml;
		button.className = DIYA_LIT_CLASS;
		if (diyaCount) diyaCount.textContent = String(Number(diyaCount.textContent) + 1);
		if (blessingCount) blessingCount.textContent = String(Number(blessingCount.textContent) + 1);
		playBlessingSitar();
		playChime();
		if (window.__releaseLantern) window.__releaseLantern();
		try {
			window.confetti({
				particleCount: 80,
				spread: 90,
				origin: { y: 0.7 },
				colors: ["#dfb141", "#ffd768", "#c41e3a", "#ffffff"],
			});
		} catch (e) {
			/* confetti unavailable */
		}
	});

	// keep the idle markup referenced so bundlers/tree-shaking can't drop it
	button.dataset.idleHtml = diyaIdleHtml;
	button.dataset.idleClass = DIYA_IDLE_CLASS;
}
