import { Light } from '../models/light';

/*
 * MOCK(people stats): the API has no per-user feather count, bio or
 * collection progress for other users, and no leaderboard
 * (docs/backend-requirements.md). Values are derived deterministically from
 * the user id so the same person always shows the same numbers.
 */

function hash(id: number, salt: number): number {
  const x = Math.sin(id * 9301 + salt * 49297) * 233280;
  return Math.abs(Math.floor(x));
}

/** 0–64 feathers. */
export function mockFeatherCount(userId: number): number {
  return hash(userId, 1) % 65;
}

export function mockCollection(userId: number, totals: Record<Light, number>): Record<Light, number> {
  return {
    1: Math.min(totals[1], hash(userId, 11) % 23),
    2: Math.min(totals[2], hash(userId, 12) % 19),
    3: Math.min(totals[3], hash(userId, 13) % 13),
    4: Math.min(totals[4], hash(userId, 14) % 13),
  };
}

const BIOS = [
  'Sprinty, lezení a noční hry. Sbírám grand challenge.',
  'Běhám, stopuju a sbírám pera z atletiky. Letos chci mít celé 1. světlo.',
  'Nejradši mám výpravy a vaření v kotlíku.',
  null,
];

export function mockBio(userId: number): string | null {
  return BIOS[hash(userId, 21) % BIOS.length];
}

/** MOCK(leaderboard): names for a full leaderboard when the group is small. */
export const LEADERBOARD_MOCK_NAMES = [
  'Tereza Svobodová',
  'Matěj Dvořák',
  'Eliška Černá',
  'Vojtěch Procházka',
  'Anežka Kučerová',
  'Ondřej Veselý',
  'Barbora Horáková',
  'Šimon Němec',
  'Klára Marková',
  'Adam Pokorný',
  'Natálie Pospíšilová',
  'Tomáš Hájek',
  'Julie Králová',
  'Filip Jelínek',
  'Kristýna Urbanová',
  'Lukáš Beneš',
  'Sofie Dušková',
  'Jakub Fiala',
  'Ema Kolářová',
  'David Navrátil',
  'Viktorie Čermáková',
  'Matyáš Zeman',
  'Rozálie Kopecká',
  'Daniel Růžička',
  'Amálie Šťastná',
  'Petr Holub',
  'Karolína Vlčková',
  'Martin Kříž',
  'Lucie Sedláčková',
];

/** MOCK(leaderboard): feather counts by rank (1-based index − 1). */
export const LEADERBOARD_MOCK_COUNTS = [
  64, 58, 51, 47, 44, 41, 39, 36, 33, 31, 29, 27, 26, 25, 24, 23, 22, 21, 20, 20, 19, 19, 18, 17, 16, 15, 14, 13, 12,
];

/** MOCK(leaderboard): the current user's rank in the mock leaderboard. */
export const LEADERBOARD_MOCK_MY_RANK = 23;
