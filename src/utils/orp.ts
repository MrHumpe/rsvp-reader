/**
 * Berechnet den Optimal Recognition Point (ORP) für ein Wort.
 * Das Wort wird in drei Teile aufgeteilt: vor dem Pivot, Pivot, nach dem Pivot.
 *
 * Pivot-Index nach Wortlänge:
 *   1      → 0
 *   2–5    → 1
 *   6–9    → 2
 *   10–13  → 3
 *   14+    → 4
 */
export function getOrpIndex(wordLength: number): number {
  if (wordLength <= 1) return 0;
  if (wordLength <= 5) return 1;
  if (wordLength <= 9) return 2;
  if (wordLength <= 13) return 3;
  return 4;
}

export type OrpResult = {
  before: string;
  pivot: string;
  after: string;
};

export function splitWordAtOrp(word: string): OrpResult {
  const pivotIndex = getOrpIndex(word.length);
  return {
    before: word.slice(0, pivotIndex),
    pivot: word[pivotIndex] ?? '',
    after: word.slice(pivotIndex + 1),
  };
}
