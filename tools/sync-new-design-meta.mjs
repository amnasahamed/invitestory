import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const additions = [
  [40, "Sunehri", "sunehri", "Amber courtyard invitation with a floral door reveal, music, scratch date, gallery, directions and RSVP."],
  [41, "Gulistan", "gulistan", "Pastel garden invitation with a sculpted floral gate, music, wedding timeline, directions and RSVP."],
  [42, "Gulabi", "gulabi", "Vintage rose storybook invitation with an animated bloom, music, event details, directions and RSVP."],
  [43, "Raat Rani", "raat-rani", "Midnight pomegranate invitation with a cinematic folio reveal, music, collage scenes, directions and RSVP."],
  [44, "Aabha", "aabha", "Pearl and ivory invitation with a golden key reveal, music, schedule, directions and RSVP."],
  [45, "Aranya", "aranya", "Olive linen botanical invitation with an embossed folio reveal, music, events, directions and RSVP."],
  [46, "Gulnaar", "gulnaar", "Ruby pomegranate invitation with a floral darbar reveal, music, scratch date, directions and RSVP."],
  [47, "Noor Mahal", "noor-mahal", "Ivory jali palace invitation with cinematic doors, music, programme, directions and RSVP."]
];

function record(id, name, slug, desc) {
  return {
    id,
    name,
    slug,
    image: `assets/preview/${id}.png`,
    imageUrl: `https://www.invitestory.in/assets/preview/${id}.png`,
    title: `InviteStory – ${name} Wedding Invitation`,
    desc,
    url: `https://www.invitestory.in/?design=${slug}`
  };
}

const jsonPath = resolve(root, "design-meta.json");
const json = JSON.parse(readFileSync(jsonPath, "utf8"));
const jsPath = resolve(root, "design-meta.js");
const jsSource = readFileSync(jsPath, "utf8").replace(/^export default\s+/, "").replace(/;\s*$/, "");
const js = JSON.parse(jsSource);

for (const values of additions) {
  const entry = record(...values);
  json[String(entry.id)] = entry;
  json[entry.slug] = entry;
  js[String(entry.id)] = entry;
  js[entry.slug] = entry;
}

writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`);
writeFileSync(jsPath, `export default ${JSON.stringify(js, null, 2)};\n`);
console.log(`Synced ${additions.length} new invitation records to both metadata files.`);
