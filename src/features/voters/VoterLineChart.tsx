import { useEffect, useMemo, useRef, useState } from "react";

import { es } from "@/i18n/es";

import { END_LABEL_GAP_PX, lineChart, type LineSeries } from "./line-chart";
import type { BandView } from "./voter-profile";

import styles from "./VoterLineChart.module.css";

const HEIGHT_PX = 340;
const FALLBACK_WIDTH_PX = 720; // until the box is measured, and where it cannot be (tests)

/**
 * The voter profile as one line chart: a line per group through its share in each band, the bands
 * in order along the bottom. Every group has its name at the end of its line and in the legend,
 * so its colour is never the only way to tell it. Pointing at a band (or moving to it with the
 * arrow keys once the chart has the focus) shows every group's share there; the same numbers are in
 * the table under the chart.
 */
export function VoterLineChart({ bands }: { bands: readonly BandView[] }): React.JSX.Element {
  const box = useRef<HTMLDivElement>(null);
  const width = useWidth(box);
  const model = useMemo(() => lineChart(bands, { width, height: HEIGHT_PX }), [bands, width]);
  const [active, setActive] = useState<number | null>(null);
  const activeColumn = model.columns.find((c) => c.band === active);
  const activeBand = bands.find((b) => b.index === active);

  const move = (step: number): void => {
    const indexes = model.columns.map((c) => c.band);
    const at = active === null ? -1 : indexes.indexOf(active);
    const next = indexes[Math.min(indexes.length - 1, Math.max(0, at + step))];
    setActive(next ?? null);
  };

  return (
    <figure className={styles.figure}>
      <Legend series={model.series} />
      {/* The chart takes the focus so the arrow keys can go through the bands. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- a chart that takes the focus: its arrow keys move through the bands, as the pointer does */}
      <div
        ref={box}
        className={styles.chart}
        role="group"
        aria-label={es.voters.section.chart.label}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the arrow keys move through the bands, as the pointer does
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") move(1);
          else if (event.key === "ArrowLeft") move(-1);
          else if (event.key === "Escape") setActive(null);
          else return;
          event.preventDefault();
        }}
        onFocus={() => {
          if (active === null) setActive(model.columns[0]?.band ?? null);
        }}
        onBlur={() => {
          setActive(null);
        }}
        onPointerLeave={() => {
          setActive(null);
        }}
      >
        <svg width={width} height={HEIGHT_PX} aria-hidden="true" focusable="false">
          {model.ticks.map((tick) => (
            <g key={tick.text}>
              <line
                className={styles.grid}
                x1={model.plot.left}
                x2={model.plot.right}
                y1={tick.y}
                y2={tick.y}
              />
              <text className={styles.tick} x={model.plot.left - 8} y={tick.y} dy="0.32em">
                {tick.text}
              </text>
            </g>
          ))}
          {model.columns.map((column) => {
            const band = bands.find((b) => b.index === column.band);
            if (band === undefined) return null;
            return (
              <text
                key={column.band}
                className={styles.bandLabel}
                x={column.x}
                y={model.plot.bottom + 18}
                textAnchor="middle"
              >
                <tspan className={styles.bandShort}>{band.short}</tspan>
                {!model.compact && band.end !== null && (
                  <tspan x={column.x} dy="1.25em">
                    {band.end}
                  </tspan>
                )}
                <tspan x={column.x} dy="1.25em">
                  {model.compact ? band.censusShort : band.census}
                </tspan>
              </text>
            );
          })}
          {model.compact && <AxisEnds bands={bands} model={model} />}
          {/* Behind the lines: each band's share of the census, on the same axis. */}
          {model.columns.map((column) => (
            <rect
              key={column.band}
              className={styles.census}
              x={column.x - censusBarWidth(model) / 2}
              y={column.censusTop}
              width={censusBarWidth(model)}
              height={model.plot.bottom - column.censusTop}
              rx={4}
            />
          ))}
          {activeColumn !== undefined && (
            <line
              className={styles.crosshair}
              x1={activeColumn.x}
              x2={activeColumn.x}
              y1={model.plot.top}
              y2={model.plot.bottom}
            />
          )}
          {model.series.map((series) => (
            <Line
              key={series.groupId}
              series={series}
              labelX={model.plot.right + END_LABEL_GAP_PX}
            />
          ))}
          {model.columns.map((column) => (
            <rect
              key={column.band}
              className={styles.hit}
              x={column.left}
              y={model.plot.top}
              width={column.right - column.left}
              height={model.plot.bottom - model.plot.top}
              onPointerEnter={() => {
                setActive(column.band);
              }}
            />
          ))}
        </svg>
        {activeColumn !== undefined && activeBand !== undefined && (
          <Tooltip
            band={activeBand}
            series={model.series}
            x={activeColumn.x}
            flip={activeColumn.x > width / 2}
          />
        )}
      </div>
    </figure>
  );
}

