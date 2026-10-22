/** 1.–4. světlo. */
export type Light = 1 | 2 | 3 | 4;

export const LIGHTS: readonly Light[] = [1, 2, 3, 4];

export function isLight(value: unknown): value is Light {
  return value === 1 || value === 2 || value === 3 || value === 4;
}
