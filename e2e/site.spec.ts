import type { Page } from "@playwright/test";
import { expect, openMessageTab, stubThirdParty, test } from "./fixtures";
import { THEME_STORAGE_KEY } from "../src/lib/theme";
import { projects } from "../src/data/projects";
import { publishedClientWork } from "../src/data/clientWork";
import { buildCaseStudies } from "../src/lib/caseStudies";
import { stageFrame, stageGradientFor } from "../src/lib/stage";
import { navigation } from "../src/lib/site";

const SECTIONS = ["home", "projects", "experience", "skills", "certifications", "connect"];
const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

/** Asserts the single canonical link in a page's static HTML (what crawlers receive). */
async function expectCanonical(page: Page, path: string, expected: string) {
  const html = await (await page.request.get(path)).text();
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
  expect(canonicals).toEqual([expected]);
}

test("renders the six sections in order with a single h1", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  const ids = await page.locator("main > section").evaluateAll((els) => els.map((el) => el.id));
  expect(ids).toEqual(SECTIONS);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Mohammed Ali B. Abdullah");
  await expect(page.locator("#home").getByText("Based in the Philippines")).toBeVisible();
  await expect(page.getByText("Full-Stack Developer")).toBeVisible();
  expect(errors).toEqual([]);
});

test("hydrates cleanly with reduced motion and keeps the theme", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", colorScheme: "dark" });
  await stubThirdParty(context);
  const page = await context.newPage();
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveClass(/\bjs\b/);
  expect(errors).toEqual([]);
  await context.close();
});

test("has no horizontal overflow at supported widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Widths are set explicitly");
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test("Lenis smooths wheel scrolling and honors live reduced-motion changes", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Mouse-wheel behavior");
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await page.mouse.move(800, 400);
  await page.mouse.wheel(0, 600);
  await expect(page.locator("html")).toHaveClass(/\blenis-smooth\b/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1000);
  await expect(page.locator("html")).not.toHaveClass(/\blenis-smooth\b/);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.wheel(0, 400);
  await expect(page.locator("html")).toHaveClass(/\blenis-smooth\b/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1400);
});

