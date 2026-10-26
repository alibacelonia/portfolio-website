# Requirements and verified content

Source briefs: the original portfolio brief and the UI/branding refinement brief (owner, October 2026). This file records **what was verified, from where, and what is still missing**. Content in `src/data/` must stay consistent with it.

## Functional requirements (summary)

| ID    | Requirement                                                                                                                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1  | Single page with six sections in order: Hero, Projects, Experience, Skills, Certifications, Contact.                                                                                                  |
| FR-2  | Sticky glass navigation dock: section links and theme toggle; circular mobile menu opens the glass bottom snackbar. CV stays in the hero.                                                             |
| FR-3  | One navigation system only (the bottom dock was removed).                                                                                                                                             |
| FR-4  | Hero with name, roles, supporting text, two actions, four-stage pipeline (Code → Build → Deploy → Monitor).                                                                                           |
| FR-5b | Each project has a static detail page: overview, problem, solution, stack, infrastructure (implemented vs planned), links.                                                                            |
| FR-5  | Four projects from a typed data module; portfolio itself is the fourth.                                                                                                                               |
| FR-6  | Experience timeline from the resume with accurate dates and overlap explanation.                                                                                                                      |
| FR-7  | Skills grouped by discipline, distinguishing hands-on from working knowledge. No proficiency meters.                                                                                                  |
| FR-8  | Three AWS certification cards with verified credential links.                                                                                                                                         |
| FR-9  | Contact form that sends through the site's own API (API Gateway, Lambda, SES, Turnstile) with validation, honeypot, and loading/success/error states; an honest error when the API is not configured. |
| FR-10 | Light/dark themes: system default, persisted manual choice, no flash.                                                                                                                                 |
| FR-11 | SEO: title, description, canonical, Open Graph, OG image, robots, sitemap, JSON-LD. Domain configurable.                                                                                              |
| NFR-1 | `output: "export"` only. No SSR, API routes, Server Actions, or middleware.                                                                                                                           |
| NFR-2 | Responsive 320 px → 1920 px+, no horizontal overflow.                                                                                                                                                 |
| NFR-3 | WCAG 2.2 AA intent: semantics, keyboard, focus, contrast, reduced motion.                                                                                                                             |
| NFR-4 | Lighthouse ≥ 90 in all four categories (exceptions documented).                                                                                                                                       |
| NFR-5 | Terraform + GitHub Actions (OIDC) deployment to private S3 + CloudFront. No resources provisioned without approval.                                                                                   |

## Verified content

| Content                                                 | Source                                                                                                                                                                                                  | Verified on |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Name, location (Baguio City), email, LinkedIn, 7+ years | public resume                                                                                                                                                                                           | 2026-10-23  |
| All five roles, dates, bullets                          | public resume (`public/documents/mohammed-ali-abdullah-cv.pdf`)                                                                                                                                         | 2026-10-23  |
| Skills                                                  | public resume (`public/documents/mohammed-ali-abdullah-cv.pdf`) technical skills + repository code                                                                                                      | 2026-10-23  |
| `cloud-incident-service`                                | README, `docs/ARCHITECTURE.md`, `pyproject.toml`, `orchestration/model.py` (8 tool calls), CI matrix 3.12–3.14                                                                                          | 2026-10-23  |
| `estoe`                                                 | README, `docs/ARCHITECTURE.md`, `providers.py` (15 s deadline), publish workflow (Trusted Publishing, `id-token: write`), GitHub release v0.2.0, PyPI JSON (v0.2.0, project URLs link back to the repo) | 2026-10-23  |
| `ai-project-factory`                                    | README, `docs/ARCHITECTURE.md`, `pyproject.toml`; `cloud-incident-service` README states it was generated from the factory's `ai-service` profile                                                       | 2026-10-23  |
| SAA-C03 credential                                      | Credly page title: “AWS Certified Solutions Architect – Associate … issued … to Mohammed Ali Abdullah”                                                                                                  | 2026-10-23  |
| CLF-C02 credential                                      | URL embedded in public resume (`public/documents/mohammed-ali-abdullah-cv.pdf`); Credly page title: “AWS Certified Cloud Practitioner … issued … to Mohammed Ali Abdullah”                              | 2026-10-23  |
| AIF-C01 credential                                      | Credly page title: “AWS Certified AI Practitioner … issued … to Mohammed Ali Abdullah”                                                                                                                  | 2026-10-23  |
| Domain state                                            | `alibacelonia.dev`: Cloudflare nameservers, currently proxying an existing Vercel site. `maba.dev`: Namecheap nameservers, not serving.                                                                 | 2026-10-23  |

Notes:

- The `estoe` README still says v0.2.0 is “not yet published”; PyPI shows v0.2.0 published with links back to the repository, so the site states it is published.
- Credly pages do not expose exam codes; the codes (SAA-C03, CLF-C02, AIF-C01) come from the brief/resume.
- No certification dates are shown (not verified).

## Missing or owner-supplied data

| Item                             | Status                                                                                                                                                                                                                                                                                                                                      | Where to change                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Portfolio repository             | `github.com/alibacelonia/portfolio-website` holds this code (pushed 2026-10-24). Its GitHub description still says “Python Lambda”; the contact Lambda is Node.js 22, so update the description. Screenshot `public/projects/website-portfolio.webp`: owner-supplied capture of this site's hero (2026-10-24), resized to 1600 × 1120 WebP. | `src/data/projects.ts`                                  |
| Contact API URL / Turnstile key  | Set later by the owner. Without the URL the form reports that sending isn't available.                                                                                                                                                                                                                                                      | `NEXT_PUBLIC_CONTACT_API_URL`                           |
| Project screenshots / live demos | None exist (all three are CLI/API projects). None shown.                                                                                                                                                                                                                                                                                    | `src/data/projects.ts`                                  |
| Certification badge images       | Official Credly badge images for the three credentials (downloaded 2026-10-24), resized to 320 px WebP, artwork unaltered. Earners may display their own badges; a standalone AWS logo is not used (trademark).                                                                                                                             | `public/certifications/` + `src/data/certifications.ts` |
| Resume PDF                       | Public portfolio resume (2026-10-23): no street address or phone number; same roles, dates and Credly links as the original. Served from `public/documents/`.                                                                                                                                                                               |
| IronFort (client work)           | Card in `src/data/clientWork.ts` (`published: true`). Contributions limited to the resume; product facts from goironfort.com (2026-10-24). Screenshot `public/projects/ironfort.webp`: homepage image supplied by the owner (2026-10-24), 5 × 3.5 in (10:7), resized to 1600 × 1120 WebP.                                                   | `src/data/clientWork.ts`                                |

### Lightweight portfolio interactions (2026-10-26)

Owner-approved refinements: a short hero introduction and static accent frame, monochrome skill icons with documented project references, and discipline filters on the project index. Keep original photos, screenshots and factual experience data. References must come from documented stacks/published work and preserve working-knowledge labels. Filters must include published client work in counts, retain keyboard/touch access and leave all content visible without JavaScript. No new runtime dependency; compare loading/bundle size and check both themes and reduced motion.
