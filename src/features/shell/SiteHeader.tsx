import { Link, NavLink } from "react-router";

import { es } from "@/i18n/es";

import { ThemeToggle } from "./ThemeToggle";

import styles from "./Shell.module.css";

/** The brand: a newspaper, the thing the app puts in context. */
function BrandMark(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4 3.5h13a1.5 1.5 0 0 1 1.5 1.5v3H21a1 1 0 0 1 1 1V18a2.5 2.5 0 0 1-2.5 2.5H6A3.5 3.5 0 0 1 2.5 17V5A1.5 1.5 0 0 1 4 3.5Zm1.5 2.5v3h10V6Zm0 5v1.5h5V11Zm6.5 0v1.5h3.5V11Zm-6.5 3.5V16h5v-1.5Zm6.5 0V16h3.5v-1.5ZM18.5 10.5V17a1 1 0 0 0 2 0v-6.5Z"
      />
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
