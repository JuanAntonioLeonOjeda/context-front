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

const longDate = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-10-14" → "14 de octubre de 2026". The date is a calendar day: read and shown in UTC,
 *  so no time zone can move it to the day before. */
export function formatLongDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`not an ISO date: "${isoDate}"`);
  }
  return longDate.format(parsed);
}

const plural = new Intl.PluralRules("es");

/** "1 comunidad", "14 comunidades": the form of `forms` that Spanish uses for `count`. */
export function formatCount(forms: { one: string; other: string }, count: number): string {
  const template = plural.select(count) === "one" ? forms.one : forms.other;
  return formatMessage(template, { count: String(count) });
}
