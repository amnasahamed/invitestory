#!/usr/bin/env node
/**
 * Inject Google Fonts <link> tags into built template index.html shells
 * that lost them during TanStack → SPA conversion.
 *
 * Usage: node scripts/inject-template-fonts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(__dirname, "../public/templates");

/** Exact hrefs from each template's source __root.tsx (royal-reception added). */
const FONT_HREF = {
  "template-emerald-nikah":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Great+Vibes&family=Jost:wght@300;400;500&family=Amiri:wght@400;700&display=swap",
  "template-ghibli-selfie":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500&family=Great+Vibes&display=swap",
  "template-grand-line-voyage":
    "https://fonts.googleapis.com/css2?family=Titan+One&family=Yatra+One&family=Mukta:wght@300;400;600;800&display=swap",
  "template-kerala-sands":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Great+Vibes&family=Jost:wght@300;400;500&display=swap",
  "template-marigold-bhavan":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Josefin+Sans:wght@300;400&family=Parisienne&display=swap",
  "template-marigold-bhavan-alt":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Josefin+Sans:wght@300;400&family=Parisienne&display=swap",
  "template-meadow-nikah":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap",
  "template-noor-e-zahra":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Karla:wght@300;400;500;600&family=Cinzel:wght@500;600;700&family=Great+Vibes&family=Amiri:wght@400;700&display=swap",
  "template-sage-parchment":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Karla:wght@300;400;500&display=swap",
  "template-tamil-thirumana":
    "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Karla:wght@300;400;500&family=Pinyon+Script&display=swap",
  "template-toran-telugu":
    "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Karla:wght@300;400;500&family=Pinyon+Script&display=swap",
  "template-royal-reception":
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Great+Vibes&family=Jost:wght@300;400;500&display=swap",
};

const MARKER = "data-invitestory-fonts";

function fontBlock(href) {
  return `    <!-- ${MARKER} -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${href}" rel="stylesheet" />
`;
}

let updated = 0;
let skipped = 0;

for (const [folder, href] of Object.entries(FONT_HREF)) {
  const indexPath = path.join(templatesRoot, folder, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn("Missing", indexPath);
    continue;
  }
  let html = fs.readFileSync(indexPath, "utf8");

  if (html.includes(MARKER)) {
    // Refresh block in case href changed
    html = html.replace(
      new RegExp(
        `\\s*<!-- ${MARKER} -->[\\s\\S]*?<link href="[^"]+" rel="stylesheet" />\\s*`,
        "m",
      ),
      "\n" + fontBlock(href),
    );
    fs.writeFileSync(indexPath, html);
    updated++;
    continue;
  }

  if (html.includes("fonts.googleapis.com")) {
    skipped++;
    console.log("Already has Google Fonts (manual):", folder);
    continue;
  }

  if (!html.includes("</head>")) {
    console.warn("No </head> in", folder);
    continue;
  }

  html = html.replace("</head>", `${fontBlock(href)}  </head>`);
  fs.writeFileSync(indexPath, html);
  updated++;
  console.log("Injected fonts:", folder);
}

console.log(`Done. Updated ${updated}, skipped ${skipped}.`);
