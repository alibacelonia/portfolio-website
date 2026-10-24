import type { Project } from "@/types/content";

// Every claim below is taken from the repository's README, docs, source, or CI configuration
// (see `source`). Do not add features, metrics, deployments or screenshots that do not exist.
// docs/requirements.md lists what was verified and when.
export const projects: Project[] = [
  {
    id: "cloud-incident-service",
    name: "cloud-incident-service",
    category: "AI Engineering · Cloud Operations",
    kind: "AI service",
    tagline: "An AI agent that investigates AWS incidents and cites the evidence for every claim",
    highlights: [
      "Bounded agent: 8 tool calls, 6 turns, 60 seconds",
      "Every statement cites evidence a tool returned",
      "Remediation always requires human approval",
      "Offline evaluation across ten scenarios",
    ],
    discipline: "ai",
    status: "MVP · synthetic data",
    summary:
      "An AI-assisted service that investigates AWS incidents with a bounded, read-only agent and returns evidence-cited reports that keep facts, hypotheses and uncertainty separate.",
    keyTech: ["Python", "FastAPI", "Pydantic", "Amazon Bedrock", "Anthropic API"],
    repository: {
      label: "GitHub",
      href: "https://github.com/alibacelonia/cloud-incident-service",
    },
    docs: {
      label: "Architecture",
      href: "https://github.com/alibacelonia/cloud-incident-service/blob/main/docs/ARCHITECTURE.md",
    },
    links: [],
    overview: [
      "Given a short incident report (service, environment, symptoms and a time window of up to 24 hours), the service collects evidence from read-only tools, correlates it by time and service, and returns a schema-validated report.",
      "The report separates confirmed facts, hypotheses with confidence levels, uncertainties, next diagnostic steps and remediation proposals, and every statement cites the evidence behind it. The service never changes cloud resources. It is a portfolio MVP that runs locally against synthetic data and makes no claims about production scale.",
    ],
    problem:
      "Incident responders gather evidence by hand from metrics, alarms, logs, deployment records, infrastructure changes and runbooks, then correlate it mentally under time pressure. An AI assistant can reduce that overhead, but only if every claim stays traceable to real evidence and every change stays under human control.",
    audience:
      "AWS-focused DevOps, cloud operations and site reliability engineers investigating a degraded service or failed deployment, and reviewers who need to audit how an agent reached its conclusions.",
    solution: [
      "Four read-only tools: CloudWatch signals, deployment history, infrastructure changes (with a 60-minute look-back) and runbook search.",
      "Two orchestrators behind one protocol: deterministic correlation rules by default, or a model-driven loop capped at 8 tool calls, 6 turns and 60 seconds.",
      "Evidence comes from the service, never from the model: the model cites source IDs, anything no tool returned is rejected, and hypotheses are checked against the correlation rules.",
      "Every remediation proposal requires human approval; stale, malformed or unavailable sources are reported as uncertainty or as a partial report.",
      "An offline evaluation of ten scenarios scores schema, citations, hypothesis, sources and safety. Investigation traces are redacted for access keys, account IDs and email addresses.",
    ],
    stack: [
      { group: "Backend", items: ["Python 3.12+", "FastAPI", "Pydantic", "Uvicorn"] },
      {
        group: "AI / LLM",
        items: [
          "Amazon Bedrock (Converse API, tool use)",
          "Anthropic Messages API",
          "Offline rule-based mock",
        ],
      },
      { group: "Cloud services", items: ["Amazon CloudWatch Logs (opt-in)", "boto3"] },
      { group: "Testing & quality", items: ["pytest", "Ruff", "uv"] },
      { group: "DevOps", items: ["GitHub Actions", "Dependabot", "pip-audit"] },
    ],
    infrastructure: {
      summary:
        "A local-first service. There is no hosted deployment, container image or infrastructure as code; AWS is reached only through opt-in, read-only adapters.",
      items: [
        {
          label: "Runtime",
          detail:
            "Runs locally with Uvicorn on 127.0.0.1, with optional API-key authentication and a 32 KiB request-body limit.",
        },
        {
          label: "CI",
          detail:
            "GitHub Actions on Python 3.12, 3.13 and 3.14: formatting, linting, tests and both offline evaluations.",
        },
        {
          label: "Supply chain",
          detail:
            "pip-audit dependency audit on pushes, pull requests and weekly; Dependabot updates for uv and GitHub Actions.",
        },
        {
          label: "AWS access",
          detail:
            "Least-privilege IAM policy examples for Bedrock invocation and CloudWatch Logs reads. Live tests are opt-in.",
        },
        {
          label: "Observability",
          detail:
            "Per-investigation JSON traces of tool calls, model turns and validation outcomes, with secret redaction.",
        },
      ],
      diagram: ["incident request", "bounded agent", "read-only tools", "validated report"],
    },
    source:
      "README.md, docs/PROJECT.md, docs/ARCHITECTURE.md, orchestration/model.py, .github/workflows, .github/dependabot.yml, docs/iam",
  },
  {
    id: "estoe",
    name: "estoe",
    category: "DevOps Tooling · CLI",
    kind: "CLI",
    tagline: "One cloud secret in, one local .env file out, without copying values by hand",
    highlights: [
      "AWS, Azure and Google Cloud secret managers",
      "Refuses tracked or unsafe destinations before fetching",
      "Private, atomic writes with explicit overwrite",
      "Published to PyPI with Trusted Publishing",
    ],
    discipline: "devops",
    status: "v0.2.0 · PyPI",
    summary:
      "A command-line tool that turns one cloud secret into a local .env file, so developers stop copying secret values by hand.",
    keyTech: ["Python", "AWS Secrets Manager", "Azure Key Vault", "Google Secret Manager"],
    repository: { label: "GitHub", href: "https://github.com/alibacelonia/estoe" },
    docs: {
      label: "Architecture",
      href: "https://github.com/alibacelonia/estoe/blob/main/docs/ARCHITECTURE.md",
    },
    links: [{ label: "PyPI", href: "https://pypi.org/project/estoe/" }],
    overview: [
      "estoe (Secret to Env) reads one explicitly selected secret from AWS Secrets Manager, Azure Key Vault or Google Secret Manager, checks that it is a flat JSON object of strings, and writes it as a dotenv file.",
      "It uses the developer's existing cloud login, can preview key names without values, and refuses unsafe destinations. It only reads: it never creates secrets, logs in, or discovers other secrets.",
    ],
    problem:
      "Setting up a local environment often means copying values from a cloud console into a .env file by hand. That is slow and error-prone, and it leaks secrets into clipboards, shell history, screenshots and, too often, Git.",
    audience:
      "Developers on macOS or Linux who keep application configuration in a cloud secret manager and need the same values locally.",
    solution: [
      "One command per provider using existing credentials: an AWS profile and region, an Azure CLI session, or Google Application Default Credentials.",
      "Preflight before any cloud call: tracked or unignored Git destinations, symlinks, special files and unsafe directories are rejected.",
      "Strict validation: duplicate keys, nested values, non-strings and invalid variable names fail before anything is written.",
      "Private (0600), atomic writes with separate create-only and explicit-overwrite paths; preview mode shows key names only.",
      "SDK calls run in an isolated worker with a 15-second deadline, and errors use fixed codes so values never reach logs or diagnostics.",
    ],
    stack: [
      { group: "Application", items: ["Python 3.12+", "argparse", "Hatchling"] },
      {
        group: "Cloud SDKs",
        items: [
          "boto3 (AWS Secrets Manager)",
          "Azure Identity + Key Vault Secrets",
          "Google Cloud Secret Manager",
        ],
      },
      { group: "Testing & quality", items: ["pytest", "Ruff", "uv"] },
      { group: "CI/CD & release", items: ["GitHub Actions", "PyPI Trusted Publishing"] },
    ],
    infrastructure: {
      summary:
        "A locally installed CLI, so there is no hosted infrastructure. The engineering is in the release pipeline, repository controls and least-privilege cloud permissions.",
      items: [
        {
          label: "Distribution",
          detail:
            "Published on PyPI (v0.2.0) and GitHub Releases; installs with uv tool install estoe.",
        },
        {
          label: "Release pipeline",
          detail:
            "GitHub Actions builds and validates the wheel and source distribution, then publishes approved releases through PyPI Trusted Publishing (OIDC), with no stored token.",
        },
        {
          label: "CI",
          detail:
            "Formatting, linting and tests on Python 3.12–3.14, with network access denied in tests, plus a dependency audit.",
        },
        {
          label: "Repository controls",
          detail:
            "Protected main branch: pull requests, passing CI and resolved conversations required; force pushes and deletion blocked.",
        },
        {
          label: "Cloud permissions",
          detail:
            "Least-privilege examples: secretsmanager:GetSecretValue on one secret, kms:Decrypt for customer-managed keys, and equivalent Azure and Google roles.",
        },
      ],
      diagram: ["CLI", "preflight", "provider worker", "validate + encode", "atomic write"],
    },
    source:
      "README.md, docs/PROJECT.md, docs/ARCHITECTURE.md, src/estoe/providers.py, .github/workflows/publish-pypi.yml, docs/iam, PyPI JSON API",
  },
  {
    id: "ai-project-factory",
    name: "ai-project-factory",
    category: "Developer Tooling · AI-assisted Development",
    kind: "Generator",
    tagline: "Small, runnable projects with tests, CI and AI-agent instructions already aligned",
    highlights: [
      "Python CLI, web SaaS and AI service starters",
      "Validated configuration; never overwrites a path",
      "22 UI presets with light and dark tokens",
      "cloud-incident-service was generated from it",
    ],
    discipline: "ai",
    status: "Open source · MIT",
    summary:
      "A project generator that creates small, runnable Python and web starters with requirements, tests, CI and AI-agent instructions already aligned.",
    keyTech: ["Python", "Copier", "Typer", "Pydantic", "GitHub Actions"],
    repository: {
      label: "GitHub",
      href: "https://github.com/alibacelonia/ai-project-factory",
    },
    docs: {
      label: "Architecture",
      href: "https://github.com/alibacelonia/ai-project-factory/blob/main/docs/ARCHITECTURE.md",
    },
    links: [],
    overview: [
      "AI Project Factory is a local, Copier-based generator with three starter profiles: a Python CLI, a web SaaS (Next.js, FastAPI and PostgreSQL) and an AI service (FastAPI with a deterministic mock provider).",
      "Each generated project runs on its own and ships with requirements and architecture documents, tests, CI, and repository instructions, skills and review agents for AI-assisted development. Generation itself makes no AI API calls and needs no paid service.",
    ],
    problem:
      "Starting a project is easy; keeping its requirements, architecture, tests, AI-assistant instructions and CI aligned is harder. Ad hoc starters drift, and AI coding agents work poorly without clear, consistent project context.",
    audience:
      "Developers who frequently start small services or tools and want a consistent, tested baseline for requirements-driven, AI-assisted work.",
    solution: [
      "A Pydantic-validated project schema with compatibility rules, so unsupported or conflicting feature selections are rejected before generation.",
      "Optional capabilities, such as OpenAI or Amazon Bedrock adapters, are added only when selected, as tested code or explicit extension seams.",
      "Staged generation in a temporary sibling directory, moved into place only after Copier succeeds; existing directories are never overwritten.",
      "A data-driven catalog of 22 UI presets with light and dark semantic tokens and accessibility fallbacks, plus a dependency-free gallery.",
      "cloud-incident-service was generated from its ai-service profile.",
    ],
    stack: [
      {
        group: "Application",
        items: ["Python 3.12+", "Typer", "Rich", "Pydantic", "Copier", "Jinja"],
      },
      {
        group: "Generated starters",
        items: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Docker Compose"],
      },
      { group: "AI / LLM", items: ["OpenAI and Amazon Bedrock adapters (optional)"] },
      { group: "Testing & quality", items: ["pytest", "Ruff", "uv", "Secret scanning"] },
      { group: "DevOps", items: ["GitHub Actions"] },
    ],
    infrastructure: {
      summary:
        "A locally run generator with no hosted infrastructure. Its CI verifies both the factory and representative generated output.",
      items: [
        {
          label: "Distribution",
          detail:
            "Installed with uv tool install; templates are packaged into the wheel. Tagged release v0.1.0 on GitHub.",
        },
        {
          label: "CI",
          detail:
            "GitHub Actions runs formatting, linting, tests and a secret scan, then generates a SaaS project and type-checks, tests and builds its frontend.",
        },
        {
          label: "Containers",
          detail:
            "Generated web SaaS projects include a Docker Compose setup, which CI validates with docker compose config.",
        },
        {
          label: "Security",
          detail:
            "CI runs without secrets, cloud credentials, live models or production databases.",
        },
      ],
      diagram: ["CLI", "validate", "select template", "Copier render", "staged move"],
    },
    source:
      "README.md, docs/ARCHITECTURE.md, docs/DEMO.md, docs/ROADMAP.md, pyproject.toml, .github/workflows/ci.yml, GitHub releases",
  },
  {
    id: "website-portfolio",
    name: "Website Portfolio",
    category: "Personal Website / Full-Stack & DevOps Portfolio",
    kind: "Website",
    tagline:
      "This site: a static Next.js portfolio served from a private S3 bucket through CloudFront",
    highlights: [
      "Static export with no server runtime",
      "Terraform and GitHub OIDC, with no stored AWS keys",
      "Deploys gated on tests and accessibility checks",
      "CSS-first motion that respects reduced motion",
    ],
    discipline: "devops",
    status: "This site",
    summary:
      "This website: a statically exported Next.js site on Amazon S3 and CloudFront, with a serverless contact API (API Gateway, Lambda, DynamoDB and SES), infrastructure defined in Terraform and deployments through GitHub Actions.",
    keyTech: ["Next.js", "TypeScript", "Terraform", "CloudFront", "Lambda", "GitHub Actions"],
    // Screenshot of this site's hero, supplied by the owner (4688×3281 PNG, resized), 2026-10-24.
    screenshot: {
      src: "/projects/website-portfolio.webp",
      alt: "This site's home page: portrait beside the name Mohammed Ali B. Abdullah, roles and introduction, under the navigation dock",
      width: 1600,
      height: 1120,
    },
    // The repository must contain this code before the site is deployed (docs/requirements.md).
    repository: {
      label: "GitHub",
      href: "https://github.com/alibacelonia/portfolio-website",
    },
    docs: {
      label: "Architecture",
      href: "https://github.com/alibacelonia/portfolio-website/blob/main/docs/architecture.md",
    },
    links: [],
    overview: [
      "A portfolio with a home page of framed sections, detailed project pages, an experience timeline, grouped skills, verifiable certifications, and a Connect page to book a call or send a message.",
      "The site is exported as static files at build time, with no server runtime, and served from object storage behind a CDN. The only dynamic part, the contact form, posts to a small serverless API.",
    ],
    problem:
      "To create a professional online presence that showcases my full-stack engineering, DevOps, cloud infrastructure and AI engineering experience, with every claim verifiable against my resume and public repositories.",
    audience: "Recruiters, hiring managers and engineers evaluating my work.",
    solution: [
      "Content lives in typed data modules, separate from components, and each claim is traceable to the resume or a repository.",
      "Accessible by design: semantic structure, keyboard navigation, visible focus, reduced-motion support and automated axe checks in both themes.",
      "A small performance budget: static HTML, CSS-first animation, and Motion for React only where it is needed.",
      "A contact form that sends through the site's own API (API Gateway, Lambda and SES, with Cloudflare Turnstile and rate limits), with clear sending, success and error states.",
      "Deployments gated on linting, type checks, unit tests, end-to-end and accessibility tests, and Terraform validation.",
    ],
    stack: [
      {
        group: "Frontend",
        items: [
          "Next.js (static export)",
          "React",
          "TypeScript",
          "Tailwind CSS",
          "Motion for React",
          "Lenis",
        ],
      },
      {
        group: "Testing & quality",
        items: ["Vitest", "Testing Library", "Playwright", "axe-core", "ESLint", "Prettier"],
      },
      { group: "DevOps", items: ["GitHub Actions", "Terraform"] },
      {
        group: "Cloud services",
        items: [
          "Amazon S3",
          "Amazon CloudFront",
          "CloudFront Functions",
          "AWS Certificate Manager",
          "AWS IAM (OIDC)",
          "Amazon API Gateway",
          "AWS Lambda",
          "Amazon DynamoDB",
          "Amazon SES",
          "AWS Systems Manager Parameter Store",
          "Amazon CloudWatch Logs",
        ],
      },
      {
        group: "Integrations",
        items: ["Cloudflare DNS", "Cloudflare Turnstile", "Cal.com (booking)"],
      },
    ],
    infrastructure: {
      summary:
        "Live at alibacelonia.dev. The hosting, the contact API and the deploy role are defined in Terraform, validated in CI and running in AWS; DNS is on Cloudflare.",
      items: [
        {
          label: "Hosting",
          detail:
            "Private S3 bucket (public access blocked, encrypted, versioned) readable only by CloudFront through Origin Access Control.",
        },
        {
          label: "CDN & TLS",
          detail:
            "CloudFront with HTTPS redirect, HTTP/2 and HTTP/3, security headers (CSP, HSTS) and an ACM certificate in us-east-1. A CloudFront Function serves directory indexes and redirects www to the apex domain.",
        },
        {
          label: "Contact API",
          detail:
            "API Gateway HTTP API (throttled) in front of a Node.js 22 Lambda on arm64. It verifies Cloudflare Turnstile, enforces per-IP, duplicate and daily limits in DynamoDB (expiring with TTL), and sends through SES from the verified domain. The Turnstile secret lives in SSM Parameter Store.",
        },
        {
          label: "Infrastructure as code",
          detail:
            "Terraform for S3, CloudFront, ACM, the viewer-request function, the GitHub deploy role and the contact API module, validated in CI.",
        },
        {
          label: "CI/CD",
          detail:
            "GitHub Actions runs CI on pull requests. Pushes to main rerun CI, publish the build with year-long caching for hashed assets, and invalidate CloudFront.",
        },
        {
          label: "Security",
          detail:
            "GitHub OIDC federation into a role limited to one bucket and one distribution, so there are no long-lived AWS keys. The contact Lambda's role is limited to its log group, its table, one parameter and sending from the site's domain.",
        },
        {
          label: "Domain & DNS",
          detail:
            "alibacelonia.dev on Cloudflare DNS (DNS only, not proxied), pointed at CloudFront; www redirects to the apex.",
        },
      ],
      graph: [
        {
          label: "Deploy",
          summary: "how a push to main reaches production",
          accent: "sage",
          nodes: [
            { name: "GitHub", note: "push to main" },
            { name: "GitHub Actions", note: "lint, types, tests, axe, build" },
            { name: "AWS IAM", note: "OIDC role, no stored keys" },
            { name: "Amazon S3", note: "sync with cache headers" },
            { name: "CloudFront", note: "cache invalidation" },
          ],
        },
        {
          label: "Serve",
          summary: "how a visitor's request is answered",
          accent: "blue",
          nodes: [
            { name: "Visitor", note: "alibacelonia.dev" },
            { name: "Cloudflare DNS", note: "DNS only" },
            { name: "CloudFront", note: "ACM TLS, HTTP/3, security headers" },
            { name: "CloudFront Function", note: "index rewrite, www to apex" },
            { name: "Amazon S3", note: "private, Origin Access Control" },
          ],
        },
        {
          label: "Contact",
          summary: "how a message from the Connect page reaches my inbox",
          accent: "lavender",
          nodes: [
            { name: "Connect form", note: "Turnstile token" },
            { name: "API Gateway", note: "HTTP API, throttled" },
            { name: "AWS Lambda", note: "verifies Turnstile (secret in SSM)" },
            { name: "DynamoDB", note: "rate limits and duplicates" },
            { name: "Amazon SES", note: "email to my inbox" },
          ],
        },
      ],
      diagram: [
        "GitHub",
        "GitHub Actions",
        "Next.js static build",
        "Amazon S3",
        "Amazon CloudFront",
        "alibacelonia.dev",
      ],
    },
    source:
      "This repository: next.config.ts, infra/terraform (incl. modules/contact-api, functions/viewer-request.js), infra/lambda/contact, .github/workflows, scripts/deploy.sh; live headers and DNS checked 2026-10-24",
  },
];

export function getProject(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
