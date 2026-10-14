import { useId } from "react";
import { Link } from "react-router";

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { CommunityLook } from "./community-look";
import { CommunityList } from "./CommunityList";
import { cssBackground, svgFill } from "./fill-style";
import { MapLegend } from "./MapLegend";
import { MapPatterns } from "./MapPatterns";
import type { Box, MapLayout, ProjectedCommunity } from "./projection";

import styles from "./CommunityMap.module.css";

// A territory whose drawing fits in less than this (user units) gets an HTML marker of a real
// 32 px instead of an SVG link: SVG units shrink with the screen (ADR-0013, WCAG 2.5.8).
const MARKER_BELOW = 12;

export interface CommunityMapProps {
  caption: string;
  layout: MapLayout;
  looks: ReadonlyMap<string, CommunityLook>;
  attribution: string;
  hrefOf: (territoryId: string) => string;
  /** The communities to emphasise (the others fade); null or absent: all the same. */
  highlight?: ReadonlySet<string> | null;
  /** The party legend and the list of communities. Off where the page draws its own. */
  showLegend?: boolean;
  showList?: boolean;
}

/** The map of the communities: one link per community, coloured by who governs (ADR-0013). */
export function CommunityMap(props: CommunityMapProps): React.JSX.Element {
  const { caption, layout, looks, attribution, hrefOf, highlight = null } = props;
  const { showLegend = true, showList = true } = props;
  const classOf = (id: string, base: string): string =>
    highlight !== null && !highlight.has(id) ? `${base} ${styles.dimmed ?? ""}` : base;
  const captionId = useId();
  const drawn = layout.communities.map((c) => ({ shape: c, look: lookOf(looks, c.id) }));
  const isSmall = (c: ProjectedCommunity): boolean =>
    Math.max(c.bounds.width, c.bounds.height) < MARKER_BELOW;

  return (
    <figure className={styles.figure} aria-labelledby={captionId}>
      <figcaption id={captionId} className={styles.caption}>
        {caption}
      </figcaption>
      <div className={styles.canvas}>
        <svg
          className={styles.map}
          viewBox={`0 0 ${String(layout.viewBox.width)} ${String(layout.viewBox.height)}`}
          role="group"
          aria-labelledby={captionId}
        >
          <MapPatterns looks={drawn.map((d) => d.look)} />
          <rect
            className={styles.inset}
            {...boxAttributes(layout.canaryInset)}
            aria-hidden="true"
          />
          {drawn.map(({ shape, look }) =>
            isSmall(shape) ? (
              <path
                key={shape.id}
                d={shape.path}
                fill={svgFill(look.fill)}
                className={classOf(shape.id, "")}
                aria-hidden="true"
              />
            ) : (
              <Link
                key={shape.id}
                to={hrefOf(shape.id)}
                className={classOf(shape.id, styles.community ?? "")}
                aria-label={look.label}
              >
                <title>{look.label}</title>
                <path className={styles.outer} d={shape.path} fill={svgFill(look.fill)} />
                <path className={styles.inner} d={shape.path} />
              </Link>
            ),
          )}
        </svg>
        {drawn
          .filter(({ shape }) => isSmall(shape))
          .map(({ shape, look }) => (
            <Link
              key={shape.id}
              to={hrefOf(shape.id)}
              className={classOf(shape.id, styles.marker ?? "")}
              aria-label={look.label}
              title={look.label}
              style={{
                left: `${String((shape.centroid[0] / layout.viewBox.width) * 100)}%`,
                top: `${String((shape.centroid[1] / layout.viewBox.height) * 100)}%`,
                background: cssBackground(look.fill),
              }}
            />
          ))}
      </div>
      {showLegend && <MapLegend looks={drawn.map((d) => d.look)} />}
      {showList && <CommunityList looks={[...looks.values()]} hrefOf={hrefOf} />}
      <p className={styles.attribution}>
        {formatMessage(es.map.figure.boundaries, { attribution })}
      </p>
    </figure>
  );
}

function lookOf(looks: ReadonlyMap<string, CommunityLook>, id: string): CommunityLook {
  const look = looks.get(id);
  if (look === undefined) throw new Error(`no government data for ${id}`);
  return look;
}

function boxAttributes(box: Box): { x: number; y: number; width: number; height: number } {
  return { x: box.x, y: box.y, width: box.width, height: box.height };
}