test("shows exactly one section navigation per breakpoint", async ({ page }, testInfo) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Sections" });
  const menuButton = page.getByRole("button", { name: /Open menu$/ });
  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: "Mohammed Ali B. Abdullah, home" })).toHaveCount(0);
  await expect(header.getByRole("button", { name: /theme/i })).toHaveCount(0);
  await expect(header.getByRole("link", { name: /Resume/ })).toHaveCount(0);
  if (testInfo.project.name === "desktop") {
    await expect(nav).toHaveCount(1);
    await expect(nav).toBeVisible();
    await expect(menuButton).toBeHidden();
    const link = nav.getByRole("link", { name: "Experience" });
    await link.click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(link).toHaveAttribute("aria-current", "location");
    // The sliding indicator must sit under the active link.
    await expect(async () => {
      const box = (await link.boundingBox())!;
      const pill = (await nav.locator("span[aria-hidden]").first().boundingBox())!;
      expect(Math.abs(pill.x - box.x)).toBeLessThan(2);
      expect(Math.abs(pill.width - box.width)).toBeLessThan(2);
    }).toPass({ timeout: 2000 });
  } else {
    await expect(nav).toBeHidden();
    await menuButton.click();
    const menu = page.getByRole("navigation", { name: "Sections" });
    await expect(menu.getByRole("link")).toHaveCount(6);
    const menuBox = (await menu.boundingBox())!;
    expect(menuBox.y).toBeGreaterThan(page.viewportSize()!.height / 2);
    await menu.getByRole("link", { name: "Connect" }).click();
    await expect(page).toHaveURL(/#connect$/);
    await expect(page.getByRole("button", { name: /Open menu$/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  }
});

test("mobile snackbar stays at the viewport bottom and dismisses accessibly", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile navigation");
  await page.goto("/#skills");
  await expect(page.locator('header [data-section="skills"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  const trigger = page.getByRole("button", { name: /Open menu$/ });
  // Playwright's click first scrolls the fixed trigger "into view", which moves the page off
  // #skills and races the menu's initial focus. A real tap doesn't scroll, so dispatch the click.
  await trigger.dispatchEvent("click");
  const menu = page.getByRole("navigation", { name: "Sections" });
  await expect(menu.getByRole("link", { name: "Tech Stack" })).toBeFocused();
  const panel = menu.locator("..");
  await expect(async () => {
    const box = (await panel.boundingBox())!;
    expect(Math.abs(page.viewportSize()!.height - box.y - box.height - 16)).toBeLessThan(2);
  }).toPass();

  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(menu).toBeHidden();

  await trigger.click();
  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(trigger).toBeFocused();
  await expect(menu).toBeHidden();

  await trigger.click();
  await page.locator("#skills-title").click();
  await expect(menu).toBeHidden();

  await trigger.click();
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(trigger).toBeHidden();
  await expect(page.getByRole("button", { name: "Close navigation" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Sections" })).toBeVisible();
});

/** The nav label for a section id, from the site's own navigation (e.g. skills → "Tech Stack"). */
const navLabel = (id: string) => navigation.find((item) => item.id === id)!.label;

test("keeps the navigation visible and clear of section headings", async ({ page }, testInfo) => {
  await page.goto("/");
  const bar = page.getByRole("banner");
  for (const id of ["projects", "skills", "connect"]) {
    if (testInfo.project.name === "desktop") {
      await page
        .getByRole("navigation", { name: "Sections" })
        .getByRole("link", { name: navLabel(id) })
        .click();
    } else {
      await page.getByRole("button", { name: /Open menu$/ }).click();
      await page
        .getByRole("navigation", { name: "Sections" })
        .getByRole("link", { name: navLabel(id) })
        .click();
    }
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(async () => {
      const header = (await bar.locator("> div > div").boundingBox())!;
      const heading = (await page.locator(`#${id}-title`).boundingBox())!;
      expect(header.y).toBeGreaterThanOrEqual(0);
      expect(header.y).toBeLessThanOrEqual(20);
      expect(heading.y).toBeGreaterThan(header.y + header.height);
      expect(heading.y).toBeLessThan(page.viewportSize()!.height / 2);
    }).toPass({ timeout: 3000 });
  }
});

test("hero fills the first viewport without clipping its content", async ({ page }, testInfo) => {
  await page.goto("/");
  const viewport = page.viewportSize()!;
  const hero = (await page.locator("#home").boundingBox())!;
  expect(hero.height).toBeGreaterThanOrEqual(viewport.height - 1);
  for (const locator of [
    page.locator("h1"),
    page.getByRole("img", { name: "Portrait of Mohammed Ali B. Abdullah" }),
    page.getByRole("link", { name: "View My Work" }),
    page.getByRole("link", { name: "Start a conversation" }),
  ]) {
    const box = (await locator.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(hero.y);
    expect(box.y + box.height).toBeLessThanOrEqual(hero.y + hero.height);
  }
  await expect(
    page.getByRole("img", { name: "Portrait of Mohammed Ali B. Abdullah" }),
  ).toHaveJSProperty("naturalWidth", 800);
  await page.screenshot({ path: testInfo.outputPath("hero-preview.png") });
});

test("hero overview fills its frame with four equal cells and opens contact", async ({
  page,
}, testInfo) => {
  // The links are what's under test, not the smooth-scroll animation: jump instantly so a slow,
  // busy runner can't outlast the viewport check (it flaked under parallel load).
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const grid = page.locator('#home dl[aria-label="At a glance"]');
  const cells = grid.locator(":scope > div");
  await expect(cells).toHaveCount(4);
  const frame = (await page.locator("#home > .section-guides").boundingBox())!;
  const bounds = (await grid.boundingBox())!;
  expect(Math.abs(bounds.x - frame.x)).toBeLessThan(2);
  expect(Math.abs(bounds.width - frame.width)).toBeLessThan(2);
  const first = (await cells.first().boundingBox())!;
  const columns = testInfo.project.name === "desktop" ? 4 : 2;
  expect(Math.abs(first.width * columns + 2 - bounds.width)).toBeLessThan(2);
  for (const cell of await cells.all()) {
    const box = (await cell.boundingBox())!;
    expect(Math.abs(box.width - first.width)).toBeLessThan(2);
    expect(Math.abs(box.height - first.height)).toBeLessThan(2);
  }
  const fontSizes = await grid
    .locator("dd")
    .evaluateAll((values) =>
      values.map((value) => getComputedStyle(value.querySelector("a") ?? value).fontSize),
    );
  expect(new Set(fontSizes).size).toBe(1);
  await grid.getByRole("link", { name: "AWS 3×" }).click();
  await expect(page).toHaveURL(/#certifications$/);
  await expect(page.locator("#certifications-title")).toBeInViewport();
  await page.goto("/");
  await cells.last().getByRole("link", { name: "Start a conversation" }).click();
  await expect(page).toHaveURL(/#connect$/);
  await expect(page.locator("#connect-title")).toBeInViewport();
});

test("hero email copies on desktop and retains mailto on mobile", async ({
  page,
  context,
}, testInfo) => {
  await page.goto("/");
  const email = page.locator('#home a[href="mailto:alibacelonia1234@gmail.com"]');
  await expect(email).toHaveText("email");
  if (testInfo.project.name === "desktop") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await email.click();
    await expect(email).toHaveText("copied!");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "alibacelonia1234@gmail.com",
    );
  } else {
    await expect(email).toHaveAttribute("href", "mailto:alibacelonia1234@gmail.com");
  }
});

test("project cards open static detail pages and lead back", async ({ page }) => {
  await page.goto("/#projects");
  // Like a visitor: bring estoe's image into view so its details take over the pinned panel.
  await page
    .locator("#case-study-estoe .case-stage")
    .evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.getByRole("link", { name: "Read case study: estoe" }).click();
  await expect(page).toHaveURL(/\/projects\/estoe\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("estoe");
  await expect(
    page.getByRole("heading", { level: 2, name: "How it's built and shipped" }),
  ).toBeVisible();
  // Crawlers load each URL directly, so check the canonical in the static HTML. After client-side
  // navigation Next.js streams the new <head> separately, so it can briefly hold both canonicals.
  await expectCanonical(page, "/projects/estoe/", "https://alibacelonia.dev/projects/estoe/");
  await page.getByRole("link", { name: "All projects" }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("All projects");
  const projectCard = page.getByRole("article", { name: "estoe" });
  await projectCard.scrollIntoViewIfNeeded();
  await expect(projectCard).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Back to portfolio" }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  // Opacity matters here: elements with opacity: 0 still pass toBeVisible().
  for (const id of SECTIONS.slice(1)) {
    for (const element of await page.locator(`#${id} [data-reveal]`).all()) {
      await element.scrollIntoViewIfNeeded();
      await expect(element).toHaveCSS("opacity", "1");
    }
  }
});

test("project detail pages exist for every project and unknown ones 404", async ({ request }) => {
  for (const id of ["cloud-incident-service", "estoe", "ai-project-factory", "website-portfolio"]) {
    expect((await request.get(`/projects/${id}/`)).status()).toBe(200);
  }
  expect((await request.get("/projects/does-not-exist/")).status()).toBe(404);
});

test("view all projects opens the collection and cards remain visible after going back", async ({
  page,
}, testInfo) => {
  await page.goto("/#projects");
  await page.locator("#projects .section-action").screenshot({
    path: testInfo.outputPath("projects-divider-preview.png"),
  });
  await page.getByRole("link", { name: "View all projects" }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("All projects");
  await expect(page.locator("main article")).toHaveCount(
    projects.length + publishedClientWork.length,
  );
  await expectCanonical(page, "/projects/", "https://alibacelonia.dev/projects/");
  await page.getByRole("link", { name: "View details about estoe" }).click();
  await expect(page).toHaveURL(/\/projects\/estoe\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects\/$/);
  const card = page.getByRole("article", { name: "estoe" });
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Back to portfolio" }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.locator("#projects [data-reveal]:has(> #projects-title)")).toHaveCSS(
    "opacity",
    "1",
  );
});

test("uses dark mode only even with a saved light preference", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  await stubThirdParty(context);
  await context.addInitScript(
    (key) => window.localStorage.setItem(key, "light"),
    THEME_STORAGE_KEY,
  );
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await context.close();
});

test("skip link moves focus to the main content", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Keyboard flow");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("serves the resume PDF", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.getByRole("link", { name: /Download Resume/ }).getAttribute("href");
  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

test("external links open safely in a new tab", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('a[target="_blank"]');
  expect(await links.count()).toBeGreaterThan(5);
  for (const rel of await links.evaluateAll((els) => els.map((el) => el.getAttribute("rel")))) {
    expect(rel).toContain("noopener");
  }
});

test("connect page: a reason fills the subject, and the form validates with the keyboard", async ({
  page,
}) => {
  await page.goto("/connect/");
  await openMessageTab(page);
  const form = page.locator("#connect form");
  await page.getByRole("button", { name: "Role" }).click();
  await expect(page.getByRole("button", { name: "Role" })).toHaveAttribute("aria-pressed", "true");
  await expect(form.getByLabel(/^Subject/)).toHaveValue("Role opportunity");
  await form.getByRole("button", { name: /send message/i }).click();
  await expect(form.getByLabel(/^Name/)).toBeFocused();
  await expect(form.getByLabel(/^Name/)).toHaveAttribute("aria-invalid", "true");
  await form.getByLabel(/^Email/).fill("not-an-email");
  await form.getByLabel(/^Email/).press("Tab");
  await expect(page.getByText(/valid email address/)).toBeVisible();
});

test("connect page: the booking tab embeds the calendar and arrow keys switch tabs", async ({
  page,
}) => {
  await page.goto("/connect/");
  const call = page.getByRole("tab", { name: "Book a call" });
  test.skip((await call.count()) === 0, "Build has no NEXT_PUBLIC_CAL_LINK");
  await expect(call).toHaveAttribute("aria-selected", "true");
  // Cal.com's embed replaces the loading skeleton once the calendar is ready.
  const calendar = page.locator('iframe[src*="cal.com"]');
  await expect(calendar).toBeVisible();
  await expect(calendar).toHaveAttribute("title", /Book a call/);
  await expect(page.getByRole("status", { name: "Loading the booking calendar" })).toHaveCount(0);
  await call.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Send a message" })).toBeFocused();
  await expect(page.locator("#connect form")).toBeVisible();
  await expect(page.locator('iframe[src*="cal.com"]')).toBeHidden();
});

test("connect page: a finished booking shows the site's confirmation, then a fresh calendar", async ({
  page,
}) => {
  await page.goto("/connect/");
  const call = page.getByRole("tab", { name: "Book a call" });
  test.skip((await call.count()) === 0, "Build has no NEXT_PUBLIC_CAL_LINK");
  const calendar = page.locator('#connect-panel-call iframe[src*="cal.com"]');
  await expect(calendar).toBeVisible();
  // What Cal.com's frame posts when a booking goes through (pending: the event needs confirmation).
  await page
    .frameLocator('#connect-panel-call iframe[src*="cal.com"]')
    .locator("body")
    .evaluate(() =>
      window.parent.postMessage(
        {
          fullType: "CAL:book:bookingSuccessfulV2",
          data: {
            title: "30 Minute Meeting",
            startTime: "2026-10-27T05:30:00.000Z",
            status: "PENDING",
          },
        },
        "*",
      ),
    );
  const confirmation = page.getByRole("status").filter({ hasText: "Request sent" });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toBeFocused();
  await expect(confirmation).toContainText("30 Minute Meeting");
  await expect(calendar).toHaveCount(0);
  await confirmation.getByRole("button", { name: "Book another time" }).click();
  await expect(page.locator('#connect-panel-call iframe[src*="cal.com"]')).toBeVisible();
});

test("publishes SEO metadata, robots and sitemap", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Mohammed Ali B\. Abdullah/);
  // During client-side navigation the old and new canonical briefly coexist.
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https:\/\/[^/]+\/$/,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(jsonLd!).mainEntity.name).toBe("Mohammed Ali B. Abdullah");
  expect((await request.get("/robots.txt")).status()).toBe(200);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>https://alibacelonia.dev/</loc>");
  expect(sitemap).toContain("<loc>https://alibacelonia.dev/projects/website-portfolio/</loc>");
  expect(sitemap).not.toMatch(/maba/i);
});

test("unknown paths render the 404 page", async ({ request }) => {
  const response = await request.get("/404.html");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("Page not found");
});

test("experience dates stay beside their card while scrolling", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Dates are pinned from the md breakpoint");
  await page.goto("/#role-buzzerboy");
  const card = page.locator("#role-buzzerboy article");
  const dates = page.locator("#role-buzzerboy > div").first();
  const box = (await card.boundingBox())!;
  // Scroll partway through the card: the dates should remain visible within the row.
  await page.mouse.wheel(0, box.height / 2);
  await expect(dates).toBeInViewport();
});

test("project pages use the home page's framed bands and dividers", async ({ page }) => {
  const divider = (id: string) =>
    page.evaluate((el) => getComputedStyle(document.getElementById(el)!, "::before").display, id);
  await page.goto("/projects/estoe/");
  // The first band sits under the dock like the hero, so it has no divider above it.
  await expect(page.locator("#project")).toHaveClass(/section-frame--top/);
  expect(await divider("project")).toBe("none");
  // Overview starts flush against the at-a-glance strip; later bands draw the hatched divider.
  expect(await divider("overview")).toBe("none");
  expect(await divider("solution")).toBe("block");
  expect(await divider("infrastructure")).toBe("block");
  await expect(page.locator("#infrastructure .section-action")).toContainText("Next project");

  await page.goto("/projects/");
  await expect(page.locator("#all-projects")).toHaveClass(/section-frame/);
  await expect(page.locator("#all-projects .section-action")).toContainText(
    "Browse every repository on GitHub",
  );
});

test("all-projects client work card shows its screenshot left of the details, stacked on phones", async ({
  page,
}, testInfo) => {
  test.skip(publishedClientWork.length === 0, "No client work is published");
  await page.goto("/projects/");
  const card = page.getByRole("article", { name: "IronFort" });
  await card.scrollIntoViewIfNeeded();
  const image = (await card.getByRole("img").boundingBox())!;
  const title = (await card.getByRole("heading", { name: "IronFort" }).boundingBox())!;
  if (testInfo.project.name === "desktop") {
    expect(image.x + image.width).toBeLessThanOrEqual(title.x);
  } else {
    expect(image.y + image.height).toBeLessThanOrEqual(title.y);
  }
  await expect(card.getByRole("img")).toHaveJSProperty("complete", true);
});

test("case studies: preview cards 100px apart, with a pinned panel that switches at 25%", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const items = page.locator(".case-item");
  await expect(items).toHaveCount(projects.length + publishedClientWork.length);
  // 100px (6.25rem) between projects at every breakpoint.
  const gaps = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll(".case-item")].map((e) =>
      e.getBoundingClientRect(),
    );
    return boxes.slice(1).map((box, i) => Math.round(box.top - boxes[i]!.bottom));
  });
  for (const gap of gaps) expect(gap).toBe(100);

  if (testInfo.project.name !== "desktop") {
    // Phones: no pinned panel; each image is followed by its own details.
    await expect(page.locator(".case-panel")).toBeHidden();
    const study = page.locator("#case-study-estoe");
    const stage = (await study.locator(".case-stage").boundingBox())!;
    const heading = (await study.getByRole("heading", { name: "estoe" }).boundingBox())!;
    expect(stage.y + stage.height).toBeLessThanOrEqual(heading.y);
    return;
  }

  const active = () =>
    page.evaluate(() =>
      document.querySelector(".case-panel-item[data-active]")?.getAttribute("aria-label"),
    );
  // The panel is as tall as the active details, so its center (not its top) stays put.
  const panelCenter = () =>
    page.evaluate(() => {
      const r = document.querySelector(".case-panel")!.getBoundingClientRect();
      return Math.round(r.top + r.height / 2);
    });
  // Scroll so that `share` of a stage sits in the upper half of the viewport.
  const showShare = (id: string, share: number) =>
    page.evaluate(
      ([selector, s]) => {
        const r = document.querySelector(selector)!.getBoundingClientRect();
        window.scrollBy(0, r.top - (innerHeight / 2 - r.height * s));
      },
      [`#case-study-${id} .case-stage`, share] as const,
    );

  // Details top minus the top of the given project's image (the panel's start and end stops).
  const detailsOffset = (item: string) =>
    page.evaluate((selector) => {
      const details = document.querySelector(".case-panel-item[data-active]")!;
      const card = document.querySelector(selector)!;
      return Math.round(details.getBoundingClientRect().top - card.getBoundingClientRect().top);
    }, item);

  const first = (await page.locator(".case-panel-item").first().getAttribute("aria-label"))!;
  // Before pinning, the first project's details start 40px below the top of its image.
  await page.evaluate(() => {
    document.querySelector(".case-layout")!.scrollIntoView();
    window.scrollBy(0, -150);
  });
  await expect.poll(() => detailsOffset(".case-item:first-child")).toBe(40);
  await showShare("estoe", 0.15);
  await expect.poll(active).not.toBe("estoe");
  const pinned = await panelCenter();
  await showShare("estoe", 0.4);
  await expect.poll(active).toBe("estoe");
  // The panel keeps the same position while scrolling, like the Experience dates.
  await expect.poll(async () => Math.abs((await panelCenter()) - pinned)).toBeLessThanOrEqual(1);
  // While pinned, the visible details sit at the vertical center of the viewport (polled: the
  // newly active panel finishes a short 8px fade-in slide first).
  await expect
    .poll(() =>
      page.evaluate(() => {
        const r = document.querySelector(".case-panel-item[data-active]")!.getBoundingClientRect();
        return Math.abs(r.top + r.height / 2 - innerHeight / 2);
      }),
    )
    .toBeLessThanOrEqual(2);
  // The progress ruler's active tick sits level with the active title, left of it.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const title = document
          .querySelector(".case-panel-item[data-active] [data-case-title]")!
          .getBoundingClientRect();
        const tick = document
          .querySelector(".case-ruler [data-active] span")!
          .getBoundingClientRect();
        if (tick.right > title.left) return Infinity;
        return Math.abs(tick.top + tick.height / 2 - (title.top + title.height / 2));
      }),
    )
    .toBeLessThanOrEqual(2);
  // After the last project, the details stop 40px below the top of its image and scroll away
  // with it.
  const last = (await page.locator(".case-panel-item").last().getAttribute("aria-label"))!;
  for (const top of [120, -80]) {
    await page.evaluate((t) => {
      const card = document.querySelector(".case-item:last-child")!.getBoundingClientRect();
      window.scrollBy(0, card.top - t);
    }, top);
    await expect.poll(active).toBe(last);
    await expect
      .poll(async () => Math.abs((await detailsOffset(".case-item:last-child")) - 40))
      .toBeLessThanOrEqual(1);
  }
  // Scrolling back up hands the panel back.
  await page.evaluate(() => document.querySelector(".case-list")!.scrollIntoView());
  await expect.poll(active).toBe(first);
});

