/**
 * wedding-data.js — Customer-facing editable data layer for emerald-nikah
 * Edit this file to update couple names, families, dates, venue, itinerary, verses, and photos.
 */

window.WEDDING_DATA = {
  couple: {
    groom: {
      name: "Zayan Abdul Rahman",
      firstName: "Zayan",
      lastName: "Abdul Rahman",
      parents: "Son of Janab Abdul Rahman & Muhtarma Zubaida",
      role: "The Groom",
      note: "An architect with a gentle soul, thoughtful heart, and deep devotion to family and faith.",
      photo: "./editable/assets/groom.jpg",
    },
    bride: {
      name: "Inaya Fathima",
      firstName: "Inaya",
      lastName: "Fathima",
      parents: "Daughter of Janab Kareem & Muhtarma Safiya",
      role: "The Bride",
      note: "Radiant with grace and warmth, a doctor whose kindness and infectious joy brighten every room.",
      photo: "./editable/assets/bride.jpg",
    },
  },

  wedding: {
    dateISO: "2026-12-12T18:30:00+05:30",
    dateBadge: "Saturday · 12 December 2026",
    dateFormatted: "Saturday, 12 December 2026",
    timeFormatted: "06:30 PM onwards",
    eventTitle: "Nikah Ceremony & Walima Banquet",
    inviteLine: "Cordially invite you to celebrate their",
    hostLine: "Together with their families",
    countdownEyebrow: "Counting Every Sacred Moment",
    countdownTitle: "Until We Say Qubool",
  },

  religious: {
    bismillah: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    duaArabic: "بَارَكَ اللهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    duaTranslation: "“May Allah bless you both, shower His blessings upon you, and unite you together in goodness.”",
    verseArabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    verseTranslation: "“And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.”",
    verseRef: "Surah Ar-Rum · 30:21",
  },

  venue: {
    name: "Falaknuma Gardens",
    badge: "Falaknuma Gardens · Hyderabad",
    address: "Engine Bowli, Falaknuma, Hyderabad, Telangana 500053",
    fullAddress: "Falaknuma Gardens, Engine Bowli, Hyderabad, Telangana 500053",
    notes: "Convenient valet parking available on-site. Approx. 25 min from Rajiv Gandhi Airport.",
    mapImage: "./editable/assets/map.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Falaknuma+Gardens%2C+Engine+Bowli%2C+Hyderabad%2C+Telangana+500053",
  },

  itinerary: [
    {
      time: "06:30 PM",
      title: "Baraat & Grand Welcome",
      subtitle: "Istiqbal",
      description: "Arrival of the groom's procession with traditional dhol beats, rose water shower, and welcome drinks.",
    },
    {
      time: "07:15 PM",
      title: "The Nikah Ceremony",
      subtitle: "Ijab-e-Qubool",
      description: "Solemnisation of marriage according to Sunnah, recitation of Quranic verses, and acceptance of vows.",
    },
    {
      time: "08:30 PM",
      title: "Royal Dastarkhwan (Feast)",
      subtitle: "Walima Dinner",
      description: "Authentic Hyderabadi celebratory banquet featuring Dum Biryani, Mirchi Ka Salan, Double Ka Meetha & Sheer Khurma.",
    },
    {
      time: "10:30 PM",
      title: "Rukhsati & Blessings",
      subtitle: "Duas & Farewell",
      description: "The emotional send-off, surrounded by the prayers and blessings of both families under the holy Quran.",
    },
  ],

  closing: {
    blessing: "“May He unite your hearts in goodness, strengthen you with patience, and grant you harmony, prosperity, and everlasting happiness.”",
    coupleNames: "Zayan & Inaya",
    duasLine: "We await your precious duas & presence",
    footerCredit: "with prayers for our families",
    instagram: "@invitestory.in",
    instagramUrl: "https://www.instagram.com/invitestory.in/",
  },

  images: {
    heroBackground: "./editable/assets/hero-bg.jpg",
    groom: "./editable/assets/groom.jpg",
    bride: "./editable/assets/bride.jpg",
    map: "./editable/assets/map.jpg",
    mandala: "./editable/assets/mandala.webp",
    roses: "./editable/assets/roses.webp",
    daisies: "./editable/assets/daisies.webp",
    divider: "./editable/assets/divider.webp",
  },
};
