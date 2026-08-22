/**
 * InviteStory Simple Catalogue Directory
 * Features: INR/USD Currency Toggle, Accordion Detail Expanders, Live Add-ons Price Calculator, and WhatsApp Order URL Generators.
 */

// --- PROMOTION CONFIGURATION ---
window.RAZORPAY_KEY_ID = "rzp_live_TPCjiGiPIeo7SN";

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
    demoUrl: "https://invitestory-marigold-bhavan.vercel.app/",
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
    demoUrl: "https://invitestory-toran-telugu.vercel.app/",
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
    demoUrl: "https://invitestory-shubha-vivaham.vercel.app/",
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
    demoUrl: "https://invitestory-kalyana-mandapam.vercel.app/",
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
    demoUrl: "https://invitestory-sage-parchment.vercel.app/",
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
    demoUrl: "https://template-seashell-vows.vercel.app/",
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
    demoUrl: "https://invitestory-emerald-nikah.vercel.app/",
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
    demoUrl: "https://invitestory-noor-e-zahra.vercel.app/",
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
    demoUrl: "https://invitestory-royal-reception.vercel.app/",
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
    demoUrl: "https://invitestory-kerala-sands.vercel.app/",
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
    demoUrl: "https://invitestory-meadow-nikah.vercel.app/",
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
    demoUrl: "https://invitestory-grand-line-voyage.vercel.app/",
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
    demoUrl: "https://invitestory-ghibli-selfie.vercel.app/",
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
    demoUrl: "https://invitestory-ghibli-portrait.vercel.app/",
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
    demoUrl: "https://invitestory-lake-pichola.vercel.app/",
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
    demoUrl: "https://invitestory-ivory-waltz.vercel.app/",
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
    demoUrl: "https://invitestory-ever-after-bloom.vercel.app/",
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
    demoUrl: "https://invitestory-saga-of-love.vercel.app/",
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
    demoUrl: "https://template-lantern-madurai.vercel.app/",
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
    demoUrl: "https://template-lotus-leaf-bengaluru.vercel.app/",
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
    demoUrl: "https://invitestory-rajwada-royale-alt.vercel.app/",
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
    demoUrl: "https://invitestory-rajmahal-palace.vercel.app/",
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
    demoUrl: "https://invitestory-midnight-stargaze.vercel.app/",
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
    demoUrl: "https://invitestory-petal-path.vercel.app/",
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
    demoUrl: "https://invitestory-lakeview-lanterns.vercel.app/",
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
    demoUrl: "https://invitestory-lotus-barge.vercel.app/",
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
    demoUrl: "https://invitestory-ganesha-gopuram.vercel.app/",
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
    demoUrl: "https://invitestory-wax-seal-royale.vercel.app/",
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
    demoUrl: "https://template-diya-haveli.vercel.app/",
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
    demoUrl: "https://template-gilded-hall.vercel.app/",
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
    demoUrl: "https://template-slide-to-shaadi.vercel.app/",
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
  express: { name: "Express 12h Delivery", priceINR: 499, priceUSD: 6 },
  domain: { name: "Custom Domain (.in / .com)", priceINR: 999, priceUSD: 12 },
  lang: { name: "Extra Event Tab (e.g. Sangeet)", priceINR: 299, priceUSD: 4 }
};

// --- Preview Modal state & DOM refs ---
// Dynamic first template array-index for each tier
const TIER_FIRST_INDEX = {
  1: TEMPLATE_DATABASE.findIndex(t => t.tier === 1),
  2: TEMPLATE_DATABASE.findIndex(t => t.tier === 2),
  3: TEMPLATE_DATABASE.findIndex(t => t.tier === 3)
};
const previewState = { currentIndex: -1, lastFocusedElement: null };

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

