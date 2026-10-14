/**
 * The view of a community page on a small screen, and how it travels in the URL. On a wide
 * screen both views are on the page at once; the parameter only matters below that width.
 * `?view=` and `?sector=` live side by side: changing one keeps the other.
 */
export const VIEWS = ["data", "news"] as const;
export type View = (typeof VIEWS)[number];

/** The view of `?view=`; anything else (or nothing) is the data, the same for everyone. */
export function viewOf(value: string | null): View {
  return VIEWS.find((v) => v === value) ?? "data";
}

/** The query string of `params` with `changes` applied, as `?a=b&c=d`. */
export function searchWith(params: URLSearchParams, changes: Record<string, string>): string {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(changes)) next.set(key, value);
  return `?${next.toString()}`;
}
