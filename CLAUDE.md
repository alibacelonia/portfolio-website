# CLAUDE.md

alibacelonia.dev portfolio (A/B logo): Next.js 16 static export → private S3 + CloudFront (Terraform, GitHub Actions OIDC).

## Hard rules

- **Static export only** (`output: "export"`). No API routes, Server Actions, middleware, ISR, `next/image` optimization, or request-time APIs.
- **Truthful content.** Edit `src/data/*` only with facts verifiable in the resume or a repository; record sources in `docs/requirements.md`. No invented metrics, screenshots, badges or dates.
- **Design** follows `docs/design-system.md`: solid-color text only (no gradient text; the one exception is the italic last word of section titles, which is aurora text: `AuroraText`, owner request), pastel accents only as dots/lines/tints, one navigation system: sticky glass dock at the top, links inline from `sm`, menu below.
- **Uniform sections:** use the shared `type-*` utilities and `card` from `globals.css` (table in `docs/design-system.md`) instead of ad-hoc `text-[…]` sizes, padding or card classes. All sections share `bg-bg`; cards sit on `--surface`.
- **Section titles:** sections use `Section` with `label` and `title` (“Case Studies” over “Curated _work_”, last word italic aurora text), **no numbers** and **no description** (`lead`). The table is in `docs/design-system.md`.
- **Typography:** two families only, Geist Sans (text, labels, dates, data) and Instrument Serif (display); no monospace. Font sizes in `rem` (no `px`), so text follows zoom and the browser's font-size setting.
- **Themes and surfaces:** light and dark (saved choice, else the device setting; toggle in the dock). Every color comes from theme tokens; check both themes. Use the reusable glass utilities (`glass`, `glass-control`, `glass-field`, `glass-chip`, `glass-selectable`); `card`, `card-shell` and `section-panel` compose them. Include readable opaque fallbacks for missing blur, reduced transparency and forced colors.
- **Section markup:** section titles (`Section`) and a section's items (e.g. the case-study list and its detail headers) are `div`s, not `header` or `ol`/`li` (owner preference, as on the reference); only the site's top bar is a `<header>`. Exceptions: the Experience timeline keeps its `ol`, and step sequences (architecture lanes, flow diagrams) stay ordered lists.
- Accent colors on text must use `*-fg` tokens. Never use `--muted` on `--surface-2` (contrast).
- Content must be visible without JS: no Motion `initial` hidden states in server HTML. Use `data-reveal` for entrances.
- Anything rendered differently on the client must match the static HTML at hydration (use `useSyncExternalStore` with a server snapshot, e.g. `usePrefersReducedMotion`).
- Keep Motion out of the initial bundle where CSS suffices (D-18). Check gzipped initial JS after adding client code.
- `NEXT_PUBLIC_SITE_URL` (`src/lib/site.ts`) is the only source of the canonical domain. Never hard-code the domain elsewhere.
- Project content follows the `Project` type; mark unimplemented infrastructure `status: "planned"`.
- **Case cards and their screenshot frame.** A card with a screenshot uses its own `stageGradient` as a translucent, theme-aware glass tint; a card without one uses the neutral grey `NEUTRAL_STAGE` (`stageGradientFor()` in `src/lib/stage.ts`). The screenshot (`.case-shot`) has a 2 px border, always that gradient's **second-lightest** stop, with the **bottom edge shown only on hover** (transparent at rest) (`stageFrame()`); never set it separately (not white, even if a reference class says so). Its rest offset and desktop hover tilt come from the owner's reference class (see design system). The hover overlay darkens only the card's background, never the screenshot. Unit and E2E tests check all of this.
- **Project screenshots are 5 × 3.5 in (10:7)**: export the owner's image to `public/projects/<id>.webp` at 1600 × 1120 and declare that size. Never crop, re-capture or swap a supplied image; `tests/data.test.ts` checks the ratio and the file. Work on top of the latest branch so images from unmerged branches are not lost.
- Never deploy, run `terraform apply`, or change DNS without explicit owner approval.
- **E2E must pass with the contact/booking variables set and unset.** CI builds with the real repository variables (`CAL_LINK`, `TURNSTILE_SITE_KEY`, `CONTACT_API_URL`), which add a booking tab and third-party embeds. Import `test` from `e2e/fixtures.ts` (it stubs Cal.com and Turnstile; call `stubThirdParty` on contexts you create), use `openMessageTab` before touching the form, and run both `npm run test:e2e:configured` and `npm run test:e2e:unconfigured` before pushing (a local `.env` makes a plain build the configured case).

## Commands

`npm run validate` (lint, typecheck, format, unit, build) · `npm run test:e2e` (after build) · `npm run test:e2e:configured` / `test:e2e:unconfigured` (build with placeholder / empty contact and booking variables, then E2E) · `npm run tf:validate`

## Where things are

`src/app` routes and metadata · `src/components/{layout,sections,ui}` · `src/data` content · `src/lib` site config, contact, theme · `tests/` Vitest · `e2e/` Playwright + axe · `infra/terraform` · `scripts/deploy.sh`

## Tracking

Update `docs/development-plan.md` checkboxes and `docs/progress.md` after each completed task; record non-obvious choices in `docs/decisions.md`.
