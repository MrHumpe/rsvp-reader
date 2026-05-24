// src/contexts/ThemeContext.tsx
// Provides the active AppTheme to the whole component tree.
// Persists the chosen themeId in AsyncStorage independently of other settings.

import React, {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveTheme, type AppTheme } from '../utils/themes';

const THEME_KEY = '@rsvp_theme_v1';

interface ThemeContextValue {
  theme:      AppTheme;
  themeId:    string;
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:      { isDark: true } as AppTheme,
  themeId:    'system',
  setThemeId: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme             = useColorScheme();
  const [themeId, setThemeIdRaw] = useState<string>('system');

  // Load persisted choice on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored) setThemeIdRaw(stored);
    });
  }, []);

  const setThemeId = useCallback((id: string) => {
    setThemeIdRaw(id);
    AsyncStorage.setItem(THEME_KEY, id);
  }, []);

  const theme = useMemo(
    () => resolveTheme(themeId, systemScheme === 'dark'),
    [themeId, systemScheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
