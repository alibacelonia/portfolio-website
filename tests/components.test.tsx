import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SectionNav } from "@/components/layout/SectionNav";
import { Header } from "@/components/layout/Header";
import { ProjectDetail } from "@/components/sections/ProjectDetail";
import { Pipeline } from "@/components/sections/Pipeline";
import { ProjectCard } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Certifications } from "@/components/sections/Certifications";
import { getProject, projects } from "@/data/projects";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { mediaState } from "./setup";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("ThemeToggle", () => {
  it("switches theme and remembers the choice", async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.theme = "light";
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(
      await screen.findByRole("button", { name: "Switch to light theme" }),
    ).toBeInTheDocument();
  });
});

describe("MobileMenu", () => {
  it("opens, lists the six sections, and closes on Escape with focus restored", async () => {
    const user = userEvent.setup();
    render(<MobileMenu active="skills" />);
    const button = screen.getByRole("button", { name: /Open menu$/ });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const nav = await screen.findByRole("navigation", { name: "Sections" });
    expect(within(nav).getAllByRole("link")).toHaveLength(6);
    expect(within(nav).getByRole("link", { name: "Skills" })).toHaveAttribute(
      "aria-current",
      "location",
    );

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });
});

describe("SectionNav", () => {
  it("links to every section in order with root-relative anchors", () => {
    render(<SectionNav active="experience" />);
    const links = within(screen.getByRole("navigation", { name: "Sections" })).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/#home",
      "/#projects",
      "/#experience",
      "/#skills",
      "/#certifications",
      "/#contact",
    ]);
    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });
});

describe("Header", () => {
  it("keeps all section links without a logo, theme toggle or resume in the dock", () => {
    pathname.current = "/";
    render(<Header />);
    expect(screen.queryByRole("link", { name: "Mohammed Ali B. Abdullah, home" })).toBeNull();
    expect(screen.getAllByRole("navigation", { name: "Sections" })).toHaveLength(1);
    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(screen.queryByRole("button", { name: /theme/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /Resume/ })).toBeNull();
  });

  it("marks Projects as current on project pages", () => {
    pathname.current = "/projects/estoe/";
    render(<Header />);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    pathname.current = "/";
  });
});

describe("Pipeline", () => {
  it("renders exactly four labelled stages", () => {
    render(<Pipeline />);
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((i) => i.textContent?.match(/^(Code|Build|Deploy|Monitor)/)?.[0])).toEqual([
      "Code",
      "Build",
      "Deploy",
      "Monitor",
    ]);
    expect(screen.getByText(/Delivery pipeline used for this site/)).toBeInTheDocument();
  });

  it("shows the finished state without a replay control when motion is reduced", () => {
    mediaState.matches.add("(prefers-reduced-motion: reduce)");
    render(<Pipeline />);
    expect(screen.getByText("4/4 stages passed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /run again/i })).not.toBeInTheDocument();
  });
});

describe("ProjectCard", () => {
  it("shows a compact summary with a details link and safe external links", () => {
    const project = projects.find((p) => p.id === "estoe")!;
    render(<ProjectCard project={project} />);
    expect(screen.getByRole("heading", { name: "estoe" })).toBeInTheDocument();
    expect(screen.getByText("DevOps Tooling · CLI")).toBeInTheDocument();
    // next/link drops the trailing slash outside a Next build; the export keeps it (E2E checks).
    expect(screen.getByRole("link", { name: "View details about estoe" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/projects\/estoe\/?$/),
    );
    const repo = screen.getByRole("link", { name: /estoe on GitHub/ });
    expect(repo).toHaveAttribute("href", "https://github.com/alibacelonia/estoe");
    expect(repo).toHaveAttribute("rel", "noopener noreferrer");
    expect(repo).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /estoe on PyPI/ })).toBeInTheDocument();
  });
});

describe("ProjectDetail", () => {
  it("presents sections A–F for the Website Portfolio and flags planned infrastructure", () => {
    render(<ProjectDetail project={getProject("website-portfolio")!} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Website Portfolio" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Overview",
      "Problem",
      "Solution",
      "Technology stack",
      "Infrastructure & architecture",
      "Links",
    ]);
    expect(screen.getAllByText("planned")).toHaveLength(2);
    const flow = screen.getByRole("list", { name: "Website Portfolio flow" });
    expect(within(flow).getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByRole("link", { name: "All projects" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/projects\/?$/),
    );
  });
});

describe("Experience", () => {
  it("renders each role with machine-readable dates and expandable details", () => {
    render(<Experience />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    expect(
      screen.getByText((_, el) => el?.tagName === "P" && el.textContent === "Aug 2024 – Present"),
    ).toBeInTheDocument();
    expect(document.querySelector('time[datetime="2018-07"]')).not.toBeNull();
    expect(document.querySelectorAll("details")).toHaveLength(5);
  });
});

describe("Skills", () => {
  it("announces working-knowledge tags to screen readers", () => {
    render(<Skills />);
    expect(screen.getByText("Kubernetes").textContent).toContain("(working knowledge)");
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Full-Stack Development",
      "DevOps & Cloud",
      "AI Engineering",
    ]);
  });
});

describe("Certifications", () => {
  it("links each certification to its credential", () => {
    render(<Certifications />);
    expect(screen.getAllByRole("link", { name: /View credential/ })).toHaveLength(3);
  });
});
