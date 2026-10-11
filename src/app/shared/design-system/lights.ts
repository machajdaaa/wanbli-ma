/** 1.–4. světlo. */
export type Light = 1 | 2 | 3 | 4;

export const LIGHTS: readonly Light[] = [1, 2, 3, 4];

/**
 * Per-light classes. Full class names on purpose — Tailwind only generates
 * classes it can find literally in the source.
 * - dot / bar: the saturated light color (dots, progress bars only)
 * - surface + text: tag background and its dark text
 */
export const LIGHT_STYLES: Record<Light, { roman: string; bg: string; surface: string; text: string; border: string }> = {
  1: { roman: 'I', bg: 'bg-light-1', surface: 'bg-light-1-surface', text: 'text-light-1-text', border: 'border-light-1' },
  2: { roman: 'II', bg: 'bg-light-2', surface: 'bg-light-2-surface', text: 'text-light-2-text', border: 'border-light-2' },
  3: { roman: 'III', bg: 'bg-light-3', surface: 'bg-light-3-surface', text: 'text-light-3-text', border: 'border-light-3' },
  4: { roman: 'IV', bg: 'bg-light-4', surface: 'bg-light-4-surface', text: 'text-light-4-text', border: 'border-light-4' },
};
