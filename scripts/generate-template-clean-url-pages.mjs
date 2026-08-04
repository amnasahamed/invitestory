import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Legacy clean-URL redirect pages (`public/templates/{id}.html`) used to
 * bounce `/templates/:id` straight into the raw invite HTML. That bypassed
 * the SPA TemplateViewer (Home / prev / next / buy chrome).
 *
 * This script now only removes those redirect files so Vercel serves the SPA.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const templatesSourcePath = path.join(rootDir, "src", "templates.ts");
const publicTemplatesDir = path.join(rootDir, "public", "templates");

function extractTemplateIds(source) {
  const matcher = /id:\s*"([^"]+)"/g;
  const ids = [];
  let match;
  while ((match = matcher.exec(source)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

async function main() {
  const source = await fs.readFile(templatesSourcePath, "utf8");
  const ids = extractTemplateIds(source);
  if (ids.length === 0) {
    throw new Error("No templates found in src/templates.ts");
  }

  let removed = 0;
  await Promise.all(
    ids.map(async (id) => {
      const targetPath = path.join(publicTemplatesDir, `${id}.html`);
      try {
        await fs.unlink(targetPath);
        removed += 1;
      } catch (error) {
        if (error && error.code !== "ENOENT") throw error;
      }
    }),
  );

  console.log(
    removed > 0
      ? `Removed ${removed} legacy clean-URL redirect pages so SPA owns /templates/:id.`
      : "No legacy clean-URL redirect pages to remove.",
  );
}

main().catch((error) => {
  console.error("Failed cleaning legacy template redirect pages.", error);
  process.exitCode = 1;
});
