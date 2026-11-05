/**
 * Customer-editable content for Burgundy Reverie.
 * Update this single file to personalize names, family details, date, venue,
 * programme, RSVP address, and invitation wording.
 */
window.WEDDING_DATA = {
  couple: {
    groom: {
      name: "Aarav Menon",
      parents: "Son of Mr. Ramesh & Mrs. Latha Menon",
      bio: "An architect who sketches palaces on café napkins and believes every good story starts with chai.",
    },
    bride: {
      name: "Diya Nair",
      parents: "Daughter of Mr. Suresh & Mrs. Anjali Nair",
      bio: "A classical dancer and paediatrician who hums old melodies while she works.",
    },
  },
  wedding: {
    dateISO: "2026-12-10T19:15:00+05:30",
    weekday: "Thursday",
    day: "10",
    month: "December",
    year: "2026",
    romanYear: "MMXXVI",
    dateShort: "10 · XII · 2026",
    heroKicker: "Together with their families",
    invitationLine: "request the pleasure of your company",
  },
  venue: {
    name: "Taj Malabar Resort & Spa",
    shortName: "Taj Malabar",
    city: "Kochi",
    address: "Willingdon Island, Kochi 682009",
  },
  events: [
    {
      number: "I",
      title: "Muhurtham",
      date: "Thursday, 10 December 2026",
      details: "7:15 PM · Doors open at 6:30 PM",
    },
    {
      number: "II",
      title: "Reception",
      date: "Thursday, 10 December 2026",
      details: "Following the ceremony · Dinner & celebration",
    },
    {
      number: "III",
      title: "The Venue",
      date: "Taj Malabar Resort & Spa",
      details: "Willingdon Island, Kochi 682009",
    },
  ],
  rsvp: {
    email: "",
    // Leave blank to build the subject automatically from the couple's names.
    subject: "",
    body: "We will be there! Number of guests: ",
  },
};
