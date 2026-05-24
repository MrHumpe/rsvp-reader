// src/screens/SettingsScreen.tsx
// Restructured settings: reading mode presets at the top, theme picker,
// then fine-tuning toggles for power users.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  loadSettings, saveSettings, resetSettings,
  type AppSettings,
} from '../utils/settings';
import { READING_MODES, getModeById } from '../utils/readingModes';
import { THEME_IDS, THEME_LABELS, THEME_SWATCH } from '../utils/themes';
import { useTheme } from '../hooks/useTheme';
import { useThemeContext } from '../contexts/ThemeContext';
import { ToggleRow } from '../components/ToggleRow';
import { ModeCard } from '../components/ModeCard';
import { OnboardingModal } from './OnboardingModal';
import { Typography, Spacing, Radius } from '../theme';

export default function SettingsScreen() {
  const c                          = useTheme();
  const { themeId, setThemeId }    = useThemeContext();
  const [settings, setSettings]    = useState<AppSettings | null>(null);
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

  const applyMode = (modeId: string) => {
    const mode    = getModeById(modeId);
    const updated = { ...settings, ...mode.defaults, readingModeId: modeId };
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
          text: 'Zurücksetzen', style: 'destructive',
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

        {/* ── LESEMODUS ─────────────────────────────────────────────────── */}
        <SectionHeader title="Lesemodus" color={c} />
        <FlatList
          data={READING_MODES}
          keyExtractor={(m) => m.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modeList}
          renderItem={({ item }) => (
            <ModeCard
              mode={item}
              selected={settings.readingModeId === item.id}
              onPress={() => applyMode(item.id)}
            />
          )}
        />
        <Text style={[styles.modeHint, { color: c.textTertiary }]}>
          {getModeById(settings.readingModeId).description}
        </Text>

        {/* ── DESIGN ────────────────────────────────────────────────────── */}
        <SectionHeader title="Design" color={c} />
        <Card color={c}>
          <View style={styles.themeRow}>
            {THEME_IDS.map((id) => (
              <TouchableOpacity
                key={id}
                style={styles.themeChip}
                onPress={() => setThemeId(id)}
                accessibilityLabel={THEME_LABELS[id]}
                accessibilityRole="button"
                accessibilityState={{ selected: themeId === id }}
              >
                <View style={[
                  styles.themeSwatch,
                  { backgroundColor: THEME_SWATCH[id], borderColor: c.borderStrong },
                  themeId === id && styles.themeSwatchActive,
                ]}>
                  {id === 'system' && (
                    <Ionicons name="phone-portrait-outline" size={14} color={c.textSecondary} />
                  )}
                  {themeId === id && id !== 'system' && (
                    <Ionicons name="checkmark" size={14} color={id === 'light' || id === 'sepia' ? '#000' : '#fff'} />
                  )}
                </View>
                <Text style={[styles.themeLabel, { color: c.textSecondary }]}>
                  {THEME_LABELS[id]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* ── ANZEIGE ───────────────────────────────────────────────────── */}
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

        {/* ── WIEDERGABE ────────────────────────────────────────────────── */}
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
            description="Satzzeichen bekommen mehr Anzeigezeit"
            value={settings.rhythmicPauses}
            onChange={(v) => update('rhythmicPauses', v)}
          />
          <Separator color={c} />
          <ToggleRow
            label="Längenanpassung"
            description="Längere Wörter bekommen mehr Anzeigezeit"
            value={settings.lengthPauses}
            onChange={(v) => update('lengthPauses', v)}
          />
          <Separator color={c} />
          <ToggleRow
            label="Verneinungserkennung"
            description="„nicht", „kein", „never" u.ä. länger anzeigen"
            value={settings.negationBoost}
            onChange={(v) => update('negationBoost', v)}
          />
          <Separator color={c} />
          <ToggleRow
            label="Zahlen & Einheiten"
            description="Zahlen, Datumsangaben und Prozentwerte länger anzeigen"
            value={settings.numberBoost}
            onChange={(v) => update('numberBoost', v)}
          />
          <Separator color={c} />
          <ToggleRow
            label="Bildschirm wach halten"
            description="Verhindert den Ruhezustand während des Lesens"
            value={settings.keepScreenAwake}
            onChange={(v) => update('keepScreenAwake', v)}
          />
        </Card>

        {/* ── ÜBER ──────────────────────────────────────────────────────── */}
        <SectionHeader title="Über" color={c} />
        <Card color={c}>
          <InfoRow label="App"       value="RSVP Reader"         color={c} />
          <Separator color={c} />
          <InfoRow label="Version"   value="1.0.0"               color={c} />
          <Separator color={c} />
          <InfoRow label="Technik"   value="React Native / Expo" color={c} />
          <Separator color={c} />
          <InfoRow label="Methode"   value="RSVP + ORP-Pivot"    color={c} />
        </Card>

        {/* ── AKTIONEN ──────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: c.border }]}
          onPress={() => setShowOnboarding(true)}
          accessibilityRole="button"
        >
          <Ionicons name="play-circle-outline" size={16} color={c.text} />
          <Text style={[styles.actionLabel, { color: c.text }]}>
            Einführung erneut anzeigen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { borderColor: '#E24B4A' }]}
          onPress={handleReset}
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={16} color="#E24B4A" />
          <Text style={[styles.actionLabel, { color: '#E24B4A' }]}>
            Einstellungen zurücksetzen
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <OnboardingModal visible={showOnboarding} onFinish={() => setShowOnboarding(false)} />
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, color: c }: { title: string; color: ReturnType<typeof useTheme> }) {
  return (
    <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
      {title.toUpperCase()}
    </Text>
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

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  sectionTitle: {
    ...Typography.caption,
    letterSpacing: 0.6,
    marginTop:     Spacing.lg,
    marginBottom:  Spacing.xs,
    paddingHorizontal: 2,
  },
  card: {
    borderRadius:      Radius.lg,
    borderWidth:       0.5,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
  },

  // Mode row
  modeList:  { paddingVertical: 4 },
  modeHint:  { ...Typography.caption, marginTop: 6, paddingHorizontal: 2 },

  // Theme picker
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  themeChip: {
    alignItems: 'center',
    gap: 4,
  },
  themeSwatch: {
    width:          40,
    height:         40,
    borderRadius:   Radius.md,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
  },
  themeSwatchActive: {
    borderWidth: 3,
  },
  themeLabel: {
    ...Typography.caption,
    fontSize: 10,
  },

  // Font size chips
  cardLabel: {
    ...Typography.label,
    marginTop:    Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical:    8,
    borderRadius:       Radius.full,
    borderWidth:        0.5,
  },

  sep:     { height: 0.5, marginVertical: 2 },
  infoRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  // Action buttons
  actionButton: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:             8,
    marginTop:       Spacing.md,
    borderWidth:     0.5,
    borderRadius:    Radius.md,
    padding:         14,
  },
  actionLabel: { ...Typography.body },
});