test("certification badges tilt toward the mouse and settle back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Mouse only");
  await page.goto("/");
  const badge = page.locator("#certifications .tilt-badge").first();
  await badge.scrollIntoViewIfNeeded();
  // Smooth scrolling keeps easing after the jump; wait until the badge stops moving, or the
  // pointer lands where the badge was and it slides away again.
  await expect
    .poll(async () => {
      const before = (await badge.boundingBox())!.y;
      await page.waitForTimeout(150);
      return Math.abs((await badge.boundingBox())!.y - before);
    })
    .toBeLessThan(0.5);
  const box = (await badge.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.1, { steps: 3 });
  await expect(badge).toHaveAttribute("data-tilting");
  // Pointer near the top left: the badge leans back on its top edge and toward the left.
  const [tiltX, tiltY] = await badge.evaluate((el) => [
    parseFloat(el.style.getPropertyValue("--tilt-x")),
    parseFloat(el.style.getPropertyValue("--tilt-y")),
  ]);
  expect(tiltX).toBeGreaterThan(8);
  expect(tiltY).toBeLessThan(-8);
  await page.mouse.move(0, 0);
  await expect(badge).not.toHaveAttribute("data-tilting");
});

test("aurora words paint their whole glyphs, descenders included", async ({ page }) => {
  await page.goto("/");
  const words = await page.locator(".aurora-text").evaluateAll((els) =>
    els.map((el) => {
      // The gradient only paints inside the element's box, so it must reach below the text's own
      // line box far enough for descenders (g, j, p).
      const range = document.createRange();
      range.selectNodeContents(el);
      const text = range.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      const em = parseFloat(getComputedStyle(el).fontSize);
      return { word: el.textContent, extra: (box.bottom - text.bottom) / em };
    }),
  );
  expect(words.map((w) => w.word)).toContain("building");
  for (const { word, extra } of words) expect(extra, word ?? "").toBeGreaterThanOrEqual(0.1);
});

