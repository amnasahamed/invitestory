/**
 * wedding-data.js — Customer-facing editable data layer for ganesha-gopuram
 * Edit this file to update couple names, parents, dates, venue, RSVP, schedule, and assets.
 */

window.WEDDING_DATA = {
  couple: {
    bride: "Priya",
    groom: "Arjun",
    brideFull: "Priya Naidu",
    groomFull: "Arjun Reddy",
    brideParents: "Daughter of Smt. Lakshmi & Shri Venkat Naidu",
    groomParents: "Son of Smt. Radha & Shri Suresh Reddy",
    familyName: "Naidu",
    hashtag: "#ArjunWedsPriya",
    monogram: "A · P",
  },

  wedding: {
    dateISO: "2026-11-14T10:30:00+05:30",
    dateLabel: "Saturday, 14th November 2026",
    timeLabel: "At 10:30 AM onwards",
    dayLabel: "Saturday",
    dayNum: "14",
    monthLabel: "November",
    yearLabel: "2026",
  },

  verse: {
    hindi: "॥ शुभ विवाह ॥",
    tamil: "சுப திருமணம்",
    text: "With the blessings of Lord Ganesha and our families, we joyfully invite you to celebrate the wedding of Arjun and Priya.",
  },

  cover: {
    kicker: "Welcome to",
    title: "Our Wedding",
    headline: "A Beautiful Beginning Awaits",
    gratitude: "Thank you for being a part of our special day.",
    cta: "Tap to Begin",
  },

  intro: {
    videoSrc: "./editable/assets/video/intro.mp4",
    posterSrc: "./editable/assets/video/poster.png",
    focusHint: "Tap to enter",
    skipLabel: "Skip",
    musicEnabled: false,
  },

  venue: {
    name: "Sri Venkateswara Kalyana Mandapam",
    address: "Mylapore, Chennai",
    mapsQuery: "Sri Venkateswara Kalyana Mandapam Mylapore Chennai",
  },

  rsvp: {
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    email: "arjun.priya.wedding@example.com",
    note: "Kindly confirm your presence by 1st November.",
  },

  events: [
    {
      name: "Wedding",
      date: "Saturday, 14th November 2026",
      dayLabel: "Saturday",
      dayNum: "14",
      monthLabel: "November 2026",
      time: "At 10:30 AM onwards",
      venue: "Sri Venkateswara Kalyana Mandapam, Mylapore",
      note: "Muhurtham under sacred blessings — the moment two souls become one.",
    },
    {
      name: "Reception",
      date: "Saturday, 14th November 2026",
      dayLabel: "Saturday",
      dayNum: "14",
      monthLabel: "November 2026",
      time: "At 6:30 PM onwards",
      venue: "Sri Venkateswara Kalyana Mandapam, Mylapore",
      note: "An evening of music, dinner, and celebration with family & friends.",
    },
  ],

  program: [
    { name: "Guest Welcome", time: "9:45 AM" },
    { name: "Muhurtham", time: "10:30 AM" },
    { name: "Lunch", time: "12:30 PM" },
    { name: "Reception", time: "6:30 PM" },
  ],

  sections: {
    events: true,
    venue: true,
    countdown: true,
    rsvp: true,
    familyCard: true,
  },
};
