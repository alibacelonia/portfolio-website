# CLAUDE.md

MABA portfolio: Next.js 16 static export → private S3 + CloudFront (Terraform, GitHub Actions OIDC).

## Hard rules

- **Static export only** (`output: "export"`). No API routes, Server Actions, middleware, ISR, `next/image` optimization, or request-time APIs.
- **Truthful content.** Edit `src/data/*` only with facts verifiable in the resume or a repository; record sources in `docs/requirements.md`. No invented metrics, screenshots, badges or dates.
- **Design** follows `docs/design-system.md`: solid-color text only (no gradient text), pastel accents only as dots/lines/tints, one navigation per breakpoint (dock `md+`, header menu below).
- Accent colors on text must use `*-fg` tokens. Never use `--muted` on `--surface-2` (contrast).
- Content must be visible without JS: no Motion `initial` hidden states in server HTML. Use `data-reveal` for entrances.
- Anything rendered differently on the client must match the static HTML at hydration (use `useSyncExternalStore` with a server snapshot, e.g. `usePrefersReducedMotion`).
- Keep Motion out of the initial bundle where CSS suffices (D-18). Check gzipped initial JS after adding client code.
- Never deploy, run `terraform apply`, or change DNS without explicit owner approval.

## Commands

`npm run validate` (lint, typecheck, format, unit, build) · `npm run test:e2e` (after build) · `npm run tf:validate`

## Where things are

`src/app` routes and metadata · `src/components/{layout,sections,ui}` · `src/data` content · `src/lib` site config, contact, theme · `tests/` Vitest · `e2e/` Playwright + axe · `infra/terraform` · `scripts/deploy.sh`

## Tracking

Update `docs/development-plan.md` checkboxes and `docs/progress.md` after each completed task; record non-obvious choices in `docs/decisions.md`.
