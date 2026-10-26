# Progress

**Current phase:** Phase 9 (UI, branding and project refinement) complete locally. Deployment awaits owner actions (below).
**Last updated:** 2026-10-26

## Phase 9 — refinement (2026-10-23)

Checkpoint commit before edits: `d204d1254f7b9a031c40bc904e541697026717f6`.

| Check                           | Result                                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Lint, types, format             | pass                                                                                                                             |
| Unit/component (Vitest)         | 50/50                                                                                                                            |
| E2E + axe (Playwright)          | 36 pass, 2 intentionally skipped; axe 0 violations on `/` and `/projects/website-portfolio/`, light and dark, desktop and mobile |
| Widths                          | 0 px overflow at 320–1920 px in both themes; first-viewport and detail-page screenshots reviewed                                 |
| Lighthouse (local, 3 runs each) | Desktop 100/100/100/100 · Mobile 95/100/100/100 · project page mobile 95 · CLS 0                                                 |
| Initial JS (home)               | 202.6 KB gzipped (+3.6 KB for client routing to project pages)                                                                   |
| Terraform                       | fmt + validate pass after renaming defaults to `alibacelonia-portfolio`                                                          |

Fixed along the way: screen-reader names missing a space (“View detailsabout estoe”) in six `sr-only` spans; project pages lost `og:image` because page-level `openGraph` replaces the root object; pipeline transitions ran under reduced motion.

## Case studies (2026-10-24)

Home Projects follows the owner's “curated work” reference: preview cards (tagline above the screenshot) in a 65/35 split with one pinned, centered details panel that switches at 25% (D-34, D-35); on desktop the layout spans the section rails, split by a divider into a hatched card column and the details with a progress ruler that marks the active project (D-36). The details start and stop 40 px below the top of the first and last images (D-37). A custom “VIEW · EXPLORE · DISCOVER” cursor appears over the cards for a mouse (D-38). Contact is now Connect: a home section plus a `/connect/` page with the form (D-39), a Book a call (Cal.com) / Send a message tab pair, and an opt-in contact API (API Gateway, Lambda, DynamoDB, SES, Turnstile; not applied) (D-40). Lint, types, format and build pass; Vitest 63/63; Playwright 55 pass, 5 intentionally skipped, axe 0 violations.

## Completed (Phases 0–8)

All tasks P0-1 … P8-10 in `docs/development-plan.md`.

## Verification evidence (2026-10-23)

| Check                      | Command                        | Result                                                                                                                                              |
| -------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint                       | `npm run lint`                 | 0 errors, 0 warnings                                                                                                                                |
| Types                      | `npm run typecheck`            | pass (strict, `noUncheckedIndexedAccess`)                                                                                                           |
| Format                     | `npm run format:check`         | pass                                                                                                                                                |
| Unit/component             | `npm test`                     | 44/44 pass (5 files)                                                                                                                                |
| Static export              | `npm run build`                | `out/` with index, 404, robots, sitemap, OG image (1200×630 PNG)                                                                                    |
| E2E + a11y                 | `npm run test:e2e`             | 24 pass, 2 intentionally skipped (desktop-only width/keyboard tests on the mobile project); axe: 0 violations in light and dark, desktop and mobile |
| Widths                     | `node scripts/screenshots.mjs` | 0 px horizontal overflow at 320/375/390/768/1024/1280/1440/1920 in both themes; screenshots reviewed                                                |
| Lighthouse (local `serve`) | Lighthouse 12                  | Mobile 94 / 100 / 100 / 100 · Desktop 100 / 100 / 100 / 100 · CLS 0                                                                                 |
| Initial JS                 | gzip of HTML-referenced chunks | 199 KB (≈160 KB Next.js + React runtime)                                                                                                            |
| Terraform                  | `fmt -check`, `validate`       | pass (provider `hashicorp/aws ~> 6.0`)                                                                                                              |
| CloudFront function        | Node harness                   | index rewrite, www → apex 301 with query, extensionless files untouched                                                                             |
| Workflows                  | `actionlint` 1.7.12            | pass                                                                                                                                                |
| External links             | `curl`                         | GitHub ×5, PyPI, Credly ×3: 200. LinkedIn: 999 (bot block; URL matches resume)                                                                      |

## Issues found and fixed during verification

