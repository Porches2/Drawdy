#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const markdownIt = require('markdown-it');
const highlightjs = require('markdown-it-highlightjs');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, 'posts');
const BLOG_DIR = path.join(ROOT, 'blog');
const SITE = {
  title: 'Drawdy',
  url: 'https://drawdy-landing.vercel.app',
  blogTitle: 'Drawdy Blog',
  blogDescription: 'Updates, announcements, and design thinking from the Drawdy team.',
};

const md = markdownIt({ html: true, typographer: true, linkify: true }).use(highlightjs);

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ---------------------------------------------------------------------------
// Thumbnail system — PNG images from thumbnails/ directory
// Naming convention: thumbnails/{slug}.png (819×521)
// Posts without a PNG get a placeholder with the Drawdy logo
// ---------------------------------------------------------------------------
const THUMBNAILS_SRC = path.join(ROOT, 'thumbnails');
const THUMBNAILS_OUT = path.join(BLOG_DIR, 'thumbnails');

function thumbnailExists(slug) {
  return fs.existsSync(path.join(THUMBNAILS_SRC, `${slug}.png`));
}

function thumbHtml(slug, title) {
  if (thumbnailExists(slug)) {
    return `<img class="thumb-icon" src="/blog/thumbnails/${slug}.png" alt="${escapeHtml(title)}" loading="lazy"/>`;
  }
  // Placeholder — solid muted bg with Drawdy logo mark
  return `<svg class="thumb-icon" viewBox="0 0 819 521" fill="none">
<rect width="819" height="521" fill="#F4F2E6"/>
<text x="410" y="274" text-anchor="middle" fill="#191919" fill-opacity="0.12" font-family="'Google Sans Flex',sans-serif" font-size="60" font-weight="700" letter-spacing="-1">Drawdy</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function readingTime(html) {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 238));
}

function formatDate(dateStr) {
  return dateFmt.format(new Date(dateStr));
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  mkdirp(dir);
}

function categoryLabel(cat) {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

// ---------------------------------------------------------------------------
// Load posts
// ---------------------------------------------------------------------------
function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug || file.replace(/\.md$/, '');
    let html = md.render(content);

    // Rewrite relative image paths to absolute
    html = html.replace(/src="images\//g, 'src="/blog/images/');

    const mins = readingTime(html);
    const excerpt = data.excerpt || content.replace(/[#*_`\[\]]/g, '').slice(0, 160).trim() + '…';

    return {
      slug,
      title: data.title,
      date: data.date,
      author: data.author || 'Alex Kim',
      category: data.category || 'announcements',
      gradient: data.gradient || 1,
      icon: data.icon || 'layers',
      excerpt,
      html,
      readingTime: mins,
    };
  });

  // Sort newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

