/**
 * Where each community is drawn (ADR-0013). Pure: GeoJSON in, SVG paths and points out.
 *
 * - Peninsula, Balearic Islands, Ceuta and Melilla share one conformal conic projection, so
 *   shapes look as people know them; its standard parallels (37° and 43° N) bracket the
 *   peninsula.
 * - The Canary Islands get their own projection, drawn in a framed inset in a band below the
 *   main map, so the inset can never cover Andalucía, Ceuta or Melilla.
 * - Coordinates are SVG user units in a fixed viewBox; the SVG scales to its container.
 */
import { geoArea, geoConicConformal, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon } from "geojson";

export type CommunityFeature = Feature<MultiPolygon, Record<string, never>> & { id: string };
/** `GET /map/geometry`: one feature per community, keyed by territory id. */
export interface CommunitiesGeometry {
  type: "FeatureCollection";
  attribution: string;
  features: CommunityFeature[];
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProjectedCommunity {
  id: string;
  path: string; // SVG path data
  centroid: readonly [number, number];
}

export interface MapLayout {
  viewBox: Box;
  canaryInset: Box; // the frame around the Canary Islands
  communities: ProjectedCommunity[];
}

export const CANARY_ISLANDS_ID = "ccaa-05";

const WIDTH = 800;
const HEIGHT = 640;
const PAD = 12;
const MAIN_BOTTOM = 528; // the main map ends here; the inset band starts below
const INSET: Box = { x: PAD, y: 536, width: 312, height: 92 };
const INSET_PAD = 6;

export function layoutMap(geometry: CommunitiesGeometry): MapLayout {
  geometry.features.forEach(assertOutwardWinding);
  const canary = geometry.features.filter((f) => f.id === CANARY_ISLANDS_ID);
  const rest = geometry.features.filter((f) => f.id !== CANARY_ISLANDS_ID);

  const main = geoConicConformal()
    .rotate([3.5, 0])
    .parallels([37, 43])
    .fitExtent(
      [
        [PAD, PAD],
        [WIDTH - PAD, MAIN_BOTTOM],
      ],
      collection(rest),
    );
  const inset = geoConicConformal()
    .rotate([15.5, 0])
    .parallels([27.5, 29.5])
    .fitExtent(
      [
        [INSET.x + INSET_PAD, INSET.y + INSET_PAD],
        [INSET.x + INSET.width - INSET_PAD, INSET.y + INSET.height - INSET_PAD],
      ],
      collection(canary),
    );

  return {
    viewBox: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    canaryInset: INSET,
    communities: [...rest.map((f) => project(f, main)), ...canary.map((f) => project(f, inset))],
  };
}

function project(feature: CommunityFeature, projection: GeoProjection): ProjectedCommunity {
  const path = geoPath(projection);
  const [x, y] = path.centroid(feature);
  return { id: feature.id, path: path(feature) ?? "", centroid: [x, y] };
}

function collection(features: CommunityFeature[]): FeatureCollection<MultiPolygon> {
  return { type: "FeatureCollection", features };
}

/**
 * d3-geo works on the sphere: a ring in the opposite winding would be read as the whole
 * globe minus the community, and fitting the projection to it would shrink Spain to a dot.
 * The backend file is wound correctly; this makes a regression loud instead of silent.
 */
function assertOutwardWinding(feature: CommunityFeature): void {
  if (geoArea(feature) > 2 * Math.PI) {
    throw new Error(`community ${feature.id} has inverted rings (d3-geo winding)`);
  }
}
