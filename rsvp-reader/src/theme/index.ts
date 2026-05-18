// src/theme/index.ts
// Central design token file – all visual constants live here.
// To change the look of the entire app, edit only this file.

export const Colors = {
  light: {
    background:     '#FFFFFF',
    backgroundSecondary: '#F5F4F0',
    surface:        '#FFFFFF',
    border:         'rgba(0,0,0,0.12)',
    borderStrong:   'rgba(0,0,0,0.25)',
    text:           '#1A1A1A',
    textSecondary:  '#6B6B6B',
    textTertiary:   '#ABABAB',
    pivot:          '#E24B4A',   // ORP red – the key visual accent
    progressBar:    '#1A1A1A',
    progressBg:     'rgba(0,0,0,0.08)',
    buttonBg:       '#1A1A1A',
    buttonText:     '#FFFFFF',
    buttonSecBg:    'transparent',
    buttonSecText:  '#1A1A1A',
    toggleOn:       '#1A1A1A',
    toggleOff:      'rgba(0,0,0,0.18)',
  },
  dark: {
    background:     '#0F0F0F',
    backgroundSecondary: '#1C1C1E',
    surface:        '#1C1C1E',
    border:         'rgba(255,255,255,0.12)',
    borderStrong:   'rgba(255,255,255,0.25)',
    text:           '#F0F0F0',
    textSecondary:  '#9A9A9A',
    textTertiary:   '#555555',
    pivot:          '#E24B4A',
    progressBar:    '#F0F0F0',
    progressBg:     'rgba(255,255,255,0.1)',
    buttonBg:       '#F0F0F0',
    buttonText:     '#0F0F0F',
    buttonSecBg:    'transparent',
    buttonSecText:  '#F0F0F0',
    toggleOn:       '#F0F0F0',
    toggleOff:      'rgba(255,255,255,0.18)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;

export const Typography = {
  // Word display – the hero font size
  wordLarge:   { fontSize: 44, fontWeight: '500' as const, letterSpacing: -0.5 },
  wordMedium:  { fontSize: 36, fontWeight: '500' as const, letterSpacing: -0.3 },
  wordSmall:   { fontSize: 28, fontWeight: '500' as const, letterSpacing: -0.2 },

  // UI text
  heading:     { fontSize: 20, fontWeight: '500' as const },
  subheading:  { fontSize: 16, fontWeight: '500' as const },
  body:        { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption:     { fontSize: 12, fontWeight: '400' as const },
  label:       { fontSize: 13, fontWeight: '400' as const },

  // Context preview (words around current)
  context:     { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0.1 },
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const Radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 999,
} as const;

export const WPM_PRESETS = [100, 150, 200, 250, 300, 400, 500, 600, 700] as const;
export const WPM_MIN = 60;
export const WPM_MAX = 900;
export const WPM_DEFAULT = 300;

export const JUMP_AMOUNTS = [5, 10, 20] as const;
