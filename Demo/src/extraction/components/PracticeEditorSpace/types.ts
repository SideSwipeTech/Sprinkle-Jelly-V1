/**
 * PracticeEditorSpace vocabulary — the draft shape and the closed word sets
 * the shared practice editing space edits against. Kept out of the .tsx for
 * the contract's file bound; consumers import from the component root.
 */

import type { SupportedLanguage } from "../CodeEditorChrome/CodeEditorChrome";

/** The platform's four authored difficulty values (VOCABULARY.md). */
export const PRACTICE_DIFFICULTIES = ["easy", "medium", "hard", "extreme"] as const;
export type PracticeDifficulty = (typeof PRACTICE_DIFFICULTIES)[number];

/** The launch interface: exactly one of a console program or a SQL query. */
export type PracticeInterface = "console" | "sql";

/** The three comparison policies — there is no fourth. */
export const COMPARISON_POLICIES = {
  "console-default": "Console default",
  "sql-ordered": "SQL ordered",
  "sql-unordered": "SQL unordered"
} as const;
export type ComparisonPolicy = keyof typeof COMPARISON_POLICIES;

/** The platform lifecycle — the store rows carry `submitted` too. */
export type PracticeLifecycle = "draft" | "submitted" | "published" | "archived";

export interface PracticeLanguage {
  /** Registry key — "python". */
  key: string;
  label: string;
  /** Editor grammar; defaults to `key` when it is a supported language. */
  language?: SupportedLanguage;
  /** Learner-visible starter — debug authors the buggy program here. */
  starter: string;
  /** Administrator-only reference solution — debug's reference fix. */
  reference: string;
}

export interface PracticeCase {
  key: string;
  /** sample = visible; hidden runs on submission only. */
  visibility: "visible" | "hidden";
  input: string;
  expected: string;
}

export interface PracticeChecklistItem {
  key: string;
  label: string;
  /** true met · false unmet · null = not yet verifiable (validation could not run). */
  met: boolean | null;
}

export interface PracticeDraft {
  title: string;
  difficulty: PracticeDifficulty;
  /** Comma-separated topics — classification and tags. */
  topics: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  /** One constraint per line. */
  constraints: string;
  interfaceKind: PracticeInterface;
  comparisonPolicy: ComparisonPolicy;
  /** Optional authored tolerance on a numeric comparison. */
  tolerance: string;
  /** Optional stricter budget — may only tighten the platform's own bounds. */
  timeLimit: string;
  memoryLimit: string;
  /** The learner-facing worked solution, opened once solved. */
  editorial: string;
  languages: PracticeLanguage[];
  cases: PracticeCase[];
}

/** A draft nothing has been authored into yet — the "new" flow's start. */
export function emptyPracticeDraft(): PracticeDraft {
  return {
    title: "",
    difficulty: "medium",
    topics: "",
    statement: "",
    inputDescription: "",
    outputDescription: "",
    constraints: "",
    interfaceKind: "console",
    comparisonPolicy: "console-default",
    tolerance: "",
    timeLimit: "",
    memoryLimit: "",
    editorial: "",
    languages: [],
    cases: []
  };
}
