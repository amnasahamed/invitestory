/**
 * wedding-data.js — Customer-facing editable data layer for ivory-waltz
 * Edit this file to update couple names, parents, dates, venue, Islamic verse, schedule, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    bride: "Ayesha",
    groom: "Ibrahim",
    brideFull: "Ayesha Rahman",
    groomFull: "Ibrahim Hassan",
    brideParents: "Daughter of Mrs. Farida & Mr. Khalid Rahman",
    groomParents: "Son of Mrs. Samira & Mr. Yusuf Hassan",
    hashtag: "#AyeshaWedsIbrahim",
    monogram: "A · I",
  },

  wedding: {
    dateISO: "2027-03-14T16:00:00+05:30",
    dateLabel: "Sunday, 14th March 2027",
    timeLabel: "Nikah at 4:00 PM",
  },

  venue: {
    name: "The Ivory Courtyard",
    address: "12 Jasmine Lane, Bandra West, Mumbai 400050",
    mapsQuery: "Bandra West Mumbai",
  },

  verse: {
    arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    text: "With soft hearts and grateful families, we invite you to witness our nikah — a quiet beginning, danced into forever.",
  },

  events: [
    {
      name: "Wedding",
      icon: "heart",
      date: "Sunday, 14th March 2027",
      dayLabel: "Sunday",
      dayNum: "14",
      monthLabel: "March 2027",
      time: "Nikah at 4:00 PM",
      venue: "The Ivory Courtyard, Mumbai",
      note: "A gentle ceremony of vows, prayer, and celebration — one sacred day.",
    },
  ],

  program: [
    { name: "Guest Arrival", time: "3:15 PM" },
    { name: "Nikah Ceremony", time: "4:00 PM" },
    { name: "Dua & Blessings", time: "4:45 PM" },
    { name: "Dinner & Celebration", time: "6:00 PM" },
  ],

  sections: {
    events: true,
    venue: true,
    countdown: true,
  },

  images: {
    couple: "./editable/assets/layer-couple.webp",
    background: "./editable/assets/layer-01-background.webp",
    shadows: "./editable/assets/layer-02-shadows.webp",
    groom: "./editable/assets/layer-03-groom.webp",
    bride: "./editable/assets/layer-04-bride.webp",
    bouquet: "./editable/assets/layer-05-bouquet.webp",
    heroComposite: "./editable/assets/hero-composite.jpg",
  },
};
