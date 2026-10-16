import { Link, useSearchParams } from "react-router";

import { ExternalLink } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import { searchWith } from "./search-params";
import { groupByDay, newsRows, type NewsRow } from "./news-card";
import { SECTORS, type Sector } from "./news-api";
import { useCommunityNews } from "./useCommunityNews";

import styles from "./CommunityCard.module.css";

const DEFAULT_SECTOR: Sector = SECTORS[0];

/** The sector of `?sector=`; anything else (or nothing) is the first one, the same for everyone. */
function sectorOf(value: string | null): Sector {
  return SECTORS.find((s) => s === value) ?? DEFAULT_SECTOR;
}

/** The latest news of the community in one sector: outlet, time, headline and link. */
export function NewsSection({ territoryId }: { territoryId: string }): React.JSX.Element {
  const [params] = useSearchParams();
  const sector = sectorOf(params.get("sector"));
  const news = useCommunityNews(territoryId, sector);
  const sectorName = es.community.news.sectors[sector];

  return (
    <section aria-labelledby="news-title" className={styles.section}>
      <h2 id="news-title">{es.community.news.title}</h2>
      <nav aria-label={es.community.news.sectorNav}>
        <ul className={styles.sectors}>
          {SECTORS.map((s) => (
            <li key={s}>
              <Link
                to={{ search: searchWith(params, { sector: s }) }}
                preventScrollReset
                aria-current={s === sector ? "page" : undefined}
              >
                {es.community.news.sectors[s]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className={styles.newsNote}>{es.community.news.method}</p>
      {news.state === "error" && (
        <div role="alert">
          <p>{es.community.news.error}</p>
          <button type="button" onClick={news.retry}>
            {es.community.news.retry}
          </button>
        </div>
      )}
      {news.state === "loading" && <p role="status">{es.community.news.loading}</p>}
      {news.state === "ready" && (
        <>
          <p className={styles.newsNote}>
            {formatMessage(es.community.news.window, { date: formatLongDate(news.news.since) })}
          </p>
          {news.news.items.length === 0 ? (
            <p>{formatMessage(es.community.news.empty, { sector: sectorName.toLowerCase() })}</p>
          ) : (
            <div className={styles.timeline}>
              {groupByDay(newsRows(news.news.items)).map((day) => (
                <section key={day.day} aria-labelledby={`news-day-${day.day}`}>
                  <h3 id={`news-day-${day.day}`} className={styles.newsDay}>
                    {day.label}
                  </h3>
                  <ol className={styles.news}>
                    {day.rows.map((row) => (
                      <NewsItemView key={row.key} row={row} />
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function NewsItemView({ row }: { row: NewsRow }): React.JSX.Element {
  return (
    <li className={styles.newsItem}>
      <ExternalLink href={row.url}>{row.headline}</ExternalLink>
      <small className={styles.downloaded}>{row.outlet}</small>
    </li>
  );
}
