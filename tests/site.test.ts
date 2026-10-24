import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  normalizeApiUrl,
  normalizeCalLink,
  normalizeDockStyle,
  normalizeSiteUrl,
  site,
  siteHost,
} from "@/lib/site";
import { dockProps } from "@/lib/dock";
import { LOGO_PATH } from "@/lib/brand";
import { buildPersonJsonLd } from "@/lib/structured-data";

describe("normalizeSiteUrl", () => {
  it("defaults to the current domain", () => {
    expect(normalizeSiteUrl(undefined)).toBe("https://alibacelonia.dev");
    expect(normalizeSiteUrl("  ")).toBe("https://alibacelonia.dev");
  });

  it("keeps only the origin", () => {
    expect(normalizeSiteUrl("https://alibacelonia.dev/")).toBe("https://alibacelonia.dev");
    expect(normalizeSiteUrl("https://preview.example.com/path?q=1")).toBe(
      "https://preview.example.com",
    );
  });

  it("rejects insecure or invalid URLs, except http on localhost", () => {
    expect(normalizeSiteUrl("http://alibacelonia.dev")).toBe("https://alibacelonia.dev");
    expect(normalizeSiteUrl("not a url")).toBe("https://alibacelonia.dev");
    expect(normalizeSiteUrl("http://localhost:4173")).toBe("http://localhost:4173");
  });
});

describe("structured data", () => {
  it("describes the person and cannot break out of its script tag", () => {
    const json = buildPersonJsonLd();
    expect(json).not.toContain("<");
    const data = JSON.parse(json);
    expect(data.mainEntity.name).toBe("Mohammed Ali B. Abdullah");
    expect(data.mainEntity.sameAs).toContain("https://github.com/alibacelonia");
    expect(data.mainEntity.hasCredential).toHaveLength(3);
  });
});

describe("canonical domain", () => {
  it("uses alibacelonia.dev as the single configured origin by default", () => {
    expect(site.url).toBe("https://alibacelonia.dev");
    expect(siteHost).toBe("alibacelonia.dev");
  });
});

describe("brand", () => {
  it("uses the same A/B mark in the favicon and the header logo", () => {
    expect(site.brand).toBe("A/B");
    const icon = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");
    expect(icon).toContain(`d="${LOGO_PATH}"`);
  });
});

describe("contact settings", () => {
  it("accepts only https API URLs (or localhost)", () => {
    expect(normalizeApiUrl("https://x.execute-api.ap-southeast-1.amazonaws.com/contact")).toMatch(
      /^https:/,
    );
    expect(normalizeApiUrl("http://localhost:3001/contact")).toBe("http://localhost:3001/contact");
    expect(normalizeApiUrl("http://example.com")).toBeNull();
    expect(normalizeApiUrl("")).toBeNull();
  });

  it("normalizes Cal.com links to user/event", () => {
    expect(normalizeCalLink("https://cal.com/alibacelonia/30min/")).toBe("alibacelonia/30min");
    expect(normalizeCalLink("alibacelonia")).toBe("alibacelonia");
    expect(normalizeCalLink("javascript:alert(1)")).toBeNull();
    expect(normalizeCalLink(undefined)).toBeNull();
  });
});

describe("dock style", () => {
  it("accepts clay, glass and neo, case-insensitively, and falls back to clay", () => {
    expect(normalizeDockStyle("glass")).toBe("glass");
    expect(normalizeDockStyle(" NEO ")).toBe("neo");
    expect(normalizeDockStyle("clay")).toBe("clay");
    expect(normalizeDockStyle("frosted")).toBe("clay");
    expect(normalizeDockStyle(undefined)).toBe("clay");
  });

  it("gives the dock class, the chosen style and the caller's classes", () => {
    expect(dockProps("rounded-full", "neo")).toEqual({
      "data-dock": "neo",
      className: "dock rounded-full",
    });
  });
});
