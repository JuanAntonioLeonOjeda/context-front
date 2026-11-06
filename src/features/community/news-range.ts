/**
 * The range of days of the news, kept in the URL as `?desde=…&hasta=…` (ISO dates, both included).
 * Pure: dates in, dates out. Without them the API answers its default, the last week. The
 * API takes at most 31 days, so a bound that would break that or the order moves the other one.
 */
export const MAX_RANGE_DAYS = 31;

export interface NewsRange {
  from: string | null;
  to: string | null;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The date of a query parameter, or null when it is missing or not a calendar day. */
export function dayOf(value: string | null): string | null {
  if (value === null || !ISO_DAY.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? null
    : value;
}

function shift(day: string, days: number): string {
  const moved = new Date(`${day}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}

/** `changed` was set to `day`: the other bound follows when the range would be backwards or too long. */
export function withBound(range: NewsRange, changed: "from" | "to", day: string): NewsRange {
  const next = { ...range, [changed]: day };
  const { from, to } = next;
  if (from === null || to === null) return next;
  if (from > to) return changed === "from" ? { from, to: from } : { from: to, to };
  if (shift(from, MAX_RANGE_DAYS - 1) < to) {
    return changed === "from"
      ? { from, to: shift(from, MAX_RANGE_DAYS - 1) }
      : { from: shift(to, -(MAX_RANGE_DAYS - 1)), to };
  }
  return next;
}
