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
  
  // Replace og:image & twitter:image with the specific template's preview card image
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

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/digital-wedding-invitations") {
        url.pathname = "/digital-wedding-invitations.html";
        const newReq = new Request(url.toString(), request);
        return env && env.ASSETS && typeof env.ASSETS.fetch === "function"
          ? env.ASSETS.fetch(newReq)
          : fetch(newReq);
      }

      if (url.pathname === "/dearly" || url.pathname === "/dearly/") {
        url.pathname = "/dearly.html";
        const newReq = new Request(url.toString(), request);
        return env && env.ASSETS && typeof env.ASSETS.fetch === "function"
          ? env.ASSETS.fetch(newReq)
          : fetch(newReq);
      }

      const designKey = (url.searchParams.get("design") || url.searchParams.get("preview") || url.searchParams.get("id") || "").toLowerCase().trim();

      // Fetch from ASSETS if available, otherwise fetch from origin
      let response;
      if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
        response = await env.ASSETS.fetch(request);
      } else {
        response = await fetch(request);
      }

      // If not HTML or no design key, return original response
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") || !designKey) {
        return response;
      }

      const meta = designMeta[designKey];
      if (!meta) {
        return response;
      }

      const text = await response.text();
      const modifiedHtml = injectOpenGraphTags(text, meta);

      const headers = new Headers(response.headers);
      headers.set("content-type", "text/html; charset=utf-8");
      headers.set("cache-control", "public, max-age=300, stale-while-revalidate=86400");

      return new Response(modifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (err) {
      // Safe fallback to default fetch if anything fails
      return fetch(request);
    }
  }
};
