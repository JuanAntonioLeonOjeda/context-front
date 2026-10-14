import { afterEach, describe, expect, it, vi } from "vitest";

import { applyTheme, nextTheme, readTheme, storeTheme, THEME_KEY } from "./theme";

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  vi.restoreAllMocks();
});

describe("nextTheme", () => {
  it("goes system, light, dark and back to system", () => {
    expect(nextTheme("system")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
  });
});

describe("the stored theme", () => {
  it("is system when nothing is stored, or something unknown is", () => {
    expect(readTheme()).toBe("system");
    window.localStorage.setItem(THEME_KEY, "sepia");
    expect(readTheme()).toBe("system");
  });

  it("remembers light and dark, and forgets the choice when it goes back to system", () => {
    storeTheme("dark");
    expect(readTheme()).toBe("dark");
    storeTheme("system");
    expect(window.localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("does not fail when the browser blocks storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(readTheme()).toBe("system");
    expect(() => {
      storeTheme("dark");
    }).not.toThrow();
  });
});

describe("applyTheme", () => {
  it("sets data-theme for light and dark, and removes it for the system", () => {
    applyTheme("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    applyTheme("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    applyTheme("system");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });
});
