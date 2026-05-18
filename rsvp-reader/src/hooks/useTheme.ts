// src/hooks/useTheme.ts
// Provides the correct color set based on the system color scheme.
// Components import this hook instead of hardcoding colors.

import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from '../theme';

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
