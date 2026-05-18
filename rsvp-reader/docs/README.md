# RSVP Reader

Eine cross-platform iOS/Android-App für schnelles Lesen via **Rapid Serial Visual Presentation (RSVP)** mit ORP-Pivot-Technik.

---

## Inhaltsverzeichnis

1. [Was ist RSVP?](#1-was-ist-rsvp)
2. [Features](#2-features)
3. [Projektstruktur](#3-projektstruktur)
4. [Voraussetzungen](#4-voraussetzungen)
5. [Installation](#5-installation)
6. [Starten & Entwickeln](#6-starten--entwickeln)
7. [App bauen & deployen](#7-app-bauen--deployen)
8. [Architektur & Code-Erklärung](#8-architektur--code-erklärung)
9. [Konfiguration & Einstellungen](#9-konfiguration--einstellungen)
10. [Unterstützte Dateiformate](#10-unterstützte-dateiformate)
11. [PDF-Unterstützung erweitern](#11-pdf-unterstützung-erweitern)
12. [Häufige Probleme (Troubleshooting)](#12-häufige-probleme-troubleshooting)
13. [Tests](#13-tests)
14. [Weiterentwicklung / Roadmap](#14-weiterentwicklung--roadmap)

---

## 1. Was ist RSVP?

**Rapid Serial Visual Presentation** ist eine Lesetechnik, bei der immer nur **ein Wort** an einer festen Bildschirmposition angezeigt wird. Das Auge muss nicht mehr von links nach rechts über Zeilen wandern (sogenannte *Sakkaden*). Dieser Aufwand entfällt komplett – dadurch können geübte Leser deutlich schneller lesen als normal.

### ORP – Optimal Recognition Point

Der **ORP (Optimal Recognition Point)** ist der einzelne Buchstabe in einem Wort, an dem das Auge das ganze Wort am schnellsten erfassen kann. Er liegt je nach Wortlänge leicht links von der Mitte:

| Wortlänge | ORP-Index (0-basiert) |
|-----------|----------------------|
| 1 Zeichen | 0 |
| 2–5 Zeichen | 1 |
| 6–9 Zeichen | 2 |
| 10–13 Zeichen | 3 |
| 14+ Zeichen | 4 |

In dieser App ist der ORP-Buchstabe **rot** markiert. Das Gehirn lernt schnell, die Augen immer auf diesen Punkt zu fixieren.

---

## 2. Features

| Feature | Beschreibung |
|---------|-------------|
| 📄 Textdateien | .txt und .md direkt laden |
| 📝 Word-Dokumente | .docx via mammoth.js extrahiert |
| 📑 PDF | Stub vorhanden; natives Modul einfach einbindbar |
| ✏️ Text einfügen | Direkteingabe oder Einfügen via Clipboard |
| ▶️ Play / Pause | Mit oder ohne 3-2-1 Countdown |
| ⏮ Sprünge | −20 / −10 / −5 / +5 / +10 / +20 Wörter |
| 🎚 WPM-Slider | 60–900 wpm, live einstellbar |
| 🔴 ORP-Pivot | Roter Erkennungsbuchstabe, abschaltbar |
| ⏸ Rhythmische Pausen | Längere Pause nach Satzzeichen |
| 💾 Einstellungen persistent | Gespeichert in AsyncStorage |
| 🌙 Dark Mode | Automatisch nach Systemeinstellung |
| 📱 iOS + Android | Ein Code, beide Plattformen |

---

## 3. Projektstruktur

```
rsvp-reader/
│
├── app/                        # Expo Router – Routen/Screens
│   ├── _layout.tsx             # Root Layout (GestureHandler, Splash)
│   └── (tabs)/
│       ├── _layout.tsx         # Tab-Navigation (Reader + Einstellungen)
│       ├── index.tsx           # → ReaderScreen
│       └── settings.tsx        # → SettingsScreen
│
├── src/
│   ├── screens/
│   │   ├── ReaderScreen.tsx    # Haupt-Screen: Leseansicht + Import
│   │   └── SettingsScreen.tsx  # Einstellungen
│   │
│   ├── components/
│   │   ├── WordDisplay.tsx     # Das Wort-Stage mit ORP-Highlight
│   │   ├── PlayerControls.tsx  # Play/Pause/Jump-Buttons
│   │   ├── WpmSlider.tsx       # Geschwindigkeits-Slider + ProgressBar
│   │   ├── ToggleRow.tsx       # Wiederverwendbarer On/Off-Schalter
│   │   └── DocumentPicker.tsx  # Datei-Upload + Text-Paste-Modal
│   │
│   ├── hooks/
│   │   ├── useRsvpEngine.ts    # ⭐ Kern-Hook: Wiedergabe-Engine
│   │   └── useTheme.ts         # Dark/Light-Mode Farben
│   │
│   ├── utils/
│   │   ├── textExtractor.ts    # Textextraktion: TXT, DOCX, PDF
│   │   ├── orp.ts              # ORP-Index & Wort-Splitting
│   │   └── settings.ts         # Persistenz via AsyncStorage
│   │
│   └── theme/
│       └── index.ts            # Farben, Typografie, Abstände
│
├── docs/
│   └── README.md               # Diese Datei
│
├── app.json                    # Expo-Konfiguration
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Voraussetzungen

| Tool | Version | Installieren |
|------|---------|-------------|
| Node.js | ≥ 18 LTS | https://nodejs.org |
| npm | ≥ 9 | kommt mit Node |
| Expo CLI | aktuell | `npm i -g expo-cli` |
| EAS CLI (für Builds) | aktuell | `npm i -g eas-cli` |
| Xcode (für iOS) | ≥ 15 | Mac App Store |
| Android Studio | aktuell | https://developer.android.com/studio |

> **Tipp:** Ohne Xcode/Android Studio kannst du die App sofort im Browser oder mit der **Expo Go**-App auf deinem Handy testen.

---

## 5. Installation

```bash
# 1. Repository klonen
git clone https://github.com/DEIN_NAME/rsvp-reader.git
cd rsvp-reader

# 2. Dependencies installieren
npm install

# 3. Expo-Projekt initialisieren (falls nötig)
npx expo install
```

### iOS – Pods installieren (nur Mac)

```bash
cd ios && pod install && cd ..
```

---

## 6. Starten & Entwickeln

```bash
# Development Server starten
npm start
# oder
npx expo start

# Direkt auf iOS Simulator
npm run ios

# Direkt auf Android Emulator
npm run android

# Im Browser (eingeschränkt, ohne native Funktionen)
npm run web
```

### Expo Go (physisches Gerät)

1. **Expo Go** aus dem App Store / Play Store installieren
2. `npm start` ausführen
3. QR-Code mit der Kamera (iOS) oder der Expo Go App (Android) scannen

---

## 7. App bauen & deployen

Für echte Store-Builds wird **EAS Build** (Expo Application Services) verwendet.

### Setup

```bash
# EAS CLI installieren
npm install -g eas-cli

# Bei Expo einloggen
eas login

# EAS im Projekt konfigurieren (einmalig)
eas build:configure
```

### iOS Build (TestFlight / App Store)

```bash
# Development Build (zum Testen)
eas build --platform ios --profile development

# Production Build (für App Store)
eas build --platform ios --profile production

# App Store Submit
eas submit --platform ios
```

### Android Build (Play Store)

```bash
# APK (für direktes Installieren)
eas build --platform android --profile development

# AAB (für Play Store)
eas build --platform android --profile production

# Play Store Submit
eas submit --platform android
```

### eas.json (Beispielkonfiguration)

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## 8. Architektur & Code-Erklärung

### useRsvpEngine.ts – Die Kern-Engine

Der wichtigste Hook der App. Er kapselt die gesamte Wiedergabelogik:

```
loadText()  →  words[] + position = 0
play()      →  [Countdown] → scheduleNext()
scheduleNext() → setTimeout(wort anzeigen, interval_ms) → rekursiv
pause()     →  clearTimeout, playState = 'paused'
jump(±n)    →  position += n, weiter falls playing
```

**Warum `useRef` statt `useState` für die Playback-Position?**  
`useState`-Updates in `setTimeout`-Closures sehen immer den Wert zum Zeitpunkt der Closure-Erstellung (veralteter Wert / *stale closure*). `useRef` gibt immer den aktuellen Wert zurück. Deshalb gibt es zwei parallele Variablen:
- `posRef.current` – für die Timer-Logik (immer aktuell)
- `position` (useState) – für das Re-Render der UI

### textExtractor.ts – Datei-Import

| Format | Bibliothek | Methode |
|--------|-----------|---------|
| .txt / .md | expo-file-system | `readAsStringAsync` |
| .docx | mammoth.js | `extractRawText` via ArrayBuffer |
| .pdf | Stub | Native Modul notwendig (s. Abschnitt 11) |

### orp.ts – ORP-Berechnung

```typescript
getOrpIndex('Hallo')  // → 1  ('a' ist der Pivot)
splitByOrp('Hallo')   // → { before: 'H', pivot: 'a', after: 'llo' }
```

### theme/index.ts – Design-System

Alle visuellen Konstanten (Farben, Schriftgrößen, Abstände, Radien) sind zentral definiert. Um das Erscheinungsbild zu ändern, reicht es, diese eine Datei zu bearbeiten.

---

## 9. Konfiguration & Einstellungen

| Einstellung | Typ | Standard | Beschreibung |
|-------------|-----|---------|-------------|
| `wpm` | number | 300 | Wörter pro Minute |
| `showCountdown` | boolean | true | 3-2-1 vor Start |
| `showOrp` | boolean | true | Roter Pivot-Buchstabe |
| `fontSize` | 'small'\|'medium'\|'large' | 'large' | Schriftgröße im Stage |
| `keepScreenAwake` | boolean | true | Bildschirm wach halten |
| `rhythmicPauses` | boolean | true | Pause nach Satzzeichen |

Alle Einstellungen werden automatisch in `AsyncStorage` gespeichert und beim nächsten App-Start geladen.

---

## 10. Unterstützte Dateiformate

| Format | Endung | Status |
|--------|--------|--------|
| Nur-Text | .txt, .md | ✅ Vollständig |
| Word | .docx | ✅ Vollständig |
| Word alt | .doc | ⚠️ Eingeschränkt (oft kein direktes Lesen) |
| PDF | .pdf | 🔧 Stub – natives Modul nötig |

---

## 11. PDF-Unterstützung erweitern

PDF-Textextraktion auf mobilen Geräten erfordert native Code-Anbindung. Der Stub in `textExtractor.ts` zeigt genau, wo der Code eingefügt werden muss.

### Option A: `react-native-pdf-lib` (empfohlen)

```bash
npm install react-native-pdf-lib
cd ios && pod install
```

```typescript
// In textExtractor.ts, Funktion extractPdf() ersetzen:
import PDFLib from 'react-native-pdf-lib';

async function extractPdf(uri: string): Promise<string> {
  const doc   = await PDFLib.PDFDocument.open(uri);
  const pages = await doc.getPageCount();
  const texts: string[] = [];
  for (let i = 0; i < pages; i++) {
    const page = await doc.getPage(i);
    texts.push(await page.getText());
  }
  return texts.join('\n');
}
```

### Option B: Eigenes Expo Module

Für maximale Kontrolle kannst du ein **Custom Expo Module** schreiben, das direkt iOS PDFKit und Android's `PdfRenderer` anspricht. Dokumentation: https://docs.expo.dev/modules/overview/

---

## 12. Häufige Probleme (Troubleshooting)

### `npm start` schlägt fehl – Metro-Fehler

```bash
# Cache leeren
npx expo start --clear
# oder
npx react-native start --reset-cache
```

### Pod-Fehler auf iOS

```bash
cd ios
pod deintegrate
pod install
```

### Android Build schlägt fehl – `JAVA_HOME` nicht gesetzt

```bash
export JAVA_HOME=$(/usr/libexec/java_home)  # macOS
# oder in ~/.zshrc / ~/.bashrc eintragen
```

### Datei kann nicht geladen werden – „Unbekannter Fehler"

- Stelle sicher, dass `copyToCacheDirectory: true` in `DocumentPicker` gesetzt ist (ist es per Default in diesem Projekt).
- Auf Android: Prüfe die `READ_EXTERNAL_STORAGE`-Berechtigung in `app.json`.
- Word-Dateien müssen im `.docx`-Format sein. Ältere `.doc`-Dateien müssen zuerst konvertiert werden.

### Slow Performance bei sehr langen Texten (> 100.000 Wörter)

Das `words`-Array wird in React State gehalten. Bei extremen Textmengen kann das initiale Laden etwas dauern. Lösung für die Zukunft: Text lazy in Chunks aufteilen (s. Roadmap).

---

## 13. Tests

```bash
# Alle Tests ausführen
npm test

# Mit Coverage
npm test -- --coverage

# Watch-Modus
npm test -- --watch
```

### Testdateien anlegen

Lege Testdateien neben die zu testende Datei mit dem Suffix `.test.ts`:

```
src/utils/orp.test.ts
src/utils/textExtractor.test.ts
src/hooks/useRsvpEngine.test.ts
```

#### Beispiel: orp.test.ts

```typescript
import { getOrpIndex, splitByOrp } from './orp';

test('ORP index für kurze Wörter', () => {
  expect(getOrpIndex('Hi')).toBe(1);
  expect(getOrpIndex('Hallo')).toBe(1);
  expect(getOrpIndex('Beispiel')).toBe(2);
});

test('splitByOrp teilt korrekt auf', () => {
  const { before, pivot, after } = splitByOrp('Hallo');
  expect(before).toBe('H');
  expect(pivot).toBe('a');
  expect(after).toBe('llo');
});
```

---

## 14. Weiterentwicklung / Roadmap

### Geplante Features

- [ ] **Lesezeichen** – Position in einem Dokument speichern und fortsetzen
- [ ] **Bibliothek** – Geladene Dokumente verwalten (Liste mit letzter Position)
- [ ] **PDF nativ** – Vollständige PDF-Textextraktion via Custom Module
- [ ] **Schriftauswahl** – System-Serif vs. Sans-Serif
- [ ] **Hintergrundfarbe** – z.B. Sepia-Modus für die Augen
- [ ] **Statistiken** – Gelesene Wörter pro Tag, durchschnittliche WPM
- [ ] **iCloud / Google Drive** – Direkt aus Cloud-Speichern laden
- [ ] **Share Extension** – Text aus anderen Apps direkt an RSVP Reader schicken
- [ ] **Widget** – Aktuell gelesenes Wort als Lock-Screen Widget

### Beitragen

Pull Requests sind willkommen. Bitte:
1. Einen Feature-Branch anlegen (`git checkout -b feature/mein-feature`)
2. Änderungen committen mit klaren Nachrichten
3. Tests hinzufügen
4. Pull Request öffnen

---

## Lizenz

MIT – frei verwendbar, veränderbar und verteilbar.
