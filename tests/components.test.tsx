import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SectionNav } from "@/components/layout/SectionNav";
import { Header } from "@/components/layout/Header";
import { ProjectDetail } from "@/components/sections/ProjectDetail";
import { ProjectCollection } from "@/components/sections/Projects";
import { clientWork, publishedClientWork } from "@/data/clientWork";
import ProjectsPage from "@/app/projects/page";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { buildCaseStudies } from "@/lib/caseStudies";
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
      "/#connect",
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
  it("builds the page from framed bands with an at-a-glance strip", () => {
    const { container } = render(<ProjectDetail project={getProject("website-portfolio")!} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Website Portfolio" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Overview",
      "Solution",
      "Infrastructure & architecture",
    ]);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "What it does",
      "Problem",
      "Technology stack",
    ]);

    const glance = container.querySelector('dl[aria-label="Project at a glance"]')!;
    expect(glance).not.toBeNull();
    expect([...glance.querySelectorAll("dt")].map((dt) => dt.textContent)).toEqual([
      "Status",
      "Discipline",
      "Key stack",
      "Repository",
    ]);
    const repo = screen.getByRole("link", { name: /^View on GitHub: Website Portfolio/ });
    expect(repo).toHaveAttribute("href", "https://github.com/alibacelonia/portfolio-website");
    expect(repo).toHaveAttribute("rel", "noopener noreferrer");

    expect(screen.queryAllByText("planned")).toHaveLength(0);
    // The cloud architecture graph replaces the one-line flow: three lanes of five services.
    const graph = screen.getByRole("figure", { name: "Website Portfolio cloud architecture" });
    const lanes = within(graph).getAllByRole("list");
    expect(lanes.map((lane) => lane.getAttribute("aria-label")?.split(":")[0])).toEqual([
      "Deploy",
      "Serve",
      "Contact",
    ]);
    for (const lane of lanes) expect(within(lane).getAllByRole("listitem")).toHaveLength(5);
    expect(within(lanes[2]!).getByText("Amazon SES")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Website Portfolio flow" })).toBeNull();
    expect(screen.getByRole("link", { name: "All projects" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/projects\/?$/),
    );
    // Projects wrap around: the last project leads to the first.
    expect(
      screen.getByRole("link", { name: "Next project: cloud-incident-service" }),
    ).toHaveAttribute("href", expect.stringMatching(/^\/projects\/cloud-incident-service\/?$/));
  });
});

