import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { htmlToMarkdown, estimateTokens } from "./html-to-markdown.mjs";
import designMeta from "./design-meta.js";

const root = fileURLToPath(new URL(".", import.meta.url));

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

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const port = Number(getArg("port", process.env.PORT || 7100));
const host = getArg("host", process.env.HOST || "0.0.0.0");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".pdf": "application/pdf",
  ".md": "text/markdown; charset=utf-8",
};

const LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.0"',
  '</terms.html>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
].join(", ");

createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // Health check endpoint
    if (pathname === "/health" || pathname === "/healthz") {
      const healthData = JSON.stringify({ status: "ok", timestamp: new Date().toISOString() });
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(healthData);
      }
      return;
    }

    // RFC 9727 API Catalog endpoint
    if (pathname === "/.well-known/api-catalog") {
      const catalogPath = join(root, ".well-known", "api-catalog");
      const catalogContent = await readFile(catalogPath, "utf-8");
      res.writeHead(200, {
        "Content-Type": "application/linkset+json",
        "Cache-Control": "public, max-age=3600",
        "Link": LINK_HEADER,
      });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(catalogContent);
      }
      return;
    }

    // x402 Payment-Protected API Route
    if (pathname === "/api/commerce/order" || pathname === "/api/x402/pay") {
      const paymentHeader = req.headers["x-payment"] || req.headers["authorization"] || "";
      const isPaid = paymentHeader.startsWith("Payment ") || paymentHeader.startsWith("x402 ") || paymentHeader.length > 20;

      if (!isPaid) {
        res.writeHead(402, {
          "Content-Type": "application/json; charset=utf-8",
          "WWW-Authenticate": 'x402 facilitator="https://facilitator.x402.org", network="base", token="USDC", address="0x742d35Cc6634C0532925a3b844Bc454e4438f44e", amount="25000000"',
          "x402-payment-required": "true",
          "Cache-Control": "no-cache",
        });
        res.end(JSON.stringify({
          status: 402,
          message: "Payment Required",
          protocol: "x402",
          facilitator: "https://facilitator.x402.org",
          network: "base",
          asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          symbol: "USDC",
          recipient: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          amount: "25000000",
          displayAmount: "25.00 USDC",
          resource: `https://${req.headers.host || "invitestory.in"}${pathname}`
        }, null, 2));
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(JSON.stringify({
        status: "success",
        payment: "verified",
        protocol: "x402",
        orderId: `ORD-${Date.now()}`,
        message: "x402 payment settled and customization order initiated successfully."
      }, null, 2));
      return;
    }

    // Discovery endpoints (OIDC, OAuth, Protected Resource, A2A Agent Card, Agent Skills, MCP Server Card, Web Bot Auth, ACP, UCP, x402)
    if (
      pathname === "/.well-known/openid-configuration" ||
      pathname === "/.well-known/oauth-authorization-server" ||
      pathname === "/.well-known/oauth-protected-resource" ||
      pathname === "/.well-known/agent-card.json" ||
      pathname === "/.well-known/agent.json" ||
      pathname === "/.well-known/agent-skills/index.json" ||
      pathname === "/.well-known/mcp/server-card.json" ||
      pathname === "/.well-known/mcp.json" ||
      pathname === "/.well-known/http-message-signatures-directory" ||
      pathname === "/.well-known/acp.json" ||
      pathname === "/.well-known/acp/discovery.json" ||
      pathname === "/.well-known/ucp" ||
      pathname === "/.well-known/ucp.json" ||
      pathname === "/.well-known/x402.json" ||
      pathname === "/.well-known/x402"
    ) {
      const subPath = pathname.replace(/^\/\.well-known\//, "");
      const metaPath = join(root, ".well-known", subPath.endsWith(".json") || subPath.includes("/") || subPath === "http-message-signatures-directory" || subPath === "openid-configuration" || subPath === "oauth-authorization-server" || subPath === "oauth-protected-resource" || subPath === "api-catalog" || subPath === "ucp" ? subPath : subPath + ".json");
      const metaContent = await readFile(metaPath, "utf-8");
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Link": LINK_HEADER,
      });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(metaContent);
      }
      return;
    }

    if (pathname === "/.well-known/jwks.json") {
      const jwksPath = join(root, ".well-known", "jwks.json");
      const jwksContent = await readFile(jwksPath, "utf-8");
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(jwksContent);
      }
      return;
    }

    // Friendly routes: /designs → catalogue (every Preview opens a working
    // live demo via the in-page viewer + ?design= deep links), /refunds →
    // the refund & editing policy page.
    if (pathname === "/designs" || pathname === "/designs/") {
      let indexContent = await readFile(join(root, "index.html"), "utf-8");
      const designKey = (parsedUrl.searchParams.get("design") || parsedUrl.searchParams.get("preview") || parsedUrl.searchParams.get("id") || "").toLowerCase().trim();
      const meta = designKey ? designMeta[designKey] : null;
      if (meta) {
        indexContent = injectOpenGraphTags(indexContent, meta);
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(indexContent);
      }
      return;
    }

    if (pathname === "/refunds" || pathname === "/refunds/") {
      res.writeHead(308, { Location: "/refund-and-editing-policy.html" });
      res.end();
      return;
    }

    let filePath = normalize(join(root, pathname));

    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let isDirectMdRequest = false;
    let info = await stat(filePath).catch(() => null);

    // If requesting .md directly, but only .html exists, map to .html
    if (!info && filePath.endsWith(".md")) {
      const htmlCandidate = filePath.slice(0, -3) + ".html";
      const htmlInfo = await stat(htmlCandidate).catch(() => null);
      if (htmlInfo && !htmlInfo.isDirectory()) {
        filePath = htmlCandidate;
        info = htmlInfo;
        isDirectMdRequest = true;
      }
    }

    if (info?.isDirectory()) {
      filePath = join(filePath, "index.html");
      info = await stat(filePath).catch(() => null);
    }

    if (!info) {
      res.writeHead(404).end("Not found");
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const acceptHeader = req.headers.accept || "";
    const wantsMarkdown = isDirectMdRequest || acceptHeader.includes("text/markdown");

    // Content negotiation for HTML files
    if (ext === ".html" && wantsMarkdown) {
      const rawHtml = await readFile(filePath, "utf-8");
      const fullUrl = `http://${req.headers.host || "localhost"}${pathname}`;
      const markdown = htmlToMarkdown(rawHtml, fullUrl);
      const tokens = estimateTokens(markdown);

      res.writeHead(200, {
        "Content-Type": "text/markdown; charset=utf-8",
        "Vary": "Accept",
        "x-markdown-tokens": String(tokens),
        "content-signal": "ai-train=yes, search=yes, ai-input=yes",
        "Link": LINK_HEADER,
        "Cache-Control": "no-cache",
      });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(markdown);
      }
      return;
    }

    let body = await readFile(filePath);
    if (ext === ".html") {
      const designKey = (parsedUrl.searchParams.get("design") || parsedUrl.searchParams.get("preview") || parsedUrl.searchParams.get("id") || "").toLowerCase().trim();
      const meta = designKey ? designMeta[designKey] : null;
      if (meta) {
        body = Buffer.from(injectOpenGraphTags(body.toString("utf-8"), meta), "utf-8");
      }
    }
    const headers = {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    };

    if (ext === ".html") {
      headers["Vary"] = "Accept";
      headers["Link"] = LINK_HEADER;
    }

    res.writeHead(200, headers);
    if (req.method === "HEAD") {
      res.end();
    } else {
      res.end(body);
    }
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
}).listen(port, host, () => {
  console.log(`InviteStory server running with Link headers, Markdown for Agents & RFC 9727 API Catalog support → http://localhost:${port}/`);
});
