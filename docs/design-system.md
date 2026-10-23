# Design system

Premium, minimalist, full-width, with restrained operating-system details (a sticky glass navigation dock and monospace status labels). The typographic **A/B** mark is used for site identity assets. Hierarchy comes from size, weight, spacing and contrast — never from colored or gradient text.

## Tokens

Defined as CSS variables in `src/app/globals.css` and exposed to Tailwind through `@theme inline`.

The site currently uses dark mode only, including static HTML and first paint. Light mode and the theme control are disabled; saved light preferences and operating-system theme changes cannot override dark mode. Light-theme tokens and the toggle component are retained for possible re-enablement.

| Token                          | Light                 | Dark                  | Use                                     |
| ------------------------------ | --------------------- | --------------------- | --------------------------------------- |
| `--bg`                         | `#FAFBFC`             | `#090C10`             | Page and alternating section background |
| `--surface`                    | `#FFFFFF`             | `#11151B`             | Cards, alternating section surface      |
| `--surface-2`                  | `#F3F5F8`             | `#181C23`             | Insets, tags, code                      |
| `--fg`                         | `#111827`             | `#F3F4F6`             | Primary text                            |
| `--muted`                      | `#64748B`             | `#9CA3AF`             | Secondary text                          |
| `--border`                     | `#E5E7EB`             | `#30363D`             | Hairlines                               |
| `--blue` / `--blue-fg`         | `#A9C4E8` / `#335C8F` | `#7FA3D1` / `#A9C6EE` | Full-Stack, links, focus                |
| `--sage` / `--sage-fg`         | `#B4CDB6` / `#3F6B49` | `#8DAF92` / `#B4D3B8` | DevOps / Cloud, pipeline success        |
| `--lavender` / `--lavender-fg` | `#C9BFE6` / `#5D4E8E` | `#A496CF` / `#CABFEF` | AI Engineering                          |

`*-fg` variants are the only accent colors allowed on text; each meets 4.5:1 against `--bg` and `--surface` in its theme. Fill variants are used only for dots, lines and soft tints (`color-mix` at ≤ 18 %).

## Typography

- Geist Sans (via the `geist` package, self-hosted by `next/font`) for everything; Geist Mono for section indices, pipeline labels, dates and architecture flows.
- Every section uses the same type scale, defined once as utilities in `src/app/globals.css`. Use these instead of ad-hoc `text-[…]` sizes:

| Utility              | Size / style                                  | Color | Role                                                         |
| -------------------- | --------------------------------------------- | ----- | ------------------------------------------------------------ |
| `type-eyebrow`       | Geist Mono 12 px, +0.025em                    | muted | Section index (“02 / Projects”), 404 code                    |
| `type-section-title` | `clamp(1.5rem, 1.2rem + 1vw, 2rem)`, 600      | fg    | Every section `h2`                                           |
| `type-page-title`    | `clamp(1.75rem, 1.3rem + 1.6vw, 2.5rem)`, 600 | fg    | Page `h1` (projects, project detail, 404)                    |
| `type-lead`          | 15 px / 1.65                                  | muted | Section and page introductions                               |
| `type-prose`         | 15 px / 1.7                                   | (set) | Long-form text on project pages                              |
| `type-card-title`    | 17 px / 1.35, 600                             | fg    | Every card heading, project-page subsection headings         |
| `type-body`          | 14 px / 1.65                                  | (set) | Card descriptions, bullets, lists, contact details           |
| `type-small`         | 13 px / 1.55                                  | (set) | Notes, form labels and messages, legends, footer             |
| `type-label`         | Geist Mono 11 px, +0.02em                     | (set) | Status, group labels, codes, form/contact labels, hero strip |
| `type-mono`          | Geist Mono 12 px                              | (set) | Dates and flow diagrams                                      |
| `type-action`        | 13 px, 500                                    | (set) | Card actions, back links, buttons                            |

“(set)” means the utility carries no color: pair it with one `text-*` class. Never combine a utility that has a color with another color class (the winner is not guaranteed). Form inputs use 16 px so iOS does not zoom on focus. Navigation stays 13 px; the hero name and Tag chips (12 px) keep their own sizes.

