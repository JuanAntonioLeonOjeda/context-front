import { useState } from "react";

import { Carousel, ExternalLink, SectionHeading } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { BandView } from "./voter-profile";
import type { CommunityVoters, DimensionId } from "./voters-api";
import { useVoterProfile } from "./useVoterProfile";

import styles from "./VotersSection.module.css";

const DIMENSIONS: readonly DimensionId[] = ["income", "size", "education"];

/**
 * How the municipalities of a community voted, by band of one dimension at a time (income, the
 * size of the municipality, the education of its people): a card per band with a vertical bar per group, the same numbers in a
 * table, and the note that says how to read it. Every group goes through the same code; the
 * colour is never the only cue, each bar has its name and its figure.
 */
export function VotersSection({ territoryId }: { territoryId: string }): React.JSX.Element | null {
  const [open, setOpen] = useState(true);
  const [dimension, setDimension] = useState<DimensionId>("income");
  const profile = useVoterProfile(territoryId, dimension);
  if (profile.state === "absent") return null;
  const texts = es.voters.section;
  const heading = (
    <SectionHeading
      id="voters-title"
      title={texts.title}
      open={open}
      onToggle={() => {
        setOpen(!open);
      }}
    />
  );
  const tabs = <DimensionSwitch value={dimension} onChange={setDimension} />;
  return (
    <section aria-labelledby="voters-title" className={styles.section}>
      {open && profile.state === "ready" && profile.bands !== null ? (
        <Profile voters={profile.voters} bands={profile.bands} heading={heading} tabs={tabs} />
      ) : (
        <>
          {heading}
          {open && tabs}
        </>
      )}
      {open && profile.state === "loading" && <p role="status">{texts.loading}</p>}
      {open && profile.state === "error" && (
        <div role="alert">
          <p>{texts.error}</p>
          <button type="button" onClick={profile.retry}>
            {texts.retry}
          </button>
        </div>
      )}
      {open && profile.state === "ready" && profile.bands === null && (
        <NoProfile voters={profile.voters} />
      )}
    </section>
  );
}

/** The parameter the profile is made by: one pressed button among the others. */
function DimensionSwitch(props: {
  value: DimensionId;
  onChange: (dimension: DimensionId) => void;
}): React.JSX.Element {
  return (
    <div role="group" aria-label={es.voters.section.tabs} className={styles.dimensions}>
      {DIMENSIONS.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={props.value === id}
          onClick={() => {
            props.onChange(id);
          }}
        >
          {es.voters.dimensions[id].tab}
        </button>
      ))}
    </div>
  );
}

function Profile(props: {
  voters: CommunityVoters;
  bands: BandView[];
  heading: React.JSX.Element;
  tabs: React.JSX.Element;
}): React.JSX.Element {
  const { voters, bands } = props;
  const texts = es.voters.dimensions[voters.dimension];
  return (
    <>
      <Carousel
        heading={props.heading}
        intro={
          <>
            {props.tabs}
            <Intro voters={voters} />
          </>
        }
        label={es.voters.section.carousel.label}
        buttonLabels={es.voters.section.carousel}
      >
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers; the explicit role keeps them (WCAG 1.3.1) */}
        <ol className={styles.bands} role="list">
          {bands.map((band) => (
            <li key={band.index}>
              <Band band={band} />
            </li>
          ))}
        </ol>
      </Carousel>
      {voters.profile !== null && voters.profile.municipalitiesWithoutValue > 0 && (
        <p className={styles.note}>
          {formatMessage(texts.withoutValue, {
            count: String(voters.profile.municipalitiesWithoutValue),
          })}
        </p>
      )}
      <details className={styles.data}>
        <summary>{es.voters.table.open}</summary>
        <DataTable bands={bands} caption={texts.tableCaption} />
      </details>
      <Method voters={voters} />
      <Sources voters={voters} />
    </>
  );
}

/** A community with no profile to draw: why, and where the data comes from. */
function NoProfile({ voters }: { voters: CommunityVoters }): React.JSX.Element {
  return (
    <>
      <Intro voters={voters} />
      {voters.noProfileReason !== null && (
        <p>
          {voters.noProfileReason === "no_results"
            ? es.voters.reasons.no_results
            : es.voters.dimensions[voters.dimension].tooFew}
        </p>
      )}
      <Sources voters={voters} />
    </>
  );
}

