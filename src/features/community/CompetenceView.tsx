import { Link } from "react-router";

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { CompetenceLine } from "./competence-line";

import styles from "./CommunityCard.module.css";

/** "Competencia: Consejería de Sanidad · Ministerio de Sanidad", each body a link to its chart. */
export function CompetenceView(props: {
  line: CompetenceLine;
  headline: string;
}): React.JSX.Element {
  return (
    <div className={styles.competence}>
      <span className={styles.competenceLabel}>{props.line.label}</span>
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics, and the list's name with them, of a list styled without markers (WCAG 1.3.1) */}
      <ul
        role="list"
        aria-label={formatMessage(es.community.news.competence.listOf, {
          headline: props.headline,
        })}
      >
        {props.line.bodies.map((body) => (
          <li key={body.key}>
            <Link to={body.href}>{body.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
