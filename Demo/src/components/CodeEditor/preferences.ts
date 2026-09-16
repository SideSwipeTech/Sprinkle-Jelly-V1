/**
 * preferences — the learner's editor settings, shared by every editor on the
 * platform and kept on this device. One store, so changing the font size in
 * Code Lab is the font size in a Daily too.
 */

import { useSyncExternalStore } from "react";

export interface EditorPreferences {
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  /** Height of the workbench console dock, in CSS pixels. */
  consoleHeight: number;
}

export const FONT_SIZE_MIN = 11;
export const FONT_SIZE_MAX = 22;

const STORAGE_KEY = "wp.editor.preferences";

const DEFAULTS: EditorPreferences = {
  fontSize: 14,
  wordWrap: false,
  minimap: false,
  consoleHeight: 240
};

function sanitize(raw: unknown): EditorPreferences {
  const next = { ...DEFAULTS };
  if (!raw || typeof raw !== "object") return next;
  const r = raw as Record<string, unknown>;
  if (typeof r.fontSize === "number" && Number.isFinite(r.fontSize)) {
    next.fontSize = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(r.fontSize)));
  }
  if (typeof r.wordWrap === "boolean") next.wordWrap = r.wordWrap;
  if (typeof r.minimap === "boolean") next.minimap = r.minimap;
  if (typeof r.consoleHeight === "number" && Number.isFinite(r.consoleHeight) && r.consoleHeight > 0) {
    next.consoleHeight = Math.round(r.consoleHeight);
  }
  return next;
}

function load(): EditorPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

let current: EditorPreferences = load();
const listeners = new Set<() => void>();

export function getEditorPreferences(): EditorPreferences {
  return current;
}

export function setEditorPreferences(patch: Partial<EditorPreferences>): void {
  const next = sanitize({ ...current, ...patch });
  if (
    next.fontSize === current.fontSize &&
    next.wordWrap === current.wordWrap &&
    next.minimap === current.minimap &&
    next.consoleHeight === current.consoleHeight
  ) {
    return;
  }
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* Storage can be full or blocked; the setting still applies for this visit. */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useEditorPreferences(): EditorPreferences {
  return useSyncExternalStore(subscribe, getEditorPreferences, getEditorPreferences);
}
