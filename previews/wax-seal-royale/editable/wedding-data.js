/**
 * wedding-data.js — Customer-facing editable data layer for wax-seal-royale
 * Edit this file to update couple names, dates, invitation note, schedule, venue, and media.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Zohan",
    bride: "Rose",
    subtitle: "Two Souls One destiny A Lifetime written by Allah",
  },

  wedding: {
    dateLabel: "27.09.26",
    dateISO: "2026-09-27T17:00:00-04:00",
    invitationNote: "Dear Friends and Family <br />Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.",
  },

  schedule: [
    { title: "Guest Arrival", time: "5 PM" },
    { title: "Nikkah Ceremony", time: "6 PM" },
    { title: "Mocktail Hour", time: "7 PM" },
    { title: "Dinner", time: "8 PM" },
    { title: "Dance", time: "9 PM" },
  ],

  venue: {
    name: "Islamic Center of Melville",
    address: "118 Old East Neck Road Melville, NY 11747",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Islamic+Center+of+Melville+118+Old+East+Neck+Road+Melville+NY+11747",
  },

  details: {
    giftPreference: "Kindly, no boxed gifts please.",
    dressCode: "We kindly ask guests to avoid deep red and maroon attire for the celebration.",
  },

  media: {
    overlayImage: "./editable/assets/ChatGPT Image Jun 23, 2026, 04_40_29 PM.webp",
    sealVideo: "./editable/assets/1782224012851.mp4",
    heroVideo: "./editable/assets/Swans2.mov",
    audio: "./editable/assets/Einaudi_ Divenire (1) (1).mp3",
  },
};
