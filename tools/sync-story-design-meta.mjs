// Registers the five story invitations in the preview manifest, name map and share metadata.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const designs = [
  [48, "Firdaus", "firdaus", ["Zayd"], ["Amina"], "Garden Nikah invitation: a brass-clasped keepsake opens into a lantern-lit garden with Nikah, Walima, place card and RSVP."],
  [49, "Padharo Sa", "padharo-sa", ["Ishaan"], ["Aarohi"], "Hand-painted Rajasthani wedding-home story: mehendi, a lamp-lit sangeet, marigold mandap and RSVP."],
  [50, "Malligai Vaasal", "malligai-vaasal", ["Karthik"], ["Meenakshi"], "Tamil temple-door invitation: light the lamp to open a jasmine wedding morning with Oonjal, Muhurtham, Virundhu and RSVP."],
  [51, "Yaadein", "yaadein", ["Ishaan"], ["Aarohi"], "Watercolour scrapbook invitation: a wax-sealed letter, your photo, three illustrated celebrations, a 3D diya and RSVP."],
  [52, "Chapel Bells", "chapel-bells", ["Matthew"], ["Anna"], "Goan Christian invitation: ring the bell to open a love letter with church, 3D rings, garden reception and RSVP."]
];

const read = (file) => JSON.parse(readFileSync(resolve(root, file), "utf8"));
const write = (file, value) => writeFileSync(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);

const manifest = read("previews/manifest.json");
const names = read("previews/name-map.json");
const meta = read("design-meta.json");
const metaJs = JSON.parse(readFileSync(resolve(root, "design-meta.js"), "utf8").replace(/^export default\s+/, "").replace(/;\s*$/, ""));

for (const [id, name, slug, first, second, desc] of designs) {
  const url = `/previews/${slug}/`;
  manifest.designs = manifest.designs.filter((d) => d.id !== id);
  // Keep the Dearly suites last, as the catalogue lists them.
  const dearly = manifest.designs.findIndex((d) => d.url.startsWith("/dearly/"));
  manifest.designs.splice(dearly < 0 ? manifest.designs.length : dearly, 0, { id, name, url });
  names[url] = { first, second };
  const entry = {
    id,
    name,
    slug,
    image: `assets/preview/${id}.png`,
    imageUrl: `https://www.invitestory.in/assets/preview/${id}.png`,
    title: `InviteStory – ${name} Wedding Invitation`,
    desc,
    url: `https://www.invitestory.in/?design=${slug}`
  };
  for (const target of [meta, metaJs]) {
    target[String(id)] = entry;
    target[slug] = entry;
  }
}

write("previews/manifest.json", manifest);
write("previews/name-map.json", names);
write("design-meta.json", meta);
writeFileSync(resolve(root, "design-meta.js"), `export default ${JSON.stringify(metaJs, null, 2)};\n`);
console.log(`Registered ${designs.length} story invitations.`);
