/**
 * workbench-context — what the pieces of a code workbench share without the
 * page wiring it: the live editor status (cursor, selection, language), the
 * mounted editor's actions for the toolbar, the Run/Submit handlers the
 * shortcuts call, and whether the console dock is collapsed.
 */

import { createContext, useContext, useSyncExternalStore, type MutableRefObject } from "react";
import type { SupportedLanguage } from "./language";

export interface EditorFile {
  path: string;
  name?: string;
  language?: string;
  isDirty?: boolean;
  content: string;
}

/** What the toolbar can ask of the mounted editor. */
export interface EditorApi {
  format: () => void;
  copy: () => Promise<boolean>;
  focus: () => void;
}

export interface EditorStatus {
  line: number;
  column: number;
  /** Characters in the current selection. */
  selected: number;
  lines: number;
  language: SupportedLanguage | null;
  tabSize: number;
  insertSpaces: boolean;
  readOnly: boolean;
  /** A diff view reports its change count here instead of a cursor. */
  changes: number | null;
  /** When the learner last pressed Save — drives a brief confirmation. */
  savedAt: number;
}

export const INITIAL_STATUS: EditorStatus = {
  line: 1,
  column: 1,
  selected: 0,
  lines: 1,
  language: null,
  tabSize: 4,
  insertSpaces: true,
  readOnly: false,
  changes: null,
  savedAt: 0
};

export interface StatusStore {
  get: () => EditorStatus;
  set: (patch: Partial<EditorStatus>) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStatusStore(): StatusStore {
  let state = INITIAL_STATUS;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (patch) => {
      let changed = false;
      for (const key of Object.keys(patch) as (keyof EditorStatus)[]) {
        if (patch[key] !== state[key]) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export function useEditorStatus(store: StatusStore): EditorStatus {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export interface WorkbenchContextValue {
  status: StatusStore;
  registerEditor: (api: EditorApi) => void;
  unregisterEditor: (api: EditorApi) => void;
  runRef: MutableRefObject<(() => void) | undefined>;
  submitRef: MutableRefObject<(() => void) | undefined>;
  consoleCollapsed: boolean;
  setConsoleCollapsed: (collapsed: boolean) => void;
}

export const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

/** The surrounding workbench, or null for a standalone editor or console. */
export function useWorkbench(): WorkbenchContextValue | null {
  return useContext(WorkbenchContext);
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** The platform's own name for the command modifier. */
export const MOD_KEY = isMac ? "⌘" : "Ctrl";
export const ALT_KEY = isMac ? "⌥" : "Alt";
