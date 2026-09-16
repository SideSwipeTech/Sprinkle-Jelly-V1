/**
 * Debug studio fixtures — the administrative reads behind the four debug
 * pages: the case index, the curated bug-type vocabulary, the content review
 * and the maintenance path.
 *
 * Everything here is aggregate: identifiers, counts, categories and dates
 * only, never learner text (debug/01 "Content review" — administrative
 * figures carry identifiers, counts, categories and dates only, and the
 * studio case list is built from counts alone). Fixture state only.
 */

import { getStore, patchStore } from "@state/store";

/* Named privileged actions — verbatim where the documents state them. */
export const ACTION = {
  curateBugTypes: "debug-detective.curate_bug_types", // verbatim — debug/04-authoring, decision 141
  readReview: "debug-detective.read_content_review", // chosen, not stated
  removePristineDraft: "debug-detective.remove_pristine_draft" // chosen, not stated
} as const;

/* The platform figures these screens read, by registered name. */
export const FIG = {
  PLATFORM_EXPORT_ROW_CAP: 5000
} as const;

/** The product clock's fixture today — the demo's other fixtures cluster here. */
export const TODAY = "2026-08-24";

/** A staff write commits with its audit row — one narrow append. */
export function recordAudit(action: string) {
  const s = getStore();
  patchStore({
    adminAudit: [
      { id: `au-${Date.now()}`, at: new Date().toISOString(), actor: s.session.name, action },
      ...s.adminAudit
    ]
  });
}

/* ── The bug-type vocabulary (debug_bug_types) ────────────────────────────
   One curated platform-level list this domain is the home of: each member
   carries its name, its order and whether it is active. A case's bug types
   reference it, and the board's filter and the bug-types-practised figure
   read it — no second list exists. The seed members are the spec's six. */

export interface BugTypeEntry {
  name: string;
  order: number;
  /** Retired members stay listed — cases already referencing them keep resolving. */
  active: boolean;
}

export const BUG_TYPE_SEED: BugTypeEntry[] = [
  { name: "off-by-one", order: 1, active: true },
  { name: "boundary", order: 2, active: true },
  { name: "state", order: 3, active: true },
  { name: "logic", order: 4, active: true },
  { name: "resource", order: 5, active: true },
  { name: "typo", order: 6, active: true }
];

/* ── The administrative case read ───────────────────────────────────────── */

/** The closed four honesty labels — the shared vocabulary, never invented. */
export type HonestyLabel = "measured" | "derived" | "estimated" | "unavailable";

/** A time figure: the value plus its own quality label, scoped to itself. */
export interface TimedFigure {
  minutes: number | null;
  label: HonestyLabel;
}

/** One mode's figures — timed and practice are reported separately, never averaged. */
export interface DebugModeStats {
  /** Unique eligible starters on this side. */
  starters: number;
  /** Unique learners whose fix was accepted on this side. */
  accepted: number;
  /** Timed: the median timed period. Practice: the median time to fix. */
  medianSolve: TimedFigure;
  /** Timed only: windows the clock ended, not the learner. */
  allowanceExhausted?: number;
  /** Timed only: starters who carried on into practice after the window. */
  carriedOn?: { count: number; of: number };
  /** Practice only: median validations before an acceptance. */
  medianValidations?: { value: number | null; label: HonestyLabel };
  /** Practice only: hint reveals — counted against each hint's own identity. */
  hintReveals?: number;
  /** Practice only: submissions that ended as platform failures. */
  platformFailures?: { count: number; of: number };
}

export interface DebugCaseRow {
  id: string;
  title: string;
  lifecycle: "draft" | "published" | "archived";
  difficulty: string;
  primarySkill: string;
  bugTypes: string[];
  /** The authored planted-bug count — content metadata, never derived from a solve. */
  bugCount: number | null;
  mode: "practice" | "timed";
  /** The authored time budget — the timed duration where one is authored. */
  budgetMinutes: number | null;
  createdAt: string;
  publishedAt: string | null;
  /* The funnel counts unique eligible learners, so repeated runs and
     validations stay diagnostics and cannot pull the headline fix rate. */
  opened: number;
  submitted: number;
  fixed: number;
  timed: DebugModeStats | null;
  practice: DebugModeStats | null;
  /** When these figures were actually recomputed — never when the page opened. */
  computedAt: string;
}