test("section titles sit vertically centered in their title band", async ({ page }) => {
  await page.goto("/");
  const gaps = await page.evaluate(() =>
    ["projects", "experience", "skills", "certifications", "connect"].map((id) => {
      const section = document.getElementById(id)!;
      const band = section.querySelector(".section-title-band")!;
      const block = band.firstElementChild!.getBoundingClientRect();
      const divider = getComputedStyle(section, "::before");
      // The band's top line: the divider's lower edge, or the section's top edge when a strip
      // above stands in for the divider.
      const top =
        section.getBoundingClientRect().top +
        (divider.display === "none" ? 0 : parseFloat(divider.height));
      return {
        id,
        above: block.top - top,
        below: band.getBoundingClientRect().bottom - block.bottom,
      };
    }),
  );
  for (const { id, above, below } of gaps)
    expect(Math.abs(above - below), id).toBeLessThanOrEqual(2);
});

test("case screenshots are framed in the second-lightest color of their card's gradient", async ({
  page,
}) => {
  await page.goto("/");
  const studies = buildCaseStudies().filter((study) => study.screenshot);
  expect(studies.length).toBeGreaterThan(0);
  for (const study of studies) {
    const stage = page.locator(`#case-study-${study.id} .case-stage`);
    await stage.scrollIntoViewIfNeeded();
    const { card, color, width, bottom, bottomColor, bottomInside } = await stage.evaluate((el) => {
      const shot = el.querySelector<HTMLElement>(".case-media img")!;
      const img = getComputedStyle(shot);
      return {
        card: getComputedStyle(el).backgroundImage,
        color: img.borderTopColor,
        width: img.borderTopWidth,
        bottom: img.borderBottomWidth,
        bottomColor: img.borderBottomColor,
        // The frame is closed at the bottom, and that edge stays inside the card.
        bottomInside:
          shot.getBoundingClientRect().bottom <= el.getBoundingClientRect().bottom + 0.5,
      };
    });
    const frame = stageFrame(stageGradientFor(study));
    const rgb = [1, 3, 5].map((i) => parseInt(frame.slice(i, i + 2), 16)).join(", ");
    expect(card, study.id).toContain(`rgb(${rgb})`);
    expect(color, study.id).toBe(`rgb(${rgb})`);
    expect(width, study.id).toBe("2px");
    // The bottom edge keeps its width but only shows on hover.
    expect(bottom, study.id).toBe("2px");
    expect(bottomColor, study.id).toBe("rgba(0, 0, 0, 0)");
    expect(bottomInside, study.id).toBe(true);
  }
});

