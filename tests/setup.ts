import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

/** Media queries that tests can switch on, e.g. mediaState.matches.add("(prefers-reduced-motion: reduce)"). */
export const mediaState = { matches: new Set<string>() };

beforeEach(() => {
  mediaState.matches.clear();
  document.documentElement.removeAttribute("data-theme");
  window.localStorage.clear();

  window.matchMedia = vi.fn((query: string) => ({
    matches: mediaState.matches.has(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;

  window.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;

  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => cleanup());
