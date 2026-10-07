/**
 * wedding-data.js — Customer-facing editable data layer for moonlit-lotus-barge
 * Edit this file to update couple names, intro, date, venue, events, itinerary, verse, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Dev",
    bride: "Ishani",
    groomFull: "Dev Malhotra",
    brideFull: "Ishani Rao",
    groomParents: "Son of Nandini and Vikram Malhotra",
    brideParents: "Daughter of Kavita and Raghav Rao",
    familySignoff: "The Rao and Malhotra families",
    hashtag: "#DevFoundIshani",
    monogram: "D I",
  },

  intro: {
    eyebrow: "A moonlit invitation",
    title: "An invitation carried by moonlight",
    body: "Follow the lotus barge to a celebration written in the stars.",
    beginLabel: "Begin the Journey",
    enterLabel: "Enter the Celebration",
    tapHint: "Tap the glowing arch",
    playingLabel: "The journey begins",
    videoEnabled: false,
    videoTimeoutMs: 12000,
  },

  wedding: {
    dateISO: "2026-12-12T17:30:00+05:30",
    dateLabel: "Saturday, 12 December 2026",
    timeLabel: "From 5:30 PM",
    dayLabel: "Saturday",
    dayNum: "12",
    monthLabel: "December",
    yearLabel: "2026",
  },

  venue: {
    name: "The Leela Palace",
    address: "Lake Pichola, Udaipur, Rajasthan",
    mapsQuery: "The Leela Palace Udaipur Rajasthan",
    landmark: "Beside Lake Pichola",
    directionHint: "Tap to open turn-by-turn directions",
  },

  verse: {
    hindi: "॥ शुभ विवाह ॥",
    text: "With hearts full of joy, our families invite you to witness Ishani and Dev begin their forever beside Lake Pichola.",
  },

  events: [
    {
      name: "Wedding",
      date: "Saturday, 12 December 2026",
      dayLabel: "Saturday",
      dayNum: "12",
      monthLabel: "December 2026",
      time: "From 5:30 PM",
      venue: "The Leela Palace, Udaipur",
      note: "Moonlit vows, floating diyas, and one unforgettable evening by the lake.",
    },
  ],

  program: [
    { name: "Baraat Arrival", time: "5:30 PM" },
    { name: "Jaimala", time: "6:30 PM" },
    { name: "Pheras", time: "7:15 PM" },
    { name: "Dinner", time: "8:30 PM" },
  ],

  footer: {
    title: "Meet us under the moon",
  },

  sections: {
    events: true,
    venue: true,
    countdown: true,
  },

  images: {
    couple: "./editable/assets/couple.webp",
    barge: "./editable/assets/barge.webp",
    introPoster: "./editable/assets/intro-poster.webp",
    introEnd: "./editable/assets/intro-end.webp",
    sky: "./editable/assets/sky.webp",
    environment: "./editable/assets/water-palace.webp",
    social: "./editable/assets/social-card.webp",
  },
};
