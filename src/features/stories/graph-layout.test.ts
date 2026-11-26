import { describe, expect, it } from "vitest";

import tree from "@/test/fixtures/story-37-tree.json";

import { LABEL_WIDTH_PX, layoutGraph, nodeRadius } from "./graph-layout";
import type { TreeNodeData } from "./tree-api";

// The fixture is a real API answer: six stories, 4 the root, 37 with three children.
const nodes: TreeNodeData[] = tree.nodes.map((node) => ({
  storyId: node.story_id,
  parentStoryId: node.parent_story_id,
  linkSimilarity: node.link_similarity,
  startedAt: node.started_at,
  articles: node.articles.map((a) => ({
    outletId: a.outlet_id,
    outletName: a.outlet_name,
    headline: a.headline,
    url: a.url,
    publishedAt: a.published_at,
  })),
}));

function placed(layout: ReturnType<typeof layoutGraph>, id: number) {
  const node = layout.nodes.get(id);
  if (node === undefined) throw new Error(`story ${String(id)} not placed`);
  return node;
}

describe("layoutGraph", () => {
  it("gives the same picture every time for the same tree", () => {
    expect(layoutGraph(nodes)).toEqual(layoutGraph(nodes));
  });

  it("places every story, each inside the picture with its whole label", () => {
    const layout = layoutGraph(nodes);

    expect(layout.nodes.size).toBe(6);
    for (const node of layout.nodes.values()) {
      expect(node.x - LABEL_WIDTH_PX / 2).toBeGreaterThanOrEqual(0);
      expect(node.x + LABEL_WIDTH_PX / 2).toBeLessThanOrEqual(layout.width);
      expect(node.y - node.radius).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThan(layout.height);
    }
  });

  it("keeps the labels of any two stories apart", () => {
    const all = [...layoutGraph(nodes).nodes.values()];

    for (const [i, a] of all.entries()) {
      for (const b of all.slice(i + 1)) {
        // The collision keeps about a label's width between centres; it is soft, so a margin.
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(LABEL_WIDTH_PX * 0.8);
      }
    }
  });

  it("puts each story to the right of the one it continues: time still reads left to right", () => {
    const layout = layoutGraph(nodes);

    for (const edge of layout.edges) {
      expect(placed(layout, edge.childId).x).toBeGreaterThan(placed(layout, edge.parentId).x);
    }
  });

  it("draws one line per relation, from the earlier story, with its similarity", () => {
    const { edges } = layoutGraph(nodes);

    expect(edges.map((e) => [e.parentId, e.childId])).toEqual([
      [4, 37],
      [37, 57],
      [4, 52],
      [37, 76],
      [37, 125],
    ]);
    expect(edges[0]?.similarity).toBeCloseTo(0.766, 3);
  });

  it("makes a story told by more articles a bigger circle, growing by area", () => {
    expect(nodeRadius(1)).toBe(12);
    expect(nodeRadius(4)).toBe(16);
    expect(nodeRadius(9)).toBe(20);
  });
});
