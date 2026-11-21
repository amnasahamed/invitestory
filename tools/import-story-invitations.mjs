// Copies the five story invitations (exported "Invitation-Websites" archive) into
// previews/<slug>/ and adds the shared InviteStory preview hooks.
// Usage: node tools/import-story-invitations.mjs "<path to Invitation-Websites>"
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const sourceRoot = resolve(process.argv[2] || "../Invitation-Websites");
const previewRoot = resolve(import.meta.dirname, "..", "previews");

// [archive folder, preview slug, design name, signature line, footer variant, ink, paper]
export const STORY_DESIGNS = [
  ["a-garden-for-two-wedding", "firdaus", "Firdaus", "A garden Nikah, with love", "garden", "#f3e7cc", "#263e33"],
  ["moonlit-courtyard-invitation", "padharo-sa", "Padharo Sa", "A wedding at home", "botanical", "#efddbb", "#1a3c43"],
  ["sacred-threshold-wedding", "malligai-vaasal", "Malligai Vaasal", "A sacred beginning", "palace", "#f1dfb8", "#691e24"],
  ["the-things-we-keep-invitation", "yaadein", "Yaadein", "The things we keep", "petal", "#5b4636", "#f2eee3"],
  ["where-love-comes-home-wedding", "chapel-bells", "Chapel Bells", "A Goan love letter", "garden", "#24406b", "#f8f4e9"]
];

// Archive wording written for a design review, not for a guest.
const copyFixes = [
  ["AN INVITATION TO KEEP · CONCEPT 02", "AN INVITATION TO KEEP"],
  ["An original mixed-media invitation concept.", "A sample invitation by InviteStory."],
  ["An original Tamil Hindu wedding concept.", "A sample invitation by InviteStory."],
  ["ABOUT THIS CONCEPT", "ABOUT THIS DESIGN"]
];

function prepare(html, [, , name, line, variant, ink, paper]) {
  for (const [from, to] of copyFixes) html = html.split(from).join(to);
  // Couple monograms ("A <i>&</i> Z") follow the names a visitor previews with (see previews/names.js).
  html = html.replace(
    /<(a|span)\b([^>]*)>(?=[A-Za-z] ?<(i|span|em)>&<\/\3> ?[A-Za-z]\b)/g,
    "<$1$2 data-preview-monogram>"
  );
  html = html.replace(/<title>([^<]*)<\/title>/, (_, title) => {
    const couple = title.match(/\p{Lu}\p{Ll}+ & \p{Lu}\p{Ll}+/u)?.[0];
    return `<title>${couple ? `${couple} — Wedding Invitation` : title} · ${name}</title>`;
  });
  html = html.replace(
    "</head>",
    `<meta name="invitation-design" content="${name}"><link rel="stylesheet" href="../collection-branding.css?v=1"><script src="/previews/names.js"></script></head>`
  );
  const signature = `<footer class="collection-signature collection-signature--${variant}" aria-label="${name} invitation design" style="--signature-ink:${ink};--signature-paper:${paper}"><span class="collection-signature__rule" aria-hidden="true"></span><span class="collection-signature__name">${name}</span><span class="collection-signature__line">${line}</span></footer>`;
  return html.replace(/<\/body>/, `${signature}</body>`);
}

if (!existsSync(sourceRoot)) throw new Error(`Archive folder not found: ${sourceRoot}`);
for (const design of STORY_DESIGNS) {
  const [folder, slug] = design;
  const source = join(sourceRoot, folder, "published");
  const target = join(previewRoot, slug);
  if (existsSync(target)) rmSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
  const index = join(target, "index.html");
  writeFileSync(index, prepare(readFileSync(index, "utf8"), design));
  // The rings renderer's default fallback image lives in assets/, not beside the script.
  const rings = join(target, "rings.js");
  if (existsSync(rings)) {
    writeFileSync(rings, readFileSync(rings, "utf8").replace("new URL('./rings-fallback.svg'", "new URL('./assets/rings-fallback.svg'"));
  }
  console.log(`${slug}: copied from ${folder}`);
}
