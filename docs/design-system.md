# Design system

Premium, minimalist, full-width, with restrained operating-system details (a sticky glass navigation dock and monospace status labels). The typographic **A/B** mark is used for site identity assets. Hierarchy comes from size, weight, spacing and contrast — never from colored or gradient text.

## Tokens

Defined as CSS variables in `src/app/globals.css` and exposed to Tailwind through `@theme inline`.

The site currently uses dark mode only, including static HTML and first paint. Light mode and the theme control are disabled; saved light preferences and operating-system theme changes cannot override dark mode. Light-theme tokens and the toggle component are retained for possible re-enablement.

| Token                          | Light                 | Dark                  | Use                                     |
| ------------------------------ | --------------------- | --------------------- | --------------------------------------- |
| `--bg`                         | `#FAFBFC`             | `#0D1117`             | Page and alternating section background |
| `--surface`                    | `#FFFFFF`             | `#161B22`             | Cards, alternating section surface      |
| `--surface-2`                  | `#F3F5F8`             | `#1C2129`             | Insets, tags, code                      |
| `--fg`                         | `#111827`             | `#F3F4F6`             | Primary text                            |
| `--muted`                      | `#64748B`             | `#9CA3AF`             | Secondary text                          |
| `--border`                     | `#E5E7EB`             | `#30363D`             | Hairlines                               |
| `--blue` / `--blue-fg`         | `#A9C4E8` / `#335C8F` | `#7FA3D1` / `#A9C6EE` | Full-Stack, links, focus                |
| `--sage` / `--sage-fg`         | `#B4CDB6` / `#3F6B49` | `#8DAF92` / `#B4D3B8` | DevOps / Cloud, pipeline success        |
| `--lavender` / `--lavender-fg` | `#C9BFE6` / `#5D4E8E` | `#A496CF` / `#CABFEF` | AI Engineering                          |

`*-fg` variants are the only accent colors allowed on text; each meets 4.5:1 against `--bg` and `--surface` in its theme. Fill variants are used only for dots, lines and soft tints (`color-mix` at ≤ 18 %).

## Typography

- Geist Sans (via the `geist` package, self-hosted by `next/font`) for everything; Geist Mono for section indices, pipeline labels, dates and architecture flows.
- Body 15 px (`text-[15px]`), supporting 13–14 px, navigation 13 px, mono labels 11–12 px.
- Section headings `clamp(1.5rem, 1.2rem + 1vw, 2rem)`; hero name in Geist Mono at `clamp(1.75rem, 1.15rem + 2.3vw, 3rem)`.
- Text measure: paragraphs capped at `60–68ch`.

## Layout

- No global max-width. Each section is a full-width band (`--bg` / `--surface` alternation) framed by aligned 1 px vertical rails. Between sections, a 20–32 px strip uses fine diagonal hatching and square junction markers.
- Inner content uses `.container-fluid`: fluid gutters `clamp(16px, 5vw, 80px)`, content capped at 1600 px only so 4K screens keep a readable grid.
- Section header: a rectangular panel with a soft neutral tint and 1 px border; mono index (`02`) + title + lead on the left, optional meta on the right (stacks on mobile).
- Grids: projects 1 → 2 (`md`) → 4 (`2xl`) columns; skills 1 → 3 (`lg`); certifications 1 → 3 (`md`); experience date column appears at `md`.
- Touch targets ≥ 40 px (44 px for primary actions and mobile menu items).

Section framing is implemented in `SectionFrame` and plain CSS (`border`, pseudo-elements and `repeating-linear-gradient`), with light/dark tokens for lines, hatching, tint and markers. Decorative guides are hidden from assistive technology and do not intercept input; forced-colors mode removes the hatching and markers. Contact information and its form use matching shaded panels.

## Components

