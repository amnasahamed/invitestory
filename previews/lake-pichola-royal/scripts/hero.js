// scripts/hero.js — hero parallax: the twilight background and the copy drift
// with the pointer (window-wide, as in the original build) while the page
// scrolls past.

export function initHero() {
	const section = document.getElementById("hero");
	const bg = document.getElementById("hero-bg");
	const content = document.getElementById("hero-content");
	if (!section || !bg || !content) return;

	let mx = 0;
	let my = 0;
	let scrollY = window.scrollY;
	let ticking = false;

	function render() {
		ticking = false;
		bg.style.transform = `translate3d(${mx * 12}px, ${scrollY * 0.3 + my * 12}px, 0) scale(1.08)`;
		content.style.transform = `translate3d(${mx * -6}px, ${my * -6}px, 0)`;
	}

	function schedule() {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(render);
		}
	}

	window.addEventListener(
		"mousemove",
		(e) => {
			mx = (e.clientX / window.innerWidth - 0.5) * 2;
			my = (e.clientY / window.innerHeight - 0.5) * 2;
			schedule();
		},
		{ passive: true },
	);
	window.addEventListener(
		"scroll",
		() => {
			scrollY = window.scrollY;
			schedule();
		},
		{ passive: true },
	);
	render();
}
