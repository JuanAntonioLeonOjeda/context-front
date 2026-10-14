import { Link, NavLink } from "react-router";

import { es } from "@/i18n/es";

import { ThemeToggle } from "./ThemeToggle";

import styles from "./Shell.module.css";

/** The brand: nine small squares, the unit the party panel counts communities with. */
function BrandMark(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${String(row)}${String(col)}`}
            x={col * 8.5 + 0.5}
            y={row * 8.5 + 0.5}
            width="6.5"
            height="6.5"
            rx="1.6"
          />
        )),
      )}
    </svg>
  );
}

/** Sticky header: the brand, the two places of the site and the theme button. */
export function SiteHeader(): React.JSX.Element {
  const { shell } = es.app;
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/" className={styles.brand} aria-label={`${shell.name}: ${shell.nav.map}`}>
          <BrandMark />
          <span className={styles.brandName}>{shell.name}</span>
        </Link>
        <nav aria-label={shell.nav.label} className={styles.nav}>
          <NavLink to="/" end>
            {shell.nav.map}
          </NavLink>
          <NavLink to="/como-funciona">{shell.nav.about}</NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
