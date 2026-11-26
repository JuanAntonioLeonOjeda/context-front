import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  articleNodes,
  createSimulation,
  extent,
  fitShift,
  graphLinks,
  keepInside,
  MARGIN_PX,
  LABEL_WIDTH_PX,
  moveBy,
  setGraph,
  settle,
  storyNodes,
  type GraphNode,
  type GraphSimulation,
} from "./graph-layout";
import type { TreeNodeData } from "./tree-api";

const DRAG_START_PX = 5; // a press that moves less than this is a click, not a drag

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export interface ForceGraph {
  nodes: readonly GraphNode[]; // the stories and, when one is open, its news
  width: number;
  height: number;
  /** Pointer handlers of a story's button: a press that moves drags it, one that does not clicks. */
  dragHandlers: (node: GraphNode) => {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  };
  /** True once for the click that ends a drag, so the drag does not also open the story. */
  takeDragClick: () => boolean;
}

interface Drag {
  node: GraphNode;
  offsetX: number; // from the pointer to the node's centre, so it does not jump to the pointer
  offsetY: number;
  startX: number;
  startY: number;
  moved: boolean;
}

/**
 * The live graph of a tree: the first picture settled at once (graph-layout.ts), then a
 * simulation that keeps running to follow a dragged story and to make room for the news of the open
 * one. With reduced motion nothing animates: a dragged story moves alone, with its news, and the news
 * of an open story appear already placed.
 */
export function useForceGraph(
  nodes: readonly TreeNodeData[],
  openId: number | null,
  container: React.RefObject<HTMLDivElement | null>,
): ForceGraph {
  const [, setFrame] = useState(0);
  const redraw = useCallback(() => {
    setFrame((frame) => frame + 1);
  }, []);
  const drag = useRef<Drag | null>(null);
  const dragClick = useRef(false);

  const graph = useMemo(() => {
    const stories = storyNodes(nodes);
    const simulation = createSimulation(stories, graphLinks(nodes, null));
    settle(simulation);
    moveBy(stories, fitShift(stories));
    return { simulation, stories, size: extent(stories) };
  }, [nodes]);

  useEffect(() => {
    const { simulation } = graph;
    simulation.on("tick", () => {
      keepInside(simulation.nodes());
      redraw();
    });
    return () => {
      simulation.on("tick", null);
      simulation.stop();
    };
  }, [graph, redraw]);

  const shownOpen = useRef<number | null>(null);
  useEffect(() => {
    if (shownOpen.current === openId) return;
    shownOpen.current = openId;
    openStory(graph.simulation, graph.stories, nodes, openId);
    if (!prefersReducedMotion()) {
      graph.simulation.alpha(0.3).restart();
      return;
    }
    settle(graph.simulation, 120);
    keepInside(graph.simulation.nodes());
    // Drawn on the next frame, as an animated tick would be.
    const frame = requestAnimationFrame(redraw);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [graph, nodes, openId, redraw]);

  const toGraph = (event: React.PointerEvent): { x: number; y: number } => {
    const rect = container.current?.getBoundingClientRect();
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
  };

  const dragHandlers: ForceGraph["dragHandlers"] = (node) => ({
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      const at = toGraph(event);
      drag.current = {
        node,
        offsetX: (node.x ?? 0) - at.x,
        offsetY: (node.y ?? 0) - at.y,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      // The moves keep coming to this button even when the pointer is faster than the node.
      if (typeof event.currentTarget.setPointerCapture === "function") {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    },
    onPointerMove: (event) => {
      const current = drag.current;
      if (current?.node !== node) return;
      const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY);
      if (!current.moved && distance < DRAG_START_PX) return;
      current.moved = true;
      const at = toGraph(event);
      const x = Math.max(at.x + current.offsetX, MARGIN_PX + LABEL_WIDTH_PX / 2);
      const y = Math.max(at.y + current.offsetY, MARGIN_PX + node.radius);
      if (prefersReducedMotion()) {
        moveWithNews(graph.simulation, node, x, y);
        redraw();
        return;
      }
      // Pinned where the pointer is; the others react around it.
      node.fx = x;
      node.fy = y;
      graph.simulation.alphaTarget(0.3).restart();
    },
    onPointerUp: () => {
      endDrag();
    },
    onPointerCancel: () => {
      endDrag();
    },
  });

  function endDrag(): void {
    const current = drag.current;
    drag.current = null;
    if (current?.moved !== true) return;
    // It stays where it was dropped (fx, fy stay set); the others settle around it.
    dragClick.current = true;
    graph.simulation.alphaTarget(0);
  }

  const nodesNow = graph.simulation.nodes();
  const size = extent(nodesNow);
  return {
    nodes: nodesNow,
    width: Math.max(graph.size.width, size.width),
    height: Math.max(graph.size.height, size.height),
    dragHandlers,
    takeDragClick: () => {
      const was = dragClick.current;
      dragClick.current = false;
      return was;
    },
  };
}

/** The stories, plus the news of the open one in a ring around it; the others' news go away. */
function openStory(
  simulation: GraphSimulation,
  stories: GraphNode[],
  nodes: readonly TreeNodeData[],
  openId: number | null,
): void {
  const story = stories.find((s) => s.storyId === openId);
  const data = nodes.find((n) => n.storyId === openId);
  if (story === undefined || data === undefined) {
    setGraph(simulation, stories, graphLinks(nodes, null));
    return;
  }
  const count = data.articles.length;
  setGraph(
    simulation,
    [...stories, ...articleNodes(story, count)],
    graphLinks(nodes, { storyId: story.storyId, count }),
  );
}

/** Without animation: the dragged story and its news move together, nothing else moves. */
function moveWithNews(simulation: GraphSimulation, node: GraphNode, x: number, y: number): void {
  const dx = x - (node.x ?? 0);
  const dy = y - (node.y ?? 0);
  for (const n of simulation.nodes()) {
    if (n === node || (n.kind === "article" && n.storyId === node.storyId)) {
      n.x = (n.x ?? 0) + dx;
      n.y = (n.y ?? 0) + dy;
    }
  }
  node.fx = node.x;
  node.fy = node.y;
}
