// __tests__/useRsvpEngine.test.ts
// Unit-Tests für den RSVP-Wiedergabe-Hook.
// Nutzt Jest Fake Timers um setTimeout-basierte Logik synchron zu testen.

import { renderHook, act } from '@testing-library/react-native';
import { useRsvpEngine } from '../src/hooks/useRsvpEngine';
import type { AppSettings } from '../src/utils/settings';

const DEFAULT_SETTINGS: AppSettings = {
  wpm:             300,
  showCountdown:   false,  // Countdown für Tests deaktiviert
  showOrp:         true,
  fontSize:        'large',
  keepScreenAwake: false,
  rhythmicPauses:  false,  // Feste Intervalle für reproduzierbare Tests
};

const BASE_MS = Math.round(60_000 / 300); // 200 ms bei 300 wpm

function setup(settings: AppSettings = DEFAULT_SETTINGS) {
  return renderHook(() => useRsvpEngine(settings));
}

// ─── Initialzustand ───────────────────────────────────────────────────────────

describe('Initialzustand', () => {
  it('startet im idle-Zustand ohne Wörter', () => {
    const { result } = setup();
    const [state] = result.current;
    expect(state.playState).toBe('idle');
    expect(state.words).toHaveLength(0);
    expect(state.position).toBe(0);
    expect(state.progress).toBe(0);
  });
});

// ─── loadText ─────────────────────────────────────────────────────────────────

describe('loadText', () => {
  it('befüllt words und setzt Position auf 0', () => {
    const { result } = setup();
    act(() => {
      result.current[1].loadText('Hallo Welt foo');
    });
    const [state] = result.current;
    expect(state.words).toEqual(['Hallo', 'Welt', 'foo']);
    expect(state.position).toBe(0);
    expect(state.playState).toBe('idle');
  });

  it('verwirft vorherigen Text beim erneuten Laden', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('Erster Text'); });
    act(() => { result.current[1].loadText('Zweiter Satz mit Wörtern'); });
    expect(result.current[0].words).toHaveLength(4);
    expect(result.current[0].position).toBe(0);
  });
});

// ─── play / pause / togglePlay ────────────────────────────────────────────────

describe('play und pause', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('play wechselt von idle zu playing', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('Ein Zwei Drei'); });
    act(() => { result.current[1].play(); });
    expect(result.current[0].playState).toBe('playing');
  });

  it('pause hält playState bei paused', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('Ein Zwei Drei'); });
    act(() => { result.current[1].play(); });
    act(() => { result.current[1].pause(); });
    expect(result.current[0].playState).toBe('paused');
  });

  it('togglePlay wechselt zwischen playing und paused', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('Ein Zwei Drei'); });
    act(() => { result.current[1].play(); });
    expect(result.current[0].playState).toBe('playing');
    act(() => { result.current[1].togglePlay(); });
    expect(result.current[0].playState).toBe('paused');
    act(() => { result.current[1].togglePlay(); });
    expect(result.current[0].playState).toBe('playing');
  });

  it('play ohne Text tut nichts', () => {
    const { result } = setup();
    act(() => { result.current[1].play(); });
    expect(result.current[0].playState).toBe('idle');
  });

  it('Position rückt nach einem Timer-Tick vor', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('Ein Zwei Drei'); });
    act(() => { result.current[1].play(); });
    act(() => { jest.advanceTimersByTime(BASE_MS); });
    expect(result.current[0].position).toBe(1);
  });

  it('wechselt zu finished wenn alle Wörter durch sind', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('A B C'); });
    act(() => { result.current[1].play(); });
    act(() => { jest.advanceTimersByTime(BASE_MS * 4); });
    expect(result.current[0].playState).toBe('finished');
  });
});

// ─── jump ─────────────────────────────────────────────────────────────────────

describe('jump', () => {
  it('springt relativ vorwärts', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('A B C D E F G H I J'); });
    act(() => { result.current[1].jump(5); });
    expect(result.current[0].position).toBe(5);
  });

  it('springt relativ rückwärts', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('A B C D E F G H I J'); });
    act(() => { result.current[1].jump(7); });
    act(() => { result.current[1].jump(-3); });
    expect(result.current[0].position).toBe(4);
  });

  it('clampt auf 0 nach unten', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('A B C'); });
    act(() => { result.current[1].jump(-99); });
    expect(result.current[0].position).toBe(0);
  });

  it('clampt auf letztes Wort nach oben', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('A B C'); });
    act(() => { result.current[1].jump(999); });
    expect(result.current[0].position).toBe(2);
  });
});

// ─── seekTo ──────────────────────────────────────────────────────────────────

describe('seekTo', () => {
  it('setzt Position auf den gewünschten Wert', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('A B C D E'); });
    act(() => { result.current[1].seekTo(3); });
    expect(result.current[0].position).toBe(3);
  });
});

// ─── reset ────────────────────────────────────────────────────────────────────

describe('reset', () => {
  it('setzt Position auf 0 und playState auf idle', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('Ein Zwei Drei'); });
    act(() => { result.current[1].seekTo(2); });
    act(() => { result.current[1].reset(); });
    expect(result.current[0].position).toBe(0);
    expect(result.current[0].playState).toBe('idle');
  });
});

// ─── progress ────────────────────────────────────────────────────────────────

describe('progress und timeLeftSecs', () => {
  it('progress ist 0 wenn kein Text geladen', () => {
    const { result } = setup();
    expect(result.current[0].progress).toBe(0);
  });

  it('progress steigt mit der Position', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('A B C D'); });
    act(() => { result.current[1].seekTo(2); });
    expect(result.current[0].progress).toBeCloseTo(0.5, 1);
  });

  it('timeLeftSecs sinkt wenn wir weiter vorrücken', () => {
    const { result } = setup();
    act(() => { result.current[1].loadText('A B C D E F'); });
    const timeBefore = result.current[0].timeLeftSecs;
    act(() => { result.current[1].seekTo(3); });
    expect(result.current[0].timeLeftSecs).toBeLessThan(timeBefore);
  });
});

// ─── Countdown ────────────────────────────────────────────────────────────────

describe('Countdown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('startet im countdown-Zustand wenn showCountdown=true', () => {
    const settings: AppSettings = { ...DEFAULT_SETTINGS, showCountdown: true };
    const { result } = renderHook(() => useRsvpEngine(settings));
    act(() => { result.current[1].loadText('Ein Zwei Drei'); });
    act(() => { result.current[1].play(); });
    expect(result.current[0].playState).toBe('countdown');
  });

  it('wechselt nach Countdown zu playing', () => {
    const settings: AppSettings = { ...DEFAULT_SETTINGS, showCountdown: true };
    const { result } = renderHook(() => useRsvpEngine(settings));
    act(() => { result.current[1].loadText('Ein Zwei Drei'); });
    act(() => { result.current[1].play(); });
    // Countdown: 3×700ms = 2100ms
    act(() => { jest.advanceTimersByTime(2200); });
    expect(result.current[0].playState).toBe('playing');
  });
});
