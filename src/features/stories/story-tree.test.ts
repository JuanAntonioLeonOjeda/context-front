import { describe, expect, it } from "vitest";

import { buildTree, nodeText, treePath } from "./story-tree";
import type { TreeNodeData } from "./tree-api";

function node(storyId: number, parentStoryId: number | null, similarity: number | null = 0.8) {
  return {
    storyId,
    parentStoryId,
    linkSimilarity: parentStoryId === null ? null : similarity,
    startedAt: "2026-10-12T11:46:00Z",
    articles: [
      {
        outletId: "a",
        outletName: "A",
        headline: "H1",
        url: "https://a.example/1",
        publishedAt: "",
      },
      {
        outletId: "b",
        outletName: "B",
        headline: "H2",
        url: "https://b.example/1",
        publishedAt: "",
      },
      {
        outletId: "b",
        outletName: "B",
        headline: "H3",
        url: "https://b.example/2",
        publishedAt: "",
      },
    ],
  } satisfies TreeNodeData;
}

describe("buildTree", () => {
  it("nests each story under the one it continues, keeping the order of the nodes", () => {
    const root = buildTree([node(1, null), node(2, 1), node(3, 1), node(4, 2)]);

    expect(root.node.storyId).toBe(1);
    expect(root.children.map((c) => c.node.storyId)).toEqual([2, 3]);
    expect(root.children[0]?.children.map((c) => c.node.storyId)).toEqual([4]);
  });

  it("refuses a tree with two roots, none, or a parent that is not in it", () => {
    expect(() => buildTree([node(1, null), node(2, null)])).toThrow(/more than one root/);
    expect(() => buildTree([node(2, 1)])).toThrow(/not in the tree/);
    expect(() => buildTree([])).toThrow(/no root/);
  });
});

describe("nodeText", () => {
  it("counts outlets and not articles, and dates the node in Spain", () => {
    const text = nodeText(node(2, 1, 0.766));

    expect(text.heading).toBe("Cubierta por 2 medios");
    expect(text.started).toBe("Desde el 12 de octubre de 2026, 13:46");
    expect(text.link).toBe("Relación con la anterior: 0,77");
  });

  it("says nothing about a link for the root", () => {
    expect(nodeText(node(1, null)).link).toBeNull();
  });
});

it("builds the path of the tree page", () => {
  expect(treePath(37)).toBe("/arbol/37");
});
