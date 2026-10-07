/**
 * wedding-data.js — Customer-facing editable data layer for ghibli-portrait
 * Edit this file to update couple names, wedding date, story chapters, venue, family, and images.
 */

window.WEDDING_DATA = {
  couple: {
    bride: "Amelia Rose Bennett",
    groom: "James Alexander Cole",
    brideShort: "Amelia",
    groomShort: "James",
  },

  // Drives countdown timer, calendar export, and date displays
  weddingDate: "2026-12-12T16:00:00+05:30",
  displayDate: "Saturday, December 12th, 2026",
  tagline: `Together since childhood.\nForever begins now.`,

  hero: {
    childhoodBride: "./editable/assets/childhood-bride.webp",
    childhoodGroom: "./editable/assets/childhood-groom.webp",
    portraitBride: "./editable/assets/portrait-bride.webp",
    portraitGroom: "./editable/assets/portrait-groom.webp",
    bodyBride: "./editable/assets/body-bride.webp",
    bodyGroom: "./editable/assets/body-groom.webp",
  },

  story: [
    {
      title: "First Meeting",
      date: "Summer 2004",
      text: "Two seven-year-olds, one sandbox, and a fiercely contested red bucket. Neither of us remembers who won — only that we never really left each other's side after that.",
    },
    {
      title: "Friendship",
      date: "2004 — 2019",
      text: "Fifteen years of borrowed pencils, secret handshakes, birthday cakes and long bicycle rides home. The kind of friendship that quietly becomes home.",
    },
    {
      title: "The Proposal",
      date: "Spring 2025",
      text: "Under the same old maple tree where we carved our initials as kids, James knelt with a ring — and Amelia said yes before he finished the question.",
    },
    {
      title: "The Wedding",
      date: "December 2026",
      text: "And now, the chapter we have been writing our whole lives. We would be honoured to have you there when it begins.",
    },
  ],

  details: {
    ceremony: {
      title: "The Wedding Ceremony",
      venue: "Rosewood Garden Chapel",
      time: "4:00 PM — 5:00 PM",
      note: "Please arrive by 3:30 PM to be seated",
    },
    dressCode: "Garden Formal · Soft neutrals & pastels encouraged",
  },

  venue: {
    name: "Rosewood Garden Estate",
    address: "14 Maple Grove Lane, Willow Creek",
    mapQuery: "Rosewood Garden Estate",
  },

  gallery: [
    {
      src: "./editable/assets/gallery-1.webp",
      alt: "Golden hour walk through the garden",
    },
    {
      src: "./editable/assets/gallery-2.webp",
      alt: "Dancing under the string lights",
    },
    {
      src: "./editable/assets/gallery-3.webp",
      alt: "The ring — she said yes",
    },
    {
      src: "./editable/assets/gallery-4.webp",
      alt: "Sunday coffee ritual",
    },
    {
      src: "./editable/assets/gallery-5.webp",
      alt: "The proposal under the maple tree",
    },
    {
      src: "./editable/assets/gallery-6.webp",
      alt: "Sparkler send-off dreams",
    },
  ],

  families: {
    bride: {
      label: "The Bride's Family",
      title: "The Bennetts",
      photo: "./editable/assets/family-bride.webp",
      members: [
        { name: "Eleanor Bennett", relation: "Mother of the Bride" },
        { name: "Thomas Bennett", relation: "Father of the Bride" },
        { name: "Clara Bennett", relation: "Sister & Maid of Honour" },
      ],
    },
    groom: {
      label: "The Groom's Family",
      title: "The Coles",
      photo: "./editable/assets/family-groom.webp",
      members: [
        { name: "Margaret Cole", relation: "Mother of the Groom" },
        { name: "Henry Cole", relation: "Father of the Groom" },
        { name: "Oliver Cole", relation: "Brother & Best Man" },
      ],
    },
  },

  calendar: {
    title: "Amelia & James — Wedding",
    description: "Wedding ceremony at Rosewood Garden Chapel.",
    durationHours: 1,
  },

  footer: {
    thanks: "Thank you for celebrating with us",
    copyright: "© 2026 Amelia & James · Handcrafted with love by InviteStory",
  },
};
