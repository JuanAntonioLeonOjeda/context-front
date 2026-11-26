import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Carousel, ExternalLink, SectionHeading } from "@/features/shell";
import { RelatedNewsView, treePath } from "@/features/stories";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import { searchWith } from "./search-params";
import { groupByDay, newsRows, type NewsRow } from "./news-card";
import { EmptyState } from "./EmptyState";
import { NewsTrees } from "./NewsTrees";
import { SearchBox } from "./SearchBox";
import { SectorFilter } from "./SectorFilter";
import { SectorIndicator } from "./SectorIndicator";
import { SearchIcon, SourceIcon, TreeIcon } from "./icons";
import { SECTORS, type Sector } from "./news-api";
import { matchesQuery } from "./news-search";
import { dayOf, withBound } from "./news-range";
import { otherView, VIEW_PARAM, viewOf, type NewsView } from "./news-view";
import { useCommunityNews } from "./useCommunityNews";
import { useSectorIndicator } from "./useSectorIndicator";

import styles from "./CommunityCard.module.css";

const DEFAULT_SECTOR: Sector = SECTORS[0];
const FROM_PARAM = "desde";
const TO_PARAM = "hasta";
const SEARCH_PARAM = "buscar";

/** The sector of `?sector=`; anything else (or nothing) is the first one, the same for everyone. */
function sectorOf(value: string | null): Sector {
  return SECTORS.find((s) => s === value) ?? DEFAULT_SECTOR;
}

/** What a part of the section needs from the URL: the sector and the search are shared, so going
 *  from the finder to the trees keeps them. */
export interface NewsFilters {
  params: URLSearchParams;
  sector: Sector;
  query: string;
  setQuery: (value: string) => void;
}

/**
 * The news of the community, in one section with two parts: the finder (the news of some days, by
 * sector, dates and text) and the trees of news (how stories continue in time). First the section
 * offers both, each a large button that says what it does; once one is chosen, it is shown with the
 * way to the other at the top. Which one is in `?vista=`.
 */
export function NewsSection({ territoryId }: { territoryId: string }): React.JSX.Element {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(true);
  const view = viewOf(params.get(VIEW_PARAM));
  // The search is in the URL too: it filters what the part shown brought.
  const setQuery = (value: string): void => {
    const next = new URLSearchParams(params);
    if (value === "") next.delete(SEARCH_PARAM);
    else next.set(SEARCH_PARAM, value);
    setParams(next, { preventScrollReset: true, replace: true });
  };
  const filters: NewsFilters = {
    params,
    sector: sectorOf(params.get("sector")),
    query: params.get(SEARCH_PARAM) ?? "",
    setQuery,
  };

  return (
    <section aria-labelledby="news-title" className={styles.newsSection}>
      <SectionHeading
        id="news-title"
        title={es.community.news.title}
        open={open}
        onToggle={() => {
          setOpen(!open);
        }}
        info={<NewsInfo view={view} />}
      />
      {open &&
        (view === null ? (
          <ViewChooser params={params} />
        ) : (
          <>
            <ViewSwitch view={view} params={params} />
            {view === "buscador" ? (
              <NewsFinder territoryId={territoryId} filters={filters} setParams={setParams} />
            ) : (
              <NewsTrees territoryId={territoryId} filters={filters} />
            )}
          </>
        ))}
    </section>
  );
}

/** How to read what is shown: the part chosen, or both before choosing. */
function NewsInfo({ view }: { view: NewsView | null }): React.JSX.Element {
  return (
    <>
      {view !== "arbol" && <p>{es.community.news.range.note}</p>}
      {view !== "buscador" && <p>{es.community.trees.note}</p>}
      <p>{es.community.news.method}</p>
    </>
  );
}

function ViewIcon({ view, size }: { view: NewsView; size?: number }): React.JSX.Element {
  const props = size === undefined ? {} : { size };
  return view === "buscador" ? <SearchIcon {...props} /> : <TreeIcon {...props} />;
}

