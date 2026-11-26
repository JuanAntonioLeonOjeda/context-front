/**
 * The text of a node of the tree. Pure. A node has no title of its own: it shows the headline of
 * the first article published (an objective rule, not a choice of outlet), and all the articles
 * of the story when it is opened.
 */
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { TreeArticle, TreeNodeData } from "./tree-api";

/** The path of the page that shows the tree a story belongs to. */
export function treePath(storyId: number): string {
  return `/arbol/${String(storyId)}`;
}

// The day and the hour a reader in Spain sees.
const spainDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" });
const spainShortDay = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Madrid",
});
const spainTime = new Intl.DateTimeFormat("es", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Madrid",
});

export interface NodeText {
  started: string; // "Desde el 12 de octubre de 2026, 13:46"
  day: string; // "12 oct", under the node of the graph
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
    day: spainShortDay.format(started),
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
