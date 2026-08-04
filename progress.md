# Landing Page Progress

Deployed at: https://drawdy-landing.vercel.app/

## Completed

### Hero section
- Full hero with eyebrow badge, headline ("Made for every way you build"), subtitle, CTA button
- Hand-drawn board frame (Board.svg) with lime stroke, animated corner curls
- Interactive board illustration with architecture diagram elements (Auth service, Web client, Database, API gateway nodes with connector lines)
- Drifting decorative elements (Cloud label, orange scribble shape) with CSS keyframe animations
- GSAP scroll-triggered entrance animations (staggered fade-in + slide-up)
- Sticky nav with blur backdrop, smooth anchor scroll

### Features section ("Feels like paper, Thinks like {code}")
- Two-column layout: left side architecture diagram illustration, right side headline + description
- Elements.svg integration (architecture diagram nodes)
- GSAP scroll-triggered fade-in for all child elements
- Increased bottom padding (160px vs default 110px) to balance the large hero-to-features gap

### Platform section rebuild (from SVG to HTML)
- **Replaced monolithic Figma-exported Section.svg** (2759x882, all text as outlined paths) with proper HTML/CSS component
- Real selectable/accessible text: title ("Soon, your board becomes a platform"), subtitle, bottom note
- Two-column header grid (title left, description right) with responsive stacking
- Lime hand-drawn underline on "platform" word (inline SVG path with GSAP draw-on animation)
- Sparkle icon (Spark wheel.svg) next to bottom note

#### Platform wire (highlighter marker effect)
- **Wire rendering**: Orange highlighter stroke (`#FF9F43`, stroke-width 34, opacity 0.5) with `mix-blend-mode: multiply` on parent `<g>` group
- **Segmented path architecture**: Wire split into 8 segments (was single path) so self-intersections at loop crossings naturally create darker multiply-blended areas
  - Segment 1: sweep from top-right to AI loop entry
  - Segments 2-3: AI loop split at arc peak (2140.85, 493.882) — entry descent + bottom/right arc, then exit descent
  - Segment 4: short transition (AI loop exit → "Your board" loop entry)
  - Segment 5: "Your board" loop arc
  - Segment 6: transition (loop exit → Code loop entry)
  - Segment 7: Code loop arc
  - Segment 8: final sweep to bottom-left
- **Group multiply compositing**: `mix-blend-mode: multiply` applied to parent `<g class="plat-multiply">`, not individual paths. Within the group, segments alpha-composite normally (source-over), so:
  - Crossing overlaps darken naturally (~75% opacity vs 50% single wire)
  - Junction seams between segments don't create harsh dark dots (unlike multiply-on-individual-paths)
- **Butt linecaps**: `stroke-linecap="butt"` avoids round cap overlap artifacts at segment junctions
- **GSAP draw-on animation**: Each segment animates sequentially via `stroke-dashoffset` with duration proportional to segment length. Total draw time ~2.4s with `ease: 'none'` per segment

#### Platform icon nodes
- Three icon+label groups positioned over the wire's loop centers:
  - Code (`</>` brackets) at left:40.6%, top:75%
  - Your board (Drawdy mascot) at left:50.7%, top:72.3%
  - AI (robot icon) at left:58.8%, top:54.2%
- Icons extracted from Section.svg as standalone SVGs with tight viewBoxes
- GSAP: icons scale-in with `back.out(1.7)` easing, labels fade to 50% opacity

### Highlighter marker texture R&D
- Created `test-marker.html` with 10 SVG filter variations (V0 flat, A-I with multiply blend, displacement, streaky alpha masks, paper grain, chisel tip, dry highlighter, neon)
- Created `test-orange.html` with 8 more variations focused on the dual-layer technique
- **Chosen approach**: Variant A — `mix-blend-mode: multiply` on the SVG element, high transparency. Simple and effective.
- Key insight: single `<path>` renders as one atomic paint operation — self-intersections don't darken. Solution: segment the path into multiple `<path>` elements.

### Copy refinements
- Replaced "Synced when you say so" with "Synced on your terms" (privacy section headline)
- Tightened privacy lead paragraph
- Rewrote compare section intro — direct value statement
- Trimmed platform section copy
- Cleaned up FAQ storage answer
- Cloud card: "On only when you choose it" → "Only when you want it"

### Logo updates
- Updated Logo.svg to new wordmark (144x38, all-dark, no lime accent)
- Reduced nav logo height from 32px to 26px
- Removed dead inline SVG from nav markup

### Privacy / Data Store section redesign
- Two-column split layout (kicker + heading + lead left, Data store_Graphic.svg right)
- Responsive breakpoint — stacks vertically on mobile (< 820px)

## Technical notes

### Wire segmentation — why and how
The platform wire path traces three eye-shaped loops (Code, Your board, AI). A single SVG `<path>` paints as one atomic operation, so self-intersections don't produce darker areas even with multiply blend. Splitting the path at loop entry/exit points creates separate paint operations that naturally darken at visual crossings.

The `<g class="plat-multiply">` wrapper is critical: it moves multiply compositing to the group level. Within the group, adjacent segments alpha-composite normally. This means:
- **At crossings**: two overlapping segments → ~75% opacity → group multiplies with background → visibly darker ✓
- **At junctions**: butt caps meet cleanly, any sub-pixel anti-aliasing gap is minimal ✓
- **No junction dots**: unlike multiply-on-individual-paths, round cap overlaps don't create harsh dark spots ✓

