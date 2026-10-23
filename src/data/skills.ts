import type { SkillDiscipline } from "@/types/content";

// "hands-on": used in a role on the resume or in a public repository.
// "working": the resume states working knowledge, or the use is limited to supporting work.
export const skills: SkillDiscipline[] = [
  {
    id: "full-stack",
    title: "Full-Stack Development",
    description: "Web applications, APIs and the databases behind them.",
    groups: [
      {
        label: "Languages & frameworks",
        skills: [
          { name: "Python", level: "hands-on" },
          { name: "JavaScript", level: "hands-on" },
          { name: "Django", level: "hands-on" },
          { name: "Flask", level: "hands-on" },
          { name: "FastAPI", level: "hands-on" },
          { name: "Pydantic", level: "hands-on" },
          { name: "TypeScript", level: "working" },
          { name: "Next.js", level: "working" },
          { name: "C#", level: "working" },
          { name: "ASP.NET MVC", level: "working" },
        ],
      },
      {
        label: "Data & interfaces",
        skills: [
          { name: "PostgreSQL", level: "hands-on" },
          { name: "MySQL", level: "hands-on" },
          { name: "SQL Server", level: "hands-on" },
          { name: "DynamoDB", level: "hands-on" },
          { name: "SQL optimisation", level: "hands-on" },
          { name: "REST APIs", level: "hands-on" },
          { name: "Data migration", level: "hands-on" },
        ],
      },
    ],
  },
  {
    id: "devops",
    title: "DevOps & Cloud",
    description: "Infrastructure as code, delivery pipelines and running workloads on AWS.",
    groups: [
      {
        label: "AWS",
        skills: [
          { name: "Lambda", level: "hands-on" },
          { name: "EventBridge Scheduler", level: "hands-on" },
          { name: "ECS", level: "hands-on" },
          { name: "ECR", level: "hands-on" },
          { name: "Lightsail", level: "hands-on" },
          { name: "S3", level: "hands-on" },
          { name: "CloudFront", level: "hands-on" },
          { name: "API Gateway", level: "hands-on" },
          { name: "IAM", level: "hands-on" },
          { name: "Secrets Manager", level: "hands-on" },
          { name: "CloudWatch", level: "hands-on" },
        ],
      },
      {
        label: "IaC & CI/CD",
        skills: [
          { name: "Terraform", level: "hands-on" },
          { name: "CDKTN", level: "hands-on" },
          { name: "CloudFormation", level: "hands-on" },
          { name: "GitHub Actions", level: "hands-on" },
          { name: "GitLab CI", level: "hands-on" },
          { name: "Azure DevOps", level: "hands-on" },
          { name: "AWS OIDC", level: "hands-on" },
        ],
      },
      {
        label: "Systems & security",
        skills: [
          { name: "Docker", level: "hands-on" },
          { name: "Docker Compose", level: "hands-on" },
          { name: "Linux", level: "hands-on" },
          { name: "Bash", level: "hands-on" },
          { name: "Least-privilege IAM", level: "hands-on" },
          { name: "Cross-account roles", level: "hands-on" },
          { name: "DigitalOcean", level: "hands-on" },
          { name: "Cloudflare", level: "hands-on" },
          { name: "Kubernetes", level: "working" },
          { name: "EKS", level: "working" },
        ],
      },
    ],
  },
  {
    id: "ai",
    title: "AI Engineering",
    description: "Bounded, evidence-grounded LLM features with evaluation and safety controls.",
    groups: [
      {
        label: "Models & integration",
        skills: [
          { name: "LLM integration", level: "hands-on" },
          { name: "Amazon Bedrock", level: "hands-on" },
          { name: "Anthropic API", level: "hands-on" },
          { name: "Tool use", level: "hands-on" },
          { name: "Prompt engineering", level: "hands-on" },
        ],
      },
      {
        label: "Reliability",
        skills: [
          { name: "Offline evaluation", level: "hands-on" },
          { name: "Schema-validated output", level: "hands-on" },
          { name: "Output grounding", level: "hands-on" },
          { name: "Trace redaction", level: "hands-on" },
          { name: "AI-assisted development workflows", level: "hands-on" },
        ],
      },
    ],
  },
];
