import { Link, useSearchParams } from "react-router";

import { ExternalLink } from "@/features/shell";
import { treePath } from "@/features/stories";
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import { Carousel } from "./Carousel";
import { searchWith } from "./search-params";
import { groupByDay, newsRows, withTree, type NewsRow } from "./news-card";
import { SourceIcon, TreeIcon } from "./icons";
import { SECTORS, type Sector } from "./news-api";
import { useCommunityNews } from "./useCommunityNews";

import styles from "./CommunityCard.module.css";

const DEFAULT_SECTOR: Sector = SECTORS[0];
const TREE_ONLY_PARAM = "arbol";

/** The sector of `?sector=`; anything else (or nothing) is the first one, the same for everyone. */
function sectorOf(value: string | null): Sector {
  return SECTORS.find((s) => s === value) ?? DEFAULT_SECTOR;
}

/** The latest news of the community in one sector: outlet, time, headline and link. */
export function NewsSection({ territoryId }: { territoryId: string }): React.JSX.Element {
  const [params, setParams] = useSearchParams();
  const sector = sectorOf(params.get("sector"));
  // `?arbol=1` shows only the news that belong to a tree of related news; it stays in the URL.
  const treeOnly = params.get(TREE_ONLY_PARAM) === "1";
  const toggleTreeOnly = (): void => {
    const next = new URLSearchParams(params);
    if (treeOnly) next.delete(TREE_ONLY_PARAM);
    else next.set(TREE_ONLY_PARAM, "1");
    setParams(next, { preventScrollReset: true });
  };
  const news = useCommunityNews(territoryId, sector);
  const sectorName = es.community.news.sectors[sector];

  const shown =
    news.state === "ready" ? (treeOnly ? withTree(news.news.items) : news.news.items) : [];

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
      <button
        type="button"
        role="switch"
        aria-checked={treeOnly}
        className={styles.switch}
        onClick={toggleTreeOnly}
      >
        <span className={styles.switchTrack} aria-hidden="true" />
        {es.community.news.filter.treeOnly}
      </button>
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
          <p className={styles.newsNote}>
            {formatMessage(es.community.news.filter.treeOnlyCount, {
              count: String(withTree(news.news.items).length),
              total: String(news.news.items.length),
            })}
          </p>
          {shown.length === 0 ? (
            <p>
              {formatMessage(treeOnly ? es.community.news.emptyTree : es.community.news.empty, {
                sector: sectorName.toLowerCase(),
              })}
            </p>
          ) : (
            <div className={styles.timeline}>
              {groupByDay(newsRows(shown)).map((day) => (
                <section key={day.day} aria-labelledby={`news-day-${day.day}`}>
                  <Carousel
                    heading={
                      <h3 id={`news-day-${day.day}`} className={styles.newsDay}>
                        {day.label}
                      </h3>
                    }
                    label={formatMessage(es.community.news.carousel.label, { date: day.label })}
                    buttonLabels={es.community.news.carousel}
                  >
                    <ol className={styles.news}>
                      {day.rows.map((row) => (
                        <NewsItemView key={row.key} row={row} />
                      ))}
                    </ol>
                  </Carousel>
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
    <li>
      <article className={styles.newsItem}>
        <small className={styles.downloaded}>{row.outlet}</small>
        <h4 className={styles.newsHeadline}>{row.headline}</h4>
        <div className={styles.newsActions}>
          <ExternalLink
            href={row.url}
            className={styles.newsActionGhost}
            aria-label={formatMessage(es.community.news.sourceOf, { headline: row.headline })}
          >
            <SourceIcon />
            {es.community.news.source}
          </ExternalLink>
          {row.treeStoryId !== null && (
            <Link
              to={treePath(row.treeStoryId)}
              className={styles.newsActionSolid}
              aria-label={formatMessage(es.community.news.treeOf, { headline: row.headline })}
            >
              <TreeIcon />
              {es.community.news.tree}
            </Link>
          )}
        </div>
      </article>
    </li>
  );
}
