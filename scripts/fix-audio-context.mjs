#!/usr/bin/env node
/**
 * Safely catch unhandled AudioContext.resume() promise rejections across all template JS bundles
 * so Chrome's Autoplay policy never logs unhandled console warnings on page load.
 *
 * Usage: node scripts/fix-audio-context.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(__dirname, "../public/templates");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Replace .resume() calls on AudioContext with safe promise catches
  // e.g. R.resume() -> (R.resume() && R.resume().catch && R.resume().catch(function(){}))
  // e.g. t.resume() -> (t.resume() && t.resume().catch && t.resume().catch(function(){}))
  
  content = content.replace(
    /(\b[a-zA-Z0-9_$]+\.resume\(\))/g,
    "(function(p){try{if(p&&typeof p.catch==='function')p.catch(function(){});}catch(e){}})($1)"
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log("Patched AudioContext.resume() in:", path.relative(templatesRoot, filePath));
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fullPath = path.join(dir, f.name);
    if (f.isDirectory()) {
      walk(fullPath);
    } else if (f.name.endsWith(".js")) {
      processFile(fullPath);
    }
  }
}

walk(templatesRoot);
console.log("AudioContext patch completed.");
