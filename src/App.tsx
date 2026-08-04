import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  InstagramLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
import {
  WHATSAPP_URL,
  INSTAGRAM_URL,
  whatsappForTemplate,
  absoluteTemplateUrl,
} from "./contact";
import { templates, type Template } from "./templates";
import { BLOG_POSTS } from "./data/blogPosts";
import { BlogHub } from "./components/BlogHub";
import { BlogPostView } from "./components/BlogPostView";
import { SeoHead } from "./components/SeoHead";

const BASE = import.meta.env.BASE_URL || "./";

function normalizeTemplateSlug(input: string) {
  const normalized = input.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!normalized) return "";

  if (normalized.endsWith("/index.html")) {
    return normalized.replace(/\/index\.html$/, "");
  }

  if (normalized.endsWith(".html")) {
    return normalized.replace(/\.html$/, "");
  }

  return normalized;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function matchTemplateBySlug(slugInput: string) {
  const slug = normalizeTemplateSlug(safeDecode(slugInput));
  return (
    templates.find((t) => {
      const normalizedId = normalizeTemplateSlug(t.id);
      const normalizedFolder = normalizeTemplateSlug(t.folder);
      const normalizedFolderAlias = normalizeTemplateSlug(t.folder.replace(/^template-/, ""));
      return slug === normalizedId || slug === normalizedFolder || slug === normalizedFolderAlias;
    }) ?? null
  );
}

function previewHref(folder: string) {
  const template = templates.find((t) => t.folder === folder || t.id === folder);
  return template ? `/templates/${template.id}` : `?preview=${encodeURIComponent(folder)}`;
}

/* ── Full-page template viewer + floating buy CTA ────────────────── */
const PREVIEW_MIN_MS = 3000;
const PREVIEW_MAX_MS = 12000;

function TemplateViewer({ template }: { template: Template }) {
  const src = `${BASE}templates/${template.folder}/index.html`;
  const previewUrl = absoluteTemplateUrl(template.folder, BASE);
  const wa = whatsappForTemplate(template.name, previewUrl);
  const reduce = useReducedMotion();

  const [iframeReady, setIframeReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [forceDone, setForceDone] = useState(false);
  const [exit, setExit] = useState(false);
  const showSplash = !(iframeReady && minElapsed) && !forceDone && !exit;

  useEffect(() => {
    const minTimer = window.setTimeout(() => setMinElapsed(true), PREVIEW_MIN_MS);
    const maxTimer = window.setTimeout(() => setForceDone(true), PREVIEW_MAX_MS);
    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (!((iframeReady && minElapsed) || forceDone)) return;
    if (reduce) {
      setExit(true);
      return;
    }
    const t = window.setTimeout(() => setExit(true), 480);
    return () => window.clearTimeout(t);
  }, [iframeReady, minElapsed, forceDone, reduce]);

  const revealing = ((iframeReady && minElapsed) || forceDone) && !exit;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-night">
      <header
        className={`flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-night/95 px-4 backdrop-blur-md transition-opacity duration-500 md:h-16 md:px-6 ${
          showSplash ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <a
          href="./"
          className="inline-flex items-center gap-2 text-caption font-medium uppercase tracking-eyebrow text-bone/70 transition-colors hover:text-bone"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
          Gallery
        </a>
        <p className="truncate text-sm font-medium text-bone md:text-base">
          {template.name}
        </p>
        <span className="w-16 md:w-20" aria-hidden />
      </header>

      <iframe
        title={`${template.name} full preview`}
        src={src}
        onLoad={() => setIframeReady(true)}
        className="min-h-0 w-full flex-1 border-0 bg-night"
      />

      {!exit && (
        <div
          className={`invite-splash fixed inset-0 z-[90] flex flex-col items-center justify-center bg-night px-6 text-center ${
            revealing ? "invite-splash--out" : ""
          }`}
          aria-busy={showSplash}
          aria-live="polite"
        >
          <div className="invite-splash__glow" aria-hidden />
          <div className="invite-splash__rings" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <p className="relative text-caption uppercase tracking-eyebrow text-emerald-soft">
            InviteStory
          </p>
          <p className="relative mt-4 max-w-sm text-2xl font-semibold tracked-display text-bone md:text-3xl">
            {template.name}
          </p>
          <p className="relative mt-3 text-sm text-bone/55">
            Preparing your invitation
          </p>
          <div className="invite-splash__bar relative mt-10" aria-hidden>
            <span />
          </div>
        </div>
      )}

      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16 transition-opacity duration-500 ${
          showSplash ? "opacity-0" : "opacity-100"
        }`}
      >
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto inline-flex max-w-full items-center gap-2.5 rounded-pill bg-emerald px-6 py-3.5 text-caption font-semibold uppercase tracking-eyebrow text-bone shadow-calm transition-transform duration-200 ease-soft hover:scale-[1.02] hover:bg-emerald-soft active:scale-[0.98]"
        >
          <WhatsappLogo weight="fill" className="h-5 w-5 shrink-0" />
          <span className="truncate">Make this mine</span>
        </a>
      </div>
    </div>
  );
}

