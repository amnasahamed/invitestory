export const WHATSAPP_NUMBER = "918281583882";

export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=` +
  encodeURIComponent("Hi InviteStory, I'd like to customise a template.");

export const INSTAGRAM_URL = "https://www.instagram.com/invitestory.in/";

/** Flat price — every template. */
export const PRICE_INR = 1999;
export const PRICE_USD = 20;
export const PRICE_LABEL = `₹${PRICE_INR.toLocaleString("en-IN")} / $${PRICE_USD}`;
export const PRICE_PER_TEMPLATE = `${PRICE_LABEL} per template`;

/** Prefill WhatsApp with the chosen template name + live preview link. */
export function whatsappForTemplate(templateName: string, previewUrl: string) {
  const text =
    `Hi InviteStory, I'd like to make "${templateName}" mine.\n\n` +
    `Template preview: ${previewUrl}\n\n` +
    `My song YouTube link (optional): `;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Absolute URL to a template's index.html for sharing in WhatsApp. */
export function absoluteTemplateUrl(folder: string, base = "./") {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const root = base.replace(/\/?$/, "/");
  const path = `${root}templates/${folder}/index.html`.replace(/^\.\//, "/");
  return `${origin}${path}`;
}
