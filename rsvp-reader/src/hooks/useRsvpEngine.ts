// src/hooks/useRsvpEngine.ts
// The heart of the app.  Manages playback state, position, and timing.
// Components interact with the returned API; they never touch timers directly.

import { useState, useRef, useCallback, useEffect } from 'react';
import { splitWords, estimateReadingTime } from '../utils/textExtractor';
import { intervalForWord } from '../utils/orp';
import type { AppSettings } from '../utils/settings';

export type PlayState = 'idle' | 'countdown' | 'playing' | 'paused' | 'finished';

export interface RsvpState {
  words:        string[];
  position:     number;   // index of the currently displayed word
  playState:    PlayState;
  countdownVal: number;   // 3, 2, 1 during countdown phase
  wpm:          number;
  progress:     number;   // 0–1
  timeLeftSecs: number;
}

export interface RsvpControls {
  loadText:   (text: string) => void;
  play:       () => void;
  pause:      () => void;
  togglePlay: () => void;
  jump:       (delta: number) => void;  // relative word jump (positive or negative)
  seekTo:     (position: number) => void;
  setWpm:     (wpm: number) => void;
  reset:      () => void;
}

export function useRsvpEngine(settings: AppSettings): [RsvpState, RsvpControls] {
  const [words, setWords]             = useState<string[]>([]);
  const [position, setPosition]       = useState(0);
  const [playState, setPlayState]     = useState<PlayState>('idle');
  const [countdownVal, setCountdown]  = useState(3);
  const [wpm, setWpmState]            = useState(settings.wpm);

  const posRef      = useRef(0);
  const wordsRef    = useRef<string[]>([]);
  const wpmRef      = useRef(wpm);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef  = useRef(false);
  const settingsRef = useRef(settings);

  // Keep refs in sync with latest values
  useEffect(() => { wpmRef.current = wpm; }, [wpm]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  // ─── Core playback loop ────────────────────────────────────────────────────
  const scheduleNext = useCallback(() => {
    if (!playingRef.current) return;
    const currentWords = wordsRef.current;
    const pos = posRef.current;

    if (pos >= currentWords.length) {
      // Reached end
      playingRef.current = false;
      setPlayState('finished');
      return;
    }

    const word = currentWords[pos];
    const ms   = settingsRef.current.rhythmicPauses
      ? intervalForWord(word, wpmRef.current)
      : Math.round(60_000 / wpmRef.current);

    timerRef.current = setTimeout(() => {
      const nextPos = posRef.current + 1;
      posRef.current = nextPos;
      setPosition(nextPos);
      scheduleNext();
    }, ms);
  }, []);

  const startPlayback = useCallback(() => {
    clearTimer();
    playingRef.current = true;
    setPlayState('playing');
    scheduleNext();
  }, [scheduleNext]);

  // ─── Countdown ─────────────────────────────────────────────────────────────
  const runCountdown = useCallback(() => {
    setPlayState('countdown');
    let count = 3;
    setCountdown(count);

    const tick = () => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        timerRef.current = setTimeout(tick, 700);
      } else {
        startPlayback();
      }
    };
    timerRef.current = setTimeout(tick, 700);
  }, [startPlayback]);

  // ─── Public controls ───────────────────────────────────────────────────────
  const loadText = useCallback((text: string) => {
    clearTimer();
    playingRef.current = false;
    const w = splitWords(text);
    wordsRef.current = w;
    posRef.current   = 0;
    setWords(w);
    setPosition(0);
    setPlayState('idle');
  }, []);

  const play = useCallback(() => {
    if (!wordsRef.current.length) return;
    if (posRef.current >= wordsRef.current.length) {
      posRef.current = 0;
      setPosition(0);
    }
    if (settingsRef.current.showCountdown) {
      runCountdown();
    } else {
      startPlayback();
    }
  }, [runCountdown, startPlayback]);

  const pause = useCallback(() => {
    clearTimer();
    playingRef.current = false;
    setPlayState('paused');
  }, []);

  const togglePlay = useCallback(() => {
    if (playingRef.current || playState === 'countdown') {
      pause();
    } else {
      play();
    }
  }, [play, pause, playState]);

  const jump = useCallback((delta: number) => {
    clearTimer();
    const maxPos = Math.max(0, wordsRef.current.length - 1);
    const newPos = Math.max(0, Math.min(maxPos, posRef.current + delta));
    posRef.current = newPos;
    setPosition(newPos);

    // If we were playing, resume after jump
    if (playingRef.current) {
      scheduleNext();
    }
  }, [scheduleNext]);

  const seekTo = useCallback((pos: number) => {
    clearTimer();
    const maxPos = Math.max(0, wordsRef.current.length - 1);
    const clamped = Math.max(0, Math.min(maxPos, pos));
    posRef.current = clamped;
    setPosition(clamped);
    if (playingRef.current) scheduleNext();
  }, [scheduleNext]);

  const setWpm = useCallback((newWpm: number) => {
    wpmRef.current = newWpm;
    setWpmState(newWpm);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    playingRef.current = false;
    posRef.current = 0;
    setPosition(0);
    setPlayState(wordsRef.current.length ? 'idle' : 'idle');
  }, []);

  // Clean up on unmount
  useEffect(() => () => clearTimer(), []);

  // ─── Derived state ─────────────────────────────────────────────────────────
  const total     = words.length;
  const progress  = total > 0 ? Math.min(position / total, 1) : 0;
  const remaining = Math.max(0, total - position);
  const timeLeftSecs = estimateReadingTime(remaining, wpm);

  const state: RsvpState = {
    words,
    position,
    playState,
    countdownVal,
    wpm,
    progress,
    timeLeftSecs,
  };

  const controls: RsvpControls = {
    loadText,
    play,
    pause,
    togglePlay,
    jump,
    seekTo,
    setWpm,
    reset,
  };

  return [state, controls];
}