/* ── Gallery card: real live template iframe preview ─ */
function TemplatePreview({ template }: { template: Template }) {
  const [hover, setHover] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeSrc = `${BASE}templates/${template.folder}/index.html`;
  const poster = `${BASE}templates/${template.folder}/${template.poster}`;
  const openHref = previewHref(template.folder);

  return (
    <a
      href={openHref}
      target="_blank"
      rel="noopener noreferrer"
      className="block focus-visible:outline-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <figure className="group relative overflow-hidden rounded-card bg-night-card shadow-calm border border-line/60 hover:border-bone/30 transition-all">
        <div className="aspect-[9/16] w-full overflow-hidden bg-night-soft relative">
          {/* Static poster shown as background placeholder until iframe finishes loading */}
          <img
            src={poster}
            alt=""
            width={720}
            height={1280}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              iframeLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          />

          {/* Real Live Template loaded in iframe */}
          <iframe
            title={`${template.name} live preview`}
            src={iframeSrc}
            loading="lazy"
            onLoad={() => setIframeLoaded(true)}
            className={`h-full w-full border-0 pointer-events-none transition-transform duration-500 ease-soft ${
              hover ? "scale-[1.02]" : "scale-100"
            }`}
          />
        </div>

        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <div className="flex gap-1.5">
            {template.palette.map((c) => (
              <span
                key={c}
                className="h-2.5 w-2.5 rounded-full ring-1 ring-bone/30"
                style={{ background: c }}
              />
            ))}
          </div>
          <span className="rounded-pill bg-night/80 border border-line px-2.5 py-0.5 text-[10px] uppercase tracking-eyebrow text-emerald-soft backdrop-blur-md font-medium">
            Live Template
          </span>
        </div>

        <figcaption
          className={`absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 bg-gradient-to-t from-night/95 via-night/70 to-transparent px-5 pb-5 pt-16 text-bone transition-opacity duration-300 ${
            hover ? "opacity-100" : "opacity-0 md:opacity-0"
          } max-md:opacity-100`}
        >
          <div>
            <p className="text-h3 font-medium tracked-display leading-none">
              {template.name}
            </p>
            <p className="mt-2 text-caption uppercase tracking-eyebrow text-bone/65">
              {template.weddingType}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-bone px-4 py-2 text-caption font-medium uppercase tracking-eyebrow text-night shadow-calm">
            Open Full
            <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
          </span>
        </figcaption>
      </figure>
    </a>
  );
}

/* ── Filters ─────────────────────────────────────────────────────── */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "Royal Palace", label: "Royal Palace" },
  { key: "South Indian", label: "South Indian" },
  { key: "Muslim Nikah", label: "Nikah" },
  { key: "Muslim Walima", label: "Walima" },
  { key: "Hindu", label: "Hindu" },
  { key: "Garden", label: "Garden" },
  { key: "Beach", label: "Beach" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

/* ── Top bar ─────────────────────────────────────────────────────── */
function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[72px] md:px-8">
        <a href="#" className="flex items-center">
          <img
            src={`${BASE}images/logo-full.png`}
            alt="InviteStory – Digital Wedding Cards"
            className="h-9 w-auto md:h-10"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#gallery"
            className="text-caption uppercase tracking-eyebrow text-bone/60 transition-colors hover:text-bone"
          >
            Templates
          </a>
          <a
            href="#process"
            className="text-caption uppercase tracking-eyebrow text-bone/60 transition-colors hover:text-bone"
          >
            How it works
          </a>
          <a
            href="?blog=all"
            className="text-caption uppercase tracking-eyebrow text-emerald-soft transition-colors hover:text-bone"
          >
            Blog & Guides
          </a>
        </nav>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-pill bg-emerald px-4 py-2.5 text-caption font-medium uppercase tracking-eyebrow text-bone transition-colors duration-200 ease-soft hover:bg-emerald-soft active:scale-[0.98] md:px-5"
        >
          <WhatsappLogo weight="fill" className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </header>
  );
}

