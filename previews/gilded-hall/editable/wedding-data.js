/**
 * wedding-data.js — Customer-facing editable data layer for gilded-hall
 * Edit this file to update couple names, wedding date, story, itinerary events, venue, and media.
 */

window.WEDDING_DATA = {
  bride: "Ananya",
  groom: "Aarav",
  invitationLine: "Together with their families, request the honour of your presence",
  dateLabel: "Saturday, 12 December 2026",
  shortDate: "12 . 12 . 2026",
  countdownTarget: "2026-12-12T18:30:00+05:30",

  story: [
    "Two families, two cities, one quiet evening in December when a shared cup of filter coffee turned into a conversation that never really ended.",
    "Three winters later, under the same golden light, we begin our forever — and we would be incomplete without you beside us.",
  ],

  events: [
    {
      name: "Haldi",
      date: "9 December 2026",
      time: "10:00 AM",
      venue: "Sharma Residence, Jubilee Hills",
      note: "Turmeric, marigold and morning laughter.",
    },
    {
      name: "Mehendi",
      date: "10 December 2026",
      time: "4:00 PM",
      venue: "The Courtyard, Taj Krishna",
      note: "Henna, live dholak and endless chai.",
    },
    {
      name: "Sangeet",
      date: "11 December 2026",
      time: "7:00 PM",
      venue: "Grand Ballroom, Taj Krishna",
      note: "An evening of music, dance and mischief.",
    },
    {
      name: "Wedding",
      date: "12 December 2026",
      time: "6:30 PM",
      venue: "Golden Hall, Falaknuma Palace Grounds",
      note: "The muhurtham, beneath a canopy of light.",
    },
    {
      name: "Reception",
      date: "12 December 2026",
      time: "9:00 PM",
      venue: "Golden Hall, Falaknuma Palace Grounds",
      note: "Dinner, blessings and the first dance.",
    },
  ],

  venue: {
    name: "Golden Hall, Falaknuma Palace Grounds",
    address: "Engine Bowli, Falaknuma, Hyderabad, Telangana 500053",
    hint: "12 km from Rajiv Gandhi International Airport",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Falaknuma+Palace+Hyderabad",
    mapEmbed: "https://www.google.com/maps?q=Falaknuma+Palace+Hyderabad&output=embed",
  },

  closing: "With love and gratitude, we await you.",

  media: {
    petals: "./editable/assets/petals.webp",
    hall: "./editable/assets/hall.webp",
    cover: "./editable/assets/cover.webp",
    introVideo: "./editable/assets/intro.mp4",
    coupleVideo: "./editable/assets/couple.mp4",
    divider: "./editable/assets/divider.webp",
    floral: "./editable/assets/floral.webp",
  },
};
