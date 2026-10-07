// scripts/dock.js — floating control bar: Melody (music) toggle, quick links
// and the Release Lantern button with its live counter.

import { weddingData as d } from "../content/wedding-data.js";
import { playChime, playBlessingSitar } from "./effects.js";
import { musicIdleHtml, musicPlayingHtml } from "../sections/dock.js";

export function initDock() {
	const dock = document.getElementById("dock");
	if (!dock) return;

	/* ---- music (looping melody, volume 0.35 like the original) ---- */
	const musicBtn = document.getElementById("dock-music");
	let audio = null;
	let playing = false;

	musicBtn?.addEventListener("click", () => {
		if (!audio) {
			audio = new Audio(d.musicSrc);
			audio.loop = true;
			audio.volume = 0.35;
		}
		if (playing) {
			audio.pause();
			playing = false;
			musicBtn.innerHTML = musicIdleHtml;
		} else {
			audio
				.play()
				.then(() => {
					playing = true;
					musicBtn.innerHTML = musicPlayingHtml;
				})
				.catch(() => {
					playing = false;
				});
		}
	});

	/* ---- lantern release ---- */
	const lanternBtn = document.getElementById("dock-lantern");
	const countEl = document.getElementById("dock-lantern-count");
	let count = d.startLanterns;

	lanternBtn?.addEventListener("click", () => {
		count += 1;
		if (countEl) countEl.textContent = String(count);
		playBlessingSitar();
		playChime();
		if (window.__releaseLantern) window.__releaseLantern();
	});

	/* ---- diya button shares the lantern release ---- */
	document.getElementById("diya-button")?.addEventListener("click", () => {
		count += 1;
		if (countEl) countEl.textContent = String(count);
	});
}
