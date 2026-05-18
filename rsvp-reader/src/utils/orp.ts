// src/utils/orp.ts
// Optimal Recognition Point (ORP) calculation.
//
// The ORP is the single character in a word where the eye – when fixated
// there – can recognise the whole word in one glance.  Spritz Inc. popularised
// this idea.  The pivot index (0-based) is derived from word length:
//
//   1      char  → index 0
//   2–5    chars → index 1
//   6–9    chars → index 2
//   10–13  chars → index 3
//   14+    chars → index 4
//
// Only letter characters are counted for the length lookup, but the index
// applies to the full word string (including leading punctuation like quotes).

/** Return the 0-based index of the ORP character within `word`. */
export function getOrpIndex(word: string): number {
  // Count only alphabetic characters (handles German umlauts via Unicode)
  const letters = [...word].filter((c) => /\p{L}/u.test(c));
  const len = letters.length;

  if (len <= 1)  return 0;
  if (len <= 5)  return 1;
  if (len <= 9)  return 2;
  if (len <= 13) return 3;
  return 4;
}

export interface OrpParts {
  before: string;
  pivot:  string;
  after:  string;
}

/** Split `word` into the three visual segments for rendering. */
export function splitByOrp(word: string): OrpParts {
  const idx = getOrpIndex(word);
  return {
    before: word.slice(0, idx),
    pivot:  word[idx] ?? word[0],   // fallback for empty string edge case
    after:  word.slice(idx + 1),
  };
}

/**
 * Calculate the interval in milliseconds between words for a given WPM value.
 * Long words get a slightly longer display time; punctuation at the end of a
 * word adds a pause to mimic natural reading rhythm.
 */
export function intervalForWord(word: string, wpm: number): number {
  const baseMs = Math.round(60_000 / wpm);

  // Extra pause after sentence-ending punctuation
  const endsWithStop = /[.!?…]$/.test(word);
  const endsWithComma = /[,;:]$/.test(word);

  if (endsWithStop)  return baseMs + Math.round(baseMs * 1.8);
  if (endsWithComma) return baseMs + Math.round(baseMs * 0.6);
  return baseMs;
}
