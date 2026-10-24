import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { clientWork, publishedClientWork } from "@/data/clientWork";
import { getProject, projects } from "@/data/projects";
import {
  experience,
  formatDuration,
  formatRange,
  formatYearMonth,
  overlapsNext,
} from "@/data/experience";
import { skills } from "@/data/skills";
import { certifications } from "@/data/certifications";

describe("projects data", () => {
  it("has four featured projects with the Website Portfolio last", () => {
    expect(projects).toHaveLength(4);
    const portfolio = projects.at(-1)!;
    expect(portfolio.id).toBe("website-portfolio");
    expect(portfolio.name).toBe("Website Portfolio");
    expect(portfolio.category).toBe("Personal Website / Full-Stack & DevOps Portfolio");
    expect(projects.some((p) => /maba/i.test(p.name))).toBe(false);
  });

  it("gives every project the full detail structure", () => {
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length);
    for (const project of projects) {
      expect(project.id).toMatch(/^[a-z0-9-]+$/);
      expect(project.summary.length).toBeGreaterThan(40);
      expect(project.keyTech.length).toBeGreaterThan(0);
      expect(project.keyTech.length).toBeLessThanOrEqual(6);
      expect(project.overview.length).toBeGreaterThan(0);
      expect(project.problem.length).toBeGreaterThan(40);
      expect(project.audience.length).toBeGreaterThan(10);
      expect(project.solution.length).toBeGreaterThanOrEqual(3);
      expect(project.stack.every((g) => g.items.length > 0)).toBe(true);
      expect(project.infrastructure.items.length).toBeGreaterThan(0);
    }
  });

  it("links only to https URLs, with repositories under the owner's GitHub account", () => {
    for (const project of projects) {
      expect(project.repository.href).toMatch(/^https:\/\/github\.com\/alibacelonia\/[\w.-]+$/);
      for (const link of [...project.links, project.docs, project.demo].filter(Boolean)) {
        expect(link!.href).toMatch(/^https:\/\//);
      }
    }
  });

  it("documents the portfolio's live delivery path and cloud architecture", () => {
    const portfolio = getProject("website-portfolio")!;
    expect(portfolio.infrastructure.diagram).toEqual([
      "GitHub",
      "GitHub Actions",
      "Next.js static build",
      "Amazon S3",
      "Amazon CloudFront",
      "alibacelonia.dev",
    ]);
    // Deployed and live since 2026-10-24, so nothing is left as planned.
    expect(portfolio.infrastructure.items.filter((i) => i.status === "planned")).toEqual([]);
    expect(portfolio.infrastructure.graph?.map((lane) => lane.label)).toEqual([
      "Deploy",
      "Serve",
      "Contact",
    ]);
    expect(portfolio.keyTech).toEqual([
      "Next.js",
      "TypeScript",
      "Terraform",
      "CloudFront",
      "Lambda",
      "GitHub Actions",
    ]);
  });

  it("never ships a screenshot that is not a local asset", () => {
    for (const project of projects) {
      if (project.screenshot) expect(project.screenshot.src).toMatch(/^\/projects\//);
    }
  });
});

/** Pixel size from a WebP file header (lossy VP8, lossless VP8L or extended VP8X). */
function webpSize(file: string): { width: number; height: number } {
  const b = readFileSync(file);
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  }
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
}

describe("project screenshots", () => {
  const shots = [...projects, ...clientWork].flatMap((item) =>
    item.screenshot ? [{ id: item.id, ...item.screenshot }] : [],
  );

  it("are all 5 × 3.5 in (10:7), and each file matches its declared size", () => {
    expect(shots.map((shot) => shot.id)).toEqual(
      expect.arrayContaining(["ironfort", "website-portfolio"]),
    );
    for (const shot of shots) {
      expect(shot.src, shot.id).toMatch(/^\/projects\/.+\.webp$/);
      expect(shot.width * 7, `${shot.id} is not 10:7`).toBe(shot.height * 10);
      const file = join(process.cwd(), "public", shot.src);
      expect(existsSync(file), shot.src).toBe(true);
      expect(webpSize(file), shot.src).toEqual({ width: shot.width, height: shot.height });
    }
  });
});