### Crossing coordinates (approximate)
- AI loop: ~(1928, 313) in SVG viewBox coordinates
- "Your board" loop: ~(1657, 435)
- Code loop: ~(1371, 487)

## Deployment notes
- Landing page is a separate Vercel project (`drawdy-landing`) deployed via CLI
- Deploy command: `cd "Landing page" && npx vercel --prod --force --yes`
- Not auto-deployed on git push — uses manual CLI deployment
- Always use `--force` flag to avoid stale file caching on Vercel's edge

## File inventory
| File | Purpose |
|------|---------|
| `index.html` | Full landing page (HTML + CSS + JS, single file) |
| `Logo.svg` | Drawdy wordmark logo |
| `Board.svg` | Hand-drawn board frame for hero section (lime stroke) |
| `Elements.svg` | Architecture diagram elements for features section |
| `Section.svg` | Original Figma export of platform section (reference only, not used in prod) |
| `Spark wheel.svg` | Sparkle icon used in platform bottom note |
| `Graphic.svg` | Decorative scribble for final CTA section |
| `Footer_graphic.svg` | Footer decoration |
| `Line.svg` | Decorative line element |
| `Fire up.svg` | Mascot-on-fire illustration |
| `Mascot on fire.svg` | Alternate mascot illustration |
| `Data store_Graphic.svg` | Local/Cloud toggle graphic with mascot (privacy section) |
| `test-marker.html` | Highlighter marker texture test page (10 variations) |
| `test-orange.html` | Orange highlighter dual-layer test page (8 variations) |
| `test-section.html` | Platform section prototype/test page |
| `vercel.json` | Vercel config (static, no build) |

### Blog CMS system
- Headless CMS: Markdown files with YAML frontmatter in `posts/`, compiled by `build.js` into static HTML
- Dependencies: `gray-matter`, `markdown-it`, `markdown-it-highlightjs` (via `package.json`)
- Build generates: `blog.html` (listing), `blog/[slug]/index.html` (articles), `blog/feed.xml` (RSS)
- Vercel build integration: `vercel.json` has `buildCommand: "node build.js"`, `installCommand: "npm install"`
- 8 blog posts with category filtering (announcements, product, design), GSAP entrance animations
- Article pages: SEO (Open Graph, Twitter Card, JSON-LD), prev/next navigation, syntax highlighting
- Reading time calculated from word count (÷238, rounded up)

### Blog thumbnail system
- PNG-based thumbnails in `thumbnails/` directory, named by post slug (e.g. `introducing-drawdy.png`)
- Dimensions: 819×521px (aspect ratio ~1.57:1)
- Build copies `thumbnails/*.png` → `blog/thumbnails/` at build time
- Posts without a PNG get a placeholder SVG (muted bg with faint "Drawdy" text)
- Card hover: thumbnail lifts 6px (`translateY(-6px)`) with 0.3s ease (applied to `.post-thumb` to avoid GSAP inline transform conflict)
- Subtle border: `1px solid rgba(0,0,0,0.1)` on thumbnails so white-bg cards don't blend into page

### Blog content changes
- Post 2 changed from "Why We Chose Local-First Architecture" to "Fast + Optimized Board" (slug: `fast-optimized-board`)
- Content covers: spatial indexing (R-tree), canvas rendering vs DOM, incremental dirty-rect updates, Web Workers, performance benchmarks

### Favicons
- Generated full favicon set: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`
- `site.webmanifest` with theme/bg color `#FAFAF5`

### GitHub repo
- Pushed to `Porches2/Drawdy` on GitHub
- Vercel not yet connected to GitHub for auto-deploy (needs Vercel GitHub App installed on Porches2 account)

### Blog listing refinements (Aug 2026)
- **All 8 thumbnails complete** — created 6 new PNGs (819×521) rendered from hand-authored SVG in the established style (lime #CDFF00 + ink, hand-drawn wobbly strokes, bold Google Sans Flex, alternating light/dark backgrounds):
  - `plugin-api.png` — "Plug it in" lime brush puzzle piece (light)
  - `realtime-collaboration.png` — "Draw together" multiplayer cursors + name pills (light)
  - `excalidraw-to-drawdy.png` — "Switching is easy" sketch rect → lime scribble (dark)
  - `hand-drawn-ui.png` — "Why hand-drawn?" sketchy pencil (dark)
  - `version-history.png` — "Time travel" lime rewind loop around text (light)
  - `roadmap.png` — "What's next" dashed path to a star (dark)
  - Thumbnail source HTML kept out of repo; regenerate by re-rendering 819×521 SVG/HTML if needed
- **Featured card**: newest post renders as a full-width card (thumb left, category · Latest, title, 3-line clamped excerpt, meta right); stacks vertically < 820px
- **Card meta**: listing cards now show "date · N min read" instead of author (author was identical on every card; still shown on article pages)
- **Title hover**: card titles tint to --lime-ink on hover
- **Article SEO**: posts with a thumbnail now emit og:image (819×521), twitter:image, and twitter:card=summary_large_image

## Pending / future
- Connect Vercel to GitHub repo for auto-deploy on push
- Remove test HTML files (`test-marker.html`, `test-orange.html`, `test-section.html`) from production
- Responsive fine-tuning for platform section icon positions on mobile/tablet
- Consider reducing hero bottom whitespace to tighten hero→features gap
