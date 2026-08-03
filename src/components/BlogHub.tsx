import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  MagnifyingGlass,
  Sparkle,
  Tag,
  WhatsappLogo,
  FileText,
} from "@phosphor-icons/react";
import { BLOG_POSTS, type BlogPost } from "../data/blogPosts";
import { WHATSAPP_URL } from "../contact";
import { SeoHead } from "./SeoHead";

const CATEGORIES = [
  "All",
  "Guides & Trends",
  "Cultural Styles",
  "Budget & Eco",
  "Wording & Etiquette",
] as const;

type Category = (typeof CATEGORIES)[number];

export function BlogHub() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const reduce = useReducedMotion();

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      if (selectedCategory !== "All" && post.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = filteredPosts[0] || BLOG_POSTS[0];
  const regularPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : (filteredPosts.length === 1 ? filteredPosts : []);

  return (
    <div className="min-h-screen bg-night text-bone antialiased">
      <SeoHead
        title="Blog & Insights | Digital Wedding Invitations in India — InviteStory"
        description="Comprehensive guides, cultural invitation etiquette, template comparisons, and eco-friendly budget tips for modern Indian digital wedding cards."
        keywords={["digital wedding invite blog", "Indian wedding invitation guide", "WhatsApp wedding card tips", "Muhurtham card wording"]}
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[72px] md:px-8">
          <a
            href="./"
            className="inline-flex items-center gap-2 text-caption uppercase tracking-eyebrow text-bone/70 transition-colors hover:text-bone"
          >
            <ArrowLeft weight="bold" className="h-4 w-4" />
            Home / Gallery
          </a>

          <a href="#" className="text-lg font-semibold tracked-display text-bone md:text-xl">
            InviteStory Blog
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill bg-emerald px-4 py-2 text-caption font-medium uppercase tracking-eyebrow text-bone transition-colors hover:bg-emerald-soft md:px-5"
          >
            <WhatsappLogo weight="fill" className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        {/* Title Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-pill border border-emerald/30 bg-emerald/10 px-3.5 py-1.5 text-caption uppercase tracking-eyebrow text-emerald-soft">
            <Sparkle weight="fill" className="h-3.5 w-3.5" />
            Knowledge & Insights
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracked-display text-bone md:text-5xl lg:text-6xl">
            Digital Wedding Invites, Traditions & Design
          </h1>
          <p className="mt-4 text-base leading-relaxed text-bone/70 md:text-lg">
            Expert guides on modern Indian wedding invitations, regional traditions, wording etiquette, eco-friendly savings, and AI-first discoverability.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-10 flex flex-col gap-5 border-y border-line py-6 md:flex-row md:items-center md:justify-between">
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-pill px-4 py-2 text-caption uppercase tracking-eyebrow transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-emerald text-bone shadow-calm"
                    : "border border-line bg-night-card text-bone/65 hover:border-bone/30 hover:text-bone"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <MagnifyingGlass weight="bold" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles or tags..."
              className="w-full rounded-pill border border-line bg-night-card pl-11 pr-5 py-2.5 text-sm text-bone placeholder:text-bone/40 focus:border-emerald focus:outline-none"
            />
          </div>
        </div>

        {/* Featured Hero Article */}
        {featuredPost && !searchQuery && selectedCategory === "All" && (
          <motion.article
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative mt-10 overflow-hidden rounded-card border border-line bg-night-card shadow-calm transition-all hover:border-bone/20"
          >
            <a href={`?blog=${featuredPost.slug}`} className="grid gap-6 md:grid-cols-12 md:items-center">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-night-soft md:col-span-6 md:aspect-[4/3]">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-pill bg-night/80 backdrop-blur-md px-3.5 py-1 text-caption uppercase tracking-eyebrow text-emerald-soft border border-line">
                  Featured
                </span>
              </div>

              <div className="p-6 md:col-span-6 md:p-8 md:pr-10">
                <div className="flex items-center gap-3 text-caption uppercase tracking-eyebrow text-bone/60">
                  <span className="text-emerald-soft">{featuredPost.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock weight="bold" className="h-3.5 w-3.5" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-semibold tracked-display leading-snug text-bone md:text-3xl lg:text-4xl group-hover:text-emerald-soft transition-colors">
                  {featuredPost.title}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-bone/70 md:text-base">
                  {featuredPost.subtitle}
                </p>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-line">
                  <div className="flex items-center gap-3">
                    <span className="text-caption font-medium text-bone">{featuredPost.author.name}</span>
                    <span className="text-caption text-bone/40">• {featuredPost.publishDate}</span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-caption font-semibold uppercase tracking-eyebrow text-emerald-soft">
                    Read Article
                    <ArrowRight weight="bold" className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </a>
          </motion.article>
        )}

        {/* Regular Articles Grid */}
        <div className="mt-12">
          <h2 className="text-caption uppercase tracking-eyebrow text-bone/50">
            {filteredPosts.length} Articles Available
          </h2>

          <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(selectedCategory !== "All" || searchQuery ? filteredPosts : regularPosts).map((post, index) => (
              <motion.article
                key={post.slug}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group flex flex-col justify-between overflow-hidden rounded-card border border-line bg-night-card p-5 shadow-calm transition-all hover:border-bone/25"
              >
                <div>
                  <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-night-soft">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-soft group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-caption uppercase tracking-eyebrow text-bone/50">
                    <span className="text-emerald-soft font-medium">{post.category}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <a href={`?blog=${post.slug}`} className="block">
                    <h3 className="mt-2 text-xl font-semibold tracked-display leading-tight text-bone group-hover:text-emerald-soft transition-colors">
                      {post.title}
                    </h3>
                  </a>

                  <p className="mt-2 text-xs leading-relaxed text-bone/65 line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded bg-night-soft px-2 py-0.5 text-[10px] text-bone/60">
                        <Tag weight="bold" className="h-2.5 w-2.5" />
                        {t}
                      </span>
                    ))}
                  </div>

                  <a
                    href={`?blog=${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-bone hover:text-emerald-soft transition-colors"
                  >
                    Read <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-20 text-center text-bone/50">
              <p className="text-base">No articles found matching "{searchQuery}".</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-pill border border-line bg-night-card px-4 py-2 text-caption uppercase text-bone hover:border-bone/40"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* AI & Search Engine Direct Links Section */}
        <section className="mt-20 rounded-card border border-line bg-night-soft p-8 text-center md:p-12">
          <h3 className="text-xl font-semibold tracked-display text-bone md:text-2xl">
            Optimized for Search & AI Search Engines
          </h3>
          <p className="mt-2 max-w-xl mx-auto text-sm text-bone/60">
            InviteStory documentation, template specs, and blog content are published under open LLM standards for AI assistant search engines.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill border border-line bg-night-card px-4 py-2 text-caption uppercase text-bone/80 hover:text-bone hover:border-emerald"
            >
              <FileText weight="bold" className="h-4 w-4" />
              llms.txt Summary
            </a>
            <a
              href="llms-full.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill border border-line bg-night-card px-4 py-2 text-caption uppercase text-bone/80 hover:text-bone hover:border-emerald"
            >
              <FileText weight="bold" className="h-4 w-4" />
              llms-full.txt Corpus
            </a>
            <a
              href="sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill border border-line bg-night-card px-4 py-2 text-caption uppercase text-bone/80 hover:text-bone hover:border-emerald"
            >
              <FileText weight="bold" className="h-4 w-4" />
              sitemap.xml
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-10 text-center">
        <p className="text-caption uppercase tracking-eyebrow text-bone/40">
          InviteStory Knowledge Hub — 10 High-Intent Articles
        </p>
      </footer>
    </div>
  );
}
