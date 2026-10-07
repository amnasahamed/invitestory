/* itinerary.js — ceremonies & events with day filter tabs
   Heading, All/Day-N filter tabs and the event cards (photo, date/time/venue,
   dress code, palette swatches, .ics + Google Calendar buttons). Everything
   is derived from weddingData.events — including the tab labels. */

import { icon } from "../scripts/icons.js";
import { eventGoogleUrl } from "../scripts/calendar.js";

export function renderItinerary(d, activeDay = "all") {
  /* One filter tab per distinct `day` in weddingData.events, labelled “Day 1 • 20 Feb”,
     plus the leading “All Celebrations” tab (labels are derived automatically). */
  const shortDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const days = [...new Set(d.events.map((e) => e.day))];
  const tabs = [
    { id: "all", label: "All Celebrations" },
    ...days.map((day) => {
      const first = d.events.find((e) => e.day === day);
      return { id: day, label: `${day} • ${shortDate(first.isoDate)}` };
    }),
  ];

  const SELECTED_CLASS = `rounded-full px-6 py-2.5 font-royal text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 bg-gradient-to-r from-[#dfb141] via-[#ffd768] to-[#dfb141] text-[#070b14] shadow-[0_0_20px_rgba(223,177,65,0.4)] scale-105`;
  const IDLE_CLASS = `rounded-full px-6 py-2.5 font-royal text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 border border-[#dfb141]/35 bg-[#0d1527]/80 text-[#e6d3a3] hover:bg-[#141f38] hover:border-[#dfb141]`;

  const tabButton = (t) => `
    <button
      data-day="${t.id}"
      class="${activeDay === t.id ? SELECTED_CLASS : IDLE_CLASS}"
    >${t.label}</button>
  `;

  const eventCard = (ev, idx) => `
<div class="transition-transform duration-200 ease-out" style="perspective: 1000px;"><div data-tilt data-tilt-intensity="8" class="relative overflow-hidden h-full" style="transform: rotateX(0deg) rotateY(0deg); transform-style: preserve-3d; transition: transform 0.15s ease-out;"><div class="glass-twilight royal-corners relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:border-[#dfb141] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"><div><div class="flex items-center justify-between border-b border-[#dfb141]/20 pb-4"><div class="flex items-center gap-3"><span class="text-3xl">${ev.icon}</span><div><span class="font-royal text-[10px] font-bold uppercase tracking-[0.3em] text-[#ffd768]">${ev.day}</span><p class="font-royal text-xs font-semibold text-[#e6d3a3]">${ev.tag}</p></div></div><span class="font-royal text-[10px] font-bold uppercase tracking-[0.25em] text-[#ffd768] bg-[#070b14] px-3.5 py-1 rounded-full border border-[#dfb141]/40">0${idx + 1}</span></div><div class="relative my-4 overflow-hidden rounded-2xl border border-[#dfb141]/35 shadow-lg group"><img alt="${ev.title}" class="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105" src="${ev.image}"><div class="absolute inset-0 bg-gradient-to-t from-[#070b14]/80 via-transparent to-transparent"></div><div class="absolute bottom-2.5 left-3"><span class="font-royal rounded-full bg-[#070b14]/90 border border-[#dfb141]/50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ffd768] backdrop-blur-md">${ev.venue.split(",")[0]}</span></div></div><h3 class="font-royal text-2xl font-bold text-[#f8edd1]">${ev.title}</h3><p class="font-serif-display mt-2 text-xs leading-relaxed text-[#c9bea7]">${ev.description}</p><div class="mt-6 space-y-3 text-xs text-[#e6d3a3]"><div class="flex items-center gap-2.5">${icon("calendar", "h-4 w-4 text-[#ffd768] shrink-0")}<span class="font-bold">${ev.date}</span></div><div class="flex items-center gap-2.5">${icon("clock", "h-4 w-4 text-[#ffd768] shrink-0")}<span>${ev.time}</span></div><div class="flex items-center gap-2.5">${icon("map-pin", "h-4 w-4 text-[#ffd768] shrink-0")}<span>${ev.venue}</span></div></div><div class="mt-6 rounded-2xl bg-[#070b14]/70 p-4 border border-[#dfb141]/25"><div class="flex items-center justify-between"><span class="font-royal text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd768]">Attire &amp; Dress Code:</span><span class="font-serif-display italic text-xs font-bold text-[#f8edd1]">${ev.dressCode}</span></div><div class="mt-3 flex items-center gap-2"><span class="font-royal text-[9px] uppercase tracking-wider text-[#dcd1ba]">Palette:</span><div class="flex items-center gap-2">${ev.colors.map((c) => `
<div class="group relative flex items-center justify-center"><span class="h-5 w-5 rounded-full border border-white/20 shadow-md transition-transform group-hover:scale-125" title="${c.name} (${c.hex})" style="background-color: ${c.hex.toLowerCase()};"></span><span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#070b14] border border-[#dfb141]/50 px-2 py-0.5 font-royal text-[9px] text-[#ffd768] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">${c.name}</span></div>
    `).join("")}</div></div></div></div><div class="mt-6 pt-4 border-t border-[#dfb141]/20 flex flex-wrap items-center justify-between gap-2"><span class="font-royal text-[10px] font-bold tracking-wider text-[#dfb141]">Add to Calendar:</span><div class="flex items-center gap-2"><button type="button" data-ics="${ev.id}" class="inline-flex items-center gap-1.5 rounded-full bg-[#121c33] border border-[#dfb141]/40 px-3.5 py-1.5 text-[10px] font-royal font-bold uppercase tracking-wider text-[#f8edd1] shadow-sm transition-all hover:bg-[#1a2849] hover:border-[#dfb141] active:scale-95">${icon("calendar-plus", "h-3 w-3 text-[#ffd768]")}<span>.ICS</span></button><a href="${eventGoogleUrl(d, ev)}" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 rounded-full bg-[#121c33] border border-[#dfb141]/40 px-3.5 py-1.5 text-[10px] font-royal font-bold uppercase tracking-wider text-[#f8edd1] shadow-sm transition-all hover:bg-[#1a2849] hover:border-[#dfb141] active:scale-95"><span>Google Cal</span>${icon("external-link", "h-2.5 w-2.5 opacity-70")}</a></div></div></div><div class="pointer-events-none absolute inset-0 transition-opacity duration-300" style="opacity: 0; background: radial-gradient(circle, rgba(255, 235, 175, 0.45) 0%, transparent 60%); mix-blend-mode: overlay;"></div></div></div>
  `;

  const grid = (day) => {
    const list = day === "all" ? d.events : d.events.filter((e) => e.day === day);
    return list.map((ev, i) => eventCard(ev, i)).join("");
  };

  return `
<section id="itinerary" class="reveal relative bg-[#070b14] px-6 py-32"><div class="mx-auto max-w-5xl text-center"><div class="inline-flex items-center gap-2.5 rounded-full border border-[#dfb141]/40 bg-[#0d1527]/90 px-5 py-2 shadow-lg backdrop-blur-xl">${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}<span class="font-royal text-[11px] font-bold uppercase tracking-[0.35em] text-[#ffd768]">Royal Celebrations Schedule</span>${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}</div><h2 class="gold-text-glow font-script mt-4 text-6xl sm:text-7xl">Ceremonies &amp; Events</h2><p class="font-royal mt-2 text-xl font-bold uppercase tracking-[0.25em] text-[#f8edd1] sm:text-2xl">Three Days of Royal Grandeur</p><div class="ornament my-6 text-xl"><span>✦</span></div><p class="font-serif-display mx-auto max-w-xl text-sm leading-relaxed text-[#dcd1ba] font-normal">Immerse in the timeless Vedic rituals, royal feasts, and starlit celebrations by the sacred waters of Lake Pichola.</p>
      <div class="mt-10 flex flex-wrap items-center justify-center gap-3" id="itinerary-tabs">
        ${tabs.map(tabButton).join("")}
      </div>
      <div class="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 text-left" id="itinerary-grid" data-day="${activeDay}">
        ${grid(activeDay)}
      </div>
</div></div></section>
  `;
}
