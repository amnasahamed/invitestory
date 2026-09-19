/**
 * InviteStory Simple Catalogue Directory
 * Features: INR/USD Currency Toggle, Accordion Detail Expanders, Live Add-ons Price Calculator, and WhatsApp Order URL Generators.
 */

// --- PROMOTION CONFIGURATION ---
window.RAZORPAY_KEY_ID = "rzp_live_TPCjiGiPIeo7SN";
window.PAYPAL_CLIENT_ID = "BAAXdw4bek4C9gmaofxymnJjm8cpkjT61bXsJ3KzdtDpW14OKQd_ig8jKgi0I45orPLAZ64NvkBq2Qpu2M";

// --- POST-PAYMENT NOTIFICATIONS (Razorpay webhook → notify yourself) ---
// This is a static site, so Razorpay cannot POST to it. To get notified on
// every payment with package + payment id, set this up once in the Razorpay
// Dashboard → Settings → Webhooks → Add webhook for `payment.captured`:
//   Option A (no code): webhook URL = a Zapier/Make webhook → sends you an
//     email + WhatsApp (via Interakt/WATI/Gupshup) with payment + notes.
//   Option B (code): deploy one serverless endpoint that verifies the webhook
//     signature (RAZORPAY_WEBHOOK_SECRET) and forwards package/payment id to
//     your email + WhatsApp. The `notes` we send (package, design_name,
//     express_12h) arrive in the webhook payload automatically.
window.RAZORPAY_WEBHOOK_SECRET = ""; // set only on a server, never in frontend code

const PROMO_CONFIG = {
  active: false,
  name: "Independence Day Special",
  promoPriceINR: 815,
  promoPriceUSD: 10,
  // Fixed campaign end deadline: August 15, 2026 at 23:59:59 IST
  endsAt: new Date("2026-08-15T23:59:59+05:30").getTime()
};

function getItemPrices(item) {
  if (PROMO_CONFIG.active) {
    return {
      priceINR: PROMO_CONFIG.promoPriceINR,
      priceUSD: PROMO_CONFIG.promoPriceUSD,
      originalPriceINR: item.originalPriceINR || (item.tier === 1 ? 1499 : item.tier === 2 ? 2499 : 3499),
      originalPriceUSD: item.originalPriceUSD || (item.tier === 1 ? 18 : item.tier === 2 ? 30 : 42)
    };
  }
  return {
    priceINR: item.priceINR,
    priceUSD: item.priceUSD,
    originalPriceINR: item.originalPriceINR,
    originalPriceUSD: item.originalPriceUSD
  };
}

// --- UTM & GOOGLE ADS CAMPAIGN TRACKER ---
/**
 * Safely retrieves and persists UTM campaign parameters & GCLID from the URL into localStorage
 */
function getUtmCampaignParams() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "gclid"];
    keys.forEach(key => {
      if (urlParams.has(key)) {
        localStorage.setItem(key, urlParams.get(key));
      }
    });
    return {
      utmSource: localStorage.getItem("utm_source") || "",
      utmMedium: localStorage.getItem("utm_medium") || "",
      utmCampaign: localStorage.getItem("utm_campaign") || "",
      gclid: localStorage.getItem("gclid") || ""
    };
  } catch (err) {
    return { utmSource: "", utmMedium: "", utmCampaign: "", gclid: "" };
  }
}
// Run on load
getUtmCampaignParams();

// --- META PIXEL & GOOGLE ADS EVENT TRACKER ---
/**
 * Safe helper for sending Meta Pixel & Google Ads standard events (PageView, ViewContent, InitiateCheckout, Lead, Purchase)
 * @param {string} eventName - Name of the event to track
 * @param {Object} [params] - Optional event parameters (e.g. content_name, value, currency)
 */
function trackMetaEvent(eventName, params = {}) {
  try {
    // 1. Meta Pixel
    if (typeof window.fbq === "function") {
      if (params && Object.keys(params).length > 0) {
        window.fbq("track", eventName, params);
      } else {
        window.fbq("track", eventName);
      }
    }
    // 2. Google Analytics 4 & Google Ads Event
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
      
      // Standard Google Ads Conversion Event trigger for high-intent conversions
      if (eventName === "Lead" || eventName === "InitiateCheckout" || eventName === "Purchase") {
        const conversionLabel = window.GOOGLE_ADS_CONVERSION_LABEL || "";
        const targetSendTo = window.GOOGLE_ADS_ID && conversionLabel 
          ? `${window.GOOGLE_ADS_ID}/${conversionLabel}` 
          : window.GOOGLE_ADS_ID || "";
          
        const adsParams = {
          value: params.value || 999,
          currency: params.currency || "INR",
          event_category: params.content_category || "Google Ads Lead",
          event_label: params.content_name || eventName
        };
        if (targetSendTo) adsParams.send_to = targetSendTo;
        
        window.gtag("event", "conversion", adsParams);
      }
    }
  } catch (err) {
    console.warn("Analytics tracking warning:", err);
  }
}

// --- 1. Template Database ---
const TEMPLATE_DATABASE = [
  // --- TIER 1: Classic & Traditional (₹999 / $15) ---
  {
    id: 1,
    name: "Marigold Bhavan",
    image: "assets/preview/1.png",
    tier: 1,
    priceINR: 999,
    priceUSD: 15,
    originalPriceINR: 999,
    originalPriceUSD: 15,
    demoUrl: "https://marigold-bhavan.invitestory.in/",
    style: "Classic Indian",
    accentColor: "#d58936",
    tags: ["traditional", "north-indian", "marigold", "our-picks"],
    desc: "Rustic olive & gold palette with classic Indian motifs. A familiar, welcoming entry into your traditional wedding celebration.",
    promise: "A wedding invitation that feels timeless, elegant, and familiar."
  },
  {
    id: 3,
    name: "Toran Telugu",
    image: "assets/preview/2.png",
    tier: 1,
    priceINR: 999,
    priceUSD: 15,
    originalPriceINR: 999,
    originalPriceUSD: 15,
    demoUrl: "https://toran-telugu.invitestory.in/",
    style: "Traditional Telugu",
    accentColor: "#558b2f",
    tags: ["traditional", "telugu", "south-indian", "banana-leaf", "our-picks"],
    desc: "Vibrant banana leaf accents and classic golden border details. Perfect for a traditional Telugu wedding.",
    promise: "Simple, elegant, and culturally rich."
  },
  {
    id: 5,
    name: "Shubha Vivaham",
    image: "assets/preview/3.png",
    tier: 1,
    priceINR: 999,
    priceUSD: 15,
    originalPriceINR: 999,
    originalPriceUSD: 15,
    demoUrl: "https://shubha-vivaham.invitestory.in/",
    style: "South Indian Muhurtham",
    accentColor: "#d84315",
    tags: ["traditional", "south-indian", "marigold"],
    desc: "Adorned with traditional marigold torans and bright brass lamp iconography, creating a classic South Indian sacred vibe.",
    promise: "Warm and inviting, just like an auspicious family blessing."
  },
  {
    id: 6,
    name: "Kalyana Mandapam",
    image: "assets/preview/4.png",
    tier: 1,
    priceINR: 999,
    priceUSD: 15,
    originalPriceINR: 999,
    originalPriceUSD: 15,
    demoUrl: "https://kalyana-mandapam.invitestory.in/",
    style: "Traditional Telugu",
    accentColor: "#c2185b",
    tags: ["traditional", "telugu", "south-indian", "mandapam", "our-picks"],
    desc: "Featuring a majestic traditional mandapam backdrop. Perfect for representing your wedding rituals with dignity and color.",
    promise: "The sacred mandapam visual brought to digital life."
  },
  {
    id: 7,
    name: "Sage Parchment",
    image: "assets/preview/5.png",
    tier: 1,
    priceINR: 999,
    priceUSD: 15,
    originalPriceINR: 999,
    originalPriceUSD: 15,
    demoUrl: "https://sage-parchment.invitestory.in/",
    style: "Minimalist Modern",
    accentColor: "#7e8d85",
    tags: ["modern", "minimalist", "sage-green"],
    desc: "Minimalist sage green palette on an elegant textured parchment. For couples who value quiet elegance and neat design.",
    promise: "Clean, organic, and sophisticated modern aesthetic."
  },
  {
    id: 29,
    name: "Seashell Vows",
    image: "assets/preview/29.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://seashell-vows.invitestory.in/",
    style: "Goa Seaside Watercolor",
    accentColor: "#e07a5f",
    tags: ["modern", "beach", "watercolor", "floral"],
    desc: "Ivory watercolor paper texture featuring breezy Goa seaside aesthetics, bougainvillea accents, and coastal seashells.",
    promise: "Breezy seaside romance captured on textured watercolor paper."
  },

  // --- TIER 2: Premium & Illustrated (₹1,499 / $20) ---
  {
    id: 8,
    name: "Emerald Nikah",
    image: "assets/preview/6.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://emerald-nikah.invitestory.in/",
    style: "Islamic Garden",
    accentColor: "#004d40",
    tags: ["islamic", "nikah", "emerald", "floral"],
    desc: "Deep emerald background adorned with blooming roses, showcasing a serene Islamic garden motif for your Nikah.",
    promise: "A little journey through your story, painted in emerald."
  },
  {
    id: 9,
    name: "Noor-e-Zahra",
    image: "assets/preview/7.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://noor-e-zahra.invitestory.in/",
    style: "Islamic Nikah",
    accentColor: "#1a237e",
    tags: ["islamic", "nikah", "mandala", "royal"],
    desc: "Elegant moonlit mandala graphics in gold and deep sapphire blue, conveying peace, light, and luxury.",
    promise: "Let your guests experience your story before they experience the wedding."
  },
  {
    id: 10,
    name: "Royal Reception",
    image: "assets/preview/8.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://royal-reception.invitestory.in/",
    style: "Grand Walima",
    accentColor: "#311b92",
    tags: ["royal", "reception", "walima", "aurora"],
    desc: "Inspired by grand royal banquets beneath an aurora sky. Captivating animations highlight the couple's journey.",
    promise: "Deep starry aesthetics for a magical, grand celebration."
  },
  {
    id: 11,
    name: "Kerala Sands",
    image: "assets/preview/9.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://kerala-sands.invitestory.in/",
    style: "Coastal Kerala",
    accentColor: "#00796b",
    tags: ["traditional", "south-indian", "kerala", "coastal"],
    desc: "Elegantly blends coastal sands, traditional temples, coconut palms, and delicate jasmine flowers for Kerala couples.",
    promise: "Fragrant, serene, and deeply rooted in the coastal landscape."
  },
  {
    id: 12,
    name: "Meadow Nikah",
    image: "assets/preview/10.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://meadow-nikah.invitestory.in/",
    style: "Outdoor Garden Nikah",
    accentColor: "#2e7d32",
    tags: ["islamic", "nikah", "garden", "envelope"],
    desc: "A beautiful outdoor meadow aesthetic starting with a digital envelope reveal that opens up to reveal your Nikah details.",
    promise: "Interactive, fresh, and blooming with romance."
  },
  {
    id: 13,
    name: "Grand Line Voyage",
    image: "assets/preview/11.png",
    tier: 1,
    priceINR: 999,
    priceUSD: 15,
    originalPriceINR: 999,
    originalPriceUSD: 15,
    demoUrl: "https://grand-line-voyage.invitestory.in/",
    style: "Anime / One Piece",
    accentColor: "#0288d1",
    tags: ["quirky", "anime", "beach", "illustrated"],
    desc: "A custom anime-inspired pirate voyage beach template for adventurous couples who want to sail off to their next chapter.",
    promise: "A playful, custom, and deeply unique thematic invitation."
  },
  {
    id: 14,
    name: "Ghibli Selfie",
    image: "assets/preview/12.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://ghibli-selfie.invitestory.in/",
    style: "Watercolor Ghibli",
    accentColor: "#c5e1a5",
    tags: ["quirky", "ghibli", "illustrated", "watercolor"],
    desc: "Soft watercolor Ghibli-inspired backdrop with a selfie frame layout. Cozy, aesthetic, and incredibly sweet.",
    promise: "Capture the magic of an illustrated Ghibli world."
  },
  {
    id: 15,
    name: "Ghibli Portrait",
    image: "assets/preview/13.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://ghibli-portrait.invitestory.in/",
    style: "Watercolor Storybook",
    accentColor: "#81c784",
    tags: ["quirky", "ghibli", "illustrated", "watercolor", "timeline"],
    desc: "Watercolor layouts that trace the couple from childhood up to the moment they say 'I do'. Storytelling at its absolute finest.",
    promise: "A sentimental journey that will warm every guest's heart."
  },
  {
    id: 16,
    name: "Lake Pichola Royal",
    image: "assets/preview/14.png",
    tier: 1,
    priceINR: 999,
    priceUSD: 15,
    originalPriceINR: 999,
    originalPriceUSD: 15,
    demoUrl: "https://lake-pichola-royal.invitestory.in/",
    style: "Udaipur Royal",
    accentColor: "#795548",
    tags: ["royal", "rajasthani", "palace", "traditional"],
    desc: "Inspired by the Udaipur Lake Palace on Lake Pichola. Regal hues, gold outlines, and slow, gorgeous water reflections.",
    promise: "Royal elegance inspired by Rajasthan's heritage."
  },
  {
    id: 17,
    name: "Ivory Waltz",
    image: "assets/preview/15.png",
    tier: 1,
    priceINR: 999,
    priceUSD: 15,
    originalPriceINR: 999,
    originalPriceUSD: 15,
    demoUrl: "https://ivory-waltz.invitestory.in/",
    style: "Modern Neutral",
    accentColor: "#a1887f",
    tags: ["modern", "minimalist", "ivory", "parallax"],
    desc: "Creamy neutral linen textures, elegant serif typography, and sophisticated parallax. A chic, classy option.",
    promise: "An invitation that whispers luxury and modern style."
  },
  {
    id: 18,
    name: "Ever After Bloom",
    image: "assets/preview/16.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://ever-after-bloom.invitestory.in/",
    style: "Watercolor Garden",
    accentColor: "#f06292",
    tags: ["illustrated", "watercolor", "floral", "timeline", "our-picks"],
    desc: "A bright watercolor floral garden layout featuring a romantic storyline timeline of the couple's relationship milestones.",
    promise: "Vibrant, floral, and deeply romantic."
  },
  {
    id: 19,
    name: "Saga of Love",
    image: "assets/preview/17.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://saga-of-love.invitestory.in/",
    style: "Elegant Parchment",
    accentColor: "#b0bec5",
    tags: ["modern", "minimalist", "timeline", "parchment", "our-picks"],
    desc: "Clean minimal parchment layout with a beautiful 'Love Timeline' highlighting how the couple first met and fell in love.",
    promise: "For couples whose love story is their biggest highlight."
  },
  {
    id: 30,
    name: "Lantern Madurai",
    image: "assets/preview/30.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://lantern-madurai.invitestory.in/",
    style: "Madurai Temple Parallax",
    accentColor: "#6b8e23",
    tags: ["traditional", "south-indian", "lanterns", "parallax"],
    desc: "Madurai temple backdrop with floating lanterns, paper & olive palette, and smooth GSAP parallax animations.",
    promise: "Sacred temple serenity with floating golden lanterns."
  },
  {
    id: 31,
    name: "Lotus Leaf Bengaluru",
    image: "assets/preview/31.png",
    tier: 2,
    priceINR: 1499,
    priceUSD: 20,
    originalPriceINR: 1499,
    originalPriceUSD: 20,
    demoUrl: "https://lotus-leaf-bengaluru.invitestory.in/",
    style: "Botanical Sage Leaf",
    accentColor: "#4a7c59",
    tags: ["modern", "minimalist", "lotus", "sage-green", "floral"],
    desc: "Botanical sage and leaf green design featuring an animated lotus seal opener and delicate falling petals.",
    promise: "Botanical elegance with blooming lotus seal animation."
  },

  // --- TIER 3: Luxury & Cinematic (₹1,999 / $35) ---
  {
    id: 21,
    name: "Rajwada Royale – Alt",
    image: "assets/preview/18.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://rajwada-royale.invitestory.in/",
    style: "Royal Palace Door (Alt)",
    accentColor: "#880e4f",
    tags: ["royal", "cinematic", "palace", "opening-doors", "our-picks"],
    desc: "Alternative layout for the Rajwada template, optimizing custom couple photographs and maroon accents for grand entry.",
    promise: "Make your grand wedding announcement truly monumental."
  },
  {
    id: 22,
    name: "Rajmahal Palace",
    image: "assets/preview/19.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://rajmahal-palace.invitestory.in/",
    style: "Maroon Palace Reveal",
    accentColor: "#b71c1c",
    tags: ["royal", "cinematic", "palace", "opening-doors"],
    desc: "Rich maroon background with highly detailed golden arch reveals. Immersive and grand, showcasing deep traditional aesthetics.",
    promise: "Draped in heritage gold and royal velvet tones."
  },
  {
    id: 23,
    name: "Midnight Stargaze",
    image: "assets/preview/20.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://midnight-stargaze.invitestory.in/",
    style: "Navy & Gold Starlit Palace",
    accentColor: "#0d47a1",
    tags: ["royal", "cinematic", "starry", "palace"],
    desc: "Deep navy night sky with slowly twinkling stars, floating lanterns, and a regal gold palace courtyard background.",
    promise: "For a wedding card that feels as magical as a starry night."
  },
  {
    id: 24,
    name: "Petal Path Palace",
    image: "assets/preview/21.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://petal-path-palace.invitestory.in/",
    style: "5-Layer Parallax",
    accentColor: "#ad1457",
    tags: ["cinematic", "parallax", "floral", "palace"],
    desc: "Incredibly deep 3D-style parallax scroll. Red rose petals drift slowly down the screen as you scroll past palace halls.",
    promise: "An immersive sensory journey. The invitation they'll talk about."
  },
  {
    id: 25,
    name: "Lakeview Lanterns",
    image: "assets/preview/22.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://lakeview-lanterns.invitestory.in/",
    style: "Kerala Lakeside Cinematic",
    accentColor: "#00695c",
    tags: ["cinematic", "kerala", "south-indian", "lanterns"],
    desc: "A gorgeous lake backwaters setting at dusk. Glowing lanterns float down a river while a traditional houseboat drifts past.",
    promise: "Peaceful, cinematic, and absolutely breathtaking."
  },
  {
    id: 26,
    name: "Moonlit Lotus Barge",
    image: "assets/preview/23.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://moonlit-lotus-barge.invitestory.in/",
    style: "Udaipur Lotus Reveal",
    accentColor: "#ad1457",
    tags: ["royal", "cinematic", "lotus", "udaipur"],
    desc: "Starts with a closing lotus bud that blooms outward to reveal the wedding details against a glowing night-lit Lake Pichola.",
    promise: "A poetic, cinematic masterpiece."
  },
  {
    id: 27,
    name: "Ganesha Gopuram",
    image: "assets/preview/24.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://ganesha-gopuram.invitestory.in/",
    style: "Baby Ganesha Cinematic",
    accentColor: "#ff8f00",
    tags: ["traditional", "cinematic", "ganesha", "south-indian"],
    desc: "Starts with the tolling of temple bells and opening grand gopuram gates, revealing a blessing Ganesha icon and card events.",
    promise: "Start your sacred journey with divine cinematic grace."
  },
  {
    id: 28,
    name: "Wax Seal Royale",
    image: "assets/preview/25.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://wax-seal-royale.invitestory.in/",
    style: "Interactive Envelope Wax Seal",
    accentColor: "#4e342e",
    tags: ["cinematic", "envelope", "wax-seal", "minimalist", "our-picks"],
    desc: "A luxury envelope sealed with virtual golden wax. Click to break the seal and slide the elegant invite out of the screen.",
    promise: "A physical ritual, recreated flawlessly in the digital world."
  },
  {
    id: 32,
    name: "Diya Haveli",
    image: "assets/preview/32.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://diya-haveli.invitestory.in/",
    style: "Jaipur Haveli Diya",
    accentColor: "#c62828",
    tags: ["royal", "cinematic", "palace", "traditional", "our-picks"],
    desc: "Rich vermilion red and heritage gold palette with an interactive diya lighting ceremony revealing a regal Jaipur haveli.",
    promise: "Light the auspicious diya to unveil your royal celebration."
  },
  {
    id: 33,
    name: "Gilded Hall",
    image: "assets/preview/33.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://gilded-hall.invitestory.in/",
    style: "Golden Hall Cinematic",
    accentColor: "#c09559",
    tags: ["royal", "cinematic", "palace"],
    desc: "Golden hall luxury backdrop featuring a cinematic video opening animation and ambient light rain.",
    promise: "Grand golden halls and cinematic luxury storytelling."
  },
  {
    id: 34,
    name: "Slide to Shaadi",
    image: "assets/preview/34.png",
    tier: 3,
    priceINR: 1999,
    priceUSD: 35,
    originalPriceINR: 1999,
    originalPriceUSD: 35,
    demoUrl: "https://slide-to-shaadi.invitestory.in/",
    style: "Interactive Call & Lakeside",
    accentColor: "#f57c00",
    tags: ["quirky", "cinematic", "royal", "udaipur"],
    desc: "iPhone 'Slide to answer' call interface opening up into a romantic Udaipur lakeside golden hour view.",
    promise: "Slide to answer the call of a lifetime with lakeside golden hour magic."
  }
];

