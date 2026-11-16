import { useState } from "react";

import { Carousel, ExternalLink, SectionHeading } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { BandView } from "./voter-profile";
import type { CommunityVoters } from "./voters-api";
import { useVoterProfile } from "./useVoterProfile";

import styles from "./VotersSection.module.css";

/**
 * How the municipalities of a community voted, by income band: one row per band with a bar per
 * group, the same numbers in a table, and the note that says how to read it. Every group goes
 * through the same code; the colour is never the only cue, each bar has its name and its figure.
 */
export function VotersSection({ territoryId }: { territoryId: string }): React.JSX.Element | null {
  const profile = useVoterProfile(territoryId);
  const [open, setOpen] = useState(true);
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
  return (
    <section aria-labelledby="voters-title" className={styles.section}>
      {open && profile.state === "ready" && profile.bands !== null ? (
        <Profile voters={profile.voters} bands={profile.bands} heading={heading} />
      ) : (
        heading
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
      {profile.state === "ready" && profile.bands === null && <NoProfile voters={profile.voters} />}
    </section>
  );
}

function Profile(props: {
  voters: CommunityVoters;
  bands: BandView[];
  heading: React.JSX.Element;
}): React.JSX.Element {
  const { voters, bands, heading } = props;
  const year = voters.incomeYear === null ? null : String(voters.incomeYear);
  return (
    <>
      <Carousel
        heading={heading}
        intro={<Intro voters={voters} year={year} />}
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
      {voters.profile !== null && voters.profile.municipalitiesWithoutIncome > 0 && (
        <p className={styles.note}>
          {formatMessage(es.voters.section.withoutIncome, {
            count: String(voters.profile.municipalitiesWithoutIncome),
          })}
        </p>
      )}
      <details className={styles.data}>
        <summary>{es.voters.table.open}</summary>
        <DataTable bands={bands} />
      </details>
      <Method year={year} shownFromPercent={voters.shownFromPercent} />
      <Sources voters={voters} />
    </>
  );
}

/** A community with no profile to draw: why, and where the data comes from. */
function NoProfile({ voters }: { voters: CommunityVoters }): React.JSX.Element {
  const year = voters.incomeYear === null ? null : String(voters.incomeYear);
  return (
    <>
      <Intro voters={voters} year={year} />
      {voters.noProfileReason !== null && <p>{es.voters.reasons[voters.noProfileReason]}</p>}
      <Sources voters={voters} />
    </>
  );
}

function Intro(props: { voters: CommunityVoters; year: string | null }): React.JSX.Element {
  const date = formatLongDate(props.voters.electionDay);
  return (
    <p>
      {props.year === null
        ? formatMessage(es.voters.section.introNoIncome, { date })
        : formatMessage(es.voters.section.intro, { date, year: props.year })}
    </p>
  );
}

function Sources({ voters }: { voters: CommunityVoters }): React.JSX.Element {
  return (
    <p className={styles.note}>
      {es.voters.method.sources}{" "}
      <ExternalLink href={voters.electionSourceUrl}>{es.voters.method.election}</ExternalLink>
      {voters.incomeSourceUrl !== null && (
        <>
          {"; "}
          <ExternalLink href={voters.incomeSourceUrl}>{es.voters.method.income}</ExternalLink>
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
        {band.income !== null && <span>{band.income}</span>}
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
function DataTable({ bands }: { bands: readonly BandView[] }): React.JSX.Element {
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
        <caption>{es.voters.table.caption}</caption>
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

function Method(props: { year: string | null; shownFromPercent: number }): React.JSX.Element {
  const { year, shownFromPercent } = props;
  const { method } = es.voters;
  return (
    <aside aria-labelledby="voters-method-title" className={styles.method}>
      <h3 id="voters-method-title">{method.title}</h3>
      {year !== null && <p>{formatMessage(method.bands, { year })}</p>}
      <p>{formatMessage(method.shares, { percent: String(shownFromPercent) })}</p>
      <p>{method.areas}</p>
    </aside>
  );
}
