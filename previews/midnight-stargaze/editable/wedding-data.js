/**
 * wedding-data.js — Customer-facing editable data layer for midnight-stargaze
 * Edit this file to update couple names, parents, date, venue, events, itinerary, verse, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Shubham",
    bride: "Sheetal",
    groomFull: "Shubham Kapoor",
    brideFull: "Sheetal Verma",
    groomParents: "Son of Smt. Rekha & Shri Anil Kapoor",
    brideParents: "Daughter of Smt. Anita & Shri Prakash Verma",
    hashtag: "#SheetalWedsShubham",
    monogram: "S · S",
  },

  wedding: {
    dateISO: "2027-02-06T19:00:00+05:30",
    dateLabel: "Saturday, 6th February 2027",
    timeLabel: "Muhurat at 7:00 PM",
  },

  venue: {
    name: "The Royal Orchid Palace",
    address: "Lake Pichola Road, Udaipur, Rajasthan 313001",
    mapsQuery: "City Palace Udaipur Rajasthan",
  },

  verse: {
    hindi: "॥ श्री गणेशाय नमः ॥",
    text: "Together with their families, request the honour of your presence as two souls become one under a sky full of stars.",
  },

  events: [
    {
      name: "Wedding",
      icon: "heart",
      date: "Saturday, 6th February 2027",
      dayLabel: "Saturday",
      dayNum: "06",
      monthLabel: "February 2027",
      time: "Muhurat at 7:00 PM",
      venue: "The Royal Orchid Palace, Udaipur",
      note: "Baraat, pheras & the sacred vows — the moment two souls become one.",
    },
  ],

  program: [
    { name: "Baraat Arrival", time: "6:00 PM" },
    { name: "Jaimala", time: "6:45 PM" },
    { name: "Pheras & Sacred Vows", time: "7:00 PM" },
    { name: "Vidaai", time: "10:30 PM" },
  ],

  sections: {
    events: true,
    venue: true,
    countdown: true,
  },

  images: {
    couple: "./editable/assets/couple.webp",
    venue: "./editable/assets/venue-palace.webp",
    ganesha: "./editable/assets/ganesha.webp",
  },
};
