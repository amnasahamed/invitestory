import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";

const sourceRoot = resolve(process.argv[2] || "../new designs - production/invitations");
const projectRoot = resolve(import.meta.dirname, "..");
const previewRoot = join(projectRoot, "previews");
const invitationNames = ["amber", "bahaar", "bloom", "exotic", "mithril", "olive", "ruby", "zareen"];
const textExtensions = new Set([".html", ".css", ".js", ".mjs", ".svg"]);
const assetExtensions = /\.(?:woff2?|otf|ttf|png|jpe?g|webp|avif|svg|mp4|webm|mp3|wav)$/i;
// Legacy renderers assemble these paths and the media adapters upgrade them
// at runtime. Literal string searches alone cannot discover these dependencies.
const generatedAssets = {
  bloom: ['cluster', 'garland-left', 'garland-band', 'sprig', 'divider', 'extra2', 'extra3', 'extra4', 'flower', 'petal0', 'petal1', 'petal2', 'petal3', 'petal4', 'petal5', 'petal6'],
  olive: ['banquet', 'chandelier', 'greenery', 'urn', 'sprig', 'divider']
};

function listFiles(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name !== ".DS_Store")
    .map(entry => join(entry.parentPath || entry.path, entry.name));
}

function runtimeFiles(root) {
  const normalize = file => relative(root, file).split(sep).join("/");
  const files = new Map(listFiles(root).map(file => [normalize(file), file]));
  const name = root.split(sep).at(-1);
  const queue = ["index.html", ...(generatedAssets[name] || []).map(asset => `assets/images/${asset}-v2.webp`)];
  if (name === 'zareen') queue.push(...['ornaments', 'countdown', 'floral-ornament', 'doves', 'ornament-closing'].map(asset => `assets/images/${asset}.webp`));
  const used = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (used.has(current) || !files.has(current)) continue;
    used.add(current);
    if (!textExtensions.has(extname(current).toLowerCase())) continue;

    const source = readFileSync(files.get(current), "utf8");
    const base = dirname(current).split(sep).join("/");
    for (const candidate of files.keys()) {
      if (used.has(candidate)) continue;
      const basename = candidate.slice(candidate.lastIndexOf("/") + 1);
      const fromBase = relative(base, candidate).split(sep).join("/");
      const referenced = source.includes(candidate)
        || source.includes(fromBase)
        || (assetExtensions.test(candidate) && source.includes(basename));
      if (referenced) queue.push(candidate);
    }
  }
  return { files, used };
}

if (!existsSync(sourceRoot)) throw new Error(`Invitation source folder not found: ${sourceRoot}`);
mkdirSync(previewRoot, { recursive: true });
cpSync(join(sourceRoot, "collection-branding.css"), join(previewRoot, "collection-branding.css"));

let sourceBytes = 0;
let runtimeBytes = 0;
for (const name of invitationNames) {
  const source = join(sourceRoot, name);
  const target = join(previewRoot, name);
  const { files, used } = runtimeFiles(source);
  sourceBytes += [...files.values()].reduce((total, file) => total + statSync(file).size, 0);
  runtimeBytes += [...used].reduce((total, file) => total + statSync(files.get(file)).size, 0);

  if (existsSync(target)) rmSync(target, { recursive: true });
  for (const file of used) {
    const destination = join(target, file);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(files.get(file), destination);
  }
  console.log(`${name}: copied ${used.size} runtime files`);
}

const savedMB = (sourceBytes - runtimeBytes) / 1024 / 1024;
console.log(`Removed ${savedMB.toFixed(1)} MB of unused source, backup, and QA files from the production copies.`);