// --- Render Tiers Table in Pricing Section ---
function renderPricingSection() {
  if (!pricingSection) return;
  const p1 = TIER_BASE_PRICE[1];
  const p2 = TIER_BASE_PRICE[2];
  const p3 = TIER_BASE_PRICE[3];

  const checkIcon = `<svg class="pricing-feature-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`;

  pricingSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">Beautiful doesn't have to be complicated.</h2>
      <p class="section-subtitle">One-time payment. No subscription. Delivered in 24 hours.</p>
      <div class="pricing-grid">        <!-- Tier 1: Classic -->
        <div class="pricing-card">
          <div class="pricing-card-header">
            <h3 class="pricing-card-name">🌿 Classic</h3>
            <div class="pricing-card-price-row">
              <span class="pricing-card-price">${formatPrice(p1.inr, p1.usd)}</span>
            </div>
          </div>
          <div class="pricing-card-tagline">“Timeless &amp; elegant.”</div>
          <ul class="pricing-card-features">
            <li class="pricing-card-feature-item">${checkIcon}<span>Single-page traditional Indian design</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>1-Tap Google Maps venue directions</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Live event countdown timer</span></li>
          </ul>
          <a href="#catalogue-header" class="pricing-card-cta" onclick="selectTier(1, true)">View Designs</a>
        </div>

        <!-- Tier 2: Premium (Hero / Most Popular) -->
        <div class="pricing-card featured pricing-card-premium">
          <div class="pricing-popular-badge">MOST POPULAR</div>
          <div class="pricing-card-header">
            <h3 class="pricing-card-name">🌸 Premium</h3>
            <div class="pricing-card-price-row">
              <span class="pricing-card-price">${formatPrice(p2.inr, p2.usd)}</span>
            </div>
          </div>
          <div class="pricing-card-tagline">“Your story, beautifully told.”</div>
          <ul class="pricing-card-features">
            <li class="pricing-card-feature-item">${checkIcon}<span>Custom watercolor &amp; animated illustrations</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Interactive love story &amp; milestones timeline</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Ambient romantic background music</span></li>
          </ul>
          <a href="#catalogue-header" class="pricing-card-cta" onclick="selectTier(2, true)">View Designs</a>
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
            <li class="pricing-card-feature-item">${checkIcon}<span>3D parallax sliding layers &amp; cinematic reveals</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Interactive envelope wax seal reveal</span></li>
            <li class="pricing-card-feature-item">${checkIcon}<span>Floating floral petals &amp; luxury motion</span></li>
          </ul>
          <a href="#catalogue-header" class="pricing-card-cta" onclick="selectTier(3, true)">Experience Luxury</a>
        </div>
      </div>

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
      <div class="template-card-media">
        <img src="${imgSrc}" alt="InviteStory - ${item.name} Digital Wedding Invitation Template" class="template-card-img" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="template-card-fallback-initial" style="display: none;">${initial}</div>
        <div class="template-card-overlay" aria-hidden="true"></div>
      </div>

      <div class="template-card-content">
        <div class="template-card-header">
          <h3 class="template-card-title">${item.name}</h3>
          <div class="template-card-tags">
            ${isPick ? '<span class="template-tag tag-pick">⭐ Our Pick</span>' : ''}
            ${item.style ? `<span class="template-tag tag-style">${item.style}</span>` : ''}
          </div>
        </div>

        <p class="template-card-desc">${item.desc}</p>

        <div class="template-card-price-wrap">
          <span class="template-card-price card-base-price" data-inr="${prices.priceINR}" data-usd="${prices.priceUSD}">${priceText}</span>
          <span class="template-card-tier-label">${tierName}</span>
        </div>

        <div class="template-card-actions">
          <button type="button" class="btn template-btn-preview-primary tier-btn-${item.tier}" data-preview-trigger="${item.id}" aria-label="Preview ${item.name} invitation demo">
            <span>Preview Invitation →</span>
          </button>
          <a href="#" class="template-card-wa-link" id="order-btn-${item.id}" onclick="event.preventDefault(); orderCustomTemplate(${item.id})" aria-label="Order ${item.name} on WhatsApp">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.075-2.227-.557-1.848-.762-3.033-2.639-3.125-2.762-.093-.122-.746-.992-.746-1.892 0-.9.471-1.343.639-1.527.168-.184.367-.23.49-.23.123 0 .245.001.352.006.113.006.264-.043.413.315.153.367.521 1.272.568 1.365.046.092.077.2.015.322-.061.123-.092.2-.184.307-.092.108-.194.24-.276.323-.093.092-.19.192-.082.377.108.184.478.788 1.025 1.275.704.628 1.298.822 1.482.914.184.092.291.077.399-.046.108-.123.46-0.537.583-.721.123-.184.246-.153.414-.092.169.061 1.074.507 1.258.6.184.092.307.138.353.215.046.077.046.445-.098.85zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.957-1.399C8.397 21.493 10.144 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            <span>Order on WhatsApp</span>
          </a>
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
    handler: function (response) {
      trackMetaEvent("Purchase", {
        content_name: item.name,
        content_ids: [String(item.id)],
        content_type: "product",
        value: totalVal,
        currency: currencyCode,
        transaction_id: response.razorpay_payment_id
      });

      alert(`🎉 Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\nTemplate: ${item.name}\n\nClick OK to open WhatsApp and send your wedding details for customization!`);

      const waMsg = `Hi InviteStory! I have paid online for '${item.name}' (Payment ID: ${response.razorpay_payment_id}). Here are my wedding details:`;
      window.open(`https://wa.me/918281583882?text=${encodeURIComponent(waMsg)}`, "_blank");
    }
  };

  if (typeof Razorpay !== "undefined") {
    const rzp = new Razorpay(options);
    rzp.open();
  } else {
    alert("Razorpay SDK is loading. Please try again in a moment!");
  }
}

