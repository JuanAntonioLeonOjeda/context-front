/** Which part of the news section is shown, kept in `?vista=`: the finder, the trees, or neither
 *  yet (the choice between the two). In the URL, so the back button and a shared link keep it. */
export const VIEW_PARAM = "vista";
export const NEWS_VIEWS = ["buscador", "arbol"] as const;
export type NewsView = (typeof NEWS_VIEWS)[number];

export function viewOf(value: string | null): NewsView | null {
  return NEWS_VIEWS.find((view) => view === value) ?? null;
}

/** The other view: the one the top of the section offers to go to. */
export function otherView(view: NewsView): NewsView {
  return view === "buscador" ? "arbol" : "buscador";
}
