/**
 * wedding-data.js — Customer-facing editable data layer for saga-of-love
 * Edit this file to update couple names, dates, events, itinerary, venue, blessing, and contacts.
 */

window.WEDDING_DATA = {
  couple: {
    bride: "Chi. Sou. Manasa P.M",
    brideShort: "Manasa",
    groom: "Chi. Ra. Suman G",
    groomShort: "Suman",
    hashtag: "#SumanWedsManasa",
  },

  invite: {
    kicker: "Together with their families",
    line: "cordially invite you to their wedding",
  },

  event: {
    title: "Muhurtha",
    startsAt: "2027-08-21T09:30:00+05:30",
    endsAt: "2027-08-21T11:30:00+05:30",
    dateLabel: "21 . 08 . 2027",
    dayLabel: "Friday",
    timeLabel: "09.30 AM to 10.30 AM",
    note: "Reception to follow",
  },

  venue: {
    name: "Sudha Veerendra Patil Samudhaya Bhavana",
    address: "Shiramagondanahalli, Hadadi Road, Davanagere",
    mapsQuery: "Sudha Veerendra Patil Samudhaya Bhavana, Davanagere",
    lat: 26.9124,
    lng: 75.7873,
  },

  story: [
    {
      year: "17 August",
      title: "SANGEETH",
      text: "06.30 PM Onwards, Apoorva Resort",
      image: "story-2",
    },
    {
      year: "19 August",
      title: "DEVARAKARYA & HALDI",
      text: "09.00 AM Onwards, Home",
      image: "story-3",
    },
    {
      year: "20 August",
      title: "RECEPTION",
      text: "07.00 PM Onwards, Sudha Veerendra Patil Samudhaya Bhavana, Davanagere",
      image: "story-1",
    },
  ],

  blessing: {
    line: "May your intentions be one, may your hearts beat as one.",
    translation: "Two families, one thread of gold — and a lifetime of ordinary days made luminous together.",
    source: "A blessing from both families",
  },

  footer: {
    families: `With Love,\n\nSmt. Bharathi G.D., Sri Guruswamy G.D. & Family &\n\nSmt. Pankaja A.R., Sri Manjunath P.H. & Family`,
    contacts: [
      { name: "Suman", phone: "+91 98765 43210" },
      { name: "Manasa", phone: "+91 98765 43211" },
    ],
  },

  images: {
    heroArch: "./editable/assets/hero-arch.webp",
    gatePanel: "./editable/assets/gate-panel.webp",
    mapPreview: "./editable/assets/map-preview.webp",
    footerFloral: "./editable/assets/footer-floral.webp",
    story1: "./editable/assets/story-1.webp",
    story2: "./editable/assets/story-2.webp",
    story3: "./editable/assets/story-3.webp",
  },
};
