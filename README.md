# RSVP Reader

Eine React Native / Expo App für **Rapid Serial Visual Presentation** — schnelles Lesen durch wortweises Einblenden.

## Features

- **ORP** (Optimal Recognition Point): Der Pivotbuchstabe jedes Wortes wird rot hervorgehoben für maximale Lesegeschwindigkeit
- Einstellbare WPM (60–900)
- Dokument-Import: `.txt`, `.docx`
- Dark Mode
- Rhythmische Pausen nach Satzzeichen
- Countdown vor dem Start

## Tech Stack

- [Expo SDK 51](https://expo.dev/) / React Native
- TypeScript (strict)
- Expo Router (file-based routing)
- AsyncStorage

## Projektstruktur

```
app/
  _layout.tsx          # Root Layout
  (tabs)/
    index.tsx          # ReaderScreen
    settings.tsx       # SettingsScreen
src/
  components/          # WordDisplay, PlayerControls, WpmSlider, …
  hooks/               # useRsvpEngine, useTheme
  screens/             # ReaderScreen, SettingsScreen
  theme/               # Colors, typography, spacing
  utils/               # orp.ts, settings.ts, textExtractor.ts
```

## Entwicklung

```bash
npx expo start
```

## Lizenz

MIT
