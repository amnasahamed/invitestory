/* gallery.js — photo grid + light-box
   Heading plus one card per weddingData.gallery entry. Clicking a card opens
   the light-box overlay (scripts/gallery.js). */

import { icon } from "../scripts/icons.js";

export function renderGallery(d) {
  const card = (g, idx) => `
<div class="transition-transform duration-200 ease-out" style="perspective: 1000px;"><div data-tilt data-tilt-intensity="8" class="relative overflow-hidden h-full" style="transform: rotateX(0deg) rotateY(0deg); transform-style: preserve-3d; transition: transform 0.15s ease-out;"><div role="button" tabindex="0" data-gallery-index="${idx}" class="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#dfb141]/35 bg-[#0d1527] shadow-xl transition-all duration-300 hover:border-[#dfb141] hover:shadow-[0_15px_40px_rgba(223,177,65,0.25)]"><div class="relative h-64 w-full overflow-hidden"><img alt="${g.title}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="${g.image}"><div class="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div><div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span class="flex h-12 w-12 items-center justify-center rounded-full border border-[#dfb141] bg-[#070b14]/80 text-[#ffd768] shadow-lg backdrop-blur-md">${icon("zoom-in", "h-5 w-5")}</span></div></div><div class="absolute bottom-4 left-4 right-4 flex items-center justify-between"><div><span class="font-royal text-[10px] font-bold uppercase tracking-wider text-[#ffd768] block">${g.tag}</span><h3 class="font-serif-display text-sm font-semibold text-[#f8edd1] mt-0.5">${g.title}</h3></div></div></div><div class="pointer-events-none absolute inset-0 transition-opacity duration-300" style="opacity: 0; background: radial-gradient(circle, rgba(255, 235, 175, 0.45) 0%, transparent 60%); mix-blend-mode: overlay;"></div></div></div>
  `;

  const cards = d.gallery.map(card).join("");

  /* light-box shell — hidden until a photo is clicked (scripts/gallery.js) */
  const lightbox = `
    <div id="gallery-lightbox" class="fixed inset-0 z-50 flex items-center justify-center bg-[#04070d]/95 p-4 backdrop-blur-2xl animate-fade-in" hidden>
      <div class="relative max-w-4xl w-full overflow-hidden rounded-3xl border border-[#dfb141]/60 bg-[#0d1527] p-3 shadow-2xl">
        <button type="button" id="gallery-lightbox-close" class="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#070b14]/80 text-[#ffd768] border border-[#dfb141]/40 hover:bg-[#dfb141] hover:text-[#070b14] transition-colors" aria-label="Close image">
          ${icon("x", "h-5 w-5")}
        </button>
        <img id="gallery-lightbox-img" alt="" class="max-h-[75vh] w-full rounded-2xl object-cover">
        <div class="p-4 text-center">
          <span id="gallery-lightbox-tag" class="font-royal text-xs font-bold uppercase tracking-widest text-[#ffd768]"></span>
          <h3 id="gallery-lightbox-title" class="font-serif-display mt-1 text-lg font-bold text-[#f8edd1]"></h3>
        </div>
      </div>
    </div>`;

  return `
<section id="gallery" class="reveal relative bg-[#070b14] px-6 py-32"><div class="mx-auto max-w-6xl text-center"><div class="inline-flex items-center gap-2.5 rounded-full border border-[#dfb141]/40 bg-[#0d1527]/90 px-5 py-2 shadow-lg backdrop-blur-xl">${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}<span class="font-royal text-[11px] font-bold uppercase tracking-[0.35em] text-[#ffd768]">Royal Pichola Moments</span>${icon("sparkles", "h-3.5 w-3.5 text-[#ffd768]")}</div><h2 class="gold-text-glow font-script mt-4 text-6xl sm:text-7xl">Celebration Gallery</h2><p class="font-royal mt-2 text-xl font-bold uppercase tracking-[0.25em] text-[#f8edd1]">Visions of Elegance in Udaipur</p><div class="ornament my-6 text-xl"><span>✦</span></div><div class="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">${cards}
</div></div></section>
    ${lightbox}
  `;
}
