import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  ShareNetwork,
  Sparkle,
  WhatsappLogo,
  ArrowUpRight,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { BLOG_POSTS, type BlogPost } from "../data/blogPosts";
import { templates, type Template } from "../templates";
import { WHATSAPP_URL, whatsappForTemplate } from "../contact";
import { SeoHead } from "./SeoHead";

type BlogPostViewProps = {
  post: BlogPost;
};

export function BlogPostView({ post }: BlogPostViewProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAiSummary, setCopiedAiSummary] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Calculate reading progress percentage
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Match recommended templates
  const recommendedTemplates: Template[] = post.recommendedTemplateIds
    .map((id) => templates.find((t) => t.id === id || t.folder === `template-${id}`))
    .filter((t): t is Template => Boolean(t));

  // Find next and previous posts
  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  const copyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyAiSummaryText = () => {
    const text = `AI Summary of "${post.title}":\n${post.aiSummary}\nSource: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopiedAiSummary(true);
    setTimeout(() => setCopiedAiSummary(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Read this article on digital wedding invites: ${post.title}\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-night text-bone antialiased">
      <SeoHead blogPost={post} />

      {/* Reading Progress Indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-emerald transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[72px] md:px-8">
          <a
            href="?blog=all"
            className="inline-flex items-center gap-2 text-caption uppercase tracking-eyebrow text-bone/70 transition-colors hover:text-bone"
          >
            <ArrowLeft weight="bold" className="h-4 w-4" />
            All Articles
          </a>

          <p className="hidden truncate text-sm font-medium text-bone md:block max-w-md">
            {post.title}
          </p>

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

      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-16">
        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-2 text-caption uppercase tracking-eyebrow text-bone/50">
          <a href="./" className="hover:text-bone">Home</a>
          <span>/</span>
          <a href="?blog=all" className="hover:text-bone">Blog</a>
          <span>/</span>
          <span className="text-emerald-soft truncate max-w-[200px]">{post.category}</span>
        </nav>

        {/* Title & Metadata */}
        <header className="mt-6 border-b border-line pb-8">
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-emerald/30 bg-emerald/10 px-3.5 py-1 text-caption uppercase tracking-eyebrow text-emerald-soft">
            {post.category}
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracked-display leading-tight text-bone md:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg text-bone/70 md:text-xl leading-relaxed">
            {post.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-line/60 text-sm text-bone/60">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-bone">{post.author.name}</p>
                <p className="text-xs text-bone/50">{post.author.role} • {post.publishDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-bone/60">
                <Clock weight="bold" className="h-3.5 w-3.5" />
                {post.readTime}
              </span>

              <button
                type="button"
                onClick={copyUrl}
                title="Copy Link"
                className="rounded-circle border border-line bg-night-card p-2 text-bone/80 hover:text-bone hover:border-bone/40"
              >
                {copiedLink ? <Check weight="bold" className="h-4 w-4 text-emerald-soft" /> : <Copy weight="bold" className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={shareWhatsApp}
                title="Share via WhatsApp"
                className="rounded-circle border border-line bg-night-card p-2 text-bone/80 hover:text-bone hover:border-emerald"
              >
                <ShareNetwork weight="bold" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* AI & Quick Summary Callout Box (AIO / GEO Optimized) */}
        <section className="my-8 rounded-card border border-emerald/30 bg-emerald/5 p-6 md:p-8 shadow-calm">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-caption uppercase tracking-eyebrow text-emerald-soft font-semibold">
              <Sparkle weight="fill" className="h-4 w-4" />
              AI & Quick Summary (GEO Overview)
            </div>

            <button
              type="button"
              onClick={copyAiSummaryText}
              className="inline-flex items-center gap-1.5 rounded-pill border border-emerald/30 bg-night-card px-3 py-1 text-xs text-emerald-soft hover:bg-emerald/20 transition-colors"
            >
              {copiedAiSummary ? (
                <>
                  <Check weight="bold" className="h-3.5 w-3.5" />
                  Copied Summary!
                </>
              ) : (
                <>
                  <Copy weight="bold" className="h-3.5 w-3.5" />
                  Copy AI Summary
                </>
              )}
            </button>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-bone/85 md:text-base">
            {post.aiSummary}
          </p>
        </section>

        {/* Hero Image */}
        <div className="my-8 overflow-hidden rounded-card border border-line bg-night-soft">
          <img
            src={post.coverImage}
            alt={post.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        {/* Formatted Article Body */}
        <article
          className="prose prose-invert max-w-none prose-headings:tracked-display prose-headings:text-bone prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-p:text-bone/80 prose-p:leading-relaxed prose-li:text-bone/80 prose-strong:text-bone prose-a:text-emerald-soft hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Recommended Templates Carousel/Grid inside Article */}
        {recommendedTemplates.length > 0 && (
          <section className="my-14 rounded-card border border-line bg-night-card p-6 md:p-8">
            <h3 className="text-xl font-semibold tracked-display text-bone md:text-2xl">
              Recommended Templates for This Style
            </h3>
            <p className="mt-1 text-sm text-bone/60">
              Hand-built invitations matching the themes discussed in this article.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {recommendedTemplates.map((t) => (
                <div key={t.id} className="group relative overflow-hidden rounded-lg border border-line bg-night-soft p-4 flex flex-col justify-between">
                  <div>
                    <div className="aspect-[9/16] w-full overflow-hidden rounded bg-night">
                      <img
                        src={`templates/${t.folder}/${t.poster}`}
                        alt={t.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-bone">{t.name}</h4>
                    <p className="text-xs text-bone/60 line-clamp-2 mt-1">{t.tagline}</p>
                  </div>

                  <a
                    href={`?preview=${t.folder}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-pill bg-emerald/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-eyebrow text-emerald-soft hover:bg-emerald hover:text-bone transition-colors"
                  >
                    Live Preview <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accordion FAQ Section */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="my-12 border-t border-line pt-10">
            <h3 className="text-2xl font-semibold tracked-display text-bone">
              Frequently Asked Questions
            </h3>

            <div className="mt-6 space-y-4">
              {post.faqs.map((faq, idx) => (
                <div key={idx} className="rounded-card border border-line bg-night-card">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left font-medium text-bone hover:text-emerald-soft transition-colors"
                  >
                    <span>{faq.question}</span>
                    {openFaqIndex === idx ? (
                      <CaretUp weight="bold" className="h-4 w-4 shrink-0 text-emerald-soft" />
                    ) : (
                      <CaretDown weight="bold" className="h-4 w-4 shrink-0 text-bone/50" />
                    )}
                  </button>

                  {openFaqIndex === idx && (
                    <div className="border-t border-line/50 p-5 pt-0 text-sm leading-relaxed text-bone/70">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prev / Next Article Navigation */}
        <nav className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          {prevPost ? (
            <a
              href={`?blog=${prevPost.slug}`}
              className="group flex flex-col gap-1 rounded-card border border-line bg-night-card p-4 hover:border-bone/30 sm:max-w-[48%]"
            >
              <span className="flex items-center gap-1 text-caption uppercase tracking-eyebrow text-bone/50 group-hover:text-emerald-soft">
                <ArrowLeft weight="bold" className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="truncate text-sm font-medium text-bone">{prevPost.title}</span>
            </a>
          ) : (
            <div />
          )}

          {nextPost ? (
            <a
              href={`?blog=${nextPost.slug}`}
              className="group flex flex-col items-end text-right gap-1 rounded-card border border-line bg-night-card p-4 hover:border-bone/30 sm:max-w-[48%]"
            >
              <span className="flex items-center gap-1 text-caption uppercase tracking-eyebrow text-bone/50 group-hover:text-emerald-soft">
                Next <ArrowRight weight="bold" className="h-3.5 w-3.5" />
              </span>
              <span className="truncate text-sm font-medium text-bone">{nextPost.title}</span>
            </a>
          ) : (
            <div />
          )}
        </nav>

        {/* Call to Action Banner */}
        <section className="mt-16 rounded-card border border-emerald/40 bg-gradient-to-r from-emerald/20 via-night-soft to-night-card p-8 text-center md:p-12">
          <h3 className="text-2xl font-semibold tracked-display text-bone md:text-4xl">
            Ready to shape your digital invitation?
          </h3>
          <p className="mt-3 max-w-lg mx-auto text-body text-bone/70">
            Select a template from our live gallery and message us on WhatsApp with your date. Your custom link is ready in 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill bg-emerald px-7 py-3.5 text-caption font-semibold uppercase tracking-eyebrow text-bone shadow-calm hover:bg-emerald-soft transition-colors"
            >
              <WhatsappLogo weight="fill" className="h-5 w-5" />
              Chat on WhatsApp
            </a>
            <a
              href="./#gallery"
              className="inline-flex items-center gap-2 rounded-pill border border-bone/30 px-7 py-3.5 text-caption font-semibold uppercase tracking-eyebrow text-bone hover:border-bone transition-colors"
            >
              Browse 20 Templates
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-10 text-center">
        <p className="text-caption uppercase tracking-eyebrow text-bone/40">
          InviteStory Knowledge Base — Modern Digital Wedding Cards
        </p>
      </footer>
    </div>
  );
}