test("case screenshots tip back in perspective on desktop hover", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Hover effect is desktop only");
  await page.goto("/");
  const stage = page.locator(".case-stage:has(.case-media img)").first();
  await stage.scrollIntoViewIfNeeded();
  const shot = stage.locator(".case-media img");
  await page.mouse.move(0, 0);
  await expect.poll(() => shot.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  expect(await shot.evaluate((el) => getComputedStyle(el).translate)).toBe("0px 20px");
  await stage.hover();
  await expect
    .poll(() => shot.evaluate((el) => getComputedStyle(el).transform))
    .toMatch(/^matrix3d/);
  // The frame closes at the bottom only while hovered, in the same color as the other sides.
  await expect
    .poll(() =>
      shot.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.borderBottomColor === style.borderTopColor;
      }),
    )
    .toBe(true);
});

test("case cards are dimmed until hovered (background only), for a mouse only", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const stage = page.locator(".case-stage").first();
  const veil = () => stage.evaluate((el) => getComputedStyle(el, "::before"));
  if (testInfo.project.name === "mobile") {
    // Touch screens have no hover, so cards are never dimmed there.
    expect((await veil()).content).toBe("none");
    return;
  }
  await stage.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect.poll(async () => (await veil()).opacity).toBe("1");
  expect((await veil()).backgroundColor).toBe("rgba(0, 0, 0, 0.3)");
  // The overlay sits under the tagline and the screenshot, so the image is never darkened.
  const layers = await stage.evaluate((el) => ({
    veil: Number(getComputedStyle(el, "::before").zIndex),
    content: [...el.children].map((child) => Number(getComputedStyle(child).zIndex)),
  }));
  for (const z of layers.content) expect(z).toBeGreaterThan(layers.veil);
  await stage.hover();
  await expect.poll(async () => (await veil()).opacity).toBe("0");
});

