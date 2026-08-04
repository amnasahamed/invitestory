#!/usr/bin/env node
/**
 * Inject shared readability.css into every template preview shell.
 * Must load after the template's own stylesheet so muted text overrides win.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(__dirname, "../public/templates");

const MARKER = "data-invitestory-readability";
const LINK = `    <link ${MARKER} rel="stylesheet" href="/shared/readability.css" />`;

let updated = 0;

for (const folder of fs.readdirSync(templatesRoot)) {
  const dirPath = path.join(templatesRoot, folder);
  if (!fs.statSync(dirPath).isDirectory()) continue;

  const indexPath = path.join(dirPath, "index.html");
  if (!fs.existsSync(indexPath)) continue;

  let html = fs.readFileSync(indexPath, "utf8");
  const before = html;

  // Remove any previous readability link
  html = html.replace(
    /\s*<link[^>]*data-invitestory-readability[^>]*>\s*/gi,
    "\n",
  );

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${LINK}\n  </head>`);
  }

  if (html !== before) {
    fs.writeFileSync(indexPath, html);
    updated += 1;
    console.log(`readability: ${folder}`);
  }
}

console.log(`Injected readability.css into ${updated} template shells.`);