/** As wide as a third of the room between two bands, never more than 56 px. */
function censusBarWidth(model: ReturnType<typeof lineChart>): number {
  const columns = model.columns.length;
  const room = (model.plot.right - model.plot.left) / Math.max(1, columns - 1);
  return Math.min(56, room / 3);
}

/** On a narrow chart, the dimension's ends once: under the first band at the left edge of the
 *  plot, under the last at its right edge, on the line below the bands' names. */
function AxisEnds(props: {
  bands: readonly BandView[];
  model: ReturnType<typeof lineChart>;
}): React.JSX.Element {
  const first = props.bands.find((b) => b.bars.length > 0);
  const last = [...props.bands].reverse().find((b) => b.bars.length > 0);
  const y = props.model.plot.bottom + 18 + 2 * 15;
  return (
    <>
      {first?.end !== undefined && first.end !== null && (
        <text className={styles.bandLabel} x={props.model.plot.left - 16} y={y}>
          {`← ${first.end}`}
        </text>
      )}
      {last?.end !== undefined && last.end !== null && last !== first && (
        <text className={styles.bandLabel} x={props.model.plot.right + 16} y={y} textAnchor="end">
          {`${last.end} →`}
        </text>
      )}
    </>
  );
}

function colourOf(series: LineSeries): string | undefined {
  return series.colour ?? undefined;
}

function Line({ series, labelX }: { series: LineSeries; labelX: number }): React.JSX.Element {
  const end = series.points.at(-1);
  const style = { color: colourOf(series) };
  return (
    <g className={styles.series} data-neutral={series.colour === null} style={style}>
      <path className={styles.line} d={series.path} />
      {series.points.map((point) => (
        <circle key={point.band} className={styles.point} cx={point.x} cy={point.y} r={4} />
      ))}
      {end !== undefined && (
        <>
          {/* From the end of the line to its name when the name had to move away. */}
          <line
            className={styles.leader}
            x1={end.x + 6}
            y1={end.y}
            x2={labelX - 4}
            y2={series.labelY}
          />
          <text className={styles.endLabel} x={labelX} y={series.labelY} dy="0.32em">
            {series.label}
          </text>
        </>
      )}
    </g>
  );
}

function Legend({ series }: { series: readonly LineSeries[] }): React.JSX.Element {
  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers (WCAG 1.3.1)
    <ul role="list" className={styles.legend} aria-label={es.voters.section.chart.legend}>
      <li className={styles.censusKey}>
        <span className={styles.censusSwatch} aria-hidden="true" />
        <span className={styles.legendName}>{es.voters.section.chart.census}</span>
      </li>
      {series.map((s) => (
        <li key={s.groupId} data-neutral={s.colour === null} style={{ color: colourOf(s) }}>
          <span className={styles.key} aria-hidden="true" />
          <span className={styles.legendName}>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Every group's share in the band pointed at, highest first, with the band's facts. */
function Tooltip(props: {
  band: BandView;
  series: readonly LineSeries[];
  x: number;
  flip: boolean;
}): React.JSX.Element {
  const rows = props.series
    .flatMap((s) => {
      const point = s.points.find((p) => p.band === props.band.index);
      return point === undefined ? [] : [{ series: s, point }];
    })
    .sort((a, b) => a.point.y - b.point.y);
  return (
    <div
      className={styles.tooltip}
      data-flip={props.flip}
      style={{ left: props.x }}
      aria-live="polite"
    >
      <p className={styles.tooltipTitle}>{props.band.name}</p>
      {props.band.range !== null && <p className={styles.tooltipFact}>{props.band.range}</p>}
      <p className={styles.tooltipFact}>{props.band.size}</p>
      {props.band.blank !== null && <p className={styles.tooltipFact}>{props.band.blank}</p>}
      {rows.length === 0 ? (
        <p className={styles.tooltipFact}>{es.voters.band.empty}</p>
      ) : (
        <ul>
          {rows.map(({ series, point }) => (
            <li
              key={series.groupId}
              data-neutral={series.colour === null}
              style={{ color: colourOf(series) }}
            >
              <span className={styles.key} aria-hidden="true" />
              <span className={styles.tooltipName}>{series.label}</span>
              <span className={styles.tooltipValue}>{point.percent}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The width of the box, followed as it changes; a fixed width where it cannot be measured. */
function useWidth(box: React.RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(FALLBACK_WIDTH_PX);
  useEffect(() => {
    const element = box.current;
    if (element === null || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(([entry]) => {
      const measured = Math.floor(entry?.contentRect.width ?? 0);
      if (measured > 0) setWidth(measured);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [box]);
  return width;
}
