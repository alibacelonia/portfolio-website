# Design system

Premium, minimalist, full-width, with restrained operating-system details (window chrome on the pipeline card, a sticky glass navigation bar, monospace status labels). Logo: a typographic **A/B** mark. Hierarchy comes from size, weight, spacing and contrast — never from colored or gradient text.

## Tokens

Defined as CSS variables in `src/app/globals.css` and exposed to Tailwind through `@theme inline`.

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
- Section headings `clamp(1.5rem, 1.2rem + 1vw, 2rem)`; hero name `clamp(1.75rem, 1.2rem + 2.4vw, 3rem)`.
- Text measure: paragraphs capped at `60–68ch`.

## Layout

- No global max-width. Each section is a full-width band (`--bg` / `--surface` alternation, 1 px top border).
- Inner content uses `.container-fluid`: fluid gutters `clamp(16px, 5vw, 80px)`, content capped at 1600 px only so 4K screens keep a readable grid.
- Section header: mono index (`02`) + title + lead on the left; optional meta on the right (stacks on mobile).
- Grids: projects 1 → 2 (`md`) → 4 (`2xl`) columns; skills 1 → 3 (`lg`); certifications 1 → 3 (`md`); experience date column appears at `md`.
- Touch targets ≥ 40 px (44 px for primary actions and mobile menu items).

## Components

| Component  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation | Single sticky glass bar (`position: sticky`, `z-50`), 52 px tall, 8–12 px below the viewport top, 16 px radius, `.glass` surface. Left: A/B logo. Center (`lg+`): six section links with a sliding CSS indicator. Right: theme toggle, Resume. Below `lg`: menu button opens a glass panel under the bar. Overlaps the page via a negative bottom margin; anchors offset with `scroll-padding-top: var(--nav-offset) + 16px`. |
| Card       | `--surface`, 1 px border, 12 px radius, shadow `0 1px 2px rgb(0 0 0 / 4%)`. Hover: border darkens, 2 px lift (no glow).                                                                                                                                                                                                                                                                                                       |
| Tag        | 12 px, 6 px radius, `--surface-2`. Working-knowledge tags use a dashed border plus visually hidden text.                                                                                                                                                                                                                                                                                                                      |
| Button     | Primary: solid `--fg` on `--bg`. Secondary: bordered. 40–44 px tall.                                                                                                                                                                                                                                                                                                                                                          |

## Logo

`src/lib/brand.ts` holds one stroke path on a 32×32 grid (condensed A, light-lean slash, B with a slightly larger lower bowl). Used by the header (`Logo`, current text color), `src/app/icon.svg` (light strokes on `#111827`) and the Open Graph image. Paths, not text, so it never depends on installed fonts; readable at 16 px.

## Hero

Full first viewport (`min-height: 100vh; min-height: 100svh`), content vertically centered below the navigation, and allowed to grow on small screens. Background: one fine dot grid (1 px dots, 22 px pitch, `--pattern-dot` ≈ 13 % / 12 % opacity per theme) faded with a radial mask; hidden in forced-colors mode. No other decoration.

## Project pages

Cards show category, status, name, a short summary, up to six key technologies, **View details**, and external links. `/projects/<id>/` presents A Overview · B Problem (with “Who it helps”) · C Solution · D Technology stack · E Infrastructure & architecture (summary, flow diagram, item list with dashed **planned** badges) · F Links, with a sticky A–F index on `lg+`.

## Motion

Motion for React is used where it earns its weight: `AnimatePresence` for the mobile menu's enter/exit (lazy-loaded with the panel, so desktop never downloads it) and `useInView` to start the pipeline sequence. `LazyMotion` loads only `domAnimation`; `MotionConfig reducedMotion="user"` applies globally. The dock indicator, theme icon swap, card hover and section entrances are CSS transitions (D-04, D-18). Entrances apply only when JavaScript has run (`html.js`), so content is visible without JS. Durations ≤ 500 ms, easing `cubic-bezier(0.2, 0.8, 0.2, 1)`. `prefers-reduced-motion: reduce` disables entrances, smooth scrolling and pipeline sequencing; the reduced-motion check is hydration-safe (`usePrefersReducedMotion`).

## Prohibited

Gradient or colored display text, neon, saturated gradients, photos, glowing cards, decorative patterns, percentage skill bars, fake screenshots or badges, duplicate navigation.
