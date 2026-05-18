// src/hooks/useSharedContent.ts
// Empfängt Dateien und Texte die von anderen Apps an RSVP Reader weitergegeben werden.
//
// Android: reagiert auf ACTION_VIEW- und ACTION_SEND-Intents (konfiguriert in app.json).
//   Dateien kommen als content://-URI, Text direkt als Klartext-URL.
//   Einschränkung: ACTION_SEND mit reinem Text-Snippet (z.B. aus Browser "Teilen")
//   benötigt ein natives Modul (react-native-receive-sharing-intent) und ist hier
//   nicht unterstützt.
//
// iOS: reagiert auf "In App öffnen" / "Mit RSVP Reader öffnen" für PDF, DOCX und TXT.
//   Dateien kommen als file://-URI über das Linking-System.
//   Vollständige Share Extension (Teilen aus Safari etc.) erfordert ein natives
//   iOS App Extension Target und ist im Expo Managed Workflow nicht umsetzbar.

import { useEffect, useCallback, useRef } from 'react';
import { Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { extractText } from '../utils/textExtractor';

type OnSharedCallback = (text: string, filename: string) => void;

export function useSharedContent(onShared: OnSharedCallback): void {
  // Ref so handleUrl always sees the latest callback without re-subscribing
  const callbackRef = useRef(onShared);
  useEffect(() => { callbackRef.current = onShared; }, [onShared]);

  const handleUrl = useCallback(async (rawUrl: string) => {
    if (!rawUrl) return;

    // Ignore internal Expo / deep-link navigation URLs
    if (
      rawUrl.startsWith('exp://') ||
      rawUrl.startsWith('rsvpreader://') ||
      rawUrl.startsWith('http://localhost')
    ) return;

    let localUri = rawUrl;

    // Android content:// URIs — copy to app cache so expo-file-system can read them
    if (rawUrl.startsWith('content://')) {
      try {
        const ext      = guessExtension(rawUrl);
        const destUri  = `${FileSystem.cacheDirectory}shared_${Date.now()}${ext}`;
        await FileSystem.copyAsync({ from: rawUrl, to: destUri });
        localUri = destUri;
      } catch {
        return;
      }
    }

    const mimeType = guessMimeType(localUri);
    const result   = await extractText(localUri, mimeType);

    if (result.ok) {
      const raw      = rawUrl.split('/').pop() ?? '';
      const filename = decodeURIComponent(raw.split('?')[0]) || 'Geteiltes Dokument';
      callbackRef.current(result.text, filename);
    }
  }, []);

  useEffect(() => {
    // Case 1: app was cold-started via an intent / open-with
    Linking.getInitialURL().then((url) => { if (url) handleUrl(url); });

    // Case 2: app was already open and received an intent / open-with
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, [handleUrl]);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function guessMimeType(url: string): string {
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.pdf'))  return 'application/pdf';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.doc'))  return 'application/msword';
  return 'text/plain';
}

function guessExtension(url: string): string {
  const lower = url.toLowerCase().split('?')[0];
  if (lower.includes('.pdf'))  return '.pdf';
  if (lower.includes('.docx')) return '.docx';
  if (lower.includes('.doc'))  return '.doc';
  return '.txt';
}
