import { ExternalLink, REPOSITORIES } from "@/features/shell";
import { es } from "@/i18n/es";

import styles from "./AboutPage.module.css";

function Section(props: {
  id: string;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section aria-labelledby={props.id} className={styles.section}>
      <h2 id={props.id}>{props.title}</h2>
      {props.children}
    </section>
  );
}

function List({ items }: { items: readonly string[] }): React.JSX.Element {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** How the portal decides what it shows, where the data comes from and what it cannot do yet. */
export function AboutPage(): React.JSX.Element {
  const { about } = es;
  return (
    <article className={styles.page}>
      <title>{`${about.page.title} · ${es.app.shell.name}`}</title>
      <h1 className={styles.title}>{about.page.title}</h1>
      <p className={styles.lead}>{about.page.intro}</p>

      <Section id="about-data" title={about.data.title}>
        <List items={about.data.items} />
      </Section>

      <Section id="about-published" title={about.published.title}>
        <p>{about.published.text}</p>
      </Section>

      <Section id="about-neutrality" title={about.neutrality.title}>
        <List items={about.neutrality.items} />
      </Section>

      <Section id="about-limits" title={about.limits.title}>
        <List items={about.limits.items} />
      </Section>

      <Section id="about-project" title={about.project.title}>
        <p>{about.project.text}</p>
        <ul className={styles.list}>
          <li>
            <ExternalLink href={REPOSITORIES.back}>{about.project.back}</ExternalLink>
          </li>
          <li>
            <ExternalLink href={REPOSITORIES.front}>{about.project.front}</ExternalLink>
          </li>
        </ul>
      </Section>
    </article>
  );
}
