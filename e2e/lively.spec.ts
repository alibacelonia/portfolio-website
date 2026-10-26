import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { projects } from "../src/data/projects";
import { publishedClientWork } from "../src/data/clientWork";
import { THEME_STORAGE_KEY } from "../src/lib/theme";

const entries = [...publishedClientWork, ...projects];

for (const theme of ["light", "dark"] as const) {
  test(`project filters preserve navigation and keyboard access in ${theme} mode`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    // The site ignores the device setting (dark by default), so choose the theme explicitly.
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: THEME_STORAGE_KEY,
      value: theme,
    });
    await page.goto("/projects/");
    const filters = page.getByRole("group", { name: "Filter projects by discipline" });
    await expect(page.locator("#all-projects article:visible")).toHaveCount(entries.length);
    const ai = filters.getByRole("button", { name: /^AI Engineering/ });
    await ai.focus();
    await page.keyboard.press("Space");
    await expect(ai).toHaveAttribute("aria-pressed", "true");
    await expect(ai).toBeFocused();
    const aiCount = entries.filter(({ discipline }) => discipline === "ai").length;
    await expect(page.locator("#all-projects article:visible")).toHaveCount(aiCount);
    await expect(page.getByRole("status")).toHaveText(`${aiCount} projects in AI Engineering`);
    await expect(page.getByRole("heading", { name: "Professional work" })).not.toBeVisible();
    const scan = await new AxeBuilder({ page })
      .include("#all-projects")
      .withTags(["wcag2aa", "wcag21aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await page
      .locator("#all-projects")
      .screenshot({ path: testInfo.outputPath(`filtered-projects-${theme}.png`) });
    await filters.getByRole("button", { name: /^DevOps/ }).click();
    await expect(page.locator("#all-projects article:visible")).toHaveCount(
      entries.filter(({ discipline }) => discipline === "devops").length,
    );
    await filters.getByRole("button", { name: /^All / }).click();
    await expect(page.locator("#all-projects article:visible")).toHaveCount(entries.length);
    await page
      .getByRole("link", { name: /^View details/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects\/[^/]+\/$/);
    await page.getByRole("link", { name: "All projects", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.locator("#all-projects article:visible")).toHaveCount(entries.length);
  });

  test(`skill references work with touch and keyboard in ${theme} mode`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    // The site ignores the device setting (dark by default), so choose the theme explicitly.
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: THEME_STORAGE_KEY,
      value: theme,
    });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath(`hero-${theme}.png`) });
    const skills = page.locator("#skills");
    const python = skills.locator("summary").filter({ hasText: /^Python$/ });
    await python.focus();
    await page.keyboard.press("Enter");
    const pythonDetails = python.locator("..");
    await expect(pythonDetails).toHaveAttribute("open", "");
    await expect(
      pythonDetails.getByRole("link", { name: "cloud-incident-service", exact: true }),
    ).toHaveAttribute("href", "/projects/cloud-incident-service/");
    const fastApi = skills.locator("summary").filter({ hasText: /^FastAPI$/ });
    await fastApi.click();
    await expect(fastApi.locator("..")).toHaveAttribute("open", "");
    await expect(pythonDetails).not.toHaveAttribute("open");
    const results = await new AxeBuilder({ page })
      .include("#skills")
      .withTags(["wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await skills.screenshot({ path: testInfo.outputPath(`skills-${theme}.png`) });
    await page.setViewportSize({ width: 320, height: 850 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0);
  });
}

test("project content and skill disclosures remain usable without JavaScript", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({ ...testInfo.project.use, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/projects/");
  await expect(
    page.getByRole("group", { name: "Filter projects by discipline" }),
  ).not.toBeVisible();
  await expect(page.locator("#all-projects article:visible")).toHaveCount(entries.length);
  await page.goto("/");
  // Without JavaScript nothing is folded, on phones either.
  await expect(page.locator("#skills .skill-group-extra").first()).toBeVisible();
  await expect(page.locator("#skills .skill-more").first()).toBeHidden();
  const python = page.locator("#skills summary").filter({ hasText: /^Python$/ });
  await python.click();
  await expect(python.locator("..")).toHaveAttribute("open", "");
  await expect(
    python.locator("..").getByRole("link", { name: "cloud-incident-service", exact: true }),
  ).toBeVisible();
  await context.close();
});
