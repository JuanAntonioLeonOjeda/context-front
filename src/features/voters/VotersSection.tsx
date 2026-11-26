import { useState } from "react";

import { ExternalLink, SectionHeading } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { BandView } from "./voter-profile";
import { DIMENSION_IDS, type CommunityVoters, type DimensionId } from "./voters-api";
import { useVoterProfile, type VoterProfileState } from "./useVoterProfile";
import { VoterLineChart } from "./VoterLineChart";

import styles from "./VotersSection.module.css";

/**
 * How the municipalities of a community voted, by band of one dimension at a time (income, the
 * size of the municipality, the education of its people): one line chart with a line per group
 * through the bands, the same numbers in a table, and the note that says how to read it. Every
 * group goes through the same code; the colour is never the only cue, each line has its name.
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
      info={<Explanation profile={profile} />}
    />
  );
  const tabs = <DimensionSwitch value={dimension} onChange={setDimension} />;
  const pending = profile.state === "ready" && profile.pending;
  return (
    <section
      aria-labelledby="voters-title"
      aria-busy={pending}
      className={[styles.section, pending ? styles.pending : ""].join(" ")}
    >
      {open && profile.state === "ready" && profile.bands !== null ? (
        <Profile voters={profile.voters} bands={profile.bands} heading={heading} tabs={tabs} />
      ) : (
        <>
          {heading}
          {open && tabs}
        </>
      )}
      {open && <Status profile={profile} dimension={dimension} />}
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

/** What a screen reader hears when the profile changes. The element stays in the page all the time,
 *  because a live region that appears with its text already in it is often not announced; only
 *  the first load shows its text, the rest is for assistive technology. */
function Status(props: { profile: VoterProfileState; dimension: DimensionId }): React.JSX.Element {
  const { profile } = props;
  const texts = es.voters.section;
  const loading = profile.state === "loading" || (profile.state === "ready" && profile.pending);
  const text = loading
    ? texts.loading
    : profile.state === "ready"
      ? formatMessage(texts.loaded, { parameter: es.voters.dimensions[props.dimension].tab })
      : "";
  return (
    <p role="status" className={profile.state === "loading" ? styles.status : styles.statusHidden}>
      {text}
    </p>
  );
}

/** The parameter the profile is made by: one pressed button among the others. */
function DimensionSwitch(props: {
  value: DimensionId;
  onChange: (dimension: DimensionId) => void;
}): React.JSX.Element {
  return (
    <div role="group" aria-label={es.voters.section.tabs} className={styles.dimensions}>
      {DIMENSION_IDS.map((id) => (
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
      {props.heading}
      {props.tabs}
      <VoterLineChart bands={bands} />
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
      <Sources voters={voters} />
    </>
  );
}

/** A community with no profile to draw: why, and where the data comes from. */
function NoProfile({ voters }: { voters: CommunityVoters }): React.JSX.Element {
  return (
    <>
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

/** What the profile is: the election and the parameter. */
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
    case "age":
    case "born_abroad":
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

/** The same numbers as the lines: a row per band, a column per group in the same order. */
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
            <th scope="col">{es.voters.table.range}</th>
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
              <td>{band.range ?? es.voters.table.noValue}</td>
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

/** How to read the profile, in the section's "i" window: what it is, how the bands are made and
 *  what the percentages are, once the data says them; that it describes areas, always. */
function Explanation({ profile }: { profile: VoterProfileState }): React.JSX.Element {
  const { method } = es.voters;
  if (profile.state !== "ready") return <p>{method.areas}</p>;
  const { voters } = profile;
  const texts = es.voters.dimensions[voters.dimension];
  const hasBands = profile.bands !== null;
  // The note about the bands names the year of the values: without a year it is left out.
  const hasYear = voters.sourceYear !== null || !texts.method.includes("{year}");
  return (
    <>
      <Intro voters={voters} />
      {hasBands && hasYear && (
        <p>{formatMessage(texts.method, { year: String(voters.sourceYear ?? "") })}</p>
      )}
      {hasBands && <p>{es.voters.section.chart.lines}</p>}
      {hasBands && (
        <p>{formatMessage(method.shares, { percent: String(voters.shownFromPercent) })}</p>
      )}
      <p>{method.areas}</p>
    </>
  );
}
