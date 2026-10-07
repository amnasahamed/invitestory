/**
 * wedding-data.js — Customer-facing editable data layer for ever-after-bloom
 * Edit this file to update couple names, wedding date, story, chapters, venue, and images.
 */

window.WEDDING_DATA = {
  couple: {
    bride: "Aarohi",
    groom: "Ishaan",
    initials: "A & I",
  },
  dateISO: "2027-02-14T18:30:00+05:30",
  dateLabel: "Sunday, 14 February 2027",
  timeLabel: "6:30 in the evening",
  venue: {
    name: "Amrit Mahal Palace",
    address: "Jal Marg, Old City, Jaipur, Rajasthan",
    mapsQuery: "Amrit Mahal Palace Jaipur Rajasthan",
  },
  dressCode: "Festive Indian — pastels, ivory & gold",
  hero: {
    kicker: "Together with our families",
    eyebrow: "Save the Date",
    blessing: "Two rivers, one sky",
  },
  story: {
    title: "The Two of Them",
    subtitle: "A love story in three brushstrokes",
    bride: {
      name: "Aarohi",
      role: "The Bride",
      text: "Grew up chasing monsoon light with a sketchbook under her arm. She still stops mid-sentence for a good sunset, and she laughs before the joke has finished landing.",
    },
    groom: {
      name: "Ishaan",
      role: "The Groom",
      text: "Learned to cook from his grandmother and to be patient from long train rides. He remembers every song he has ever loved, and hums them slightly wrong on purpose.",
    },
  },
  chapters: [
    {
      no: "I",
      title: "A Courtyard in Winter",
      when: "December 2021",
      text: "They met beside a fountain at a friend's mehndi, arguing gently about whether the marigolds were orange or gold. Neither of them won.",
    },
    {
      no: "II",
      title: "Letters and Long Calls",
      when: "2022 — 2024",
      text: "Two cities, one time zone, and a habit of narrating ordinary evenings to each other until the ordinary began to feel rare.",
    },
    {
      no: "III",
      title: "The Lanterns",
      when: "October 2025",
      text: "On a rooftop above the old city, he asked. She had already said yes somewhere around the second lantern.",
    },
    {
      no: "IV",
      title: "And Now, You",
      when: "February 2027",
      text: "The palace gates open, the sky turns rose, and the story waits for the people who made it possible.",
    },
  ],
  footer: {
    line1: "Come early. Stay late.",
    line2: "Dance badly with us.",
    signoff: "With all our love, Aarohi & Ishaan",
  },
  images: {
    seal: "./editable/assets/invite-seal.webp",
    openVideo: "./editable/assets/invite-open.mp4",
    lantern: "./editable/assets/lantern.webp",
    heroPalace: "./editable/assets/hero-palace.jpg",
    bougainvillea: "./editable/assets/bougainvillea.webp",
    goldFlourish: "./editable/assets/gold-flourish.webp",
    portraitBride: "./editable/assets/portrait-bride.jpg",
    portraitGroom: "./editable/assets/portrait-groom.jpg",
    mapPlate: "./editable/assets/map-plate.jpg",
    weddingCar: "./editable/assets/wedding-car.webp",
    gardenCourtyard: "./editable/assets/garden-courtyard.jpg",
    sceneDancing: "./editable/assets/scene-dancing.jpg",
    sceneWalking: "./editable/assets/scene-walking.jpg",
    sceneBalcony: "./editable/assets/scene-balcony.jpg",
    sceneHands: "./editable/assets/scene-hands.jpg",
    coupleLanterns: "./editable/assets/couple-lanterns.webp",
    sunsetSky: "./editable/assets/sunset-sky.jpg",
  },
};
