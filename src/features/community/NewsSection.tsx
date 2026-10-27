import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import { ExternalLink } from "@/features/shell";
import { treePath } from "@/features/stories";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import { Carousel } from "./Carousel";
import { searchWith } from "./search-params";
import { groupByDay, newsRows, type NewsRow } from "./news-card";
import { EmptyState } from "./EmptyState";
import { SearchBox } from "./SearchBox";
import { SectionHeading } from "./SectionHeading";
import { SourceIcon, TreeIcon } from "./icons";
import { SECTORS, type Sector } from "./news-api";
import { matchesQuery } from "./news-search";
import { dayOf, withBound } from "./news-range";
import { useCommunityNews } from "./useCommunityNews";

import styles from "./CommunityCard.module.css";

const DEFAULT_SECTOR: Sector = SECTORS[0];
const FROM_PARAM = "desde";
const TO_PARAM = "hasta";
const SEARCH_PARAM = "buscar";

/** The sector of `?sector=`; anything else (or nothing) is the first one, the same for everyone. */
function sectorOf(value: string | null): Sector {
  return SECTORS.find((s) => s === value) ?? DEFAULT_SECTOR;
}

/** The latest news of the community in one sector: outlet, time, headline and link. */
export function NewsSection({ territoryId }: { territoryId: string }): React.JSX.Element {
  const [params, setParams] = useSearchParams();
  const sector = sectorOf(params.get("sector"));
  const [open, setOpen] = useState(true);
  // The range of days is in the URL too; without it the API answers the last week.
  const range = { from: dayOf(params.get(FROM_PARAM)), to: dayOf(params.get(TO_PARAM)) };
  const news = useCommunityNews(territoryId, sector, range);
  // The inputs show the days the API resolved when none was chosen, so the range is always visible.
  const shownFrom = range.from ?? (news.state === "ready" ? news.news.since : null);
  const shownTo = range.to ?? (news.state === "ready" ? news.news.until : null);
  const setBound = (changed: "from" | "to", day: string): void => {
    if (day === "") return;
    const next = withBound({ from: shownFrom, to: shownTo }, changed, day);
    const query = new URLSearchParams(params);
    if (next.from !== null) query.set(FROM_PARAM, next.from);
    if (next.to !== null) query.set(TO_PARAM, next.to);
    setParams(query, { preventScrollReset: true });
  };
  const resetRange = (): void => {
    const query = new URLSearchParams(params);
    query.delete(FROM_PARAM);
    query.delete(TO_PARAM);
    setParams(query, { preventScrollReset: true });
  };
  const sectorName = es.community.news.sectors[sector];

  // The search is in the URL too and looks at what the range brought: headline, outlet and time.
  const query = params.get(SEARCH_PARAM) ?? "";
  const setQuery = (value: string): void => {
    const next = new URLSearchParams(params);
    if (value === "") next.delete(SEARCH_PARAM);
    else next.set(SEARCH_PARAM, value);
    setParams(next, { preventScrollReset: true, replace: true });
  };
  const rows = news.state === "ready" ? newsRows(news.news.items) : [];
  const shown = rows.filter((row) => matchesQuery(query, row.headline, row.outlet));

  return (
    <section aria-labelledby="news-title" className={styles.newsSection}>
      <SectionHeading
        id="news-title"
        title={es.community.news.title}
        open={open}
        onToggle={() => {
          setOpen(!open);
        }}
      />
      {open && (
        <>
          <fieldset className={styles.filters}>
            <legend>{es.community.filters.legend}</legend>
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
            <div className={styles.filterRow}>
              <SearchBox
                label={es.community.news.search.label}
                placeholder={es.community.news.search.placeholder}
                value={query}
                onChange={setQuery}
              />
              <div
                role="group"
                aria-label={es.community.news.range.legend}
                className={styles.dates}
              >
                <label>
                  {es.community.news.range.from}
                  <input
                    type="date"
                    value={shownFrom ?? ""}
                    onChange={(event) => {
                      setBound("from", event.target.value);
                    }}
                  />
                </label>
                <label>
                  {es.community.news.range.to}
                  <input
                    type="date"
                    value={shownTo ?? ""}
                    onChange={(event) => {
                      setBound("to", event.target.value);
                    }}
                  />
                </label>
                {(range.from !== null || range.to !== null) && (
                  <button type="button" onClick={resetRange}>
                    {es.community.news.range.reset}
                  </button>
                )}
              </div>
            </div>
          </fieldset>
          <p className={styles.newsNote}>{es.community.news.range.note}</p>
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
              {shown.length === 0 ? (
                <EmptyState>
                  {rows.length > 0
                    ? formatMessage(es.community.news.search.noMatch, {
                        sector: sectorName.toLowerCase(),
                        query,
                      })
                    : formatMessage(es.community.news.empty, {
                        sector: sectorName.toLowerCase(),
                      })}
                </EmptyState>
              ) : (
                <div className={styles.timeline}>
                  {groupByDay(shown).map((day) => (
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
