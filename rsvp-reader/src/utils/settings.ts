// src/utils/settings.ts
// Persists user preferences to device storage via AsyncStorage.
// All settings have defaults so the app works on first launch.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WPM_DEFAULT } from '../theme';

export interface AppSettings {
  wpm:               number;   // words per minute (60–900)
  showCountdown:     boolean;  // 3-2-1 countdown before play
  showOrp:           boolean;  // highlight ORP pivot character
  fontSize:          'small' | 'medium' | 'large';
  keepScreenAwake:   boolean;  // prevent sleep while reading
  rhythmicPauses:    boolean;  // longer pause after sentence endings
  lengthPauses:      boolean;  // longer display time for longer words
  negationBoost:     boolean;  // extra time for negation words (nicht, kein, …)
  numberBoost:       boolean;  // extra time for numbers, dates, percentages
  readingModeId:     string;   // active mode preset id
}

export const DEFAULT_SETTINGS: AppSettings = {
  wpm:             WPM_DEFAULT,
  showCountdown:   true,
  showOrp:         true,
  fontSize:        'large',
  keepScreenAwake: true,
  rhythmicPauses:  true,
  lengthPauses:    true,
  negationBoost:   false,
  numberBoost:     false,
  readingModeId:   'classic',
};

const STORAGE_KEY = '@rsvp_settings_v1';

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    // Merge stored values with defaults so new keys always have a value
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Silently ignore persistence errors – app still works in-memory
  }
}

export async function resetSettings(): Promise<AppSettings> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS };
}