describe("ProjectCollection", () => {
  it("shows only the open-source grid while no client work is published", () => {
    render(<ProjectCollection level={3} work={[]} />);
    expect(screen.queryByText("Professional work")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
  });

  it("groups published client work above open source, one heading level down", () => {
    render(<ProjectCollection level={3} work={[{ ...clientWork[0]!, published: true }]} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Professional work",
      "Open source",
    ]);
    expect(screen.getByRole("heading", { level: 4, name: "IronFort" })).toBeInTheDocument();
    // Contributions are optional; without them the card lists technologies only.
    expect(screen.queryByText("What I built")).not.toBeInTheDocument();
    const ironfort = screen.getByRole("article", { name: "IronFort" });
    expect(within(ironfort).getByText("Amazon Bedrock")).toBeInTheDocument();
    expect(within(ironfort).getByText("Route 53")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(5);
    // The genuine product screenshot comes first in the card (left on desktop, top on phones).
    const shot = within(ironfort).getByRole("img", { name: /^IronFort homepage/ });
    expect(
      shot.compareDocumentPosition(within(ironfort).getByRole("heading", { name: "IronFort" })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const site = screen.getByRole("link", { name: /^goironfort\.com: IronFort product site/ });
    expect(site).toHaveAttribute("href", "https://goironfort.com/");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("CaseStudies", () => {
  it("lists client work first, then open-source projects, each with a pinned-panel entry", () => {
    const studies = buildCaseStudies();
    expect(studies.map((study) => study.id)).toEqual([
      ...publishedClientWork.map((work) => work.id),
      ...projects.map((project) => project.id),
    ]);
    const { container } = render(<CaseStudies studies={studies} />);
    // One panel entry per project; the first is active before any scrolling.
    const panels = [...container.querySelectorAll(".case-panel-item")];
    expect(panels.map((panel) => panel.getAttribute("aria-label"))).toEqual(
      studies.map((study) => study.name),
    );
    expect(panels.filter((panel) => panel.hasAttribute("data-active"))).toHaveLength(1);
    expect(panels[0]).toHaveAttribute("data-active");
    // A decorative progress ruler: one tick per project, the first one active.
    const ruler = container.querySelector(".case-ruler")!;
    expect(ruler).toHaveAttribute("aria-hidden", "true");
    const ticks = [...ruler.querySelectorAll("li")];
    expect(ticks).toHaveLength(studies.length);
    expect(ticks.findIndex((tick) => tick.hasAttribute("data-active"))).toBe(0);
    // Each preview card opens with its tagline above the image and stays a mouse-only shortcut.
    const stages = [...container.querySelectorAll(".case-stage")];
    stages.forEach((stage, index) => {
      expect(stage).toHaveAttribute("aria-hidden", "true");
      expect(stage).toHaveAttribute("tabindex", "-1");
      expect(stage.querySelector("p")).toHaveTextContent(studies[index]!.tagline);
    });
    const estoePanel = within(container.querySelector<HTMLElement>("#case-panel-estoe")!);
    expect(estoePanel.getByRole("link", { name: "Read case study: estoe" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/projects\/estoe\/?$/),
    );
    expect(estoePanel.getByRole("link", { name: /^estoe on PyPI/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("activates a panel when one of its links receives keyboard focus", async () => {
    const user = userEvent.setup();
    const studies = buildCaseStudies();
    const { container } = render(<CaseStudies studies={studies} />);
    const estoePanel = container.querySelector<HTMLElement>("#case-panel-estoe")!;
    expect(estoePanel).not.toHaveAttribute("data-active");
    within(estoePanel).getByRole("link", { name: "Read case study: estoe" }).focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}{Tab}");
    expect(estoePanel).toHaveAttribute("data-active");
  });

  it("falls back to the architecture flow when a project has no screenshot", () => {
    const studies = buildCaseStudies();
    const { container } = render(<CaseStudies studies={studies} />);
    const estoeStage = container.querySelector("#case-study-estoe .case-stage")!;
    expect(estoeStage).toHaveTextContent("preflight");
    const portfolioStage = container.querySelector("#case-study-website-portfolio .case-stage")!;
    expect(portfolioStage.querySelector('img[src*="website-portfolio"]')).not.toBeNull();
    if (publishedClientWork.length) {
      const ironfortStage = container.querySelector("#case-study-ironfort .case-stage")!;
      expect(ironfortStage.querySelector("img")).not.toBeNull();
      expect(
        within(container.querySelector<HTMLElement>("#case-panel-ironfort")!).getByRole("link", {
          name: /^Visit site: IronFort/,
        }),
      ).toHaveAttribute("href", "https://goironfort.com/");
    }
  });
});

describe("All projects page", () => {
  it("frames the collection with a header panel and a GitHub strip", () => {
    render(<ProjectsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "All projects" })).toBeInTheDocument();
    // Open-source projects plus any published client work.
    expect(screen.getAllByRole("article")).toHaveLength(
      projects.length + publishedClientWork.length,
    );
    expect(screen.getByText("4 projects")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^Browse every repository on GitHub/ }),
    ).toHaveAttribute("href", "https://github.com/alibacelonia");
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

describe("Experience timeline", () => {
  it("draws a node per role, rail segments between them and one concurrency bracket", () => {
    const { container } = render(<Experience />);
    expect(container.querySelectorAll(".exp-node")).toHaveLength(5);
    expect(container.querySelectorAll(".exp-segment")).toHaveLength(4);
    expect(container.querySelectorAll(".exp-node[data-current]")).toHaveLength(1);
    // Only the part-time Buzzerboy role overlaps the role below it (Fujitsu).
    const branches = container.querySelectorAll(".exp-branch");
    expect(branches).toHaveLength(1);
    expect(branches[0]!.closest("li")).toHaveAttribute("id", "role-buzzerboy");
    // "Present" marks the current role; no extra "Current role" label.
    expect(container.querySelector("#role-buzzerboy")).toHaveTextContent("Present");
    expect(container.querySelector("#role-buzzerboy")).not.toHaveTextContent("Current role");
    expect(container.querySelector("#role-fujitsu")).toHaveTextContent("4 yrs 3 mos");
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
  it("shows each official badge with its level and a Credly verification link", () => {
    const { container } = render(<Certifications />);
    const links = screen.getAllByRole("link", { name: /^Verify on Credly: AWS Certified/ });
    expect(links).toHaveLength(3);
    for (const link of links) expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // Badges are decorative beside the name; next/image may rewrite src through its loader.
    const badges = [...container.querySelectorAll("img")];
    expect(badges).toHaveLength(3);
    expect(badges.every((img) => img.getAttribute("alt") === "")).toBe(true);
    expect(badges.every((img) => /certifications(%2F|\/)aws-/.test(img.getAttribute("src")!))).toBe(
      true,
    );
    expect(screen.getAllByText("Foundational")).toHaveLength(2);
    expect(screen.getByText("Associate")).toBeInTheDocument();
    expect(screen.getByText("SAA-C03")).toBeInTheDocument();
  });
});
