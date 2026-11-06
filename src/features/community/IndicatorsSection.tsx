import { useEffect, useRef, useState } from "react";

import { ExternalLink } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { IndicatorRow } from "./community-card";
import { Carousel } from "./Carousel";
import { HEIGHT, PLOT, WIDTH } from "./indicator-chart";
import { SectionHeading } from "./SectionHeading";

import styles from "./CommunityCard.module.css";

/**
 * The INE data of the community, one card per indicator: the latest value, its period, the
 * series as a line, and the source. Every chart has its numbers in a table underneath, and its
 * lowest and highest value written down: a drawing is never the only way to the data.
 */
export function IndicatorsSection(props: {
  community: string;
  rows: readonly IndicatorRow[];
}): React.JSX.Element {
  const [open, setOpen] = useState(true);
  const heading = (
    <SectionHeading
      id="indicators-title"
      title={es.community.indicators.title}
      open={open}
      onToggle={() => {
        setOpen(!open);
      }}
    />
  );
  return (
    <section aria-labelledby="indicators-title" className={styles.section}>
      {open ? (
        <Carousel
          heading={heading}
          label={formatMessage(es.community.indicators.carousel.label, {
            community: props.community,
          })}
        >
          <ul className={styles.indicatorRow}>
            {props.rows.map((row) => (
              <li key={row.id}>
                <IndicatorCard row={row} community={props.community} />
              </li>
            ))}
          </ul>
        </Carousel>
      ) : (
        heading
      )}
    </section>
  );
}

function IndicatorCard({
  row,
  community,
}: {
  row: IndicatorRow;
  community: string;
}): React.JSX.Element {
  const { indicators } = es.community;
  return (
    <article className={styles.indicator}>
      <h3 className={styles.indicatorName}>{row.name}</h3>
      <p className={styles.indicatorValue}>
        {row.figure === null ? (
          indicators.noValue
        ) : (
          <>
            {row.figure} <span className={styles.indicatorUnit}>{row.unit}</span>
          </>
        )}
      </p>
      <p className={styles.indicatorPeriod}>{row.period ?? indicators.noPeriod}</p>
      {row.chart !== null && row.axes !== null && (
        <svg
          className={styles.chart}
          viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
          role="img"
          aria-label={row.chartLabel ?? undefined}
        >
          {/* Vertical axis: a reference line and its value at each round step. */}
          {row.chart.yMarks.map((mark) => (
            <g key={mark.position}>
              <line
                x1={PLOT.left}
                x2={PLOT.right}
                y1={mark.position}
                y2={mark.position}
                className={styles.chartGrid}
              />
              <text
                x={PLOT.left - 6}
                y={mark.position + 4}
                textAnchor="end"
                className={styles.axisLabel}
              >
                {mark.label}
              </text>
            </g>
          ))}
          <text x={0} y={11} className={styles.axisTitle}>
            {row.axes.y}
          </text>
          {/* Horizontal axis: time, a mark where each year begins. */}
          <line
            x1={PLOT.left}
            x2={PLOT.right}
            y1={PLOT.bottom}
            y2={PLOT.bottom}
            className={styles.chartAxis}
          />
          {row.chart.xMarks.map((mark) => (
            <g key={mark.label}>
              <line
                x1={mark.position}
                x2={mark.position}
                y1={PLOT.bottom}
                y2={PLOT.bottom + 4}
                className={styles.chartAxis}
              />
              <text
                x={mark.position}
                y={PLOT.bottom + 17}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                {mark.label}
              </text>
            </g>
          ))}
          <text x={PLOT.right} y={HEIGHT - 2} textAnchor="end" className={styles.axisTitle}>
            {row.axes.x}
          </text>
          <path d={row.chart.area} className={styles.chartArea} />
          <path d={row.chart.line} className={styles.chartLine} />
          <circle
            cx={row.chart.last.cx}
            cy={row.chart.last.cy}
            r="3.5"
            className={styles.chartDot}
          />
        </svg>
      )}
      {row.range !== null && <p className={styles.indicatorRange}>{row.range}</p>}
      {row.data.length > 0 && <DataDialog community={community} row={row} />}
      <p className={styles.indicatorSource}>
        <ExternalLink href={row.tableUrl}>{row.tableLabel}</ExternalLink>
        {row.downloaded && <small className={styles.downloaded}> {row.downloaded}</small>}
      </p>
    </article>
  );
}

/** The numbers behind a chart: a button that opens them in a modal window, a table of every point. */
function DataDialog({
  community,
  row,
}: {
  community: string;
  row: IndicatorRow;
}): React.JSX.Element {
  const { indicators } = es.community;
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const name = formatMessage(indicators.caption, { community: `${community}: ${row.name}` });

  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.dataButton}
        onClick={() => {
          setOpen(true);
        }}
      >
        {indicators.viewData}
      </button>
      {open && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- the keyboard way to close is native Escape and the Close button
        <dialog
          ref={dialog}
          className={styles.dataDialog}
          aria-labelledby={`data-${row.id}`}
          // Escape closes it by itself (keyboard); the click on the backdrop is the pointer's extra.
          onClose={() => {
            setOpen(false);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
        >
          <div className={styles.dataDialogHeader}>
            <h2 id={`data-${row.id}`}>
              {formatMessage(indicators.dataTitle, { name: `${community}: ${row.name}` })}
            </h2>
            <button type="button" onClick={() => dialog.current?.close()}>
              {indicators.close}
            </button>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <caption className={styles.visuallyHidden}>{name}</caption>
              <thead>
                <tr>
                  <th scope="col">{indicators.columns.period}</th>
                  <th scope="col">{indicators.columns.value}</th>
                </tr>
              </thead>
              <tbody>
                {row.data.map((point) => (
                  <tr key={point.period}>
                    <th scope="row">{point.period}</th>
                    <td>{point.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </dialog>
      )}
    </>
  );
}