// --- Preview Modal functions ---

// Open the in-page preview modal for a given template id.
function openPreview(id) {
  const idx = TEMPLATE_DATABASE.findIndex(x => x.id === id);
  if (idx === -1) return;

  const item = TEMPLATE_DATABASE[idx];
  previewState.currentIndex = idx;
  previewState.lastFocusedElement = document.activeElement;

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
  // Update the "Make it yours — ₹X" CTA price
  const previewCtaPrice = document.getElementById("preview-cta-price");
  if (previewCtaPrice) {
    previewCtaPrice.textContent = formatPrice(prices.priceINR, prices.priceUSD);
  }
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

  // Reset iframe load state and start loading the new demo
  previewIframe.classList.remove("is-loaded");
  previewLoader.classList.remove("is-hidden");
  startLoaderPulse();
  previewIframe.src = item.demoUrl;

  // Sync tier-tab active state to current template
  updatePreviewTierTabs(item.tier);

  // Show modal & update device scale to fit available viewport seamlessly
  previewModal.classList.add("is-open");
  previewModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("preview-modal-open");
  requestAnimationFrame(updatePreviewScale);

  // Move focus to the close button for keyboard users
  const closeBtn = previewModal.querySelector(".preview-modal-close");
  if (closeBtn) closeBtn.focus();
}

// Dynamically scale the 375x812 device mockup frame to fit available body height/width
function updatePreviewScale() {
  if (!previewIframeWrap || !previewModal || !previewModal.classList.contains("is-open")) return;
  const body = previewModal.querySelector(".preview-modal-body");
  if (!body) return;

  const availWidth = body.clientWidth - 20;
  const availHeight = body.clientHeight - 12;
  
  const targetWidth = 375;
  const targetHeight = 812;

  const scaleX = availWidth / targetWidth;
  const scaleY = availHeight / targetHeight;
  const scale = Math.min(scaleX, scaleY);

  const clampedScale = Math.max(0.42, Math.min(1.0, scale));
  previewIframeWrap.style.transform = `scale(${clampedScale})`;
}

