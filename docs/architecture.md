# Architecture

## Application

```text
src/
├── app/            layout.tsx (fonts, metadata, theme bootstrap, JSON-LD), page.tsx (six sections),
│                   projects/page.tsx (collection), projects/[slug]/page.tsx (static detail pages via generateStaticParams),
│                   not-found.tsx, robots.ts, sitemap.ts, opengraph-image.tsx, icon.svg, globals.css
├── components/
│   ├── layout/     Header (sticky glass bar), SectionNav, MobileMenu(+Panel), Footer, Providers, SmoothScroll
│   ├── sections/   Hero, Pipeline, Projects, ProjectDetail, Experience, Skills, Certifications, Contact(+Form)
│   └── ui/         Section(+Frame), OverviewStrip, ActionStrip, Tag, ButtonLink, ExternalLink, ThemeToggle, Logo, RevealObserver
├── data/           projects, experience, skills, certifications, navigation (typed, no JSX)
├── hooks/          useActiveSection, useTheme
├── lib/            site config (env-driven URL), brand (logo path), disciplines, contact, theme
└── types/          shared content types
```

- Every page is pre-rendered at build time (`output: "export"`, `trailingSlash: true`, `images.unoptimized`). Client components are limited to interactive islands: header/navigation, mobile menu, contact form, reveal observer. Project pages are server-rendered at build time.
- Content is plain typed data; components never hard-code project, role or credential text.
- `src/lib/site.ts` reads `NEXT_PUBLIC_SITE_URL` (default `https://alibacelonia.dev`), the single source for canonical URLs, sitemap, robots, Open Graph and JSON-LD.
- Section links are root-relative (`/#projects`) `next/link`s, so they work from project pages too; the header marks “Projects” active on `/projects/` and its detail pages. The homepage's “View all projects” action opens the collection, which shares the same project cards and data.
- The reveal observer reconnects on pathname changes so sections and cards animate into view after client-side navigation and browser back/forward, as well as on the first load.
- The contact form posts JSON to the site's contact API (`NEXT_PUBLIC_CONTACT_API_URL`, see “Contact API” below) with a Cloudflare Turnstile token. Without the URL it shows an error saying sending isn't available, with the email address; it never opens the email app or claims success.

## Delivery

```text
GitHub repository
  └─ GitHub Actions: ci.yml (lint · typecheck · format · unit · build · e2e · terraform validate)
       └─ deploy.yml (main / manual, environment "production")
            └─ OIDC → IAM role (S3 write to one bucket, invalidate one distribution)
                 └─ S3 bucket (private, SSE-S3, versioned, public access blocked)
                      └─ CloudFront (OAC, HTTPS only, TLS 1.2+, HTTP/2+3, security headers,
                                     index rewrite function, 403/404 → /404.html)
                           └─ ACM certificate (us-east-1) + custom domain (Cloudflare DNS)
                                └─ Visitors
```

Caching: `_next/static/**` is uploaded with `public, max-age=31536000, immutable`; everything else with `public, max-age=0, must-revalidate`. CloudFront uses the managed `CachingOptimized` policy (honours origin `Cache-Control`), and each deploy invalidates `/*`.

Security headers (CloudFront response headers policy): HSTS (2 years, subdomains), `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a CSP allowing only self plus `https://formspree.io` for `connect-src`/`form-action`. `script-src` keeps `'unsafe-inline'` because Next.js static export inlines its RSC payload and the theme bootstrap.

Infrastructure details: `infra/terraform/README.md`. Operations: `docs/deployment.md`.

## Contact API (opt-in)

The `/connect/` form posts to `POST /contact` on an API Gateway HTTP API when `NEXT_PUBLIC_CONTACT_API_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are set. The Lambda (`infra/lambda/contact`) validates the fields, verifies the Turnstile token with Cloudflare, enforces per-IP, duplicate and daily limits in DynamoDB (TTL items) and sends through SES from the verified domain to the owner's inbox with Reply-To set to the visitor. Terraform: `infra/terraform/modules/contact-api`, enabled with `enable_contact_api`. See `docs/deployment.md`.
