import { Link } from "react-router";

import { HealthStatus } from "@/features/health";
import { es } from "@/i18n/es";

import styles from "./Shell.module.css";

const BACK_REPOSITORY = "https://github.com/JuanAntonioLeonOjeda/context-back";
const FRONT_REPOSITORY = "https://github.com/JuanAntonioLeonOjeda/context-front";

/** Where the data comes from, what it can and cannot do, and who made it. Facts, no slogans. */
export function SiteFooter(): React.JSX.Element {
  const { footer } = es.app;
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <section aria-labelledby="footer-sources" className={styles.footerColumn}>
          <h2 id="footer-sources">{footer.sources.title}</h2>
          <ul>
            {footer.sources.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="footer-method" className={styles.footerColumn}>
          <h2 id="footer-method">{footer.method.title}</h2>
          <ul>
            {footer.method.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            <Link to="/como-funciona">{footer.method.link}</Link>
          </p>
        </section>
        <section aria-labelledby="footer-project" className={styles.footerColumn}>
          <h2 id="footer-project">{footer.project.title}</h2>
          <p>{footer.project.about}</p>
          <ul>
            <li>
              <a href={BACK_REPOSITORY}>{footer.project.back}</a>
            </li>
            <li>
              <a href={FRONT_REPOSITORY}>{footer.project.front}</a>
            </li>
          </ul>
        </section>
      </div>
      <div className={styles.footerBase}>
        <HealthStatus />
      </div>
    </footer>
  );
}
