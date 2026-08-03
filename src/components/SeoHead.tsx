import { useEffect } from "react";
import { type BlogPost } from "../data/blogPosts";

type SeoHeadProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  imageUrl?: string;
  blogPost?: BlogPost;
};

export function SeoHead({
  title = "InviteStory | Digital Wedding Invitations for Indian Couples",
  description = "Handcrafted digital wedding invitations for Indian couples. Browse 20 live templates - royal palace, South Indian, Nikah, garden, and beach - then customise yours.",
  keywords = ["digital wedding invitation", "WhatsApp wedding invite", "Indian wedding cards", "wedding invitation templates"],
  canonicalUrl = "https://invitestory.in",
  imageUrl = "https://invitestory.in/images/og-cover.webp",
  blogPost,
}: SeoHeadProps) {
  useEffect(() => {
    // 1. Update Title
    const finalTitle = blogPost ? `${blogPost.title} | InviteStory Blog` : title;
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
      ? `https://invitestory.in/?blog=${blogPost.slug}`
      : canonicalUrl;
    canonical.setAttribute("href", currentUrl);

    // 2. Inject JSON-LD Schema
    const schemaId = "invitestory-jsonld-schema";
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = schemaId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    const schemas: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "InviteStory",
        "url": "https://invitestory.in",
        "logo": "https://invitestory.in/favicon.ico",
        "sameAs": ["https://www.instagram.com/invitestory.in/"],
        "description": "Handcrafted digital web invitations for Indian couples with 1-event rule and zero RSVP friction."
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "InviteStory",
        "url": "https://invitestory.in",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://invitestory.in/?blog=all&search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "InviteStory Digital Wedding Invitation",
        "description": "Interactive web wedding invitation for Indian couples. Delivered in 24 hours with Google Calendar and Maps.",
        "brand": {
          "@type": "Brand",
          "name": "InviteStory"
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "lowPrice": "999",
          "highPrice": "2999",
          "offerCount": "20"
        }
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
          "name": blogPost.author.name,
          "jobTitle": blogPost.author.role
        },
        "publisher": {
          "@type": "Organization",
          "name": "InviteStory",
          "url": "https://invitestory.in"
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
      // Clean up script on unmount
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [title, description, keywords, canonicalUrl, imageUrl, blogPost]);

  return null;
}
