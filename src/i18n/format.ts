/**
 * Fills the `{name}` placeholders of a string from `es.ts`. A placeholder without a value is
 * an error, not an empty gap: a half-filled sentence about a government would be wrong.
 */
export function formatMessage(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = values[key];
    if (value === undefined) {
      throw new Error(`missing value for {${key}} in "${template}"`);
    }
    return value;
  });
}

const conjunction = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

/** "PP", "CC y PP", "Contigo-Zurekin, Geroa Bai y PSOE": the list in Spanish, in the given order. */
export function listInSpanish(items: readonly string[]): string {
  return conjunction.format(items);
}
