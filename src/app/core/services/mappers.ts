/*
 * Shared API → view-model mapping helpers.
 */
import { Light, isLight } from '../models/light';
import { PersonVm } from '../models/view-models';

export function displayName(user: { firstName?: string | null; lastName?: string | null; nickname?: string | null }): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.nickname || '';
}

export function toPerson(
  user: { id: number; nickname?: string | null; firstName?: string | null; lastName?: string | null; profilePicture?: string | null },
  meId: number | null,
): PersonVm {
  return {
    id: user.id,
    name: displayName(user),
    nickname: user.nickname ?? null,
    avatarUrl: user.profilePicture ?? null,
    isMe: user.id === meId,
  };
}

/**
 * Category code from API light + section: 1 + "A" → "1A". Tolerates a section
 * that already carries the light ("1A") since the format isn't confirmed yet
 * (redesign-plan R7).
 */
export function categoryCode(light: number, section: string): string {
  const trimmed = section.trim().toUpperCase();
  return /^\d/.test(trimmed) ? trimmed : `${light}${trimmed}`;
}

/** Section part of a category code: "1A" → "A", "3AA" → "AA". */
export function sectionOf(code: string): string {
  return code.replace(/^\d+/, '');
}

export function toLight(value: number | undefined): Light {
  return isLight(value) ? value : 1;
}

/** Lowercase, strip diacritics — for accent-insensitive search ("bylinkove" finds "Bylinkové"). */
export function normalizeSearch(text: string): string {
  return text
    .toLocaleLowerCase('cs')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