test("project cards show the custom cursor for a mouse only", async ({ page }, testInfo) => {
  await page.goto("/");
  const cursor = page.locator(".project-cursor");
  await expect(cursor).toHaveAttribute("aria-hidden", "true");
  const stage = page.locator(".case-stage").first();
  await stage.scrollIntoViewIfNeeded();

  if (testInfo.project.name !== "desktop") {
    // Touch devices keep the native behavior: the native cursor is never hidden and the disc
    // never shows (a tap would open the card's link, so none is made).
    await expect(page.locator("html")).not.toHaveAttribute("data-project-cursor", "");
    await expect(cursor).not.toHaveAttribute("data-visible", "");
    return;
  }

  await expect(page.locator("html")).toHaveAttribute("data-project-cursor", "");
  expect(await stage.evaluate((el) => getComputedStyle(el).cursor)).toBe("none");
  const box = (await stage.boundingBox())!;
  const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(target.x - 80, target.y - 60);
  await page.mouse.move(target.x, target.y, { steps: 6 });
  await expect(cursor).toHaveAttribute("data-visible", "");
  // It settles centered on the pointer.
  await expect
    .poll(async () => {
      const r = (await cursor.boundingBox())!;
      return Math.round(Math.hypot(r.x + r.width / 2 - target.x, r.y + r.height / 2 - target.y));
    })
    .toBeLessThanOrEqual(1);
  // Leaving the card restores the native cursor.
  await page.mouse.move(box.x + box.width + 120, target.y, { steps: 3 });
  await expect(cursor).not.toHaveAttribute("data-visible", "");
});