- 113 px overflow at 390 px: grid items with `min-width: auto` and unbreakable architecture strings. Fixed with `grid-cols-1`/`minmax(0,1fr)` and whitespace around arrows.
- React hydration error #418 for reduced-motion users, which also wiped `data-theme`. Fixed with a hydration-safe hook (D-19); covered by an E2E test.
- Dock indicator stuck on the first item (`offsetLeft` relative to the `<li>`). Fixed with rect deltas; E2E asserts alignment.
- Initial JS 237 KB → 199 KB by dropping Motion layout features (D-18).
- Copy that over-claimed (“trade-offs written down”, “I read every message”) was softened.
- 2026-10-26: Review findings: Resume → CV; hero and estoe repetition removed; two font families and `rem` sizes; light mode with a dock toggle; clay surfaces and controls throughout (D-76 to D-80).
- 2026-10-26: Aurora words no longer cut off descenders (the g in “building”) (D-75).
- 2026-10-26: Certification badges tilt toward the mouse (D-74).
- 2026-10-26: Aurora word is still; only its colors drift (D-73).
- 2026-10-26: Title bands vertically centered on sections that follow an action strip (D-72).
- 2026-10-26: Section-title italic words are animated aurora text (D-70); Experience details are justified (D-71).
- 2026-10-25: Section titles wrapped in rail-to-rail title bands on every page except the hero (D-69).
- 2026-10-25: Case-study panels reformatted after the reference (pills, accent sparkles, arrow chip, accent ruler) (D-68).
- 2026-10-25: Section top padding removed; titles start right under the divider band (D-67).
- 2026-10-25: Section title blocks and case-study detail headers are `div`s instead of `<header>` (D-66).
- 2026-10-25: Case-study list uses `div`s instead of `ol`/`li` (D-65).
- 2026-10-25: Section numbers removed; overlines show the section name only, and the hero has none (D-64).
- 2026-10-25: Section titles redesigned after the reference (overline + serif display title with italic last word, no descriptions); Skills renamed Tech Stack (D-63).
- 2026-10-25: Consistent section numbering: hero “01 / Home”, home 02–05, “06 / Connect” (also on `/connect/`), `/projects/` “02” (D-62).
- 2026-10-25: Repeated text removed across sections (eyebrows, leads, labels, case-study panels, Website Portfolio page) (D-61).
- 2026-10-25: Booking confirmation shown by the site after Cal.com reports a booking, replacing the white Cal.com success page (D-60). Hero jump-link test made motion-independent after a parallel-load flake.
- 2026-10-25: The screenshot's bottom border now appears only on hover (D-59).
- 2026-10-25: Case screenshots framed on all four sides, resting 20 px low and tipping back in perspective on desktop hover, per the owner's reference class (D-58).
- 2026-10-25: Case gradients now complement each screenshot (IronFort blue, portfolio sage); image-less cards use the neutral grey; the overlay dims only the card background (D-57).
- 2026-10-25: Case cards dimmed by a 30 % overlay that fades on hover (mouse only) (D-56).
- 2026-10-25: Case cards use the owner's gradients (pink, blue, grey, purple, pink); screenshot frames use each gradient's second-lightest stop (D-55).
- 2026-10-25: Screenshot frames now use their card's own background (`--stage-bg`), enforced by an E2E test (D-54).
- 2026-10-25: IronFort card trial: dark bluish grey to white diagonal gradient (per-card `stageGradient`, D-53).
- 2026-10-25: Case cards shade from dark top left to lighter bottom right; screenshots get a 2 px border in the card's discipline color (D-52).
- 2026-10-25: Case-study preview cards made claymorphic like the dock; the hatched background behind them is unchanged (D-51).
- 2026-10-24: Reusable dock: clay (default), glass or neo, chosen with `NEXT_PUBLIC_DOCK_STYLE` / GitHub variable `DOCK_STYLE` (D-48).
- 2026-10-24: Website Portfolio updated for the live system: key stack, overview, stack (contact API services, Cloudflare DNS), infrastructure rows (no planned items left) and a Deploy / Serve / Contact architecture graph on its project page (D-49).
- 2026-10-24: IronFort screenshot replaced with the owner-supplied homepage image (5 × 3.5 in, 1600 × 1120 WebP).
- 2026-10-24: Website Portfolio case study shows the owner-supplied screenshot of this site (1600 × 1120 WebP) instead of the architecture flow.
- 2026-10-24: Dark surfaces, borders, text greys and frame lines shifted from blue-greys to the zinc family so every neutral matches `#0D0D0F` (D-47).
- 2026-10-24: Navigation dock restyled from frosted glass to claymorphism in near-`#0D0D0F` greys, with a raised clay pill for the active link; mobile menu button and panel match (D-46).
- 2026-10-24: Dark background changed from `#090C10` to `#0D0D0F` (owner request, same as the reference site); browser theme color updated to match.
- 2026-10-24: Booking calendar matched to the owner's reference: Cal.com's default dark theme with event details, 1040px wide, three-column skeleton (D-45).
- 2026-10-24: Book a call looked boxed and loaded blank. It now uses Cal.com's inline embed (transparent, site colors, no details panel, auto height) with a skeleton and a plain-iframe fallback (D-44). Measured locally: calendar ready in about 1.6 s with zero CSP violations under the new policy; with the current policy the fallback shows immediately.
- 2026-10-24: CI E2E failed once `CAL_LINK` was set: the default Book a call tab hid the form, and axe scanned the live Cal.com iframe. Tests now stub third-party services, open the message tab when present, check both tabs with axe, and pass with the variables set or unset (D-43).

