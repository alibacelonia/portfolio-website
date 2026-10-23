# Progress

**Current phase:** complete through Phase 8 (local). Deployment awaits owner actions (below).
**Last updated:** 2026-10-23

## Completed

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

## Design decisions that changed

- Dock indicator: Motion `layoutId` → CSS transform (D-18).
- Theme toggle icon: Motion → CSS, driven by `data-theme` (correct before hydration).
- Cloud Practitioner credential: now verified from the resume link (D-09).

## Remaining / blocked (owner actions)

1. Push this repository to `github.com/alibacelonia/portfolio-website` (currently empty) and update its description.
2. Decide whether to publish the resume as is: `public/documents/…pdf` contains a street address and phone number.
3. Create a Formspree form; set `FORMSPREE_FORM_ID`.
4. Approve AWS provisioning: Terraform state bucket, `terraform apply` (see `docs/deployment.md`).
5. Configure the GitHub `production` environment and variables.
6. DNS cutover on Cloudflare (replaces the current Vercel site at alibacelonia.dev).
7. After going live: run Lighthouse against production (security headers and caching only exist on CloudFront).
