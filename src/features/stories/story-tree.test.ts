import { describe, expect, it } from "vitest";

import { buildTree, firstArticle, nodeText, treePath } from "./story-tree";
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
        publishedAt: "2026-10-12T12:30:00Z",
      },
      {
        outletId: "b",
        outletName: "B",
        headline: "H2",
        url: "https://b.example/1",
        publishedAt: "2026-10-12T11:46:00Z",
      },
      {
        outletId: "b",
        outletName: "B",
        headline: "H3",
        url: "https://b.example/2",
        publishedAt: "2026-10-12T13:00:00Z",
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
  it("shows the first article published, not the first by outlet, and keeps the others apart", () => {
    const text = nodeText(node(2, 1, 0.766));

    expect(text.first.headline).toBe("H2"); // 11:46 UTC, from outlet b: the earliest
    expect(text.rest.map((a) => a.headline)).toEqual(["H1", "H3"]);
  });

  it("counts the other outlets and not the other articles", () => {
    expect(nodeText(node(2, 1)).moreOutlets).toBe("1 medio más"); // H1 (a) and H3 (b, as H2)
  });

  it("does not say 'medio' when the other articles are all from the first one's outlet", () => {
    const same = node(2, 1);
    const articles = same.articles.filter((a) => a.outletId === "b"); // H2 (first) and H3, both b

    expect(nodeText({ ...same, articles }).moreOutlets).toBe("1 noticia más de este medio");
  });

  it("dates the node in Spain and says the similarity with the previous one", () => {
    const text = nodeText(node(2, 1, 0.766));

    expect(text.started).toBe("Desde el 12 de octubre de 2026, 13:46");
    expect(text.link).toBe("Relación con la anterior: 0,77");
  });

  it("says nothing about a link for the root, and nothing more for a lone article", () => {
    const lone = { ...node(1, null), articles: node(1, null).articles.slice(0, 1) };

    expect(nodeText(node(1, null)).link).toBeNull();
    expect(nodeText(lone).moreOutlets).toBe("");
    expect(nodeText(lone).rest).toEqual([]);
  });
});

describe("firstArticle", () => {
  it("breaks a tie at the same instant by the lower outlet id", () => {
    const at = "2026-10-12T11:00:00Z";
    const base = { outletName: "", headline: "", url: "https://x.example" };

    const first = firstArticle([
      { ...base, outletId: "b", publishedAt: at },
      { ...base, outletId: "a", publishedAt: at },
    ]);

    expect(first.outletId).toBe("a");
  });
});

it("builds the path of the tree page", () => {
  expect(treePath(37)).toBe("/arbol/37");
});
