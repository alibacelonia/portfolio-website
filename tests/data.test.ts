import { projects } from "@/data/projects";
import { experience, formatRange, formatYearMonth } from "@/data/experience";
import { skills } from "@/data/skills";
import { certifications } from "@/data/certifications";

describe("projects data", () => {
  it("has four featured projects with the portfolio last", () => {
    expect(projects).toHaveLength(4);
    expect(projects.at(-1)?.id).toBe("maba-portfolio");
  });

  it("uses unique ids and complete content", () => {
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length);
    for (const project of projects) {
      expect(project.purpose.length).toBeGreaterThan(40);
      expect(project.highlights.length).toBeGreaterThanOrEqual(3);
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.architecture.length).toBeGreaterThanOrEqual(3);
      expect(project.categories.length).toBeGreaterThan(0);
    }
  });

  it("links only to https URLs under the owner's GitHub account for repositories", () => {
    for (const project of projects) {
      expect(project.repository.href).toMatch(/^https:\/\/github\.com\/alibacelonia\/[\w.-]+$/);
      for (const link of project.links) expect(link.href).toMatch(/^https:\/\//);
    }
  });

  it("never ships a screenshot that is not a local asset", () => {
    for (const project of projects) {
      if (project.screenshot) expect(project.screenshot.src).toMatch(/^\/projects\//);
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
    for (const cert of certifications) {
      if (cert.credentialUrl) {
        expect(cert.credentialUrl).toMatch(/^https:\/\/www\.credly\.com\/badges\/[0-9a-f-]{36}/);
      }
    }
  });
});
