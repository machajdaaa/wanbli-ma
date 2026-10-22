import { categoryCode, displayName, normalizeSearch, sectionOf } from './mappers';

describe('mappers', () => {
  it('builds category codes from light + section, tolerating either section format', () => {
    expect(categoryCode(1, 'A')).toBe('1A');
    expect(categoryCode(3, 'aa')).toBe('3AA');
    expect(categoryCode(4, '4Q')).toBe('4Q');
    expect(sectionOf('3AA')).toBe('AA');
  });

  it('prefers the full name and falls back to the nickname', () => {
    expect(displayName({ firstName: 'Tereza', lastName: 'Svobodová', nickname: 'Terka' })).toBe('Tereza Svobodová');
    expect(displayName({ firstName: '', lastName: '', nickname: 'Terka' })).toBe('Terka');
    expect(displayName({ nickname: 'Kuba' })).toBe('Kuba');
  });

  it('normalizes text for accent-insensitive search', () => {
    expect(normalizeSearch('  Bylinkové ČAJE ')).toBe('bylinkove caje');
    expect(normalizeSearch('Běh')).toBe(normalizeSearch('beh'));
  });
});
