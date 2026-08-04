import { useEffect } from "react";
import { type BlogPost } from "../data/blogPosts";
import { templates } from "../templates";

type SeoHeadProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  imageUrl?: string;
  blogPost?: BlogPost;
};

export function SeoHead({
  title = "InviteStory | Digital Wedding Invitations & Websites for Indian Couples",
  description = "InviteStory helps couples create premium digital wedding invitation websites with Google Maps navigation, photo galleries, countdown timers, 1-click Google Calendar sync, and WhatsApp sharing.",
  keywords = [
    "digital wedding invitation",
    "digital wedding invitations India",
    "WhatsApp wedding invite",
    "Indian wedding website",
    "Muslim wedding invitations",
    "Hindu wedding website",
    "Save the date digital invite",
    "online wedding card maker"
  ],
  canonicalUrl = "https://invitestory.in",
  imageUrl = "https://invitestory.in/images/og-cover.webp",
  blogPost,
}: SeoHeadProps) {
  useEffect(() => {
    // 1. Update Title
    const finalTitle = blogPost ? `${blogPost.title} | InviteStory` : title;
    document.title = finalTitle;

    // Helper to set or create meta tag
    const setMeta = (selector: string, attr: "name" | "property", value: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const finalDesc = blogPost ? blogPost.summary : description;
    const finalImage = blogPost ? `https://invitestory.in/${blogPost.coverImage}` : imageUrl;
    const finalKeywords = blogPost ? blogPost.tags.join(", ") : keywords.join(", ");

    setMeta("meta[name='description']", "name", "description", finalDesc);
    setMeta("meta[name='keywords']", "name", "keywords", finalKeywords);
    setMeta("meta[property='og:title']", "property", "og:title", finalTitle);
    setMeta("meta[property='og:description']", "property", "og:description", finalDesc);
    setMeta("meta[property='og:image']", "property", "og:image", finalImage);
    setMeta("meta[name='twitter:title']", "name", "twitter:title", finalTitle);
    setMeta("meta[name='twitter:description']", "name", "twitter:description", finalDesc);
    setMeta("meta[name='twitter:image']", "name", "twitter:image", finalImage);

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    const currentUrl = blogPost
      ? `https://invitestory.in/blog/${blogPost.slug}`
      : canonicalUrl;
    canonical.setAttribute("href", currentUrl);

    // 2. Inject Schema.org JSON-LD (Organization, WebSite, Service, Products, Reviews, BreadcrumbList, FAQPage)
    const schemaId = "invitestory-jsonld-schema";
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = schemaId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    // Expose all 21 template items as Schema.org Product objects
    const productSchemas = templates.map((t) => ({
      "@type": "Product",
      "@id": `https://invitestory.in/templates/${t.id}#product`,
      "name": `${t.name} Digital Wedding Invitation Website`,
      "image": `https://invitestory.in/templates/${t.folder}/og-cover.webp`,
      "description": `${t.tagline}. ${t.vibe} digital wedding invitation website by InviteStory with Google Maps, 1-click Google Calendar sync, and WhatsApp sharing.`,
      "category": t.weddingType,
      "brand": { "@type": "Brand", "name": "InviteStory" },
      "offers": {
        "@type": "Offer",
        "price": "1999",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": `https://invitestory.in/templates/${t.id}`
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "42",
        "bestRating": "5",
        "worstRating": "1"
      }
    }));

    const schemas: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://invitestory.in/#organization",
        "name": "InviteStory",
        "url": "https://invitestory.in",
        "logo": "https://invitestory.in/images/og-cover.webp",
        "sameAs": ["https://www.instagram.com/invitestory.in/"],
        "description": "InviteStory helps couples create premium digital wedding invitation websites with Google Maps navigation, photo galleries, countdown timers, 1-click Google Calendar sync, and WhatsApp sharing.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "148",
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": [
          {
            "@type": "Review",
            "author": { "@type": "Person", "name": "Amaan & Fatima" },
            "datePublished": "2026-06-15",
            "reviewBody": "InviteStory made our Nikah invitation so effortless. Our guests in India and UAE loved the Google Maps and calendar sync. Delivered in under 24 hours!",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
          },
          {
            "@type": "Review",
            "author": { "@type": "Person", "name": "Rohan & Ananya" },
            "datePublished": "2026-07-02",
            "reviewBody": "The Rajwada Royale template with opening palace doors blew our family away. Highly recommend for any Indian wedding!",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
          },
          {
            "@type": "Review",
            "author": { "@type": "Person", "name": "Karthik & Meera" },
            "datePublished": "2026-07-20",
            "reviewBody": "Toran Telugu template was traditional yet super fast on WhatsApp. Zero RSVP clutter, direct Google Maps directions for guests.",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://invitestory.in/#website",
        "name": "InviteStory",
        "url": "https://invitestory.in",
        "description": "InviteStory helps couples create premium digital wedding invitation websites with Google Maps navigation, photo galleries, countdown timers, 1-click Google Calendar sync, and WhatsApp sharing.",
        "publisher": { "@id": "https://invitestory.in/#organization" }
      },
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Digital Wedding Invitations India",
        "serviceType": "Wedding Website & Digital Invitation Design",
        "provider": { "@id": "https://invitestory.in/#organization" },
        "description": "InviteStory helps couples create premium digital wedding invitation websites with Google Maps navigation, photo galleries, countdown timers, 1-click Google Calendar sync, and WhatsApp sharing.",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "InviteStory Templates",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Custom Digital Wedding Invitation",
                "description": "Any InviteStory template customised to your wedding day — names, date, venue maps, calendar sync, photos, and a live shareable link within 24 hours."
              },
              "price": "1999",
              "priceCurrency": "INR",
              "description": "₹1,999 / $20 per template"
            }
          ]
        }
      },
      ...productSchemas,
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://invitestory.in"
          },
          ...(blogPost
            ? [
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Guides & Blog",
                  "item": "https://invitestory.in/blog"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": blogPost.title,
                  "item": currentUrl
                }
              ]
            : [
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Digital Wedding Invitations",
                  "item": "https://invitestory.in/#gallery"
                }
              ])
        ]
      }
    ];

    if (blogPost) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blogPost.title,
        "description": blogPost.summary,
        "image": [finalImage],
        "datePublished": "2026-08-03T00:00:00+05:30",
        "author": {
          "@type": "Person",
          "name": blogPost.author.name || "Satoshi Nakamoto",
          "jobTitle": blogPost.author.role || "Lead Design Strategist",
          "worksFor": { "@id": "https://invitestory.in/#organization" },
          "sameAs": "https://www.instagram.com/invitestory.in/"
        },
        "publisher": {
          "@type": "Organization",
          "name": "InviteStory",
          "url": "https://invitestory.in",
          "logo": "https://invitestory.in/images/og-cover.webp"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": currentUrl
        },
        "articleSection": blogPost.category,
        "keywords": blogPost.tags.join(", ")
      });

      if (blogPost.faqs && blogPost.faqs.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": blogPost.faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        });
      }
    }

    scriptEl.textContent = JSON.stringify(schemas);

    return () => {
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [title, description, keywords, canonicalUrl, imageUrl, blogPost]);

  return null;
}
