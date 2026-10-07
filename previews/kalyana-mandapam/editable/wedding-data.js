/**
 * wedding-data.js — Customer-facing editable data layer for kalyana-mandapam
 * Edit this file to update couple names, Telugu text, families, dates, venue, and images.
 */

window.WEDDING_DATA = {
  couple: {
    bride: "Meghana",
    groom: "Karthik",
    hashtag: "#MeghanaWedsKarthik",
    brideFamily: "The Lakshminarayana Family",
    groomFamily: "The Venkateswarlu Family",
  },

  ceremony: {
    blessing: "॥ శ్రీ మహాగణాధిపతయే నమః ॥",
    occasionTelugu: "శుభ ముహూర్తం",
    weekdayLabel: "Sunday",
    dateLabel: "December 6th, 2026",
    muhurthamTimeLabel: "Muhurtham at 10:35 AM",
    muhurthamISO: "2026-12-06T10:35:00+05:30",
    inviteLine1: "With the divine blessings of Lord Ganesha and our elders,",
    inviteLine2: "we joyfully invite you and our family to the wedding muhurtham of our beloved children. Your presence is the greatest gift — please come, bless the couple, and celebrate with us.",
  },

  events: [
    {
      id: "muhurtham",
      title: "Muhurtham",
      telugu: "ముహూర్తం",
      dateLabel: "Sunday, 6th December 2026",
      timeLabel: "10:35 AM sharp",
      startISO: "2026-12-06T10:35:00+05:30",
      endISO: "2026-12-06T12:30:00+05:30",
      note: "The sacred ceremony — please be seated by 10:00 AM.",
      icon: "fire",
    },
  ],

  venue: {
    name: "Sri Seetha Rama Kalyana Mandapam",
    line1: "Hyderabad",
    line2: "Telangana – 500062, India",
    address: "Malakpet, Hyderabad, Telangana 500062",
    mapsQuery: "Sri Kalyana Mandapam Malakpet Hyderabad",
    osmEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=78.4984%2C17.3633%2C78.5384%2C17.3873&layer=mapnik&marker=17.3753%2C78.5184",
  },

  images: {
    couple: "./editable/assets/couple.webp",
    garlandTop: "./editable/assets/garland-top.webp",
    mandapFooter: "./editable/assets/mandap-footer.webp",
  },
};
