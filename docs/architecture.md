# Architecture

## Application

```text
src/
├── app/            layout.tsx (fonts, metadata, theme bootstrap, JSON-LD), page.tsx (six sections),
│                   not-found.tsx, robots.ts, sitemap.ts, opengraph-image.tsx, icon.svg, globals.css
├── components/
│   ├── layout/     Header, Dock, MobileMenu, SkipLink, Footer, Providers (MotionConfig)
│   ├── sections/   Hero, Pipeline, Projects, Experience, Skills, Certifications, Contact(+Form)
│   └── ui/         Section, SectionHeader, Tag, ButtonLink, ExternalLink, ThemeToggle, Reveal
├── data/           projects, experience, skills, certifications, navigation (typed, no JSX)
├── hooks/          useActiveSection, useTheme
├── lib/            site config (env-driven URLs), contact (validation + submission), theme
└── types/          shared content types
```

- Every page is pre-rendered at build time (`output: "export"`, `trailingSlash: true`, `images.unoptimized`). Client components are limited to interactive islands: header/menu, dock, theme toggle, pipeline, contact form, reveal observer.
- Content is plain typed data; components never hard-code project, role or credential text.
- `src/lib/site.ts` reads `NEXT_PUBLIC_SITE_URL` (default `https://alibacelonia.dev`). Migrating to `maba.dev` = change that variable, add the domain to Terraform `domain_names`, redeploy.
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
