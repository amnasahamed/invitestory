/* navbar.js — scroll progress line, header and mobile menu
   Thin gold progress bar, fixed header (brand, links, hamburger) and the
   slide-down mobile menu (hidden until the hamburger is pressed — behaviour
   in scripts/navbar.js). NAV_LINKS controls the menu entries. */

import { icon } from "../scripts/icons.js";

export function renderNavbar(d) {
  const NAV_LINKS = [
    { label: "Our Story", href: "#story" },
    { label: "Ceremonies", href: "#itinerary" },
    { label: "Moments", href: "#gallery" },
    { label: "Palatial Venue", href: "#details" },
  ];
  const LINK_CLASS = "font-royal text-xs font-semibold uppercase tracking-[0.2em] text-[#e6d3a3] transition-colors hover:text-[#ffd768]";
  const MOBILE_LINK_CLASS = "font-royal text-xs font-bold uppercase tracking-[0.25em] text-[#e6d3a3] py-2 border-b border-[#dfb141]/15";

  const desktopNav = NAV_LINKS.map(
    (l) => `<a href="${l.href}" class="${LINK_CLASS}">${l.label}</a>`
  ).join("");
  const mobileNav = NAV_LINKS.map(
    (l) => `<a href="${l.href}" class="${MOBILE_LINK_CLASS}">${l.label}</a>`
  ).join("");

  return `
  <div class="fixed top-0 left-0 right-0 z-50 h-0.5 bg-[#dfb141]/20"><div id="scroll-progress" class="h-full bg-gradient-to-r from-[#b88a28] via-[#ffd768] to-[#dfb141] shadow-[0_0_8px_#dfb141] transition-all duration-150" style="width: 0%;"></div></div>
  <header id="site-header" class="fixed top-0.5 left-0 right-0 z-40 transition-all duration-500 bg-transparent py-5"><div class="mx-auto flex max-w-5xl items-center justify-between px-6"><a href="#" class="flex items-center gap-3 transition-transform hover:scale-105"><div class="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfb141]/70 bg-gradient-to-br from-[#121c33] to-[#070b14] shadow-[0_0_15px_rgba(223,177,65,0.3)]"><span class="font-script text-xl text-[#ffd768]">${d.groom.charAt(0)}&amp;${d.bride.charAt(0)}</span></div><div><span class="font-royal text-xs font-bold uppercase tracking-[0.25em] text-[#f8edd1] block">Lake Pichola</span><span class="font-royal text-[9px] uppercase tracking-[0.3em] text-[#dfb141] block">Royal Vivah 2026</span></div></a><nav class="hidden md:flex items-center gap-8">${desktopNav}</nav><div class="flex md:hidden items-center"><button id="nav-toggle" class="rounded-full border border-[#dfb141]/50 bg-[#0d1527]/90 p-2 text-[#ffd768] shadow-md backdrop-blur-md" aria-label="Toggle navigation menu">${icon("menu", "h-4 w-4")}</button></div></div></header>
  <div id="mobile-menu" class="md:hidden border-b border-[#dfb141]/30 bg-[#070b14]/98 px-6 py-6 shadow-2xl backdrop-blur-2xl animate-fade-in" hidden>
    <nav class="flex flex-col gap-4 text-center">${mobileNav}</nav>
  </div>
  `;
}
