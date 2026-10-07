/* story.js — “Our Love Story” section
   Section heading plus one card per weddingData.storyMilestones entry (image,
   year, emoji, title, subtitle, description). Add/remove { … } entries in
   wedding-data.js to add/remove cards. */

import { icon } from "../scripts/icons.js";

export function renderStory(d) {
  const card = (m, idx) => `
<div class="transition-transform duration-200 ease-out" style="perspective: 1000px;"><div data-tilt data-tilt-intensity="10" class="relative overflow-hidden h-full" style="transform: rotateX(0deg) rotateY(0deg); transform-style: preserve-3d; transition: transform 0.15s ease-out;"><div class="glass-twilight royal-corners flex h-full flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:border-[#dfb141] hover:shadow-[0_15px_40px_rgba(223,177,65,0.2)]"><div><div class="relative mb-5 overflow-hidden rounded-2xl border border-[#dfb141]/40 shadow-inner"><img alt="${m.title}" class="h-48 w-full object-cover brightness-95 transition-transform duration-700 hover:scale-110" src="${m.image}"><div class="absolute inset-0 bg-gradient-to-t from-[#070b14]/90 via-transparent to-transparent"></div><div class="absolute bottom-3 left-3 right-3 flex items-center justify-between"><span class="font-royal rounded-full bg-[#070b14]/90 border border-[#dfb141]/60 px-3.5 py-1 text-[11px] font-bold tracking-widest text-[#ffd768] backdrop-blur-md">${m.year}</span><span class="text-2xl">${m.icon}</span></div></div><h3 class="font-royal text-lg font-bold text-[#f8edd1]">${m.title}</h3><p class="font-serif-display mt-1 text-xs italic font-semibold text-[#ffd768]">${m.subtitle}</p><p class="font-serif-display mt-3 text-xs leading-relaxed text-[#c9bea7]">${m.description}</p></div><div class="mt-6 flex items-center gap-2 border-t border-[#dfb141]/20 pt-4 text-xs text-[#dfb141]">${icon("heart", "h-3.5 w-3.5 fill-[#c41e3a] text-[#c41e3a]")}<span class="font-royal font-bold tracking-wider">Chapter 0${idx + 1}</span></div></div><div class="pointer-events-none absolute inset-0 transition-opacity duration-300" style="opacity: 0; background: radial-gradient(circle, rgba(255, 235, 175, 0.45) 0%, transparent 60%); mix-blend-mode: overlay;"></div></div></div>
  `;

  const cards = d.storyMilestones.map(card).join("");

  return `
<section id="story" class="reveal relative overflow-hidden bg-gradient-to-b from-[#070b14] via-[#0b1222] to-[#070b14] px-6 py-32"><div class="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-[#dfb141]/10 blur-3xl"></div><div class="pointer-events-none absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-[#c41e3a]/10 blur-3xl"></div><div class="mx-auto max-w-5xl text-center"><div class="inline-flex items-center gap-2.5 rounded-full border border-[#dfb141]/40 bg-[#0d1527]/90 px-5 py-2 shadow-lg backdrop-blur-xl">${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}<span class="font-royal text-[11px] font-bold uppercase tracking-[0.35em] text-[#ffd768]">The Journey of Two Souls</span>${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}</div><h2 class="gold-text-glow font-script mt-4 text-6xl sm:text-7xl">Our Love Story</h2><p class="font-royal mt-2 text-xl font-bold uppercase tracking-[0.25em] text-[#f8edd1]">From A Mumbai Sunset To Eternal Vows In Udaipur</p><div class="ornament my-6 text-xl"><span>✦</span></div><p class="font-serif-display mx-auto max-w-2xl text-sm leading-relaxed text-[#dcd1ba] font-normal">${d.storySummary}</p><div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 text-left">${cards}
</div></div></section>
  `;
}
