import { useRef } from "react";
import { Outlet } from "react-router";

import { HealthStatus } from "@/features/health";
import { es } from "@/i18n/es";

import styles from "./RootLayout.module.css";

/** Frame of every page: skip link, banner and the `main` landmark that holds the route. */
export function RootLayout(): React.JSX.Element {
  const main = useRef<HTMLElement>(null);

  return (
    <div className={styles.page}>
      {/* Focus is moved by code: following a #fragment does not reliably focus its target
          in every browser (Safari) or in jsdom. The href stays for when scripts do not run. */}
      <a
        className={styles.skip}
        href="#contenido"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        {es.app.shell.skipToContent}
      </a>
      <header className={styles.header}>
        <p className={styles.name}>{es.app.shell.name}</p>
      </header>
      <main id="contenido" ref={main} className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <HealthStatus />
      </footer>
    </div>
  );
}