/* ── Hero ────────────────────────────────────────────────────────── */
const FEATURED_HERO = templates.find((t) => t.id === "rajwada-royale") ?? templates[0];

function Hero() {
  const reduce = useReducedMotion();
  const featuredPoster = `${BASE}templates/${FEATURED_HERO.folder}/${FEATURED_HERO.poster}`;
  const featuredHref = previewHref(FEATURED_HERO.folder);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      {/* Responsive background: light mobile asset, royal poster on md+ */}
      <picture>
        <source
          media="(min-width: 768px)"
          srcSet={featuredPoster}
        />
        <img
          src={`${BASE}images/hero-invite.webp`}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_30%] md:object-center"
          aria-hidden
        />
      </picture>

      {/* Overlay gradients */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-night/95 via-night/75 to-night/40 md:to-night/25"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-night/30"
        aria-hidden
      />
      {/* Radial spotlight on text column */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 20% 55%, rgba(61,122,95,0.22) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-end gap-10 px-5 pb-16 pt-24 md:grid-cols-12 md:items-center md:gap-12 md:px-8 md:pb-24 md:pt-20">
        {/* Left: copy + CTAs */}
        <motion.div
          className="md:col-span-6 lg:col-span-6"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="inline-flex items-center gap-2 rounded-pill border border-line bg-night/50 px-3.5 py-1.5 text-caption uppercase tracking-eyebrow text-emerald-soft backdrop-blur-md">
            Handcrafted in India · {templates.length} live templates
          </p>

          <h1 className="mt-5 text-3xl font-semibold leading-[1.12] tracked-display text-bone md:mt-6 md:text-5xl lg:text-6xl">
            Digital wedding invites
            <br />
            <span className="text-bone/90">made for WhatsApp.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-bone/70 md:mt-6 md:text-body">
            Pick a royal template. We customise it to your day and send a live link within 24 hours — ready to share with family.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10 md:gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill bg-emerald px-6 py-3.5 text-caption font-semibold uppercase tracking-eyebrow text-bone shadow-calm transition-transform duration-200 ease-soft hover:scale-[1.02] hover:bg-emerald-soft active:scale-[0.98]"
            >
              <WhatsappLogo weight="fill" className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href="#gallery"
              className="rounded-pill border border-bone/25 bg-bone/5 px-6 py-3.5 text-caption font-medium uppercase tracking-eyebrow text-bone backdrop-blur-sm transition-colors duration-200 ease-soft hover:border-bone/50 hover:bg-bone/10 active:scale-[0.98]"
            >
              Browse samples
            </a>
            <a
              href="#process"
              className="text-caption font-medium uppercase tracking-eyebrow text-bone/55 transition-colors hover:text-bone"
            >
              How it works
            </a>
          </div>
        </motion.div>

        {/* Right: featured template preview card */}
        <motion.div
          className="hidden md:col-span-6 md:block lg:col-span-5 lg:col-start-8"
          initial={reduce ? false : { opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: reduce ? 0 : 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mx-auto max-w-sm">
            {/* Soft gold frame glow */}
            <div
              className="pointer-events-none absolute -inset-3 rounded-[22px] opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(201,168,76,0.18) 0%, transparent 70%)",
              }}
              aria-hidden
            />
            <figure className="relative overflow-hidden rounded-card border border-line/60 bg-night-card shadow-calm ring-1 ring-bone/10">
              <div className="relative aspect-[9/14] w-full overflow-hidden bg-night-soft">
                <img
                  src={featuredPoster}
                  alt={`${FEATURED_HERO.name} — ${FEATURED_HERO.tagline}`}
                  width={720}
                  height={1120}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/20 to-transparent"
                  aria-hidden
                />
                <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {FEATURED_HERO.palette.map((c) => (
                      <span
                        key={c}
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-bone/30"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span className="rounded-pill border border-line bg-night/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-eyebrow text-emerald-soft backdrop-blur-md">
                    Live Template
                  </span>
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-12">
                  <p className="text-h3 font-medium tracked-display leading-none text-bone">
                    {FEATURED_HERO.name}
                  </p>
                  <p className="mt-2 text-caption uppercase tracking-eyebrow text-bone/65">
                    {FEATURED_HERO.weddingType}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={featuredHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-pill bg-bone px-4 py-2 text-caption font-medium uppercase tracking-eyebrow text-night shadow-calm transition-transform duration-200 ease-soft hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Open sample
                      <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href="#gallery"
                      className="rounded-pill border border-bone/25 px-4 py-2 text-caption font-medium uppercase tracking-eyebrow text-bone/80 transition-colors hover:border-bone/50 hover:text-bone"
                    >
                      Browse all
                    </a>
                  </div>
                </figcaption>
              </div>
            </figure>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Why it fits ─────────────────────────────────────────────────── */
const WHY_POINTS = [
  {
    title: "One day",
    body: "A single wedding event. No mehndi or haldi schedule clutter on the invite.",
  },
  {
    title: "No RSVP form",
    body: "Your family handles invitations out-of-band. The link is the announcement.",
  },
  {
    title: "Calendar and maps",
    body: "Add to Calendar and Open in Maps are wired into every template.",
  },
  {
    title: "Mobile-first",
    body: "Smooth scroll, calm motion, and layouts tested on real phones.",
  },
] as const;

function WhyItFits() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-night-soft py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-12 md:gap-16 md:px-8">
        <div className="md:col-span-5">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-h1 font-semibold tracked-display text-bone md:text-display">
              Built for how you actually invite.
            </h2>
            <p className="mt-5 max-w-[42ch] text-body text-bone/65">
              One event. One config. A link that fits in a WhatsApp chat.
            </p>
          </motion.div>
          <div className="mt-10 overflow-hidden rounded-card">
            <img
              src={`${BASE}images/why-share.webp`}
              alt="Sharing a digital wedding invitation on a phone"
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>

        <ul className="grid content-center gap-8 md:col-span-7 md:grid-cols-2 md:gap-x-10 md:gap-y-12">
          {WHY_POINTS.map((item, i) => (
            <motion.li
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-t border-line pt-6"
            >
              <h3 className="text-h3 font-medium tracked-display text-bone">
                {item.title}
              </h3>
              <p className="mt-3 text-body text-bone/60">{item.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Gallery ─────────────────────────────────────────────────────── */
function Gallery() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const reduce = useReducedMotion();

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (filter !== "all" && t.weddingType !== filter) return false;
      if (query.trim().length === 0) return true;
      const q = query.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.highlight.toLowerCase().includes(q) ||
        t.vibe.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  return (
    <section id="gallery" className="bg-night py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <header className="flex flex-col gap-6 pb-12 md:flex-row md:items-end md:justify-between md:pb-16">
          <div className="max-w-xl">
            <h2 className="text-h1 font-semibold tracked-display text-bone md:text-display">
              {filtered.length} of {templates.length} live templates
            </h2>
            <p className="mt-4 max-w-[48ch] text-body text-bone/60">
              Every card is a real template. Open any to explore the full animated invite.
            </p>
          </div>
          <div className="md:w-80">
            <label className="sr-only" htmlFor="template-search">
              Search templates
            </label>
            <input
              id="template-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or vibe"
              className="w-full rounded-pill border border-line bg-night-card px-5 py-3 text-body text-bone placeholder:text-bone/35 focus:border-emerald focus:outline-none"
            />
          </div>
        </header>

        <div className="scrollbar-thin -mx-1 mb-12 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-pill px-5 py-2 text-caption uppercase tracking-eyebrow transition-colors duration-200 ease-soft active:scale-[0.98] ${
                filter === f.key
                  ? "bg-emerald text-bone"
                  : "border border-line bg-night-card text-bone/65 hover:border-bone/25 hover:text-bone"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <motion.article
              key={t.id}
              className="flex flex-col gap-5"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : Math.min(i % 3, 2) * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TemplatePreview template={t} />
              <div>
                <h3 className="text-h3 font-medium tracked-display text-bone">
                  {t.name}
                </h3>
                <p className="mt-2 text-body leading-relaxed text-bone/60">
                  {t.tagline}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-24 text-center text-body text-bone/50">
            No templates match. Try a different filter or search term.
          </p>
        )}
      </div>
    </section>
  );
}

/* ── Process ─────────────────────────────────────────────────────── */
const STEPS = [
  {
    title: "Pick a template",
    body: "Browse the gallery. Every card is a fully working invitation you can open and feel.",
  },
  {
    title: "Send your details",
    body: "Couple names, date, muhurtham time, venue, Maps link, and a few photos of you both.",
  },
  {
    title: "We customise",
    body: "We update the config and send a preview link within 24 hours.",
  },
  {
    title: "Share the link",
    body: "Approve, get your live link, and send it to family on WhatsApp.",
  },
] as const;

function Process() {
  const reduce = useReducedMotion();

  return (
    <section id="process" className="bg-night-soft py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="max-w-2xl text-h1 font-semibold tracked-display text-bone md:text-display">
          From template to live invite in one conversation.
        </h2>

        <ol className="mt-14 grid gap-0 border-t border-line md:mt-16 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-b border-line py-8 md:border-b-0 md:border-r md:px-6 md:py-10 md:last:border-r-0 md:first:pl-0"
            >
              <h3 className="text-h3 font-medium tracked-display text-bone">
                {s.title}
              </h3>
              <p className="mt-3 text-body text-bone/60">{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Contact ─────────────────────────────────────────────────────── */
function Contact() {
  const reduce = useReducedMotion();

  return (
    <section id="contact" className="bg-night py-20 md:py-28">
      <motion.div
        className="mx-auto max-w-3xl px-5 text-center md:px-8"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-h1 font-semibold tracked-display text-bone md:text-display">
          Tell us your date. We will send the next steps.
        </h2>
        <p className="mt-5 text-body text-bone/60">
          One wedding. One day. One invitation that fits in a WhatsApp message.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill bg-emerald px-7 py-3.5 text-caption font-medium uppercase tracking-eyebrow text-bone transition-colors duration-200 ease-soft hover:bg-emerald-soft active:scale-[0.98]"
          >
            <WhatsappLogo weight="fill" className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill border border-bone/25 px-7 py-3.5 text-caption font-medium uppercase tracking-eyebrow text-bone transition-colors duration-200 ease-soft hover:border-bone/50 active:scale-[0.98]"
          >
            <InstagramLogo weight="regular" className="h-4 w-4" />
            @invitestory.in
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line py-12 text-center">
      <div className="mx-auto flex flex-col items-center gap-5">
        <img
          src={`${BASE}images/logo-mark.png`}
          alt="InviteStory"
          className="h-12 w-auto opacity-40"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <p className="text-caption uppercase tracking-eyebrow text-bone/40">
          Handcrafted in India · {templates.length} live templates
        </p>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-caption uppercase tracking-eyebrow text-bone/60">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-soft transition-opacity hover:opacity-70"
        >
          @invitestory.in
        </a>
        <span>•</span>
        <a href="?blog=all" className="hover:text-bone transition-colors">
          Blog & Guides
        </a>
        <span>•</span>
        <a href="llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-bone transition-colors">
          llms.txt
        </a>
        <span>•</span>
        <a href="llms-full.txt" target="_blank" rel="noopener noreferrer" className="hover:text-bone transition-colors">
          llms-full.txt
        </a>
        <span>•</span>
        <a href="sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-bone transition-colors">
          Sitemap
        </a>
      </div>
    </footer>
  );
}

export default function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/, "") : "";
  const searchParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const previewParam = searchParams.get("preview");
  const blogParam = searchParams.get("blog");

  // Determine active template from pathname (/templates/:id) or ?preview=<folder>
  const previewTemplate = useMemo(() => {
    if (pathname.startsWith("/templates/")) {
      return matchTemplateBySlug(pathname.replace("/templates/", ""));
    }
    if (previewParam) {
      return matchTemplateBySlug(previewParam);
    }
    return null;
  }, [pathname, previewParam]);

  // Determine active blog post from pathname (/blog/:slug) or ?blog=<slug>
  const activeBlogPost = useMemo(() => {
    if (pathname.startsWith("/blog/")) {
      const slug = pathname.replace("/blog/", "");
      return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
    }
    if (blogParam && blogParam !== "all") {
      return BLOG_POSTS.find((p) => p.slug === blogParam) ?? null;
    }
    return null;
  }, [pathname, blogParam]);

  const isBlogHub = pathname === "/blog" || blogParam === "all";

  // Render template preview viewer if route matches /templates/:id or ?preview=<folder>
  if (previewTemplate) {
    return <TemplateViewer template={previewTemplate} />;
  }

  // Render Blog Hub if route is /blog or ?blog=all
  if (isBlogHub) {
    return <BlogHub />;
  }

  // Render Blog Article if route is /blog/:slug or ?blog=<slug>
  if (activeBlogPost) {
    return <BlogPostView post={activeBlogPost} />;
  }

  return (
    <div className="page-grain min-h-[100dvh] bg-night text-bone antialiased">
      <SeoHead />
      <TopBar />
      <main>
        <Hero />
        <WhyItFits />
        <Gallery />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