describe("client work data", () => {
  it("renders only entries marked published, and links only over https", () => {
    // Publishing IronFort requires the client's confirmation (docs/requirements.md).
    expect(publishedClientWork).toEqual(clientWork.filter((work) => work.published));
    for (const work of clientWork) {
      expect(work.link.href).toMatch(/^https:\/\//);
      expect(work.tech.length).toBeGreaterThan(0);
      if (work.screenshot) {
        expect(work.screenshot.src).toMatch(/^\/projects\/[a-z0-9-]+\.webp$/);
        expect(existsSync(join(process.cwd(), "public", work.screenshot.src))).toBe(true);
        expect(work.screenshot.alt.length).toBeGreaterThan(20);
      }
    }
  });
});

describe("experience data", () => {
  it("lists the five resume roles, most recent first", () => {
    expect(experience.map((r) => r.id)).toEqual([
      "buzzerboy",
      "fujitsu",
      "da-programmer",
      "da-web-developer",
      "universal-leaf",
    ]);
    const starts = experience.map((r) => r.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it("has valid ranges where the end is never before the start", () => {
    for (const role of experience) {
      expect(() => formatYearMonth(role.start)).not.toThrow();
      if (role.end) expect(role.end >= role.start).toBe(true);
    }
  });

  it("matches the resume dates", () => {
    const ranges = Object.fromEntries(experience.map((r) => [r.id, formatRange(r)]));
    expect(ranges).toEqual({
      buzzerboy: "Aug 2024 – Present",
      fujitsu: "Jul 2022 – Sep 2026",
      "da-programmer": "Mar 2021 – Jun 2022",
      "da-web-developer": "Jun 2020 – Mar 2021",
      "universal-leaf": "Jul 2018 – Dec 2019",
    });
  });

  it("explains the overlapping freelance role", () => {
    const freelance = experience.find((r) => r.id === "buzzerboy");
    expect(freelance?.note).toMatch(/Fujitsu/);
  });

  it("rejects malformed year-months", () => {
    expect(() => formatYearMonth("2024-13")).toThrow();
    expect(formatYearMonth("2018-07")).toBe("Jul 2018");
  });
});

describe("experience timeline helpers", () => {
  it("formats inclusive durations and leaves current roles open", () => {
    expect(formatDuration({ start: "2018-07", end: "2019-12" })).toBe("1 yr 6 mos");
    expect(formatDuration({ start: "2022-07", end: "2026-09" })).toBe("4 yrs 3 mos");
    expect(formatDuration({ start: "2020-06", end: "2021-03" })).toBe("10 mos");
    expect(formatDuration({ start: "2021-01", end: "2021-12" })).toBe("1 yr");
    expect(formatDuration({ start: "2024-08", end: null })).toBeNull();
  });

  it("detects concurrent roles but not same-month handovers", () => {
    const [buzzerboy, fujitsu, daProgrammer, daWeb] = experience;
    expect(overlapsNext(buzzerboy!, fujitsu)).toBe(true);
    expect(overlapsNext(fujitsu!, daProgrammer)).toBe(false);
    expect(overlapsNext(daProgrammer!, daWeb)).toBe(false);
    expect(overlapsNext(daWeb!, undefined)).toBe(false);
  });
});

describe("skills data", () => {
  it("groups skills into the three disciplines without duplicates per discipline", () => {
    expect(skills.map((d) => d.id)).toEqual(["full-stack", "devops", "ai"]);
    for (const discipline of skills) {
      const names = discipline.groups.flatMap((g) => g.skills.map((s) => s.name));
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe("certifications data", () => {
  it("lists the three AWS certifications with verified Credly links", () => {
    expect(certifications.map((c) => c.code)).toEqual(["SAA-C03", "CLF-C02", "AIF-C01"]);
    expect(certifications.map((c) => c.level)).toEqual([
      "Associate",
      "Foundational",
      "Foundational",
    ]);
    for (const cert of certifications) {
      expect(cert.badge?.src).toMatch(/^\/certifications\/aws-[a-z]+\.webp$/);
    }
    for (const cert of certifications) {
      if (cert.credentialUrl) {
        expect(cert.credentialUrl).toMatch(/^https:\/\/www\.credly\.com\/badges\/[0-9a-f-]{36}/);
      }
    }
  });
});
