// src/components/PlayerControls.tsx
// Transport controls: play/pause, backward/forward jumps, reset.
// Mirrors familiar media player UX so users feel immediately at home.

import React, { memo } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet, useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius } from '../theme';
import type { PlayState } from '../hooks/useRsvpEngine';

interface Props {
  playState:   PlayState;
  onToggle:    () => void;
  onJump:      (delta: number) => void;
  onReset:     () => void;
  disabled:    boolean;
}

function PlayerControlsComponent({ playState, onToggle, onJump, onReset, disabled }: Props) {
  const scheme = useColorScheme();
  const c      = scheme === 'dark' ? Colors.dark : Colors.light;

  const isPlaying = playState === 'playing' || playState === 'countdown';

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const handleJump = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onJump(delta);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReset();
  };

  return (
    <View style={styles.container}>
      {/* Jump backward */}
      <View style={styles.jumpGroup}>
        <JumpButton label="−20" onPress={() => handleJump(-20)} color={c} disabled={disabled} />
        <JumpButton label="−10" onPress={() => handleJump(-10)} color={c} disabled={disabled} />
        <JumpButton label="−5"  onPress={() => handleJump(-5)}  color={c} disabled={disabled} />
      </View>

      {/* Play / Pause – primary CTA */}
      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: c.buttonBg },
          disabled && styles.disabledButton,
        ]}
        onPress={handleToggle}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityLabel={isPlaying ? 'Pause' : 'Abspielen'}
        accessibilityRole="button"
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={28}
          color={c.buttonText}
        />
      </TouchableOpacity>

      {/* Jump forward */}
      <View style={styles.jumpGroup}>
        <JumpButton label="+5"  onPress={() => handleJump(5)}  color={c} disabled={disabled} />
        <JumpButton label="+10" onPress={() => handleJump(10)} color={c} disabled={disabled} />
        <JumpButton label="+20" onPress={() => handleJump(20)} color={c} disabled={disabled} />
      </View>

      {/* Reset button */}
      <TouchableOpacity
        style={[styles.resetButton, { borderColor: c.border }]}
        onPress={handleReset}
        disabled={disabled}
        accessibilityLabel="Zurücksetzen"
        accessibilityRole="button"
      >
        <Ionicons name="refresh" size={18} color={c.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Jump Button ───────────────────────────────────────────────────────────────

interface JumpButtonProps {
  label:    string;
  onPress:  () => void;
  color:    typeof Colors.light;
  disabled: boolean;
}

function JumpButton({ label, onPress, color: c, disabled }: JumpButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.jumpButton,
        { borderColor: c.border },
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityLabel={`Springe ${label} Wörter`}
      accessibilityRole="button"
    >
      <Text style={[styles.jumpLabel, { color: c.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const PlayerControls = memo(PlayerControlsComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.sm,
    flexWrap:       'wrap',
    marginBottom:   Spacing.md,
  },
  playButton: {
    width:          64,
    height:         64,
    borderRadius:   Radius.full,
    justifyContent: 'center',
    alignItems:     'center',
  },
  jumpGroup: {
    flexDirection: 'row',
    gap:           4,
  },
  jumpButton: {
    paddingHorizontal: 10,
    paddingVertical:    8,
    borderRadius:       Radius.sm,
    borderWidth:        0.5,
    minWidth:           40,
    alignItems:         'center',
  },
  jumpLabel: {
    fontSize:   13,
    fontWeight: '500',
  },
  resetButton: {
    padding:      10,
    borderRadius: Radius.sm,
    borderWidth:  0.5,
    position:     'absolute',
    right:        0,
  },
  disabledButton: {
    opacity: 0.35,
  },
});
