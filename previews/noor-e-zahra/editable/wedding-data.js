/**
 * wedding-data.js — Customer-facing editable data layer for noor-e-zahra
 * Edit this file to update couple names, parents, dates, venue, Islamic dua, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    bride: {
      first: "Aaliya",
      last: "Zohra",
      script: "Noorani",
      parents: "Daughter of Mr. & Mrs. Kareem Noorani",
      note: "Daughter of Mr. & Mrs. Kareem Noorani — a heart full of grace and quiet light.",
      photo: "./editable/assets/bride.jpg",
    },
    groom: {
      first: "Ibrahim",
      last: "Yusuf",
      script: "Rahmani",
      parents: "Son of Mr. & Mrs. Salim Rahmani",
      note: "Son of Mr. & Mrs. Salim Rahmani — steady, kind and endlessly devoted.",
      photo: "./editable/assets/groom.jpg",
    },
  },

  wedding: {
    eventName: "Nikkah Ceremony",
    dateISO: "2027-02-19T18:00:00+05:30",
    dateLabel: "February",
    day: "19",
    year: "2027",
    weekday: "Friday",
    time: "6:00 PM onwards",
    blessing: "With the blessings of Allah and our families, we invite you to share in the joy of our Nikkah as two hearts become one.",
  },

  religious: {
    duaArabic: "اللَّهُمَّ بَارِكْ لَهُمَا وَبَارِكْ عَلَيْكُمَا وَاجْمَعْ بَيْنَهُمَا فِي خَيْرٍ",
    duaTranslit: "O Allah, bless them, and send Your blessings upon them, and unite them in goodness.",
  },

  venue: {
    name: "Noor-e-Zahra Grand Masjid",
    line2: "Banjara Hills, Hyderabad",
    address: "Noor-e-Zahra Grand Masjid, Banjara Hills, Hyderabad, Telangana",
    hosts: "Best wishes from Zohra Manzil",
  },

  images: {
    bride: "./editable/assets/bride.jpg",
    groom: "./editable/assets/groom.jpg",
    floralCorner: "./editable/assets/floral-corner.webp",
    goldFlourish: "./editable/assets/gold-flourish.webp",
    masjid: "./editable/assets/masjid.webp",
    mandala: "./editable/assets/mandala.webp",
    paperTexture: "./editable/assets/paper-texture.jpg",
  },
};
