/**
 * wedding-data.js — Customer-facing editable data layer for meadow-nikah
 * Edit this file to update couple names, parents, dates, venue, Islamic verse, images, and gallery.
 */

window.WEDDING_DATA = {
  couple: {
    bride: {
      name: "Erfana",
      fullName: "Erfana Rahman",
      line: "Daughter of Mr. Vinod Rahman & Mrs. Shemy",
      blurb: "A lover of quiet moments, joyous celebrations and endless smiles.",
      photo: "./editable/assets/bride.jpg",
    },
    groom: {
      name: "Sukail",
      fullName: "Sukail K S",
      line: "Son of Mr. Sainidheen & Mrs. Hajra",
      blurb: "Kind-hearted, adventurous and ready to embark on life's finest journey.",
      photo: "./editable/assets/groom.jpg",
    },
  },

  wedding: {
    dateISO: "2026-08-30T18:00:00+05:30",
    endISO: "2026-08-30T22:00:00+05:30",
    dateLabel: "Sunday, 30 August 2026",
    timeLabel: "Reception: 6:00 PM – 10:00 PM",
  },

  religious: {
    bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    bismillahLatin: "In the name of Allah, the Most Gracious, the Most Merciful",
    ayah: "And of His signs is that He created for you mates from among yourselves, that you may find tranquillity in them; and He placed between you affection and mercy.",
    ayahRef: "Surah Ar-Rum 30:21",
  },

  venue: {
    name: "Kenz Convention Centre",
    address: "Punnoppady, Pezhakkappilly, Kerala 686669",
    mapsUrl: "https://maps.app.goo.gl/ftRGXRbnMTiLUsZS8?g_st=iw",
    preview: "./editable/assets/map.jpg",
  },

  closing: "Your duas and presence are the blessing we wish for. Come, share this joy with us, and help us begin forever, insha'Allah.",

  images: {
    heroArt: "./editable/assets/hero.jpg",
    introCover: "./editable/assets/ChatGPT Image Aug 12, 2026 at 11_08_45 PM.webp",
    introVideo: "./editable/assets/Continuous_wedding_invitation_an…_202608122343.mp4",
  },

  gallery: [
    "./editable/assets/gallery-1.jpg",
    "./editable/assets/gallery-2.jpg",
    "./editable/assets/gallery-3.jpg",
    "./editable/assets/gallery-4.jpg",
    "./editable/assets/gallery-5.jpg",
    "./editable/assets/gallery-6.jpg",
  ],
};
