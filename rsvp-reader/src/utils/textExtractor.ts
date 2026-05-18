// src/utils/textExtractor.ts
// Handles reading plain text, PDF, and Word (.docx) files.
// Returns a plain string ready for the word-splitter.

import * as FileSystem from 'expo-file-system/legacy';

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
    encoding: 'utf8',
  });
  return content;
}

// ─── DOCX via mammoth ──────────────────────────────────────────────────────────
// mammoth converts .docx to plain text by stripping XML markup.

async function extractDocx(uri: string): Promise<string> {
  // Read the file as base64 then convert to ArrayBuffer for mammoth
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
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
// Pure-JS best-effort PDF text extractor.
// Works for uncompressed / programmatically generated PDFs (LaTeX, Word export,
// most web-generated PDFs without FlateDecode compression on content streams).
// Scanned PDFs or those with fully compressed streams produce a helpful error.

async function extractPdf(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });

  const binary = atob(base64);
  const text   = parsePdfText(binary);

  if (!text.trim()) {
    throw new Error(
      'Kein lesbarer Text in dieser PDF gefunden. ' +
      'Die Datei verwendet vermutlich komprimierte Streams oder gescannten Text. ' +
      'Bitte den Text manuell einfügen.',
    );
  }

  return text;
}

/** Extract readable text from raw PDF binary via content-stream parsing. */
function parsePdfText(binary: string): string {
  const parts: string[] = [];
  const streamRe = /stream\r?\n([\s\S]*?)endstream/g;
  let streamMatch: RegExpExecArray | null;

  while ((streamMatch = streamRe.exec(binary)) !== null) {
    const content = streamMatch[1];
    if (!content.includes('BT')) continue; // skip non-text / compressed streams

    const btEtRe = /BT([\s\S]*?)ET/g;
    let btMatch: RegExpExecArray | null;

    while ((btMatch = btEtRe.exec(content)) !== null) {
      const block = btMatch[1];
      let m: RegExpExecArray | null;

      // (text) Tj — simple string
      const tjRe = /\(([^)]*)\)\s*Tj/g;
      while ((m = tjRe.exec(block)) !== null) {
        const s = decodePdfString(m[1]);
        if (s.trim()) parts.push(s);
      }

      // [(text) kern (text)] TJ — string array with kerning
      const tjArrRe = /\[([\s\S]*?)\]\s*TJ/g;
      while ((m = tjArrRe.exec(block)) !== null) {
        const strRe = /\(([^)]*)\)/g;
        let segment = '';
        let sm: RegExpExecArray | null;
        while ((sm = strRe.exec(m[1])) !== null) segment += decodePdfString(sm[1]);
        if (segment.trim()) parts.push(segment);
      }

      // (text) '  and  (text) " — next-line-then-show operators
      const nlRe = /\(([^)]*)\)\s*['"]/g;
      while ((m = nlRe.exec(block)) !== null) {
        const s = decodePdfString(m[1]);
        if (s.trim()) parts.push('\n' + s);
      }
    }
  }

  return parts.join(' ');
}

/** Decode PDF literal-string escape sequences. */
function decodePdfString(s: string): string {
  return s
    .replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
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
