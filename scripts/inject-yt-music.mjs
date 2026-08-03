#!/usr/bin/env node
/**
 * Copy the shared YouTube music player into every built template and
 * inject the script tag + a music.json stub (if missing).
 *
 * Usage: node scripts/inject-yt-music.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sharedJs = path.join(root, "public/shared/yt-bg-music.js");
const templatesRoot = path.join(root, "public/templates");

const SCRIPT_TAG =
  '<script src="./yt-bg-music.js" defer></script>';
const MARKER = "yt-bg-music.js";

const musicStub = `{
  "youtube": ""
}
`;

if (!fs.existsSync(sharedJs)) {
  console.error("Missing", sharedJs);
  process.exit(1);
}

const source = fs.readFileSync(sharedJs, "utf8");
const folders = fs
  .readdirSync(templatesRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith("template-"))
  .map((d) => d.name);

let injected = 0;
let copied = 0;
let jsonCreated = 0;

for (const folder of folders) {
  const dir = path.join(templatesRoot, folder);
  const indexPath = path.join(dir, "index.html");
  if (!fs.existsSync(indexPath)) continue;

  fs.writeFileSync(path.join(dir, "yt-bg-music.js"), source);
  copied++;

  const musicPath = path.join(dir, "music.json");
  if (!fs.existsSync(musicPath)) {
    fs.writeFileSync(musicPath, musicStub);
    jsonCreated++;
  }

  let html = fs.readFileSync(indexPath, "utf8");
  if (html.includes(MARKER)) {
    continue;
  }
  if (!html.includes("</body>")) {
    console.warn("No </body> in", folder);
    continue;
  }
  html = html.replace("</body>", `    ${SCRIPT_TAG}\n  </body>`);
  fs.writeFileSync(indexPath, html);
  injected++;
}

console.log(
  `Done. Copied player to ${copied} templates, injected script into ${injected}, created ${jsonCreated} music.json stubs.`,
);
