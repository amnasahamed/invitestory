#!/usr/bin/env node
/**
 * Inject professional InviteStory OG / Twitter / title meta into every
 * built template index.html, keyed by folder name from the catalogue.
 *
 * Usage: node scripts/inject-og-meta.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const templatesRoot = path.join(root, "public/templates");
const sharedOg = path.join(root, "public/images/og-cover.webp");
const MARKER = "data-invitestory-meta";

/** Catalogue mirror of src/templates.ts (name + tagline + vibe). */
const CATALOGUE = [
  ["template-rajwada-royale", "Rajwada Royale", "A palace door opens for your big day", "Royal palace wedding invitation"],
  ["template-marigold-bhavan", "Marigold Bhavan", "Sunshine, torans and tradition", "Classic Indian wedding invitation"],
  ["template-toran-telugu", "Toran Telugu", "Banana leaves, brass lamps, South-Indian warmth", "South Indian wedding invitation"],
  ["template-ghibli-selfie", "Ghibli Selfie", "Hand-painted, animated, heartfelt", "Illustrated wedding invitation"],
  ["template-emerald-nikah", "Emerald Nikah", "Vows under emerald vines", "Nikah wedding invitation"],
  ["template-noor-e-zahra", "Noor-e-Zahra", "The nikkah under a moonlit mandala", "Nikah wedding invitation"],
  ["template-royal-reception", "Royal Reception", "A grand reception under aurora lights", "Walima reception invitation"],
  ["template-kerala-sands", "Kerala Sands", "Temple bells, the sea, and jasmine", "Kerala wedding invitation"],
  ["template-meadow-nikah", "Meadow Nikah", "A nikah in a sunlit garden", "Garden Nikah invitation"],
  ["template-grand-line-voyage", "Grand Line Voyage", "Set sail for forever", "Adventure-themed wedding invitation"],
  ["template-sage-parchment", "Sage Parchment", "Two families, one parchment", "Classic Hindu wedding invitation"],
  ["template-ghibli-portrait", "Ghibli Portrait", "From childhood sketches to the wedding aisle", "Illustrated portrait invitation"],
  ["template-rajwada-royale-alt", "Rajwada Royale", "A palace door opens for your big day", "Royal palace wedding invitation"],
  ["template-marigold-bhavan-alt", "Marigold Bhavan", "Sunshine, torans and tradition", "Classic Indian wedding invitation"],
  ["template-rajmahal-palace", "Rajmahal Palace", "Palace doors open onto forever", "Royal palace wedding invitation"],
  ["template-shubha-vivaham", "Shubha Vivaham", "A Telugu muhurtham, beautifully told", "Telugu muhurtham invitation"],
  ["template-midnight-stargaze", "Midnight Stargaze", "Vows under a starlit sky", "Midnight royal wedding invitation"],
  ["template-kalyana-mandapam", "Kalyana Mandapam", "The sacred muhurtham, beautifully told", "Telugu mandapam invitation"],
  ["template-tamil-thirumana", "Tamil Thirumana", "The sacred knot at dawn", "Tamil wedding invitation"],
  ["template-lake-pichola", "Lake Pichola Royal", "Palace reflections on Lake Pichola", "Royal lake palace invitation"],
  ["template-petal-path", "Petal Path Palace", "Walk the petal aisle into forever", "Layered parallax palace wedding invitation"],
  ["template-lakeview-lanterns", "Lakeview Lanterns", "Twilight vows by the glowing backwaters", "Kerala lakeside lantern wedding invitation"],
  ["template-ivory-waltz", "Ivory Waltz", "A soft dance into forever", "Cream linen Nikah invitation"],
];

