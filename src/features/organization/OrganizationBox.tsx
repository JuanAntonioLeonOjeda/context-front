import { ExternalLink } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { BoxView } from "./organization-view";

import styles from "./Organization.module.css";

/**
 * One body: its official name, who holds its head post (only the head of an executive and a
 * department have a holder) and, folded, what the law gives it, each with its source. No colour
 * says anything; each source link says which fact it is the source of.
 */
export function OrganizationBox({ box }: { box: BoxView }): React.JSX.Element {
  const { box: text } = es.organization;
  return (
    <div className={styles.box}>
      <div className={styles.boxHeader}>
        <h3 className={styles.boxName}>{box.name}</h3>
        <ExternalLink
          href={box.sourceUrl}
          className={styles.meta}
          aria-label={formatMessage(text.sourceOf, { what: box.name })}
        >
          {text.source}
        </ExternalLink>
      </div>
      {box.holder !== null && (
        <p className={styles.holder}>
          <span>{box.holder.title}:</span>
          <strong>{box.holder.name}</strong>
          <span className={styles.meta}>{box.holder.since}</span>
          <ExternalLink
            href={box.holder.sourceUrl}
            aria-label={formatMessage(text.sourceOf, { what: box.holder.name })}
          >
            {text.source}
          </ExternalLink>
        </p>
      )}
      {box.competences.length === 0 ? (
        <p className={styles.note}>{box.competencesLabel}</p>
      ) : (
        <details className={styles.competences}>
          <summary>{box.competencesLabel}</summary>
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers (WCAG 1.3.1) */}
          <ul role="list" className={styles.competenceList}>
            {box.competences.map((competence) => (
              <li key={`${competence.legalBasis}|${competence.summary}`}>
                <p>{competence.summary}</p>
                <p className={styles.meta}>
                  {text.legalBasis}: {competence.legalBasis} · {text.sectors}: {competence.sectors}{" "}
                  ·{" "}
                  <ExternalLink
                    href={competence.sourceUrl}
                    aria-label={formatMessage(text.sourceOf, { what: competence.legalBasis })}
                  >
                    {text.source}
                  </ExternalLink>
                </p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
