/**
 * The shape and the text of the tree. Pure: the API's nodes in, nested branches out. A node has no
 * title on purpose: any headline chosen to stand for a story would favour one outlet. It shows how
 * many outlets cover it and each outlet's own headline, in the order the API gives (by outlet).
 */
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { TreeNodeData } from "./tree-api";

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
  heading: string; // "Cubierta por 6 medios"
  started: string; // "12 de octubre de 2026, 13:46"
  link: string | null; // "Relación con la anterior: 0,77", null for the root
}

export function nodeText(node: TreeNodeData): NodeText {
  const outlets = new Set(node.articles.map((article) => article.outletId)).size;
  const started = new Date(node.startedAt);
  return {
    heading: formatMessage(es.stories.tree.coveredBy, { count: String(outlets) }),
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
  };
}
