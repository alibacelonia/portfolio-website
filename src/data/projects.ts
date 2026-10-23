import type { Project } from "@/types/content";

// Every claim below is taken from the repository's README, architecture docs, source, or CI.
// See docs/requirements.md before adding anything that is not in the repository.
export const projects: Project[] = [
  {
    id: "cloud-incident-service",
    name: "cloud-incident-service",
    purpose:
      "AI-assisted AWS incident investigation. A single bounded agent gathers evidence from read-only tools and returns a schema-validated report that keeps confirmed facts, hypotheses and uncertainty separate.",
    categories: ["AI Engineering", "DevOps / Cloud"],
    status: "MVP · synthetic data",
    architecture: ["incident", "bounded agent", "read-only tools", "validated report"],
    highlights: [
      "Two orchestrators behind one protocol: deterministic correlation rules by default, or a model-driven loop capped at 8 tool calls, 6 turns and 60 seconds.",
      "The model cites evidence by ID only; the service supplies the evidence, rejects anything no tool returned, and every remediation requires human approval.",
      "Provider adapters for Amazon Bedrock (Converse tool use), the Anthropic API and an offline mock, plus an opt-in live CloudWatch Logs source.",
      "Offline evaluation of ten scenarios scored on schema, citations, hypothesis, sources and safety, with redacted JSON traces.",
    ],
    stack: [
      "Python",
      "FastAPI",
      "Pydantic",
      "Amazon Bedrock",
      "Anthropic API",
      "boto3",
      "pytest",
      "uv",
    ],
    repository: {
      label: "GitHub",
      href: "https://github.com/alibacelonia/cloud-incident-service",
    },
    links: [],
    source: "README.md, docs/ARCHITECTURE.md, orchestration/model.py, .github/workflows/ci.yml",
  },
  {
    id: "estoe",
    name: "estoe",
    purpose:
      "A CLI that turns one cloud secret from AWS Secrets Manager, Azure Key Vault or Google Secret Manager into a local .env file, without copying values by hand.",
    categories: ["DevOps / Cloud", "Automation"],
    status: "v0.2.0 · PyPI",
    architecture: ["CLI", "preflight", "provider worker", "encode", "atomic write"],
    highlights: [
      "Filesystem and Git preflight runs before any fetch: tracked or unignored destinations, symlinks and unsafe directories are refused.",
      "SDK calls run in an isolated worker with a 15-second deadline; secret values never reach logs, arguments or diagnostics.",
      "Private, atomic file publication with distinct create-only and explicit-overwrite paths; dotenv output verified by round-trip tests.",
      "Released to PyPI from GitHub Actions with Trusted Publishing (no stored token); CI on Python 3.12–3.14 plus a dependency audit.",
    ],
    stack: ["Python", "boto3", "Azure SDK", "Google Cloud SDK", "pytest", "uv", "GitHub Actions"],
    repository: { label: "GitHub", href: "https://github.com/alibacelonia/estoe" },
    links: [{ label: "PyPI", href: "https://pypi.org/project/estoe/" }],
    source:
      "README.md, docs/ARCHITECTURE.md, src/estoe/providers.py, publish-pypi.yml, PyPI JSON API",
  },
  {
    id: "ai-project-factory",
    name: "ai-project-factory",
    purpose:
      "A Copier-based generator for small, runnable Python and web projects that are ready for requirements-driven, AI-assisted development, with tests, CI and repository instructions.",
    categories: ["AI Engineering", "Automation", "Full-Stack"],
    status: "Open source · MIT",
    architecture: ["CLI", "validate", "select template", "render", "staged move"],
    highlights: [
      "Three independent starters: Python CLI (Typer), web SaaS (Next.js, FastAPI, PostgreSQL via Docker Compose) and an AI service with a deterministic mock provider.",
      "Pydantic-validated project schema with feature-compatibility rules; output is rendered in a temporary directory and never overwrites an existing path.",
      "A data-driven catalog of 22 UI presets with light and dark semantic tokens and accessible fallbacks.",
      "Generated repositories include agent instructions, reusable skills and scoped review agents; cloud-incident-service was scaffolded from it.",
    ],
    stack: ["Python", "Copier", "Jinja", "Typer", "Pydantic", "pytest", "uv", "GitHub Actions"],
    repository: {
      label: "GitHub",
      href: "https://github.com/alibacelonia/ai-project-factory",
    },
    links: [],
    source: "README.md, docs/ARCHITECTURE.md, pyproject.toml, cloud-incident-service README",
  },
  {
    id: "maba-portfolio",
    name: "MABA portfolio",
    purpose:
      "This site. A statically exported Next.js portfolio served from a private S3 bucket through CloudFront, provisioned with Terraform and deployed by GitHub Actions using OIDC.",
    categories: ["DevOps / Cloud", "Full-Stack"],
    status: "This site",
    architecture: ["push", "CI gates", "OIDC", "private S3", "CloudFront"],
    highlights: [
      "Static export only, with no server runtime. The S3 bucket stays private and is reachable solely through CloudFront Origin Access Control.",
      "Terraform defines S3, CloudFront, an ACM certificate in us-east-1, security headers and a least-privilege GitHub OIDC deploy role. No long-lived AWS keys.",
      "Every deploy is gated on linting, type checks, unit tests and Playwright end-to-end and accessibility tests.",
      "Hashed assets are cached for a year as immutable; HTML is revalidated and CloudFront is invalidated on release.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Motion",
      "Terraform",
      "S3",
      "CloudFront",
      "GitHub Actions",
    ],
    // The repository must contain this code before the site is deployed (docs/requirements.md).
    repository: {
      label: "GitHub",
      href: "https://github.com/alibacelonia/portfolio-website",
    },
    links: [],
    source: "This repository: infra/terraform, .github/workflows",
  },
];
