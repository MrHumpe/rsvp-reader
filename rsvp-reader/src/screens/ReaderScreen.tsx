// src/screens/ReaderScreen.tsx
// Haupt-Screen: orchestriert Dokumenten-Laden, Wiedergabe und Anzeige.
// Integriert Lesezeichen (automatisches Speichern + Fortsetzen-Dialog),
// die Dokumenten-Bibliothek und den Onboarding-Flow für Erstnutzer.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useKeepAwake } from 'expo-keep-awake';
import { Colors, Typography, Spacing } from '../theme';
import { useRsvpEngine } from '../hooks/useRsvpEngine';
import { useTheme } from '../hooks/useTheme';
import { loadSettings, saveSettings, type AppSettings } from '../utils/settings';
import { formatTime, splitWords } from '../utils/textExtractor';
import { hashText, upsertDoc, saveBookmark, getDoc } from '../utils/library';
import { consumePendingDoc } from '../utils/pendingLoad';
import { isOnboardingDone, markOnboardingDone } from '../utils/onboarding';
import { useSharedContent }  from '../hooks/useSharedContent';
import { WordDisplay }        from '../components/WordDisplay';
import { PlayerControls }     from '../components/PlayerControls';
import { WpmSlider, ProgressBar } from '../components/WpmSlider';
import { DocumentPickerView } from '../components/DocumentPicker';
import { OnboardingModal }    from './OnboardingModal';

