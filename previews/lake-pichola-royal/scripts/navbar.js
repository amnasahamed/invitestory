// scripts/navbar.js — scroll progress line, condensing header, mobile menu.

import { icon } from "./icons.js";

const HEADER_BASE = "fixed top-0.5 left-0 right-0 z-40 transition-all duration-500";
const HEADER_IDLE = "bg-transparent py-5";
const HEADER_SCROLLED =
	"bg-[#070b14]/90 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl border-b border-[#dfb141]/25";

export function initNavbar() {
	const header = document.getElementById("site-header");
	const progress = document.getElementById("scroll-progress");
	const toggle = document.getElementById("nav-toggle");
	const menu = document.getElementById("mobile-menu");

	let ticking = false;
	function update() {
		ticking = false;
		const scrollY = window.scrollY;
		const max = document.documentElement.scrollHeight - window.innerHeight;
		if (progress) progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
		if (header) {
			const scrolled = scrollY > 60;
			header.className = `${HEADER_BASE} ${scrolled ? HEADER_SCROLLED : HEADER_IDLE}`;
		}
	}
	function onScroll() {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(update);
		}
	}
	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", () => {
		if (window.innerWidth >= 768) close();
	});
	update();

	function close() {
		if (!menu || menu.hidden) return;
		menu.hidden = true;
		if (toggle) toggle.innerHTML = icon("menu", "h-4 w-4");
	}

	toggle?.addEventListener("click", () => {
		if (!menu) return;
		menu.hidden = !menu.hidden;
		toggle.innerHTML = icon(menu.hidden ? "menu" : "x", "h-4 w-4");
	});
	menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}