// --- 2. State Management ---
let currentCurrency = "INR"; // "INR" or "USD"
let activeTierFilter = 0; // 0: All, 1: Classic, 2: Premium, 3: Luxury
let activeTagFilter = "all";
let searchQuery = "";

// DOM Elements
const templatesGrid = document.getElementById("templates-grid");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const filterTagsContainer = document.getElementById("filter-tags");

// Tier radio group (glass-morphism) — maps tier id (0/1/2/3) to its input id
const TIER_RADIO_IDS = { 0: "glass-all", 1: "glass-classic", 2: "glass-premium", 3: "glass-luxury" };
const tierRadios = document.querySelectorAll("#tier-radio-group input[type=radio]");
const tierRadioByValue = {};
tierRadios.forEach(r => { tierRadioByValue[r.value] = r; });

// Per-tier base prices shown in the radio labels (currency-switchable)
const TIER_BASE_PRICE = {
  1: { inr: 999,  usd: 15 },
  2: { inr: 1499, usd: 20 },
  3: { inr: 1999, usd: 35 }
};

// Pricing Grid references (to update pricing currency symbols dynamically)
const pricingSection = document.querySelector(".pricing-section");

// Addon Prices definition
const ADDONS = {
  express: { name: "Express 12h Delivery", priceINR: 299, priceUSD: 4 },
  domain: { name: "Custom Domain (.in / .com)", priceINR: 999, priceUSD: 12 },
  lang: { name: "Extra Event Tab (e.g. Sangeet)", priceINR: 299, priceUSD: 4 }
};

// --- Package-level UPI-first checkout (Classic / Premium / Luxury) ---
const PACKAGE_NAMES = { 1: "Classic", 2: "Premium", 3: "Luxury" };

function packageName(tier) {
  return PACKAGE_NAMES[tier] || "Classic";
}

function packageBasePrice(tier) {
  const base = TIER_BASE_PRICE[tier] || TIER_BASE_PRICE[1];
  return currentCurrency === "INR" ? base.inr : base.usd;
}

function isExpressSelectedForPackage(tier) {
  const box = document.getElementById(`express-toggle-${tier}`);
  return !!(box && box.checked);
}

function packageTotal(tier) {
  let total = packageBasePrice(tier);
  if (isExpressSelectedForPackage(tier)) {
    total += currentCurrency === "INR" ? ADDONS.express.priceINR : ADDONS.express.priceUSD;
  }
  return total;
}

function packageAmountText(tier, total) {
  const val = (typeof total === "number") ? total : packageTotal(tier);
  return `${getCurrencySymbol()}${val.toLocaleString("en-IN")}`;
}

// --- Preview Modal state & DOM refs ---
// Dynamic first template array-index for each tier
const TIER_FIRST_INDEX = {
  1: TEMPLATE_DATABASE.findIndex(t => t.tier === 1),
  2: TEMPLATE_DATABASE.findIndex(t => t.tier === 2),
  3: TEMPLATE_DATABASE.findIndex(t => t.tier === 3)
};

// Automatically generate clean URL slugs for every template in database
TEMPLATE_DATABASE.forEach(item => {
  if (!item.slug) {
    item.slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
});

const previewState = { 
  currentIndex: -1, 
  lastFocusedElement: null,
  viewMode: "flat" // "3d" or "flat"
};

// --- Spring-Damped 3D Physics Engine (Heavy Solid Titanium Damping) ---
const PhonePhysics = {
  // Resting pose: elegant cinematic angle
  REST: { rotY: -9, rotX: 4.5, rotZ: -0.6, scale: 1, translateY: 0, opacity: 1 },
  // Entrance start pose: smooth glide
  ENTRANCE: { rotY: -18, rotX: 8, rotZ: -0.9, scale: 0.96, translateY: 18, opacity: 0.7 },
  // Responsiveness tracking factor
  LERP_FACTOR: 0.12,
  // Heavy solid damping factor (kills rubbery oscillation, settles authoritatively)
  DAMPING: 0.74,
  // Sleep threshold to stop animating when settled (saves CPU)
  EPSILON: 0.005,

  // Current interpolated values (what's rendered)
  current: { rotY: -9, rotX: 4.5, rotZ: -0.6, scale: 1, translateY: 0, opacity: 1 },
  // Target values (set by mouse/touch/gyro)
  target: { rotY: -9, rotX: 4.5, rotZ: -0.6, scale: 1, translateY: 0, opacity: 1 },
  // Velocity for overshoot damping
  velocity: { rotY: 0, rotX: 0, rotZ: 0, scale: 0, translateY: 0, opacity: 0 },

  // Glare layer targets (each layer responds at different speed)
  glare: {
    current: { highlightX: 0, highlightY: 0, rimX: 0, rimY: 0, ambientX: 0, ambientY: 0, highlightOp: 0.75, rimOp: 0.55, ambientOp: 0.5 },
    target:  { highlightX: 0, highlightY: 0, rimX: 0, rimY: 0, ambientX: 0, ambientY: 0, highlightOp: 0.75, rimOp: 0.55, ambientOp: 0.5 }
  },

  // Shadow targets
  shadow: {
    current: { x: 0, blur: 14, opacity: 1 },
    target:  { x: 0, blur: 14, opacity: 1 }
  },

  // rAF handle
  rafId: null,
  isRunning: false,
  // DOM element refs (cached on first start)
  els: {},
  // Reduced motion preference
  reducedMotion: false,
  // Low-power mobile & Android optimization flags
  isAndroid: typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent || ""),
  isMobile: typeof window !== "undefined" && (window.matchMedia("(max-width: 768px)").matches || (typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "")))
};

// Tag HTML root with .is-android or .is-mobile-device for high performance CSS rules
if (typeof document !== "undefined" && document.documentElement) {
  if (PhonePhysics.isAndroid) document.documentElement.classList.add("is-android");
  if (PhonePhysics.isMobile) document.documentElement.classList.add("is-mobile-device");
}

const previewModal      = document.getElementById("preview-modal");
const previewModalTitle = document.getElementById("preview-modal-title");
const previewModalTag   = document.querySelector(".preview-modal-style-tag");
const previewIframe     = document.getElementById("preview-modal-iframe");
const previewIframeWrap = document.getElementById("preview-modal-iframe-wrap");
const previewLoader     = document.getElementById("preview-modal-loader");
const previewTierTabs   = document.querySelectorAll(".preview-tier-tab");
const previewPrevBtn    = document.getElementById("preview-prev-btn");
const previewNextBtn    = document.getElementById("preview-next-btn");
const previewHomeBtn    = document.getElementById("preview-home-btn");
const previewBuyBtn     = document.getElementById("preview-buy-btn");
const previewAmbientGlow   = document.getElementById("preview-modal-ambient-glow");
const previewModalPrice    = document.getElementById("preview-modal-price");
const previewModalOrigPrice= document.getElementById("preview-modal-orig-price");
const previewFullscreenBtn = document.getElementById("preview-fullscreen-btn");
const previewCounterBadge  = document.getElementById("preview-counter-badge");
const previewSidePrev      = document.getElementById("preview-side-prev");
const previewSideNext      = document.getElementById("preview-side-next");
const previewPatternCanvas = document.getElementById("preview-pattern-canvas");

// --- Helper Functions ---
function getCurrencySymbol() {
  return currentCurrency === "INR" ? "₹" : "$";
}

function formatPrice(valINR, valUSD) {
  const sym = getCurrencySymbol();
  const amt = currentCurrency === "INR" ? valINR : valUSD;
  return `${sym}${amt.toLocaleString("en-IN")}`;
}

