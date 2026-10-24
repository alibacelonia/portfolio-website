# Progress

**Current phase:** Phase 9 (UI, branding and project refinement) complete locally. Deployment awaits owner actions (below).
**Last updated:** 2026-10-23

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
- 2026-10-24: CI E2E failed once `CAL_LINK` was set: the default Book a call tab hid the form, and axe scanned the live Cal.com iframe. Tests now stub third-party services, open the message tab when present, check both tabs with axe, and pass with the variables set or unset (D-43).

## Design decisions that changed

- Dock indicator: Motion `layoutId` → CSS transform (D-18).
- Theme toggle icon: Motion → CSS, driven by `data-theme` (correct before hydration).
- Cloud Practitioner credential: now verified from the resume link (D-09).

## Remaining / blocked (owner actions)

1. Push this repository to `github.com/alibacelonia/portfolio-website` (currently empty) and update its description.
2. ~~Resume privacy~~ — resolved: replaced with the public resume (no address or phone).
3. Contact API: Turnstile widget and SSM secret, approve `enable_contact_api`, SES DKIM records, then set `CONTACT_API_URL` and `TURNSTILE_SITE_KEY` (see `docs/deployment.md`).
4. Approve AWS provisioning: Terraform state bucket, `terraform apply` (see `docs/deployment.md`).
5. Configure the GitHub `production` environment and variables.
6. DNS cutover on Cloudflare (replaces the current Vercel site at alibacelonia.dev).
   Afterwards remove `status: "planned"` from the Website Portfolio infrastructure items in `src/data/projects.ts`.
7. After going live: run Lighthouse against production (security headers and caching only exist on CloudFront).