// Close the preview modal and restore body scroll + focus.
function closePreview() {
  if (!previewModal.classList.contains("is-open")) return;

  if (document.activeElement && previewModal.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("preview-modal-open");
  stopLoaderPulse();

  // Detach iframe src after the close transition so we don't keep a network
  // request alive for a demo the user already saw.
  setTimeout(() => {
    previewIframe.src = "about:blank";
    previewIframe.classList.remove("is-loaded");
    previewLoader.classList.remove("is-hidden");
  }, 350);

  previewState.currentIndex = -1;

  // Restore focus to the originating trigger
  if (previewState.lastFocusedElement && typeof previewState.lastFocusedElement.focus === "function") {
    previewState.lastFocusedElement.focus();
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

// Open WhatsApp with a clean (no-addons) message for the currently previewed template.
function previewBuyNow() {
  if (previewState.currentIndex < 0) return;
  const id = TEMPLATE_DATABASE[previewState.currentIndex].id;
  const item = TEMPLATE_DATABASE[previewState.currentIndex];
  if (item) {
    const prices = getItemPrices(item);
    const totalVal = currentCurrency === "INR" ? prices.priceINR : prices.priceUSD;

    trackMetaEvent("InitiateCheckout", {
      content_name: item.name,
      content_ids: [String(item.id)],
      content_type: "product",
      content_category: item.style || "Digital Wedding Invitation",
      value: totalVal,
      currency: currentCurrency,
      num_items: 1
    });

    trackMetaEvent("Purchase", {
      content_name: item.name,
      content_ids: [String(item.id)],
      content_type: "product",
      content_category: item.style || "Digital Wedding Invitation",
      value: totalVal,
      currency: currentCurrency,
      num_items: 1
    });
  }

  const message = buildWhatsAppMessage(id, /* includeAddons */ false);
  window.open(`https://wa.me/918281583882?text=${encodeURIComponent(message)}`, "_blank");
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

function setupCurrencySwitcher() {
  const inrBtn = document.getElementById("currency-inr");
  const usdBtn = document.getElementById("currency-usd");

  if (inrBtn && usdBtn) {
    inrBtn.addEventListener("click", () => {
      if (currentCurrency === "INR") return;
      currentCurrency = "INR";
      inrBtn.classList.add("active");
      usdBtn.classList.remove("active");

      // Re-render components
      updateHeroOfferCard();
      updateTierLabels();
      updateHeaderCtaText();
      renderPricingSection();
      renderCatalogue();
    });

    usdBtn.addEventListener("click", () => {
      if (currentCurrency === "USD") return;
      currentCurrency = "USD";
      usdBtn.classList.add("active");
      inrBtn.classList.remove("active");

      // Re-render components
      updateHeroOfferCard();
      updateTierLabels();
      updateHeaderCtaText();
      renderPricingSection();
      renderCatalogue();
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

  // Escape key closes the modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && previewModal.classList.contains("is-open")) {
      closePreview();
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
const TESTIMONIALS = [
  {
    name: "Cyril & Anjali",
    wedding: "Kochi · Catholic wedding",
    lang: "Manglish",
    quote: "Sneham thonnunnathu! Gift box opening maari oru visual story aayi, family oru maatharam chodichu. WhatsApp-il 18 hours-il ready aayi. Recommended!"
  },
  {
    name: "Rahul & Priya",
    wedding: "Delhi · Punjabi wedding",
    lang: "Hinglish",
    quote: "Yaar, design dekhke maza aa gaya. Palace door reveal waali Luxury template li — sab guests ne pucha \"kahan se banwaaya?\". 24 ghante mein link mil gaya."
  },
  {
    name: "Karthik & Deepa",
    wedding: "Hyderabad · Telugu wedding",
    lang: "Telugu",
    quote: "Chala bagundi ra! Mandapam backdrop chusi amma chala sandhehamgaa chusi, link ayithe friends antha share chesukunnaru. Customisation fast ga."
  },
  {
    name: "Arun & Kavitha",
    wedding: "Chennai · Tamil Brahmin wedding",
    lang: "Tamil",
    quote: "Romba nalla irundhadhu! Temple gopuram open aagumbothu oru divine feel — WhatsApp la 12 hours la link ready. Family ellarum very happy."
  },
  {
    name: "Rohan & Meera",
    wedding: "Mumbai · Marathi wedding",
    lang: "Hinglish",
    quote: "Initially confused tha custom wedding invite ke baare mein, but inka ne explain kiya sample se. Got our invitestory.in link in less than a day — ekdum smooth experience."
  },
  {
    name: "Vivek & Sneha",
    wedding: "Bangalore · Kannada wedding",
    lang: "English",
    quote: "Honestly the best money we spent on wedding prep. Guests said the wax-seal animation was magical. Will recommend to every couple we know."
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
    q: "What exactly do I get after I order?",
    a: "Within 24 hours (or 12 hours if you choose the Express add-on), we hand-craft your invite with your names, dates, photos, venue map, and event timeline — and send you a private invitestory.in link that you can share with your guests on WhatsApp, email or Instagram."
  },
  {
    q: "How long does customisation take?",
    a: "Standard delivery is 24 hours. With the Express add-on (₹499) we deliver within 12 hours. Both timelines start once you send us all your details and photos on WhatsApp."
  },
  {
    q: "Can I add my own photos and music?",
    a: "Yes — every template supports custom couple photos (gallery of up to 12) and most support background music. Just send the files in your WhatsApp chat and we'll integrate them."
  },
  {
    q: "Do you offer refunds if I don't like it?",
    a: "If the delivered invite doesn't match the chosen template, we'll revise it for free. If you're still unhappy after a revision, we offer a full refund within 7 days of delivery. We want you to feel confident ordering."
  },
  {
    q: "Is the wedding link permanent? Will it work after the wedding?",
    a: "Your invitestory.in link stays live for 1 year by default — long enough for any guests who couldn't attend to revisit later. We can extend it for an additional year for ₹199 if you'd like to keep the memories."
  },
  {
    q: "Can I see a demo before I pay?",
    a: "Absolutely. Tap any \"Preview Invitation →\" button on this page and the demo will load inside an in-page mobile-frame viewer — exactly as your guests will experience it. No payment needed to preview."
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

// --- Exit-intent modal ---
function setupExitIntent() {
  const modal   = document.getElementById("exit-intent-modal");
  const cta     = document.getElementById("exit-intent-cta");
  if (!modal) return;
  if (sessionStorage.getItem("exit_intent_shown")) return; // once per session

  let shown = false;
  const showModal = () => {
    if (shown) return;
    shown = true;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("preview-modal-open");
    sessionStorage.setItem("exit_intent_shown", "1");
  };
  const hideModal = () => {
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("preview-modal-open");
  };

  // Desktop: detect mouse leaving through the top of the viewport
  document.addEventListener("mouseout", (e) => {
    if (e.clientY <= 0 && !shown) showModal();
  });

  // Mobile fallback: after 60% scroll OR 45s on page, whichever first
  let scrollTriggered = false;
  const onScroll = () => {
    if (scrollTriggered) return;
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (scrolled > 0.6) { scrollTriggered = true; showModal(); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  setTimeout(() => { if (!shown) showModal(); }, 45000);

  // Close handlers
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-exit-close]")) hideModal();
  });

  // CTA: open WhatsApp
  if (cta) {
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      trackMetaEvent("Lead", {
        content_name: "Exit Intent WhatsApp Inquiry",
        content_category: "Catalog Inquiry",
        value: currentCurrency === "INR" ? 999 : 15,
        currency: currentCurrency
      });
      trackMetaEvent("InitiateCheckout", {
        content_name: "Catalog Inquiry",
        value: currentCurrency === "INR" ? 999 : 15,
        currency: currentCurrency
      });
      const message = "Hi InviteStory! I'm interested in ordering a digital wedding invitation card. Please share details!";
      window.open(`https://wa.me/918281583882?text=${encodeURIComponent(message)}`, "_blank");
      hideModal();
    });
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
  document.body.classList.add("preview-modal-open");
}

function closeCustomModal() {
  const modal = document.getElementById("custom-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
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
  setupCurrencySwitcher();
  setupCatalogueHandlers();
  setupPreviewModal();
  setupFaqHandlers();
  setupHowItWorksToggle();
  setupUrgency();
  setupExitIntent();
  setupTestimonialsNav();
  setupTrustMarquee();
  setupResponsivePlaceholder();
  setupHeaderCtaHandlers();

  // Initial draw
  updateTierLabels();
  renderPricingSection();
  renderCatalogue();
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