function hexToRgba(hex, alpha = 0.4) {
  if (!hex || !hex.startsWith("#")) return `rgba(192, 149, 89, ${alpha})`;
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return `rgba(192, 149, 89, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function tierEmoji(tier) {
  return tier === 1 ? "🌿" : tier === 2 ? "💎" : "👑";
}

// --- Distinct Luxury Pattern Engine for Preview Stage ---
const LUXURY_PATTERNS = {
  jali: (color) => ({
    size: "60px 60px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><path d='M30 0 L60 30 L30 60 L0 30 Z M30 10 C38 18 42 22 50 30 C42 38 38 42 30 50 C22 42 18 38 10 30 C18 22 22 18 30 10 Z' fill='none' stroke='${color}' stroke-width='1.2' stroke-opacity='0.4'/><circle cx='30' cy='30' r='3' fill='${color}' fill-opacity='0.45'/></svg>`
  }),
  kolam: (color) => ({
    size: "70px 70px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'><g fill='none' stroke='${color}' stroke-width='1.2' stroke-opacity='0.4'><path d='M35 5 Q50 20 65 35 Q50 50 35 65 Q20 50 5 35 Q20 20 35 5 Z'/><circle cx='35' cy='35' r='14'/><circle cx='35' cy='35' r='3.5' fill='${color}' fill-opacity='0.45'/><path d='M0 35 Q17.5 17.5 35 35 Q17.5 52.5 0 35 Z M70 35 Q52.5 17.5 35 35 Q52.5 52.5 70 35 Z'/></g></svg>`
  }),
  mandala: (color) => ({
    size: "80px 80px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='${color}' stroke-width='1.1' stroke-opacity='0.4'><circle cx='40' cy='40' r='24'/><circle cx='40' cy='40' r='12'/><circle cx='40' cy='40' r='3' fill='${color}' fill-opacity='0.4'/><path d='M40 0 L40 80 M0 40 L80 40 M12 12 L68 68 M12 68 L68 12'/><path d='M40 16 Q48 28 40 40 Q32 28 40 16 Z M40 40 Q48 52 40 64 Q32 52 40 40 Z M16 40 Q28 48 40 40 Q28 32 16 40 Z M40 40 Q52 48 64 40 Q52 32 40 40 Z'/></g></svg>`
  }),
  damask: (color) => ({
    size: "74px 74px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='74' height='74' viewBox='0 0 74 74'><g fill='none' stroke='${color}' stroke-width='1.2' stroke-opacity='0.4'><path d='M37 10 C45 25 55 25 55 35 C55 45 42 55 37 65 C32 55 19 45 19 35 C19 25 29 25 37 10 Z'/><path d='M37 25 C42 32 46 35 46 40 C46 45 40 50 37 54 C34 50 28 45 28 40 C28 35 32 32 37 25 Z'/><circle cx='37' cy='37' r='3' fill='${color}' fill-opacity='0.4'/></g></svg>`
  }),
  arabesque: (color) => ({
    size: "64px 64px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><g fill='none' stroke='${color}' stroke-width='1.2' stroke-opacity='0.4'><path d='M32 0 L42 22 L64 32 L42 42 L32 64 L22 42 L0 32 L22 22 Z'/><path d='M0 0 L15 15 M64 0 L49 15 M64 64 L49 49 M0 64 L15 49'/><rect x='24' y='24' width='16' height='16' transform='rotate(45 32 32)'/></g></svg>`
  }),
  botanical: (color) => ({
    size: "68px 68px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='68' height='68' viewBox='0 0 68 68'><g fill='none' stroke='${color}' stroke-width='1.1' stroke-opacity='0.4'><path d='M10 58 Q34 34 58 10'/><path d='M25 43 Q32 37 34 44 Q28 48 25 43 Z M43 25 Q37 32 44 34 Q48 28 43 25 Z'/><path d='M15 53 Q22 47 24 54 Q18 58 15 53 Z M53 15 Q47 22 54 24 Q58 18 53 15 Z'/><circle cx='58' cy='10' r='2' fill='${color}' fill-opacity='0.5'/></g></svg>`
  }),
  waves: (color) => ({
    size: "60px 40px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40' viewBox='0 0 60 40'><g fill='none' stroke='${color}' stroke-width='1.2' stroke-opacity='0.4'><path d='M0 10 Q15 0 30 10 T60 10 M0 30 Q15 20 30 30 T60 30'/><path d='M-15 20 Q0 10 15 20 T45 20 T75 20' stroke-dasharray='3 3'/></g></svg>`
  }),
  artdeco: (color) => ({
    size: "64px 64px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><g fill='none' stroke='${color}' stroke-width='1.1' stroke-opacity='0.4'><path d='M32 0 L64 32 L32 64 L0 32 Z'/><path d='M32 10 L54 32 L32 54 L10 32 Z'/><path d='M32 20 L44 32 L32 44 L20 32 Z'/><line x1='0' y1='0' x2='64' y2='64'/><line x1='64' y1='0' x2='0' y2='64'/></g></svg>`
  }),
  celestial: (color) => ({
    size: "72px 72px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'><g fill='none' stroke='${color}' stroke-width='1.1' stroke-opacity='0.4'><path d='M36 12 Q36 28 20 28 Q36 28 36 44 Q36 28 52 28 Q36 28 36 12 Z' fill='${color}' fill-opacity='0.12'/><circle cx='36' cy='28' r='2.5' fill='${color}' fill-opacity='0.5'/><circle cx='10' cy='60' r='1.5' fill='${color}' fill-opacity='0.4'/><circle cx='62' cy='58' r='1.5' fill='${color}' fill-opacity='0.4'/><path d='M10 56 L10 64 M6 60 L14 60'/><path d='M62 54 L62 62 M58 58 L66 58'/></g></svg>`
  }),
  whimsical: (color) => ({
    size: "70px 70px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'><g fill='none' stroke='${color}' stroke-width='1.1' stroke-opacity='0.4'><path d='M15 55 C25 55 35 48 35 38 C35 28 25 24 20 28 C15 32 18 40 25 40 C30 40 33 36 33 32'/><circle cx='48' cy='20' r='3' fill='${color}' fill-opacity='0.35'/><path d='M48 20 L58 14 M48 20 L60 20 M48 20 L56 26'/><circle cx='54' cy='52' r='2' fill='${color}' fill-opacity='0.4'/><circle cx='12' cy='18' r='1.5' fill='${color}' fill-opacity='0.4'/></g></svg>`
  }),
  paisley: (color) => ({
    size: "76px 76px",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='76' height='76' viewBox='0 0 76 76'><g fill='none' stroke='${color}' stroke-width='1.2' stroke-opacity='0.4'><path d='M38 14 C48 14 56 24 56 36 C56 50 44 60 36 64 C32 66 26 62 24 56 C22 50 26 44 32 42 C38 40 40 34 38 28 C36 22 28 24 26 28'/><circle cx='38' cy='36' r='3' fill='${color}' fill-opacity='0.4'/></g></svg>`
  })
};

function getTemplatePatternKey(item) {
  const str = `${item.name} ${item.style || ""} ${(item.tags || []).join(" ")} ${item.slug || ""}`.toLowerCase();
  
  if (/ghibli|anime|whimsical|fantasy|fairy/.test(str)) return "whimsical";
  if (/beach|sea|ocean|coastal|seashell|goa|water/.test(str)) return "waves";
  if (/nikah|emerald|islamic|noor|desert/.test(str)) return "arabesque";
  if (/rajasthan|jodhpur|jaipur|udaipur|palace|royal|mewar|haveli/.test(str)) return "jali";
  if (/telugu|kalyana|mandapam|banana|south-indian|toran/.test(str)) return "kolam";
  if (/shubha|vivaham|muhurtham|vedic|lamp/.test(str)) return "mandala";
  if (/sage|parchment|botanical|eucalyptus|minimal/.test(str)) return "botanical";
  if (/floral|flower|bloom|rose|meadow|bougainvillea/.test(str)) return "damask";
  if (/modern|contemporary|chic|glam|vogue|artdeco/.test(str)) return "artdeco";
  if (/star|celestial|night|cosmic|midnight/.test(str)) return "celestial";
  if (/marigold|bhavan|traditional|paisley/.test(str)) return "paisley";

  const allKeys = Object.keys(LUXURY_PATTERNS);
  return allKeys[Math.abs(item.id || 0) % allKeys.length];
}

function applyTemplateLuxuryPattern(item) {
  const canvas = document.getElementById("preview-pattern-canvas");
  if (!canvas) return;

  const key = getTemplatePatternKey(item);
  const generator = LUXURY_PATTERNS[key] || LUXURY_PATTERNS.jali;
  const accent = item.accentColor || "#c09559";
  
  const patternData = generator(accent);
  const encodedSvg = encodeURIComponent(patternData.svg);
  const dataUri = `url("data:image/svg+xml,${encodedSvg}")`;

  canvas.style.setProperty("--preview-pattern-size", patternData.size);
  canvas.style.backgroundImage = dataUri;
  canvas.setAttribute("data-pattern-key", key);
}

// --- Render Tiers Table in Pricing Section (UPI-first, dual CTA) ---
function renderPricingSection() {
  if (!pricingSection) return;
  const p1 = TIER_BASE_PRICE[1];
  const p2 = TIER_BASE_PRICE[2];
  const p3 = TIER_BASE_PRICE[3];

  const checkIcon = `<svg class="pricing-feature-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`;
  const expressLabel = currentCurrency === "INR"
    ? `⚡ Express 12h delivery (+₹${ADDONS.express.priceINR})`
    : `⚡ Express 12h delivery (+$${ADDONS.express.priceUSD})`;
  const askIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.075-2.227-.557-1.848-.762-3.033-2.639-3.125-2.762-.093-.122-.746-.992-.746-1.892 0-.9.471-1.343.639-1.527.168-.184.367-.23.49-.23.123 0 .245.001.352.006.113.006.264-.043.413.315.153.367.521 1.272.568 1.365.046.092.077.2.015.322-.061.123-.092.2-.184.307-.092.108-.194.24-.276.323-.093.092-.19.192-.082.377.108.184.478.788 1.025 1.275.704.628 1.298.822 1.482.914.184.092.291.077.399-.046.108-.123.46-0.537.583-.721.123-.184.246-.153.414-.092.169.061 1.074.507 1.258.6.184.092.307.138.353.215.046.077.046.445-.098.85zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.957-1.399C8.397 21.493 10.144 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>`;

  pricingSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">Beautiful doesn't have to be complicated.</h2>
      <p class="section-subtitle">One-time payment. No subscription. Delivered in 24 hours.</p>
      <p class="pricing-diff-line">Not another DIY editor. You pick a design, pay, send details — we build the invite for you.</p>
      <div class="pricing-grid">
        <!-- Tier 1: Classic -->
        <div class="pricing-card">
          <div class="pricing-card-header">
            <h3 class="pricing-card-name">🌿 Classic</h3>
            <div class="pricing-card-price-row">
              <span class="pricing-card-price">${formatPrice(p1.inr, p1.usd)}</span>
            </div>
          </div>
          <div class="pricing-card-tagline">“Timeless &amp; elegant — perfect for one function.”</div>
          <ul class="pricing-card-features">
            <li class="pricing-card-feature-item">${checkIcon}<span>Single-event invite (Wedding or Reception)</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Your photos, names &amp; 1-tap venue map</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Countdown timer + guest RSVP</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Delivered in 24 hours</span></li>
          </ul>
          <label class="express-toggle"><input type="checkbox" id="express-toggle-1" onchange="updatePackagePayLabels()"><span>${expressLabel}</span></label>
          <button type="button" class="pricing-card-cta pkg-pay-btn" id="pkg-pay-btn-1" onclick="payRazorpayForPackage(1)"><span data-pay-label>Get this invite · ${formatPrice(p1.inr, p1.usd)}</span></button>
          <button type="button" class="pkg-ask-btn" onclick="askPackageOnWhatsApp(1)">${askIcon}<span>Ask on WhatsApp</span></button>
          <p class="pkg-microcopy">Delivered in 24 hours · UPI / GPay / PhonePe</p>
        </div>

        <!-- Tier 2: Premium (Hero / Couples' favourite) -->
        <div class="pricing-card featured pricing-card-premium">
          <div class="pricing-popular-badge">Couples' favourite</div>
          <div class="pricing-card-header">
            <h3 class="pricing-card-name">🌸 Premium</h3>
            <div class="pricing-card-price-row">
              <span class="pricing-card-price">${formatPrice(p2.inr, p2.usd)}</span>
            </div>
          </div>
          <div class="pricing-card-tagline">“Your whole wedding story, beautifully told.”</div>
          <ul class="pricing-card-features">
            <li class="pricing-card-feature-item">${checkIcon}<span>Up to 5 events: Haldi, Mehendi, Sangeet, Wedding, Reception</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Love-story timeline + photo gallery (up to 12)</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Background music + venue maps + RSVP</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Delivered in 24 hours</span></li>
          </ul>
          <label class="express-toggle"><input type="checkbox" id="express-toggle-2" onchange="updatePackagePayLabels()"><span>${expressLabel}</span></label>
          <button type="button" class="pricing-card-cta pkg-pay-btn" id="pkg-pay-btn-2" onclick="payRazorpayForPackage(2)"><span data-pay-label>Get this invite · ${formatPrice(p2.inr, p2.usd)}</span></button>
          <button type="button" class="pkg-ask-btn" onclick="askPackageOnWhatsApp(2)">${askIcon}<span>Ask on WhatsApp</span></button>
          <p class="pkg-microcopy">Delivered in 24 hours · UPI / GPay / PhonePe</p>
        </div>

        <!-- Tier 3: Luxury (Prestige) -->
        <div class="pricing-card pricing-card-luxury">
          <div class="pricing-card-header">
            <h3 class="pricing-card-name">👑 Luxury</h3>
            <div class="pricing-card-price-row">
              <span class="pricing-card-price">${formatPrice(p3.inr, p3.usd)}</span>
            </div>
          </div>
          <div class="pricing-card-tagline">“Make an unforgettable entrance.”</div>
          <ul class="pricing-card-features">
            <li class="pricing-card-feature-item">${checkIcon}<span>Everything in Premium, for all your events</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Cinematic opening — envelope &amp; palace reveals</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Premium motion, effects &amp; priority build</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Delivered in 24 hours (12h express available)</span></li>
          </ul>
          <label class="express-toggle"><input type="checkbox" id="express-toggle-3" onchange="updatePackagePayLabels()"><span>${expressLabel}</span></label>
          <button type="button" class="pricing-card-cta pkg-pay-btn" id="pkg-pay-btn-3" onclick="payRazorpayForPackage(3)"><span data-pay-label>Get this invite · ${formatPrice(p3.inr, p3.usd)}</span></button>
          <button type="button" class="pkg-ask-btn" onclick="askPackageOnWhatsApp(3)">${askIcon}<span>Ask on WhatsApp</span></button>
          <p class="pkg-microcopy">Delivered in 24 hours · UPI / GPay / PhonePe</p>
        </div>
      </div>
      <p class="pricing-swipe-hint" id="pricing-swipe-hint">Swipe for Premium &amp; Luxury · Couples’ favourite is in the middle</p>
      <div class="pricing-dots" id="pricing-dots" role="tablist" aria-label="Package cards">
        <button type="button" class="pricing-dot" data-pricing-dot="0" aria-label="Classic package" aria-current="false"></button>
        <button type="button" class="pricing-dot" data-pricing-dot="1" aria-label="Premium package" aria-current="true"></button>
        <button type="button" class="pricing-dot" data-pricing-dot="2" aria-label="Luxury package" aria-current="false"></button>
      </div>

      <p class="pricing-slot-line">Payment first reserves your slot. After UPI, we WhatsApp you in minutes to collect details — usually live within 24 hours.</p>

      <!-- Reassurance Bar -->
      <div class="pricing-reassurance">
        <span class="pricing-reassurance-item">One-time payment</span>
        <span class="pricing-reassurance-dot" aria-hidden="true"></span>
        <span class="pricing-reassurance-item">No subscription</span>
        <span class="pricing-reassurance-dot" aria-hidden="true"></span>
        <span class="pricing-reassurance-item">Digital delivery in 24h</span>
      </div>
    </div>
  `;
}

function selectTier(tierNum, smoothScroll = false) {
  activeTierFilter = tierNum;
  // Sync the glass radio group — checking the right input triggers the
  // glider animation and the change listener re-renders the catalogue.
  const radio = tierRadioByValue[String(tierNum)];
  if (radio) radio.checked = true;
  renderCatalogue();
  if (smoothScroll && typeof gsap !== "undefined") {
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: "#catalogue-header", offsetY: 70 },
      ease: "power2.inOut"
    });
  }
}

function getGeomSvg(tier) {
  if (tier === 1) {
    // Nested concentric rings
    return `<svg class="geom-svg" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="0.8" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="0.5" />
    </svg>`;
  } else if (tier === 2) {
    // Interlocking Rhombus
    return `<svg class="geom-svg" viewBox="0 0 24 24">
      <path d="M12 3l7 8-7 8-7-8z" stroke="currentColor" stroke-width="0.8" />
      <path d="M12 6l4.5 5.5-4.5 5.5-4.5-5.5z" stroke="currentColor" stroke-width="0.5" stroke-dasharray="1 1" />
    </svg>`;
  } else {
    // Cinematic star with radial dashlines and central core
    return `<svg class="geom-svg" viewBox="0 0 24 24">
      <path d="M12 2l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5z" stroke="currentColor" stroke-width="0.8" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="0.6" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="0.3" stroke-dasharray="1 2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="0.3" stroke-dasharray="1 2" />
    </svg>`;
  }
}

// --- Render Catalogue Items as Premium Full-Bleed Image Cards ---
function renderCatalogue() {
  if (!templatesGrid) return;
  
  const filtered = TEMPLATE_DATABASE.filter(item => {
    if (activeTierFilter !== 0 && item.tier !== activeTierFilter) return false;
    if (activeTagFilter !== "all" && !item.tags.includes(activeTagFilter)) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || 
             item.style.toLowerCase().includes(q) || 
             item.desc.toLowerCase().includes(q) ||
             item.tags.some(tag => tag.includes(q));
    }
    return true;
  });
  
  templatesGrid.innerHTML = "";
  
  if (filtered.length === 0) {
    templatesGrid.innerHTML = `
      <div class="no-results">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>No templates found</h3>
        <p>Try resetting the search query or tags.</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 15px;" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }
  
  filtered.forEach(item => {
    const tierName = item.tier === 1 ? "Classic" : item.tier === 2 ? "Premium" : "Luxury";
    const tierIcon = item.tier === 1 ? "🌿" : item.tier === 2 ? "🌸" : "👑";
    
    const prices = getItemPrices(item);
    const priceText = formatPrice(prices.priceINR, prices.priceUSD);
    
    const card = document.createElement("div");
    card.className = `template-card tier-card-${item.tier}`;
    card.id = `template-card-${item.id}`;

    const dbIndex = TEMPLATE_DATABASE.indexOf(item) + 1;
    const imgSrc = item.image || `assets/preview/${dbIndex}.png`;
    const initial = item.name.split(/[\s&]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
    const isPick = item.tags && item.tags.includes("our-picks");

    card.innerHTML = `
      <div class="template-card-media" data-preview-trigger="${item.id}" role="button" tabindex="0" title="Preview ${item.name}">
        <img src="${imgSrc}" alt="InviteStory - ${item.name} Digital Wedding Invitation Template" class="template-card-img" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="template-card-fallback-initial" style="display: none;">${initial}</div>
        <div class="template-card-overlay" aria-hidden="true"></div>
      </div>

      <div class="template-card-content">
        <div class="template-card-info-side">
          <div class="template-card-header">
            <h3 class="template-card-title">${item.name}</h3>
            <div class="template-card-tags">
              ${isPick ? '<span class="template-tag tag-pick">⭐ Our Pick</span>' : ''}
              ${item.style ? `<span class="template-tag tag-style">${item.style}</span>` : ''}
            </div>
          </div>

          <p class="template-card-desc">${item.desc}</p>
        </div>

        <div class="template-card-action-side">
          <div class="template-card-price-wrap">
            <span class="template-card-price card-base-price" data-inr="${prices.priceINR}" data-usd="${prices.priceUSD}">${priceText}</span>
            <span class="template-card-tier-label">${tierName}</span>
          </div>

          <div class="template-card-actions">
            <button type="button" class="btn template-btn-pay tier-btn-${item.tier}" onclick="payRazorpayForTemplate(${item.id})" aria-label="Get this invite for ${priceText}, ${item.name}">
              <span>Get this invite · ${priceText}</span>
            </button>
            <button type="button" class="btn template-btn-preview-primary tier-btn-${item.tier}" data-preview-trigger="${item.id}" aria-label="Preview ${item.name} invitation demo">
              <span>Preview <span class="btn-text-invitation">Invitation</span> →</span>
            </button>
            <a href="#" class="template-card-wa-link" id="order-btn-${item.id}" onclick="event.preventDefault(); askTemplateOnWhatsApp(${item.id})" aria-label="Ask about ${item.name} on WhatsApp" title="Ask on WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.075-2.227-.557-1.848-.762-3.033-2.639-3.125-2.762-.093-.122-.746-.992-.746-1.892 0-.9.471-1.343.639-1.527.168-.184.367-.23.49-.23.123 0 .245.001.352.006.113.006.264-.043.413.315.153.367.521 1.272.568 1.365.046.092.077.2.015.322-.061.123-.092.2-.184.307-.092.108-.194.24-.276.323-.093.092-.19.192-.082.377.108.184.478.788 1.025 1.275.704.628 1.298.822 1.482.914.184.092.291.077.399-.046.108-.123.46-0.537.583-.721.123-.184.246-.153.414-.092.169.061 1.074.507 1.258.6.184.092.307.138.353.215.046.077.046.445-.098.85zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.957-1.399C8.397 21.493 10.144 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              <span class="wa-text-label">Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    `;
    templatesGrid.appendChild(card);
  });

  // Animate cards in on every render.
  if (typeof gsap !== "undefined") {
    gsap.fromTo(
      templatesGrid.querySelectorAll(".template-card"),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05,
        ease: "power2.out", overwrite: true }
    );
  }
}

// Toggle Row Expand — GSAP Flip animates between collapsed/expanded states
function toggleAccordion(id) {
  const card = document.getElementById(`template-card-${id}`);
  if (!card) return;

  const willExpand = !card.classList.contains("expanded");
  if (willExpand) {
    const item = TEMPLATE_DATABASE.find(x => x.id === id);
    if (item) {
      const prices = getItemPrices(item);
      trackMetaEvent("ViewContent", {
        content_name: item.name,
        content_ids: [String(item.id)],
        content_type: "product",
        content_category: item.style || "Digital Wedding Invitation",
        value: currentCurrency === "INR" ? prices.priceINR : prices.priceUSD,
        currency: currentCurrency
      });
    }
  }

  if (typeof gsap === "undefined" || typeof Flip === "undefined") {
    card.classList.toggle("expanded");
    return;
  }

  const state = Flip.getState(card.querySelectorAll(
    ".template-info, .template-details-expanded, .template-actions, .expand-icon"
  ));

  card.classList.toggle("expanded");

  Flip.from(state, {
    duration: 0.5,
    ease: "power2.inOut",
    absolute: true,
    nested: true,
    onComplete: () => Flip.cleanup()
  });
}

// Live recalculate checkboxes
function recalculatePrice(id) {
  const item = TEMPLATE_DATABASE.find(x => x.id === id);
  if (!item) return;
  
  const expressChecked = document.getElementById(`addon-express-${id}`).checked;
  const domainChecked = document.getElementById(`addon-domain-${id}`).checked;
  const langChecked = document.getElementById(`addon-lang-${id}`).checked;
  
  const prices = getItemPrices(item);
  let totalINR = prices.priceINR;
  let totalUSD = prices.priceUSD;
  
  if (expressChecked) {
    totalINR += ADDONS.express.priceINR;
    totalUSD += ADDONS.express.priceUSD;
  }
  if (domainChecked) {
    totalINR += ADDONS.domain.priceINR;
    totalUSD += ADDONS.domain.priceUSD;
  }
  if (langChecked) {
    totalINR += ADDONS.lang.priceINR;
    totalUSD += ADDONS.lang.priceUSD;
  }
  
  // Update UI total text
  const totalDisplay = document.getElementById(`total-price-${id}`);
  if (totalDisplay) {
    totalDisplay.innerText = formatPrice(totalINR, totalUSD);
  }
}

