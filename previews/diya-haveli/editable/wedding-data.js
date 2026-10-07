/**
 * wedding-data.js — Customer-facing editable data layer for diya-haveli
 * Edit this file to update couple names, dates, events, love story, venue, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Aarav",
    bride: "Meera",
    monogram: "A & M",
    tagline: "Two souls, one sacred celebration",
  },

  wedding: {
    dateLabel: "14 · 02 · 2027",
    timePlace: "Jaipur · at half past six",
    dateISO: "2027-02-14T18:30:00+05:30",
    quote: "In the presence of sacred fire and eternal love",
  },

  events: [
    {
      name: "Mehendi",
      date: "12 February 2027",
      time: "4:00 PM",
      place: "Courtyard Lawns, Rambagh Haveli",
      note: "Marigolds, henna and folk music at sundown.",
      start: "2027-02-12T16:00:00+05:30",
      end: "2027-02-12T19:00:00+05:30",
      slug: "mehendi",
    },
    {
      name: "Sangeet",
      date: "13 February 2027",
      time: "7:30 PM",
      place: "Sheesh Mahal Ballroom",
      note: "An evening of dance, dhol and shared stories.",
      start: "2027-02-13T19:30:00+05:30",
      end: "2027-02-13T23:00:00+05:30",
      slug: "sangeet",
    },
    {
      name: "Wedding Ceremony",
      date: "14 February 2027",
      time: "6:30 PM",
      place: "Amber Gardens Mandap",
      note: "Saat phere under a canopy of lotus and light.",
      start: "2027-02-14T18:30:00+05:30",
      end: "2027-02-14T20:30:00+05:30",
      slug: "wedding",
    },
    {
      name: "Reception",
      date: "14 February 2027",
      time: "9:00 PM",
      place: "The Grand Durbar Hall",
      note: "Dinner, blessings and celebration till late.",
      start: "2027-02-14T21:00:00+05:30",
      end: "2027-02-15T00:00:00+05:30",
      slug: "reception",
    },
  ],

  story: [
    {
      year: "2019 — Meteorology",
      title: "The First Meeting",
      text: "A monsoon evening in Bengaluru. Two strangers share one umbrella at a tram crossing, and the rain never quite lets up.",
      photo: {
        src: "./editable/assets/story-first-meeting.jpg",
        alt: "Aarav and Meera sharing an umbrella on a rainy Bengaluru evening",
        placement: "right",
      },
    },
    {
      year: "2022 — Geography",
      title: "The First Journey",
      text: "A first journey together through the lanes of Udaipur. A borrowed scooter, a missed turn, a long quiet lunch.",
    },
    {
      year: "2025 — Devotion",
      title: "The Question",
      text: "A question asked beneath a lotus pond at dawn. A pause that answered itself before the words arrived.",
      photo: {
        src: "./editable/assets/story-question.jpg",
        alt: "A proposal beside a lotus pond at first light",
        placement: "below",
      },
    },
    {
      year: "2027 — Union",
      title: "The Beginning",
      text: "Two families. One thread. Seven vows. The slow unrolling of a story that started, as these things do, on a rainy evening.",
      photo: {
        src: "./editable/assets/story-beginning.jpg",
        alt: "The couple taking their first ceremonial steps together",
        placement: "left",
      },
    },
  ],

  venue: {
    name: "Rambagh Haveli",
    address: "Amber Road · Jaipur · 302002",
    description: "A 19th-century palace set among eight acres of gardens, fountains, and courtyards.",
    mapsQuery: "Rambagh+Haveli+Jaipur",
  },

  images: {
    heroCourtyard: "./editable/assets/palace-courtyard.jpg",
    weddingHands: "./editable/assets/wedding-hands.jpg",
    storyFirstMeeting: "./editable/assets/story-first-meeting.jpg",
    storyQuestion: "./editable/assets/story-question.jpg",
    storyBeginning: "./editable/assets/story-beginning.jpg",
    openerVideo: "./editable/assets/openr.mp4",
    lotusVideo: "./editable/assets/lotus.mp4",
  },
};