- Section headings `clamp(1.5rem, 1.2rem + 1vw, 2rem)`; hero name in Geist Mono at `clamp(1.875rem, 1rem + 2.2vw, 3rem)` (one line from 1280 px, balanced onto two lines below).
- Text measure: paragraphs capped at `60–68ch`.

## Layout

- No global max-width. Each section is a full-width band on the same `--bg` background (no tone alternation; every card and panel sits on `--surface`, so cards read identically in every section) framed by aligned 1 px vertical rails. Between sections, a 20–32 px strip uses fine diagonal hatching and square junction markers. Vertical rails are inset `clamp(16px, 5vw, 80px)` from each side; horizontal divider borders continue to both viewport edges, including at the footer. Hatching fills the side gutters and the center remains clear, with square markers at every rail intersection. A section that follows one ending in an action strip (the hero overview, “View all projects”) omits its own divider band and markers and starts flush against that strip, so two bands never stack.
- Inner content uses `.container-fluid`: fluid content gutters `clamp(32px, 7.5vw, 120px)`, content capped at 1600 px only so 4K screens keep a readable grid.
- Section header: a rectangular panel with a soft neutral tint and 1 px border; mono index (`02`) + title + lead on the left, optional meta on the right (stacks on mobile).
- Grids: projects 1 → 2 (`md`) → 4 (`2xl`) columns; skills 1 → 3 (`lg`); certifications 1 → 3 (`md`); experience date column appears at `md`.
- Touch targets ≥ 40 px (44 px for primary actions and mobile menu items).

Section framing is implemented in `SectionFrame` and plain CSS (`border`, pseudo-elements and `repeating-linear-gradient`), with light/dark tokens for lines, hatching, tint and markers. Decorative guides are hidden from assistive technology and do not intercept input; forced-colors mode removes the hatching and markers. Contact information and its form use matching shaded panels.

## Components

| Component  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation | Centered, content-width glass dock (`position: sticky`, `z-50`), 50 px tall, 12–20 px below the viewport top, pill radius. Frosted surface with 24 px backdrop blur, a fine rim, top highlight and soft shadow, with light/dark tokens and an opaque fallback. Six section links at `sm+` with a sliding raised pill indicator. Below `sm`: a circular glass hamburger button at the top right opens a glass snackbar fixed above the bottom safe area. All six links appear in a three-column icon grid with an active pill, plus a close button. The snackbar closes on navigation, outside tap, Escape or resize to desktop; keyboard opening focuses the current link. Overlaps the page via a negative bottom margin; anchors offset with `scroll-padding-top: var(--nav-offset) + 16px`. The resume download remains in the hero; there is no theme control while dark-only mode is enabled. |
| Card       | `card` utility: `--surface`, 1 px `--border`, 12 px radius, `--shadow-sm`, 20 px padding (24 px from `sm`). Used by project, experience, skill and certification cards. Card grids and lists use `gap-4 lg:gap-5`. Card anatomy: meta line (`type-label`), `type-card-title`, `type-body`, then actions above a hairline divider. Standalone actions use `text-fg`; the blue accent is only for inline links inside sentences. Hover (interactive cards only): border darkens, 2 px lift (no glow).                                                                                                                                                                                                                                                                                                                                                                                                |
| Tag        | 12 px, 6 px radius, `--surface-2`. Working-knowledge tags use a dashed border plus visually hidden text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Button     | Primary: solid `--fg` on `--bg`. Secondary: bordered. 40–44 px tall.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Experience timeline

A vertical, scroll-down timeline (newest first). From `md`: three columns — dates (11 rem, `position: sticky` below the dock so they stay beside a long card), the rail (3.5 rem), and one `card` per role. Below `md`: the rail runs down the left (2.75 rem) and the dates sit above each card.

- **Rail:** a 2 px `--border-strong` segment from each node to the next. Nodes (11 px) align with the card title from `md` and with the date line on phones (`--exp-node-c`). The current role's node is sage with a soft halo.
- **Scroll progress:** with CSS scroll-driven animations (`animation-timeline: view()`), each segment fills and each node lights up as it passes the middle of the viewport. No JavaScript. Skipped with `prefers-reduced-motion` and in browsers without support, which show the static rail.
- **Concurrency:** when a role starts before the next (older) one ended, a sage bracket beside the rail joins the two nodes (Buzzerboy alongside Fujitsu). A handover in the same month is not treated as overlap. The card note explains it in words.
- **Dates:** range in `type-mono`, then the computed inclusive duration (“4 yrs 3 mos”) or “Current role”, then employment type, all in `type-label`.