// Build the WhatsApp order message for a given template id.
function buildWhatsAppMessage(id, includeAddons) {
  const item = TEMPLATE_DATABASE.find(x => x.id === id);
  if (!item) return "";

  const prices = getItemPrices(item);
  const basePriceText = formatPrice(prices.priceINR, prices.priceUSD);
  let checkedAddons = [];
  let totalINR = prices.priceINR;
  let totalUSD = prices.priceUSD;

  if (includeAddons) {
    const expressChecked = document.getElementById(`addon-express-${id}`);
    const domainChecked  = document.getElementById(`addon-domain-${id}`);
    const langChecked    = document.getElementById(`addon-lang-${id}`);

    if (expressChecked && expressChecked.checked) {
      checkedAddons.push(`${ADDONS.express.name} (+${formatPrice(ADDONS.express.priceINR, ADDONS.express.priceUSD)})`);
      totalINR += ADDONS.express.priceINR;
      totalUSD += ADDONS.express.priceUSD;
    }
    if (domainChecked && domainChecked.checked) {
      checkedAddons.push(`${ADDONS.domain.name} (+${formatPrice(ADDONS.domain.priceINR, ADDONS.domain.priceUSD)})`);
      totalINR += ADDONS.domain.priceINR;
      totalUSD += ADDONS.domain.priceUSD;
    }
    if (langChecked && langChecked.checked) {
      checkedAddons.push(`${ADDONS.lang.name} (+${formatPrice(ADDONS.lang.priceINR, ADDONS.lang.priceUSD)})`);
      totalINR += ADDONS.lang.priceINR;
      totalUSD += ADDONS.lang.priceUSD;
    }
  }

  const totalPriceText = formatPrice(totalINR, totalUSD);
  const originalPriceText = formatPrice(prices.originalPriceINR, prices.originalPriceUSD);
  const saveINR = prices.originalPriceINR - prices.priceINR;
  const saveUSD = prices.originalPriceUSD - prices.priceUSD;
  const saveText = currentCurrency === "INR"
    ? `${getCurrencySymbol()}${saveINR.toLocaleString("en-IN")}`
    : `${getCurrencySymbol()}${saveUSD}`;

  const tierName = item.tier === 1 ? "Classic" : item.tier === 2 ? "Premium" : "Luxury";

  let message = PROMO_CONFIG.active
    ? `🇮🇳 *Hi InviteStory!* I would like to order *${item.name}* under the Independence Day Offer (Flat ₹815)!\n\n`
    : `✨ *Hi InviteStory!* I would like to order the *${item.name}* invitation card.\n\n`;

  message += `💍 *Design:* ${item.name} (${tierName} Tier)\n`;
  message += `💰 *Total Price:* ${totalPriceText}`;

  if (checkedAddons.length > 0) {
    message += `\n➕ *Add-ons:* ${checkedAddons.join(", ")}`;
  }

  message += `\n\nPlease let me know the next steps to share our event details & photos! 💌`;

  const { utmSource, utmCampaign } = getUtmCampaignParams();
  if (utmSource || utmCampaign) {
    message += `\n\n📌 _Ref: ${utmSource || 'ads'}${utmCampaign ? ' / ' + utmCampaign : ''}_`;
  }

  return message;
}

// WhatsApp redirect trigger compile
function orderCustomTemplate(id) {
  const item = TEMPLATE_DATABASE.find(x => x.id === id);
  if (item) {
    const expressChecked = document.getElementById(`addon-express-${id}`)?.checked;
    const domainChecked  = document.getElementById(`addon-domain-${id}`)?.checked;
    const langChecked    = document.getElementById(`addon-lang-${id}`)?.checked;

    const prices = getItemPrices(item);
    let totalVal = currentCurrency === "INR" ? prices.priceINR : prices.priceUSD;
    if (expressChecked) totalVal += (currentCurrency === "INR" ? ADDONS.express.priceINR : ADDONS.express.priceUSD);
    if (domainChecked)  totalVal += (currentCurrency === "INR" ? ADDONS.domain.priceINR : ADDONS.domain.priceUSD);
    if (langChecked)    totalVal += (currentCurrency === "INR" ? ADDONS.lang.priceINR : ADDONS.lang.priceUSD);

    trackMetaEvent("InitiateCheckout", {
      content_name: item.name,
      content_ids: [String(item.id)],
      content_type: "product",
      content_category: item.style || "Digital Wedding Invitation",
      value: totalVal,
      currency: currentCurrency,
      num_items: 1
    });

    trackMetaEvent("Lead", {
      content_name: item.name,
      content_ids: [String(item.id)],
      content_type: "product",
      content_category: item.style || "Digital Wedding Invitation",
      value: totalVal,
      currency: currentCurrency,
      num_items: 1
    });
  }

  const message = buildWhatsAppMessage(id, /* includeAddons */ true);
  window.open(`https://wa.me/918281583882?text=${encodeURIComponent(message)}`, "_blank");
}

/**
 * Triggers Razorpay Checkout modal for a specific template (or currently previewed template)
 * Automatically attaches Template Name, ID, Style, and Add-ons in Razorpay transaction notes!
 */
function payRazorpayForTemplate(id) {
  let templateId = id;
  if (!templateId && typeof previewState !== "undefined" && previewState.currentIndex >= 0) {
    templateId = TEMPLATE_DATABASE[previewState.currentIndex]?.id;
  }
  
  const item = TEMPLATE_DATABASE.find(x => x.id === templateId) || TEMPLATE_DATABASE[0];
  if (!item) return;

  // Check selected add-ons
  const expressChecked = document.getElementById(`addon-express-${item.id}`)?.checked;
  const domainChecked  = document.getElementById(`addon-domain-${item.id}`)?.checked;
  const langChecked    = document.getElementById(`addon-lang-${item.id}`)?.checked;

  const prices = getItemPrices(item);
  let totalVal = currentCurrency === "INR" ? prices.priceINR : prices.priceUSD;
  const selectedAddons = [];

  if (expressChecked) {
    totalVal += (currentCurrency === "INR" ? ADDONS.express.priceINR : ADDONS.express.priceUSD);
    selectedAddons.push("Express 12h Delivery");
  }
  if (domainChecked) {
    totalVal += (currentCurrency === "INR" ? ADDONS.domain.priceINR : ADDONS.domain.priceUSD);
    selectedAddons.push("Custom Domain");
  }
  if (langChecked) {
    totalVal += (currentCurrency === "INR" ? ADDONS.lang.priceINR : ADDONS.lang.priceUSD);
    selectedAddons.push("Multi-Language");
  }

  const isINR = currentCurrency === "INR";
  const currencyCode = isINR ? "INR" : "USD";
  const amountInSubunits = Math.round(totalVal * 100);

  trackMetaEvent("InitiateCheckout", {
    content_name: item.name,
    content_ids: [String(item.id)],
    content_type: "product",
    content_category: item.style || "Digital Wedding Invitation",
    value: totalVal,
    currency: currencyCode
  });

  const options = {
    key: window.RAZORPAY_KEY_ID || "rzp_live_YOUR_KEY_HERE",
    amount: amountInSubunits,
    currency: currencyCode,
    name: "InviteStory",
    description: `Digital Wedding Invitation - ${item.name}`,
    image: "https://invitestory.in/logo/noappicon.png",
    notes: {
      template_name: item.name,
      template_id: String(item.id),
      template_style: item.style || "Digital Card",
      add_ons: selectedAddons.length > 0 ? selectedAddons.join(", ") : "None",
      promo_offer: PROMO_CONFIG.active ? PROMO_CONFIG.name : "Standard"
    },
    theme: {
      color: "#c09559"
    },
    modal: {
      ondismiss: function () {
        if (!window.__lastPaymentOk) {
          showToast("Payment didn't go through — try again or WhatsApp us.");
        }
        window.__lastPaymentOk = false;
      }
    },
    handler: function (response) {
      window.__lastPaymentOk = true;
      trackMetaEvent("Purchase", {
        content_name: item.name,
        content_ids: [String(item.id)],
        content_type: "product",
        value: totalVal,
        currency: currencyCode,
        transaction_id: response.razorpay_payment_id
      });

      handlePaidSuccess({
        packageName: packageName(item.tier),
        amountText: isINR ? `₹${totalVal.toLocaleString("en-IN")}` : `$${totalVal}`,
        totalVal,
        currency: currencyCode,
        paymentId: response.razorpay_payment_id,
        designName: item.name
      });
    }
  };

  if (typeof Razorpay !== "undefined") {
    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function () {
      showToast("Payment didn't go through — try again or WhatsApp us.");
    });
    rzp.open();
  } else {
    showToast("Payment is loading — please try again in a moment.");
  }
}

/**
 * "Ask" prefill (no payment yet) — package level.
 * Spec: Hi! Looking at {{PACKAGE}} (₹{{AMOUNT}}). I have a few questions before paying.
 */
function askPackageOnWhatsApp(tier) {
  const name = packageName(tier);
  const amountText = packageAmountText(tier);
  trackMetaEvent("Lead", {
    content_name: `${name} Package Inquiry (pre-pay)`,
    content_category: "Package Question",
    value: packageTotal(tier),
    currency: currentCurrency
  });
  const msg = `Hi! Looking at ${name} (${amountText}). I have a few questions before paying.`;
  window.open(`https://wa.me/918281583882?text=${encodeURIComponent(msg)}`, "_blank");
}

/**
 * "Ask" prefill (no payment yet) — single design level.
 */
function askTemplateOnWhatsApp(id) {
  const item = TEMPLATE_DATABASE.find(x => x.id === id);
  if (!item) return;
  const prices = getItemPrices(item);
  const priceText = formatPrice(prices.priceINR, prices.priceUSD);
  trackMetaEvent("Lead", {
    content_name: `${item.name} Inquiry (pre-pay)`,
    content_ids: [String(item.id)],
    content_type: "product",
    content_category: item.style || "Digital Wedding Invitation",
    value: currentCurrency === "INR" ? prices.priceINR : prices.priceUSD,
    currency: currentCurrency
  });
  const msg = `Hi! Looking at "${item.name}" (${packageName(item.tier)} · ${priceText}). I have a few questions before paying.`;
  window.open(`https://wa.me/918281583882?text=${encodeURIComponent(msg)}`, "_blank");
}

/**
 * Package-level Razorpay checkout (UPI / GPay / PhonePe / cards).
 * Success → in-page success panel + auto-open WhatsApp with paid prefill.
 * Failure/cancel → toast pointing back to pricing + WhatsApp.
 */
function payRazorpayForPackage(tier, designName) {
  const name = packageName(tier);
  const totalVal = packageTotal(tier);
  const amountText = packageAmountText(tier, totalVal);
  const isINR = currentCurrency === "INR";
  const currencyCode = isINR ? "INR" : "USD";

  // USD visitors pay via PayPal (Razorpay key is INR-first).
  if (!isINR) {
    openPayPalCheckoutForPackage(tier);
    return;
  }

  trackMetaEvent("InitiateCheckout", {
    content_name: `${name} Package`,
    content_category: "Package",
    value: totalVal,
    currency: currencyCode,
    num_items: 1
  });

  const expressOn = isExpressSelectedForPackage(tier);
  const options = {
    key: window.RAZORPAY_KEY_ID || "rzp_live_YOUR_KEY_HERE",
    amount: Math.round(totalVal * 100),
    currency: currencyCode,
    name: "InviteStory",
    description: `${name} Package — Digital Wedding Invitation`,
    image: "https://invitestory.in/logo/noappicon.png",
    notes: {
      package: name,
      design_name: designName || "",
      express_12h: expressOn ? "yes" : "no",
      promo_offer: PROMO_CONFIG.active ? PROMO_CONFIG.name : "Standard"
    },
    theme: { color: "#c09559" },
    modal: {
      // If they close without paying, send them back to pricing with help.
      ondismiss: function () {
        if (!window.__lastPaymentOk) {
          showToast("Payment didn't go through — try again or WhatsApp us.");
        }
        window.__lastPaymentOk = false;
      }
    },
    handler: function (response) {
      window.__lastPaymentOk = true;
      trackMetaEvent("Purchase", {
        content_name: `${name} Package`,
        content_category: "Package",
        value: totalVal,
        currency: currencyCode,
        transaction_id: response.razorpay_payment_id
      });
      handlePaidSuccess({
        packageName: name,
        amountText,
        totalVal,
        currency: currencyCode,
        paymentId: response.razorpay_payment_id,
        designName: designName || ""
      });
    }
  };

  if (typeof Razorpay !== "undefined") {
    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function () {
      showToast("Payment didn't go through — try again or WhatsApp us.");
    });
    rzp.open();
  } else {
    showToast("Payment is loading — please try again in a moment.");
  }
}

/**
 * Shared post-payment handler: stores receipt, shows the in-page success
 * panel (works even if the user never opens WhatsApp), and auto-opens
 * WhatsApp with the paid details prefill.
 * Spec: Hi InviteStory! ✅ Paid for {{PACKAGE}} (₹{{AMOUNT}}).
 *       Payment ID: {{RAZORPAY_ID}} / Design I want: {{DESIGN_NAME}} /
 *       I'll send names, dates, photos, venue next.
 */
function handlePaidSuccess(details) {
  window.__lastPayment = details;
  showPaymentSuccess(details);
  const designLine = details.designName ? `\nDesign I want: ${details.designName}` : "";
  const waMsg = `Hi InviteStory! ✅ Paid for ${details.packageName} (${details.amountText}).\nPayment ID: ${details.paymentId}${designLine}\nI'll send names, dates, photos, venue next.`;
  window.open(`https://wa.me/918281583882?text=${encodeURIComponent(waMsg)}`, "_blank");
}

function showPaymentSuccess(details) {
  const modal = document.getElementById("payment-success-modal");
  if (!modal) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("pay-success-package", details.packageName);
  set("pay-success-amount", details.amountText);
  set("pay-success-id", details.paymentId);
  set("pay-success-design", details.designName || "Any — I'll confirm on WhatsApp");
  const tyLink = document.getElementById("pay-success-thankyou-link");
  if (tyLink) {
    const q = new URLSearchParams({
      package: details.packageName,
      amount: details.amountText,
      payment_id: details.paymentId,
      design: details.designName || ""
    });
    tyLink.href = `thank-you.html?${q.toString()}`;
  }
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closePaymentSuccess() {
  const modal = document.getElementById("payment-success-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

/** Primary button inside the success panel — opens WhatsApp with the paid prefill. */
function sendDetailsOnWhatsApp() {
  const d = window.__lastPayment;
  if (!d) {
    window.open("https://wa.me/918281583882?text=" + encodeURIComponent("Hi InviteStory! I just paid on the website — here are my wedding details:"), "_blank");
    return;
  }
  const designLine = d.designName ? `\nDesign I want: ${d.designName}` : "";
  const waMsg = `Hi InviteStory! ✅ Paid for ${d.packageName} (${d.amountText}).\nPayment ID: ${d.paymentId}${designLine}\nI'll send names, dates, photos, venue next.`;
  window.open(`https://wa.me/918281583882?text=${encodeURIComponent(waMsg)}`, "_blank");
}

/** Keep each package card's Pay label in sync with its express toggle. */
function updatePackagePayLabels() {
  [1, 2, 3].forEach(tier => {
    const btn = document.getElementById(`pkg-pay-btn-${tier}`);
    if (btn) {
      const label = btn.querySelector("[data-pay-label]");
      if (label) label.textContent = `Get this invite · ${packageAmountText(tier)}`;
    }
  });
}

// --- PayPal International Checkout Integration ---
let currentPayPalCheckoutTemplate = null;
let paypalSdkPromise = null;

function loadPayPalSdk() {
  if (typeof paypal !== "undefined") return Promise.resolve();
  if (paypalSdkPromise) return paypalSdkPromise;

  paypalSdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("paypal-sdk-script");
    if (existing) {
      if (typeof paypal !== "undefined") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (err) => reject(err));
      return;
    }
    const script = document.createElement("script");
    script.id = "paypal-sdk-script";
    script.src = `https://www.paypal.com/sdk/js?client-id=${window.PAYPAL_CLIENT_ID}&currency=USD&components=buttons`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
  return paypalSdkPromise;
}

function updatePaymentButtonsForCurrency() {
  const rzpBtn = document.getElementById("preview-instant-pay-btn");
  const paypalBtn = document.getElementById("preview-instant-paypal-btn");
  if (rzpBtn && paypalBtn) {
    if (currentCurrency === "USD") {
      rzpBtn.style.display = "none";
      paypalBtn.style.display = "inline-flex";
    } else {
      rzpBtn.style.display = "inline-flex";
      paypalBtn.style.display = "none";
    }
  }
}

function openPayPalCheckout(id) {
  let templateId = id;
  if (!templateId && typeof previewState !== "undefined" && previewState.currentIndex >= 0) {
    templateId = TEMPLATE_DATABASE[previewState.currentIndex]?.id;
  }
  const item = TEMPLATE_DATABASE.find(x => x.id === templateId) || TEMPLATE_DATABASE[0];
  if (!item) return;

  currentPayPalCheckoutTemplate = item;

  const modal = document.getElementById("paypal-checkout-modal");
  if (!modal) return;

  const titleEl = document.getElementById("paypal-item-name");
  const tierEl = document.getElementById("paypal-item-tier");
  const basePriceEl = document.getElementById("paypal-item-base-price");

  const prices = getItemPrices(item);
  const tierName = item.tier === 1 ? "🌿 Classic" : item.tier === 2 ? "🌸 Premium" : "👑 Luxury";

  if (titleEl) titleEl.textContent = item.name;
  if (tierEl) tierEl.textContent = tierName;
  if (basePriceEl) basePriceEl.textContent = `$${prices.priceUSD}`;

  const totalDisplay = document.getElementById("paypal-total-display");
  if (totalDisplay) {
    totalDisplay.textContent = `$${prices.priceUSD.toFixed(2)} USD`;
  }

  renderPayPalButtons();

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

/**
 * Package-level PayPal checkout for USD visitors (Classic $15 / Premium $20 / Luxury $35).
 * Reuses the PayPal modal with a pseudo item so no template pick is needed.
 */
function openPayPalCheckoutForPackage(tier) {
  const name = packageName(tier);
  const base = TIER_BASE_PRICE[tier] || TIER_BASE_PRICE[1];
  const pseudo = {
    id: `package-${tier}`,
    name: `${name} Package`,
    tier,
    style: `${name} Package — Digital Wedding Invitation`,
    priceINR: base.inr,
    priceUSD: base.usd,
    originalPriceINR: base.inr,
    originalPriceUSD: base.usd
  };
  currentPayPalCheckoutTemplate = pseudo;

  const modal = document.getElementById("paypal-checkout-modal");
  if (!modal) return;

  const titleEl = document.getElementById("paypal-item-name");
  const tierEl = document.getElementById("paypal-item-tier");
  const basePriceEl = document.getElementById("paypal-item-base-price");
  const tierLabel = tier === 1 ? "🌿 Classic" : tier === 2 ? "🌸 Premium" : "👑 Luxury";

  if (titleEl) titleEl.textContent = `${name} Package`;
  if (tierEl) tierEl.textContent = tierLabel;
  if (basePriceEl) basePriceEl.textContent = `$${base.usd}`;

  const totalDisplay = document.getElementById("paypal-total-display");
  if (totalDisplay) totalDisplay.textContent = `$${base.usd.toFixed(2)} USD`;

  const container = document.getElementById("paypal-button-container");
  if (container) container.innerHTML = "";
  renderPayPalButtons();

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closePayPalCheckout() {
  const modal = document.getElementById("paypal-checkout-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function calculatePayPalTotal() {
  if (!currentPayPalCheckoutTemplate) return 15;
  const prices = getItemPrices(currentPayPalCheckoutTemplate);
  return prices.priceUSD;
}

function renderPayPalButtons() {
  const container = document.getElementById("paypal-button-container");
  if (!container) return;

  if (typeof paypal === "undefined") {
    container.innerHTML = `<div style="text-align:center; padding:18px; color:#ecd9ac; font-size:0.9rem;">Connecting to PayPal...</div>`;
    loadPayPalSdk().then(() => {
      container.innerHTML = "";
      renderPayPalButtons();
    }).catch(err => {
      container.innerHTML = `<div style="text-align:center; padding:12px; color:#f87171; font-size:0.85rem;">Could not load PayPal SDK. Please check your connection or message us on WhatsApp.</div>`;
    });
    return;
  }

  // Avoid recreating buttons if already rendered, since createOrder evaluates dynamic amounts at click time
  if (container.children.length > 0) {
    return;
  }

  container.innerHTML = "";
  try {
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color:  'gold',
        shape:  'pill',
        label:  'paypal',
        height: 42
      },
      createOrder: function(data, actions) {
        const item = currentPayPalCheckoutTemplate || TEMPLATE_DATABASE[0];
        const total = calculatePayPalTotal();
        const tierName = item.tier === 1 ? "Classic" : item.tier === 2 ? "Premium" : "Luxury";

        trackMetaEvent("InitiateCheckout", {
          content_name: item.name,
          content_ids: [String(item.id)],
          content_type: "product",
          content_category: item.style || "Digital Wedding Invitation",
          value: total,
          currency: "USD"
        });

        return actions.order.create({
          purchase_units: [{
            description: `InviteStory: ${item.name} Wedding Invitation (${tierName} Tier)`,
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: total.toFixed(2)
                }
              }
            },
            items: [{
              name: `${item.name} - Digital Wedding Invitation`,
              description: `${tierName} Tier Digital Wedding Invitation`,
              unit_amount: {
                currency_code: "USD",
                value: total.toFixed(2)
              },
              quantity: "1",
              category: "DIGITAL_GOODS"
            }]
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          const item = currentPayPalCheckoutTemplate || TEMPLATE_DATABASE[0];
          const total = calculatePayPalTotal();
          const transactionId = details.id || (details.purchase_units && details.purchase_units[0]?.payments?.captures[0]?.id) || data.orderID;

          trackMetaEvent("Purchase", {
            content_name: item.name,
            content_ids: [String(item.id)],
            content_type: "product",
            value: total,
            currency: "USD",
            transaction_id: transactionId
          });

          closePayPalCheckout();

          alert(`🎉 Payment Successful via PayPal!\n\nOrder ID: ${transactionId}\nTemplate: ${item.name}\nAmount: $${total} USD\n\nClick OK to open WhatsApp and send your wedding details for customization!`);

          const waMsg = `Hi InviteStory! I have paid online via PayPal for '${item.name}' (Total: $${total} USD, Order ID: ${transactionId}). Here are our wedding details for customization:`;
          window.open(`https://wa.me/918281583882?text=${encodeURIComponent(waMsg)}`, "_blank");
        });
      },
      onCancel: function(data) {
        console.log("PayPal checkout cancelled", data);
      },
      onError: function(err) {
        console.error("PayPal checkout error", err);
        alert("There was an issue processing your payment with PayPal. Please try again or message us on WhatsApp.");
      }
    }).render("#paypal-button-container");
  } catch (err) {
    console.error("Failed to render PayPal Buttons", err);
  }
}

// --- Preview Modal functions ---

// --- Deep Linking & Social Sharing Helpers ---
function getDesignSlug(item) {
  if (!item) return "";
  if (item.slug) return item.slug;
  if (item.demoUrl) {
    const match = item.demoUrl.match(/https?:\/\/([^.]+)\.invitestory\.in/i);
    if (match && match[1]) return match[1];
  }
  return (item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getDesignShareUrl(item) {
  const slug = getDesignSlug(item);
  return `https://www.invitestory.in/?design=${slug}`;
}

function getDesignShareContent(item) {
  const shareUrl = getDesignShareUrl(item);
  
  const title = `InviteStory – ${item.name} Wedding Invitation`;
  const text = `Look at this "${item.name}" interactive wedding invitation ✨\n\nIt has custom music, animated couple story scenes, 1-tap Google Maps directions & instant guest RSVP.\n\nCheck out the live preview here and tell me what you think:\n${shareUrl}`;

  return {
    title,
    text,
    url: shareUrl
  };
}

function copyDesignShareLink(templateId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const item = TEMPLATE_DATABASE.find(x => x.id === templateId);
  if (!item) return;

  const content = getDesignShareContent(item);
  const textToCopy = content.text;

  const onCopied = () => {
    showToast(`✨ Link & invitation details copied! Ready to share.`);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(onCopied).catch(() => {
      fallbackCopyText(textToCopy);
      onCopied();
    });
  } else {
    fallbackCopyText(textToCopy);
    onCopied();
  }

  trackMetaEvent("ShareContent", {
    content_name: item.name,
    content_id: String(item.id),
    content_type: "product"
  });
}

function shareCurrentPreview(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (previewState.currentIndex < 0) return;
  const item = TEMPLATE_DATABASE[previewState.currentIndex];
  if (!item) return;

  const content = getDesignShareContent(item);

  if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
    navigator.share({
      title: content.title,
      text: content.text,
      url: content.url
    }).catch((err) => {
      if (err && err.name !== "AbortError") {
        copyDesignShareLink(item.id);
      }
    });
  } else {
    copyDesignShareLink(item.id);
  }
}

function showToast(message) {
  let toast = document.getElementById("toast-notification");
  let msgEl = document.getElementById("toast-message");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = "toast-notification";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `<span class="toast-icon">✨</span><span id="toast-message" class="toast-message"></span>`;
    document.body.appendChild(toast);
    msgEl = document.getElementById("toast-message");
  }
  if (msgEl) msgEl.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3400);
}

