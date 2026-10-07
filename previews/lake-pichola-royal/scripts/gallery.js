// scripts/gallery.js — opens the light-box (markup lives in sections/gallery.js).

import { weddingData as d } from "../content/wedding-data.js";

export function initGallery() {
	const section = document.getElementById("gallery");
	if (!section) return;

	// the light-box shell is rendered as a sibling of the section (it is a
	// fixed-position overlay), so look it up from the document.
	const lightbox = document.getElementById("gallery-lightbox");
	const img = document.getElementById("gallery-lightbox-img");
	const title = document.getElementById("gallery-lightbox-title");
	const tag = document.getElementById("gallery-lightbox-tag");
	const closeBtn = document.getElementById("gallery-lightbox-close");
	if (!lightbox || !img) return;

	let index = 0;

	function show(i) {
		index = (i + d.gallery.length) % d.gallery.length;
		const g = d.gallery[index];
		img.src = g.image;
		img.alt = g.title;
		if (title) title.textContent = g.title;
		if (tag) tag.textContent = g.tag;
		lightbox.hidden = false;
	}

	function hide() {
		lightbox.hidden = true;
	}

	section.querySelectorAll("[data-gallery-index]").forEach((card) => {
		const open = () => show(Number(card.dataset.galleryIndex));
		card.addEventListener("click", open);
		card.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				open();
			}
		});
	});

	closeBtn?.addEventListener("click", hide);
	lightbox.addEventListener("click", (e) => {
		if (e.target === lightbox) hide();
	});
	window.addEventListener("keydown", (e) => {
		if (lightbox.hidden) return;
		if (e.key === "Escape") hide();
		if (e.key === "ArrowRight") show(index + 1);
		if (e.key === "ArrowLeft") show(index - 1);
	});
}