## Design decisions that changed

- Dock indicator: Motion `layoutId` → CSS transform (D-18).
- Theme toggle icon: Motion → CSS, driven by `data-theme` (correct before hydration).
- Cloud Practitioner credential: now verified from the resume link (D-09).

## Remaining / blocked (owner actions)

1. ~~Push this repository~~ — done (2026-10-24). Its GitHub description still says “Python Lambda”; update it (the Lambda is Node.js 22).
2. ~~Resume privacy~~ — resolved: replaced with the public resume (no address or phone).
3. ~~Contact API~~ — done: live and sending (2026-10-24).
4. ~~AWS provisioning~~ — done. Still to apply: the CSP change that allows `https://app.cal.com` (D-44).
5. ~~GitHub `production` environment and variables~~ — done.
6. ~~DNS cutover on Cloudflare~~ — done: alibacelonia.dev serves from CloudFront. The Website Portfolio project no longer lists planned items.
7. After going live: run Lighthouse against production (security headers and caching only exist on CloudFront).

## Glass and theme audit (2026-10-26)

Replaced clay/neo surfaces with reusable glass materials for cards, panels, controls, fields, labels, the dock and mobile snackbar. Project preview palettes now tint translucent theme surfaces with theme foreground text; the custom cursor, Connect photo frame, media shadows, form placeholders/errors/focus/selected states and browser chrome also follow the chosen theme. Legacy dock settings resolve to glass. Turnstile recreates its widget and clears its token when the theme changes; Cal.com follows the same theme and form input is preserved.

Verified all eight rendered routes (home, Connect, project collection, all four project details and 404) in light/dark on desktop/mobile with zero detectable axe violations, including form validation states. Contrast checks cover floating navigation over an opposite-color backdrop; reduced-transparency and forced-colors fallbacks pass. Desktop/mobile project and Connect screenshots were reviewed in both themes. Original project screenshots and credential artwork are unchanged.

Validation: lint, TypeScript/static production build and formatting pass; 77 unit/component tests pass. Full Playwright suites pass with third-party configuration enabled (99 passed, 7 expected breakpoint skips) and unset (95 passed, 11 expected breakpoint/configuration skips). Third-party services are stubbed; no real bookings or messages were sent. Decision D-81 records the shared material and fallback rules.

## Lightweight personality and interactions (2026-10-26)

Added a short hero introduction and reusable static `offset-frame`, keeping the square portrait and its preload unchanged. Skills now show monochrome technology icons with native disclosures for verified project references (up to two per skill, drawn from documented stacks/published client work; working-knowledge labels preserved). Project filters live only on `/projects/`, with live counts that include client work, keyboard/touch access, hidden empty categories, and server-rendered cards. All content and skill disclosures remain usable without JavaScript. No runtime package was added; original photos/screenshots remain unchanged. D-82 and the design system record these choices, and Simple Icons artwork/license is recorded in `docs/third-party-notices.md`.

Validation: production build/TypeScript, lint and formatting pass; 80 unit/component tests pass; full desktop/mobile Playwright suite passes with 109 passed and 7 expected breakpoint skips. Axe scans cover all eight routes in both themes and the opened skill/filter states, with no detected violations. Keyboard, touch, no-JavaScript behavior, original project navigation and 320–1920 px overflow checks pass. Hero, skill disclosures and filtered project screenshots were reviewed across desktop/mobile and both themes.

Local performance comparison against commit `401716f` (three fresh-context runs per viewport, same static server and Chromium; mobile emulation uses 4× CPU throttling): median home LCP desktop 64 → 68 ms, mobile 136 → 140 ms, CLS 0 in every before/after run. These fast local timings are a smoke check, not a Lighthouse score or field estimate. Initial script gzip totals: home 222,198 → 222,265 bytes (+67); project index 212,662 → 213,446 bytes (+784). SVGs/reference content add server-rendered HTML (home document is 60,816 bytes gzip), with no client icon/disclosure bundle. Production output uses the normal local configuration.
