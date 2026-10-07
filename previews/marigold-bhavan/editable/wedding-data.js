/**
 * wedding-data.js — Customer-facing editable data layer for marigold-bhavan
 * Edit this file to update couple names, wedding dates, event details, venue, and images.
 */

window.WEDDING_DATA = {
  couple: {
    groom: "Chirag",
    bride: "Het",
  },

  wedding: {
    eventTitle: "Engagement of Chirag & Het",
    dateLabel: "14.02.27",
    dayLine: "Sunday, 14th February 2027",
    timeLine: "7:00 PM onwards",
    // start and end are ISO local time strings (drives countdown and calendar invites)
    start: "2027-02-14T19:00:00",
    end: "2027-02-14T23:00:00",
    timeZoneOffset: "+05:30",
  },

  invitation: {
    note: "Together with their families, we invite you to share in the joy of our engagement — an evening of blessings, laughter and good food.",
    closing: "See you there",
  },

  venue: {
    name: "The Grand Bhavan",
    address: "Sardar Patel Road, Navrangpura, Ahmedabad, Gujarat 380009",
    city: "Ahmedabad",
    query: "Navrangpura, Ahmedabad, Gujarat",
    lat: 23.0365,
    lng: 72.5611,
    // Custom map links (leave empty to generate automatically from venue query)
    mapSearchUrl: "",
    directionsUrl: "",
  },

  images: {
    // Replace image files in editable/assets/ or point to new URLs/paths
    couple: "./editable/assets/couple.webp",
    footerBg: "./editable/assets/footer-bg.jpg",
    map: "./editable/assets/map.jpg",
  },
};
