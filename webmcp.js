/**
 * WebMCP - Browser AI Model Context Protocol Tool Integration
 * Standard: https://webmachinelearning.github.io/webmcp/
 * Chrome reference: https://developer.chrome.com/blog/webmcp-epp
 */
(function initWebMCP() {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const signal = controller ? controller.signal : undefined;

  const tools = [
    {
      name: "search_wedding_invitations",
      description: "Search and filter interactive digital wedding invitation card templates on InviteStory by style, religion, cultural theme, or keyword.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search keyword such as Rajasthani, Nikah, South Indian, Botanical, Minimalist, Telugu, Royal"
          },
          category: {
            type: "string",
            enum: ["all", "royal", "islamic", "south-indian", "botanical", "modern"],
            description: "Optional category filter"
          }
        },
        required: ["query"]
      },
      execute: async ({ query, category }) => {
        const q = (query || "").toLowerCase();
        const catalogue = [
          { id: "diya-haveli", name: "Diya Haveli", style: "Royal Rajasthani Palace", priceINR: "₹1,999", previewUrl: "https://invitestory.in/assets/preview/diya-haveli.html" },
          { id: "emerald-nikah", name: "Emerald Nikah", style: "Islamic Nikah / Walima", priceINR: "₹1,999", previewUrl: "https://invitestory.in/assets/preview/emerald-nikah.html" },
          { id: "kalyana-mandapam", name: "Kalyana Mandapam", style: "South Indian & Telugu", priceINR: "₹1,999", previewUrl: "https://invitestory.in/assets/preview/kalyana-mandapam.html" },
          { id: "ever-after-bloom", name: "Ever After Bloom", style: "Botanical & Floral", priceINR: "₹1,999", previewUrl: "https://invitestory.in/assets/preview/ever-after-bloom.html" },
          { id: "slide-to-shaadi", name: "Slide to Shaadi", style: "Quirky & Modern Swipe", priceINR: "₹1,999", previewUrl: "https://invitestory.in/assets/preview/slide-to-shaadi.html" },
          { id: "sage-parchment", name: "Sage Parchment", style: "Minimalist Aesthetic", priceINR: "₹1,999", previewUrl: "https://invitestory.in/assets/preview/sage-parchment.html" }
        ];

        const matches = catalogue.filter(item =>
          q === "all" ||
          item.name.toLowerCase().includes(q) ||
          item.style.toLowerCase().includes(q) ||
          (category && category !== "all" && item.style.toLowerCase().includes(category))
        );

        return {
          status: "success",
          count: matches.length,
          results: matches.length > 0 ? matches : catalogue.slice(0, 4)
        };
      }
    },
    {
      name: "get_invitation_details",
      description: "Get detailed information, feature specifications, and preview links for an invitation template.",
      inputSchema: {
        type: "object",
        properties: {
          templateId: {
            type: "string",
            description: "The unique identifier or slug of the invitation template (e.g. 'diya-haveli', 'emerald-nikah')"
          }
        },
        required: ["templateId"]
      },
      execute: async ({ templateId }) => {
        return {
          templateId,
          deliveryTimeline: "24 hours standard (12 hours Express)",
          features: [
            "Interactive Touch animations & Page flips",
            "Google Maps venue location navigation",
            "Custom background music & Spotify playlist integration",
            "RSVP tracking via WhatsApp & web",
            "1 Year high-speed cloud hosting"
          ],
          pricing: {
            INR: "₹1,999",
            USD: "$25"
          },
          orderWhatsApp: "https://wa.me/918281583882?text=Hi%20InviteStory%2C%20I%20want%20to%20customize%20template%20" + encodeURIComponent(templateId)
        };
      }
    },
    {
      name: "get_wedding_planning_guide",
      description: "Retrieve curated wedding planning checklists, timeline countdowns, and guest RSVP advice.",
      inputSchema: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            enum: ["timeline", "rsvp", "checklist", "budget", "whatsapp"],
            description: "The planning topic to retrieve"
          }
        },
        required: ["topic"]
      },
      execute: async ({ topic }) => {
        const guides = {
          timeline: { title: "12-Month Wedding Planning Timeline", url: "https://invitestory.in/blog/12-month-pre-wedding-planning-timeline.html" },
          rsvp: { title: "Digital RSVP Tracking & Guest Management", url: "https://invitestory.in/blog/digital-rsvp-tracking-guest-management.html" },
          checklist: { title: "30 Days Before Wedding To-Do List", url: "https://invitestory.in/blog/30-days-before-wedding-to-do-list.html" },
          budget: { title: "Wedding Budget Matrix & Expenses Guide", url: "https://invitestory.in/blog/wedding-budget-matrix-expenses-guide.html" },
          whatsapp: { title: "Digital Shadi Card WhatsApp Sharing Guide", url: "https://invitestory.in/blog/digital-shadi-card-whatsapp-guide.html" }
        };

        return {
          status: "success",
          guide: guides[topic] || guides.timeline
        };
      }
    }
  ];

  function registerTools() {
    if (typeof navigator !== "undefined" && navigator.modelContext && typeof navigator.modelContext.registerTool === "function") {
      tools.forEach(tool => {
        try {
          navigator.modelContext.registerTool({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            execute: tool.execute,
            signal: signal
          });
        } catch (err) {
          console.warn("[WebMCP] Tool registration:", err);
        }
      });
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", registerTools);
    } else {
      registerTools();
    }
  } else {
    registerTools();
  }

  if (typeof window !== "undefined") {
    window.__webmcp_tools = tools;
    window.__webmcp_controller = controller;
  }
})();
