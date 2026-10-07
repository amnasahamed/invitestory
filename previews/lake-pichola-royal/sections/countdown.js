/* countdown.js — live countdown + “Light a Diya” button
   Counts down to weddingData.date every second (scripts/countdown.js ticks and
   pops the digits). startDiyas / startBlessings (add them to wedding-data.js)
   seed the two counters under the button; they rise when a guest clicks it. */

import { icon } from "../scripts/icons.js";
/* button markup for the two states (scripts/countdown.js swaps them) */
export const diyaIdleHtml = `${icon("flame", "h-4 w-4 text-[#070b14] group-hover:scale-125 transition-transform")}<span>Light A Diya &amp; Release Lantern</span>${icon("heart", "h-3.5 w-3.5 fill-[#070b14]")}`;
export const diyaLitHtml = `${icon("flame", "h-4 w-4 text-[#ffd768] fill-[#ffd768] animate-bounce")}<span>Diya Lit &amp; Sky Lantern Released</span>${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}`;
export const DIYA_IDLE_CLASS = "group inline-flex items-center gap-2.5 rounded-full px-9 py-4 font-royal text-xs font-bold uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(223,177,65,0.35)] transition-all duration-300 bg-gradient-to-r from-[#dfb141] via-[#ffd768] to-[#dfb141] text-[#070b14] hover:shadow-[0_0_45px_rgba(223,177,65,0.6)] hover:scale-105 active:scale-95";
export const DIYA_LIT_CLASS = "group inline-flex items-center gap-2.5 rounded-full px-9 py-4 font-royal text-xs font-bold uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(223,177,65,0.35)] transition-all duration-300 bg-[#153729] text-[#ffd768] cursor-default border border-[#dfb141]/50";


export function renderCountdown(d) {
  const SEPARATOR = `<span class="font-royal -mt-6 text-2xl font-bold text-[#dfb141]">:</span>`;
  const pad = (n) => String(n).padStart(2, "0");
  const units = [
    ["days", "Days"],
    ["hours", "Hours"],
    ["minutes", "Minutes"],
    ["seconds", "Seconds"],
  ];

  const total = Math.max(0, new Date(d.date).getTime() - Date.now());
  const value = {
    days: Math.floor(total / 864e5),
    hours: Math.floor(total / 36e5) % 24,
    minutes: Math.floor(total / 6e4) % 60,
    seconds: Math.floor(total / 1e3) % 60,
  };
  const done = total === 0;

  const digit = (unit, label) => `
<div class="flex flex-col items-center"><div class="glass-twilight relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105 hover:border-[#dfb141]"><span data-countdown="${unit}" class="gold-text-glow font-royal text-3xl font-bold sm:text-4xl">${pad(value[unit])}</span></div><span class="font-royal mt-3 text-[11px] uppercase tracking-[0.3em] text-[#dfb141] font-bold">${label}</span></div>
  `;
  const digits = units.map(([u, l]) => digit(u, l)).join(SEPARATOR);

  return `
<section id="countdown" class="reveal relative overflow-hidden bg-gradient-to-b from-[#070b14] via-[#0d1629] to-[#070b14] px-6 py-32 text-center"><div class="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#dfb141]/10 blur-3xl"></div><div class="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-[#c41e3a]/10 blur-3xl"></div><div class="relative z-10 mx-auto max-w-2xl"><div class="inline-flex items-center gap-2.5 rounded-full border border-[#dfb141]/40 bg-[#0d1527]/90 px-5 py-2 shadow-lg backdrop-blur-xl">${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}<span class="font-royal text-[11px] font-bold uppercase tracking-[0.35em] text-[#ffd768]">The Auspicious Countdown</span>${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}</div><h2 class="gold-text-glow font-script mt-4 text-6xl sm:text-7xl">Counting Down to Forever</h2><p class="font-royal mt-2 text-xl font-bold uppercase tracking-[0.25em] text-[#f8edd1]">${done ? "We Are Married!" : "Until The Sacred Pheras"}</p><div class="ornament my-6 text-xl"><span>✦</span></div><div id="countdown-digits" class="mt-10 flex items-center justify-center gap-3 sm:gap-6">${digits}
</div><div class="mt-14 inline-flex flex-col items-center"><button id="diya-button" class="group inline-flex items-center gap-2.5 rounded-full px-9 py-4 font-royal text-xs font-bold uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(223,177,65,0.35)] transition-all duration-300 bg-gradient-to-r from-[#dfb141] via-[#ffd768] to-[#dfb141] text-[#070b14] hover:shadow-[0_0_45px_rgba(223,177,65,0.6)] hover:scale-105 active:scale-95">${icon("flame", "h-4 w-4 text-[#070b14] group-hover:scale-125 transition-transform")}<span>Light A Diya &amp; Release Lantern</span>${icon("heart", "h-3.5 w-3.5 fill-[#070b14]")}</button><div class="mt-5 flex items-center justify-center gap-5 text-xs font-serif-display font-medium text-[#dcd1ba]"><span class="flex items-center gap-1.5">${icon("flame", "h-4 w-4 text-[#ffd768]")}<strong class="text-[#f8edd1] font-bold" id="diya-count">${d.startDiyas}</strong> Diyas Floating on Pichola</span><span>•</span><span class="flex items-center gap-1.5">${icon("heart", "h-4 w-4 text-[#c41e3a] fill-[#c41e3a]")}<strong class="text-[#f8edd1] font-bold" id="blessing-count">${d.startBlessings}</strong> Royal Blessings</span></div></div></div></section>
  `;
}
