// src/components/ToggleRow.tsx
// A labelled on/off switch for the settings area.

import React, { memo } from 'react';
import { View, Text, Switch, StyleSheet, useColorScheme, Platform } from 'react-native';
import { Colors, Typography } from '../theme';

interface Props {
  label:       string;
  description?: string;
  value:       boolean;
  onChange:    (val: boolean) => void;
}

export const ToggleRow = memo(function ToggleRow({
  label, description, value, onChange,
}: Props) {
  const scheme = useColorScheme();
  const c      = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: c.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.desc, { color: c.textSecondary }]}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: c.toggleOff, true: c.toggleOn }}
        thumbColor={Platform.OS === 'android' ? (value ? c.buttonText : '#fff') : undefined}
        ios_backgroundColor={c.toggleOff}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  textBlock: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    ...Typography.body,
  },
  desc: {
    ...Typography.caption,
    marginTop: 2,
  },
});
