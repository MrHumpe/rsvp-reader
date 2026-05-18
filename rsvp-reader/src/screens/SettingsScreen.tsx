// src/screens/SettingsScreen.tsx
// All configurable options.  Changes save to AsyncStorage immediately.

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useColorScheme, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  loadSettings, saveSettings, resetSettings,
  type AppSettings,
} from '../utils/settings';
import { ToggleRow } from '../components/ToggleRow';
import { useTheme } from '../hooks/useTheme';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { OnboardingModal } from './OnboardingModal';

export default function SettingsScreen() {
  const c = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleReset = () => {
    Alert.alert(
      'Einstellungen zurücksetzen',
      'Alle Einstellungen werden auf die Standardwerte zurückgesetzt.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            const defaults = await resetSettings();
            setSettings(defaults);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Lesegeschwindigkeit */}
        <SectionHeader title="Lesegeschwindigkeit" color={c} />
        <Card color={c}>
          <Text style={[styles.wpmDisplay, { color: c.text }]}>
            {settings.wpm}{' '}
            <Text style={[styles.wpmUnit, { color: c.textSecondary }]}>wpm</Text>
          </Text>
          <Text style={[styles.hint, { color: c.textTertiary }]}>
            Einstellbar direkt im Reader-Screen über den Slider.
          </Text>
        </Card>

        {/* Anzeige */}
        <SectionHeader title="Anzeige" color={c} />
        <Card color={c}>
          <Text style={[styles.cardLabel, { color: c.textSecondary }]}>Schriftgröße</Text>
          <View style={styles.chipRow}>
            {(['small', 'medium', 'large'] as const).map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.chip,
                  { borderColor: c.border },
                  settings.fontSize === size && { backgroundColor: c.buttonBg, borderColor: c.buttonBg },
                ]}
                onPress={() => update('fontSize', size)}
                accessibilityLabel={`Schriftgröße ${size}`}
                accessibilityState={{ selected: settings.fontSize === size }}
              >
                <Text style={{
                  ...Typography.label,
                  color: settings.fontSize === size ? c.buttonText : c.text,
                }}>
                  {size === 'small' ? 'Klein' : size === 'medium' ? 'Mittel' : 'Groß'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Separator color={c} />

          <ToggleRow
            label="ORP-Pivot anzeigen"
            description="Roter Erkennungsbuchstabe für schnelleres Lesen"
            value={settings.showOrp}
            onChange={(v) => update('showOrp', v)}
          />
        </Card>

        {/* Wiedergabe */}
        <SectionHeader title="Wiedergabe" color={c} />
        <Card color={c}>
          <ToggleRow
            label="Countdown vor Start"
            description="3-2-1 Countdown bevor der Text beginnt"
            value={settings.showCountdown}
            onChange={(v) => update('showCountdown', v)}
          />
          <Separator color={c} />
          <ToggleRow
            label="Rhythmische Pausen"
            description="Satzzeichen bekommen etwas mehr Zeit"
            value={settings.rhythmicPauses}
            onChange={(v) => update('rhythmicPauses', v)}
          />
          <Separator color={c} />
          <ToggleRow
            label="Bildschirm wach halten"
            description="Verhindert den Ruhezustand während des Lesens"
            value={settings.keepScreenAwake}
            onChange={(v) => update('keepScreenAwake', v)}
          />
        </Card>

        {/* Über */}
        <SectionHeader title="Über" color={c} />
        <Card color={c}>
          <InfoRow label="App-Name"    value="RSVP Reader"     color={c} />
          <Separator color={c} />
          <InfoRow label="Version"     value="1.0.0"           color={c} />
          <Separator color={c} />
          <InfoRow label="Technik"     value="React Native / Expo" color={c} />
          <Separator color={c} />
          <InfoRow label="Methode"     value="RSVP + ORP-Pivot" color={c} />
        </Card>

        {/* Intro */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: c.border }]}
          onPress={() => setShowOnboarding(true)}
          accessibilityLabel="Einführung erneut anzeigen"
          accessibilityRole="button"
        >
          <Ionicons name="play-circle-outline" size={16} color={c.text} />
          <Text style={[styles.resetLabel, { color: c.text }]}>
            Einführung erneut anzeigen
          </Text>
        </TouchableOpacity>

        {/* Reset */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: '#E24B4A' }]}
          onPress={handleReset}
          accessibilityLabel="Einstellungen zurücksetzen"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={16} color="#E24B4A" />
          <Text style={[styles.resetLabel, { color: '#E24B4A' }]}>
            Einstellungen zurücksetzen
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <OnboardingModal
        visible={showOnboarding}
        onFinish={() => setShowOnboarding(false)}
      />
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, color: c }: { title: string; color: ReturnType<typeof useTheme> }) {
  return (
    <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{title.toUpperCase()}</Text>
  );
}

function Card({ children, color: c }: { children: React.ReactNode; color: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      {children}
    </View>
  );
}

function Separator({ color: c }: { color: ReturnType<typeof useTheme> }) {
  return <View style={[styles.sep, { backgroundColor: c.border }]} />;
}

function InfoRow({ label, value, color: c }: { label: string; value: string; color: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[Typography.body, { color: c.text }]}>{label}</Text>
      <Text style={[Typography.body, { color: c.textSecondary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  sectionTitle: {
    ...Typography.caption,
    letterSpacing: 0.6,
    marginTop:     Spacing.lg,
    marginBottom:  Spacing.xs,
    paddingHorizontal: 2,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth:  0.5,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
  },
  cardLabel: {
    ...Typography.label,
    marginTop:    Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap:           8,
    marginBottom:  Spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical:    8,
    borderRadius:       Radius.full,
    borderWidth:        0.5,
  },
  sep: {
    height: 0.5,
    marginVertical: 2,
  },
  infoRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  wpmDisplay: {
    fontSize:   28,
    fontWeight: '500',
    marginTop:  Spacing.sm,
  },
  wpmUnit: {
    fontSize:   16,
    fontWeight: '400',
  },
  hint: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    marginTop:    2,
  },
  resetButton: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:             8,
    marginTop:       Spacing.xl,
    borderWidth:     0.5,
    borderRadius:    Radius.md,
    padding:         14,
  },
  resetLabel: {
    ...Typography.body,
  },
});