export default function ReaderScreen() {
  const c = useTheme();

  const [settings,         setSettings]         = useState<AppSettings | null>(null);
  const [filename,         setFilename]         = useState<string | null>(null);
  const [docId,            setDocId]            = useState<string | null>(null);
  const [showOnboarding,   setShowOnboarding]   = useState(false);

  // ─── Initialisation ────────────────────────────────────────────────────────

  useEffect(() => {
    isOnboardingDone().then((done) => {
      if (!done) setShowOnboarding(true);
    });
  }, []);

  // Reload settings every time the tab comes into focus so changes from
  // SettingsScreen (rhythmicPauses, fontSize, etc.) take effect immediately.
  useFocusEffect(useCallback(() => {
    loadSettings().then(setSettings);
  }, []));

  useKeepAwake();

  const safeSettings: AppSettings = settings ?? {
    wpm: 300, showCountdown: true, showOrp: true,
    fontSize: 'large', keepScreenAwake: true, rhythmicPauses: true, lengthPauses: true,
  };

  const [state, controls] = useRsvpEngine(safeSettings);

  // ─── Lesezeichen automatisch speichern ────────────────────────────────────
  // Wird ausgelöst wenn playState auf 'paused' oder 'finished' wechselt,
  // oder wenn die Position sich im pausierten Zustand ändert (Jump-Buttons).

  useEffect(() => {
    if (!docId) return;
    if (state.playState === 'paused' || state.playState === 'finished') {
      saveBookmark(docId, state.position);
    }
  }, [state.playState, state.position, docId]);

  // ─── Pending-Dokument aus Bibliothek laden (Tab-Fokus) ────────────────────

  useFocusEffect(useCallback(() => {
    const pendingId = consumePendingDoc();
    if (!pendingId) return;

    getDoc(pendingId).then((entry) => {
      if (!entry) return;
      controls.loadText(entry.text);
      setFilename(entry.title);
      setDocId(entry.id);

      if (entry.position > 0 && entry.position < entry.wordCount - 1) {
        Alert.alert(
          'Fortsetzen?',
          `Du warst bei Wort ${entry.position + 1} von ${entry.wordCount}.`,
          [
            { text: 'Von vorne', style: 'cancel' },
            { text: 'Fortsetzen', onPress: () => controls.seekTo(entry.position) },
          ],
        );
      }
    });
  }, [controls]));

  // ─── Dokument aus DocumentPicker / Paste laden ────────────────────────────

  const handleTextReady = useCallback(async (text: string, name: string) => {
    // Wörter splitten und in Engine laden
    controls.loadText(text);
    setFilename(name);

    const id        = hashText(text);
    const wordCount = splitWords(text).length;
    setDocId(id);

    // Vorhandenen Eintrag lesen bevor wir upserten (Position nicht überschreiben)
    const existing = await getDoc(id);

    await upsertDoc({
      id,
      title:     name,
      text,
      wordCount,
      position:  existing?.position ?? 0,
    });

    // Fortsetzen anbieten wenn es eine gespeicherte Position gibt
    if (existing && existing.position > 0 && existing.position < existing.wordCount - 1) {
      Alert.alert(
        'Fortsetzen?',
        `Du warst zuletzt bei Wort ${existing.position + 1} von ${wordCount}.`,
        [
          { text: 'Von vorne', style: 'cancel' },
          { text: 'Fortsetzen', onPress: () => controls.seekTo(existing.position) },
        ],
      );
    }
  }, [controls]);

  // ─── WPM Änderung ─────────────────────────────────────────────────────────

  const handleWpmChange = useCallback((wpm: number) => {
    controls.setWpm(wpm);
    if (settings) {
      const updated = { ...settings, wpm };
      setSettings(updated);
      saveSettings(updated);
    }
  }, [controls, settings]);

  // ─── Eingehende geteilte Dateien (Android Intent / iOS "In App öffnen") ───

  useSharedContent(handleTextReady);

  // ─── Onboarding abschließen ───────────────────────────────────────────────

  const handleOnboardingFinish = useCallback(() => {
    setShowOnboarding(false);
    markOnboardingDone();
  }, []);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const currentWord = state.words[state.position] ?? '';
  const contextPrev = state.words.slice(Math.max(0, state.position - 2), state.position).join(' ');
  const contextNext = state.words.slice(state.position + 1, state.position + 3).join(' ');
  const hasText     = state.words.length > 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: c.text }]}>RSVP Reader</Text>
          {filename && (
            <Text style={[styles.filename, { color: c.textSecondary }]} numberOfLines={1}>
              {filename}
            </Text>
          )}
        </View>

        {/* Wortanzeige */}
        <WordDisplay
          word={currentWord}
          contextPrev={contextPrev}
          contextNext={contextNext}
          playState={state.playState}
          countdownVal={state.countdownVal}
          showOrp={safeSettings.showOrp}
          fontSize={safeSettings.fontSize}
        />

        {/* Fortschritt */}
        {hasText && (
          <ProgressBar
            progress={state.progress}
            position={state.position}
            total={state.words.length}
            timeLeft={formatTime(state.timeLeftSecs)}
            onSeek={controls.seekTo}
          />
        )}

        {/* Steuerung */}
        <PlayerControls
          playState={state.playState}
          onToggle={controls.togglePlay}
          onJump={controls.jump}
          onReset={controls.reset}
          disabled={!hasText}
        />

        {/* Geschwindigkeit */}
        <WpmSlider wpm={state.wpm} onChange={handleWpmChange} />

        {/* Trennlinie */}
        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {/* Dokument-Import */}
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
          Dokument laden
        </Text>
        <DocumentPickerView wpm={state.wpm} onTextReady={handleTextReady} />

        {hasText && (
          <Text style={[styles.loadedInfo, { color: c.textTertiary }]}>
            {state.words.length} Wörter geladen
          </Text>
        )}
      </ScrollView>

      {/* Onboarding (nur beim ersten Start) */}
      <OnboardingModal
        visible={showOnboarding}
        onFinish={handleOnboardingFinish}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    padding:       Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.md,
    marginTop:    Spacing.sm,
  },
  appTitle: {
    ...Typography.heading,
  },
  filename: {
    ...Typography.caption,
    marginTop: 2,
  },
  divider: {
    height:         0.5,
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.label,
    marginBottom:  Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadedInfo: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
