import designMeta from "./design-meta.js";

function injectOpenGraphTags(html, meta) {
  if (!meta) return html;
  
  let modified = html;
  
  // Replace og:title & twitter:title
  modified = modified.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${meta.title}">`);
  modified = modified.replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${meta.title}">`);
  
  // Replace og:description & twitter:description
  modified = modified.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${meta.desc}">`);
  modified = modified.replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${meta.desc}">`);
  
  // Replace og:image & twitter:image
  modified = modified.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${meta.imageUrl}">`);
  modified = modified.replace(/<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${meta.imageUrl}">`);
  
  // Replace og:url & twitter:url
  modified = modified.replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${meta.url}">`);
  modified = modified.replace(/<meta name="twitter:url" content="[^"]*">/i, `<meta name="twitter:url" content="${meta.url}">`);
  
  // Replace og:image:alt
  modified = modified.replace(/<meta property="og:image:alt" content="[^"]*">/i, `<meta property="og:image:alt" content="${meta.title}">`);
  
  // Replace document <title>
  modified = modified.replace(/<title>[^<]*<\/title>/i, `<title>${meta.name} | Interactive Digital Wedding Invitation – InviteStory</title>`);
  
  return modified;
}

export const config = {
  matcher: ["/", "/index.html", "/designs"]
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const designKey = (url.searchParams.get("design") || url.searchParams.get("preview") || url.searchParams.get("id") || "").toLowerCase().trim();

  // If no design query or design not in meta, pass through to static index.html
  if (!designKey || !designMeta[designKey]) {
    return;
  }

  // Prevent infinite loops if request was already from middleware
  if (request.headers.get("x-from-og-middleware") === "1") {
    return;
  }

  try {
    // Fetch index.html
    const originUrl = new URL("/index.html", request.url);
    const originRes = await fetch(originUrl, {
      headers: {
        "x-from-og-middleware": "1"
      }
    });

    if (!originRes.ok) {
      return;
    }

    const html = await originRes.text();
    const meta = designMeta[designKey];
    const modifiedHtml = injectOpenGraphTags(html, meta);

    return new Response(modifiedHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, stale-while-revalidate=86400"
      }
    });
  } catch (err) {
    // Fall back to normal static handling
    return;
  }
}
