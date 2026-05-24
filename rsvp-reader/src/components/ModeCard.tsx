// src/components/ModeCard.tsx
// Selectable card for a reading mode preset in the settings screen.

import React, { memo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Radius, Spacing, Typography } from '../theme';
import type { ReadingMode } from '../utils/readingModes';

interface Props {
  mode:       ReadingMode;
  selected:   boolean;
  onPress:    () => void;
}

export const ModeCard = memo(function ModeCard({ mode, selected, onPress }: Props) {
  const c = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        selected && { borderColor: c.text, borderWidth: 1.5 },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={mode.name}
      accessibilityState={{ selected }}
    >
      <View style={[styles.iconBg, { backgroundColor: selected ? c.text : c.backgroundSecondary }]}>
        <Ionicons
          name={mode.icon as any}
          size={20}
          color={selected ? c.buttonText : c.textSecondary}
        />
      </View>
      <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
        {mode.name}
      </Text>
      <Text style={[styles.desc, { color: c.textSecondary }]} numberOfLines={2}>
        {mode.description}
      </Text>
      {selected && (
        <View style={[styles.badge, { backgroundColor: c.text }]}>
          <Ionicons name="checkmark" size={10} color={c.buttonText} />
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width:        148,
    borderRadius: Radius.lg,
    borderWidth:  0.5,
    padding:      Spacing.sm + 2,
    marginRight:  Spacing.sm,
    gap:          4,
  },
  iconBg: {
    width:          36,
    height:         36,
    borderRadius:   Radius.md,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   2,
  },
  name: {
    ...Typography.subheading,
    fontSize: 14,
  },
  desc: {
    ...Typography.caption,
    lineHeight: 16,
  },
  badge: {
    position:     'absolute',
    top:          8,
    right:        8,
    width:        16,
    height:       16,
    borderRadius: 8,
    alignItems:   'center',
    justifyContent: 'center',
  },
});
