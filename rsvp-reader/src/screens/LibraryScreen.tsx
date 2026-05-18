// src/screens/LibraryScreen.tsx
// Zeigt alle bisher geladenen Dokumente mit Titel, Fortschritt und
// letztem Lesedatum.  Tippen öffnet das Dokument im Reader-Tab.

import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { getLibrary, deleteDoc, type DocEntry } from '../utils/library';
import { setPendingDoc } from '../utils/pendingLoad';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7)  return `Vor ${diffDays} Tagen`;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function progressLabel(entry: DocEntry): string {
  if (entry.position === 0) return 'Noch nicht gestartet';
  if (entry.position >= entry.wordCount - 1) return 'Fertig gelesen';
  const pct = Math.round((entry.position / entry.wordCount) * 100);
  return `${pct} % gelesen`;
}

// ─── Row component ─────────────────────────────────────────────────────────────

interface RowProps {
  entry:    DocEntry;
  onOpen:   (entry: DocEntry) => void;
  onDelete: (entry: DocEntry) => void;
}

const DocRow = memo(function DocRow({ entry, onOpen, onDelete }: RowProps) {
  const c = useTheme();
  const pct = entry.wordCount > 0
    ? Math.min(1, entry.position / entry.wordCount)
    : 0;

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={() => onOpen(entry)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${entry.title} öffnen`}
    >
      {/* Progress bar strip at top of card */}
      <View style={[styles.rowProgress, { backgroundColor: c.progressBg }]}>
        <View style={[
          styles.rowProgressFill,
          { backgroundColor: c.progressBar, width: `${pct * 100}%` as any },
        ]} />
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowMeta}>
          <Text style={[styles.rowTitle, { color: c.text }]} numberOfLines={2}>
            {entry.title}
          </Text>
          <Text style={[styles.rowSub, { color: c.textSecondary }]}>
            {entry.wordCount.toLocaleString('de-DE')} Wörter · {progressLabel(entry)}
          </Text>
          <Text style={[styles.rowDate, { color: c.textTertiary }]}>
            {formatDate(entry.lastReadAt)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onDelete(entry)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Dokument löschen"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={18} color={c.textTertiary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

// ─── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = memo(function EmptyState() {
  const c = useTheme();
  return (
    <View style={styles.empty}>
      <Ionicons name="library-outline" size={52} color={c.textTertiary} />
      <Text style={[styles.emptyTitle, { color: c.text }]}>
        Noch keine Dokumente
      </Text>
      <Text style={[styles.emptySub, { color: c.textSecondary }]}>
        Lade im Reader-Tab ein Dokument oder{'\n'}füge Text ein – es erscheint dann hier.
      </Text>
    </View>
  );
});

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function LibraryScreen() {
  const c      = useTheme();
  const router = useRouter();
  const [entries,     setEntries]     = useState<DocEntry[]>([]);
  const [refreshing,  setRefreshing]  = useState(false);

  const load = useCallback(async () => {
    const data = await getLibrary();
    setEntries(data);
  }, []);

  // Reload every time the tab comes into focus
  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleOpen = useCallback((entry: DocEntry) => {
    setPendingDoc(entry.id);
    router.navigate('/');
  }, [router]);

  const handleDelete = useCallback((entry: DocEntry) => {
    Alert.alert(
      'Dokument löschen',
      `„${entry.title}" aus der Bibliothek entfernen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(entry.id);
            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          },
        },
      ],
    );
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: c.text }]}>Bibliothek</Text>
        <Text style={[styles.subheading, { color: c.textSecondary }]}>
          {entries.length > 0
            ? `${entries.length} Dokument${entries.length === 1 ? '' : 'e'}`
            : ''}
        </Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocRow entry={item} onOpen={handleOpen} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={[
          styles.list,
          entries.length === 0 && styles.listEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={c.textSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop:        Spacing.md,
    paddingBottom:     Spacing.sm,
  },
  heading: {
    ...Typography.heading,
  },
  subheading: {
    ...Typography.caption,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom:     Spacing.xxl,
    gap:               Spacing.sm,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    borderRadius: Radius.lg,
    borderWidth:  0.5,
    overflow:     'hidden',
  },
  rowProgress: {
    height: 3,
  },
  rowProgressFill: {
    height: '100%',
  },
  rowBody: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        Spacing.md,
    gap:            Spacing.sm,
  },
  rowMeta: {
    flex: 1,
    gap:  3,
  },
  rowTitle: {
    ...Typography.subheading,
  },
  rowSub: {
    ...Typography.caption,
  },
  rowDate: {
    ...Typography.caption,
    marginTop: 2,
  },
  empty: {
    alignItems:  'center',
    paddingTop:  Spacing.xxl,
    gap:         Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.subheading,
    marginTop: Spacing.sm,
  },
  emptySub: {
    ...Typography.body,
    textAlign:  'center',
    lineHeight: 22,
  },
});
