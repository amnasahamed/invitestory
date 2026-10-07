/**
 * wedding-data.js — Customer-facing editable data layer for seashell-vows
 * Edit this file to update couple names, tagline, dates, events, venue, and images.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Aarav",
    bride: "Ananya",
    tagline: "Two souls, one shore",
  },

  wedding: {
    dateLabel: "Saturday, 14 February 2026",
    weddingISO: "2026-02-14T18:30:00+05:30",
  },

  venue: {
    name: "Sea Pearl Resort",
    address: "Beach Road, Cavelossim, South Goa 403731",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cavelossim+Beach+Goa",
  },

  events: [
    {
      name: "Haldi",
      glyph: "❋",
      date: "12 Feb 2026",
      time: "10:00 AM",
      venue: "Garden Lawn, Sea Pearl Resort",
      note: "Wear yellow. Expect turmeric everywhere.",
    },
    {
      name: "Mehendi",
      glyph: "❁",
      date: "12 Feb 2026",
      time: "4:00 PM",
      venue: "Palm Courtyard, Sea Pearl Resort",
      note: "Henna, chai and dholak by the sea.",
    },
    {
      name: "Sangeet",
      glyph: "✧",
      date: "13 Feb 2026",
      time: "7:30 PM",
      venue: "Coral Ballroom, Sea Pearl Resort",
      note: "Dancing floor opens after dinner.",
    },
    {
      name: "Wedding",
      glyph: "☀",
      date: "14 Feb 2026",
      time: "6:30 PM",
      venue: "Sunset Beach Mandap",
      note: "Barefoot on the sand as the sun sets.",
    },
    {
      name: "Reception",
      glyph: "❖",
      date: "15 Feb 2026",
      time: "8:00 PM",
      venue: "Ocean Terrace, Sea Pearl Resort",
      note: "Cocktails, supper and long goodbyes.",
    },
  ],

  eventDates: {
    Haldi: "2026-02-12T10:00:00+05:30",
    Mehendi: "2026-02-12T16:00:00+05:30",
    Sangeet: "2026-02-13T19:30:00+05:30",
    Wedding: "2026-02-14T18:30:00+05:30",
    Reception: "2026-02-15T20:00:00+05:30",
  },

  images: {
    couple: "./editable/assets/couple-walking.webp",
    hero: "./editable/assets/hero-arch.jpg",
    ringsVignette: "./editable/assets/rings-seashell-vignette.webp",
    venueMap: "./editable/assets/venue-map-Wf_iSDI1.jpg",
    footerWash: "./editable/assets/footer-wash-DG1rtX_C.jpg",
    openerVideo: "./editable/assets/wedding-opener.mp4",
  },
};
