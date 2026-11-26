import { ExternalLink, InfoButton } from "@/features/shell";
import { es } from "@/i18n/es";

import { emptyText, methodText, relatedDays } from "./related-news";
import { useRelatedNews } from "./useRelatedNews";

import styles from "./RelatedNewsView.module.css";

/**
 * The news before one news item that are most alike in text, day by day, newest first. Each item
 * says how alike it is; the "i" window says how they are found and that alike is not cause. Nothing is ranked by outlet.
 */
export function RelatedNewsView({ articleId }: { articleId: number }): React.JSX.Element {
  const related = useRelatedNews(articleId);
  const texts = es.stories.related;
  if (related.state === "loading") return <p role="status">{texts.loading}</p>;
  if (related.state === "error") {
    return (
      <div role="alert">
        <p>{texts.error}</p>
        <button type="button" onClick={related.retry}>
          {texts.retry}
        </button>
      </div>
    );
  }
  const { days, windowDays, maxDays } = related.related;
  return (
    <div className={styles.related}>
      <div className={styles.titleRow}>
        <h4 className={styles.title}>{texts.title}</h4>
        <InfoButton topic={texts.title}>
          <p>{methodText(maxDays)}</p>
        </InfoButton>
      </div>
      {days.length === 0 ? (
        <p>{emptyText(windowDays)}</p>
      ) : (
        relatedDays(days).map((day) => (
          <section key={day.day} aria-labelledby={`related-${String(articleId)}-${day.day}`}>
            <h5 id={`related-${String(articleId)}-${day.day}`} className={styles.day}>
              {day.label}
            </h5>
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers (WCAG 1.3.1) */}
            <ul role="list" className={styles.items}>
              {day.items.map((item) => (
                <li key={item.key}>
                  <small className={styles.meta}>
                    {item.outlet} · {item.similarity}
                  </small>
                  <ExternalLink href={item.url}>{item.headline}</ExternalLink>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
