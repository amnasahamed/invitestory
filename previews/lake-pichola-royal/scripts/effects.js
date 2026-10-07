// scripts/effects.js — decorative background canvas + pointer sparkles +
// the little Web-Audio chimes (all ported from the original build).
//
//  • PicholaCanvas: twinkling stars, floating lanterns, water ripples and
//    lanterns spawned by clicks / the "Light a Diya" & dock buttons.
//  • SparkleTrail: gold sparkles that follow a fine pointer.
//  • playChime / playBlessingSitar: short synthesised notes (no audio files).

/* ------------------------------------------------------------------ chimes */

function audioCtx() {
	const Ctx = window.AudioContext || window.webkitAudioContext;
	return Ctx ? new Ctx() : null;
}

export function playChime() {
	try {
		const ctx = audioCtx();
		if (!ctx) return;
		const t0 = ctx.currentTime;
		[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(freq, t0 + i * 0.08);
			gain.gain.setValueAtTime(0.06, t0 + i * 0.08);
			gain.gain.exponentialRampToValueAtTime(1e-4, t0 + i * 0.08 + 1.2);
			osc.connect(gain).connect(ctx.destination);
			osc.start(t0 + i * 0.08);
			osc.stop(t0 + i * 0.08 + 1.3);
		});
	} catch (e) {
		/* audio not available */
	}
}

export function playBlessingSitar() {
	try {
		const ctx = audioCtx();
		if (!ctx) return;
		const t0 = ctx.currentTime;
		[440, 554.37, 659.25, 830.61, 880, 1108.73].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "triangle";
			osc.frequency.setValueAtTime(freq, t0 + i * 0.07);
			gain.gain.setValueAtTime(0.08, t0 + i * 0.07);
			gain.gain.exponentialRampToValueAtTime(1e-4, t0 + i * 0.07 + 1.4);
			osc.connect(gain).connect(ctx.destination);
			osc.start(t0 + i * 0.07);
			osc.stop(t0 + i * 0.07 + 1.5);
		});
	} catch (e) {
		/* audio not available */
	}
}

/* ------------------------------------------------------------------ canvas */

