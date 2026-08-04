import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const templatesSourcePath = path.join(rootDir, "src", "templates.ts");
const publicTemplatesDir = path.join(rootDir, "public", "templates");

function extractTemplates(source) {
  const matcher = /id:\s*"([^"]+)"[\s\S]*?folder:\s*"([^"]+)"/g;
  const templates = [];
  let match;

  while ((match = matcher.exec(source)) !== null) {
    templates.push({ id: match[1], folder: match[2] });
  }

  return templates;
}

function buildRedirectPage(folder) {
  const target = `/templates/${folder}/index.html`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Opening template...</title>
    <meta http-equiv="refresh" content="0;url=${target}" />
    <script>
      window.location.replace("${target}" + window.location.search + window.location.hash);
    </script>
  </head>
  <body>
    <p>Opening template...</p>
  </body>
</html>
`;
}

async function main() {
  const source = await fs.readFile(templatesSourcePath, "utf8");
  const templates = extractTemplates(source);
  if (templates.length === 0) {
    throw new Error("No templates found in src/templates.ts");
  }

  await fs.mkdir(publicTemplatesDir, { recursive: true });

  await Promise.all(
    templates.map(async ({ id, folder }) => {
      const targetPath = path.join(publicTemplatesDir, `${id}.html`);
      await fs.writeFile(targetPath, buildRedirectPage(folder), "utf8");
    }),
  );

  console.log(`Generated ${templates.length} clean-URL template pages.`);
}

main().catch((error) => {
  console.error("Failed generating clean-URL template pages.", error);
  process.exitCode = 1;
});