/** The counts behind the store's three published rows. */
export const DEBUG_CASE_STATS: Record<string, DebugCaseRow> = {
  "window-overrun": {
    id: "window-overrun",
    title: "Off-by-one in a Sliding Window",
    lifecycle: "published",
    difficulty: "medium",
    primarySkill: "arrays",
    bugTypes: ["off-by-one"],
    bugCount: 1,
    mode: "timed",
    budgetMinutes: 15,
    createdAt: "2026-07-02",
    publishedAt: "2026-07-03",
    opened: 412,
    submitted: 388,
    fixed: 301,
    timed: {
      starters: 210,
      accepted: 143,
      medianSolve: { minutes: 11, label: "measured" },
      allowanceExhausted: 18,
      carriedOn: { count: 46, of: 210 }
    },
    practice: {
      starters: 178,
      accepted: 144,
      medianSolve: { minutes: 9, label: "measured" },
      medianValidations: { value: 3, label: "measured" },
      hintReveals: 214,
      platformFailures: { count: 2, of: 178 }
    },
    computedAt: "2026-08-24T06:00Z"
  },
  "closed-over-loop": {
    id: "closed-over-loop",
    title: "Closed-over Loop Variable",
    lifecycle: "published",
    difficulty: "easy",
    primarySkill: "closures",
    bugTypes: ["state"],
    bugCount: 1,
    mode: "practice",
    budgetMinutes: null,
    createdAt: "2026-06-18",
    publishedAt: "2026-06-19",
    opened: 305,
    submitted: 240,
    fixed: 96,
    timed: null,
    practice: {
      starters: 240,
      accepted: 96,
      medianSolve: { minutes: 14, label: "estimated" },
      medianValidations: { value: 5, label: "measured" },
      hintReveals: 481,
      platformFailures: { count: 5, of: 240 }
    },
    computedAt: "2026-08-24T06:00Z"
  },
  "mutable-default-arg": {
    id: "mutable-default-arg",
    title: "Mutable Default Argument Leak",
    lifecycle: "published",
    difficulty: "medium",
    primarySkill: "functions",
    bugTypes: ["state"],
    bugCount: 1,
    mode: "timed",
    budgetMinutes: 12,
    createdAt: "2026-08-21",
    publishedAt: "2026-08-22",
    opened: 9,
    submitted: 0,
    fixed: 0,
    timed: {
      starters: 4,
      accepted: 0,
      medianSolve: { minutes: null, label: "unavailable" },
      allowanceExhausted: 0,
      carriedOn: { count: 0, of: 4 }
    },
    practice: {
      starters: 5,
      accepted: 0,
      medianSolve: { minutes: null, label: "unavailable" },
      medianValidations: { value: null, label: "unavailable" },
      hintReveals: 0,
      platformFailures: { count: 0, of: 5 }
    },
    computedAt: "2026-08-24T06:00Z"
  }
};

/* Fixture-only rows — authored material the store's row list does not hold.
   The drafts let the maintenance path show both its branches: a pristine
   draft nobody has met, and a touched draft the guard refuses. The archived
   row keeps the index's third lifecycle honest — settled, still listed, and
   unrestorable, so the archive-then-terminal read is on screen before any
   transition is taken. */
