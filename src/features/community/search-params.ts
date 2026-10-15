/** The query string of `params` with `changes` applied, as `?a=b&c=d`: changing one keeps the rest. */
export function searchWith(params: URLSearchParams, changes: Record<string, string>): string {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(changes)) next.set(key, value);
  return `?${next.toString()}`;
}
