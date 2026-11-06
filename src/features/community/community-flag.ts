// One SVG per community, named after the territory id (`ccaa-05.svg`). Wikimedia Commons.
const FLAGS = import.meta.glob<string>("@/assets/flags/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

/** The address of the flag of a community, or null when there is none for that territory. */
export function flagUrl(territoryId: string): string | null {
  const entry = Object.entries(FLAGS).find(([path]) => path.endsWith(`/${territoryId}.svg`));
  return entry === undefined ? null : entry[1];
}
