/**
 * wedding-data.js — Customer-facing editable data layer for rajmahal-palace
 * Edit this file to update couple names, parents, dates, venue, Sanskrit shloka, events, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    bride: "Ananya",
    groom: "Arjun",
    brideFull: "Ananya Sharma",
    groomFull: "Arjun Mehta",
    brideParents: "Daughter of Smt. Kavita & Shri Rajesh Sharma",
    groomParents: "Son of Smt. Meera & Shri Vikram Mehta",
    hashtag: "#AnanyaWedsArjun",
  },

  wedding: {
    dateISO: "2026-12-06T16:30:00+05:30",
    dateLabel: "Sunday, 6th December 2026",
    timeLabel: "Muhurat at 4:30 PM",
  },

  verse: {
    hindi: "॥ श्री गणेशाय नमः ॥",
    text: "Together with their families, request the honour of your presence as two souls become one.",
  },

  venue: {
    name: "The Royal Orchid Palace",
    address: "Lake Pichola Road, Udaipur, Rajasthan 313001",
    mapsQuery: "City Palace Udaipur Rajasthan",
  },

  events: [
    {
      name: "Wedding",
      icon: "heart",
      date: "Sunday, 6th December 2026",
      time: "Muhurat at 4:30 PM",
      venue: "The Royal Orchid Palace, Udaipur",
      note: "Baraat, pheras & the sacred vows — the moment two souls become one.",
    },
  ],

  images: {
    couple: "./editable/assets/couple.webp",
    heroBg: "./editable/assets/hero-bg.webp",
    ganesha: "./editable/assets/ganesha.webp",
    diya: "./editable/assets/diya.webp",
    mandala: "./editable/assets/mandala.webp",
    footerGarland: "./editable/assets/footer-garland.webp",
  },
};
