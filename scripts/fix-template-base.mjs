#!/usr/bin/env node
/**
 * Rewrite absolute /templates/<folder>/ <base> tags to a location-relative
 * base so previews work on localhost, Netlify root, and project subpaths.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(__dirname, "../public/templates");

const NEW_SCRIPT = `    <script>
      (function () {
        // Resolve assets from this template folder on any host/path.
        var dir = new URL("./", location.href).href;
        var existing = document.querySelector("base");
        if (existing) existing.remove();
        var b = document.createElement("base");
        b.href = dir;
        document.head.prepend(b);
        try {
          // Keep SPA routers matching their root route inside the iframe.
          history.replaceState(null, "", "/");
        } catch (e) {}
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
  } else if (/href\s*=\s*["']\/templates\//.test(html)) {
    // fallback: replace any remaining absolute base assignment
    html = html.replace(
      /b\.href\s*=\s*["']\/templates\/[^"']+["']\s*;?/,
      "b.href = new URL(\"./\", location.href).href;",
    );
    html = html.replace(
      /base\.href\s*=\s*["']\/templates\/[^"']+["']\s*;?/,
      "base.href = new URL(\"./\", location.href).href;",
    );
  } else if (!html.includes("new URL(\"./\"") && html.includes("<head")) {
    // templates with no base rewrite (e.g. shubha) - inject one for consistency
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${NEW_SCRIPT}`);
  }

  if (html !== before) {
    fs.writeFileSync(indexPath, html);
    n++;
    console.log("fixed base:", folder);
  } else {
    console.log("unchanged:", folder);
  }
}
console.log(`Updated ${n} shells.`);
