/**
 * The colour theme of the page: light or dark. Until the reader presses the button it is the
 * one the system prefers; from then on their choice lives in the browser only
 * (`localStorage`, which may be blocked: then it is simply not remembered) and is applied as
 * `data-theme` on the root, which tokens.css understands. `index.html` applies a stored choice
 * before the first paint, so a dark choice does not flash light.
 */
export type ThemeChoice = "light" | "dark";

export const THEME_KEY = "contexto-tema";

export function nextTheme(current: ThemeChoice): ThemeChoice {
  return current === "light" ? "dark" : "light";
}

/** The theme the system prefers; light where the browser cannot say (tests, old browsers). */
function systemTheme(): ThemeChoice {
  if (typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** The stored choice; anything else, or storage that throws, is the system's theme. */
export function readTheme(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : systemTheme();
  } catch {
    return systemTheme();
  }
}

export function storeTheme(choice: ThemeChoice): void {
  try {
    window.localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Blocked storage (private window, site data off): the choice lasts until the page closes.
  }
}

export function applyTheme(choice: ThemeChoice): void {
  document.documentElement.setAttribute("data-theme", choice);
}
