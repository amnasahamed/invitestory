#!/usr/bin/env node
/**
 * Rewrite template <base> tags using robust path normalization that handles:
 * - Vercel cleanUrls (where /templates/folder/index.html becomes /templates/folder)
 * - Trailing slashes vs no trailing slashes
 * - Subpaths & localhost dev servers
 *
 * Usage: node scripts/fix-template-base.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(__dirname, "../public/templates");

const NEW_SCRIPT = `    <script>
      (function () {
        var path = location.pathname;
        if (!path.endsWith("/")) {
          if (path.endsWith(".html")) {
            path = path.substring(0, path.lastIndexOf("/") + 1);
          } else {
            path = path + "/";
          }
        }
        var dir = location.origin + path;
        var existing = document.querySelector("base");
        if (existing) existing.remove();
        var b = document.createElement("base");
        b.href = dir;
        document.head.prepend(b);
      })();
    </script>`;

const OLD_BASE_BLOCK =
  /<script>\s*\/\/[^\n]*\n[\s\S]*?createElement\(["']base["']\)[\s\S]*?<\/script>/i;
const OLD_BASE_BLOCK2 =
  /<script>\s*var b = document\.createElement\("base"\);[\s\S]*?<\/script>/i;
const OLD_BASE_BLOCK3 =
  /<script>\s*\(function \(\) \{[\s\S]*?createElement\(["']base["']\)[\s\S]*?\}\)\(\);\s*<\/script>/i;

let n = 0;
for (const folder of fs.readdirSync(templatesRoot)) {
  const indexPath = path.join(templatesRoot, folder, "index.html");
  if (!fs.existsSync(indexPath)) continue;
  let html = fs.readFileSync(indexPath, "utf8");
  const before = html;

  if (OLD_BASE_BLOCK3.test(html)) {
    html = html.replace(OLD_BASE_BLOCK3, NEW_SCRIPT);
  } else if (OLD_BASE_BLOCK.test(html)) {
    html = html.replace(OLD_BASE_BLOCK, NEW_SCRIPT);
  } else if (OLD_BASE_BLOCK2.test(html)) {
    html = html.replace(OLD_BASE_BLOCK2, NEW_SCRIPT);
  } else if (!html.includes("location.origin + path") && html.includes("<head")) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${NEW_SCRIPT}`);
  }

  // Strip any legacy history.replaceState attempts
  html = html.replace(/try\s*\{\s*history\.replaceState\(null,\s*""\s*,\s*"\/?"\);\s*\}\s*catch\s*\(e\)\s*\{\}/g, "");

  if (html !== before) {
    fs.writeFileSync(indexPath, html);
    n++;
    console.log("fixed base:", folder);
  } else {
    console.log("unchanged:", folder);
  }
}
console.log(`Updated ${n} shells.`);
