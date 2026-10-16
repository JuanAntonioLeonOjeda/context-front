import { afterEach, describe, expect, it, vi } from "vitest";

import { applyTheme, nextTheme, readTheme, storeTheme, THEME_KEY } from "./theme";

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockSystemDark(isDark: boolean): void {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: isDark, media: query }));
}

describe("nextTheme", () => {
  it("switches between light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});

describe("the stored theme", () => {
  it("is the system's theme when nothing is stored, or something unknown is", () => {
    mockSystemDark(true);
    expect(readTheme()).toBe("dark");
    window.localStorage.setItem(THEME_KEY, "sepia");
    expect(readTheme()).toBe("dark");
    mockSystemDark(false);
    expect(readTheme()).toBe("light");
  });

  it("remembers the choice over the system's theme", () => {
    mockSystemDark(true);
    storeTheme("light");
    expect(readTheme()).toBe("light");
  });

  it("does not fail when the browser blocks storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(readTheme()).toBe("light");
    expect(() => {
      storeTheme("dark");
    }).not.toThrow();
  });
});

describe("applyTheme", () => {
  it("sets data-theme", () => {
    applyTheme("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    applyTheme("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