function fallbackCopyText(text) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  } catch (err) {
    console.warn("Fallback clipboard copy error:", err);
  }
}

function findTemplateByQuery(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  const numId = parseInt(q, 10);
  if (!isNaN(numId)) {
    const byId = TEMPLATE_DATABASE.find(x => x.id === numId);
    if (byId) return byId;
  }
  const bySlug = TEMPLATE_DATABASE.find(x => (x.slug === q || getDesignSlug(x) === q));
  if (bySlug) return bySlug;
  const byName = TEMPLATE_DATABASE.find(x => x.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === q || x.name.toLowerCase() === q);
  if (byName) return byName;
  return null;
}

function handleInitialUrlRoute() {
  const params = new URLSearchParams(window.location.search);
  const designQuery = params.get("design") || params.get("preview") || params.get("id") || params.get("template");
  if (designQuery) {
    const matched = findTemplateByQuery(designQuery);
    if (matched) {
      setTimeout(() => {
        openPreview(matched.id, false);
        const card = document.getElementById(`template-card-${matched.id}`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);
    }
  }
}

// 3D View Angle vs Flat View Rig Switching
function setPreviewViewMode(mode) {
  previewState.viewMode = mode;
  syncPreviewViewRig();
}

function syncPreviewViewRig() {
  const rig = document.getElementById("preview-phone-3d-rig");
  const btn3D = document.getElementById("view-mode-3d");
  const btnFlat = document.getElementById("view-mode-flat");
  if (!rig) return;

  if (previewState.viewMode === "3d") {
    rig.classList.add("is-3d-mode");
    rig.classList.remove("is-flat-mode");
    // Reset physics target to resting 3D pose
    Object.assign(PhonePhysics.target, PhonePhysics.REST);
    phonePhysicsResetGlare();
    phonePhysicsStart();
    if (btn3D) btn3D.classList.add("active");
    if (btnFlat) btnFlat.classList.remove("active");
  } else {
    rig.classList.remove("is-3d-mode");
    rig.classList.add("is-flat-mode");
    // Flat mode: CSS transition handles the snap, pause physics immediately and clear inline transforms
    phonePhysicsStop();
    phonePhysicsEnsureEls();
    if (PhonePhysics.els.rig) {
      PhonePhysics.els.rig.style.transform = "";
      PhonePhysics.els.rig.style.opacity = "";
    }
    if (PhonePhysics.els.shadow) {
      PhonePhysics.els.shadow.style.transform = "";
      PhonePhysics.els.shadow.style.filter = "";
      PhonePhysics.els.shadow.style.opacity = "";
    }
    if (btn3D) btn3D.classList.remove("active");
    if (btnFlat) btnFlat.classList.add("active");
  }
}

// --- Preview Modal functions ---

// Open the in-page preview modal for a given template id.
function openPreview(id, updateUrl = true) {
  const idx = TEMPLATE_DATABASE.findIndex(x => x.id === id);
  if (idx === -1) return;

  const item = TEMPLATE_DATABASE[idx];
  previewState.currentIndex = idx;
  previewState.lastFocusedElement = document.activeElement;

  // Seamlessly update browser URL without refresh so user can share link directly
  if (updateUrl && window.history && window.history.replaceState) {
    const url = new URL(window.location.href);
    const slug = item.slug || getDesignSlug(item);
    url.searchParams.set("design", slug);
    url.searchParams.delete("preview");
    url.searchParams.delete("id");
    window.history.replaceState({ modalOpen: true, templateId: item.id }, "", url.toString());
  }

  const prices = getItemPrices(item);
  trackMetaEvent("ViewContent", {
    content_name: item.name,
    content_ids: [String(item.id)],
    content_type: "product",
    content_category: item.style || "Digital Wedding Invitation",
    value: currentCurrency === "INR" ? prices.priceINR : prices.priceUSD,
    currency: currentCurrency
  });

  // Update header, tags, price & counter badges
  if (previewModalTitle) previewModalTitle.textContent = item.name;
  if (previewModalTag)   previewModalTag.textContent = item.style;
  if (previewModalPrice) {
    previewModalPrice.textContent = formatPrice(prices.priceINR, prices.priceUSD);
  }
  // Tier badge (Classic / Premium / Luxury) so the package choice is obvious
  const tierBadge = document.getElementById("preview-modal-tier");
  if (tierBadge) {
    const tierLabel = item.tier === 1 ? "Classic" : item.tier === 2 ? "Premium" : "Luxury";
    tierBadge.textContent = tierLabel;
    tierBadge.setAttribute("data-tier", String(item.tier));
  }
  // Dual CTA labels: primary Pay, secondary Ask
  const payLabel = document.getElementById("preview-pay-label");
  if (payLabel) payLabel.textContent = `Get this invite · ${formatPrice(prices.priceINR, prices.priceUSD)}`;
  const paypalLabel = document.getElementById("preview-paypal-label");
  if (paypalLabel) paypalLabel.textContent = `Pay $${prices.priceUSD} with PayPal`;
  const askLabel = document.getElementById("preview-ask-label");
  if (askLabel) askLabel.textContent = "Ask on WhatsApp";
  // Multi-event callout on Premium & Luxury previews
  const multiNote = document.getElementById("preview-multievent-note");
  if (multiNote) {
    if (item.tier === 2 || item.tier === 3) {
      multiNote.hidden = false;
    } else {
      multiNote.hidden = true;
    }
  }
  updatePaymentButtonsForCurrency();
  if (previewCounterBadge) {
    previewCounterBadge.textContent = `${idx + 1} of ${TEMPLATE_DATABASE.length}`;
  }
  if (previewFullscreenBtn) {
    previewFullscreenBtn.href = item.demoUrl;
  }

  // Update dynamic ambient theme backdrop color & glow
  const accent = item.accentColor || "#c09559";
  const glowRgba = hexToRgba(accent, 0.45);

  if (previewModal) {
    previewModal.setAttribute("data-preview-tier", item.tier);
    previewModal.style.setProperty('--theme-accent-color', accent);
    previewModal.style.setProperty('--theme-accent-glow', glowRgba);
  }
  if (previewAmbientGlow) {
    previewAmbientGlow.style.setProperty('--theme-accent-glow', glowRgba);
  }

  // Apply distinct bespoke luxury pattern & palette for this template
  applyTemplateLuxuryPattern(item);

  // Reset iframe load state and start loading the new demo
  previewIframe.classList.remove("is-loaded");
  previewLoader.classList.remove("is-hidden");
  startLoaderPulse();
  previewIframe.src = item.demoUrl;

  // Sync tier-tab active state to current template
  updatePreviewTierTabs(item.tier);

  // Sync view mode (3D or Flat)
  syncPreviewViewRig();

  // Show modal & update device scale to fit available viewport seamlessly
  previewModal.classList.add("is-open");
  previewModal.setAttribute("aria-hidden", "false");
  
  // Store current scroll position to avoid jumping to top while locking
  previewState.savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add("preview-modal-open");
  document.body.classList.add("preview-modal-open");
  
  requestAnimationFrame(updatePreviewScale);

  // Trigger cinematic entrance animation (spring from dramatic pose to rest)
  phonePhysicsTriggerEntrance();

  // Move focus to the close button for keyboard users
  const closeBtn = previewModal.querySelector(".preview-modal-close");
  if (closeBtn) closeBtn.focus();
}

// Dynamically scale the iPhone 17 Pro mockup frame (405x864, 393x852 screen) to fit available body height/width
function updatePreviewScale() {
  if (!previewIframeWrap || !previewModal || !previewModal.classList.contains("is-open")) return;
  const body = previewModal.querySelector(".preview-modal-body");
  if (!body) return;

  const availWidth = body.clientWidth - 20;
  const availHeight = body.clientHeight - 12;
  
  // Authentic iPhone 17 Pro 19.55:9 ratio (405x864 chassis, 393x852 active OLED)
  const targetWidth = 405;
  const targetHeight = 864;

  const scaleX = availWidth / targetWidth;
  const scaleY = availHeight / targetHeight;
  const scale = Math.min(scaleX, scaleY);

  const clampedScale = Math.max(0.42, Math.min(1.0, scale));
  previewIframeWrap.style.transform = `scale(${clampedScale})`;
}

// Close the preview modal and restore body scroll + focus.
function closePreview(updateUrl = true) {
  if (!previewModal.classList.contains("is-open")) return;

  if (document.activeElement && previewModal.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  // Remove ?design= from browser URL cleanly without refreshing
  if (updateUrl && window.history && window.history.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.delete("design");
    url.searchParams.delete("preview");
    url.searchParams.delete("id");
    window.history.replaceState({ modalOpen: false }, "", url.toString());
  }

  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("preview-modal-open");
  document.body.classList.remove("preview-modal-open");
  if (typeof previewState.savedScrollY === "number") {
    window.scrollTo(0, previewState.savedScrollY);
  }
  stopLoaderPulse();

  // Detach iframe src after the close transition so we don't keep a network
  // request alive for a demo the user already saw.
  setTimeout(() => {
    previewIframe.src = "about:blank";
    previewIframe.classList.remove("is-loaded");
    previewLoader.classList.remove("is-hidden");
  }, 350);

  previewState.currentIndex = -1;

  // Stop 3D physics rAF loop
  phonePhysicsStop();

  // Restore focus to the originating trigger
  if (previewState.lastFocusedElement && typeof previewState.lastFocusedElement.focus === "function") {
    previewState.lastFocusedElement.focus();
  }

  // Close FAQ popup if open
  closePreviewFaq();
}

// --- Preview Modal FAQ Functions ---
function openPreviewFaq(e) {
  if (e && typeof e.stopPropagation === "function") e.stopPropagation();
  const faqBackdrop = document.getElementById("preview-faq-backdrop");
  if (faqBackdrop) {
    faqBackdrop.classList.add("is-open");
    faqBackdrop.setAttribute("aria-hidden", "false");
  }
}

function closePreviewFaq() {
  const faqBackdrop = document.getElementById("preview-faq-backdrop");
  if (faqBackdrop) {
    faqBackdrop.classList.remove("is-open");
    faqBackdrop.setAttribute("aria-hidden", "true");
  }
}

// --- Phone Physics Functions ---

function phonePhysicsEnsureEls() {
  if (!PhonePhysics.els.rig) {
    const stage = document.getElementById("preview-3d-stage");
    const rig = document.getElementById("preview-phone-3d-rig");
    if (rig) {
      PhonePhysics.els = {
        stage: stage,
        rig: rig,
        shadow: rig.querySelector(".phone-shadow-3d"),
        glareHighlight: document.getElementById("glare-highlight"),
        glareRim: document.getElementById("glare-rim"),
        glareAmbient: document.getElementById("glare-ambient")
      };
    }
  }
}

function phonePhysicsStart() {
  if (PhonePhysics.isRunning || PhonePhysics.reducedMotion) return;
  phonePhysicsEnsureEls();
  PhonePhysics.isRunning = true;
  PhonePhysics.rafId = requestAnimationFrame(phonePhysicsLoop);
}

function phonePhysicsStop() {
  PhonePhysics.isRunning = false;
  if (PhonePhysics.rafId) {
    cancelAnimationFrame(PhonePhysics.rafId);
    PhonePhysics.rafId = null;
  }
}

function phonePhysicsLoop() {
  if (!PhonePhysics.isRunning) return;
  if (previewState.viewMode !== "3d" || !previewModal || !previewModal.classList.contains("is-open")) {
    phonePhysicsStop();
    return;
  }

  const { current, target, velocity, LERP_FACTOR, DAMPING, EPSILON, glare, shadow, els } = PhonePhysics;

  // Spring physics interpolation for phone rig with heavy titanium damping
  const keys = ["rotY", "rotX", "rotZ", "scale", "translateY", "opacity"];
  let maxDelta = 0;
  let maxVel = 0;

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const diff = target[k] - current[k];
    velocity[k] = (velocity[k] + diff * LERP_FACTOR) * DAMPING;
    current[k] += velocity[k];
    
    const absDiff = Math.abs(diff);
    const absVel = Math.abs(velocity[k]);
    if (absDiff > maxDelta) maxDelta = absDiff;
    if (absVel > maxVel) maxVel = absVel;
  }

  // Glare interpolation
  const gKeys = ["highlightX", "highlightY", "rimX", "rimY", "ambientX", "ambientY", "highlightOp", "rimOp", "ambientOp"];
  let maxGlareDelta = 0;
  for (let i = 0; i < gKeys.length; i++) {
    const gk = gKeys[i];
    const gDiff = glare.target[gk] - glare.current[gk];
    glare.current[gk] += gDiff * 0.14;
    const absGDiff = Math.abs(gDiff);
    if (absGDiff > maxGlareDelta) maxGlareDelta = absGDiff;
  }

  // Shadow interpolation
  const sXDiff = shadow.target.x - shadow.current.x;
  const sBDiff = shadow.target.blur - shadow.current.blur;
  const sODiff = shadow.target.opacity - shadow.current.opacity;
  shadow.current.x += sXDiff * 0.14;
  shadow.current.blur += sBDiff * 0.14;
  shadow.current.opacity += sODiff * 0.14;
  const maxShadowDelta = Math.max(Math.abs(sXDiff), Math.abs(sBDiff), Math.abs(sODiff));

  // Check if system has settled into rest pose (Saves battery and GPU/CPU cycles on mobile)
  const isSettled = maxDelta < EPSILON && maxVel < EPSILON && maxGlareDelta < 0.008 && maxShadowDelta < 0.008;
  if (isSettled) {
    // Snap to exact targets to prevent float drift
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      current[k] = target[k];
      velocity[k] = 0;
    }
    for (let i = 0; i < gKeys.length; i++) {
      const gk = gKeys[i];
      glare.current[gk] = glare.target[gk];
    }
    shadow.current.x = shadow.target.x;
    shadow.current.blur = shadow.target.blur;
    shadow.current.opacity = shadow.target.opacity;
  }

  // Apply to DOM
  if (els.rig) {
    els.rig.style.transform = `translate3d(0, ${current.translateY.toFixed(1)}px, 0) rotateY(${current.rotY.toFixed(2)}deg) rotateX(${current.rotX.toFixed(2)}deg) rotateZ(${current.rotZ.toFixed(2)}deg) scale(${current.scale.toFixed(3)})`;
    els.rig.style.opacity = current.opacity.toFixed(2);
  }

  if (els.shadow) {
    els.shadow.style.transform = `rotateX(85deg) translateZ(-40px) translateX(${shadow.current.x.toFixed(1)}px)`;
    els.shadow.style.opacity = shadow.current.opacity.toFixed(2);
    // On non-Android or desktop, adjust blur filter; on Android, radial gradient handles blur without expensive filter
    if (!PhonePhysics.isAndroid) {
      els.shadow.style.filter = `blur(${shadow.current.blur.toFixed(1)}px)`;
    }
  }

  if (els.glareHighlight) {
    els.glareHighlight.style.transform = `translate3d(${glare.current.highlightX.toFixed(1)}px, ${glare.current.highlightY.toFixed(1)}px, 0)`;
    els.glareHighlight.style.opacity = glare.current.highlightOp.toFixed(2);
  }

  if (els.glareRim) {
    els.glareRim.style.transform = `translate3d(${glare.current.rimX.toFixed(1)}px, ${glare.current.rimY.toFixed(1)}px, 0)`;
    els.glareRim.style.opacity = glare.current.rimOp.toFixed(2);
  }

  if (els.glareAmbient) {
    els.glareAmbient.style.transform = `translate3d(${glare.current.ambientX.toFixed(1)}px, ${glare.current.ambientY.toFixed(1)}px, 0)`;
    els.glareAmbient.style.opacity = glare.current.ambientOp.toFixed(2);
  }

  if (isSettled) {
    phonePhysicsStop();
    return;
  }

  PhonePhysics.rafId = requestAnimationFrame(phonePhysicsLoop);
}

function phonePhysicsSetMouseTarget(normX, normY) {
  // normX, normY are typically between -0.5 and 0.5
  const clampedX = Math.max(-0.55, Math.min(0.55, normX));
  const clampedY = Math.max(-0.55, Math.min(0.55, normY));

  // Phone rig target angles: realistic titanium hardware weight, controlled range
  PhonePhysics.target.rotY = PhonePhysics.REST.rotY + (clampedX * 11);
  PhonePhysics.target.rotX = PhonePhysics.REST.rotX - (clampedY * 9);
  PhonePhysics.target.rotZ = PhonePhysics.REST.rotZ + (clampedX * 0.8);
  PhonePhysics.target.scale = 1;
  PhonePhysics.target.translateY = 0;
  PhonePhysics.target.opacity = 1;

  // Glare multi-layer targets (subtle, authentic ceramic shield reflections)
  PhonePhysics.glare.target.highlightX = clampedX * 65;
  PhonePhysics.glare.target.highlightY = clampedY * 50;
  PhonePhysics.glare.target.highlightOp = Math.max(0.25, Math.min(0.85, 0.65 - clampedX * 0.25));

  PhonePhysics.glare.target.rimX = -clampedX * 45;
  PhonePhysics.glare.target.rimY = -clampedY * 35;
  PhonePhysics.glare.target.rimOp = Math.max(0.18, Math.min(0.75, 0.45 + clampedX * 0.25));

  PhonePhysics.glare.target.ambientX = clampedX * 20;
  PhonePhysics.glare.target.ambientY = clampedY * 16;

  // Reactive shadow: moves opposite to tilt
  PhonePhysics.shadow.target.x = -clampedX * 24;
  PhonePhysics.shadow.target.blur = 16 + Math.abs(clampedX) * 8;
  PhonePhysics.shadow.target.opacity = Math.max(0.6, 1 - Math.abs(clampedX) * 0.25);

  phonePhysicsStart();
}

function phonePhysicsResetTarget() {
  Object.assign(PhonePhysics.target, PhonePhysics.REST);
  phonePhysicsResetGlare();
  phonePhysicsStart();
}

function phonePhysicsResetGlare() {
  PhonePhysics.glare.target.highlightX = 0;
  PhonePhysics.glare.target.highlightY = 0;
  PhonePhysics.glare.target.highlightOp = 0.65;

  PhonePhysics.glare.target.rimX = 0;
  PhonePhysics.glare.target.rimY = 0;
  PhonePhysics.glare.target.rimOp = 0.45;

  PhonePhysics.glare.target.ambientX = 0;
  PhonePhysics.glare.target.ambientY = 0;
  PhonePhysics.glare.target.ambientOp = 0.45;

  PhonePhysics.shadow.target.x = 0;
  PhonePhysics.shadow.target.blur = 16;
  PhonePhysics.shadow.target.opacity = 1;
}

function phonePhysicsTriggerEntrance() {
  if (previewState.viewMode !== "3d" || PhonePhysics.reducedMotion) {
    Object.assign(PhonePhysics.current, PhonePhysics.REST);
    Object.assign(PhonePhysics.target, PhonePhysics.REST);
    return;
  }

  phonePhysicsEnsureEls();

  // Smooth entrance without rubbery overshoot
  Object.assign(PhonePhysics.current, PhonePhysics.ENTRANCE);
  Object.assign(PhonePhysics.target, PhonePhysics.REST);

  PhonePhysics.velocity = { rotY: 0, rotX: 0, rotZ: 0, scale: 0, translateY: 0, opacity: 0 };

  phonePhysicsResetGlare();

  // Initial glare light sweep
  PhonePhysics.glare.current.highlightX = -90;
  PhonePhysics.glare.current.highlightOp = 0;
  PhonePhysics.glare.target.highlightX = 0;
  PhonePhysics.glare.target.highlightOp = 0.65;

  phonePhysicsStart();
}

function phonePhysicsInitGyroscope() {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;

  let gyroActive = false;
  let lastGyroTime = 0;
  let lastNormX = 0;
  let lastNormY = 0;

  const handleOrientation = (e) => {
    if (!previewModal || !previewModal.classList.contains("is-open")) return;
    if (previewState.viewMode !== "3d") return;
    if (e.gamma === null || e.beta === null) return;

    // Rate-limit gyro events to max ~30fps to avoid swamping main thread and rAF on Android
    const now = performance.now();
    const interval = PhonePhysics.isAndroid ? 45 : 30; // 22Hz on Android, 33Hz on iOS
    if (now - lastGyroTime < interval) return;
    lastGyroTime = now;

    // gamma: left-to-right tilt in degrees [-90, 90]
    // beta: front-to-back tilt in degrees [-180, 180], phone usually held at ~45deg
    const normX = Math.max(-0.5, Math.min(0.5, e.gamma / 50));
    const normY = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 50));

    // Deadzone check: ignore tiny sensor jitter (crucial on noisy Android accelerometer/gyro)
    if (Math.abs(normX - lastNormX) < 0.012 && Math.abs(normY - lastNormY) < 0.012) {
      return;
    }
    lastNormX = normX;
    lastNormY = normY;

    phonePhysicsSetMouseTarget(normX, normY);
  };

  // iOS 13+ permission flow
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    const requestGyro = () => {
      if (gyroActive) return;
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === "granted") {
            gyroActive = true;
            window.addEventListener("deviceorientation", handleOrientation, { passive: true });
          }
        })
        .catch(() => {});
      window.removeEventListener("click", requestGyro);
      window.removeEventListener("touchend", requestGyro);
    };
    window.addEventListener("click", requestGyro, { once: true });
    window.addEventListener("touchend", requestGyro, { once: true });
  } else {
    // Android or non-iOS devices: add throttled orientation listener
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
  }
}

