// src/components/WpmSlider.tsx
// Speed control with live WPM readout.

import React, { memo } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Typography, WPM_MIN, WPM_MAX } from '../theme';

interface WpmSliderProps {
  wpm:      number;
  onChange: (wpm: number) => void;
}

export const WpmSlider = memo(function WpmSlider({ wpm, onChange }: WpmSliderProps) {
  const scheme = useColorScheme();
  const c      = scheme === 'dark' ? Colors.dark : Colors.light;

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
// src/components/ProgressBar.tsx

interface ProgressBarProps {
  progress:   number;   // 0–1
  position:   number;
  total:      number;
  timeLeft:   string;
}

export const ProgressBar = memo(function ProgressBar({
  progress, position, total, timeLeft,
}: ProgressBarProps) {
  const scheme = useColorScheme();
  const c      = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={pbStyles.container}>
      <View style={[pbStyles.track, { backgroundColor: c.progressBg }]}>
        <View
          style={[
            pbStyles.fill,
            { width: `${(progress * 100).toFixed(1)}%`, backgroundColor: c.progressBar },
          ]}
        />
      </View>
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
    marginBottom: 12,
  },
  track: {
    height:       3,
    borderRadius: 2,
    overflow:     'hidden',
  },
  fill: {
    height:       3,
    borderRadius: 2,
  },
  stats: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:       6,
  },
  stat: {
    ...Typography.caption,
  },
});
