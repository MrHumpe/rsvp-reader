// __tests__/orp.test.ts
// Unit-Tests für die ORP-Berechnungslogik.

import { getOrpIndex, splitByOrp, intervalForWord } from '../src/utils/orp';

// ─── getOrpIndex ──────────────────────────────────────────────────────────────

describe('getOrpIndex', () => {
  test('leeres Wort → 0', () => {
    expect(getOrpIndex('')).toBe(0);
  });

  test('1 Buchstabe → 0', () => {
    expect(getOrpIndex('a')).toBe(0);
    expect(getOrpIndex('I')).toBe(0);
  });

  test('2–5 Buchstaben → 1', () => {
    expect(getOrpIndex('ab')).toBe(1);
    expect(getOrpIndex('Haus')).toBe(1);
    expect(getOrpIndex('lesen')).toBe(1);
  });

  test('6–9 Buchstaben → 2', () => {
    expect(getOrpIndex('schnell')).toBe(2);   // 7 Buchstaben
    expect(getOrpIndex('laufen')).toBe(2);    // 6 Buchstaben
    expect(getOrpIndex('schreiben')).toBe(2); // 9 Buchstaben
  });

  test('10–13 Buchstaben → 3', () => {
    expect(getOrpIndex('verstehen')).toBe(2); // 9 → 2
    expect(getOrpIndex('verstehende')).toBe(3); // 11 Buchstaben
  });

  test('14+ Buchstaben → 4', () => {
    expect(getOrpIndex('Bundesregierung')).toBe(4); // 15 Buchstaben
    expect(getOrpIndex('Geschwindigkeit')).toBe(4); // 15 Buchstaben
  });

  test('Sonderzeichen zählen nicht als Buchstaben', () => {
    // "Haus," hat 4 Buchstaben → index 1
    expect(getOrpIndex('Haus,')).toBe(1);
    // "lesen." hat 5 Buchstaben → index 1
    expect(getOrpIndex('lesen.')).toBe(1);
  });

  test('Deutsche Umlaute werden gezählt', () => {
    expect(getOrpIndex('Ü')).toBe(0);
    expect(getOrpIndex('Über')).toBe(1);    // 4 Buchstaben → 1
    expect(getOrpIndex('Überblick')).toBe(2); // 9 Buchstaben → 2
  });
});

// ─── splitByOrp ───────────────────────────────────────────────────────────────

describe('splitByOrp', () => {
  test('einbuchstabiges Wort: pivot = Wort, before + after leer', () => {
    const result = splitByOrp('a');
    expect(result.before).toBe('');
    expect(result.pivot).toBe('a');
    expect(result.after).toBe('');
  });

  test('2-buchstabiges Wort: before = erstes Zeichen, pivot = zweites', () => {
    const result = splitByOrp('ab');
    expect(result.before).toBe('a');
    expect(result.pivot).toBe('b');
    expect(result.after).toBe('');
  });

  test('Zusammensetzung ergibt das Originalwort', () => {
    const words = ['Hund', 'schnell', 'Erkennung', 'Bundesregierung', 'laufen,'];
    for (const w of words) {
      const { before, pivot, after } = splitByOrp(w);
      expect(before + pivot + after).toBe(w);
    }
  });

  test('leeres Wort: pivot fällt auf Fallback', () => {
    const result = splitByOrp('');
    expect(result.pivot).toBeDefined();
  });
});

// ─── intervalForWord ──────────────────────────────────────────────────────────

describe('intervalForWord', () => {
  const WPM = 300; // baseMs = 200 ms

  test('normales Wort: baseMs', () => {
    expect(intervalForWord('Hund', WPM)).toBe(200);
  });

  test('Satzende (.!?…): baseMs + 80%', () => {
    const base = Math.round(60_000 / WPM);
    expect(intervalForWord('Ende.', WPM)).toBe(base + Math.round(base * 0.8));
    expect(intervalForWord('Wirklich!', WPM)).toBe(base + Math.round(base * 0.8));
    expect(intervalForWord('Sicher?', WPM)).toBe(base + Math.round(base * 0.8));
  });

  test('Komma/Semikolon/Doppelpunkt: baseMs + 30%', () => {
    const base = Math.round(60_000 / WPM);
    expect(intervalForWord('Hund,', WPM)).toBe(base + Math.round(base * 0.3));
    expect(intervalForWord('Eins;', WPM)).toBe(base + Math.round(base * 0.3));
    expect(intervalForWord('also:', WPM)).toBe(base + Math.round(base * 0.3));
  });

  test('skaliert korrekt mit WPM', () => {
    const i600 = intervalForWord('Wort', 600);
    const i300 = intervalForWord('Wort', 300);
    expect(i600).toBeLessThan(i300);
    expect(i300 / i600).toBeCloseTo(2, 1);
  });
});
