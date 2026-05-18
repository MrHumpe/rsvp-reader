// src/utils/library.ts
// Persistent document library.  Stores every loaded text with its metadata
// and last-read word position so users can resume where they left off.

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DocEntry {
  id:         string;  // djb2 hash of text content — stable identifier
  title:      string;
  text:       string;  // full document text
  wordCount:  number;
  position:   number;  // last-read word index (0-based)
  addedAt:    number;  // Unix ms
  lastReadAt: number;  // Unix ms
}

const STORAGE_KEY = '@rsvp_library_v1';

/**
 * djb2-style hash over a sample of the text.
 * Samples first+last 300 chars plus total length — fast on large texts,
 * collision-resistant enough for document identity.
 */
export function hashText(text: string): string {
  const sample = text.slice(0, 300) + text.slice(-300) + String(text.length);
  let h = 5381;
  for (let i = 0; i < sample.length; i++) {
    h = ((h << 5) + h) ^ sample.charCodeAt(i);
    h = h >>> 0; // keep 32-bit unsigned
  }
  return h.toString(36);
}

async function loadAll(): Promise<DocEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DocEntry[]) : [];
  } catch {
    return [];
  }
}

async function saveAll(entries: DocEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

/** Returns all entries sorted by most-recently-read first. */
export async function getLibrary(): Promise<DocEntry[]> {
  const entries = await loadAll();
  return entries.sort((a, b) => b.lastReadAt - a.lastReadAt);
}

/** Insert or update a document.  If the doc already exists, text/title/wordCount
 *  are refreshed but the saved position is preserved unless explicitly passed. */
export async function upsertDoc(
  entry: Omit<DocEntry, 'addedAt' | 'lastReadAt'>,
): Promise<void> {
  const entries = await loadAll();
  const idx = entries.findIndex((e) => e.id === entry.id);
  const now = Date.now();
  if (idx >= 0) {
    entries[idx] = {
      ...entries[idx],
      title:      entry.title,
      text:       entry.text,
      wordCount:  entry.wordCount,
      position:   entry.position,
      lastReadAt: now,
    };
  } else {
    entries.push({ ...entry, addedAt: now, lastReadAt: now });
  }
  await saveAll(entries);
}

/** Persist the current reading position for an existing document. */
export async function saveBookmark(id: string, position: number): Promise<void> {
  const entries = await loadAll();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) {
    entries[idx].position   = position;
    entries[idx].lastReadAt = Date.now();
    await saveAll(entries);
  }
}

export async function getDoc(id: string): Promise<DocEntry | null> {
  const entries = await loadAll();
  return entries.find((e) => e.id === id) ?? null;
}

export async function deleteDoc(id: string): Promise<void> {
  const entries = await loadAll();
  await saveAll(entries.filter((e) => e.id !== id));
}
