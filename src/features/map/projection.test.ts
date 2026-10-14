import { describe, expect, it } from "vitest";

import {
  CANARY_ISLANDS_ID,
  layoutMap,
  type Box,
  type CommunitiesGeometry,
  type ProjectedCommunity,
} from "@/features/map/projection";
import geometryResponse from "@/test/fixtures/map-geometry.json";

// The real response of GET /map/geometry (IGN boundaries, 19 communities).
const geometry = geometryResponse as CommunitiesGeometry;
const layout = layoutMap(geometry);
const byId = new Map(layout.communities.map((c) => [c.id, c]));

function community(id: string): ProjectedCommunity {
  const found = byId.get(id);
  if (found === undefined) throw new Error(`no ${id} in the layout`);
  return found;
}

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function inside(point: readonly [number, number], box: Box): boolean {
  const [x, y] = point;
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
}

describe("layoutMap", () => {
  it("draws the 19 communities inside the viewBox", () => {
    expect(layout.communities).toHaveLength(19);
    for (const c of layout.communities) {
      expect(c.path, c.id).not.toBe("");
      expect(inside(c.centroid, layout.viewBox), c.id).toBe(true);
    }
  });

  it("draws the Canary Islands inside their inset", () => {
    const canary = community(CANARY_ISLANDS_ID);
    const bounds = canary.bounds;

    expect(inside(canary.centroid, layout.canaryInset)).toBe(true);
    expect(bounds.x).toBeGreaterThanOrEqual(layout.canaryInset.x);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(
      layout.canaryInset.x + layout.canaryInset.width,
    );
  });

  it("never lets the inset cover another community", () => {
    const others = layout.communities.filter((c) => c.id !== CANARY_ISLANDS_ID);

    for (const c of others) {
      expect(overlaps(c.bounds, layout.canaryInset), c.id).toBe(false);
    }
  });

  it("keeps the map the right way round", () => {
    const [galiciaX] = community("ccaa-12").centroid;
    const [catalunaX] = community("ccaa-09").centroid;
    const [valenciaX] = community("ccaa-10").centroid;
    const [balearesX] = community("ccaa-04").centroid;
    const [, cantabriaY] = community("ccaa-06").centroid;
    const [, andaluciaY] = community("ccaa-01").centroid;

    expect(galiciaX).toBeLessThan(catalunaX);
    expect(valenciaX).toBeLessThan(balearesX);
    expect(cantabriaY).toBeLessThan(andaluciaY); // SVG y grows downwards
  });

  it("refuses a community wound the wrong way instead of drawing the whole globe", () => {
    const [first, ...rest] = geometry.features;
    if (first === undefined) throw new Error("empty fixture");
    const inverted = {
      ...first,
      geometry: {
        ...first.geometry,
        coordinates: first.geometry.coordinates.map((polygon) =>
          polygon.map((ring) => [...ring].reverse()),
        ),
      },
    };

    expect(() => layoutMap({ ...geometry, features: [inverted, ...rest] })).toThrow(
      "inverted rings",
    );
  });
});
