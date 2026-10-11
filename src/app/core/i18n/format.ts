/*
 * Locale-aware formatting helpers. Pure functions (no DI) so they're easy to
 * test; the pipes in shared/pipes wire them to Transloco and the active locale.
 */

export type Translate = (key: string, params?: Record<string, unknown>) => string;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Post / activity timestamp in the style of the design:
 * "dnes 9:00", "včera 17:40", "neděle 16:05" (within the last week),
 * "4. 10. 14:30" (this year), "4. 10. 2025" (older).
 */
export function formatRelativeTime(
  value: Date | string | number,
  locale: string,
  t: Translate,
  now: Date = new Date(),
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date);
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (daysAgo === 0) return t('time.today', { time });
  if (daysAgo === 1) return t('time.yesterday', { time });
  if (daysAgo > 1 && daysAgo < 7) {
    const day = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
    return t('time.weekday', { day, time });
  }
  if (date.getFullYear() === now.getFullYear()) {
    const shortDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric' }).format(date);
    return t('time.dateTime', { date: shortDate, time });
  }
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric' }).format(date);
}

/** "11,25" / "1 234" – decimal comma and locale grouping. */
export function formatNumber(value: number, locale: string, maxFractionDigits = 2): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: maxFractionDigits }).format(value);
}

/**
 * "1 pero / 2 pera / 5 per". Looks up `plural.<noun>.<category>` where
 * category is the CLDR plural category (cs: one, few, many, other).
 */
export function formatPlural(count: number, noun: string, locale: string, t: Translate): string {
  const category = new Intl.PluralRules(locale).select(count);
  return t(`plural.${noun}.${category}`, { count: formatNumber(count, locale) });
}
