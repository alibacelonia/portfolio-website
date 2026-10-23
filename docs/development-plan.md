# Development plan

Source of truth for task status. A box is checked only when its acceptance criteria are met and its tests pass. Evidence lives in `docs/progress.md`.

Format: **ID — Feature.** Implementation · _Depends on_ · **Accepts when** · _Tests_

## Phase 0 — Inspection and planning

- [x] **P0-1 — Workspace inspection.** List files, toolchain (Node 22, npm 10, gh, terraform, aws). · — · **Accepts when** existing assets are known (only `resume.pdf`). · _Tests:_ n/a
- [x] **P0-2 — Resume and instructions.** Extract roles, dates, skills, embedded links from `resume.pdf`. · P0-1 · **Accepts when** facts recorded in `requirements.md`. · _Tests:_ manual cross-check
- [x] **P0-3 — Skills inventory.** Check installed skills/plugins. · — · **Accepts when** availability documented (D-17). · _Tests:_ n/a
- [x] **P0-4 — GitHub projects.** Clone public repos, read README/architecture/source/CI, check releases and PyPI. · — · **Accepts when** three projects chosen with sources. · _Tests:_ n/a
- [x] **P0-5 — Verified/missing data.** · P0-2, P0-4 · **Accepts when** `requirements.md` lists sources and gaps. · _Tests:_ n/a
- [x] **P0-6 — Architecture and design specs.** · P0-5 · **Accepts when** `architecture.md`, `design-system.md`, `decisions.md` exist. · _Tests:_ contrast ratios computed for all text tokens
- [x] **P0-7 — Development plan.** · P0-6 · **Accepts when** this file exists. · _Tests:_ n/a

## Phase 1 — Foundation

- [x] **P1-1 — Next.js + TypeScript.** Pinned deps, strict `tsconfig`, `@/*` alias. · P0-7 · **Accepts when** `npm run typecheck` passes. · _Tests:_ typecheck
- [x] **P1-2 — Tailwind CSS 4.** PostCSS plugin, `@theme inline` mapping to tokens. · P1-1 · **Accepts when** utilities resolve to CSS variables. · _Tests:_ build
- [x] **P1-3 — Design tokens.** Light/dark variables per `design-system.md`. · P1-2 · **Accepts when** all text tokens ≥ 4.5:1. · _Tests:_ axe color-contrast in both themes (E2E)
- [x] **P1-4 — Themes.** Inline bootstrap script, `useTheme`, toggle, `localStorage` persistence, system listener. · P1-3 · **Accepts when** no flash, persisted choice, system default. · _Tests:_ unit (toggle), E2E (persist across reload)
- [x] **P1-5 — Page layout.** Full-width sections, fluid container, skip link, footer. · P1-3 · **Accepts when** no horizontal overflow 320–1920 px. · _Tests:_ E2E overflow at 8 widths
- [x] **P1-6 — Header + dock + mobile menu.** Active section tracking, Motion indicator, Escape/focus handling. · P1-5 · **Accepts when** one nav visible per breakpoint, keyboard operable. · _Tests:_ unit (menu), E2E (dock/menu visibility, navigation)
- [x] **P1-7 — Static export.** `output: "export"`, `trailingSlash`, `images.unoptimized`. · P1-1 · **Accepts when** `out/index.html` and `out/404.html` exist. · _Tests:_ build
- [x] **P1-8 — Lint/format/test tooling.** ESLint flat config, Prettier, Vitest + RTL, Playwright. · P1-1 · **Accepts when** each command runs green. · _Tests:_ all scripts

## Phase 2 — Hero

- [x] **P2-1 — Introduction.** Name (h1), roles, supporting text, verified meta (location, years, certifications). · P1-5 · **Accepts when** copy matches brief. · _Tests:_ unit (render), E2E (h1)
- [x] **P2-2 — Actions.** “View My Work” → `#projects`; “Download Resume” → PDF with `download`. · P2-1 · **Accepts when** both work by keyboard. · _Tests:_ E2E (resume 200)
- [x] **P2-3 — Pipeline.** Four stages, SVG/CSS, accessible list semantics and label. · P2-1 · **Accepts when** fits 320 px without wrapping overflow. · _Tests:_ unit (4 stages, label)
- [x] **P2-4 — Pipeline animation.** One sequential pass on first view, replay control, reduced-motion → final state. · P2-3 · **Accepts when** no loop; reduced motion static. · _Tests:_ unit (reduced motion final state)
- [x] **P2-5 — Responsive hero.** Two columns on `lg`, stacked below. · P2-3 · **Accepts when** screenshots at 320/768/1440 look intentional. · _Tests:_ E2E screenshots

## Phase 3 — Projects

- [x] **P3-1 — Verify repositories.** Done in P0-4. · — · **Accepts when** sources recorded. · _Tests:_ n/a
- [x] **P3-2 — Typed data.** `src/data/projects.ts` with `Project` type. · P3-1 · **Accepts when** cards render from data only. · _Tests:_ unit (data integrity: 4 projects, https links, unique ids)
- [x] **P3-3 — Project cards.** Category, status, purpose, highlights, architecture flow, stack, links. · P3-2 · **Accepts when** consistent heights per row; readable at 320 px. · _Tests:_ unit (card render), E2E
- [x] **P3-4 — Links/previews.** GitHub (+ PyPI for estoe). No screenshots (none exist). · P3-2 · **Accepts when** external links use `rel="noopener noreferrer"`. · _Tests:_ E2E link attributes
- [x] **P3-5 — Portfolio as project 4.** Documents real deployment architecture. · P3-2 · **Accepts when** matches Terraform/workflows. · _Tests:_ manual review
- [x] **P3-6 — Responsive + interaction.** 1/2/4-column grid, subtle hover. · P3-3 · **Accepts when** no overflow. · _Tests:_ E2E overflow

