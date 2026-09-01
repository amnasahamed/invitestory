// HTML to Markdown converter for Agent Markdown Content Negotiation

export function estimateTokens(text) {
  if (!text) return 0;
  // Standard token estimate: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
}

export function htmlToMarkdown(html, baseUrl = "") {
  if (!html || typeof html !== "string") return "";

  // 1. Extract metadata for frontmatter
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "";

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i) ||
                    html.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i);
  let description = descMatch ? decodeHtmlEntities(descMatch[1].trim()) : "";

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["']/i) ||
                        html.match(/<meta\s+property=["']og:url["']\s+content=["']([\s\S]*?)["']/i);
  let url = canonicalMatch ? canonicalMatch[1].trim() : baseUrl;

  // 2. Remove script, style, noscript, svg, and comment tags
  let text = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "");

  // Remove nav bars or specific noise if appropriate, but keep main content
  // Preserve structural tags by converting to markdown

  // Extract body if available
  const bodyMatch = text.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : text;

  // Process Headings
  content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, c) => `\n\n# ${cleanInline(c)}\n\n`);
  content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `\n\n## ${cleanInline(c)}\n\n`);
  content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `\n\n### ${cleanInline(c)}\n\n`);
  content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, c) => `\n\n#### ${cleanInline(c)}\n\n`);
  content = content.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, c) => `\n\n##### ${cleanInline(c)}\n\n`);
  content = content.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, c) => `\n\n###### ${cleanInline(c)}\n\n`);

  // Blockquotes
  content = content.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => {
    const lines = cleanInline(c).split("\n").map(l => `> ${l}`).join("\n");
    return `\n\n${lines}\n\n`;
  });

  // Pre / Code blocks
  content = content.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, c) => `\n\n\`\`\`\n${decodeHtmlEntities(c).trim()}\n\`\`\`\n\n`);
  content = content.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, c) => `\n\n\`\`\`\n${decodeHtmlEntities(c).trim()}\n\`\`\`\n\n`);
  content = content.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => ` \`${decodeHtmlEntities(c).trim()}\` `);

  // Unordered lists & ordered lists
  content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `\n* ${cleanInline(c)}`);
  content = content.replace(/<\/(ul|ol)>/gi, "\n\n");

  // Paragraphs & Divs & Breaks
  content = content.replace(/<br\s*\/?>/gi, "\n");
  content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => `\n\n${cleanInline(c)}\n\n`);
  content = content.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");

  // Formatting
  content = content.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, c) => ` **${cleanInline(c)}** `);
  content = content.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, c) => ` *${cleanInline(c)}* `);

  // Images
  content = content.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, src, alt) => `![${alt}](${src})`);
  content = content.replace(/<img\s+[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, (_, alt, src) => `![${alt}](${src})`);
  content = content.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, (_, src) => `![](${src})`);

  // Links
  content = content.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const cleanText = cleanInline(text).trim();
    if (!cleanText) return "";
    return `[${cleanText}](${href})`;
  });

  // Strip all remaining HTML tags
  content = content.replace(/<[^>]+>/g, " ");

  // Decode entities
  content = decodeHtmlEntities(content);

  // Normalize whitespace
  content = content
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Construct frontmatter
  let frontmatter = "";
  if (title || description || url) {
    frontmatter = "---\n";
    if (title) frontmatter += `title: "${title.replace(/"/g, '\\"')}"\n`;
    if (description) frontmatter += `description: "${description.replace(/"/g, '\\"')}"\n`;
    if (url) frontmatter += `url: "${url}"\n`;
    frontmatter += "---\n\n";
  }

  return frontmatter + content;
}

function cleanInline(str) {
  if (!str) return "";
  return str
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&mdash;": "—",
    "&ndash;": "–",
    "&bull;": "•",
    "&hellip;": "…",
    "&larr;": "←",
    "&rarr;": "→",
    "&uarr;": "↑",
    "&darr;": "↓",
    "&#x27;": "'",
    "&#x2F;": "/",
    "&#32;": " ",
  };

  return str
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&[a-zA-Z]+;/g, match => entities[match] || match);
}
