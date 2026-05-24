// src/utils/orp.ts
// Optimal Recognition Point (ORP) calculation + adaptive display-time engine.
//
// ORP: the single character where the eye – when fixated there – can recognise
// the whole word in one glance.  Pivot index (0-based) by word length:
//
//   1      char  → index 0
//   2–5    chars → index 1
//   6–9    chars → index 2
//   10–13  chars → index 3
//   14+    chars → index 4

// ─── ORP ──────────────────────────────────────────────────────────────────────

/** Return the 0-based index of the ORP character within `word`. */
export function getOrpIndex(word: string): number {
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
    pivot:  word[idx] ?? word[0],
    after:  word.slice(idx + 1),
  };
}

// ─── Adaptive display-time engine ─────────────────────────────────────────────

interface TimingOptions {
  rhythmicPauses: boolean;
  lengthPauses:   boolean;
  negationBoost:  boolean;
  numberBoost:    boolean;
}

/**
 * Compute how long (ms) to display a single word.
 *
 * displayTime =  baseMs
 *              × lengthFactor       (if lengthPauses)
 *              × negationFactor     (if negationBoost and word is a negation)
 *              × numberFactor       (if numberBoost and word contains digits/%)
 *              + punctuationPause   (if rhythmicPauses)
 *
 * Result is clamped to [minMs, maxMs].
 */
export function computeDisplayTime(
  word: string,
  wpm: number,
  opts: TimingOptions,
): number {
  const baseMs = Math.round(60_000 / wpm);
  let ms = baseMs;

  // ── 1. Word-length factor ──────────────────────────────────────────────────
  if (opts.lengthPauses) {
    const letters = [...word].filter((c) => /\p{L}/u.test(c)).length;
    const factor  = Math.min(Math.max(0.7 + letters * 0.08, 0.7), 2.0);
    ms = Math.round(ms * factor);
  }

  // ── 2. Negation boost ─────────────────────────────────────────────────────
  if (opts.negationBoost && isNegation(word)) {
    ms = Math.round(ms * 1.45);
  }

  // ── 3. Numeric / special token boost ──────────────────────────────────────
  if (opts.numberBoost && isNumericToken(word)) {
    ms = Math.round(ms * 1.5);
  }

  // ── 4. Punctuation pauses (additive) ──────────────────────────────────────
  if (opts.rhythmicPauses) {
    if (/[.!?…]$/.test(word))  ms += Math.round(baseMs * 1.8);
    else if (/[,;:]$/.test(word)) ms += Math.round(baseMs * 0.6);
  }

  // ── 5. Clamp ──────────────────────────────────────────────────────────────
  const minMs = Math.round(60_000 / 900);   // never faster than 900 wpm
  const maxMs = Math.round(60_000 / 60);    // never slower than 60 wpm
  return Math.min(Math.max(ms, minMs), maxMs);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NEGATIONS = new Set([
  // German
  'nicht', 'nichts', 'nie', 'niemals', 'niemand',
  'kein', 'keine', 'keinen', 'keiner', 'keines', 'keinem',
  'ohne', 'nein', 'weder',
  // English
  'no', 'not', 'never', 'none', 'neither', 'nor', 'nothing', 'nobody', 'without',
  "don't", "doesn't", "didn't", "won't", "wouldn't", "can't",
  "cannot", "couldn't", "shouldn't", "isn't", "aren't", "wasn't", "weren't",
]);

function isNegation(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-zäöüß']/g, '');
  return NEGATIONS.has(clean);
}

function isNumericToken(word: string): boolean {
  if (/\d/.test(word)) return true;                           // contains digit
  if (word.includes('%')) return true;                        // percentage
  if (/^[€$£¥₹]/.test(word) || /[€$£¥₹]$/.test(word)) return true; // currency
  return false;
}

// ─── Legacy wrapper (keeps existing call sites working) ───────────────────────

/**
 * @deprecated Use computeDisplayTime() with full TimingOptions instead.
 */
export function intervalForWord(word: string, wpm: number): number {
  return computeDisplayTime(word, wpm, {
    rhythmicPauses: true,
    lengthPauses:   false,
    negationBoost:  false,
    numberBoost:    false,
  });
}
