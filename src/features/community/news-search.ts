/**
 * The search of the news and of the trees: words typed by the reader against the texts a card
 * shows (headline, outlet and time). Pure. Case and accents do not matter ("educacion" finds
 * "Educación"), every word typed has to appear, and the lead is not here: it never reaches the
 * browser.
 */

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Whether every word of `query` is in some of `texts`; an empty query matches everything. */
export function matchesQuery(query: string, ...texts: readonly string[]): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(texts.join(" "));
  return words.every((word) => haystack.includes(word));
}
