import { useState } from "react";

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import { applyTheme, nextTheme, readTheme, storeTheme, type ThemeChoice } from "./theme";

import styles from "./Shell.module.css";

const ICONS: Record<ThemeChoice, React.JSX.Element> = {
  // A circle half filled: the theme follows the system.
  system: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 4a8 8 0 0 0 0 16Z" />
    </>
  ),
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  dark: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />,
};

/**
 * One button that goes through system, light and dark. Its name says the current choice and
 * what the next press does, so it is not a mystery icon; the icon only repeats it.
 */
export function ThemeToggle(): React.JSX.Element {
  const [choice, setChoice] = useState<ThemeChoice>(readTheme);
  const next = nextTheme(choice);
  const { theme } = es.app.shell;

  return (
    <button
      type="button"
      className={styles.themeButton}
      aria-label={formatMessage(theme.label, { current: theme[choice], next: theme[next] })}
      title={formatMessage(theme.label, { current: theme[choice], next: theme[next] })}
      onClick={() => {
        setChoice(next);
        applyTheme(next);
        storeTheme(next);
      }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        {ICONS[choice]}
      </svg>
    </button>
  );
}
