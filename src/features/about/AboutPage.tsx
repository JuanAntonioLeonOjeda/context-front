import { es } from "@/i18n/es";

import styles from "./AboutPage.module.css";

const BACK_REPOSITORY = "https://github.com/JuanAntonioLeonOjeda/context-back";
const FRONT_REPOSITORY = "https://github.com/JuanAntonioLeonOjeda/context-front";

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

      <Section id="about-responsible" title={about.responsible.title}>
        <ol className={styles.list}>
          {about.responsible.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <h3>{about.responsible.reasonsTitle}</h3>
        <List items={about.responsible.reasons} />
        <h3>{about.responsible.confidenceTitle}</h3>
        <dl className={styles.terms}>
          {about.responsible.confidence.map(([word, meaning]) => (
            <div key={word}>
              <dt>{word}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </Section>

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
            <a href={BACK_REPOSITORY}>{about.project.back}</a>
          </li>
          <li>
            <a href={FRONT_REPOSITORY}>{about.project.front}</a>
          </li>
        </ul>
      </Section>
    </article>
  );
}
