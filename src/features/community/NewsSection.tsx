import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";

import { partyTable } from "@/design/parties";
import { cssBackground, fetchParties } from "@/features/map";
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import { searchWith } from "./community-view";
import { groupByDay, newsRows, type NewsRow } from "./news-card";
import { SECTORS, type Sector } from "./news-api";
import { useCommunityNews } from "./useCommunityNews";

import styles from "./CommunityCard.module.css";

const DEFAULT_SECTOR: Sector = SECTORS[0];

/** The sector of `?sector=`; anything else (or nothing) is the first one, the same for everyone. */
function sectorOf(value: string | null): Sector {
  return SECTORS.find((s) => s === value) ?? DEFAULT_SECTOR;
}

/** The latest news of the community in one sector, each with who is responsible and why. */
export function NewsSection({ territoryId }: { territoryId: string }): React.JSX.Element {
  const [params] = useSearchParams();
  const sector = sectorOf(params.get("sector"));
  const news = useCommunityNews(territoryId, sector);
  const parties = useQuery({
    queryKey: ["parties"],
    queryFn: fetchParties,
    staleTime: 60 * 60 * 1000,
  });
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
      <p>{es.community.news.method}</p>
      {(news.state === "error" || parties.isError) && (
        <div role="alert">
          <p>{es.community.news.error}</p>
          <button
            type="button"
            onClick={() => {
              if (news.state === "error") news.retry();
              if (parties.isError) void parties.refetch();
            }}
          >
            {es.community.news.retry}
          </button>
        </div>
      )}
      {news.state === "loading" && <p role="status">{es.community.news.loading}</p>}
      {news.state === "ready" && parties.data && (
        <>
          <p>
            {formatMessage(es.community.news.window, { date: formatLongDate(news.news.since) })}
          </p>
          {news.news.items.some((item) =>
            item.attribution.some((a) => a.reason === "no_level_named"),
          ) && <p>{es.community.news.sharedCompetences}</p>}
          {news.news.items.length === 0 ? (
            <p>{formatMessage(es.community.news.empty, { sector: sectorName.toLowerCase() })}</p>
          ) : (
            <div className={styles.timeline}>
              {groupByDay(newsRows(news.news.items, partyTable(parties.data))).map((day) => (
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
      <span
        className={styles.stripe}
        style={{ background: cssBackground(row.stripe) }}
        aria-hidden="true"
      />
      <a href={row.url}>{row.headline}</a>
      <small className={styles.downloaded}>{row.outlet}</small>
      <ul className={styles.attribution}>
        {row.attribution.map((a, index) => (
          // Entries have no id of their own: their order is fixed by the API.
          <li key={index}>
            {a.responsible !== null && <p>{a.responsible}</p>}
            <p>{a.confidence}</p>
            {a.basis.length > 0 && (
              <details>
                <summary>{es.community.news.basis}</summary>
                <ul>
                  {a.basis.map((b) => (
                    <li key={`${b.label}|${b.url}`}>
                      <a href={b.url}>{b.label}</a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}
