/**
 * wedding-data.js — Customer-facing editable data layer for kerala-sands
 * Edit this file to update couple names, bios, wedding dates, times, venue details, and images.
 */

window.WEDDING_DATA = {
  couple: {
    groom: {
      name: "Aarav",
      fullName: "Aarav Menon",
      line: "Son of Mr. Ramesh & Mrs. Latha Menon",
      note: "An architect who sketches temples on café napkins and believes every good story starts with chai.",
      photo: "./editable/assets/groom.webp",
    },
    bride: {
      name: "Diya",
      fullName: "Diya Nair",
      line: "Daughter of Mr. Suresh & Mrs. Anjali Nair",
      note: "A Bharatanatyam dancer and pediatrician who hums old Malayalam songs while she works.",
      photo: "./editable/assets/bride.webp",
    },
  },

  wedding: {
    dateISO: "2026-12-10T18:30:00+05:30",
    endISO: "2026-12-10T22:00:00+05:30",
    dateLabel: "Thursday, 10 December 2026",
    dateShort: "10 · 12 · 2026",
    timeLabel: "6:30 PM onwards",
    muhurthamLabel: "Muhurtham · 7:15 PM",
    footerDateLocation: "10 · 12 · 2026 · Kochi",
  },

  venue: {
    name: "Taj Malabar Resort & Spa",
    address: "Willingdon Island, Kochi, Kerala 682009",
    locationShort: "Kochi, Kerala",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Taj+Malabar+Resort+%26+Spa+Willingdon+Island+Kochi",
  },

  images: {
    coupleHero: "./editable/assets/couple-hero.webp",
    mapPreview: "./editable/assets/map-preview.jpg",
  },
};