export const DEBUG_FIXTURE_ROWS: DebugCaseRow[] = [
  {
    id: "untitled-buffer-draft",
    title: "Untitled draft",
    lifecycle: "draft",
    difficulty: "medium",
    primarySkill: "strings",
    bugTypes: ["boundary"],
    bugCount: null,
    mode: "practice",
    budgetMinutes: null,
    createdAt: "2026-08-23",
    publishedAt: null,
    opened: 0,
    submitted: 0,
    fixed: 0,
    timed: null,
    practice: null,
    computedAt: "2026-08-24T06:00Z"
  },
  {
    id: "null-join-draft",
    title: "Null-safe join draft",
    lifecycle: "draft",
    difficulty: "hard",
    primarySkill: "sql",
    bugTypes: ["logic"],
    bugCount: 1,
    mode: "practice",
    budgetMinutes: null,
    createdAt: "2026-07-30",
    publishedAt: "2026-08-01",
    /* Briefly live, then returned to draft — the guard refuses removal. */
    opened: 3,
    submitted: 1,
    fixed: 0,
    timed: null,
    practice: {
      starters: 1,
      accepted: 0,
      medianSolve: { minutes: null, label: "unavailable" },
      medianValidations: { value: 1, label: "measured" },
      hintReveals: 2,
      platformFailures: { count: 0, of: 1 }
    },
    computedAt: "2026-08-24T06:00Z"
  },
  {
    id: "shadowed-counter",
    title: "Shadowed Counter in Nested Loops",
    lifecycle: "archived",
    difficulty: "easy",
    primarySkill: "loops",
    bugTypes: ["typo", "logic"],
    bugCount: 1,
    mode: "practice",
    budgetMinutes: null,
    createdAt: "2026-05-11",
    publishedAt: "2026-05-12",
    /* Lived a quarter, then archived — terminal: the history below stays
       readable and no control restores the case. */
    opened: 188,
    submitted: 141,
    fixed: 92,
    timed: null,
    practice: {
      starters: 141,
      accepted: 92,
      medianSolve: { minutes: 12, label: "measured" },
      medianValidations: { value: 4, label: "measured" },
      hintReveals: 173,
      platformFailures: { count: 1, of: 141 }
    },
    computedAt: "2026-08-24T06:00Z"
  }
];

/* ── Derived reads ──────────────────────────────────────────────────────── */

/** Fix rate — fixed over submitted; null where there is no denominator. */
export function fixRate(row: Pick<DebugCaseRow, "submitted" | "fixed">): number | null {
  return row.submitted > 0 ? row.fixed / row.submitted : null;
}

/** A pristine draft is a draft nobody has met — the only thing the
 *  maintenance path may permanently remove (debug.F22). */
export function isPristineDraft(row: Pick<DebugCaseRow, "lifecycle" | "opened" | "submitted" | "fixed">): boolean {
  return row.lifecycle === "draft" && row.opened === 0 && row.submitted === 0 && row.fixed === 0;
}

/** Review order: worst fix rate first; a case never submitted to sorts below
 *  every case carrying a real rate, ordered among themselves by opens. */
export function reviewOrder(rows: DebugCaseRow[]): DebugCaseRow[] {
  const rated = rows.filter((r) => r.submitted > 0);
  const unrated = rows.filter((r) => r.submitted === 0);
  rated.sort((a, b) => (fixRate(a) ?? 0) - (fixRate(b) ?? 0));
  unrated.sort((a, b) => b.opened - a.opened);
  return [...rated, ...unrated];
}

/** The reasons a case needs review — derived from its own figures, never
 *  authored. A reason reads as a fact about counts, not a judgment. */
export function reviewReasons(row: DebugCaseRow, lowestRate: boolean): string[] {
  const reasons: string[] = [];
  const rate = fixRate(row);
  if (row.submitted === 0) {
    reasons.push(row.opened > 0 ? "Opened but never submitted to" : "Never opened");
  } else {
    if (lowestRate) reasons.push("The catalogue's lowest fix rate");
    if (rate !== null && rate < 0.5) reasons.push("Fix rate under half of submissions");
  }
  if (row.timed && row.budgetMinutes !== null && row.timed.medianSolve.minutes !== null) {
    if (row.timed.medianSolve.minutes > row.budgetMinutes) {
      reasons.push("Median timed period over the authored budget");
    }
  }
  if (row.practice && row.budgetMinutes !== null && row.practice.medianSolve.minutes !== null) {
    if (row.practice.medianSolve.minutes > row.budgetMinutes) {
      reasons.push("Median practice solve over the authored budget");
    }
  }
  if (row.timed && (row.timed.allowanceExhausted ?? 0) > 0) {
    reasons.push("Timed windows ended on the clock");
  }
  if (row.practice && (row.practice.platformFailures?.count ?? 0) > 0) {
    reasons.push("Platform failures recorded");
  }
  if (row.practice && row.practice.starters > 0 && (row.practice.hintReveals ?? 0) > row.practice.starters * 2) {
    reasons.push("Hint usage above two reveals per starter");
  }
  return reasons;
}

/** Format minutes plainly — "11 min"; null is an honest dash, never zero. */
export function fmtMinutes(minutes: number | null): string {
  return minutes === null ? "—" : `${minutes} min`;
}