// Navigate to next/previous template by array index (wraps at ends).
function previewNext() {
  if (previewState.currentIndex < 0) return;
  const next = (previewState.currentIndex + 1) % TEMPLATE_DATABASE.length;
  openPreview(TEMPLATE_DATABASE[next].id);
}
function previewPrev() {
  if (previewState.currentIndex < 0) return;
  const len = TEMPLATE_DATABASE.length;
  const prev = (previewState.currentIndex - 1 + len) % len;
  openPreview(TEMPLATE_DATABASE[prev].id);
}

// Jump modal to the first template of the given tier (modal stays open).
function previewJumpTier(tier) {
  if (!(tier in TIER_FIRST_INDEX)) return;
  const firstIdx = TIER_FIRST_INDEX[tier];
  openPreview(TEMPLATE_DATABASE[firstIdx].id);
}

// "Ask on WhatsApp" for the currently previewed template (no payment yet).
function previewBuyNow() {
  if (previewState.currentIndex < 0) return;
  const id = TEMPLATE_DATABASE[previewState.currentIndex].id;
  askTemplateOnWhatsApp(id);
}

// Close the modal and scroll the page to the top.
function previewHome() {
  closePreview();
  // Defer scroll-to-top until after the close transition starts so it feels
  // like one fluid motion rather than the page jumping under the fading modal.
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 150);
}

// Highlight the tier tab that matches the currently previewed template.
function updatePreviewTierTabs(activeTier) {
  previewTierTabs.forEach(tab => {
    const tier = parseInt(tab.getAttribute("data-preview-tier"), 10);
    const isActive = tier === activeTier;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

// Loader dot pulse — uses transform/opacity transitions instead of @keyframes,
// per project convention.
let loaderPulseTimer = null;
function startLoaderPulse() {
  const dots = previewLoader.querySelectorAll(".preview-modal-loader-dot");
  if (dots.length < 3) return;
  let step = 0;
  stopLoaderPulse(); // clear any prior interval
  loaderPulseTimer = setInterval(() => {
    dots.forEach(d => d.classList.remove("is-pulse-1", "is-pulse-2", "is-pulse-3"));
    dots[step % 3].classList.add("is-pulse-1");
    dots[(step + 1) % 3].classList.add("is-pulse-2");
    dots[(step + 2) % 3].classList.add("is-pulse-3");
    step++;
  }, 220);
}
function stopLoaderPulse() {
  if (loaderPulseTimer) {
    clearInterval(loaderPulseTimer);
    loaderPulseTimer = null;
  }
  const dots = previewLoader.querySelectorAll(".preview-modal-loader-dot");
  dots.forEach(d => d.classList.remove("is-pulse-1", "is-pulse-2", "is-pulse-3"));
}

function resetFilters() {
  if (searchInput) searchInput.value = "";
  if (clearSearchBtn) clearSearchBtn.style.display = "none";
  searchQuery = "";
  activeTierFilter = 0;
  activeTagFilter = "all";

  const allRadio = tierRadioByValue["0"];
  if (allRadio) allRadio.checked = true;
  
  updateTagFilterButtons();
  renderCatalogue();
}

function updateTagFilterButtons() {
  if (!filterTagsContainer) return;
  const buttons = filterTagsContainer.querySelectorAll(".filter-tag");
  buttons.forEach(btn => {
    if (btn.getAttribute("data-tag") === activeTagFilter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}


// Setup currency changer segmented toggle
// Refresh the prices shown inside the glass-radio-group labels
// (e.g. "Classic ₹999" → "Classic $12" on USD toggle).
function updateHeroOfferCard() {
  const symEl = document.getElementById("hero-currency-symbol");
  const valEl = document.getElementById("hero-price-val");
  if (symEl && valEl) {
    symEl.textContent = getCurrencySymbol();
    valEl.textContent = PROMO_CONFIG.active
      ? (currentCurrency === "INR" ? PROMO_CONFIG.promoPriceINR : PROMO_CONFIG.promoPriceUSD)
      : (currentCurrency === "INR" ? 999 : 15);
  }
}

function updateTierLabels() {
  document.querySelectorAll("[data-tier-price]").forEach(el => {
    const tier = parseInt(el.getAttribute("data-tier-price"), 10);
    const base = TIER_BASE_PRICE[tier];
    if (!base) return;
    el.textContent = formatPrice(base.inr, base.usd);
  });
}

function updateHeaderCtaText() {
  const priceText = currentCurrency === "INR" ? "from ₹4,999" : "from $60";
  const shortPriceText = currentCurrency === "INR" ? "Custom (₹4.9k) 💬" : "Custom ($60) 💬";
  document.querySelectorAll(".header-cta").forEach(cta => {
    cta.innerHTML = `<span class="cta-text-full">Order Customization (${priceText}) 💬</span><span class="cta-text-short">${shortPriceText}</span>`;
    cta.title = `Exclusive custom designs & full customization start ${priceText}`;
  });
}

function initCurrencyDetection() {
  const saved = localStorage.getItem("invitestory_currency");
  if (saved === "INR" || saved === "USD") {
    currentCurrency = saved;
  } else {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const isIndia = tz === "Asia/Kolkata" || tz === "Asia/Calcutta";
      currentCurrency = isIndia ? "INR" : "USD";
    } catch (e) {
      currentCurrency = "INR";
    }
  }

  const inrBtn = document.getElementById("currency-inr");
  const usdBtn = document.getElementById("currency-usd");
  if (inrBtn && usdBtn) {
    if (currentCurrency === "USD") {
      usdBtn.classList.add("active");
      inrBtn.classList.remove("active");
    } else {
      inrBtn.classList.add("active");
      usdBtn.classList.remove("active");
    }
  }
  updatePaymentButtonsForCurrency();
}

function setupCurrencySwitcher() {
  const inrBtn = document.getElementById("currency-inr");
  const usdBtn = document.getElementById("currency-usd");

  if (inrBtn && usdBtn) {
    inrBtn.addEventListener("click", () => {
      if (currentCurrency === "INR") return;
      currentCurrency = "INR";
      localStorage.setItem("invitestory_currency", "INR");
      inrBtn.classList.add("active");
      usdBtn.classList.remove("active");

      // Re-render components
      updateHeroOfferCard();
      updateTierLabels();
      updateHeaderCtaText();
      renderPricingSection();
      setupMobilePricingCarousel();
      renderCatalogue();
      updatePaymentButtonsForCurrency();
    });

    usdBtn.addEventListener("click", () => {
      if (currentCurrency === "USD") return;
      currentCurrency = "USD";
      localStorage.setItem("invitestory_currency", "USD");
      usdBtn.classList.add("active");
      inrBtn.classList.remove("active");

      // Re-render components
      updateHeroOfferCard();
      updateTierLabels();
      updateHeaderCtaText();
      renderPricingSection();
      setupMobilePricingCarousel();
      renderCatalogue();
      updatePaymentButtonsForCurrency();
    });
  }
}

// Setup inputs and tabs handlers
function setupCatalogueHandlers() {
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (searchQuery.length > 0) {
        clearSearchBtn.style.display = "flex";
      } else {
        clearSearchBtn.style.display = "none";
      }
      renderCatalogue();
    });
  }
  
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchQuery = "";
      clearSearchBtn.style.display = "none";
      renderCatalogue();
    });
  }
  
  tierRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      activeTierFilter = parseInt(radio.value, 10);
      renderCatalogue();

      // Smooth-scroll the catalogue into view so users see the filtered
      // templates immediately after tapping a tier in the floating glider.
      // Skip when already in view (avoid jarring scroll loops).
      const catalogue = document.getElementById("catalogue-header");
      if (catalogue) {
        const rect = catalogue.getBoundingClientRect();
        const inView = rect.top >= -40 && rect.bottom <= (window.innerHeight + 40);
        if (!inView) {
          catalogue.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      // Dispatch public custom event so external listeners can react
      // without needing to know internal catalogue state.
      // Usage: document.addEventListener('filterTier', e => console.log(e.detail.tier));
      const tierNames = { "0": "all", "1": "classic", "2": "premium", "3": "luxury" };
      document.dispatchEvent(new CustomEvent("filterTier", {
        bubbles: true,
        detail: { tier: tierNames[radio.value] ?? radio.value, value: radio.value }
      }));
    });
  });
  
  if (filterTagsContainer) {
    filterTagsContainer.addEventListener("click", (e) => {
      const tagBtn = e.target.closest(".filter-tag");
      if (!tagBtn) return;

      activeTagFilter = tagBtn.getAttribute("data-tag");

      const buttons = filterTagsContainer.querySelectorAll(".filter-tag");
      buttons.forEach(b => {
        if (b === tagBtn) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });

      renderCatalogue();
    });
  }

  // Delegated Preview button click — survives re-renders from currency,
  // search, and tier-filter changes. Persistent listener on templatesGrid.
  if (templatesGrid) {
    templatesGrid.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-preview-trigger]");
      if (!trigger) return;
      const id = parseInt(trigger.getAttribute("data-preview-trigger"), 10);
      if (!Number.isNaN(id)) openPreview(id);
    });
  }

  // --- View Mode (Card Grid vs Compact List) ---
  const viewModeGridBtn = document.getElementById("view-mode-grid");
  const viewModeListBtn = document.getElementById("view-mode-list");

  function setViewMode(mode) {
    if (!templatesGrid) return;
    if (mode === "list") {
      templatesGrid.classList.add("view-list");
      if (viewModeListBtn) viewModeListBtn.classList.add("active");
      if (viewModeGridBtn) viewModeGridBtn.classList.remove("active");
    } else {
      templatesGrid.classList.remove("view-list");
      if (viewModeGridBtn) viewModeGridBtn.classList.add("active");
      if (viewModeListBtn) viewModeListBtn.classList.remove("active");
    }
    try {
      localStorage.setItem("invitestory_view_mode", mode);
    } catch(e) {}
  }

  try {
    const savedMode = localStorage.getItem("invitestory_view_mode");
    if (savedMode === "list") {
      setViewMode("list");
    }
  } catch(e) {}

  if (viewModeGridBtn) {
    viewModeGridBtn.addEventListener("click", () => setViewMode("grid"));
  }
  if (viewModeListBtn) {
    viewModeListBtn.addEventListener("click", () => setViewMode("list"));
  }
}