## Phase 4 — Professional profile

- [x] **P4-1 — Experience timeline.** Five roles, dates, overlap note, details disclosure. · P1-5 · **Accepts when** dates equal resume. · _Tests:_ unit (ordering, date validity, disclosure)
- [x] **P4-2 — Skills.** Three disciplines, hands-on vs working knowledge. · P1-5 · **Accepts when** every skill has evidence in resume or code. · _Tests:_ unit (render, legend)
- [x] **P4-3 — Certifications.** Three cards, verified Credly links, no badges/dates. · P1-5 · **Accepts when** links verified. · _Tests:_ unit (data), E2E (links)
- [x] **P4-4 — Fact verification.** Cross-check against `requirements.md`. · P4-1..3 · **Accepts when** no unverified claims. · _Tests:_ manual review
- [x] **P4-5 — Readability/responsiveness.** · P4-1..3 · **Accepts when** screenshots reviewed. · _Tests:_ E2E screenshots

## Phase 5 — Contact

- [x] **P5-1 — Form UI.** Name, email, subject, message; contact links. · P1-5 · **Accepts when** labels associated. · _Tests:_ unit
- [x] **P5-2 — Validation.** Required, email format, length limits, focus first error, `aria-invalid`/`aria-describedby`. · P5-1 · **Accepts when** errors announced. · _Tests:_ unit
- [x] **P5-3 — Submission.** Formspree via env, honeypot, min fill time. · P5-2 · **Accepts when** no hard-coded IDs. · _Tests:_ unit (fetch mocked)
- [x] **P5-4 — States.** Loading (disabled), success, error with retry, `mailto:` fallback. · P5-3 · **Accepts when** no false success. · _Tests:_ unit (each state)
- [x] **P5-5 — Keyboard/mobile.** · P5-4 · **Accepts when** full keyboard flow and 320 px layout. · _Tests:_ E2E

## Phase 6 — Quality

- [x] **P6-1 — SEO metadata.** Metadata API, canonical, OG/Twitter, OG image, robots, sitemap, JSON-LD. · P1-7 · **Accepts when** present in `out/`. · _Tests:_ unit (site config), build output check
- [x] **P6-2 — Accessibility.** axe in light and dark, keyboard pass. · all sections · **Accepts when** zero axe violations. · _Tests:_ E2E axe
- [x] **P6-3 — Unit tests.** · all · **Accepts when** green. · _Tests:_ Vitest
- [x] **P6-4 — Playwright tests.** Desktop + mobile projects. · all · **Accepts when** green. · _Tests:_ Playwright
- [x] **P6-5 — Screen widths.** 320/375/390/768/1024/1280/1440/1920. · all · **Accepts when** no overflow, screenshots reviewed. · _Tests:_ E2E
- [x] **P6-6 — Themes.** · P1-4 · **Accepts when** both themes reviewed and axe-clean. · _Tests:_ E2E
- [x] **P6-7 — Layout shift / overflow.** · all · **Accepts when** CLS < 0.1. · _Tests:_ Lighthouse
- [x] **P6-8 — Bundle size.** · all · **Accepts when** first-load JS reviewed and documented. · _Tests:_ build output
- [x] **P6-9 — Lighthouse.** · all · **Accepts when** ≥ 90 ×4 or exception documented. · _Tests:_ Lighthouse CLI

## Phase 7 — AWS and CI/CD

- [x] **P7-1 — Terraform.** S3 (private, encrypted, versioned), OAC, CloudFront, response headers, function, ACM, optional Route 53. · P0-6 · **Accepts when** `fmt` + `validate` pass. · _Tests:_ terraform fmt/validate
- [x] **P7-2 — Least-privilege deploy role.** GitHub OIDC trust scoped to repo + environment. · P7-1 · **Accepts when** policy limited to one bucket and one distribution. · _Tests:_ validate + review
- [x] **P7-3 — Workflows.** `ci.yml`, `deploy.yml`. · P1-8 · **Accepts when** least-privilege `permissions`, caching, concurrency. · _Tests:_ YAML parse + actionlint if available
- [x] **P7-4 — OIDC docs.** · P7-2 · **Accepts when** step-by-step in `docs/deployment.md`. · _Tests:_ review
- [x] **P7-5 — Validation.** · P7-1..3 · **Accepts when** validators green. · _Tests:_ as above
- [x] **P7-6 — Domain variables.** `domain_names`, `acm_certificate_arn`, `route53_zone_id`, `NEXT_PUBLIC_SITE_URL`. · P7-1 · **Accepts when** maba.dev migration documented. · _Tests:_ validate
- [x] **P7-7 — Deployment/rollback docs.** · P7-3 · **Accepts when** `docs/deployment.md` covers deploy, rollback, cleanup, cost. · _Tests:_ review

## Phase 8 — Final validation

- [x] **P8-1** Lint + typecheck · [x] **P8-2** Unit tests · [x] **P8-3** E2E tests · [x] **P8-4** Static export · [x] **P8-5** Local production preview · [x] **P8-6** Content accuracy · [x] **P8-7** External links · [x] **P8-8** Responsive screenshots · [x] **P8-9** Documentation · [x] **P8-10** Final report