| Component  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation | Centered, content-width glass dock (`position: sticky`, `z-50`), 50 px tall, 12–20 px below the viewport top, pill radius. Frosted surface with 24 px backdrop blur, a fine rim, top highlight and soft shadow, with light/dark tokens and an opaque fallback. Six section links at `sm+` with a sliding raised pill indicator. Below `sm`: a circular glass hamburger button at the top right opens a glass snackbar fixed above the bottom safe area. All six links appear in a three-column icon grid with an active pill, plus a close button. The snackbar closes on navigation, outside tap, Escape or resize to desktop; keyboard opening focuses the current link. Overlaps the page via a negative bottom margin; anchors offset with `scroll-padding-top: var(--nav-offset) + 16px`. The resume download remains in the hero; there is no theme control while dark-only mode is enabled. |
| Card       | `--surface`, 1 px border, 12 px radius, shadow `0 1px 2px rgb(0 0 0 / 4%)`. Hover: border darkens, 2 px lift (no glow).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Tag        | 12 px, 6 px radius, `--surface-2`. Working-knowledge tags use a dashed border plus visually hidden text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Button     | Primary: solid `--fg` on `--bg`. Secondary: bordered. 40–44 px tall.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Logo

`src/lib/brand.ts` holds one stroke path on a 32×32 grid (condensed A, light-lean slash, B with a slightly larger lower bowl). Available through `Logo` (current text color) and used by `src/app/icon.svg` (light strokes on `#111827`) and the Open Graph image. Paths, not text, so it never depends on installed fonts; readable at 16 px.

## Hero

Full first viewport (`min-height: 100vh; min-height: 100svh`), content vertically centered below the navigation, and allowed to grow on small screens. Background: one fine dot grid (1 px dots, 22 px pitch, `--pattern-dot` ≈ 13 % / 12 % opacity per theme) faded with a radial mask; hidden in forced-colors mode. The continuous section rails also frame the hero; the focus row spans beneath both hero columns, with fine horizontal rules and three divided cells.

Below the portrait and introduction, a full-width three-column focus row describes the work: Building (full-stack applications), Shipping (automated cloud delivery), and Exploring (applied AI). Small discipline-colored dots accompany the mono labels. The owner-provided portrait is served as an optimized local WebP, left-aligned above the name on mobile and enlarged in the desktop left column, with the introduction on the right. CSS adds grayscale, a faint halftone texture and softly faded edges; the image asset is unchanged. Text actions and GitHub, LinkedIn and email links sit below the introduction. The hero ends with the focus row; the delivery pipeline strip has been removed.

## Project pages

Cards show category, status, name, a short summary, up to six key technologies, **View details**, and external links. `/projects/<id>/` presents A Overview · B Problem (with “Who it helps”) · C Solution · D Technology stack · E Infrastructure & architecture (summary, flow diagram, item list with dashed **planned** badges) · F Links, with a sticky A–F index on `lg+`.

## Motion

Motion for React is used where it earns its weight: `AnimatePresence` for the mobile menu's enter/exit (lazy-loaded with the panel, so desktop never downloads it). `LazyMotion` loads only `domAnimation`; `MotionConfig reducedMotion="user"` applies globally. The dock indicator, theme icon swap, card hover and section entrances are CSS transitions (D-04, D-18). Entrances apply only when JavaScript has run (`html.js`), so content is visible without JS. UI transition durations ≤ 500 ms, easing `cubic-bezier(0.2, 0.8, 0.2, 1)`. `prefers-reduced-motion: reduce` disables entrances and smooth scrolling.

Lenis smooths document scrolling with a 1.1-second duration and handles same-page anchors using the existing scroll padding. Same-page navigation links defer scrolling to Lenis; links from other pages retain Next.js anchor scrolling. Native touch scrolling stays enabled. Reduced-motion preferences apply live and make anchor navigation immediate. The root instance adds no layout wrapper and is recreated on pathname changes so inertia cannot carry into another page. CSS smooth scrolling is disabled to avoid competing animations.

## Prohibited

Gradient or colored display text, neon, saturated gradients, stock photos, glowing cards, decorative patterns beyond the hero dots and section hatching, percentage skill bars, fake screenshots or badges, duplicate navigation.
