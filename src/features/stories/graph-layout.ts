/**
 * Where each story of a tree goes in the graph, and the news of an open story around it. A force
 * simulation (d3-force) places them like a network: each link pulls a node towards the one it is
 * joined to, every node pushes the others away and no two labels overlap. One more force keeps
 * time readable: the older a story, the further left it is pulled, so the graph still reads left to
 * right without being a grid.
 *
 * The first picture is computed to its end before anything is drawn, and the same tree always
 * gives the same picture: d3-force starts from fixed positions and its jitter comes from a seeded
 * generator, not from Math.random. After that the simulation stays alive in the view, to follow a
 * dragged node and to make room for the news of an open story.
 */
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type ForceLink,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

import type { TreeNodeData } from "./tree-api";

// The label under a story is this wide; the stories are this far apart in time.
export const LABEL_WIDTH_PX = 176;
export const ARTICLE_LABEL_WIDTH_PX = 140;
export const ARTICLE_RADIUS_PX = 7;
const LABEL_HEIGHT_PX = 96;
const TIME_STEP_PX = 150;
const STORY_DISTANCE_PX = 170;
const ARTICLE_DISTANCE_PX = 120;
export const MARGIN_PX = 16;
const TICKS = 300;

export type GraphNode = SimulationNodeDatum & {
  id: string; // "s-4" for story 4, "a-4-0" for its first article
  storyId: number; // the story, or the story an article belongs to
  kind: "story" | "article";
  radius: number;
  timeX: number; // where time pulls a story; unused for an article
};

type GraphLink = SimulationLinkDatum<GraphNode> & { kind: "story" | "article" };

export type GraphSimulation = Simulation<GraphNode, GraphLink>;

export interface PlacedNode {
  storyId: number;
  x: number; // centre of the circle
  y: number;
  radius: number;
}

export interface PlacedEdge {
  parentId: number;
  childId: number;
  similarity: number;
}

export interface GraphLayout {
  width: number;
  height: number;
  nodes: Map<number, PlacedNode>;
  edges: PlacedEdge[];
}

/** A story told by more articles is a bigger circle; the area grows with them, not the radius. */
export function nodeRadius(articles: number): number {
  return Math.round(8 + 4 * Math.sqrt(articles));
}

export function storyId(id: number): string {
  return `s-${String(id)}`;
}

export function articleId(story: number, index: number): string {
  return `a-${String(story)}-${String(index)}`;
}

/** The stories, oldest first, each starting on the time axis a little staggered. */
export function storyNodes(nodes: readonly TreeNodeData[]): GraphNode[] {
  return [...nodes]
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.storyId - b.storyId)
    .map((node, rank) => ({
      id: storyId(node.storyId),
      storyId: node.storyId,
      kind: "story",
      radius: nodeRadius(node.articles.length),
      timeX: rank * TIME_STEP_PX,
      x: rank * TIME_STEP_PX,
      y: (rank % 3) * 40,
    }));
}

/** The news of a story, in a ring around it: the simulation then moves them out of the way. */
export function articleNodes(story: GraphNode, count: number): GraphNode[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    return {
      id: articleId(story.storyId, index),
      storyId: story.storyId,
      kind: "article",
      radius: ARTICLE_RADIUS_PX,
      timeX: 0,
      x: (story.x ?? 0) + ARTICLE_DISTANCE_PX * Math.cos(angle),
      y: (story.y ?? 0) + ARTICLE_DISTANCE_PX * Math.sin(angle),
    };
  });
}

/** A line from each story to the one it continues, and from an open story to each of its news. */
export function graphLinks(
  nodes: readonly TreeNodeData[],
  open: { storyId: number; count: number } | null,
): GraphLink[] {
  const ids = new Set(nodes.map((n) => n.storyId));
  const stories: GraphLink[] = nodes.flatMap((n) =>
    n.parentStoryId !== null && ids.has(n.parentStoryId)
      ? [{ source: storyId(n.parentStoryId), target: storyId(n.storyId), kind: "story" as const }]
      : [],
  );
  if (open === null) return stories;
  const articles: GraphLink[] = Array.from({ length: open.count }, (_, index) => ({
    source: storyId(open.storyId),
    target: articleId(open.storyId, index),
    kind: "article",
  }));
  return [...stories, ...articles];
}

