// src/utils/themes.ts
// Visual theme definitions. Each theme is a complete color set.
// 'system' is a special ID that resolves to light/dark based on the OS setting.

export interface AppTheme {
  id:                  string;
  name:                string;
  isDark:              boolean;
  // Surface colors
  background:          string;
  backgroundSecondary: string;
  surface:             string;
  border:              string;
  borderStrong:        string;
  // Text
  text:                string;
  textSecondary:       string;
  textTertiary:        string;
  // Accents
  pivot:               string;   // ORP highlight color
  progressBar:         string;
  progressBg:          string;
  // Buttons
  buttonBg:            string;
  buttonText:          string;
  buttonSecBg:         string;
  buttonSecText:       string;
  // Toggle
  toggleOn:            string;
  toggleOff:           string;
}

// ─── Theme definitions ─────────────────────────────────────────────────────────

const LIGHT: AppTheme = {
  id: 'light', name: 'Hell', isDark: false,
  background:          '#FFFFFF',
  backgroundSecondary: '#F5F4F0',
  surface:             '#FFFFFF',
  border:              'rgba(0,0,0,0.12)',
  borderStrong:        'rgba(0,0,0,0.25)',
  text:                '#1A1A1A',
  textSecondary:       '#6B6B6B',
  textTertiary:        '#ABABAB',
  pivot:               '#E24B4A',
  progressBar:         '#1A1A1A',
  progressBg:          'rgba(0,0,0,0.08)',
  buttonBg:            '#1A1A1A',
  buttonText:          '#FFFFFF',
  buttonSecBg:         'transparent',
  buttonSecText:       '#1A1A1A',
  toggleOn:            '#1A1A1A',
  toggleOff:           'rgba(0,0,0,0.18)',
};

const DARK: AppTheme = {
  id: 'dark', name: 'Dunkel', isDark: true,
  background:          '#0F0F0F',
  backgroundSecondary: '#1C1C1E',
  surface:             '#1C1C1E',
  border:              'rgba(255,255,255,0.12)',
  borderStrong:        'rgba(255,255,255,0.25)',
  text:                '#F0F0F0',
  textSecondary:       '#9A9A9A',
  textTertiary:        '#555555',
  pivot:               '#E24B4A',
  progressBar:         '#F0F0F0',
  progressBg:          'rgba(255,255,255,0.1)',
  buttonBg:            '#F0F0F0',
  buttonText:          '#0F0F0F',
  buttonSecBg:         'transparent',
  buttonSecText:       '#F0F0F0',
  toggleOn:            '#F0F0F0',
  toggleOff:           'rgba(255,255,255,0.18)',
};

const SEPIA: AppTheme = {
  id: 'sepia', name: 'Sepia', isDark: false,
  background:          '#F4ECD8',
  backgroundSecondary: '#EDE0C4',
  surface:             '#F4ECD8',
  border:              'rgba(101,74,37,0.2)',
  borderStrong:        'rgba(101,74,37,0.4)',
  text:                '#3B2A1A',
  textSecondary:       '#6B4F35',
  textTertiary:        '#9A7A5A',
  pivot:               '#C0392B',
  progressBar:         '#3B2A1A',
  progressBg:          'rgba(59,42,26,0.12)',
  buttonBg:            '#3B2A1A',
  buttonText:          '#F4ECD8',
  buttonSecBg:         'transparent',
  buttonSecText:       '#3B2A1A',
  toggleOn:            '#3B2A1A',
  toggleOff:           'rgba(59,42,26,0.2)',
};

const HIGH_CONTRAST: AppTheme = {
  id: 'highContrast', name: 'Hoher Kontrast', isDark: true,
  background:          '#000000',
  backgroundSecondary: '#111111',
  surface:             '#111111',
  border:              'rgba(255,255,255,0.35)',
  borderStrong:        'rgba(255,255,255,0.6)',
  text:                '#FFFFFF',
  textSecondary:       '#DDDDDD',
  textTertiary:        '#AAAAAA',
  pivot:               '#FFD700',
  progressBar:         '#FFFFFF',
  progressBg:          'rgba(255,255,255,0.2)',
  buttonBg:            '#FFFFFF',
  buttonText:          '#000000',
  buttonSecBg:         'transparent',
  buttonSecText:       '#FFFFFF',
  toggleOn:            '#FFFFFF',
  toggleOff:           'rgba(255,255,255,0.25)',
};

// ─── Registry ──────────────────────────────────────────────────────────────────

export const THEMES: Record<string, AppTheme> = {
  light:        LIGHT,
  dark:         DARK,
  sepia:        SEPIA,
  highContrast: HIGH_CONTRAST,
};

// Expose for iteration (system comes first as the default)
export const THEME_IDS = ['system', 'light', 'dark', 'sepia', 'highContrast'] as const;
export type ThemeId = typeof THEME_IDS[number];

export const THEME_LABELS: Record<string, string> = {
  system:       'System',
  light:        'Hell',
  dark:         'Dunkel',
  sepia:        'Sepia',
  highContrast: 'Kontrast',
};

/** Preview swatch color shown in the theme picker (background of that theme). */
export const THEME_SWATCH: Record<string, string> = {
  system:       '#888888',
  light:        '#FFFFFF',
  dark:         '#0F0F0F',
  sepia:        '#F4ECD8',
  highContrast: '#000000',
};

/** Resolve a themeId to a concrete AppTheme at runtime. */
export function resolveTheme(themeId: string, systemIsDark: boolean): AppTheme {
  if (themeId === 'system') return systemIsDark ? DARK : LIGHT;
  return THEMES[themeId] ?? (systemIsDark ? DARK : LIGHT);
}
