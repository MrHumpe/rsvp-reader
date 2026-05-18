// src/components/WordDisplay.tsx
// The central reading stage.  Shows one word at a time with ORP highlighting.
// This is the most performance-critical component – it renders on every tick.

import React, { memo } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { splitByOrp } from '../utils/orp';
import { Colors, Typography } from '../theme';
import type { AppSettings } from '../utils/settings';
import type { PlayState } from '../hooks/useRsvpEngine';

interface Props {
  word:        string;
  contextPrev: string;   // 2 words before current
  contextNext: string;   // 2 words after current
  playState:   PlayState;
  countdownVal:number;
  showOrp:     boolean;
  fontSize:    AppSettings['fontSize'];
}

const FONT_STYLES = {
  small:  Typography.wordSmall,
  medium: Typography.wordMedium,
  large:  Typography.wordLarge,
} as const;

function WordDisplayComponent({
  word,
  contextPrev,
  contextNext,
  playState,
  countdownVal,
  showOrp,
  fontSize,
}: Props) {
  const scheme = useColorScheme();
  const c      = scheme === 'dark' ? Colors.dark : Colors.light;
  const wStyle = FONT_STYLES[fontSize];

  const renderContent = () => {
    // Countdown overlay
    if (playState === 'countdown') {
      return (
        <Text style={[styles.countdownText, { color: c.text }]}>
          {countdownVal}
        </Text>
      );
    }

    // Idle / no text loaded
    if (!word) {
      return (
        <Text style={[styles.placeholderText, { color: c.textTertiary }]}>
          Dokument laden oder Text einfügen
        </Text>
      );
    }

    if (showOrp) {
      const { before, pivot, after } = splitByOrp(word);
      return (
        <View style={styles.wordRow}>
          <Text style={[wStyle, { color: c.text }]}>{before}</Text>
          <Text style={[wStyle, { color: c.pivot }]}>{pivot}</Text>
          <Text style={[wStyle, { color: c.text }]}>{after}</Text>
        </View>
      );
    }

    return (
      <Text style={[wStyle, { color: c.text }]}>{word}</Text>
    );
  };

  return (
    <View style={[styles.stage, { backgroundColor: c.surface, borderColor: c.border }]}>
      {/* Vertical guide line – subtle marker at the ORP position */}
      {showOrp && word && playState !== 'countdown' && (
        <View style={[styles.orpLine, { backgroundColor: c.border }]} />
      )}

      <View style={styles.wordContainer}>
        {renderContent()}
      </View>

      {/* Context strip */}
      {word && playState !== 'countdown' && (
        <View style={styles.contextStrip}>
          <Text
            style={[styles.contextText, { color: c.textTertiary }]}
            numberOfLines={1}
            ellipsizeMode="head"
          >
            {contextPrev}
          </Text>
          <Text style={[styles.contextCurrent, { color: c.textSecondary }]}>
            ···
          </Text>
          <Text
            style={[styles.contextText, { color: c.textTertiary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {contextNext}
          </Text>
        </View>
      )}
    </View>
  );
}

export const WordDisplay = memo(WordDisplayComponent);

const styles = StyleSheet.create({
  stage: {
    height:         180,
    borderRadius:   16,
    borderWidth:    0.5,
    justifyContent: 'center',
    alignItems:     'center',
    overflow:       'hidden',
    position:       'relative',
    marginBottom:   16,
  },
  orpLine: {
    position:   'absolute',
    top:        0,
    bottom:     0,
    width:      1,
    left:       '50%',
    opacity:    0.15,
  },
  wordContainer: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    paddingHorizontal: 24,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
  },
  countdownText: {
    fontSize:   80,
    fontWeight: '300',
  },
  placeholderText: {
    fontSize:  15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  contextStrip: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 16,
    paddingBottom:  12,
    gap:            6,
  },
  contextText: {
    flex:      1,
    fontSize:  12,
    textAlign: 'center',
  },
  contextCurrent: {
    fontSize:   12,
    letterSpacing: 2,
  },
});