/** The simulation, stopped: the caller ticks it to the end or restarts it to animate. */
export function createSimulation(nodes: GraphNode[], links: GraphLink[]): GraphSimulation {
  const isStory = (n: GraphNode): boolean => n.kind === "story";
  return (
    forceSimulation<GraphNode, GraphLink>(nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(links)
          .id((n) => n.id)
          .distance((l) => (l.kind === "story" ? STORY_DISTANCE_PX : ARTICLE_DISTANCE_PX)),
      )
      .force(
        "charge",
        forceManyBody<GraphNode>().strength((n) => (isStory(n) ? -500 : -150)),
      )
      // A label is wider than tall: the collision circle covers half its width.
      .force(
        "collide",
        forceCollide<GraphNode>((n) =>
          isStory(n) ? LABEL_WIDTH_PX / 2 + 8 : ARTICLE_LABEL_WIDTH_PX / 2 + 4,
        ),
      )
      .force(
        "time",
        forceX<GraphNode>((n) => n.timeX).strength((n) => (isStory(n) ? 0.4 : 0)),
      )
      .force(
        "middle",
        forceY<GraphNode>(0).strength((n) => (isStory(n) ? 0.05 : 0)),
      )
      .stop()
  );
}

/** Changes which nodes and lines the simulation moves, keeping the places of those that stay. */
export function setGraph(
  simulation: GraphSimulation,
  nodes: GraphNode[],
  links: GraphLink[],
): void {
  simulation.nodes(nodes);
  const link = simulation.force<ForceLink<GraphNode, GraphLink>>("link");
  link?.links(links);
}

/** Runs the simulation to its end, at once. */
export function settle(simulation: GraphSimulation, ticks = TICKS): void {
  simulation.tick(ticks);
}

/** The first picture of a tree, moved so its top-left corner is at the margin and measured. */
export function layoutGraph(nodes: readonly TreeNodeData[]): GraphLayout {
  const simNodes = storyNodes(nodes);
  const simulation = createSimulation(simNodes, graphLinks(nodes, null));
  settle(simulation);
  const shift = fitShift(simNodes);
  moveBy(simNodes, shift);
  const placed = new Map<number, PlacedNode>(
    simNodes.map((n) => [
      n.storyId,
      { storyId: n.storyId, x: Math.round(n.x ?? 0), y: Math.round(n.y ?? 0), radius: n.radius },
    ]),
  );
  const edges: PlacedEdge[] = nodes.flatMap((n) =>
    n.parentStoryId !== null && placed.has(n.parentStoryId)
      ? [{ parentId: n.parentStoryId, childId: n.storyId, similarity: n.linkSimilarity ?? 0 }]
      : [],
  );
  return { ...extent(simNodes), nodes: placed, edges };
}

/** How far to move the nodes so the leftmost label and the top circle start at the margin. */
export function fitShift(nodes: readonly GraphNode[]): { x: number; y: number } {
  return {
    x: MARGIN_PX - Math.min(...nodes.map((n) => (n.x ?? 0) - labelWidth(n) / 2)),
    y: MARGIN_PX - Math.min(...nodes.map((n) => (n.y ?? 0) - n.radius)),
  };
}

export function moveBy(nodes: readonly GraphNode[], shift: { x: number; y: number }): void {
  for (const n of nodes) {
    n.x = (n.x ?? 0) + shift.x;
    n.y = (n.y ?? 0) + shift.y;
  }
}

/** The room the nodes take, labels included, from the top-left corner. */
export function extent(nodes: readonly GraphNode[]): { width: number; height: number } {
  return {
    width: Math.ceil(Math.max(...nodes.map((n) => (n.x ?? 0) + labelWidth(n) / 2)) + MARGIN_PX),
    height: Math.ceil(
      Math.max(...nodes.map((n) => (n.y ?? 0) + n.radius + labelHeight(n))) + MARGIN_PX,
    ),
  };
}

/** Keeps every node, label included, right of and below the margin: nothing is dragged off. */
export function keepInside(nodes: readonly GraphNode[]): void {
  for (const n of nodes) {
    n.x = Math.max(n.x ?? 0, MARGIN_PX + labelWidth(n) / 2);
    n.y = Math.max(n.y ?? 0, MARGIN_PX + n.radius);
  }
}

function labelWidth(n: GraphNode): number {
  return n.kind === "story" ? LABEL_WIDTH_PX : ARTICLE_LABEL_WIDTH_PX;
}

function labelHeight(n: GraphNode): number {
  return n.kind === "story" ? LABEL_HEIGHT_PX : 56;
}
