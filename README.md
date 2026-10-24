# alibacelonia.dev — Personal Engineering Portfolio

Portfolio of **Mohammed Ali B. Abdullah** (logo: A/B): Full-Stack Developer · DevOps Engineer · AI Engineer.

A statically exported Next.js site served from a private S3 bucket through CloudFront, provisioned with Terraform and deployed by GitHub Actions using OIDC.

## Stack

Next.js 16 (App Router, `output: "export"`) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Motion for React · Geist · Vitest + Testing Library · Playwright + axe · Terraform · GitHub Actions

## Local development

```bash
nvm use            # Node 22
npm ci
cp .env.example .env.local   # optional
npm run dev        # http://localhost:3000
```

| Command                                       | Purpose                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run lint` / `typecheck` / `format:check` | Static checks                                                                                |
| `npm test`                                    | Unit and component tests (Vitest)                                                            |
| `npm run build`                               | Static export to `out/`                                                                      |
| `npm run preview`                             | Serve `out/` at http://localhost:4173                                                        |
| `npm run test:e2e`                            | Playwright + axe against `out/` (build first; `npx playwright install chromium` once)        |
| `npm run test:e2e:configured`                 | Builds with placeholder contact/booking variables (as CI does with real ones), then runs E2E |
| `npm run test:e2e:unconfigured`               | Builds with those variables empty (overriding any `.env`), then runs E2E                     |
| `npm run validate`                            | Lint, typecheck, format, unit tests, build                                                   |
| `node scripts/screenshots.mjs <dir>`          | Screenshots at 8 widths × 2 themes, fails on horizontal overflow (needs `preview` running)   |
| `npm run tf:fmt` / `tf:validate`              | Terraform checks                                                                             |

## Configuration

| Variable                         | Default                    | Effect                                                         |
| -------------------------------- | -------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | `https://alibacelonia.dev` | Canonical URL, sitemap, robots, Open Graph, JSON-LD            |
| `NEXT_PUBLIC_CONTACT_API_URL`    | empty                      | Contact API endpoint; empty = form reports sending unavailable |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | empty                      | Cloudflare Turnstile site key (public)                         |
| `NEXT_PUBLIC_CAL_LINK`           | empty                      | Cal.com `user/event` for the Book a call tab                   |
| `NEXT_PUBLIC_DOCK_STYLE`         | `clay`                     | Navigation dock: `clay`, `glass` or `neo` (neumorphism)        |

## Site structure

- `/`: Hero, Projects, Experience, Skills, Certifications, Contact. A sticky clay navigation dock sits at the top (links collapse into a menu below 1024 px).
- `/projects/<id>/`: one statically generated page per project (overview, problem, solution, stack, infrastructure, links).

## Editing content

All content is typed data. Components never need changing to update it.

| File                         | Content                                       |
| ---------------------------- | --------------------------------------------- |
| `src/data/projects.ts`       | Four projects: card summary + detail pages    |
| `src/data/experience.ts`     | Roles and dates                               |
| `src/data/skills.ts`         | Skills by discipline (`hands-on` / `working`) |
| `src/data/certifications.ts` | Certifications and credential URLs            |
| `src/lib/site.ts`            | Name, tagline, links, navigation, resume path |
| `src/lib/brand.ts`           | A/B logo path (header, favicon, OG image)     |
| `public/documents/`          | Resume PDF                                    |

Only add claims that can be verified in the resume or a repository. Sources are listed in [`docs/requirements.md`](docs/requirements.md).

## Documentation

- [Requirements and verified content](docs/requirements.md)
- [Design system](docs/design-system.md)
- [Architecture](docs/architecture.md)
- [Deployment, DNS, rollback, cost](docs/deployment.md)
- [Decisions](docs/decisions.md)
- [Development plan](docs/development-plan.md) and [progress](docs/progress.md)
- [Terraform](infra/terraform/README.md)
