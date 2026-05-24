// src/utils/readingModes.ts
// Reading mode presets. Each preset is a named bundle of engine + display settings.
// Selecting a mode writes its defaults into AppSettings — the user can still
// fine-tune individual settings afterwards.

import type { AppSettings } from './settings';

export interface ReadingMode {
  id:          string;
  name:        string;
  description: string;
  icon:        string;          // Ionicons name
  defaults:    Partial<AppSettings>;
}

export const READING_MODES: ReadingMode[] = [
  {
    id:          'classic',
    name:        'Classic RSVP',
    description: 'Schnell & fokussiert – ein Wort nach dem anderen',
    icon:        'flash-outline',
    defaults: {
      wpm:            300,
      showOrp:        true,
      rhythmicPauses: true,
      lengthPauses:   true,
      negationBoost:  false,
      numberBoost:    false,
    },
  },
  {
    id:          'adaptive',
    name:        'Adaptiv',
    description: 'Für Fachtexte – erkennt Zahlen, Verneinungen & Komplexität',
    icon:        'analytics-outline',
    defaults: {
      wpm:            220,
      showOrp:        true,
      rhythmicPauses: true,
      lengthPauses:   true,
      negationBoost:  true,
      numberBoost:    true,
    },
  },
  {
    id:          'focus',
    name:        'Fokus',
    description: 'Maximale Geschwindigkeit, minimale Ablenkung',
    icon:        'speedometer-outline',
    defaults: {
      wpm:            420,
      showOrp:        true,
      rhythmicPauses: false,
      lengthPauses:   false,
      negationBoost:  false,
      numberBoost:    false,
    },
  },
  {
    id:          'comfort',
    name:        'Komfort',
    description: 'Ruhiges, angenehmes Lesen für lange Texte',
    icon:        'cafe-outline',
    defaults: {
      wpm:            180,
      showOrp:        false,
      rhythmicPauses: true,
      lengthPauses:   false,
      negationBoost:  false,
      numberBoost:    false,
    },
  },
];

export const DEFAULT_MODE_ID = 'classic';

export function getModeById(id: string): ReadingMode {
  return READING_MODES.find((m) => m.id === id) ?? READING_MODES[0];
}
