#!/usr/bin/env node
/**
 * Inject hardcoded static <base href="/templates/<folder>/"> into all template index.html files
 * so that all relative assets (assets/*.js, assets/*.css, yt-bg-music.js) load cleanly
 * from /templates/<folder>/ without 404 errors.
 *
 * Usage: node scripts/fix-template-base.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(__dirname, "../public/templates");

const BASE_MARKER = "data-invitestory-base";

let n = 0;
for (const folder of fs.readdirSync(templatesRoot)) {
  const dirPath = path.join(templatesRoot, folder);
  if (!fs.statSync(dirPath).isDirectory()) continue;

  const indexPath = path.join(dirPath, "index.html");
  if (!fs.existsSync(indexPath)) continue;

  let html = fs.readFileSync(indexPath, "utf8");
  const before = html;

  // Remove old base tags and old inline scripts
  html = html.replace(/\s*<base[^>]*>\s*/gi, "\n");
  html = html.replace(/\s*<script>\s*\(function\s*\(\)\s*\{[\s\S]*?createElement\(["']base["']\)[\s\S]*?\}\)\(\);\s*<\/script>\s*/gi, "\n");
  html = html.replace(/\s*<script>\s*try\s*\{\s*if\s*\([^)]*starts-With[^)]*\)[\s\S]*?<\/script>\s*/gi, "\n");
  html = html.replace(/\s*<!--\s*data-invitestory-base\s*-->[\s\S]*?(?=\s*<(?:meta|title|link|script))/gi, "\n");

  const baseBlock = `    <!-- ${BASE_MARKER} -->
    <base href="/templates/${folder}/" />`;

  // Insert baseBlock right after <head>
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${baseBlock}`);
  }

  // Collapse multiple blank lines
  html = html.replace(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i, (_, a, mid, c) => {
    const cleaned = mid.replace(/\n{3,}/g, "\n\n");
    return a + cleaned + c;
  });

  if (html !== before) {
    fs.writeFileSync(indexPath, html);
    n++;
    console.log(`fixed base for ${folder} -> /templates/${folder}/`);
  } else {
    console.log(`unchanged: ${folder}`);
  }
}

console.log(`Successfully updated ${n} template shells.`);