## Logo

`src/lib/brand.ts` holds one stroke path on a 32×32 grid (condensed A, light-lean slash, B with a slightly larger lower bowl). Available through `Logo` (current text color) and used by `src/app/icon.svg` (light strokes on `#111827`) and the Open Graph image. Paths, not text, so it never depends on installed fonts; readable at 16 px.

## Hero

Full first viewport (`min-height: 100vh; min-height: 100svh`), portrait and introduction vertically centered below the navigation, with the overview strip anchored at the bottom, and allowed to grow on small screens. Background: plain `--bg`, without a grid or dot pattern. The continuous section rails also frame the hero; the overview strip spans the full framed container beneath both hero columns, with edge-to-edge horizontal rules, hatched side gutters and square intersections.

The overview has four equal-width, equal-height cells: Building (full-stack applications), Experience (7+ years), Certified (AWS 3×), and Reach out (Start a conversation). All four values use the same sans-serif size and weight (14 px on mobile, 16 px from `sm`). The AWS value links to Certifications and the last cell links to Contact; both use the same arrow (`TileArrow`: right arrow in a solid `fg` circle that slides right on hover). Both links are clickable across their tiles. All four fill the framed width in one row on desktop and a two-by-two grid on smaller screens. The owner-provided portrait is served as an optimized local WebP, centered above the centered introduction below `lg` (photo, name, roles, description, actions and links share one axis; the link-row divider fits its links) and in the left column from `lg`, where the introduction is left-aligned, with the introduction on the right. Desktop uses a two-column grid (portrait auto width, text `minmax(0, 1fr)`) with a single 48–64 px gap, so photo and text read as one centered group. The portrait keeps a square crop (224 px mobile, 288 px `sm`, 304 px `lg`, 352 px `xl`, 384 px `2xl`), grayscale and a faint halftone texture; the image asset is unchanged. A hairline divider separates the actions from the GitHub, LinkedIn and email links. Text actions and GitHub, LinkedIn and email links sit below the introduction. At desktop widths (1024 px and above), email copies the address and announces success; on smaller screens and without JavaScript it opens the native mail client. Clipboard failures expose the address for manual copying. The hero ends with the four-cell overview; the delivery pipeline strip has been removed.

## Project pages

The homepage ends its project section with a full-width, bordered action row (96–136 px tall), hatched side gutters and square intersections, linking to `/projects/`. Cards show category, status, name, a short summary, up to six key technologies, **View details**, and external links. `/projects/<id>/` presents A Overview · B Problem (with “Who it helps”) · C Solution · D Technology stack · E Infrastructure & architecture (summary, flow diagram, item list with dashed **planned** badges) · F Links, with a sticky A–F index on `lg+`.

## Motion

Motion for React is used where it earns its weight: `AnimatePresence` for the mobile menu's enter/exit (lazy-loaded with the panel, so desktop never downloads it). `LazyMotion` loads only `domAnimation`; `MotionConfig reducedMotion="user"` applies globally. The dock indicator, theme icon swap, card hover and section entrances are CSS transitions (D-04, D-18). Entrances apply only when JavaScript has run (`html.js`), so content is visible without JS. UI transition durations ≤ 500 ms, easing `cubic-bezier(0.2, 0.8, 0.2, 1)`. `prefers-reduced-motion: reduce` disables entrances and smooth scrolling.

Lenis smooths document scrolling with a 1.1-second duration and handles same-page anchors using the existing scroll padding. Same-page navigation links defer scrolling to Lenis; links from other pages retain Next.js anchor scrolling. Native touch scrolling stays enabled. Reduced-motion preferences apply live and make anchor navigation immediate. The root instance adds no layout wrapper and is recreated on pathname changes so inertia cannot carry into another page. CSS smooth scrolling is disabled to avoid competing animations.

## Prohibited

Gradient or colored display text, neon, saturated gradients, stock photos, glowing cards, decorative patterns beyond the portrait texture and section hatching, percentage skill bars, fake screenshots or badges, duplicate navigation.
