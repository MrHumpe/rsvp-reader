// src/screens/OnboardingModal.tsx
// Einmaliger Onboarding-Flow der beim ersten App-Start erscheint.
// Erklärt das RSVP-Konzept und den ORP-Pivot in drei Schritten.

import React, { useState, memo, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  StyleSheet, SafeAreaView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Spacing, Radius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Slide content ─────────────────────────────────────────────────────────────

interface Slide {
  icon:        string;
  title:       string;
  body:        string;
  highlight?:  string; // optional example word for ORP demo
}

const SLIDES: Slide[] = [
  {
    icon:  'rocket-outline',
    title: 'Schneller lesen',
    body:
      'RSVP – Rapid Serial Visual Presentation – zeigt jeden Text Wort für ' +
      'Wort an einer festen Stelle. Deine Augen müssen nicht mehr über die ' +
      'Zeile wandern. Das spart Zeit und steigert die Konzentration.',
  },
  {
    icon:      'eye-outline',
    title:     'Der ORP-Pivot',
    body:
      'Jedes Wort hat einen optimalen Erkennungspunkt (ORP). Der rote ' +
      'Buchstabe markiert genau diese Stelle – dein Gehirn liest das Wort ' +
      'in einem Blick, ohne suchen zu müssen.',
    highlight: 'Erkennung',
  },
  {
    icon:  'speedometer-outline',
    title: 'Dein Tempo',
    body:
      'Starte mit 200–250 wpm wenn du RSVP zum ersten Mal ausprobierst. ' +
      'Nach ein paar Minuten wirst du merken, wie du das Tempo problemlos ' +
      'steigern kannst. 400–500 wpm sind mit etwas Übung gut erreichbar.',
  },
];

// ─── ORP Demo Word ─────────────────────────────────────────────────────────────

const OrpDemo = memo(function OrpDemo({ word, c }: { word: string; c: ReturnType<typeof useTheme> }) {
  // Simple ORP split matching the orp.ts logic (2-5 chars → index 1, 6-9 → 2, etc.)
  const letters = [...word].filter((ch) => /\p{L}/u.test(ch));
  const len = letters.length;
  const idx = len <= 1 ? 0 : len <= 5 ? 1 : len <= 9 ? 2 : len <= 13 ? 3 : 4;

  return (
    <View style={[styles.demoBox, { backgroundColor: c.backgroundSecondary, borderColor: c.border }]}>
      <View style={styles.demoWord}>
        <Text style={[styles.demoText, { color: c.text }]}>{word.slice(0, idx)}</Text>
        <Text style={[styles.demoText, { color: c.pivot }]}>{word[idx]}</Text>
        <Text style={[styles.demoText, { color: c.text }]}>{word.slice(idx + 1)}</Text>
      </View>
      <Text style={[styles.demoLabel, { color: c.textTertiary }]}>← ORP-Pivot</Text>
    </View>
  );
});

// ─── Dot indicator ────────────────────────────────────────────────────────────

const Dots = memo(function Dots({ total, active, c }: {
  total: number; active: number; c: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === active ? c.text : c.border },
          ]}
        />
      ))}
    </View>
  );
});

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  visible:  boolean;
  onFinish: () => void;
}

export const OnboardingModal = memo(function OnboardingModal({ visible, onFinish }: Props) {
  const c = useTheme();
  const [page, setPage] = useState(0);
  const slide = SLIDES[page];
  const isLast = page === SLIDES.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onFinish();
    } else {
      setPage((p) => p + 1);
    }
  }, [isLast, onFinish]);

  const handleBack = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        {/* Skip button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onFinish}
          accessibilityLabel="Einführung überspringen"
          accessibilityRole="button"
        >
          <Text style={[styles.skipLabel, { color: c.textTertiary }]}>Überspringen</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: c.backgroundSecondary }]}>
            <Ionicons name={slide.icon as any} size={40} color={c.text} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: c.text }]}>{slide.title}</Text>

          {/* Body */}
          <Text style={[styles.body, { color: c.textSecondary }]}>{slide.body}</Text>

          {/* ORP demo (slide 2 only) */}
          {slide.highlight && (
            <OrpDemo word={slide.highlight} c={c} />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Dots total={SLIDES.length} active={page} c={c} />

          <View style={styles.navRow}>
            {page > 0 ? (
              <TouchableOpacity
                style={[styles.backBtn, { borderColor: c.border }]}
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Zurück"
              >
                <Ionicons name="arrow-back" size={20} color={c.text} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backPlaceholder} />
            )}

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: c.buttonBg }]}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'Loslegen' : 'Weiter'}
            >
              <Text style={[styles.nextLabel, { color: c.buttonText }]}>
                {isLast ? 'Loslegen!' : 'Weiter'}
              </Text>
              {!isLast && (
                <Ionicons name="arrow-forward" size={18} color={c.buttonText} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  skipButton: {
    alignSelf:   'flex-end',
    paddingRight: Spacing.md,
    paddingTop:   Spacing.sm,
    padding:      Spacing.sm,
  },
  skipLabel: {
    ...Typography.body,
  },
  content: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: Spacing.xl,
    gap:               Spacing.md,
  },
  iconCircle: {
    width:          88,
    height:         88,
    borderRadius:   44,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   Spacing.sm,
  },
  title: {
    ...Typography.heading,
    fontSize:  24,
    textAlign: 'center',
  },
  body: {
    ...Typography.body,
    textAlign:  'center',
    lineHeight: 24,
  },
  demoBox: {
    marginTop:    Spacing.md,
    borderRadius: Radius.lg,
    borderWidth:  0.5,
    paddingVertical:   Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems:   'center',
    gap:          Spacing.xs,
    width:        SCREEN_WIDTH - Spacing.xl * 2,
  },
  demoWord: {
    flexDirection: 'row',
    alignItems:    'baseline',
  },
  demoText: {
    fontSize:   36,
    fontWeight: '500',
  },
  demoLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom:     Spacing.lg,
    gap:               Spacing.md,
  },
  dots: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            6,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  navRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            Spacing.sm,
  },
  backBtn: {
    width:          48,
    height:         48,
    borderRadius:   Radius.full,
    borderWidth:    0.5,
    alignItems:     'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 48,
  },
  nextBtn: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    borderRadius:   Radius.md,
    paddingVertical: 14,
  },
  nextLabel: {
    ...Typography.subheading,
  },
});
