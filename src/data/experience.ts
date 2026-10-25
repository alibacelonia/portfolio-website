import type { Role } from "@/types/content";

// Source: resume.pdf (October 2026). Ordered by start date, most recent first.
export const experience: Role[] = [
  {
    id: "buzzerboy",
    title: "Product Engineer",
    organization: "Buzzerboy · IronFort",
    location: "Remote",
    start: "2024-08",
    end: null,
    employment: "Freelance · Part-time",
    note: "Held alongside the Fujitsu role from August 2024 to September 2026.",
    summary: [
      "AWS infrastructure automation with Terraform and CDKTN",
      "Azure DevOps CI/CD with AWS OIDC integration",
      "Python Lambda and EventBridge automation",
      "Docker deployments on Lightsail, ECS and ECR",
      "Cross-account IAM and cloud security integrations",
    ],
    details: [
      "Define development, demo and production AWS infrastructure using CDKTN-generated Terraform, reusable constructs, remote state in S3, and least-privilege execution and scheduler roles.",
      "Built Azure DevOps validation and deployment pipelines using AWS OIDC, automated tests, Terraform plan/apply stages, deployment artifacts, branch-based environments and approval controls.",
      "Developed separate Python Lambda services scheduled with EventBridge, secured configuration through Secrets Manager, and implemented CloudWatch logging, delivery tracking and operational diagnostics.",
      "Supported Dockerized application and worker deployments using Lightsail, ECS and ECR; investigated container images, networking, database access, environment configuration and deployment failures.",
      "Implemented secure cross-account AWS access using IAM roles and External IDs for ScanOps security scanning, with role-based permissions, MFA/TOTP and tenant-aware controls.",
      "Resolved pipeline issues involving Terraform and CDKTN tooling, provider permissions, backend access, IAM policies and Azure environment authorization.",
    ],
  },
  {
    id: "fujitsu",
    title: "Application Systems Engineer",
    organization: "Fujitsu Philippines",
    location: "Bonifacio Global City, Philippines",
    start: "2022-07",
    end: "2026-09",
    endDetail: "September 27, 2026",
    summary: [
      "GitHub Actions and GitLab CI pipelines",
      "Dockerized Python applications",
      "Linux and AWS deployment support",
      "Log monitoring and troubleshooting",
      "Security and process automation",
    ],
    details: [
      "Built and maintained GitHub Actions and GitLab CI pipelines for validation and deployment of Python, Django, Flask, JavaScript, C# and data-processing applications.",
      "Deployed and troubleshot containerized Django services in Linux-based AWS environments using Docker, Bash, command-line tools, process inspection, and application and container logs.",
      "Created a multi-service log detection and monitoring tool that surfaced system events for operational analysis, troubleshooting and root-cause investigation.",
      "Developed an IP restriction maintenance utility that automated repetitive configuration work and strengthened application security controls.",
      "Supported engineers with cloud infrastructure, CI/CD, container deployments, documentation and technical troubleshooting across application environments.",
    ],
  },
  {
    id: "da-programmer",
    title: "Admin Officer II (Programmer)",
    organization: "Department of Agriculture",
    location: "San Fernando City, La Union, Philippines",
    start: "2021-03",
    end: "2022-06",
    summary: [
      "Drone-video processing with Python, OpenCV and MoviePy",
      "Geotagged infrastructure-photo processing",
      "GitHub Actions deployments to DigitalOcean",
    ],
    details: [
      "Developed a mobile application for drone-video processing that embedded geolocation data in the output, using Python, OpenCV and MoviePy to reduce processing time by 40%.",
      "Developed a tool that processed, sorted and grouped geotagged infrastructure-project photos into before, during and after construction stages.",
      "Created GitHub Actions CI/CD pipelines to automate the build and deployment of departmental tools to infrastructure within a DigitalOcean VPC.",
    ],
  },
  {
    id: "da-web-developer",
    title: "Project Assistant I (Web Developer)",
    organization: "Department of Agriculture",
    location: "San Fernando City, La Union, Philippines",
    start: "2020-06",
    end: "2021-03",
    summary: [
      "Employee self-service web application",
      "Document-tracking tool",
      "Public website migration",
      "CI/CD automation",
    ],
    details: [
      "Developed an employee self-service web application for viewing payslips and Daily Time Records (DTRs).",
      "Developed a web-based document-tracking tool with integrated ACR search for locating and monitoring departmental records.",
      "Created GitHub Actions CI/CD pipelines to automate the build and deployment of the web tools to infrastructure within a DigitalOcean VPC.",
      "Migrated and optimised a public website and supported an ASP.NET MVC analytics dashboard and validated data-entry workflow.",
    ],
  },
  {
    id: "universal-leaf",
    title: "Applications Developer",
    organization: "Universal Leaf Philippines",
    location: "Agoo, La Union, Philippines",
    start: "2018-07",
    end: "2019-12",
    summary: [
      "Enterprise application development",
      "Database and stored-procedure optimisation",
      "Automated scheduled jobs",
      "Production support",
    ],
    details: [
      "Developed and supported enterprise applications, scheduled jobs, deployments, documentation, troubleshooting, user support and technical delivery.",
      "Optimised SQL stored procedures and scheduled jobs, reducing data-processing time by 25%.",
    ],
  },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatYearMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    throw new Error(`Invalid year-month: ${value}`);
  }
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatRange(role: Pick<Role, "start" | "end">): string {
  return `${formatYearMonth(role.start)} – ${role.end ? formatYearMonth(role.end) : "Present"}`;
}

function toMonthIndex(value: string): number {
  const [year, month] = value.split("-").map(Number);
  return year! * 12 + (month! - 1);
}

/** Inclusive length of a finished role, e.g. "1 yr 6 mos". Current roles have no fixed length. */
export function formatDuration(role: Pick<Role, "start" | "end">): string | null {
  if (!role.end) return null;
  const months = toMonthIndex(role.end) - toMonthIndex(role.start) + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [
    years ? `${years} yr${years > 1 ? "s" : ""}` : "",
    rest ? `${rest} mo${rest > 1 ? "s" : ""}` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

/** True when a role started before the next (older) role ended, e.g. a part-time engagement. */
export function overlapsNext(
  role: Pick<Role, "start">,
  next: Pick<Role, "end"> | undefined,
): boolean {
  return Boolean(next?.end && role.start < next.end);
}
