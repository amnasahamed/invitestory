/**
 * wedding-data.js — Customer-facing editable data layer for lakeview-lanterns
 * Edit this file to update couple names, parents, date, venue, events, itinerary, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Aarav",
    bride: "Meera",
    groomFull: "Aarav Menon",
    brideFull: "Meera Nair",
    groomParents: "Son of Smt. Anitha & Shri Suresh Menon",
    brideParents: "Daughter of Smt. Lakshmi & Shri Ravi Nair",
    hashtag: "#AaravWedsMeera",
    monogram: "A · M",
  },

  wedding: {
    dateISO: "2026-11-16T18:00:00+05:30",
    dateLabel: "Sunday, 16th November 2026",
    timeLabel: "At 6:00 PM onwards",
    dayLabel: "Sunday",
    dayNum: "16",
    monthLabel: "November",
    yearLabel: "2026",
  },

  venue: {
    name: "The Lakeview Resort",
    address: "Kumarakom, Kerala",
    mapsQuery: "The Lakeview Resort Kumarakom Kerala",
  },

  verse: {
    hindi: "॥ शुभ विवाह ॥",
    text: "Together with their families, we joyfully invite you to celebrate the wedding of Aarav and Meera beside the glowing backwaters of Kumarakom.",
  },

  events: [
    {
      name: "Wedding",
      date: "Sunday, 16th November 2026",
      dayLabel: "Sunday",
      dayNum: "16",
      monthLabel: "November 2026",
      time: "At 6:00 PM onwards",
      venue: "The Lakeview Resort, Kumarakom",
      note: "Lantern-lit vows by the lake — the moment two souls become one.",
    },
  ],

  program: [
    { name: "Guest Welcome", time: "5:30 PM" },
    { name: "Exchange of Vows", time: "6:00 PM" },
    { name: "Dinner & Celebration", time: "7:30 PM" },
  ],

  sections: {
    events: true,
    venue: true,
    countdown: true,
  },

  images: {
    hero: "./editable/assets/hero-lakeview-teal-v1.webp",
    couple: "./editable/assets/hero-couple-v2.webp",
    openerDiya: "./editable/assets/opener-diya-v1.webp",
  },
};
