# Requirements and verified content

Source briefs: the original portfolio brief and the UI/branding refinement brief (owner, October 2026). This file records **what was verified, from where, and what is still missing**. Content in `src/data/` must stay consistent with it.

## Functional requirements (summary)

| ID    | Requirement                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1  | Single page with six sections in order: Hero, Projects, Experience, Skills, Certifications, Contact.                                                |
| FR-2  | Sticky glass navigation bar: A/B logo, section links, theme toggle, resume; mobile menu below `lg`.                                                 |
| FR-3  | One navigation system only (the bottom dock was removed).                                                                                           |
| FR-4  | Hero with name, roles, supporting text, two actions, four-stage pipeline (Code → Build → Deploy → Monitor).                                         |
| FR-5b | Each project has a static detail page: overview, problem, solution, stack, infrastructure (implemented vs planned), links.                          |
| FR-5  | Four projects from a typed data module; portfolio itself is the fourth.                                                                             |
| FR-6  | Experience timeline from the resume with accurate dates and overlap explanation.                                                                    |
| FR-7  | Skills grouped by discipline, distinguishing hands-on from working knowledge. No proficiency meters.                                                |
| FR-8  | Three AWS certification cards with verified credential links.                                                                                       |
| FR-9  | Contact form (Formspree, configurable) with validation, honeypot, loading/success/error states, and an honest `mailto:` fallback when unconfigured. |
| FR-10 | Light/dark themes: system default, persisted manual choice, no flash.                                                                               |
| FR-11 | SEO: title, description, canonical, Open Graph, OG image, robots, sitemap, JSON-LD. Domain configurable.                                            |
| NFR-1 | `output: "export"` only. No SSR, API routes, Server Actions, or middleware.                                                                         |
| NFR-2 | Responsive 320 px → 1920 px+, no horizontal overflow.                                                                                               |
| NFR-3 | WCAG 2.2 AA intent: semantics, keyboard, focus, contrast, reduced motion.                                                                           |
| NFR-4 | Lighthouse ≥ 90 in all four categories (exceptions documented).                                                                                     |
| NFR-5 | Terraform + GitHub Actions (OIDC) deployment to private S3 + CloudFront. No resources provisioned without approval.                                 |

## Verified content

| Content                                                 | Source                                                                                                                                                                                                  | Verified on |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Name, location (Baguio City), email, LinkedIn, 7+ years | public resume                                                                                                                                                                                           | 2026-10-23  |
| All five roles, dates, bullets                          | public resume (`public/documents/mohammed-ali-abdullah-resume.pdf`)                                                                                                                                     | 2026-10-23  |
| Skills                                                  | public resume (`public/documents/mohammed-ali-abdullah-resume.pdf`) technical skills + repository code                                                                                                  | 2026-10-23  |
| `cloud-incident-service`                                | README, `docs/ARCHITECTURE.md`, `pyproject.toml`, `orchestration/model.py` (8 tool calls), CI matrix 3.12–3.14                                                                                          | 2026-10-23  |
| `estoe`                                                 | README, `docs/ARCHITECTURE.md`, `providers.py` (15 s deadline), publish workflow (Trusted Publishing, `id-token: write`), GitHub release v0.2.0, PyPI JSON (v0.2.0, project URLs link back to the repo) | 2026-10-23  |
| `ai-project-factory`                                    | README, `docs/ARCHITECTURE.md`, `pyproject.toml`; `cloud-incident-service` README states it was generated from the factory's `ai-service` profile                                                       | 2026-10-23  |
| SAA-C03 credential                                      | Credly page title: “AWS Certified Solutions Architect – Associate … issued … to Mohammed Ali Abdullah”                                                                                                  | 2026-10-23  |
| CLF-C02 credential                                      | URL embedded in public resume (`public/documents/mohammed-ali-abdullah-resume.pdf`); Credly page title: “AWS Certified Cloud Practitioner … issued … to Mohammed Ali Abdullah”                          | 2026-10-23  |
| AIF-C01 credential                                      | Credly page title: “AWS Certified AI Practitioner … issued … to Mohammed Ali Abdullah”                                                                                                                  | 2026-10-23  |
| Domain state                                            | `alibacelonia.dev`: Cloudflare nameservers, currently proxying an existing Vercel site. `maba.dev`: Namecheap nameservers, not serving.                                                                 | 2026-10-23  |

Notes:

- The `estoe` README still says v0.2.0 is “not yet published”; PyPI shows v0.2.0 published with links back to the repository, so the site states it is published.
- Credly pages do not expose exam codes; the codes (SAA-C03, CLF-C02, AIF-C01) come from the brief/resume.
- No certification dates are shown (not verified).

## Missing or owner-supplied data

| Item                             | Status                                                                                                                                                                                                          | Where to change                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Portfolio repository             | `github.com/alibacelonia/portfolio-website` exists but is **empty**, and its description refers to an older API Gateway/Lambda/SES design. Push this code there (or change the URL) and update the description. | `src/data/projects.ts`                                  |
| Formspree form ID                | Not provided. Without it the form opens the visitor's email client.                                                                                                                                             | `NEXT_PUBLIC_FORMSPREE_FORM_ID`                         |
| Project screenshots / live demos | None exist (all three are CLI/API projects). None shown.                                                                                                                                                        | `src/data/projects.ts`                                  |
| Certification badge images       | Official Credly badge images for the three credentials (downloaded 2026-10-24), resized to 320 px WebP, artwork unaltered. Earners may display their own badges; a standalone AWS logo is not used (trademark). | `public/certifications/` + `src/data/certifications.ts` |
| Resume PDF                       | Public portfolio resume (2026-10-23): no street address or phone number; same roles, dates and Credly links as the original. Served from `public/documents/`.                                                   |
