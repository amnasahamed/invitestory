/**
 * wedding-data.js — Customer-facing editable data layer for petal-path-palace
 * Edit this file to update couple names, parents, dates, venue, Gurbani verse, schedule, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    bride: "Harleen",
    groom: "Kabir",
    brideFull: "Harleen Kaur",
    groomFull: "Kabir Singh",
    brideParents: "Daughter of Smt. Gurpreet & Shri Harjit Singh",
    groomParents: "Son of Smt. Manjeet & Shri Ranjit Singh",
    hashtag: "#HarleenWedsKabir",
    monogram: "H · K",
  },

  wedding: {
    dateISO: "2026-11-14T11:00:00+05:30",
    dateLabel: "Saturday, 14th November 2026",
    timeLabel: "Anand Karaj at 11:00 AM",
  },

  verse: {
    blessing: "ੴ ਸਤਿ ਨਾਮੁ",
    text: "Together with their families, request the honour of your presence as two souls walk the petal path into forever.",
  },

  venue: {
    name: "Gurdwara Sahib Palace Gardens",
    address: "Palace Road, Amritsar, Punjab 143001",
    mapsQuery: "Golden Temple Amritsar Punjab",
  },

  events: [
    {
      name: "Wedding",
      date: "Saturday, 14th November 2026",
      dayLabel: "Saturday",
      dayNum: "14",
      monthLabel: "November 2026",
      time: "Anand Karaj at 11:00 AM",
      venue: "Gurdwara Sahib Palace Gardens, Amritsar",
      note: "Baraat, Anand Karaj & the sacred vows — the moment two souls become one.",
    },
  ],

  program: [
    { name: "Baraat Arrival", time: "9:30 AM" },
    { name: "Milni", time: "10:15 AM" },
    { name: "Anand Karaj", time: "11:00 AM" },
    { name: "Guru ka Langar", time: "1:00 PM" },
  ],

  sections: {
    events: true,
    venue: true,
    countdown: true,
  },

  images: {
    couple: "./editable/assets/03-couple.webp",
    archFrame: "./editable/assets/01-arch-frame.webp",
    foregroundGuests: "./editable/assets/02-foreground-guests.webp",
    gardenGuests: "./editable/assets/04-garden-guests.webp",
    skyPalace: "./editable/assets/05-sky-palace.webp",
    introVeil: "./editable/assets/intro-veil.webp",
    sourceFull: "./editable/assets/source-full.webp",
  },
};
