import { expect, test, type Page } from "@playwright/test";
import { THEME_STORAGE_KEY } from "../src/lib/theme";

const SECTIONS = ["home", "projects", "experience", "skills", "certifications", "contact"];
const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

test("renders the six sections in order with a single h1", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  const ids = await page.locator("main > section").evaluateAll((els) => els.map((el) => el.id));
  expect(ids).toEqual(SECTIONS);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Mohammed Ali B. Abdullah");
  await expect(page.getByText("Full-Stack Developer")).toBeVisible();
  expect(errors).toEqual([]);
});

test("hydrates cleanly with reduced motion and keeps the theme", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", colorScheme: "dark" });
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
    await menu.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
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
  await trigger.click();
  const menu = page.getByRole("navigation", { name: "Sections" });
  await expect(menu.getByRole("link", { name: "Skills" })).toBeFocused();
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

test("keeps the navigation visible and clear of section headings", async ({ page }, testInfo) => {
  await page.goto("/");
  const bar = page.getByRole("banner");
  for (const id of ["projects", "skills", "contact"]) {
    if (testInfo.project.name === "desktop") {
      await page
        .getByRole("navigation", { name: "Sections" })
        .getByRole("link", {
          name: id[0]!.toUpperCase() + id.slice(1),
        })
        .click();
    } else {
      await page.getByRole("button", { name: /Open menu$/ }).click();
      await page
        .getByRole("navigation", { name: "Sections" })
        .getByRole("link", {
          name: id[0]!.toUpperCase() + id.slice(1),
        })
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

test("project cards open static detail pages and lead back", async ({ page }) => {
  await page.goto("/#projects");
  await expect(page.getByRole("heading", { name: "Website Portfolio" })).toBeVisible();
  await page.getByRole("link", { name: "View details about estoe" }).click();
  await expect(page).toHaveURL(/\/projects\/estoe\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("estoe");
  await expect(
    page.getByRole("heading", { level: 2, name: "Infrastructure & architecture" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://alibacelonia.dev/projects/estoe/",
  );
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
}) => {
  await page.goto("/#projects");
  await page.getByRole("link", { name: "View all projects" }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("All projects");
  await expect(page.locator("main article")).toHaveCount(4);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://alibacelonia.dev/projects/",
  );
  await page.getByRole("link", { name: "View details about estoe" }).click();
  await expect(page).toHaveURL(/\/projects\/estoe\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects\/$/);
  const card = page.getByRole("article", { name: "estoe" });
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Back to portfolio" }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.locator("#projects header[data-reveal]")).toHaveCSS("opacity", "1");
});

test("uses dark mode only even with a saved light preference", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
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

test("contact form validates with the keyboard", async ({ page }) => {
  await page.goto("/#contact");
  const form = page.locator("#contact form");
  await form.getByRole("button", { name: /send message|open email app/i }).click();
  await expect(form.getByLabel(/^Name/)).toBeFocused();
  await expect(form.getByLabel(/^Name/)).toHaveAttribute("aria-invalid", "true");
  await form.getByLabel(/^Email/).fill("not-an-email");
  await form.getByLabel(/^Email/).press("Tab");
  await expect(page.getByText(/valid email address/)).toBeVisible();
});

test("publishes SEO metadata, robots and sitemap", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Mohammed Ali B\. Abdullah/);
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