// ---------------------------------------------------------------------------
// Shared HTML fragments
// ---------------------------------------------------------------------------
const HEAD_FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Caveat:wght@600&display=swap" rel="stylesheet">
<style>
@font-face{
  font-family:'Google Sans Flex';
  font-style:normal;
  font-display:swap;
  font-weight:1 1000;
  src:url(https://cdn.jsdelivr.net/fontsource/fonts/google-sans-flex:vf@latest/latin-wght-normal.woff2) format('woff2-variations');
}
</style>`;

const NAV_HTML = `<nav id="nav">
  <a class="logo" href="/" aria-label="Drawdy">
    <img class="logo-img" src="/Logo.svg" alt="Drawdy">
  </a>
  <div class="nav-links">
    <a href="/#features">Features</a>
    <a href="/#compare">Compare</a>
    <a href="/#privacy">Privacy</a>
    <a href="/#faq">FAQ</a>
    <a href="/blog" class="active">Blog</a>
  </div>
  <a href="/" class="btn">Start now</a>
</nav>`;

const FOOTER_HTML = `<footer>
  <a class="logo" href="/" aria-label="Drawdy"><img class="logo-img footer-logo-img" src="/Logo.svg" alt="Drawdy"></a>
  <span>&copy; 2026 Drawdy &middot; <a href="/blog/feed.xml">RSS</a></span>
</footer>`;

const NAV_JS = `var nav=document.getElementById('nav');
  window.addEventListener('scroll',function(){
    nav.classList.toggle('scrolled',window.scrollY>10);
  },{passive:true});`;

// ---------------------------------------------------------------------------
// Shared CSS
// ---------------------------------------------------------------------------
const BASE_CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --paper:#FAFAF5;--ink:#17171B;--muted:#6F6F68;--hairline:#E8E8DF;
  --lime:#CDFF00;--lime-ink:#566B00;--blue:#3D6DF2;--violet:#8E7BF0;--radius:14px;
}
html{scroll-behavior:smooth}
body{
  font-family:'Google Sans Flex',system-ui,sans-serif;
  background:var(--paper);color:var(--ink);line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
::selection{background:var(--lime);color:var(--ink)}
:focus-visible{outline:2px solid var(--ink);outline-offset:3px;border-radius:4px}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}`;

const NAV_CSS = `#nav{
  position:fixed;top:0;left:0;right:0;z-index:50;
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 40px;
  background:color-mix(in srgb,var(--paper) 82%,transparent);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  border-bottom:1px solid transparent;
  transition:border-color .3s;
}
#nav.scrolled{border-bottom-color:var(--hairline)}
.logo{display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:20px;color:var(--ink)}
.logo-img{height:28px}
.nav-links{display:flex;gap:34px;font-size:15px;font-weight:500;color:var(--muted)}
.nav-links a{transition:color .2s}
.nav-links a:hover{color:var(--ink)}
.nav-links a.active{color:var(--ink)}
.btn{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--ink);color:var(--paper);
  font-family:inherit;font-size:15px;font-weight:500;
  padding:11px 22px;border-radius:100px;border:none;cursor:pointer;
  transition:transform .15s,box-shadow .15s;
}
.btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(23,23,27,.14)}
.btn:active{transform:translateY(0)}`;

const FOOTER_CSS = `footer{
  border-top:1px solid var(--hairline);
  display:flex;align-items:center;justify-content:space-between;
  padding:26px 40px;font-size:14px;color:var(--muted);
}
footer .logo{font-size:24px;color:var(--ink)}
.footer-logo-img{height:24px}
footer a{transition:color .2s}
footer a:hover{color:var(--ink)}`;

const REDUCED_MOTION_CSS = `@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  html{scroll-behavior:auto}
}`;

// ---------------------------------------------------------------------------
// Blog listing page
// ---------------------------------------------------------------------------
function renderBlogListing(posts) {
  const [featured, ...rest] = posts;

  const featuredCard = featured ? `
  <a class="post-card featured" href="/blog/${featured.slug}" data-category="${featured.category}">
    <div class="post-thumb">
      <div class="post-thumb-inner">
        ${thumbHtml(featured.slug, featured.title)}
      </div>
    </div>
    <div class="featured-body">
      <span class="post-cat">${categoryLabel(featured.category)}<span class="latest-tag"> &middot; Latest</span></span>
      <h2 class="post-title">${escapeHtml(featured.title)}</h2>
      <p class="post-excerpt">${escapeHtml(featured.excerpt)}</p>
      <span class="post-meta">${formatDate(featured.date)} &middot; ${featured.readingTime} min read</span>
    </div>
  </a>` : '';

  const cards = featuredCard + rest.map(p => `
  <a class="post-card" href="/blog/${p.slug}" data-category="${p.category}">
    <div class="post-thumb">
      <div class="post-thumb-inner">
        ${thumbHtml(p.slug, p.title)}
      </div>
    </div>
    <span class="post-cat">${categoryLabel(p.category)}</span>
    <h3 class="post-title">${escapeHtml(p.title)}</h3>
    <span class="post-meta">${formatDate(p.date)} &middot; ${p.readingTime} min read</span>
  </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en" class="js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blog — Drawdy</title>
<meta name="description" content="${escapeHtml(SITE.blogDescription)}">
<link rel="alternate" type="application/rss+xml" title="${SITE.blogTitle}" href="/blog/feed.xml">
${HEAD_FONTS}
<style>
${BASE_CSS}

/* ---------- Nav ---------- */
${NAV_CSS}

/* ---------- Blog Hero ---------- */
.blog-hero{
  max-width:1080px;margin:0 auto;
  padding:130px 24px 0;
  text-align:center;
}
.eyebrow{
  display:inline-block;font-size:13px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;color:var(--lime-ink);
  background:color-mix(in srgb,var(--lime) 32%,var(--paper));
  border:1px solid color-mix(in srgb,var(--lime) 65%,var(--paper));
  padding:7px 16px;border-radius:100px;margin-bottom:34px;
}
.blog-hero h1{
  font-size:clamp(36px,5vw,64px);font-weight:600;
  letter-spacing:-0.035em;line-height:1.08;margin-bottom:16px;
}
.blog-hero h1 .accent{
  font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;letter-spacing:-0.01em;
}
.hero-underline{position:relative;display:inline-block}
.hero-underline svg{
  position:absolute;left:-4%;bottom:-0.1em;width:108%;height:0.26em;
  display:block;pointer-events:none;
}
.blog-hero .sub{font-size:18px;color:var(--muted);max-width:44ch;margin:0 auto 48px}

/* ---------- Category Filters ---------- */
.filters{
  display:flex;gap:10px;justify-content:center;flex-wrap:wrap;
  margin-bottom:64px;
}
.filter-btn{
  font-family:inherit;font-size:14px;font-weight:500;
  padding:8px 18px;border-radius:100px;
  border:1px solid var(--hairline);
  background:transparent;color:var(--muted);cursor:pointer;
  transition:all .2s;
}
.filter-btn:hover{background:rgba(23,23,27,.07);border-color:rgba(23,23,27,.14);color:var(--ink)}
.filter-btn[data-active="true"]{
  background:var(--ink);
  border-color:var(--ink);
  color:var(--lime);
}

/* ---------- Post Grid ---------- */
.post-grid{
  max-width:1080px;margin:0 auto;padding:0 24px 100px;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:48px 36px;
}
.post-card{
  display:flex;flex-direction:column;
  transition:opacity .35s,transform .35s;
}
.post-card:hover .post-thumb{transform:translateY(-6px);box-shadow:0 14px 30px rgba(23,23,27,.10)}
.post-thumb{transition:transform .3s ease,box-shadow .3s ease;border:1px solid rgba(0,0,0,.1);border-radius:var(--radius)}
.post-card.hidden{
  opacity:0;transform:translateY(12px);
  pointer-events:none;position:absolute;visibility:hidden;
}
.post-thumb{
  aspect-ratio:16/10;border-radius:var(--radius);
  margin-bottom:18px;overflow:hidden;
  position:relative;
}
.post-thumb-inner{
  width:100%;height:100%;
  display:flex;align-items:center;justify-content:center;
}
.grad-1,.grad-2,.grad-3,.grad-4,.grad-5,.grad-6,.grad-7,.grad-8{background:transparent}
.thumb-icon{
  width:100%;height:100%;
}
.post-cat{
  display:inline-block;font-size:12px;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;color:var(--lime-ink);
  margin-bottom:10px;
}
.post-title{
  font-size:18px;font-weight:600;letter-spacing:-0.01em;line-height:1.3;
  color:var(--ink);margin-bottom:10px;
  transition:color .2s;
}
.post-card:hover .post-title{color:var(--lime-ink)}
.post-meta{font-size:13px;color:var(--muted)}

/* ---------- Featured Card ---------- */
.post-card.featured{
  grid-column:1/-1;
  display:grid;grid-template-columns:1.2fr 1fr;
  gap:44px;align-items:center;
  margin-bottom:16px;
}
.post-card.featured .post-thumb{margin-bottom:0}
.post-card.featured .post-title{
  font-size:clamp(22px,2.6vw,30px);letter-spacing:-0.02em;line-height:1.2;
  margin-bottom:12px;
}
.post-excerpt{
  font-size:15px;line-height:1.6;color:var(--muted);
  margin-bottom:16px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
}

/* Featured card demotes to a regular card on category tabs */
.post-grid.filtered .post-card.featured{
  grid-column:auto;display:flex;flex-direction:column;
  gap:0;align-items:stretch;margin-bottom:0;
}
.post-grid.filtered .post-card.featured .featured-body{display:contents}
.post-grid.filtered .post-card.featured .post-thumb{margin-bottom:18px}
.post-grid.filtered .post-card.featured .post-title{
  font-size:18px;letter-spacing:-0.01em;line-height:1.3;margin-bottom:10px;
}
.post-grid.filtered .post-card.featured .post-excerpt{display:none}
.post-grid.filtered .post-card.featured .latest-tag{display:none}

/* ---------- Footer ---------- */
${FOOTER_CSS}

/* ---------- Reduced Motion ---------- */
${REDUCED_MOTION_CSS}

/* ---------- Responsive ---------- */
@media(max-width:820px){
  #nav{padding:14px 20px}
  .nav-links{display:none}
  .blog-hero{padding-top:96px}
  .blog-hero h1{font-size:clamp(30px,7vw,48px)}
  .post-grid{grid-template-columns:repeat(2,1fr);gap:36px 24px;padding:0 20px 80px}
  .post-card.featured{grid-template-columns:1fr;gap:18px;margin-bottom:8px}
  footer{padding:22px 20px}
}
@media(max-width:540px){
  .post-grid{grid-template-columns:1fr;gap:40px;padding:0 20px 60px}
  .filters{gap:8px}
  .filter-btn{font-size:13px;padding:7px 14px}
}
</style>
</head>
<body>

${NAV_HTML}

<section class="blog-hero">
  <span class="eyebrow">From the team</span>
  <h1>The Drawdy <span class="accent hero-underline">Blog<svg viewBox="0 0 340 20" preserveAspectRatio="none" fill="none" aria-hidden="true"><path id="hero-lime" d="M2 14C88 3 262 1 338 8" stroke="#CDFF00" stroke-width="14" stroke-linecap="round"/></svg></span></h1>
  <p class="sub">Updates, announcements, and design thinking from the team building the infinite canvas for builders.</p>
  <div class="filters">
    <button class="filter-btn" data-filter="all" data-active="true">All</button>
    <button class="filter-btn" data-filter="announcements">Announcements</button>
    <button class="filter-btn" data-filter="product">Product</button>
    <button class="filter-btn" data-filter="design">Design</button>
  </div>
</section>

<div class="post-grid" id="postGrid">
${cards}
</div>

${FOOTER_HTML}

<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script>
(function(){
  'use strict';

  /* Nav scroll border */
  ${NAV_JS}

  /* Category filtering */
  var btns=document.querySelectorAll('.filter-btn');
  var cards=document.querySelectorAll('.post-card');

  btns.forEach(function(btn){
    btn.addEventListener('click',function(){
      var filter=btn.getAttribute('data-filter');
      btns.forEach(function(b){b.setAttribute('data-active','false')});
      btn.setAttribute('data-active','true');

      var grid=document.querySelector('.post-grid');
      if(grid){grid.classList.toggle('filtered',filter!=='all');}

      var visible=[];
      cards.forEach(function(card){
        var cat=card.getAttribute('data-category');
        if(filter==='all'||cat===filter){
          card.classList.remove('hidden');
          visible.push(card);
        }else{
          card.classList.add('hidden');
        }
      });

      /* Re-enter animation for the newly visible set */
      if(window.gsap&&visible.length){
        gsap.fromTo(visible,
          {opacity:0,y:24},
          {opacity:1,y:0,duration:.55,ease:'power2.out',stagger:.07,overwrite:true}
        );
      }
    });
  });

  /* GSAP entrance animations */
  gsap.registerPlugin(ScrollTrigger);

  /* Hero */
  var heroEls='.blog-hero .eyebrow, .blog-hero h1, .blog-hero .sub';
  gsap.set(heroEls,{opacity:0,y:26});
  gsap.to(heroEls,{opacity:1,y:0,duration:.9,ease:'power3.out',stagger:.12,delay:.15});

  /* Hero underline draw-on */
  var heroLime=document.getElementById('hero-lime');
  if(heroLime){
    var hlLen=heroLime.getTotalLength();
    gsap.set(heroLime,{strokeDasharray:hlLen,strokeDashoffset:hlLen});
    gsap.to(heroLime,{strokeDashoffset:0,duration:.7,ease:'power2.out',delay:.65});
  }

  /* Filters */
  gsap.set('.filters',{opacity:0,y:14});
  gsap.to('.filters',{opacity:1,y:0,duration:.7,ease:'power2.out',delay:.55});

  /* Cards */
  gsap.set('.post-card',{opacity:0,y:32});
  ScrollTrigger.batch('.post-card',{
    start:'top 88%',
    onEnter:function(batch){
      gsap.to(batch,{opacity:1,y:0,duration:.8,ease:'power3.out',stagger:.1});
    },
    once:true
  });

  ScrollTrigger.refresh();
})();
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Individual blog post page
// ---------------------------------------------------------------------------
function renderPostPage(post, prevPost, nextPost) {
  const prevNav = prevPost
    ? `<a class="post-nav-link prev" href="/blog/${prevPost.slug}">
    <span class="post-nav-label">&larr; Previous</span>
    <span class="post-nav-title">${escapeHtml(prevPost.title)}</span>
  </a>`
    : '';

  const nextNav = nextPost
    ? `<a class="post-nav-link next" href="/blog/${nextPost.slug}">
    <span class="post-nav-label">Next &rarr;</span>
    <span class="post-nav-title">${escapeHtml(nextPost.title)}</span>
  </a>`
    : '';

  const hasThumb = thumbnailExists(post.slug);
  const ogImageTags = hasThumb
    ? `<meta property="og:image" content="${SITE.url}/blog/thumbnails/${post.slug}.png">
<meta property="og:image:width" content="819">
<meta property="og:image:height" content="521">
<meta name="twitter:image" content="${SITE.url}/blog/thumbnails/${post.slug}.png">
`
    : '';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: new Date(post.date).toISOString(),
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Drawdy' },
    description: post.excerpt,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(post.title)} — Drawdy Blog</title>
<meta name="description" content="${escapeHtml(post.excerpt)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(post.title)}">
<meta property="og:description" content="${escapeHtml(post.excerpt)}">
<meta property="og:url" content="${SITE.url}/blog/${post.slug}">
<meta property="og:site_name" content="Drawdy">
${ogImageTags}<meta name="twitter:card" content="${hasThumb ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${escapeHtml(post.title)}">
<meta name="twitter:description" content="${escapeHtml(post.excerpt)}">
<link rel="canonical" href="${SITE.url}/blog/${post.slug}">
<link rel="alternate" type="application/rss+xml" title="${SITE.blogTitle}" href="/blog/feed.xml">
${HEAD_FONTS}
<script type="application/ld+json">${jsonLd}</script>
<style>
${BASE_CSS}

/* ---------- Nav ---------- */
${NAV_CSS}

/* ---------- Hero Thumbnail ---------- */
.article-hero{
  max-width:680px;margin:0 auto;
  padding:140px 24px 0;
}
.article-hero-inner{
  width:100%;aspect-ratio:819/521;border-radius:var(--radius);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
}
.article-hero-inner .thumb-icon{
  width:100%;height:100%;
}
.grad-1,.grad-2,.grad-3,.grad-4,.grad-5,.grad-6,.grad-7,.grad-8{background:transparent}

/* ---------- Article Layout ---------- */
.article-header{
  max-width:680px;margin:0 auto;
  padding:32px 24px 0;
}
.back-link{
  position:fixed;left:40px;top:88px;z-index:40;
  display:inline-flex;align-items:center;gap:6px;
  font-size:14px;font-weight:500;color:var(--muted);
  transition:color .2s;
}
.back-link:hover{color:var(--ink)}
.back-link svg{width:16px;height:16px;flex-shrink:0}
.article-cat{
  display:inline-block;font-size:12px;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;color:var(--lime-ink);
  margin-bottom:14px;
}
.article-header h1{
  font-size:clamp(30px,4.5vw,44px);font-weight:600;
  letter-spacing:-0.03em;line-height:1.12;margin-bottom:18px;
}
.article-meta{
  font-size:14px;color:var(--muted);
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
}
.article-meta .sep{color:var(--hairline)}

/* ---------- Article Content ---------- */
.article-content{
  max-width:680px;margin:0 auto;
  padding:48px 24px 80px;
  font-size:17px;line-height:1.75;color:var(--ink);
}
.article-content > * + *{margin-top:1.5em}
.article-content h2{
  font-size:26px;font-weight:600;letter-spacing:-0.02em;
  line-height:1.2;margin-top:2.5em;margin-bottom:0.3em;
}
.article-content h3{
  font-size:21px;font-weight:600;letter-spacing:-0.01em;
  line-height:1.3;margin-top:2em;margin-bottom:0.2em;
}
.article-content h4{
  font-size:18px;font-weight:600;
  line-height:1.3;margin-top:1.75em;margin-bottom:0.2em;
}
.article-content p{margin-top:1.25em}
.article-content a{
  color:var(--blue);text-decoration:underline;
  text-underline-offset:2px;transition:color .2s;
}
.article-content a:hover{color:var(--ink)}
.article-content strong{font-weight:600}
.article-content ul,.article-content ol{
  padding-left:1.5em;margin-top:1em;
}
.article-content li{margin-top:0.5em}
.article-content li::marker{color:var(--muted)}
.article-content blockquote{
  border-left:3px solid var(--lime);
  padding:0.5em 0 0.5em 1.25em;
  color:var(--muted);font-style:italic;
  margin:1.5em 0;
}
.article-content hr{
  border:none;border-top:1px solid var(--hairline);
  margin:2.5em 0;
}
.article-content img{
  border-radius:var(--radius);
  margin:2em 0;max-width:100%;height:auto;
}
.article-content code{
  font-family:'SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;
  font-size:0.88em;
  background:color-mix(in srgb,var(--ink) 6%,var(--paper));
  padding:0.15em 0.4em;border-radius:5px;
}
.article-content pre{
  background:var(--ink);color:#e8e8e8;
  padding:1.25em 1.5em;border-radius:var(--radius);
  overflow-x:auto;margin:1.75em 0;
  font-size:14px;line-height:1.6;
}
.article-content pre code{
  background:none;padding:0;border-radius:0;
  color:inherit;font-size:inherit;
}

/* ---------- Syntax Highlighting ---------- */
.hljs-keyword,.hljs-selector-tag{color:#c792ea}
.hljs-string,.hljs-attr{color:#c3e88d}
.hljs-number,.hljs-literal{color:#f78c6c}
.hljs-comment{color:#6f6f68;font-style:italic}
.hljs-function .hljs-title,.hljs-title.function_{color:#82aaff}
.hljs-built_in{color:#89ddff}
.hljs-type,.hljs-class .hljs-title{color:#ffcb6b}
.hljs-variable,.hljs-template-variable{color:#f07178}
.hljs-meta{color:#89ddff}

/* ---------- Post Navigation ---------- */
.post-nav{
  max-width:680px;margin:0 auto;
  padding:0 24px 80px;
  display:flex;justify-content:space-between;align-items:baseline;
  border-top:1px solid var(--hairline);
  padding-top:32px;
}
.post-nav-link{
  display:inline-flex;flex-direction:column;gap:4px;
  font-size:14px;color:var(--muted);
  transition:color .2s;max-width:45%;
}
.post-nav-link:hover{color:var(--ink)}
.post-nav-link.next{text-align:right;margin-left:auto}
.post-nav-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
.post-nav-title{font-size:14px;font-weight:500;color:var(--ink);line-height:1.3}

/* ---------- Footer ---------- */
${FOOTER_CSS}

/* ---------- Reduced Motion ---------- */
${REDUCED_MOTION_CSS}

/* ---------- Responsive ---------- */
@media(max-width:1080px){
  .back-link{
    position:static;
    margin-top:80px;
    margin-bottom:20px;
  }
  .article-hero{padding-top:0}
}
@media(max-width:820px){
  #nav{padding:14px 20px}
  .nav-links{display:none}
  footer{padding:22px 20px}
}
@media(max-width:540px){
  .post-nav{flex-direction:column;gap:16px}
  .post-nav-link{max-width:100%}
  .post-nav-link.next{text-align:left;margin-left:0}
}
</style>
</head>
<body>

${NAV_HTML}

<a class="back-link" href="/blog">
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 12L6 8l4-4"/></svg>
  Back to blog
</a>

<div class="article-hero">
  <div class="article-hero-inner">
    ${thumbHtml(post.slug, post.title)}
  </div>
</div>

<article>
  <header class="article-header">
    <span class="article-cat">${categoryLabel(post.category)}</span>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="article-meta">
      <span>${formatDate(post.date)}</span>
      <span class="sep">&middot;</span>
      <span>${escapeHtml(post.author)}</span>
      <span class="sep">&middot;</span>
      <span>${post.readingTime} min read</span>
    </div>
  </header>

  <div class="article-content">
    ${post.html}
  </div>
</article>

<nav class="post-nav" aria-label="Post navigation">
  ${prevNav}
  ${nextNav}
</nav>

${FOOTER_HTML}

<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script>
(function(){
  'use strict';
  ${NAV_JS}

  if(typeof gsap!=='undefined'&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    gsap.set('.article-hero,.article-header,.article-content,.post-nav',{opacity:0,y:20});
    gsap.to('.article-hero',{opacity:1,y:0,duration:.7,ease:'power3.out',delay:.05});
    gsap.to('.article-header',{opacity:1,y:0,duration:.7,ease:'power3.out',delay:.15});
    gsap.to('.article-content',{opacity:1,y:0,duration:.7,ease:'power3.out',delay:.3});
    gsap.to('.post-nav',{opacity:1,y:0,duration:.6,ease:'power3.out',delay:.45});
  }
})();
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// RSS feed
// ---------------------------------------------------------------------------
function renderRSS(posts) {
  const items = posts.map(p => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE.url}/blog/${p.slug}</link>
      <guid>${SITE.url}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.blogTitle)}</title>
    <link>${SITE.url}/blog</link>
    <description>${escapeXml(SITE.blogDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

// ---------------------------------------------------------------------------
// Copy images
// ---------------------------------------------------------------------------
function copyImages() {
  const src = path.join(POSTS_DIR, 'images');
  const dest = path.join(BLOG_DIR, 'images');
  if (!fs.existsSync(src)) return;

  mkdirp(dest);
  const files = fs.readdirSync(src);
  for (const file of files) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
  }
  console.log(`  Copied ${files.length} image(s)`);
}

function copyThumbnails() {
  if (!fs.existsSync(THUMBNAILS_SRC)) return;
  mkdirp(THUMBNAILS_OUT);
  const files = fs.readdirSync(THUMBNAILS_SRC).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  for (const file of files) {
    fs.copyFileSync(path.join(THUMBNAILS_SRC, file), path.join(THUMBNAILS_OUT, file));
  }
  if (files.length) console.log(`  Copied ${files.length} thumbnail(s)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const start = Date.now();
  console.log('Building Drawdy blog...');

  // Clean output
  cleanDir(BLOG_DIR);

  // Load posts
  const posts = loadPosts();
  if (posts.length === 0) {
    console.log('  No posts found in posts/. Generating empty listing.');
  }

  // Generate blog listing
  const listingHtml = renderBlogListing(posts);
  fs.writeFileSync(path.join(ROOT, 'blog.html'), listingHtml, 'utf8');
  console.log(`  Generated blog.html (${posts.length} posts)`);

  // Generate individual post pages
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const prev = i > 0 ? posts[i - 1] : null;               // newer post (go back)
    const next = i < posts.length - 1 ? posts[i + 1] : null; // older post (continue reading)
    const postDir = path.join(BLOG_DIR, post.slug);
    mkdirp(postDir);
    const postHtml = renderPostPage(post, prev, next);
    fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8');
  }
  console.log(`  Generated ${posts.length} post page(s)`);

  // RSS feed
  const rssXml = renderRSS(posts);
  fs.writeFileSync(path.join(BLOG_DIR, 'feed.xml'), rssXml, 'utf8');
  console.log('  Generated feed.xml');

  // Copy images
  copyImages();

  // Copy thumbnails
  copyThumbnails();

  const elapsed = Date.now() - start;
  console.log(`Done. Built ${posts.length} posts in ${elapsed}ms.`);
}

main();
