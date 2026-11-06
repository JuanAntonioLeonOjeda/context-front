/**
 * The shape and the text of the tree. Pure: the API's nodes in, nested branches out. A node has no
 * title of its own: a card shows the headline of the first article published (an objective rule, not
 * a choice of outlet) and the other outlets' headlines unfold on request.
 */
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { TreeArticle, TreeNodeData } from "./tree-api";

export interface Branch {
  node: TreeNodeData;
  children: Branch[]; // oldest first, as the nodes come
}

/** The path of the page that shows the tree a story belongs to. */
export function treePath(storyId: number): string {
  return `/arbol/${String(storyId)}`;
}

/** Nests the nodes under their parents. A tree has one root and no node without a known parent. */
export function buildTree(nodes: readonly TreeNodeData[]): Branch {
  const branches = new Map<number, Branch>(
    nodes.map((node) => [node.storyId, { node, children: [] }]),
  );
  let root: Branch | undefined;
  for (const branch of branches.values()) {
    const parentId = branch.node.parentStoryId;
    if (parentId === null) {
      if (root) throw new Error("the tree has more than one root");
      root = branch;
      continue;
    }
    const parent = branches.get(parentId);
    if (!parent) throw new Error(`story ${String(parentId)} is not in the tree`);
    parent.children.push(branch);
  }
  if (!root) throw new Error("the tree has no root");
  return root;
}

// The day and the hour a reader in Spain sees.
const spainDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" });
const spainTime = new Intl.DateTimeFormat("es", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Madrid",
});

export interface NodeText {
  started: string; // "Desde el 12 de octubre de 2026, 13:46"
  link: string | null; // "Relación con la anterior: 0,77", null for the root
  first: TreeArticle; // the first article published: the one the card shows
  rest: TreeArticle[]; // the others, as the API sends them (by outlet id)
  moreOutlets: string; // "2 medios más", "1 noticia más de este medio", or "" when there is no other article
}

/** The article published first; at the same instant, the one of the lower outlet id. */
export function firstArticle(articles: readonly TreeArticle[]): TreeArticle {
  const [first] = [...articles].sort(
    (a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.outletId.localeCompare(b.outletId),
  );
  if (!first) throw new Error("a story has at least one article");
  return first;
}

/** "2 medios más"; when every other article is from the first one's outlet, says so instead. */
function moreText(articles: number, outlets: number): string {
  if (articles === 0) return "";
  if (outlets === 0) {
    return formatMessage(
      articles === 1 ? es.stories.tree.sameOutletOne : es.stories.tree.sameOutlet,
      {
        count: String(articles),
      },
    );
  }
  return formatMessage(outlets === 1 ? es.stories.tree.moreOne : es.stories.tree.more, {
    count: String(outlets),
  });
}

export function nodeText(node: TreeNodeData): NodeText {
  const first = firstArticle(node.articles);
  const rest = node.articles.filter((article) => article !== first);
  const otherOutlets = new Set(rest.map((a) => a.outletId).filter((id) => id !== first.outletId));
  const started = new Date(node.startedAt);
  return {
    started: formatMessage(es.stories.tree.started, {
      date: formatLongDate(spainDay.format(started)),
      time: spainTime.format(started),
    }),
    link:
      node.linkSimilarity === null
        ? null
        : formatMessage(es.stories.tree.similarity, {
            value: node.linkSimilarity.toLocaleString("es", { maximumFractionDigits: 2 }),
          }),
    first,
    rest,
    moreOutlets: moreText(rest.length, otherOutlets.size),
  };
}
