// src/hooks/useTheme.ts
// Returns the active AppTheme from ThemeContext.
// Components import this hook – never hardcode colors or call useColorScheme() directly.

import { useThemeContext } from '../contexts/ThemeContext';
import type { AppTheme } from '../utils/themes';

export function useTheme(): AppTheme {
  return useThemeContext().theme;
}
