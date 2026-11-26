import { useState } from "react";

import { Carousel, ExternalLink } from "@/features/shell";
import { StoryTreeView } from "@/features/stories";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import { EmptyState } from "./EmptyState";
import type { NewsFilters } from "./NewsSection";
import { SearchBox } from "./SearchBox";
import { SectorFilter } from "./SectorFilter";
import { ChevronIcon, SourceIcon } from "./icons";
import { formatNewsTime, groupByDay, newsDay } from "./news-card";
import { matchesQuery } from "./news-search";
import { useCommunityTrees } from "./useCommunityTrees";
import type { TreeEntry } from "./trees-api";

import styles from "./CommunityCard.module.css";

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
 * The trees of news of the community in one sector, with no dates: one card per tree, showing its
 * newest news, in a row for each day like the news. Opening a card shows the whole tree under its
 * row, at the width of the section. The sector and the search are the news section's.
 */
export function NewsTrees({
  territoryId,
  filters,
}: {
  territoryId: string;
  filters: NewsFilters;
}): React.JSX.Element {
  const { params, sector, query, setQuery } = filters;
  const trees = useCommunityTrees(territoryId, sector);
  const rows = trees.state === "ready" ? treeRows(trees.trees) : [];
  const shown = rows.filter((row) => matchesQuery(query, row.entry.headline, row.outlet));
  // One tree open at a time: the page does not fill with horizontal trees.
  const [openStory, setOpenStory] = useState<number | null>(null);

  return (
    <>
      <fieldset className={styles.filters}>
        <legend>{es.community.filters.legend}</legend>
        <SectorFilter
          params={params}
          sector={sector}
          label={es.community.trees.sectorNav}
          onPick={() => {
            setOpenStory(null);
          }}
        />
        <div className={styles.filterRow}>
          <SearchBox
            label={es.community.trees.search.label}
            placeholder={es.community.trees.search.placeholder}
            value={query}
            onChange={setQuery}
          />
        </div>
      </fieldset>
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
