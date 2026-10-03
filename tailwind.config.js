/**
 * Not used by the actual build — Tailwind v4 is configured CSS-first in
 * src/global.scss and picked up there via @tailwindcss/postcss. This file
 * exists only so editor tooling (WebStorm/VS Code Tailwind IntelliSense)
 * reliably detects the project and knows which files to scan for classes.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  corePlugins: {
    preflight: false,
  },
};
