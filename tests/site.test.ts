import { normalizeFormId, normalizeSiteUrl } from "@/lib/site";
import { buildPersonJsonLd } from "@/lib/structured-data";

describe("normalizeSiteUrl", () => {
  it("defaults to the current domain", () => {
    expect(normalizeSiteUrl(undefined)).toBe("https://alibacelonia.dev");
    expect(normalizeSiteUrl("  ")).toBe("https://alibacelonia.dev");
  });

  it("keeps only the origin", () => {
    expect(normalizeSiteUrl("https://maba.dev/")).toBe("https://maba.dev");
    expect(normalizeSiteUrl("https://maba.dev/path?q=1")).toBe("https://maba.dev");
  });

  it("rejects insecure or invalid URLs, except http on localhost", () => {
    expect(normalizeSiteUrl("http://maba.dev")).toBe("https://alibacelonia.dev");
    expect(normalizeSiteUrl("not a url")).toBe("https://alibacelonia.dev");
    expect(normalizeSiteUrl("http://localhost:4173")).toBe("http://localhost:4173");
  });
});

describe("normalizeFormId", () => {
  it("accepts plain Formspree IDs only", () => {
    expect(normalizeFormId("xyzabcde")).toBe("xyzabcde");
    expect(normalizeFormId("")).toBeNull();
    expect(normalizeFormId(undefined)).toBeNull();
    expect(normalizeFormId("../evil")).toBeNull();
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