function initCanvas() {
	const canvas = document.getElementById("pichola-canvas");
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const stars = [];
	const ripples = [];
	const lanterns = [];

	// 90 twinkling stars across the upper two thirds of the viewport
	for (let i = 0; i < 90; i++) {
		stars.push({
			x: Math.random(),
			y: Math.random() * 0.65,
			size: Math.random() * 2 + 0.5,
			alpha: Math.random() * 0.8 + 0.2,
			speed: Math.random() * 0.02 + 0.005,
		});
	}
	// 6 drifting lanterns
	for (let i = 0; i < 6; i++) {
		lanterns.push(newLantern(Math.random() * window.innerWidth, window.innerHeight * (0.6 + Math.random() * 0.4)));
	}

	function newLantern(x, y) {
		return {
			x,
			y,
			vx: (Math.random() - 0.5) * 0.4,
			vy: -(Math.random() * 0.4 + 0.3),
			size: Math.random() * 12 + 16,
			opacity: Math.random() * 0.6 + 0.4,
			glow: Math.random() * 20 + 15,
		};
	}

	function spawnLantern(x, y, big) {
		lanterns.push({
			x,
			y,
			vx: (Math.random() - (big ? 0.4 : 0.5)) * (big ? 0.6 : 0.5),
			vy: -(Math.random() * (big ? 0.8 : 0.6) + (big ? 0.7 : 0.5)),
			size: big ? Math.random() * 10 + 22 : Math.random() * 8 + 20,
			opacity: 1,
			glow: big ? 30 : 25,
		});
	}

	// the "Light a Diya" / dock buttons release a lantern from the bottom
	window.__releaseLantern = () => {
		spawnLantern(window.innerWidth * (0.2 + Math.random() * 0.6), window.innerHeight - 80, true);
	};

	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resize();
	window.addEventListener("resize", resize);

	// taps/clicks make a ripple — clicks in the lower half also lift a lantern
	window.addEventListener("click", (e) => {
		const x = e.touches ? e.touches[0].clientX : e.clientX;
		const y = e.touches ? e.touches[0].clientY : e.clientY;
		ripples.push({ x, y, radius: 5, maxRadius: 80, opacity: 0.8 });
		if (y > window.innerHeight * 0.5) spawnLantern(x, y, false);
	});

	function frame() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// stars
		stars.forEach((s) => {
			s.alpha += s.speed;
			if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
			ctx.beginPath();
			ctx.arc(s.x * canvas.width, s.y * canvas.height, s.size, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255, 235, 175, ${s.alpha})`;
			ctx.shadowBlur = s.size * 4;
			ctx.shadowColor = "#dfb141";
			ctx.fill();
		});
		ctx.shadowBlur = 0;

		// ripples (flattened ellipses, like rings on the lake)
		for (let i = ripples.length - 1; i >= 0; i--) {
			const r = ripples[i];
			r.radius += 1.2;
			r.opacity -= 0.015;
			if (r.opacity <= 0 || r.radius >= r.maxRadius) {
				ripples.splice(i, 1);
				continue;
			}
			ctx.save();
			ctx.beginPath();
			ctx.ellipse(r.x, r.y, r.radius * 1.8, r.radius * 0.6, 0, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(223, 177, 65, ${r.opacity * 0.5})`;
			ctx.lineWidth = 1.5;
			ctx.stroke();
			ctx.restore();
		}

		// lanterns
		for (let i = lanterns.length - 1; i >= 0; i--) {
			const l = lanterns[i];
			l.x += l.vx;
			l.y += l.vy;
			l.opacity -= 0.0008;
			if (l.y < -50 || l.opacity <= 0) {
				lanterns.splice(i, 1);
				continue;
			}
			ctx.save();
			const grad = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.glow);
			grad.addColorStop(0, `rgba(255, 220, 110, ${l.opacity})`);
			grad.addColorStop(0.4, `rgba(255, 140, 30, ${l.opacity * 0.7})`);
			grad.addColorStop(1, "rgba(255, 100, 0, 0)");
			ctx.fillStyle = grad;
			ctx.beginPath();
			ctx.arc(l.x, l.y, l.glow, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = `rgba(255, 200, 80, ${l.opacity * 0.95})`;
			ctx.beginPath();
			if (ctx.roundRect) ctx.roundRect(l.x - l.size * 0.4, l.y - l.size * 0.6, l.size * 0.8, l.size * 1.2, 4);
			else ctx.rect(l.x - l.size * 0.4, l.y - l.size * 0.6, l.size * 0.8, l.size * 1.2);
			ctx.fill();

			ctx.fillStyle = `rgba(255, 255, 230, ${l.opacity})`;
			ctx.beginPath();
			ctx.arc(l.x, l.y + l.size * 0.2, l.size * 0.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}

		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

/* -------------------------------------------------------- pointer sparkles */

function initSparkleTrail() {
	if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;
	let layer = null;
	let sparkles = [];
	let id = 0;
	const COLORS = ["#f3ca65", "#ffd700", "#ffffff", "#e8c872", "#ff8597"];

	function ensureLayer() {
		if (!layer || !layer.isConnected) {
			layer = document.createElement("div");
			layer.className = "pointer-events-none fixed inset-0 z-50 overflow-hidden";
			document.body.appendChild(layer);
		}
		return layer;
	}

	window.addEventListener(
		"pointermove",
		(e) => {
			if (Math.random() > 0.4) return;
			const el = document.createElement("span");
			el.className = "absolute rounded-full animate-sparkle-fade";
			const size = Math.random() * 8 + 4;
			const color = COLORS[Math.floor(Math.random() * COLORS.length)];
			Object.assign(el.style, {
				left: `${e.clientX}px`,
				top: `${e.clientY}px`,
				width: `${size}px`,
				height: `${size}px`,
				backgroundColor: color,
				boxShadow: `0 0 ${size * 2}px ${color}`,
				transform: "translate(-50%, -50%)",
			});
			ensureLayer().appendChild(el);
			sparkles.push({ el, id: id++ });
			if (sparkles.length > 20) remove(2);
		},
		{ passive: true },
	);

	function remove(count) {
		for (let i = 0; i < count && sparkles.length; i++) {
			const s = sparkles.shift();
			s.el.remove();
		}
	}
	setInterval(() => remove(2), 150);
}

export function initEffects() {
	initCanvas();
	initSparkleTrail();
}
