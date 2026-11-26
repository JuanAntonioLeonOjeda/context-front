import { useEffect, useId, useMemo, useRef, useState } from "react";

import { ExternalLink } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatCount, formatMessage } from "@/i18n/format";

import { ARTICLE_LABEL_WIDTH_PX, LABEL_WIDTH_PX, type GraphNode } from "./graph-layout";
import { nodeText, type NodeText } from "./story-tree";
import type { TreeNodeData } from "./tree-api";
import { useForceGraph } from "./useForceGraph";

import styles from "./TreeGraph.module.css";

/**
 * The tree as a graph: a circle per story with the headline of its first article under it, a line
 * from each story to the one it continues with how alike they are. A click on a story (or Enter)
 * opens its news as small nodes around it, each a link to the outlet; one story open at a time,
 * Escape closes it. A story can be dragged and the rest of the graph makes room.
 *
 * The lines and the places are a drawing; what a reader needs is in the buttons and links, in time
 * order: the keyboard and a screen reader go through the stories oldest first, each button says
 * which story it continues and how alike they are, and the news of an open story come right after
 * its button. Dragging is an extra for the pointer: nothing is reached only by dragging.
 */
export function TreeGraph({ nodes }: { nodes: readonly TreeNodeData[] }): React.JSX.Element {
  const [openId, setOpenId] = useState<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const graph = useForceGraph(nodes, openId, container);
  const texts = useMemo(() => new Map(nodes.map((n) => [n.storyId, nodeText(n)])), [nodes]);
  const data = useMemo(() => new Map(nodes.map((n) => [n.storyId, n])), [nodes]);

  useEffect(() => {
    if (openId === null) return;
    const close = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("keydown", close);
    };
  }, [openId]);

  const stories = graph.nodes.filter((n) => n.kind === "story");
  const news = graph.nodes.filter((n) => n.kind === "article");
  const at = new Map(graph.nodes.map((n) => [n.id, n]));

  return (
    <div
      ref={container}
      className={styles.graph}
      style={{ width: graph.width, height: graph.height }}
    >
      <svg
        className={styles.edges}
        width={graph.width}
        height={graph.height}
        aria-hidden="true"
        focusable="false"
      >
        {nodes.map((node) => {
          const from =
            node.parentStoryId === null ? undefined : at.get(`s-${String(node.parentStoryId)}`);
          const to = at.get(`s-${String(node.storyId)}`);
          if (from === undefined || to === undefined) return null;
          return (
            <StoryEdge key={node.storyId} from={from} to={to} similarity={node.linkSimilarity} />
          );
        })}
        {news.map((article) => {
          const story = at.get(`s-${String(article.storyId)}`);
          if (story === undefined) return null;
          return (
            <line
              key={article.id}
              className={styles.newsEdge}
              x1={story.x}
              y1={story.y}
              x2={article.x}
              y2={article.y}
            />
          );
        })}
      </svg>
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers (WCAG 1.3.1) */}
      <ul role="list" className={styles.nodes}>
        {stories.map((story) => {
          const node = data.get(story.storyId);
          const text = texts.get(story.storyId);
          if (node === undefined || text === undefined) return null;
          const parent = node.parentStoryId === null ? undefined : texts.get(node.parentStoryId);
          return (
            <StoryNode
              key={story.id}
              story={story}
              node={node}
              text={text}
              parentHeadline={parent?.first.headline ?? null}
              isOpen={openId === story.storyId}
              news={openId === story.storyId ? news : []}
              dragHandlers={graph.dragHandlers(story)}
              onToggle={() => {
                if (graph.takeDragClick()) return;
                setOpenId(openId === story.storyId ? null : story.storyId);
              }}
            />
          );
        })}
      </ul>
    </div>
  );
}

function StoryEdge(props: {
  from: GraphNode;
  to: GraphNode;
  similarity: number | null;
}): React.JSX.Element {
  const { from, to } = props;
  const x1 = from.x ?? 0;
  const y1 = from.y ?? 0;
  const x2 = to.x ?? 0;
  const y2 = to.y ?? 0;
  const middleX = (x1 + x2) / 2;
  return (
    <g>
      <path
        className={styles.edge}
        d={`M ${String(x1)} ${String(y1)} C ${String(middleX)} ${String(y1)}, ${String(middleX)} ${String(y2)}, ${String(x2)} ${String(y2)}`}
      />
      {props.similarity !== null && (
        <text className={styles.edgeLabel} x={middleX} y={(y1 + y2) / 2 - 6} textAnchor="middle">
          {props.similarity.toLocaleString("es", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </text>
      )}
    </g>
  );
}

function StoryNode(props: {
  story: GraphNode;
  node: TreeNodeData;
  text: NodeText;
  parentHeadline: string | null;
  isOpen: boolean;
  news: readonly GraphNode[]; // placed by the graph a moment after the story opens
  dragHandlers: ReturnType<ReturnType<typeof useForceGraph>["dragHandlers"]>;
  onToggle: () => void;
}): React.JSX.Element {
  const { story, text } = props;
  const listId = useId();
  const { isOpen } = props;
  const all = [text.first, ...text.rest];
  const left = (story.x ?? 0) - LABEL_WIDTH_PX / 2;
  const top = (story.y ?? 0) - story.radius;
  return (
    <li
      className={styles.node}
      data-open={isOpen}
      data-root={props.node.parentStoryId === null}
      style={{ left, top, width: LABEL_WIDTH_PX }}
    >
      <button
        type="button"
        className={styles.nodeButton}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={props.onToggle}
        {...props.dragHandlers}
      >
        <span
          className={styles.circle}
          style={{ width: story.radius * 2, height: story.radius * 2 }}
          aria-hidden="true"
        />
        <span className={styles.day}>{text.day}</span>
        <span className={styles.headline}>{text.first.headline}</span>
        <span className={styles.count}>{formatCount(es.stories.tree.articles, all.length)}</span>
        {props.parentHeadline !== null && text.link !== null && (
          <span className={styles.visuallyHidden}>
            {formatMessage(es.stories.tree.continues, {
              headline: props.parentHeadline,
              similarity: text.link,
            })}
          </span>
        )}
      </button>
      {isOpen && (
        // The news around the story: placed by the graph, read right after the story's button.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers (WCAG 1.3.1)
        <ul
          id={listId}
          role="list"
          className={styles.news}
          aria-label={formatMessage(es.stories.tree.articlesOf, { headline: text.first.headline })}
        >
          {props.news.map((article, index) => {
            const item = all[index];
            if (item === undefined) return null;
            return (
              <li
                key={article.id}
                className={styles.newsNode}
                style={{
                  left: (article.x ?? 0) - left - ARTICLE_LABEL_WIDTH_PX / 2,
                  top: (article.y ?? 0) - top - article.radius,
                  width: ARTICLE_LABEL_WIDTH_PX,
                }}
              >
                <span className={styles.newsCircle} aria-hidden="true" />
                <span className={styles.outlet}>{item.outletName}</span>
                <ExternalLink href={item.url} className={styles.newsHeadline}>
                  {item.headline}
                </ExternalLink>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
