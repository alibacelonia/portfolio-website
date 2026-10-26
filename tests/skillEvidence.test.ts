import { findSkillProjects } from "@/lib/skill-evidence";

describe("skill project references", () => {
  it("links a documented technology to real project pages and published client work", () => {
    const python = findSkillProjects("Python");
    expect(python).toContainEqual({
      name: "IronFort",
      href: "https://goironfort.com/",
      external: true,
    });
    expect(python).toContainEqual({
      name: "cloud-incident-service",
      href: "/projects/cloud-incident-service/",
      external: false,
    });
    expect(new Set(python.map(({ href }) => href)).size).toBe(python.length);
  });

  it("does not turn working knowledge into an unrelated project's technology", () => {
    expect(findSkillProjects("Pydantic").length).toBeGreaterThan(0);
    expect(findSkillProjects("Pydantic AI")).toEqual([]);
    expect(findSkillProjects("Kubernetes")).toEqual([]);
    expect(findSkillProjects("C#")).toEqual([]);
  });

  it("recognizes documented versions and explicit API aliases", () => {
    expect(findSkillProjects("Next.js").map(({ name }) => name)).toContain("Website Portfolio");
    expect(findSkillProjects("Anthropic API").map(({ name }) => name)).toContain(
      "cloud-incident-service",
    );
  });
});
