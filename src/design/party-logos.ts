// One image per party, named after the party id (`psoe.svg`). Wikimedia Commons, credited in
// the footer and in /como-funciona. Not every party has a usable one: the caller falls back
// to the short name, the same for all of them.
const LOGOS = import.meta.glob<string>("@/assets/parties/*.{svg,png,jpg}", {
  eager: true,
  query: "?url",
  import: "default",
});

/** The address of the logo of a party, or null when there is none for that id. */
export function partyLogoUrl(partyId: string): string | null {
  const entry = Object.entries(LOGOS).find(([path]) =>
    new RegExp(`/${partyId}\\.(svg|png|jpg)$`).test(path),
  );
  return entry === undefined ? null : entry[1];
}
