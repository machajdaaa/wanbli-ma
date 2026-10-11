import { formatNumber, formatPlural, formatRelativeTime, Translate } from './format';
import cs from '../../../../public/assets/i18n/cs.json';

// Minimal interpolating lookup over the real cs.json, so the expected strings
// are exactly what users see.
const t: Translate = (key, params = {}) => {
  const template = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], cs);
  return String(template).replace(/{{\s*(\w+)\s*}}/g, (_, name) => String(params[name]));
};

describe('format', () => {
  const locale = 'cs-CZ';
  // Sunday 11 October 2026, 12:00 local time.
  const now = new Date(2026, 9, 11, 12, 0);
  // Intl uses a non-breaking space in cs dates; normalize for readable expectations.
  const plain = (s: string) => s.replace(/ /g, ' ');

  describe('formatRelativeTime', () => {
    it('formats today and yesterday', () => {
      expect(formatRelativeTime(new Date(2026, 9, 11, 9, 0), locale, t, now)).toBe('dnes 9:00');
      expect(formatRelativeTime(new Date(2026, 9, 10, 17, 40), locale, t, now)).toBe('včera 17:40');
    });

    it('uses the weekday within the last week', () => {
      expect(formatRelativeTime(new Date(2026, 9, 7, 16, 5), locale, t, now)).toBe('středa 16:05');
    });

    it('uses day and month this year, full date in older years', () => {
      expect(plain(formatRelativeTime(new Date(2026, 9, 4, 14, 30), locale, t, now))).toBe('4. 10. 14:30');
      expect(plain(formatRelativeTime(new Date(2025, 9, 4, 14, 30), locale, t, now))).toBe('4. 10. 2025');
    });

    it('returns an empty string for invalid input', () => {
      expect(formatRelativeTime('not a date', locale, t, now)).toBe('');
    });
  });

  it('formats decimals with a comma', () => {
    expect(formatNumber(11.25, locale)).toBe('11,25');
    expect(plain(formatNumber(1234, locale))).toBe('1 234');
  });

  it('picks Czech plural forms', () => {
    expect(formatPlural(1, 'feathers', locale, t)).toBe('1 pero');
    expect(formatPlural(2, 'feathers', locale, t)).toBe('2 pera');
    expect(formatPlural(5, 'feathers', locale, t)).toBe('5 per');
    expect(formatPlural(0, 'feathers', locale, t)).toBe('0 per');
  });
});
