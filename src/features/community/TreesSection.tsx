import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import { ExternalLink } from "@/features/shell";
import { StoryTreeView } from "@/features/stories";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import { Carousel } from "./Carousel";
import { EmptyState } from "./EmptyState";
import { SearchBox } from "./SearchBox";
import { SectionHeading } from "./SectionHeading";
import { ChevronIcon, SourceIcon } from "./icons";
import { SECTORS, type Sector } from "./news-api";
import { formatNewsTime, groupByDay, newsDay } from "./news-card";
import { matchesQuery } from "./news-search";
import { searchWith } from "./search-params";
import { useCommunityTrees } from "./useCommunityTrees";
import type { TreeEntry } from "./trees-api";

import styles from "./CommunityCard.module.css";

const SECTOR_PARAM = "sector-arbol";
const SEARCH_PARAM = "buscar-arbol";

/** The sector of `?sector-arbol=`; anything else (or nothing) is the first one. */
function sectorOf(value: string | null): Sector {
  return SECTORS.find((s) => s === value) ?? SECTORS[0];
}

interface TreeRow {
  day: string; // ISO date in Spain, for grouping
  outlet: string; // "Outlet, 11:44"
  entry: TreeEntry;
}

function treeRows(entries: readonly TreeEntry[]): TreeRow[] {
  return entries.map((entry) => ({
    day: newsDay(entry.publishedAt),
    outlet: formatMessage(es.community.news.outletAndTime, {
      outlet: entry.outletName,
      time: formatNewsTime(entry.publishedAt),
    }),
    entry,
  }));
}

/**
 * The trees of related news of the community in one sector, with no dates: one card per tree,
 * showing its newest news, in a row for each day like the news. Opening a card shows the whole
 * tree under its row, at the width of the section. Closes like the others.
 */
export function TreesSection({ territoryId }: { territoryId: string }): React.JSX.Element {
  const [params, setParams] = useSearchParams();
  const sector = sectorOf(params.get(SECTOR_PARAM));
  const trees = useCommunityTrees(territoryId, sector);
  const [open, setOpen] = useState(true);
  // The search is in the URL and looks at the card of each tree: headline, outlet and time.
  const query = params.get(SEARCH_PARAM) ?? "";
  const setQuery = (value: string): void => {
    const next = new URLSearchParams(params);
    if (value === "") next.delete(SEARCH_PARAM);
    else next.set(SEARCH_PARAM, value);
    setParams(next, { preventScrollReset: true, replace: true });
  };
  const rows = trees.state === "ready" ? treeRows(trees.trees) : [];
  const shown = rows.filter((row) => matchesQuery(query, row.entry.headline, row.outlet));
  // One tree open at a time: the page does not fill with horizontal trees.
  const [openStory, setOpenStory] = useState<number | null>(null);

  return (
    <section aria-labelledby="trees-title" className={styles.newsSection}>
      <SectionHeading
        id="trees-title"
        title={es.community.trees.title}
        open={open}
        onToggle={() => {
          setOpen(!open);
        }}
      />
      {open && (
        <>
          <nav aria-label={es.community.trees.sectorNav}>
            <ul className={styles.sectors}>
              {SECTORS.map((s) => (
                <li key={s}>
                  <Link
                    to={{ search: searchWith(params, { [SECTOR_PARAM]: s }) }}
                    preventScrollReset
                    aria-current={s === sector ? "page" : undefined}
                    onClick={() => {
                      setOpenStory(null);
                    }}
                  >
                    {es.community.news.sectors[s]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className={styles.newsNote}>{es.community.trees.note}</p>
          <SearchBox
            label={es.community.trees.search.label}
            placeholder={es.community.trees.search.placeholder}
            value={query}
            onChange={setQuery}
          />
          {trees.state === "error" && (
            <div role="alert">
              <p>{es.community.trees.error}</p>
              <button type="button" onClick={trees.retry}>
                {es.community.trees.retry}
              </button>
            </div>
          )}
          {trees.state === "loading" && <p role="status">{es.community.trees.loading}</p>}
          {trees.state === "ready" &&
            (shown.length === 0 ? (
              <EmptyState>
                {rows.length > 0
                  ? formatMessage(es.community.trees.search.noMatch, {
                      sector: es.community.news.sectors[sector].toLowerCase(),
                      query,
                    })
                  : formatMessage(es.community.trees.empty, {
                      sector: es.community.news.sectors[sector].toLowerCase(),
                    })}
              </EmptyState>
            ) : (
              <div className={styles.timeline}>
                {groupByDay(shown).map((day) => {
                  const opened = day.rows.find((row) => row.entry.storyId === openStory);
                  return (
                    <section key={day.day} aria-labelledby={`trees-day-${day.day}`}>
                      <Carousel
                        heading={
                          <h3 id={`trees-day-${day.day}`} className={styles.newsDay}>
                            {day.label}
                          </h3>
                        }
                        label={formatMessage(es.community.trees.carousel.label, {
                          date: day.label,
                        })}
                        buttonLabels={es.community.news.carousel}
                      >
                        <ol className={styles.news}>
                          {day.rows.map((row) => (
                            <TreeCard
                              key={row.entry.storyId}
                              row={row}
                              open={row.entry.storyId === openStory}
                              onToggle={() => {
                                setOpenStory(
                                  row.entry.storyId === openStory ? null : row.entry.storyId,
                                );
                              }}
                            />
                          ))}
                        </ol>
                      </Carousel>
                      {opened && (
                        <div
                          id={panelId(opened.entry)}
                          className={styles.treePanel}
                          role="group"
                          aria-label={formatMessage(es.community.trees.panelLabel, {
                            headline: opened.entry.headline,
                          })}
                        >
                          <StoryTreeView storyId={opened.entry.storyId} />
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            ))}
        </>
      )}
    </section>
  );
}

function panelId(entry: TreeEntry): string {
  return `tree-panel-${String(entry.storyId)}`;
}

/** One tree, closed: its newest news; the headline opens the tree and its chevron says which way. */
function TreeCard(props: { row: TreeRow; open: boolean; onToggle: () => void }): React.JSX.Element {
  const { entry, outlet } = props.row;
  return (
    <li>
      <article className={styles.newsItem}>
        <small className={styles.downloaded}>{outlet}</small>
        <h4 className={styles.newsHeadline}>
          <button
            type="button"
            className={styles.treeHeadline}
            aria-expanded={props.open}
            aria-controls={panelId(entry)}
            onClick={props.onToggle}
          >
            <span>{entry.headline}</span>
            <ChevronIcon />
          </button>
        </h4>
        <div className={styles.newsActions}>
          <ExternalLink
            href={entry.url}
            className={styles.newsActionGhost}
            aria-label={formatMessage(es.community.news.sourceOf, { headline: entry.headline })}
          >
            <SourceIcon />
            {es.community.news.source}
          </ExternalLink>
        </div>
      </article>
    </li>
  );
}