/** The two parts side by side, each a large link with its icon, its name and what it does. */
function ViewChooser({ params }: { params: URLSearchParams }): React.JSX.Element {
  const { views } = es.community.news;
  return (
    <nav aria-label={views.label}>
      <ul className={styles.viewChooser}>
        {(["buscador", "arbol"] as const).map((view) => (
          <li key={view}>
            <Link
              to={{ search: searchWith(params, { [VIEW_PARAM]: view }) }}
              preventScrollReset
              className={styles.viewCard}
            >
              <span className={styles.viewIcon}>
                <ViewIcon view={view} size={28} />
              </span>
              <span className={styles.viewTitle}>{views[view].title}</span>
              <span className={styles.viewDescription}>{views[view].description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The part shown, named, and the way to the other one. */
function ViewSwitch({
  view,
  params,
}: {
  view: NewsView;
  params: URLSearchParams;
}): React.JSX.Element {
  const { views } = es.community.news;
  const other = otherView(view);
  return (
    <div className={styles.viewSwitch}>
      {/* A label of the part shown, not a heading: the days below are the section's headings. */}
      <p className={styles.viewCurrent}>
        <ViewIcon view={view} />
        {views[view].title}
      </p>
      <Link
        to={{ search: searchWith(params, { [VIEW_PARAM]: other }) }}
        preventScrollReset
        className={styles.newsActionGhost}
      >
        <ViewIcon view={other} />
        {views[other].goTo}
      </Link>
    </div>
  );
}

/** The finder: the news of a range of days in one sector, filtered by text as the reader types. */
function NewsFinder({
  territoryId,
  filters,
  setParams,
}: {
  territoryId: string;
  filters: NewsFilters;
  setParams: ReturnType<typeof useSearchParams>[1];
}): React.JSX.Element {
  const { params, sector, query, setQuery } = filters;
  // The range of days is in the URL too; without it the API answers the last week.
  const range = { from: dayOf(params.get(FROM_PARAM)), to: dayOf(params.get(TO_PARAM)) };
  const news = useCommunityNews(territoryId, sector, range);
  // The inputs show the days the API resolved when none was chosen, so the range is always visible.
  const shownFrom = range.from ?? (news.state === "ready" ? news.news.since : null);
  const shownTo = range.to ?? (news.state === "ready" ? news.news.until : null);
  const setBound = (changed: "from" | "to", day: string): void => {
    if (day === "") return;
    const next = withBound({ from: shownFrom, to: shownTo }, changed, day);
    const search = new URLSearchParams(params);
    if (next.from !== null) search.set(FROM_PARAM, next.from);
    if (next.to !== null) search.set(TO_PARAM, next.to);
    setParams(search, { preventScrollReset: true });
  };
  const resetRange = (): void => {
    const search = new URLSearchParams(params);
    search.delete(FROM_PARAM);
    search.delete(TO_PARAM);
    setParams(search, { preventScrollReset: true });
  };
  const sectorName = es.community.news.sectors[sector];
  const indicator = useSectorIndicator(territoryId, sector);
  // One related-news panel open at a time, under the day of its item.
  const [openArticle, setOpenArticle] = useState<number | null>(null);
  const rows = news.state === "ready" ? newsRows(news.news.items) : [];
  const shown = rows.filter((row) => matchesQuery(query, row.headline, row.outlet));

  return (
    <>
      <fieldset className={styles.filters}>
        <legend>{es.community.filters.legend}</legend>
        <SectorFilter
          params={params}
          sector={sector}
          label={es.community.news.sectorNav}
          onPick={() => {
            setOpenArticle(null);
          }}
        />
        <div className={styles.filterRow}>
          <SearchBox
            label={es.community.news.search.label}
            placeholder={es.community.news.search.placeholder}
            value={query}
            onChange={setQuery}
          />
          <div role="group" aria-label={es.community.news.range.legend} className={styles.dates}>
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
      {indicator !== null && <SectorIndicator sector={sectorName} row={indicator} />}
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
              {groupByDay(shown).map((day) => {
                const opened = day.rows.find((row) => row.articleId === openArticle);
                return (
                  <section key={day.day} aria-labelledby={`news-day-${day.day}`}>
                    <Carousel
                      heading={
                        <h3 id={`news-day-${day.day}`} className={styles.newsDay}>
                          {day.label}
                        </h3>
                      }
                      label={formatMessage(es.community.news.carousel.label, {
                        date: day.label,
                      })}
                      buttonLabels={es.community.news.carousel}
                    >
                      <ol className={styles.news}>
                        {day.rows.map((row) => (
                          <NewsItemView
                            key={row.key}
                            row={row}
                            open={row.articleId === openArticle}
                            onToggle={() => {
                              setOpenArticle(row.articleId === openArticle ? null : row.articleId);
                            }}
                          />
                        ))}
                      </ol>
                    </Carousel>
                    {opened && (
                      <div
                        id={relatedPanelId(opened.articleId)}
                        className={styles.treePanel}
                        role="group"
                        aria-label={formatMessage(es.stories.related.panelLabel, {
                          headline: opened.headline,
                        })}
                      >
                        <RelatedNewsView articleId={opened.articleId} />
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}

function relatedPanelId(articleId: number): string {
  return `related-panel-${String(articleId)}`;
}

function NewsItemView(props: {
  row: NewsRow;
  open: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const { row } = props;
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
          <button
            type="button"
            className={styles.newsActionGhost}
            aria-expanded={props.open}
            aria-controls={relatedPanelId(row.articleId)}
            aria-label={formatMessage(es.stories.related.buttonOf, { headline: row.headline })}
            onClick={props.onToggle}
          >
            {es.stories.related.button}
          </button>
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
