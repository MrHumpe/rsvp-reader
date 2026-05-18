// src/utils/pendingLoad.ts
// Module-level signal for cross-tab document loading.
// LibraryScreen calls setPendingDoc() before navigating to the Reader tab.
// ReaderScreen calls consumePendingDoc() on focus to pick up the request.

let pending: string | null = null;

export function setPendingDoc(id: string): void {
  pending = id;
}

export function consumePendingDoc(): string | null {
  const id = pending;
  pending = null;
  return id;
}
