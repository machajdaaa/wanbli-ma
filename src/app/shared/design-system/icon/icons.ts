/*
 * Icon set traced from design/screens (Main.dc.html "Ikony · lineární 2 px",
 * NavBar, menus, settings). Outline icons are drawn with stroke="currentColor"
 * at 2 px; `filled` icons use fill="currentColor". Coordinates are for a
 * 24×24 viewBox unless the icon sets its own.
 */

/**
 * How a shape is painted. Defaults to 'stroke' (or 'fill' for `filled` icons).
 * `accent` strokes use --app-icon-accent (the active navbar pill background),
 * e.g. the vein of the filled feather.
 */
export interface ShapePaint {
  paint?: 'stroke' | 'fill' | 'both';
  accent?: boolean;
  strokeWidth?: number;
}

export type IconShape = ShapePaint &
  (
    | { tag: 'path'; d: string }
    | { tag: 'circle'; cx: number; cy: number; r: number }
    | { tag: 'rect'; x: number; y: number; width: number; height: number; rx: number }
  );

export interface IconDef {
  shapes: IconShape[];
  /** Solid icon (fill instead of stroke). */
  filled?: boolean;
  viewBox?: string;
}

const p = (d: string, paint: ShapePaint = {}): IconShape => ({ tag: 'path', d, ...paint });
const c = (cx: number, cy: number, r: number, paint: ShapePaint = {}): IconShape => ({ tag: 'circle', cx, cy, r, ...paint });
const r = (x: number, y: number, width: number, height: number, rx: number): IconShape => ({
  tag: 'rect',
  x,
  y,
  width,
  height,
  rx,
});

const FEATHER_D = 'M20 4c-7.5.3-12.6 5.2-13 12.5L7 20l3.4-.1C17.4 19.4 20.5 12 20 4Z';

export const ICONS = {
  feather: { shapes: [p(FEATHER_D), p('M3.5 20.5 15 9')] },
  'feather-filled': {
    shapes: [
      p(FEATHER_D, { paint: 'both' }),
      p('M3.5 20.5 7 17'),
      p('M8.5 15.5 15 9', { accent: true, strokeWidth: 1.6 }),
    ],
  },
  home: { shapes: [p('M3 10.5 12 3l9 7.5'), p('M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5')] },
  'home-filled': {
    filled: true,
    shapes: [
      p(
        'M11.36 2.77a1 1 0 0 1 1.28 0l8.5 7.08a1 1 0 0 1-.64 1.75H20V20a2 2 0 0 1-2 2h-3.5v-6.5h-5V22H6a2 2 0 0 1-2-2v-8.4h-.5a1 1 0 0 1-.64-1.77z',
      ),
    ],
  },
  group: {
    shapes: [
      p('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'),
      c(9, 7, 4),
      p('M22 21v-2a4 4 0 0 0-3-3.87'),
      p('M16 3.13a4 4 0 0 1 0 7.75'),
    ],
  },
  'group-filled': {
    shapes: [
      c(9, 7, 4, { paint: 'fill' }),
      p('M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z', { paint: 'fill' }),
      p('M16 3.13a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87'),
    ],
  },
  profile: { shapes: [c(12, 8, 4), p('M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1')] },
  'profile-filled': {
    filled: true,
    shapes: [
      c(12, 7.5, 4.5),
      p('M4 20.5v-.5a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5Z'),
    ],
  },
  search: { shapes: [c(11, 11, 7), p('m20 20-3.5-3.5')] },
  megaphone: { shapes: [p('m3 11 18-5v12L3 14v-3z'), p('M11.6 16.8a3 3 0 1 1-5.8-1.6')] },
  calendar: { shapes: [r(3, 4, 18, 18, 2), p('M16 2v4M8 2v4M3 10h18')] },
  pin: { shapes: [p('M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z'), c(12, 10, 3)] },
  ticket: {
    shapes: [
      p('M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'),
      p('M13 5v2M13 17v2M13 11v2'),
    ],
  },
  cake: {
    shapes: [
      p('M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8'),
      p('M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1'),
      p('M2 21h20M7 8v3M12 8v3M17 8v3'),
    ],
  },
  settings: {
    shapes: [
      p(
        'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
      ),
      c(12, 12, 3),
    ],
  },
  camera: {
    shapes: [
      p('M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'),
      c(12, 13, 3),
    ],
  },
  'user-plus': {
    shapes: [p('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'), c(9, 7, 4), p('M19 8v6M22 11h-6')],
  },
  'user-minus': { shapes: [p('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'), c(9, 7, 4), p('M22 11h-6')] },
  back: { shapes: [p('m12 19-7-7 7-7'), p('M19 12H5')] },
  more: { filled: true, shapes: [c(5, 12, 2), c(12, 12, 2), c(19, 12, 2)] },
  'chevron-right': { shapes: [p('m9 18 6-6-6-6')] },
  'chevron-down': { shapes: [p('m6 9 6 6 6-6')] },
  check: { shapes: [p('M20 6 9 17l-5-5')] },
  close: { shapes: [p('M18 6 6 18'), p('m6 6 12 12')] },
  star: { filled: true, shapes: [p('M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z')] },
  'star-outline': { shapes: [p('M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z')] },
  eye: { shapes: [p('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z'), c(12, 12, 3)] },
  'eye-off': { shapes: [p('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z'), c(12, 12, 3), p('M3 3l18 18')] },
  hide: {
    shapes: [
      p('M10.7 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2'),
      p('M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6'),
      p('M9.9 9.9a3 3 0 0 0 4.2 4.2'),
      p('m2 2 20 20'),
    ],
  },
  flag: { shapes: [p('M4 22V4a1 1 0 0 1 1-1h12l-2 4 2 4H5')] },
  pencil: { shapes: [p('M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z')] },
  trash: {
    shapes: [p('M3 6h18'), p('M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'), p('M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2')],
  },
  document: {
    shapes: [p('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), p('M14 2v6h6M16 13H8M16 17H8')],
  },
  lock: { shapes: [r(3, 11, 18, 11, 2), p('M7 11V7a5 5 0 0 1 10 0v4')] },
  target: { shapes: [c(12, 12, 9), c(12, 12, 5), c(12, 12, 1)] },
  globe: {
    shapes: [
      c(12, 12, 10),
      p('M2 12h20'),
      p('M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'),
    ],
  },
  bell: { shapes: [p('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'), p('M10.3 21a1.94 1.94 0 0 0 3.4 0')] },
  logout: { shapes: [p('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'), p('m16 17 5-5-5-5'), p('M21 12H9')] },
  moon: { shapes: [p('M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z')] },
  block: { shapes: [c(12, 12, 10), p('m4.9 4.9 14.2 14.2')] },
  info: { shapes: [c(12, 12, 10), p('M12 16v-4M12 8h.01')] },
  image: { shapes: [r(3, 3, 18, 18, 2), c(9, 9, 2), p('m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21')] },
  spinner: { shapes: [p('M21 12a9 9 0 1 1-6.2-8.56')] },
  /** Center navbar button: feather with a plus (34×34 in the design). */
  'feather-add': {
    viewBox: '0 0 34 34',
    shapes: [
      p('M25 8.5c-8.2.3-13.8 5.7-14.3 13.8l-.1 3.9 3.8-.1c7.7-.6 11.1-8.7 10.6-17.6Z'),
      p('M6.5 28 18.5 16'),
      p('M8 5v6M5 8h6'),
    ],
  },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;
