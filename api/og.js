import fs from "node:fs";
import path from "node:path";
import designMeta from "../design-meta.js";

function injectOpenGraphTags(html, meta) {
  if (!meta) return html;
  let modified = html;
  modified = modified.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${meta.title}">`);
  modified = modified.replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${meta.title}">`);
  modified = modified.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${meta.desc}">`);
  modified = modified.replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${meta.desc}">`);
  modified = modified.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${meta.imageUrl}">`);
  modified = modified.replace(/<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${meta.imageUrl}">`);
  modified = modified.replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${meta.url}">`);
  modified = modified.replace(/<meta name="twitter:url" content="[^"]*">/i, `<meta name="twitter:url" content="${meta.url}">`);
  modified = modified.replace(/<meta property="og:image:alt" content="[^"]*">/i, `<meta property="og:image:alt" content="${meta.title}">`);
  modified = modified.replace(/<title>[^<]*<\/title>/i, `<title>${meta.name} | Interactive Digital Wedding Invitation – InviteStory</title>`);
  return modified;
}

export async function GET(request) {
  const url = new URL(request.url, "https://www.invitestory.in");
  const designKey = (url.searchParams.get("design") || url.searchParams.get("preview") || url.searchParams.get("id") || "").toLowerCase().trim();

  const filePath = path.join(process.cwd(), "index.html");
  let html = fs.readFileSync(filePath, "utf-8");

  if (designKey && designMeta[designKey]) {
    html = injectOpenGraphTags(html, designMeta[designKey]);
  }

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "max-age=0, no-cache",
      "Vary": "Accept-Encoding, Query"
    }
  });
}

export default async function handler(req, res) {
  if (!res || typeof res.status !== "function") {
    return GET(req);
  }
  const url = new URL(req.url, `https://${req.headers["host"] || "www.invitestory.in"}`);
  const designKey = (url.searchParams.get("design") || url.searchParams.get("preview") || url.searchParams.get("id") || (req.query && (req.query.design || req.query.preview || req.query.id)) || "").toLowerCase().trim();

  const filePath = path.join(process.cwd(), "index.html");
  let html = fs.readFileSync(filePath, "utf-8");

  if (designKey && designMeta[designKey]) {
    html = injectOpenGraphTags(html, designMeta[designKey]);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.setHeader("CDN-Cache-Control", "max-age=0, no-cache");
  res.setHeader("Vary", "Accept-Encoding, Query");
  res.status(200).send(html);
}
