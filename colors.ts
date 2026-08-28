/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#10213f',
    tint: '#4f7cff',
    background: '#f6f8fc',
    foreground: '#10213f',
    card: '#ffffff',
    cardForeground: '#10213f',
    primary: '#4f7cff',
    primaryForeground: '#ffffff',
    secondary: '#eaf0ff',
    secondaryForeground: '#3152a0',
    muted: '#eef2f8',
    mutedForeground: '#6f7d96',
    accent: '#ff826e',
    accentForeground: '#7d2b20',
    destructive: '#d94e5b',
    destructiveForeground: '#ffffff',
    border: '#dce4f1',
    input: '#f1f4f9',
    ink: '#10213f',
    navy: '#14264b',
    sky: '#dce9ff',
    lilac: '#eee9ff',
    coral: '#ff826e',
    green: '#42a67d',
  },
  dark: {
    text: '#f3f6ff',
    tint: '#8aa7ff',
    background: '#0f172a',
    foreground: '#f3f6ff',
    card: '#17233c',
    cardForeground: '#f3f6ff',
    primary: '#8aa7ff',
    primaryForeground: '#0f172a',
    secondary: '#223252',
    secondaryForeground: '#dce6ff',
    muted: '#1d2a43',
    mutedForeground: '#a6b4cc',
    accent: '#ff9a87',
    accentForeground: '#30120c',
    destructive: '#ff7380',
    destructiveForeground: '#2b0c10',
    border: '#2b3a58',
    input: '#192641',
    ink: '#f3f6ff',
    navy: '#dce6ff',
    sky: '#1f355a',
    lilac: '#302c55',
    coral: '#ff9a87',
    green: '#6ac79d',
  },
  radius: 18,
};

export default colors;
