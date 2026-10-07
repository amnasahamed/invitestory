// scripts/card-tilt.js — 3D tilt + glare hover effect for cards.
// Elements are marked with `data-tilt` (added where the original build used
// its <CardTilt> component) and carry data-tilt-intensity (default 12).
// Each card already contains a glare <div> in its markup.

const DEFAULT_INTENSITY = 12;

function setupTilt(el) {
	if (el.__tiltBound) return;
	el.__tiltBound = true;

	const intensity = Number(el.dataset.tiltIntensity) || DEFAULT_INTENSITY;
	const glare = el.querySelector(
		":scope > .pointer-events-none.absolute.inset-0",
	);

	function onMove(e) {
		const rect = el.getBoundingClientRect();
		const px = e.clientX - rect.left;
		const py = e.clientY - rect.top;
		const rotateX = ((py - rect.height / 2) / (rect.height / 2)) * -intensity;
		const rotateY = ((px - rect.width / 2) / (rect.width / 2)) * intensity;
		el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
		if (glare) {
			const gx = (px / rect.width) * 100;
			const gy = (py / rect.height) * 100;
			glare.style.opacity = "0.35";
			glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 235, 175, 0.45) 0%, transparent 60%)`;
		}
	}

	function onLeave() {
		el.style.transform = "rotateX(0deg) rotateY(0deg)";
		if (glare) glare.style.opacity = "0";
	}

	el.addEventListener("mousemove", onMove);
	el.addEventListener("mouseleave", onLeave);
}

export function initCardTilt() {
	if (!window.matchMedia("(pointer: fine)").matches) return;
	document.querySelectorAll("[data-tilt]").forEach(setupTilt);
}
