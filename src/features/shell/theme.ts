/**
 * The colour theme the reader chose: follow the system (the default), light or dark. The
 * choice lives in the browser only (`localStorage`, which may be blocked: then it is simply
 * not remembered) and is applied as `data-theme` on the root, which tokens.css understands.
 * `index.html` applies it before the first paint, so a dark choice does not flash light.
 */
export type ThemeChoice = "system" | "light" | "dark";

export const THEME_KEY = "contexto-tema";
export const THEME_ORDER: readonly ThemeChoice[] = ["system", "light", "dark"];

export function nextTheme(current: ThemeChoice): ThemeChoice {
  const index = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(index + 1) % THEME_ORDER.length] ?? "system";
}

/** The stored choice; anything else, or storage that throws, is "system". */
export function readTheme(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function storeTheme(choice: ThemeChoice): void {
  try {
    if (choice === "system") window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Blocked storage (private window, site data off): the choice lasts until the page closes.
  }
}

export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
}
