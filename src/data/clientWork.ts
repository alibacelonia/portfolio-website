import type { ClientWork } from "@/types/content";

// Commercial client work. Entries with `published: false` are never rendered. Product facts come
// from the product's public website; the technology list was provided by the owner (2026-10-24).
export const clientWork: ClientWork[] = [
  {
    id: "ironfort",
    name: "IronFort",
    category: "Compliance automation SaaS",
    kind: "SaaS · Client work",
    tagline:
      "Compliance automation for HIPAA, ITSG-33 and SOC 2, with continuous read-only cloud checks",
    // Product highlights from goironfort.com; my role is stated separately.
    highlights: [
      "Checks across AWS, Azure, Google Cloud and GitHub",
      "Read-only integrations with no agents to install",
      "Audit-ready evidence and AI-assisted risk analysis",
      "Available on AWS Marketplace",
    ],
    discipline: "devops",
    summary:
      "A compliance automation platform for HIPAA, ITSG-33 and SOC 2. It runs continuous, read-only checks across cloud and developer platforms such as AWS, Azure, Google Cloud and GitHub, and turns the results into audit-ready evidence.",
    role: "Product Engineer · Freelance via Buzzerboy",
    period: "Aug 2024 – Present",
    tech: [
      "AWS",
      "Python",
      "Terraform (CDKTN)",
      "Azure DevOps",
      "Amazon Bedrock",
      "Lambda",
      "EventBridge",
      "ECS",
      "EC2",
      "Lightsail",
      "S3",
      "Route 53",
      "IAM",
    ],
    link: { label: "goironfort.com", href: "https://goironfort.com/" },
    // Homepage screenshot supplied by the owner (4688×3281 PNG, resized to 1600px WebP), 2026-10-24.
    screenshot: {
      src: "/projects/ironfort.webp",
      alt: "IronFort homepage: “Compliance. Automated. Audit-Ready.” beside a form to book a strategy call",
      width: 1600,
      height: 1120,
    },
    // Case-card background chosen by the owner (2026-10-25).
    stageGradient: {
      angle: 145,
      stops: [
        { color: "#831843", at: 0 },
        { color: "#DB2777", at: 40 },
        { color: "#f472b6", at: 75 },
        { color: "#fbcfe8", at: 100 },
      ],
    },
    published: true,
    source: "goironfort.com (product facts, 2026-10-24); technologies from the owner (2026-10-24)",
  },
];

export const publishedClientWork = clientWork.filter((work) => work.published);
