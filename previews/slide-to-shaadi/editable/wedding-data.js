/**
 * wedding-data.js — Customer-facing editable data layer for slide-to-shaadi
 * Edit this file to update couple names, phone screen captions, invitation text, event items, and images.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Aarav",
    bride: "Meera",
    title: "Aarav & Meera",
    hashtag: "#AaravFoundHisMeera",
  },

  phoneScreen: {
    status: "incoming · shubh vivah",
    callingSubtitle: "calling you to their wedding…",
  },

  invitation: {
    familyLine: "Together with their families",
    requestLine: "request the pleasure of your company as they begin forever.",
    acceptButton: "Accept with Love",
  },

  events: [
    {
      title: "Saturday, 12 December 2026",
      subtitle: "Baraat 5:00 PM · Pheras 8:30 PM",
      highlight: true,
    },
    {
      title: "Jag Mandir, Lake Pichola",
      subtitle: "Udaipur, Rajasthan",
      highlight: false,
    },
    {
      title: "Sangeet & Mehndi",
      subtitle: "Thursday, 10 Dec · 6:00 PM onwards",
      highlight: false,
    },
  ],

  images: {
    lockscreenBg: "./editable/assets/wedding-lockscreen.jpg",
    coupleAvatar: "./editable/assets/couple-avatar.jpg",
    ornamentDivider: "./editable/assets/ornament-divider.jpg",
  },
};
