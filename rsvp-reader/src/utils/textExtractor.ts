// src/utils/textExtractor.ts
// Handles reading plain text, PDF, and Word (.docx) files.
// Returns a plain string ready for the word-splitter.

import * as FileSystem from 'expo-file-system';

export type SupportedMimeType =
  | 'text/plain'
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/msword';

export type ExtractionResult =
  | { ok: true; text: string; wordCount: number }
  | { ok: false; error: string };

// ─── Plain Text ────────────────────────────────────────────────────────────────

async function extractTxt(uri: string): Promise<string> {
  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return content;
}

// ─── DOCX via mammoth ──────────────────────────────────────────────────────────
// mammoth converts .docx to plain text by stripping XML markup.

async function extractDocx(uri: string): Promise<string> {
  // Read the file as base64 then convert to ArrayBuffer for mammoth
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Convert base64 → Uint8Array
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // mammoth expects an ArrayBuffer
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
  return result.value;
}

// ─── PDF ───────────────────────────────────────────────────────────────────────
// PDF text extraction on mobile is complex. We use react-native-pdf's page
// rendering. For a production app you would integrate a native PDF text-layer
// library (e.g. PDFKit on iOS, PdfRenderer on Android via a native module).
// Here we provide a clear stub + the correct integration pattern.

async function extractPdf(uri: string): Promise<string> {
  // TODO: Replace this stub with a native PDF-text extraction module.
  // Recommended options:
  //   - expo-pdf-reader (community)
  //   - react-native-pdf-lib
  //   - A custom Expo module wrapping iOS PDFKit / Android PdfRenderer
  //
  // The stub below throws a helpful error so the UI can guide the user.
  throw new Error(
    'PDF-Textextraktion benötigt ein natives Modul. ' +
    'Bitte füge "expo-pdf-reader" hinzu oder kopiere den Text manuell.',
  );
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function extractText(
  uri: string,
  mimeType: string,
): Promise<ExtractionResult> {
  try {
    let text: string;

    if (
      mimeType === 'text/plain' ||
      uri.endsWith('.txt') ||
      uri.endsWith('.md')
    ) {
      text = await extractTxt(uri);
    } else if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      uri.endsWith('.docx') ||
      uri.endsWith('.doc')
    ) {
      text = await extractDocx(uri);
    } else if (
      mimeType === 'application/pdf' ||
      uri.endsWith('.pdf')
    ) {
      text = await extractPdf(uri);
    } else {
      // Fallback: try reading as plain text
      text = await extractTxt(uri);
    }

    const cleaned = cleanText(text);
    const wordCount = splitWords(cleaned).length;

    return { ok: true, text: cleaned, wordCount };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unbekannter Fehler beim Einlesen.';
    return { ok: false, error: message };
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Remove excessive whitespace, normalize line breaks. */
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')   // max 2 consecutive blank lines
    .replace(/[ \t]+/g, ' ')       // collapse horizontal whitespace
    .trim();
}

/** Split cleaned text into a word array, preserving punctuation on tokens. */
export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

/** Estimate reading time in seconds for a given word count and WPM. */
export function estimateReadingTime(wordCount: number, wpm: number): number {
  return Math.ceil((wordCount / wpm) * 60);
}

/** Format seconds as "2 min 34 s" */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} min ${s} s` : `${m} min`;
}