// --- Preview Modal init/wiring ---
function setupPreviewModal() {
  if (!previewModal) return;

  // Iframe load → fade in iframe, hide loader
  previewIframe.addEventListener("load", () => {
    // Skip the initial about:blank load
    if (previewIframe.src === "about:blank" || previewIframe.src === window.location.href + "about:blank") return;
    previewIframe.classList.add("is-loaded");
    previewLoader.classList.add("is-hidden");
    stopLoaderPulse();
  });

  // Delegated close: any element with [data-preview-close] inside the modal
  previewModal.addEventListener("click", (e) => {
    if (e.target.closest("[data-preview-close]")) {
      closePreview();
    }
  });

  // Prevent background scroll bleed/chaining on mobile touch and desktop wheel
  // When interacting with the modal backdrop, scrim, or modal controls, don't let it scroll the underlying window.
  previewModal.addEventListener("touchmove", (e) => {
    if (!previewModal.classList.contains("is-open")) return;
    // Allow touch scrolling ONLY inside the phone iframe viewport
    if (e.target && (e.target.closest("#preview-modal-iframe-wrap") || e.target.closest(".phone-screen-viewport") || e.target.closest("#preview-modal-iframe"))) {
      return;
    }
    // Block any scroll gesture on modal scrim/body backdrop from bubbling to the background page
    if (e.cancelable) {
      e.preventDefault();
    }
  }, { passive: false });

  previewModal.addEventListener("wheel", (e) => {
    if (!previewModal.classList.contains("is-open")) return;
    // If the wheel event is not directly inside the iframe wrap, cancel it to protect the background page
    if (e.target && (e.target.closest("#preview-modal-iframe-wrap") || e.target.closest(".phone-screen-viewport") || e.target.closest("#preview-modal-iframe"))) {
      return;
    }
    if (e.cancelable) {
      e.preventDefault();
    }
  }, { passive: false });

  // Navigation buttons & side arrows
  if (previewPrevBtn) previewPrevBtn.addEventListener("click", previewPrev);
  if (previewNextBtn) previewNextBtn.addEventListener("click", previewNext);
  if (previewSidePrev) previewSidePrev.addEventListener("click", previewPrev);
  if (previewSideNext) previewSideNext.addEventListener("click", previewNext);
  if (previewHomeBtn) previewHomeBtn.addEventListener("click", previewHome);
  if (previewBuyBtn)  previewBuyBtn.addEventListener("click", previewBuyNow);

  // Tier tabs
  previewTierTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tier = parseInt(tab.getAttribute("data-preview-tier"), 10);
      previewJumpTier(tier);
    });
  });

  // Responsive device scaling on window resize / orientation change
  window.addEventListener("resize", updatePreviewScale);
  window.addEventListener("orientationchange", updatePreviewScale);

  // Escape key closes the modal, PayPal checkout, payment success, or FAQ popup
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const successModal = document.getElementById("payment-success-modal");
      if (successModal && successModal.classList.contains("is-open")) {
        closePaymentSuccess();
        return;
      }
      const paypalModal = document.getElementById("paypal-checkout-modal");
      if (paypalModal && paypalModal.classList.contains("is-open")) {
        closePayPalCheckout();
        return;
      }
      const faqBackdrop = document.getElementById("preview-faq-backdrop");
      if (faqBackdrop && faqBackdrop.classList.contains("is-open")) {
        closePreviewFaq();
        return;
      }
      if (previewModal.classList.contains("is-open")) {
        closePreview();
      }
    }
  });

  // --- Spring-Damped 3D Physics System ---
  // Detect prefers-reduced-motion
  PhonePhysics.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stage = document.getElementById("preview-3d-stage");
  const rig = document.getElementById("preview-phone-3d-rig");
  if (stage && rig) {
    // Cache DOM elements for the physics loop (avoid per-frame lookups)
    PhonePhysics.els = {
      stage: stage,
      rig: rig,
      shadow: rig.querySelector(".phone-shadow-3d"),
      glareHighlight: document.getElementById("glare-highlight"),
      glareRim: document.getElementById("glare-rim"),
      glareAmbient: document.getElementById("glare-ambient")
    };

    // Mouse → set physics targets (NO direct DOM writes)
    stage.addEventListener("mousemove", (e) => {
      if (!previewModal.classList.contains("is-open")) return;
      if (previewState.viewMode !== "3d") return;
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      phonePhysicsSetMouseTarget(x, y);
    });

    stage.addEventListener("mouseleave", () => {
      if (previewState.viewMode === "3d") {
        phonePhysicsResetTarget();
      }
    });

    // Touch parallax for mobile (outer stage only; does not interfere with template scrolling inside iframe)
    let lastTouchTime = 0;
    stage.addEventListener("touchstart", (e) => {
      if (previewState.viewMode !== "3d") return;
    }, { passive: true });

    stage.addEventListener("touchmove", (e) => {
      if (!previewModal.classList.contains("is-open")) return;
      if (previewState.viewMode !== "3d") return;
      
      // If user is interacting directly inside the iframe wrap, don't tilt the phone
      if (e.target && (e.target.closest("#preview-modal-iframe-wrap") || e.target.closest(".phone-screen-viewport"))) {
        return;
      }

      const now = performance.now();
      if (now - lastTouchTime < 32) return; // limit to ~30Hz
      lastTouchTime = now;

      const t = e.touches[0];
      const rect = stage.getBoundingClientRect();
      const x = (t.clientX - rect.left) / rect.width - 0.5;
      const y = (t.clientY - rect.top) / rect.height - 0.5;
      phonePhysicsSetMouseTarget(x * 0.65, y * 0.65); // comfortable mobile sensitivity
    }, { passive: true });

    stage.addEventListener("touchend", () => {
      if (previewState.viewMode === "3d") {
        phonePhysicsResetTarget();
      }
    }, { passive: true });

    // Gyroscope tilt for mobile (premium feel)
    phonePhysicsInitGyroscope();
  }

  // Handle browser Back/Forward navigation smoothly
  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.modalOpen && e.state.templateId) {
      openPreview(e.state.templateId, false);
    } else if (previewModal && previewModal.classList.contains("is-open")) {
      closePreview(false);
    }
  });
}

// --- GSAP Animations (ScrollTrigger, Flip, ScrollToPlugin) ---
// Guard against the CDN failing to load.
function initAnimations() {
  if (typeof gsap === "undefined") return;

  gsap.registerPlugin(window.ScrollTrigger, window.Flip, window.ScrollToPlugin);

  // --- Hero entrance (runs once on page load) ---
  if (document.querySelector(".hero-headline")) {
    gsap.from(".hero-headline", {
      y: 28, opacity: 0, duration: 1, ease: "power3.out"
    });
  }
  if (document.querySelector(".hero-subheadline")) {
    gsap.from(".hero-subheadline", {
      y: 18, opacity: 0, duration: 0.8, delay: 0.15, ease: "power3.out"
    });
  }
  if (document.querySelector(".hero-process-line")) {
    gsap.from(".hero-process-line", {
      y: 14, opacity: 0, duration: 0.7, delay: 0.25, ease: "power3.out"
    });
  }
  if (document.querySelector(".hero-action-wrapper")) {
    gsap.from(".hero-action-wrapper", {
      y: 16, opacity: 0, duration: 0.7, delay: 0.35, ease: "power3.out"
    });
  }
  if (document.querySelector(".hero-proof-strip")) {
    gsap.from(".hero-proof-strip", {
      y: 14, opacity: 0, duration: 0.65, delay: 0.45, ease: "power3.out"
    });
  }
  if (document.querySelector(".hero-showroom-showcase")) {
    gsap.from(".showroom-card", {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, delay: 0.55, ease: "power3.out"
    });
  }

  // --- Pricing cards stagger as they scroll into view ---
  // immediateRender:false keeps cards visible if ScrollTrigger never fires
  // (e.g., the user already scrolled past before GSAP loaded).
  if (document.querySelector(".pricing-grid")) {
    gsap.from(".pricing-card", {
      y: 36, opacity: 0, duration: 0.75, stagger: 0.12, ease: "power3.out",
      immediateRender: false,
      scrollTrigger: {
        trigger: ".pricing-grid",
        start: "top 85%",
        once: true
      }
    });
  }

  // --- Floating tier nav slides up from below on load ---
  // Horizontal centering is handled cleanly by CSS (left: 0; right: 0; margin: 0 auto)
  if (document.querySelector(".tier-floating-nav")) {
    gsap.fromTo(".tier-floating-nav",
      { y: 60, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.8, delay: 0.4, ease: "power3.out" }
    );
  }

  // --- Floating WhatsApp button pops in ---
  if (document.querySelector(".floating-whatsapp")) {
    gsap.from(".floating-whatsapp", {
      scale: 0.8, opacity: 0, duration: 0.5, delay: 0.3, ease: "back.out(1.7)", immediateRender: false
    });
  }

  // --- "How it works" steps stagger in ---
  if (document.querySelector(".how-steps")) {
    gsap.from(".how-step", {
      y: 24, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
      immediateRender: false,
      scrollTrigger: { trigger: ".how-steps", start: "top 88%", once: true }
    });
  }

  // --- Testimonials fade-up stagger ---
  if (document.querySelector(".testimonials-grid")) {
    gsap.from(".testimonial-card", {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power2.out",
      immediateRender: false,
      scrollTrigger: { trigger: ".testimonials-grid", start: "top 90%", once: true }
    });
  }

  // --- FAQ section title + first item fade in ---
  if (document.querySelector(".faq-list")) {
    gsap.from(".faq-section .section-title, .faq-section .section-subtitle, .faq-list .faq-item", {
      y: 16, opacity: 0, duration: 0.55, stagger: 0.06, ease: "power2.out",
      immediateRender: false,
      scrollTrigger: { trigger: ".faq-list", start: "top 90%", once: true }
    });
  }

  // --- Template cards: animated in renderCatalogue() via gsap.from() ---
  // We intentionally do NOT use ScrollTrigger.batch here — see renderCatalogue()
  // comment for the reason.
}

// Refresh ScrollTrigger after catalogue re-renders so newly inserted
// template cards are picked up by the batch reveal.
function refreshScrollTriggers() {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.refresh();
  }
}

// --- Testimonials data ---
// NOTE: replace these with verbatim real reviews (first name + city + package/design).
// If "500+ couples" is aspirational, swap hero/proof copy to the true number.
const TESTIMONIALS = [
  {
    name: "Ananya & Rohan",
    wedding: "Pune · Premium (Ever After Bloom)",
    lang: "English",
    quote: "Relatives opened it on WhatsApp and thought we'd printed something fancy. Paid online, sent our photos, and the link was ready the next day."
  },
  {
    name: "Karthik & Deepa",
    wedding: "Hyderabad · Classic (Kalyana Mandapam)",
    lang: "English",
    quote: "My mother loved the mandapam design — it felt like our actual wedding hall. The venue map link saved us a hundred phone calls."
  },
  {
    name: "Rahul & Priya",
    wedding: "Delhi · Luxury (Rajwada Royale)",
    lang: "English",
    quote: "The palace-door opening gave everyone goosebumps. Guests kept asking where we got it made. Worth every rupee."
  },
  {
    name: "Arun & Kavitha",
    wedding: "Chennai · Premium (Ganesha Gopuram)",
    lang: "English",
    quote: "The temple bells at the start felt so auspicious. Our families shared it in every WhatsApp group within an hour."
  },
  {
    name: "Vivek & Sneha",
    wedding: "Bangalore · Luxury (Wax Seal Royale)",
    lang: "English",
    quote: "Breaking the wax seal on screen felt like opening a real letter. Payment took a minute and the team collected our details the same evening."
  },
  {
    name: "Cyril & Anjali",
    wedding: "Kochi · Premium (Saga of Love)",
    lang: "English",
    quote: "Our love-story timeline made my grandmother tear up. Two small text fixes and it was perfect — delivered in under 24 hours."
  }
];

function renderTestimonials() {
  const grid = document.getElementById("testimonials-grid");
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map(t => `
    <article class="testimonial-card">
      <p class="testimonial-quote">${t.quote}</p>
      <div class="testimonial-meta">
        <div class="testimonial-author">
          <span class="testimonial-author-name">${t.name}</span>
          <span class="testimonial-author-wedding">${t.wedding}</span>
        </div>
      </div>
    </article>
  `).join("");
}

// Wire the prev/next overlay buttons on the testimonials carousel.
// Each click scrolls by one card's width + the gap, snapping naturally
// to the next card via scroll-snap-type: x mandatory.
function setupTestimonialsNav() {
  const grid = document.getElementById("testimonials-grid");
  const prevBtn = document.getElementById("testimonials-prev");
  const nextBtn = document.getElementById("testimonials-next");
  if (!grid || !prevBtn || !nextBtn) return;

  const scrollStep = () => {
    const card = grid.querySelector(".testimonial-card");
    if (!card) return 300;
    return card.getBoundingClientRect().width + 14; // width + gap
  };

  prevBtn.addEventListener("click", () => {
    grid.scrollBy({ left: -scrollStep(), behavior: "smooth" });
  });
  nextBtn.addEventListener("click", () => {
    grid.scrollBy({ left: scrollStep(), behavior: "smooth" });
  });

  // Disable prev/next when the carousel is at the corresponding edge
  const updateDisabled = () => {
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    prevBtn.disabled = grid.scrollLeft <= 1;
    nextBtn.disabled = grid.scrollLeft >= maxScroll - 1;
  };
  grid.addEventListener("scroll", updateDisabled, { passive: true });
  window.addEventListener("resize", updateDisabled);
  updateDisabled();
}

// Trust marquee — clone the .trust-marquee-set so the track contains two
// identical sets; CSS animates translateX(0 → -50%) for a seamless loop.
function setupTrustMarquee() {
  const track = document.getElementById("trust-marquee-track");
  if (!track) return;
  const set = track.querySelector(".trust-marquee-set");
  if (!set) return;
  const clone = set.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.appendChild(clone);
}

// --- FAQ data ---
const FAQS = [
  {
    q: "How do I pay?",
    a: "Right on this site via Razorpay — UPI (GPay, PhonePe, Paytm, BHIM), cards or netbanking. One-time payment, no subscription. After you pay, we WhatsApp you a short checklist to collect your details."
  },
  {
    q: "When do you start work on my invite?",
    a: "The moment your payment is confirmed — paying first reserves your slot. Send your names, dates, photos and venue on WhatsApp and our team starts building the same day."
  },
  {
    q: "Can I see a demo before I pay?",
    a: "Absolutely. Tap any \"Preview Invitation →\" button on this page and the demo loads inside an in-page mobile-frame viewer — exactly as your guests will experience it. No payment needed to preview."
  },
  {
    q: "Can I see a draft before it's final?",
    a: "Yes — we share a preview link of your customised invite before finalising. Nothing goes final without your OK."
  },
  {
    q: "How many revisions are included?",
    a: "2 rounds of revisions are included free with every package, so your names, dates and details come out exactly right."
  },
  {
    q: "We have multiple functions (Haldi, Mehendi, Sangeet…). Is that covered?",
    a: "Yes — Premium and Luxury support multiple events (Haldi, Mehendi, Sangeet, Wedding, Reception) with a dedicated section and timeline for each. Classic covers a single event beautifully."
  },
  {
    q: "How long does customisation take?",
    a: "Standard delivery is 24 hours. With the Express 12h add-on (₹299) we deliver within 12 hours. Timelines start once you've paid and sent all your details and photos on WhatsApp."
  },
  {
    q: "How long is my invitation link live?",
    a: "Your invitestory.in link stays live for 1 year by default. You can extend it for another year for ₹199 if you'd like to keep the memories."
  },
  {
    q: "Can I add my own photos and music?",
    a: "Yes — every package supports custom couple photos (gallery of up to 12) and most designs support background music. Just send the files in your WhatsApp chat and we'll integrate them."
  },
  {
    q: "What about refunds?",
    a: "Please see our <a href=\"refund-and-editing-policy.html\" class=\"gold-text\" style=\"font-weight: 600; text-decoration: underline;\">Refund & Editing Policy</a> — in short: if the delivered invite doesn't match the chosen design, we revise it free until it does."
  },
  {
    q: "Do you have budget options under ₹700?",
    a: "Yes! If you are looking for simple budget-friendly single-page invitations, we have a dedicated collection at <a href=\"https://reveals.invitestory.in\" target=\"_blank\" rel=\"noopener\" class=\"gold-text\" style=\"font-weight: 600; text-decoration: underline;\">reveals.invitestory.in</a> with templates starting at just ₹699."
  }
];

function renderFaqs() {
  const list = document.getElementById("faq-list");
  if (!list) return;
  list.innerHTML = FAQS.map((f, i) => `
    <div class="faq-item" data-faq-index="${i}">
      <button type="button" class="faq-question" aria-expanded="false">
        <span>${f.q}</span>
        <span class="faq-toggle-icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-answer">
        <div class="faq-answer-inner">${f.a}</div>
      </div>
    </div>
  `).join("");
}

// "How It Works" toggle — collapsed by default. Clicking the button
// adds .is-open to the wrapper, which the CSS grid-rows trick animates
// from 0fr to 1fr for a smooth height reveal. Button label flips
// between "Show steps" / "Hide steps".
function setupHowItWorksToggle() {
  const toggle = document.getElementById("how-it-works-toggle");
  const wrap   = document.getElementById("how-steps-wrap");
  if (!toggle || !wrap) return;

  const textEl = toggle.querySelector(".how-toggle-text");
  // Ensure ARIA defaults are correct on load
  toggle.setAttribute("aria-expanded", "false");
  wrap.setAttribute("aria-hidden", "true");

  toggle.addEventListener("click", () => {
    const isOpen = wrap.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    wrap.setAttribute("aria-hidden", isOpen ? "false" : "true");
    if (textEl) textEl.textContent = isOpen ? "Hide steps" : "Show steps";
  });
}

