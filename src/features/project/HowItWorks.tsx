import { ExternalLink, REPOSITORIES } from "@/features/shell";
import { es } from "@/i18n/es";

import { Section } from "./Section";
import styles from "./ProjectPage.module.css";

function List({ items }: { items: readonly string[] }): React.JSX.Element {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Chapter 1: where the data comes from, what is published, neutrality and the limits. */
export function HowItWorks(): React.JSX.Element {
  const { about } = es;
  return (
    <>
      <p>{about.page.intro}</p>

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
    </>
  );
}