function Intro({ voters }: { voters: CommunityVoters }): React.JSX.Element {
  const texts = es.voters.dimensions[voters.dimension];
  const date = formatLongDate(voters.electionDay);
  return (
    <p>
      {voters.sourceYear === null
        ? formatMessage(texts.introNoYear, { date })
        : formatMessage(texts.intro, { date, year: String(voters.sourceYear) })}
    </p>
  );
}

/** The name of the INE statistic a dimension is made from; none for the size, which is the
 *  election's own census. */
function statisticLabel(dimension: DimensionId): string | null {
  switch (dimension) {
    case "income":
    case "education":
      return es.voters.method.statistic[dimension];
    case "size":
      return null;
  }
}

function Sources({ voters }: { voters: CommunityVoters }): React.JSX.Element {
  const statistic = statisticLabel(voters.dimension);
  return (
    <p className={styles.note}>
      {es.voters.method.sources}{" "}
      <ExternalLink href={voters.electionSourceUrl}>{es.voters.method.election}</ExternalLink>
      {voters.sourceUrl !== null && statistic !== null && (
        <>
          {"; "}
          <ExternalLink href={voters.sourceUrl}>{statistic}</ExternalLink>
        </>
      )}
      .
    </p>
  );
}

function Band({ band }: { band: BandView }): React.JSX.Element {
  return (
    <div className={styles.band}>
      <h3 className={styles.bandName}>{band.name}</h3>
      <p className={styles.bandFacts}>
        {band.range !== null && <span>{band.range}</span>}
        <span>{band.size}</span>
      </p>
      {band.bars.length === 0 ? (
        <p className={styles.note}>{es.voters.band.empty}</p>
      ) : (
        // eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics, and the list's name with them, of a list styled without markers (WCAG 1.3.1)
        <ul
          role="list"
          className={styles.bars}
          aria-label={formatMessage(es.voters.section.barsOf, { band: band.name })}
        >
          {band.bars.map((bar) => (
            <li key={bar.groupId} className={styles.barColumn}>
              <span className={styles.barValue}>{bar.percent}</span>
              {/* The drawing repeats the figure above it, so it is hidden from screen readers. */}
              <span className={styles.track} aria-hidden="true">
                <span
                  className={styles.bar}
                  style={{
                    blockSize: `${String(bar.width)}%`,
                    ...(bar.colour === null ? {} : { background: bar.colour }),
                  }}
                />
              </span>
              <span className={styles.barLabel}>{bar.label}</span>
            </li>
          ))}
        </ul>
      )}
      {band.blank !== null && <p className={styles.note}>{band.blank}</p>}
    </div>
  );
}

/** The same numbers as the bars: a row per band, a column per group in the same order. */
function DataTable(props: { bands: readonly BandView[]; caption: string }): React.JSX.Element {
  const { bands } = props;
  const columns = bands.find((band) => band.bars.length > 0)?.bars ?? [];
  // A box that scrolls must take the focus, or the keyboard cannot scroll it.
  return (
    <div
      className={styles.tableScroll}
      role="region"
      aria-label={es.voters.table.scroll}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a region that scrolls must take focus, or the keyboard cannot scroll it (WCAG 2.1.1)
      tabIndex={0}
    >
      <table className={styles.table}>
        <caption>{props.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{es.voters.table.band}</th>
            <th scope="col">{es.voters.table.size}</th>
            {columns.map((column) => (
              <th key={column.groupId} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bands.map((band) => (
            <tr key={band.index}>
              <th scope="row">{band.name}</th>
              <td>{band.size}</td>
              {columns.map((column) => (
                <td key={column.groupId}>
                  {band.bars.find((bar) => bar.groupId === column.groupId)?.percent ??
                    es.voters.table.noValue}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Method({ voters }: { voters: CommunityVoters }): React.JSX.Element {
  const { method } = es.voters;
  const texts = es.voters.dimensions[voters.dimension];
  // The note about the bands names the year of the values: without a year it is left out.
  const hasYear = voters.sourceYear !== null || !texts.method.includes("{year}");
  return (
    <aside aria-labelledby="voters-method-title" className={styles.method}>
      <h3 id="voters-method-title">{method.title}</h3>
      {hasYear && <p>{formatMessage(texts.method, { year: String(voters.sourceYear ?? "") })}</p>}
      <p>{formatMessage(method.shares, { percent: String(voters.shownFromPercent) })}</p>
      <p>{method.areas}</p>
    </aside>
  );
}
