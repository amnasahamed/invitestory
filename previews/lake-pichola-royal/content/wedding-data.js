/* ===========================================================================
   wedding-data.js — THE ONLY FILE YOU NEED FOR ~90% OF CUSTOMER EDITS
   ===========================================================================
   Everything a customer normally changes (names, dates, venue, links, story,
   events, gallery, hospitality info, background music) lives here.

   Rules of thumb:
     • Edit the values on the right-hand side only — keep the keys, commas and
       brackets exactly as they are.
     • Text inside "double quotes" is displayed as-is (use \n for a line break).
     • Dates: `date` / `isoDate` use ISO format "YYYY-MM-DDTHH:MM:SS+05:30"
       (Indian Standard Time). Changing them updates the countdown and every
       calendar button automatically.
     • Photos live in assets/images/ — replace a file with the same name, or
       point the `image` value at a new file name.
     • New story milestone / event / gallery item? Copy a whole { ... } block
       and edit it. Remove one and the page simply shows one less card.
   =========================================================================== */

export const weddingData = {
  /* --- Couple -------------------------------------------------------------- */
  bride: "Ananya",
  groom: "Aarav",
  brideFullName: "Ananya Iyer",
  groomFullName: "Aarav Sharma",
  brideFamily: "daughter of Mr. Rajesh & Mrs. Meena Iyer",
  groomFamily: "son of Mr. Vikram & Mrs. Sunita Sharma",
  hashtag: "#AaravWedsAnanya",

  /* --- When ---------------------------------------------------------------- */
  date: "2026-02-21T19:00:00+05:30", // drives the countdown + calendar files
  dateLabel: "Saturday, 21 February 2026",
  timeLabel: "7:00 PM onwards",

  /* --- Where --------------------------------------------------------------- */
  venue: "The Royal Palms, Lake Pichola Road, Udaipur, Rajasthan 313001",
  city: "Udaipur, Rajasthan",
  mapQuery: "Lake Pichola Udaipur Rajasthan", // embedded Google Map search
  mapsUrl: "https://maps.google.com/?q=Lake+Pichola+Udaipur",
  uberUrl:
    "https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=Lake%20Pichola%20Udaipur",
  weather: {
    temp: "24°C / 75°F",
    forecast: "Sunset at 6:38 PM with gentle lake breeze",
  },

  /* --- Background music (dock "Melody" button) ----------------------------- */
  // Original build streamed:
  // https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=indian-flute-and-sitar-112194.mp3
  musicSrc: "assets/audio/indian-flute-and-sitar.mp3",

  /* --- Our story ----------------------------------------------------------- */
  storySummary:
    "Two souls brought together under the gilded skies of Udaipur, ready to embark on a lifelong voyage of love, harmony, and togetherness.",
  storyMilestones: [
    {
      year: "2022",
      title: "The First Spark in Mumbai",
      subtitle: "A chance meeting at Marine Drive",
      description:
        "Amidst the Arabian sea breeze and monsoon drizzles, a shared cup of spiced cutting chai turned into an unforgettable four-hour conversation about art, dreams, and family.",
      icon: "✨",
      image: "assets/images/event_mehendi.jpg",
    },
    {
      year: "2024",
      title: "The Proposal on Lake Pichola",
      subtitle: "A sunset boat ride in Udaipur",
      description:
        "With the silhouettes of Jag Mandir reflecting upon the shimmering amber waters and Shehnai melodies floating from the shore, Aarav went down on one knee with a ring carved in rose gold.",
      icon: "💍",
      image: "assets/images/hero_twilight.jpg",
    },
    {
      year: "2026",
      title: "The Sacred Vows",
      subtitle: "Where their story enters forever",
      description:
        "Returning to the sacred waters of Lake Pichola to tie their destinies with Vedic chants, royal feasts, and the blessings of everyone they hold dear.",
      icon: "🪔",
      image: "assets/images/event_vivah.jpg",
    },
  ],

  /* --- Events (itinerary) ---------------------------------------------------
     `day` groups the filter tabs above the cards ("Day 1", "Day 2"…).
     `colors` renders the little dress-code palette swatches.               */
  events: [
    {
      id: "mehendi",
      day: "Day 1",
      title: "Mehendi & High Tea",
      date: "Friday, 20 February 2026",
      isoDate: "2026-02-20T15:30:00+05:30",
      time: "3:30 PM Onwards",
      venue: "The Lakeside Courtyard, Royal Palms",
      dressCode: "Vibrant Florals & Pastel Heritage",
      icon: "🌿",
      image: "assets/images/event_mehendi.jpg",
      tag: "Celebration of Henna & Folk Beats",
      description:
        "An afternoon of intricate bridal henna, traditional Rajasthani Ghoomar folk performances, artisanal street delicacies, and royal high tea overlooking the calm waters.",
      colors: [
        { name: "Mint Green", hex: "#A8D5BA" },
        { name: "Marigold Yellow", hex: "#F6BE3C" },
        { name: "Peach Blossom", hex: "#FFB7A1" },
        { name: "Ivory Gold", hex: "#F3E8CB" },
      ],
    },
    {
      id: "sangeet",
      day: "Day 1",
      title: "Sangeet Royale",
      date: "Friday, 20 February 2026",
      isoDate: "2026-02-20T19:30:00+05:30",
      time: "7:30 PM Onwards",
      venue: "Grand Pichola Ballroom & Terraces",
      dressCode: "Glamour, Shimmer & Indo-Western",
      icon: "🎶",
      image: "assets/images/event_sangeet.jpg",
      tag: "Music, Dance & Champagne",
      description:
        "A dazzling night of high-energy family dance battles, live Bollywood fusion band, celebratory cocktails, and culinary masterpieces under the starlit sky.",
      colors: [
        { name: "Midnight Navy", hex: "#1B2A4A" },
        { name: "Emerald Gem", hex: "#1B4332" },
        { name: "24K Gold", hex: "#D4AF37" },
        { name: "Wine Velvet", hex: "#631D28" },
      ],
    },
    {
      id: "vivah",
      day: "Day 2",
      title: "Shubh Vivah & Pheras",
      date: "Saturday, 21 February 2026",
      isoDate: "2026-02-21T17:30:00+05:30",
      time: "5:30 PM Baraat • 7:00 PM Varmala & Pheras",
      venue: "The Palatial Mandap Terrace",
      dressCode: "Royal Traditional Heritage",
      icon: "💍",
      image: "assets/images/event_vivah.jpg",
      tag: "Sacred Vows & Sunset Pheras",
      description:
        "Witness the grand royal Baraat procession followed by the sacred seven vows (Saat Phere) around the holy fire as twilight paints Lake Pichola in gold.",
      colors: [
        { name: "Royal Crimson", hex: "#871926" },
        { name: "Imperial Gold", hex: "#B8912F" },
        { name: "Kanjeevaram Ochre", hex: "#D68910" },
        { name: "Pure Raw Silk", hex: "#FAF6EE" },
      ],
    },
    {
      id: "reception",
      day: "Day 3",
      title: "The Grand Reception",
      date: "Sunday, 22 February 2026",
      isoDate: "2026-02-22T19:30:00+05:30",
      time: "7:30 PM Onwards",
      venue: "The Royal Palace Lawns",
      dressCode: "Black Tie / Royal Formal",
      icon: "🥂",
      image: "assets/images/event_reception.jpg",
      tag: "Gala Dinner & Live Symphony",
      description:
        "An enchanting evening of fine multi-course dining, royal toasts, cake cutting ceremony, and live symphony orchestral performances to honor the newlyweds.",
      colors: [
        { name: "Classic Black", hex: "#1C1C1E" },
        { name: "Champagne Gold", hex: "#E6D5B8" },
        { name: "Deep Ruby", hex: "#4A0E17" },
        { name: "Sterling Platinum", hex: "#E5E7EB" },
      ],
    },
  ],

  /* --- Gallery (click opens the light-box) --------------------------------- */
  gallery: [
    { title: "Sunset Mandap at Pichola", image: "assets/images/event_vivah.jpg", tag: "Sacred Vivah" },
    { title: "The Royal Grand Reception", image: "assets/images/event_reception.jpg", tag: "Gala Evening" },
    { title: "Sangeet Under the Stars", image: "assets/images/event_sangeet.jpg", tag: "Sangeet Royale" },
    { title: "Lakeside Mehendi Courtyard", image: "assets/images/event_mehendi.jpg", tag: "Mehendi & High Tea" },
    { title: "Lake Pichola Royal Palace", image: "assets/images/hero_twilight.jpg", tag: "Palatial Heritage" },
    { title: "Aarav & Ananya Portrait", image: "assets/images/royal-couple.jpg", tag: "Royal Couple" },
  ],

  /* --- Opening values of the three on-page counters ------------------------
     The Light-a-Diya button and the dock's Release Lantern button raise these
     by one per click. Change them to start from different numbers.        */
  startDiyas: 88, // "Diyas Floating on Pichola"
  startBlessings: 342, // "Royal Blessings"
  startLanterns: 148, // dock lantern counter

  /* --- Hospitality cards (venue section) ----------------------------------- */
  hospitality: {
    airport: "Maharana Pratap Airport (UDR) — 28 km / 45 min drive",
    concierge: "Wedding Concierge Desk at Hotel Lobby (+91 98765 00000)",
    checkIn: "Hotel Check-in: 12:00 PM | Early check-in available upon prior notice",
  },
};

window.InvitationNames?.applyData(weddingData);
