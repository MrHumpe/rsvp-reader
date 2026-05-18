// src/components/DocumentPicker.tsx
// Upload zone for PDF, DOCX, and TXT files.
// Shows loading state, error messages, and file metadata on success.

import React, { useState, memo } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, useColorScheme, ActivityIndicator,
  Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { extractText } from '../utils/textExtractor';
import { formatTime, estimateReadingTime } from '../utils/textExtractor';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface Props {
  wpm:        number;
  onTextReady:(text: string, filename: string) => void;
}

type ImportState = 'idle' | 'loading' | 'error';

export const DocumentPickerView = memo(function DocumentPickerView({ wpm, onTextReady }: Props) {
  const scheme = useColorScheme();
  const c      = scheme === 'dark' ? Colors.dark : Colors.light;

  const [importState, setImportState] = useState<ImportState>('idle');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [pasteModal,  setPasteModal]  = useState(false);
  const [pasteText,   setPasteText]   = useState('');

  // ─── File Import ─────────────────────────────────────────────────────────

  const handlePickFile = async () => {
    try {
      setImportState('loading');
      setErrorMsg('');

      const result = await DocPicker.getDocumentAsync({
        type: [
          'text/plain',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setImportState('idle');
        return;
      }

      const asset    = result.assets[0];
      const mimeType = asset.mimeType ?? '';
      const uri      = asset.uri;
      const name     = asset.name ?? 'Dokument';

      const extraction = await extractText(uri, mimeType);

      if (!extraction.ok) {
        setImportState('error');
        setErrorMsg(extraction.error);
        return;
      }

      setImportState('idle');
      onTextReady(extraction.text, name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Fehler.';
      setImportState('error');
      setErrorMsg(msg);
    }
  };

  // ─── Paste / Type Text ────────────────────────────────────────────────────

  const handlePasteConfirm = () => {
    const trimmed = pasteText.trim();
    if (!trimmed) return;
    setPasteModal(false);
    setPasteText('');
    onTextReady(trimmed, 'Eingefügter Text');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View>
      {/* Upload zone */}
      <TouchableOpacity
        style={[styles.uploadZone, { borderColor: c.border, backgroundColor: c.backgroundSecondary }]}
        onPress={handlePickFile}
        disabled={importState === 'loading'}
        activeOpacity={0.75}
        accessibilityLabel="Datei auswählen"
        accessibilityRole="button"
      >
        {importState === 'loading' ? (
          <>
            <ActivityIndicator size="large" color={c.textSecondary} />
            <Text style={[styles.uploadLabel, { color: c.textSecondary, marginTop: 12 }]}>
              Wird eingelesen…
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={36} color={c.textTertiary} />
            <Text style={[styles.uploadLabel, { color: c.text }]}>
              Datei hochladen
            </Text>
            <Text style={[styles.uploadSub, { color: c.textSecondary }]}>
              PDF · Word (.docx) · Textdatei (.txt)
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Error state */}
      {importState === 'error' && (
        <View style={[styles.errorBox, { backgroundColor: 'rgba(226,75,74,0.08)', borderColor: '#E24B4A' }]}>
          <Ionicons name="alert-circle-outline" size={16} color="#E24B4A" />
          <Text style={[styles.errorText, { color: '#E24B4A' }]}>{errorMsg}</Text>
        </View>
      )}

      {/* Paste / type text button */}
      <TouchableOpacity
        style={[styles.pasteButton, { borderColor: c.border }]}
        onPress={() => setPasteModal(true)}
        activeOpacity={0.75}
        accessibilityLabel="Text einfügen oder eingeben"
        accessibilityRole="button"
      >
        <Ionicons name="create-outline" size={18} color={c.textSecondary} />
        <Text style={[styles.pasteLabel, { color: c.textSecondary }]}>
          Text einfügen oder eingeben
        </Text>
      </TouchableOpacity>

      {/* Paste modal */}
      <Modal
        visible={pasteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPasteModal(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor: c.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setPasteModal(false)}
              accessibilityLabel="Abbrechen"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={24} color={c.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: c.text }]}>Text einfügen</Text>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: c.buttonBg },
                !pasteText.trim() && { opacity: 0.4 },
              ]}
              onPress={handlePasteConfirm}
              disabled={!pasteText.trim()}
              accessibilityLabel="Text laden"
              accessibilityRole="button"
            >
              <Text style={[styles.confirmLabel, { color: c.buttonText }]}>Übernehmen</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.textArea,
              { color: c.text, borderColor: c.border, backgroundColor: c.backgroundSecondary },
            ]}
            multiline
            autoFocus
            placeholder="Text hier einfügen oder tippen…"
            placeholderTextColor={c.textTertiary}
            value={pasteText}
            onChangeText={setPasteText}
            textAlignVertical="top"
          />

          {pasteText.trim().length > 0 && (
            <Text style={[styles.wordCountHint, { color: c.textSecondary }]}>
              ~{pasteText.trim().split(/\s+/).length} Wörter ·{' '}
              {formatTime(estimateReadingTime(pasteText.trim().split(/\s+/).length, wpm))} bei {wpm} wpm
            </Text>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  uploadZone: {
    borderWidth:    1.5,
    borderStyle:    'dashed',
    borderRadius:   Radius.lg,
    padding:        Spacing.xl,
    alignItems:     'center',
    marginBottom:   Spacing.sm,
    minHeight:      130,
    justifyContent: 'center',
  },
  uploadLabel: {
    ...Typography.subheading,
    marginTop: 10,
  },
  uploadSub: {
    ...Typography.caption,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:            8,
    borderWidth:    0.5,
    borderRadius:   Radius.sm,
    padding:        10,
    marginBottom:   Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    flex: 1,
  },
  pasteButton: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:             8,
    borderWidth:    0.5,
    borderRadius:   Radius.md,
    padding:        12,
  },
  pasteLabel: {
    ...Typography.body,
  },
  modalContainer: {
    flex:    1,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   Spacing.md,
    marginTop:      Spacing.sm,
  },
  modalTitle: {
    ...Typography.subheading,
  },
  textArea: {
    flex:         1,
    borderWidth:  0.5,
    borderRadius: Radius.md,
    padding:      Spacing.md,
    fontSize:     15,
    lineHeight:   22,
    marginBottom: Spacing.sm,
  },
  wordCountHint: {
    ...Typography.caption,
    textAlign:    'center',
    marginBottom: Spacing.sm,
  },
  confirmButton: {
    borderRadius:      Radius.md,
    paddingHorizontal: 16,
    paddingVertical:    8,
    alignItems:        'center',
  },
  confirmLabel: {
    ...Typography.body,
    fontWeight: '600',
  },
});
