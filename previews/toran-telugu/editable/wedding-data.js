// =============================================================================
// TORAN TELUGU / TAMIL — WEDDING DATA CONFIGURATION
// Edit values below to customize the invitation.
// =============================================================================

window.WEDDING_DATA = {
  brand: "Black Myth Studio",
  couple: {
    bride: "Tarunika",
    groom: "Abbhi",
    coupleLine: ["Abbhi", "Tarunika"],
    hashtag: "#AbbhiWedsTarunika",
    intro: "Together with their families"
  },

  wedding: {
    iso: "2026-11-22T06:30:00+05:30",
    dateLabel: {
      day: "Sunday",
      number: "22",
      monthYear: "November 2026",
      time: "6:30 AM"
    },
    city: "Coimbatore"
  },

  venue: {
    name: "Sri Thirumana Mahal",
    address: "Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004",
    lat: 11.0234,
    lng: 77.0035,
    mapQuery: "Sri Thirumana Mahal, Avinashi Road, Peelamedu, Coimbatore"
  },

  events: [
    {
      id: "muhurtham",
      name: "Muhurtham",
      tamil: "முகூர்த்தம்",
      description: "The knot is tied as the lamps are lit at dawn.",
      start: "2026-11-22T06:30:00+05:30",
      end: "2026-11-22T10:00:00+05:30",
      venue: "Sri Thirumana Mahal",
      address: "Avinashi Road, Peelamedu, Coimbatore",
      dressCode: "Traditional Silks",
      dressColor: "#c9922f"
    }
  ],

  story: [
    {
      year: "2019",
      title: "A queue at Annapoorna",
      text: "Two strangers argued about which filter coffee in Coimbatore is the real one. Neither of them won."
    },
    {
      year: "2021",
      title: "Ooty, in the rain",
      text: "One umbrella, four hours of conversation, and a decision neither of them said out loud."
    },
    {
      year: "2024",
      title: "The temple steps",
      text: "He asked. She had already said yes, three years earlier, somewhere in the rain."
    },
    {
      year: "2026",
      title: "You are invited",
      text: "With the blessings of our families, we begin our life together at dawn."
    }
  ],

  blessing: "Celebration · Tradition · Togetherness",

  families: [
    {
      side: "Son of",
      names: "Mr. Ramanathan & Mrs. Lakshmi"
    },
    {
      side: "Daughter of",
      names: "Mr. Sundaram & Mrs. Meenakshi"
    }
  ],

  contacts: [
    {
      name: "Karthik",
      role: "Groom's side",
      phone: "+919876543210"
    },
    {
      name: "Divya",
      role: "Bride's side",
      phone: "+919876543211"
    }
  ],

  assets: {
    heroFlatlay: "./editable/assets/hero-flatlay.jpg",
    jasmineStrand: "./editable/assets/jasmine-strand.webp",
    gopuram: "./editable/assets/gopuram.webp"
  },

  gallery: [
    {
      src: "./editable/assets/couple-1.jpg",
      alt: "The couple at a temple corridor at golden hour"
    },
    {
      src: "./editable/assets/couple-2.jpg",
      alt: "The couple laughing in the Nilgiris tea hills"
    },
    {
      src: "./editable/assets/couple-3.jpg",
      alt: "Mehendi-covered hands held together"
    },
    {
      src: "./editable/assets/couple-4.jpg",
      alt: "A gopuram at dawn with brass lamps"
    }
  ]
};
