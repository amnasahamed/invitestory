/**
 * wedding-data.js — Customer-facing editable data layer for ghibli-selfie
 * Edit this file to update couple names, wedding dates, itinerary, venue, calendar info, and images.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Amaan",
    bride: "Fatima",
    title: "Amaan ♡ Fatima",
  },

  wedding: {
    dateLabel: "12 · DECEMBER · 2026",
    dateTimeLine: "Saturday, 12 December 2026 · 3:00 pm",
    footerLine: "Amaan & Fatima · 12 · 12 · 2026",
  },

  calendar: {
    title: "Amaan & Fatima — Wedding",
    start: "20261212T100000Z",
    end: "20261212T120000Z",
    location: "Noor Bagh, Masjid-e-Noor & Garden Lawns, Banjara Hills, Hyderabad",
    details: "Nikah at 3:30 pm IST. Baraat, duas and the tying of the knot. We can't wait to see you there.",
    icsFilename: "amaan-and-fatima-12-dec-2026.ics",
  },

  venue: {
    name: "Jama Masjid Wedding Hall / Noor Bagh",
    address: "Banjara Hills, Hyderabad",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jama+Masjid+Wedding+Hall+Hyderabad",
  },

  schedule: [
    { label: "Nikah", time: "3:30 pm" },
    { label: "Two become one", time: "till late" },
  ],

  messages: {
    speechBubble: "Hey! You're invited ❤️",
    bouquetClick: "Can't wait to celebrate with you.",
    secretNote: "You found our little secret.\nSome people you just want in every photo —\nyou're one of them.",
    secretSignoff: "— Amaan & Fatima",
    thankYou: "Thank you for being part of our story.",
  },

  images: {
    couple: "./editable/assets/couple.webp",
    mosque: "./editable/assets/mosque.webp",
    bouquet: "./editable/assets/bouquet.webp",
    gramophone: "./editable/assets/gramophone.webp",
    cloud: "./editable/assets/cloud-a.webp",
    petal: "./editable/assets/petal.webp",
    butterfly: "./editable/assets/butterfly.webp",
  },
};