function setupFaqHandlers() {
  const list = document.getElementById("faq-list");
  if (!list) return;
  list.addEventListener("click", (e) => {
    const q = e.target.closest(".faq-question");
    if (!q) return;
    const item = q.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const isOpen = item.classList.contains("is-open");

    // Capture state for Flip
    let state = null;
    if (typeof Flip !== "undefined") {
      state = Flip.getState(answer);
    }

    if (isOpen) {
      item.classList.remove("is-open");
      q.setAttribute("aria-expanded", "false");
    } else {
      item.classList.add("is-open");
      q.setAttribute("aria-expanded", "true");
    }

    if (state && typeof Flip !== "undefined") {
      Flip.from(state, {
        duration: 0.4,
        ease: "power2.inOut",
        absolute: true,
        onComplete: () => Flip.cleanup()
      });
    }
  });
}

// --- Urgency: countdown timer to August 15, 11:59:59 PM IST ---
function setupUrgency() {
  const endsAt = PROMO_CONFIG.endsAt;

  const timerEl = document.getElementById("urgency-timer");
  const topTimerEl = document.getElementById("promo-top-timer");
  const exitTimerEl = document.getElementById("exit-modal-timer");

  function tickCountdown() {
    const diff = Math.max(0, endsAt - Date.now());
    const d = Math.floor(diff / (24 * 60 * 60 * 1000));
    const h = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const s = Math.floor((diff % (60 * 1000)) / 1000);
    
    const formattedStr = d > 0
      ? `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
      : `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;

    if (timerEl) timerEl.textContent = formattedStr;
    if (topTimerEl) topTimerEl.textContent = formattedStr;
    if (exitTimerEl) exitTimerEl.textContent = formattedStr;
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  // Live viewers — random number in 18-45, refreshed every 7-12s
  const viewersEl = document.getElementById("urgency-viewers-count");
  if (viewersEl) {
    const updateViewers = () => {
      const n = 18 + Math.floor(Math.random() * 28);
      viewersEl.textContent = String(n);
    };
    updateViewers();
    setInterval(updateViewers, 7000 + Math.random() * 5000);
  }
}


function openCustomModal() {
  const modal = document.getElementById("custom-modal");
  if (!modal) return;

  const isINR = currentCurrency === "INR";
  const priceText = isINR ? "₹4,999" : "$60";
  const priceEl = document.getElementById("custom-modal-price");
  if (priceEl) priceEl.textContent = priceText;

  const waBtn = document.getElementById("custom-modal-wa-btn");
  if (waBtn) {
    const message = `Hi InviteStory, I would like to order Exclusive Customization & Bespoke Design (starting from ${priceText}). Please share details!`;
    waBtn.href = `https://wa.me/918281583882?text=${encodeURIComponent(message)}`;
    waBtn.onclick = () => {
      trackMetaEvent("Lead", {
        content_name: "Exclusive Customization Inquiry",
        content_category: `Exclusive Custom Design (${priceText})`,
        value: isINR ? 4999 : 60,
        currency: currentCurrency
      });
      closeCustomModal();
    };
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("preview-modal-open");
  document.body.classList.add("preview-modal-open");
}

function closeCustomModal() {
  const modal = document.getElementById("custom-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("preview-modal-open");
  document.body.classList.remove("preview-modal-open");
}

function setupHeaderCtaHandlers() {
  const headerCtas = document.querySelectorAll(".header-cta");
  headerCtas.forEach(cta => {
    cta.addEventListener("click", (e) => {
      if (document.getElementById("custom-modal")) {
        e.preventDefault();
        openCustomModal();
      }
    });
  });

  const customModal = document.getElementById("custom-modal");
  if (customModal) {
    customModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-custom-close]")) {
        closeCustomModal();
      }
    });
  }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  initCurrencyDetection();
  setupCurrencySwitcher();
  setupCatalogueHandlers();
  setupPreviewModal();
  setupFaqHandlers();
  setupHowItWorksToggle();
  setupUrgency();
  setupTestimonialsNav();
  setupTrustMarquee();
  setupResponsivePlaceholder();
  setupHeaderCtaHandlers();

  // Initial draw
  updateTierLabels();
  renderPricingSection();
  setupMobilePricingCarousel();
  renderCatalogue();
  handleInitialUrlRoute();
  renderTestimonials();
  renderFaqs();

  // GSAP animations after the first paint so initial positions are valid
  initAnimations();
  refreshScrollTriggers();

  // Floating WhatsApp Lead Tracking
  const floatingWa = document.getElementById("floating-whatsapp");
  if (floatingWa) {
    floatingWa.addEventListener("click", () => {
      trackMetaEvent("Lead", {
        content_name: "Floating WhatsApp Support Chat",
        content_category: "Customer Inquiry"
      });
    });
  }

  // Show the floating tier nav on all viewports.
  // (Previously it was removed from the DOM on mobile — now it stays.)
  showFloatingNav();
  window.addEventListener("resize", showFloatingNav);
  setupTierNavVisibility();
});

function showFloatingNav() {
  const nav = document.querySelector(".tier-floating-nav");
  if (!nav) return;
  // Always keep the nav visible — it's designed to work on all screen sizes
  nav.style.display = "";
}

// Swap the search input placeholder at the mobile breakpoint so the
// long desktop example list doesn't get truncated on small viewports.
function setupResponsivePlaceholder() {
  const input = document.getElementById("search-input");
  if (!input) return;
  const DESKTOP_PLACEHOLDER = "Search templates (e.g. Telugu, Ghibli, Nikah, Floral)";
  const MOBILE_PLACEHOLDER  = "Search templates…";
  const mq = window.matchMedia("(max-width: 768px)");
  const apply = () => {
    input.placeholder = mq.matches ? MOBILE_PLACEHOLDER : DESKTOP_PLACEHOLDER;
  };
  apply();
  if (mq.addEventListener) mq.addEventListener("change", apply);
  else if (mq.addListener) mq.addListener(apply);    // legacy Safari
}

// Hero offer card — scratch-to-reveal price interaction.
// Paints a rich metallic gold foil surface over the price, then erases it
// as the user drags (mouse or touch), emitting live sparkle dust particles.
// When ~38% of the surface is revealed, the foil smoothly dissolves with a
// celebratory gold confetti burst and unlocked badge transition.
function setupScratchReveal() {
  const canvas = document.getElementById("hero-scratch-canvas");
  const hint   = document.getElementById("hero-scratch-hint");
  const hintText = document.getElementById("hero-scratch-hint-text");
  const surface = document.getElementById("hero-scratch-surface");
  const priceRow = document.getElementById("hero-price-row");
  const sparkleLayer = document.getElementById("scratch-sparkle-layer");
  if (!canvas || !hint || !surface) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let drawing = false;
  let lastPoint = null;
  let revealed = false;
  let dpr = window.devicePixelRatio || 1;

  function paintSurface() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Multi-stop rich metallic gold foil gradient
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0,    "#fceabb");
    grad.addColorStop(0.3,  "#f8b500");
    grad.addColorStop(0.6,  "#e6c875");
    grad.addColorStop(0.85, "#b8860b");
    grad.addColorStop(1,    "#8a6207");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Metallic diagonal highlight sheen
    const hi = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    hi.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    hi.addColorStop(0.3, "rgba(255, 255, 255, 0.1)");
    hi.addColorStop(0.7, "rgba(0, 0, 0, 0)");
    hi.addColorStop(1, "rgba(0, 0, 0, 0.25)");
    ctx.fillStyle = hi;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Micro-texture cross hatch for lottery ticket metallic feel
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#1a1205";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    for (let x = -rect.height; x < rect.width; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + rect.height, rect.height);
      ctx.stroke();
    }
    ctx.restore();

    // Inset border frame line
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(3, 3, rect.width - 6, rect.height - 6);
    ctx.restore();

    // Foil Stamp Emblem & Label (Framed pill badge so text is self-contained)
    ctx.save();
    const badgeW = 150;
    const badgeH = 26;
    const badgeX = (rect.width - badgeW) / 2;
    const badgeY = (rect.height - badgeH) / 2;

    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "rgba(20, 14, 4, 0.4)";
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fill();
    ctx.shadowColor = "transparent";

    ctx.strokeStyle = "rgba(255, 240, 190, 0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#281b05";
    ctx.font = "700 10.5px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
    ctx.shadowOffsetY = 1;
    ctx.fillText("✨ SCRATCH TO REVEAL ✨", rect.width / 2, rect.height / 2);
    ctx.restore();
  }

  function getPoint(evt) {
    const rect = canvas.getBoundingClientRect();
    const src  = (evt.touches && evt.touches[0]) ? evt.touches[0] : evt;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  function spawnScratchSparkle(x, y) {
    if (!sparkleLayer) return;
    const count = Math.random() > 0.5 ? 2 : 3;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "scratch-sparkle-particle";
      p.style.left = x + "px";
      p.style.top = y + "px";

      const angle = Math.random() * Math.PI * 2;
      const dist = 14 + Math.random() * 26;
      const dx = Math.cos(angle) * dist + "px";
      const dy = Math.sin(angle) * dist + "px";

      p.style.setProperty("--dx", dx);
      p.style.setProperty("--dy", dy);

      sparkleLayer.appendChild(p);
      setTimeout(() => p.remove(), 450);
    }
  }

  function scratchAt(point) {
    if (!point) return;
    ctx.globalCompositeOperation = "destination-out";
    const r = 26;

    if (lastPoint) {
      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / 4));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = lastPoint.x + dx * t;
        const y = lastPoint.y + dy * t;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    lastPoint = point;

    spawnScratchSparkle(point.x, point.y);
    checkRevealProgress();
  }

  function checkRevealProgress() {
    if (revealed) return;
    const w = canvas.width;
    const h = canvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;
    let cleared = 0;
    const total = w * h;
    for (let i = 3; i < data.length; i += 32) {
      if (data[i] === 0) cleared++;
    }
    const samples = Math.ceil(total / 8);
    if (cleared / samples > 0.38) reveal();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    canvas.classList.add("is-revealed");
    if (surface) surface.classList.add("is-unlocked-surface");
    if (priceRow) priceRow.classList.add("is-revealed-price");

    if (hint) {
      hint.classList.add("is-unlocked-hint");
      if (hintText) {
        hintText.textContent = PROMO_CONFIG.active
          ? "Flat ₹815 Special Unlocked!"
          : (currentCurrency === "INR" ? "Starting at ₹999 Unlocked!" : "Starting at $15 Unlocked!");
      }
      const icon = hint.querySelector(".scratch-hint-icon");
      if (icon) {
        icon.outerHTML = `<svg class="scratch-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      }
    }
    spawnConfetti();
  }

  function spawnConfetti() {
    if (!surface || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layer = document.createElement("div");
    layer.className = "hero-confetti";
    surface.appendChild(layer);

    const palette = ["#d6b87c", "#e8cf94", "#b08a4a", "#f0d99e", "#ffffff", "#34d399"];
    const shapes  = ["", "is-circle", "is-ribbon"];
    const pieces  = 22;

    for (let i = 0; i < pieces; i++) {
      const piece = document.createElement("span");
      piece.className = "hero-confetti-piece" + (shapes[i % shapes.length] ? " " + shapes[i % shapes.length] : "");

      const angle  = Math.random() * Math.PI * 2;
      const radius = 60 + Math.random() * 90;
      const fall   = 40 + Math.random() * 60;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius + fall;
      const rot = (Math.random() * 720 - 360) + "deg";
      const delay = (Math.random() * 0.12) + "s";

      piece.style.setProperty("--tx", tx.toFixed(1) + "px");
      piece.style.setProperty("--ty", ty.toFixed(1) + "px");
      piece.style.setProperty("--r",  rot);
      piece.style.setProperty("--d",  delay);
      piece.style.setProperty("--c",  palette[i % palette.length]);
      layer.appendChild(piece);
    }

    setTimeout(() => layer.remove(), 1800);
  }

  // Mouse events
  canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    drawing = true;
    lastPoint = null;
    scratchAt(getPoint(e));
  });
  window.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    scratchAt(getPoint(e));
  });
  window.addEventListener("mouseup", () => { drawing = false; lastPoint = null; });

  // Touch events
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    drawing = true;
    lastPoint = null;
    scratchAt(getPoint(e));
  }, { passive: false });
  canvas.addEventListener("touchmove", (e) => {
    if (!drawing) return;
    e.preventDefault();
    scratchAt(getPoint(e));
  }, { passive: false });
  canvas.addEventListener("touchend", () => { drawing = false; lastPoint = null; });
  canvas.addEventListener("touchcancel", () => { drawing = false; lastPoint = null; });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!revealed) paintSurface();
    }, 150);
  });

  requestAnimationFrame(() => {
    paintSurface();
    if (reduceMotion) reveal();
  });
}

document.addEventListener("DOMContentLoaded", setupScratchReveal);

function setupMobilePricingCarousel() {
  const grid = document.querySelector(".pricing-grid");
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll(".pricing-card"));
  if (cards.length < 2) return;

  // Avoid stacking duplicate listeners when currency re-renders
  if (grid.dataset.carouselBound === "1") {
    // Still re-snap after re-render
  } else {
    grid.dataset.carouselBound = "1";
  }

  const dotsWrap = document.getElementById("pricing-dots");
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll("[data-pricing-dot]")) : [];
  const premium =
    grid.querySelector(".pricing-card.featured, .pricing-card-premium") ||
    cards[Math.min(1, cards.length - 1)];

  const mq = window.matchMedia("(max-width: 768px)");

  const setActive = (index) => {
    dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
  };

  const cardCenterInGrid = (card) => {
    // Use positions relative to the scroll container, not offsetParent quirks
    const gRect = grid.getBoundingClientRect();
    const cRect = card.getBoundingClientRect();
    return grid.scrollLeft + (cRect.left - gRect.left) + cRect.width / 2;
  };

  const nearestIndex = () => {
    const mid = grid.scrollLeft + grid.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(cardCenterInGrid(card) - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  const scrollToCard = (card, smooth) => {
    if (!card || !mq.matches) return;
    const gRect = grid.getBoundingClientRect();
    const cRect = card.getBoundingClientRect();
    const delta = (cRect.left + cRect.width / 2) - (gRect.left + gRect.width / 2);
    const left = Math.max(0, grid.scrollLeft + delta);
    grid.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  };

  const snapPremium = (smooth) => {
    if (!mq.matches) return;
    // Re-query in case DOM was replaced
    const liveGrid = document.querySelector(".pricing-grid");
    const livePremium =
      liveGrid?.querySelector(".pricing-card.featured, .pricing-card-premium") ||
      premium;
    if (!livePremium || !liveGrid) return;
    const liveCards = Array.from(liveGrid.querySelectorAll(".pricing-card"));
    scrollToCard(livePremium, smooth);
    const idx = liveCards.indexOf(livePremium);
    if (idx >= 0) setActive(idx);
  };

  if (grid.dataset.carouselListeners !== "1") {
    grid.dataset.carouselListeners = "1";
    let ticking = false;
    grid.addEventListener(
      "scroll",
      () => {
        if (!mq.matches) return;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          setActive(nearestIndex());
          ticking = false;
        });
      },
      { passive: true }
    );

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const liveCards = Array.from(
          document.querySelectorAll(".pricing-grid .pricing-card")
        );
        const i = Number(dot.getAttribute("data-pricing-dot"));
        if (!Number.isNaN(i) && liveCards[i]) {
          scrollToCard(liveCards[i], true);
          setActive(i);
        }
      });
    });

    mq.addEventListener("change", () => {
      setTimeout(() => snapPremium(false), 80);
    });
  }

  // Snap after layout: rAF cascade beats fonts/images shifting widths
  const run = () => snapPremium(false);
  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
  setTimeout(run, 50);
  setTimeout(run, 200);
  setTimeout(() => snapPremium(true), 500);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setTimeout(run, 30));
  }
  window.addEventListener("load", () => setTimeout(run, 30), { once: true });
}

function setupTierNavVisibility() {
  const nav = document.querySelector(".tier-floating-nav");
  const catalogue = document.querySelector(".catalogue-section, #catalogue, #catalogue-header");
  const pricing = document.querySelector(".pricing-section, #pricing");
  if (!nav) return;

  const mq = window.matchMedia("(max-width: 768px)");

  const update = () => {
    if (!mq.matches) {
      nav.classList.remove("is-hidden-for-pricing");
      nav.style.display = "";
      nav.style.opacity = "";
      nav.style.transform = "";
      nav.style.pointerEvents = "";
      nav.setAttribute("aria-hidden", "false");
      return;
    }
    // Hide over pricing / hero; show when catalogue is the focus
    const cat = catalogue || document.querySelector(".templates-grid");
    if (!cat) return;
    const catRect = cat.getBoundingClientRect();
    const pricingEl = pricing || document.querySelector("#pricing");
    const pricingRect = pricingEl ? pricingEl.getBoundingClientRect() : null;
    const vh = window.innerHeight || 0;

    const catalogueVisible = catRect.top < vh * 0.85 && catRect.bottom > vh * 0.25;
    const pricingDominant =
      pricingRect &&
      pricingRect.top < vh * 0.55 &&
      pricingRect.bottom > vh * 0.35;

    if (pricingDominant && !catalogueVisible) {
      nav.classList.add("is-hidden-for-pricing");
      nav.style.opacity = "0";
      nav.style.transform = "translateY(16px)";
      nav.style.pointerEvents = "none";
      nav.setAttribute("aria-hidden", "true");
    } else if (catalogueVisible) {
      nav.classList.remove("is-hidden-for-pricing");
      nav.style.opacity = "";
      nav.style.transform = "";
      nav.style.pointerEvents = "";
      nav.setAttribute("aria-hidden", "false");
    } else {
      // hero / footer / etc — keep out of the way
      nav.classList.add("is-hidden-for-pricing");
      nav.style.opacity = "0";
      nav.style.transform = "translateY(16px)";
      nav.style.pointerEvents = "none";
      nav.setAttribute("aria-hidden", "true");
    }
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  mq.addEventListener("change", update);
}

