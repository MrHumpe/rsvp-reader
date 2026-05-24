// src/components/WpmSlider.tsx
// Speed control with live WPM readout.

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Typography, WPM_MIN, WPM_MAX } from '../theme';
import { useTheme } from '../hooks/useTheme';

interface WpmSliderProps {
  wpm:      number;
  onChange: (wpm: number) => void;
}

export const WpmSlider = memo(function WpmSlider({ wpm, onChange }: WpmSliderProps) {
  const c = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: c.textSecondary }]}>Geschwindigkeit</Text>
      <View style={styles.row}>
        <Text style={[styles.bound, { color: c.textTertiary }]}>{WPM_MIN}</Text>
        <Slider
          style={styles.slider}
          minimumValue={WPM_MIN}
          maximumValue={WPM_MAX}
          step={10}
          value={wpm}
          onValueChange={onChange}
          minimumTrackTintColor={c.progressBar}
          maximumTrackTintColor={c.progressBg}
          thumbTintColor={c.progressBar}
          accessibilityLabel={`Wörter pro Minute: ${wpm}`}
        />
        <Text style={[styles.bound, { color: c.textTertiary }]}>{WPM_MAX}</Text>
      </View>
      <Text style={[styles.wpmValue, { color: c.text }]}>{wpm} wpm</Text>
    </View>
  );
});

// ─── Progress Bar ──────────────────────────────────────────────────────────────

interface ProgressBarProps {
  progress:   number;   // 0–1
  position:   number;
  total:      number;
  timeLeft:   string;
  onSeek:     (position: number) => void;
}

export const ProgressBar = memo(function ProgressBar({
  progress, position, total, timeLeft, onSeek,
}: ProgressBarProps) {
  const c = useTheme();

  return (
    <View style={pbStyles.container}>
      <Slider
        style={pbStyles.slider}
        minimumValue={0}
        maximumValue={Math.max(total - 1, 0)}
        step={1}
        value={position}
        onValueChange={onSeek}
        minimumTrackTintColor={c.progressBar}
        maximumTrackTintColor={c.progressBg}
        thumbTintColor={c.progressBar}
        accessibilityLabel={`Position: Wort ${position + 1} von ${total}`}
      />
      <View style={pbStyles.stats}>
        <Text style={[pbStyles.stat, { color: c.textSecondary }]}>
          {position + 1} / {total}
        </Text>
        <Text style={[pbStyles.stat, { color: c.textSecondary }]}>
          ≈ {timeLeft}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  slider: {
    flex:   1,
    height: 36,
  },
  bound: {
    ...Typography.caption,
    minWidth: 28,
    textAlign: 'center',
  },
  wpmValue: {
    ...Typography.label,
    textAlign:  'center',
    fontWeight: '500',
    marginTop:  2,
  },
});

const pbStyles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  slider: {
    width:  '100%',
    height: 36,
  },
  stats: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      2,
  },
  stat: {
    ...Typography.caption,
  },
});