function escapeAttr(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function findOgImage(dir) {
  const candidates = [
    "assets/og-image.jpg",
    "assets/og-image.png",
    "assets/og-image.webp",
    "assets/layers/hero-composite.jpg",
    "og-image.jpg",
    "og-cover.webp",
  ];
  for (const rel of candidates) {
    if (fs.existsSync(path.join(dir, rel))) return `./${rel}`;
  }
  // Ensure a fallback cover exists in the template folder
  const fallback = "og-cover.webp";
  const dest = path.join(dir, fallback);
  if (!fs.existsSync(dest) && fs.existsSync(sharedOg)) {
    fs.copyFileSync(sharedOg, dest);
  }
  return fs.existsSync(dest) ? `./${fallback}` : "./favicon.ico";
}

function metaBlock({ name, tagline, kind, image }) {
  const title = `${name} | InviteStory`;
  const description = `${tagline}. ${kind} sample by InviteStory - handcrafted digital wedding invitations.`;
  const e = escapeAttr;
  return `    <!-- ${MARKER} -->
    <title>${e(title)}</title>
    <meta name="description" content="${e(description)}" />
    <meta name="theme-color" content="#0E1410" />
    <meta name="author" content="InviteStory" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="InviteStory" />
    <meta property="og:title" content="${e(title)}" />
    <meta property="og:description" content="${e(description)}" />
    <meta property="og:image" content="${e(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${e(title)}" />
    <meta name="twitter:description" content="${e(description)}" />
    <meta name="twitter:image" content="${e(image)}" />
`;
}

const META_RE = new RegExp(
  `\\s*<!-- ${MARKER} -->[\\s\\S]*?(?=\\s*<(?:link|script|style|base|!--))`,
  "m",
);

// Also strip old customer placeholder OG blocks and generic titles
const STRIP_PATTERNS = [
  /\s*<!--\s*▼▼ PER-CUSTOMER[\s\S]*?▲▲ PER-CUSTOMER ▲▲\s*-->\s*/g,
  /\s*<title>[^<]*<\/title>\s*/gi,
  /\s*<meta\s+name="description"[^>]*>\s*/gi,
  /\s*<meta\s+name="theme-color"[^>]*>\s*/gi,
  /\s*<meta\s+name="author"[^>]*>\s*/gi,
  /\s*<meta\s+property="og:[^"]+"[^>]*>\s*/gi,
  /\s*<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi,
];

let updated = 0;

for (const [folder, name, tagline, kind] of CATALOGUE) {
  const dir = path.join(templatesRoot, folder);
  const indexPath = path.join(dir, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn("missing", folder);
    continue;
  }

  let html = fs.readFileSync(indexPath, "utf8");
  const image = findOgImage(dir);
  const block = metaBlock({ name, tagline, kind, image });

  // Remove previous InviteStory meta block if present
  html = html.replace(META_RE, "\n");

  // Strip legacy title/description/og/twitter
  for (const re of STRIP_PATTERNS) {
    html = html.replace(re, "\n");
  }

  // Ensure favicon link remains (don't strip icons)
  if (!/rel=["']icon["']/.test(html)) {
    block; // favicon handled separately below
  }

  // Insert meta after charset/viewport cluster, before other head assets
  if (/<meta[^>]*name="viewport"[^>]*>/i.test(html)) {
    html = html.replace(
      /(<meta[^>]*name="viewport"[^>]*>)/i,
      `$1\n${block}`,
    );
  } else if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${block}`);
  } else {
    console.warn("no head", folder);
    continue;
  }

  // Ensure favicon
  if (!/rel=["']icon["']/.test(html)) {
    html = html.replace(
      `<!-- ${MARKER} -->`,
      `<!-- ${MARKER} -->\n    <link rel="icon" type="image/x-icon" href="./favicon.ico" />`,
    );
  }

  // Collapse excessive blank lines in head
  html = html.replace(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i, (_, a, mid, c) => {
    const cleaned = mid.replace(/\n{3,}/g, "\n\n");
    return a + cleaned + c;
  });

  fs.writeFileSync(indexPath, html);
  updated++;
  console.log(`meta: ${folder} -> ${name} (${image})`);
}

console.log(`Done. Updated ${updated} templates.`);
