import { getOrpIndex, splitWordAtOrp } from '../orp';

describe('getOrpIndex', () => {
  it('gibt 0 für ein einbuchstabiges Wort zurück', () => {
    expect(getOrpIndex(1)).toBe(0);
  });

  it('gibt 1 für Wörter mit 2–5 Buchstaben zurück', () => {
    expect(getOrpIndex(2)).toBe(1);
    expect(getOrpIndex(3)).toBe(1);
    expect(getOrpIndex(5)).toBe(1);
  });

  it('gibt 2 für Wörter mit 6–9 Buchstaben zurück', () => {
    expect(getOrpIndex(6)).toBe(2);
    expect(getOrpIndex(9)).toBe(2);
  });

  it('gibt 3 für Wörter mit 10–13 Buchstaben zurück', () => {
    expect(getOrpIndex(10)).toBe(3);
    expect(getOrpIndex(13)).toBe(3);
  });

  it('gibt 4 für Wörter mit 14+ Buchstaben zurück', () => {
    expect(getOrpIndex(14)).toBe(4);
    expect(getOrpIndex(20)).toBe(4);
  });
});

describe('splitWordAtOrp', () => {
  it('teilt ein einbuchstabiges Wort korrekt auf', () => {
    expect(splitWordAtOrp('A')).toEqual({ before: '', pivot: 'A', after: '' });
  });

  it('teilt ein 4-buchstabiges Wort korrekt auf (Pivot = Index 1)', () => {
    // "Wort" → before="W", pivot="o", after="rt"
    expect(splitWordAtOrp('Wort')).toEqual({ before: 'W', pivot: 'o', after: 'rt' });
  });

  it('teilt ein 7-buchstabiges Wort korrekt auf (Pivot = Index 2)', () => {
    // "Lesung" hat 6 Buchstaben → Pivot = Index 2 = 's'
    expect(splitWordAtOrp('Lesung')).toEqual({ before: 'Le', pivot: 's', after: 'ung' });
  });

  it('teilt ein 11-buchstabiges Wort korrekt auf (Pivot = Index 3)', () => {
    // "Schnelligkeit" hat 13 Buchstaben → Pivot = Index 3 = 'n'
    expect(splitWordAtOrp('Schnelligkeit')).toEqual({ before: 'Sch', pivot: 'n', after: 'elligkeit' });
  });

  it('gibt leeren Pivot für leeres Wort zurück', () => {
    expect(splitWordAtOrp('')).toEqual({ before: '', pivot: '', after: '' });
  });
});
