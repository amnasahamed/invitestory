/* scripts/reveal.js — scroll-reveal for .reveal elements.
   Elements fade/slide in when they enter the viewport (same observer settings
   as the original build: 18% visible, bottom edge nudged up by 6%). */

export function initReveal() {
	const els = document.querySelectorAll(".reveal");
	if (!("IntersectionObserver" in window)) {
		els.forEach((el) => el.classList.add("is-visible"));
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					io.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
	);
	els.forEach((el) => io.observe(el));
}
