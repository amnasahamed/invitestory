/**
 * wedding-data.js — Customer-facing editable data layer for grand-line-voyage
 * Edit this file to update couple names, pirate bounties/titles, dates, venue, and images.
 */

window.WEDDING_DATA = {
  couple: {
    bride: {
      name: "Aanya",
      fullName: "Aanya D. Nakama",
      epithet: "The Marigold Navigator",
      bounty: "1,500,000,000",
      intro: "Chartered every monsoon between Kochi and the Grand Line. Reads the stars, the tides and her fiance's terrible jokes with equal accuracy.",
      image: "./editable/assets/op-bride.webp",
    },
    groom: {
      name: "Vikram",
      fullName: "Vikram ‘Straw Hat’ Rao",
      epithet: "Captain of the Laddoo Pirates",
      bounty: "1,500,000,001",
      intro: "Set sail from Hyderabad with one dream: to eat every biryani on every island — and to marry the girl who drew the map.",
      image: "./editable/assets/op-groom.webp",
    },
  },

  wedding: {
    // ISO date string drives the countdown timer, Google Calendar, and .ics download
    date: "2027-02-14T19:30:00",
    dateLabel: "Sunday, 14 February 2027",
    timeLabel: "7:30 PM onwards · Baraat at 6:00 PM",
    hashtag: "#TheGrandLineOfMarriage",
  },

  venue: {
    name: "Thousand Sunset Palace",
    address: "Sunburn Beach Road, Vagator, Goa 403509",
    mapsQuery: "Vagator Beach, Goa",
    // Optional custom Google Maps link (leave empty to generate automatically from mapsQuery)
    mapsUrl: "",
  },

  images: {
    // Replace these files in editable/assets/ or point to new paths
    heroShip: "./editable/assets/op-hero-ship.webp",
    couplePanel: "./editable/assets/op-couple-panel.webp",
    treasureMap: "./editable/assets/op-map-v1.webp",
  },
};
