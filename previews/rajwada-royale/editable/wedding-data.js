/**
 * wedding-data.js — Customer-facing editable data layer for rajwada-royale
 * Edit this file to update couple names, parents, dates, love story, events, venue, gallery, contacts, and media.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Rizwan",
    bride: "Ayesha",
    monogram: "R & A",
    hashtag: "#RizwanFoundHisAyesha",
  },

  mainEvent: {
    title: "Rizwan & Ayesha — Wedding Ceremony",
    startsAt: "2026-12-19T11:30:00+05:30",
    durationMinutes: 180,
    dateLabel: "Sunday, 19 December 2026",
    timeLabel: "11:30 AM onwards",
  },

  families: {
    groomSide: {
      parents: "Mr. Yousuf Ali & Mrs. Razia Yousuf",
      line: "request the pleasure of your esteemed presence at the wedding of their son",
    },
    brideSide: {
      parents: "Mr. Imran Zafar & Mrs. Nasreen Zafar",
      line: "together with the family of their daughter",
    },
  },

  invitationNote: "With the blessings of the Almighty and our elders, we invite you to share in the joy of our wedding. Your presence is the greatest gift we could ask for.",

  story: [
    {
      year: "2021",
      title: "The first chai",
      text: "A mutual friend's birthday, a crowded café in Bandra, and one conversation that refused to end.",
      image: "./editable/assets/story-1.jpg",
    },
    {
      year: "2024",
      title: "Roka",
      text: "Two families, one courtyard full of marigolds, and enough laddoos to feed the entire street.",
      image: "./editable/assets/story-2.jpg",
    },
    {
      year: "2025",
      title: "The yes",
      text: "A ring, mehndi-covered hands, and a promise made in front of everyone who matters.",
      image: "./editable/assets/story-3.jpg",
    },
  ],

  events: [
    {
      key: "wedding",
      name: "Wedding",
      startsAt: "2026-12-19T11:30:00+05:30",
      durationMinutes: 180,
      venue: "Park Aventel",
      address: "Kalyan Nagar, Hyderabad",
      dressCode: "Traditional formals",
      dressCodeColor: "#C9A84C",
      note: "The main muhurat. Please be seated by 11:15 AM.",
    },
  ],

  venue: {
    name: "Park Aventel",
    address: "Kalyan Nagar, Road No. 12, Hyderabad, Telangana 500034",
    lat: 17.4126,
    lng: 78.4392,
    directionsNote: "Ample parking behind the banquet block. Valet available from 10:30 AM.",
  },

  gallery: [
    { src: "./editable/assets/gallery-1.jpg", alt: "Mehndi night with henna and marigolds" },
    { src: "./editable/assets/gallery-2.jpg", alt: "Sangeet dance floor with dhol and lights" },
    { src: "./editable/assets/gallery-3.jpg", alt: "Decorated wedding mandap at golden hour" },
    { src: "./editable/assets/gallery-4.jpg", alt: "Baraat procession with dhol players" },
  ],

  closing: {
    blessing: "Two families, one prayer, and a lifetime that begins with you in the room.",
    signOff: "With love and gratitude,",
  },

  contacts: [
    { name: "Faizan (Groom's brother)", phone: "+919876543210" },
    { name: "Sana (Bride's sister)", phone: "+919812345678" },
  ],

  media: {
    doorPanel: "./editable/assets/door-panel.webp",
    couple: "./editable/assets/couple.webp",
    floralCorner: "./editable/assets/floral-corner.webp",
    garland: "./editable/assets/garland.webp",
    lantern: "./editable/assets/lantern.webp",
    footerFloral: "./editable/assets/footer-floral.jpg",
    ambientAudio: "./editable/assets/ambient-shehnai.mp3",
  },
};
