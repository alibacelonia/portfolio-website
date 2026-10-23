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
│   └── ui/         Section(+Frame), Tag, ButtonLink, ExternalLink, ThemeToggle, Logo, RevealObserver
├── data/           projects, experience, skills, certifications, navigation (typed, no JSX)
├── hooks/          useActiveSection, useTheme
├── lib/            site config (env-driven URL), brand (logo path), disciplines, contact, theme
└── types/          shared content types
```

- Every page is pre-rendered at build time (`output: "export"`, `trailingSlash: true`, `images.unoptimized`). Client components are limited to interactive islands: header/navigation, mobile menu, theme toggle, pipeline, contact form, reveal observer. Project pages are server-rendered at build time.
- Content is plain typed data; components never hard-code project, role or credential text.
- `src/lib/site.ts` reads `NEXT_PUBLIC_SITE_URL` (default `https://alibacelonia.dev`), the single source for canonical URLs, sitemap, robots, Open Graph and JSON-LD.
- Section links are root-relative (`/#projects`) `next/link`s, so they work from project pages too; the header marks “Projects” active on `/projects/` and its detail pages. The homepage's “View all projects” action opens the collection, which shares the same project cards and data.
- The reveal observer reconnects on pathname changes so sections and cards animate into view after client-side navigation and browser back/forward, as well as on the first load.
- The contact form posts JSON to `https://formspree.io/f/<NEXT_PUBLIC_FORMSPREE_FORM_ID>`. The ID is public by design (it appears in any HTML form). Without it, the form opens a pre-filled `mailto:` link and says so.

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
