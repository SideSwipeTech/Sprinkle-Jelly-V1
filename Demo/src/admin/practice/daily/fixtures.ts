/**
 * Daily scheduling fixtures — the month of product dates behind the
 * scheduling calendar (`/admin/daily`) and the schedule-health window
 * (`/admin/daily/health`). Fixture state only; nothing here persists.
 *
 * The product clock's fixture today for this domain is 21 Aug 2026 — chosen,
 * not stated, so the domain's existing fixtures stay truthful: the practice
 * studio fleshes out 20–21 Aug as scheduled, and the store's registered gap
 * (`adminDailyGap`, "22 Aug 2026") then reads as the empty tomorrow the
 * schedule-health window leads with. The content consoles pin their own
 * `TODAY` at 24 Aug; this domain's fixtures cluster three days earlier.
 *
 * Vocabulary is the spec's: a date is scheduled, empty or blocked; a date
 * holding two published challenges is the blocked case — the duplicate-date
 * content-integrity fault (alert condition 16, decision 142). Selection is a
 * human act: nothing here rotates or auto-fills.
 */

import type { PracticeDifficulty } from "../../../extraction/components/PracticeEditorSpace/PracticeEditorSpace";
import type { ScheduleStatus } from "../../../extraction/components/SchedulingCard/SchedulingCard";
import type { Store } from "@state/store";

/* ── Figures + named actions ─────────────────────────────────────────────── */

/** The platform figures these screens read, by registered name — launch
 *  values from docs/product/DEFERRED.md. */
export const FIG = {
  DAILY_SCHEDULE_HEALTH_DAYS: 7,
  DAILY_BONUS_DEFAULT: 40,
  DAILY_BONUS_MIN: 0,
  DAILY_BONUS_MAX: 200
} as const;

/** Named privileged actions — `daily.void_date` verbatim (decision 103); the
 *  rest are chosen, not stated, and named once here. */
export const ACTION = {
  readSchedule: "daily.read_schedule",
  schedule: "daily.schedule",
  archive: "daily.archive",
  voidDate: "daily.void_date"
} as const;

/** The product clock's fixture today — see the header note. */
export const DAILY_TODAY = "2026-08-21";

/* ── The schedule record ─────────────────────────────────────────────────── */

export interface DailyOccupant {
  /** Challenge id — shared with `store.adminChallenges` where a row exists. */
  id: string;
  title: string;
  difficulty: PracticeDifficulty;
  /** The award resolved from difficulty — a display figure, never authored. */
  xp: number;
  /** The authored bonus — this domain's second authorable field. */
  bonus: number | null;
  /** Learner activity on the date refuses move and unschedule by name. */
  learnerActivity: boolean;
  /** The archive blast radius — null where it could not be counted, which
   *  leaves the confirmation unreachable rather than guessed. */
  submissions: number | null;
  solvers: number | null;
}

/** The date's classification — "blocked" in health vocabulary is the clash. */
export type DailyDateState = "scheduled" | "empty" | "clash";

export function stateOf(occupants: readonly DailyOccupant[]): DailyDateState {
  if (occupants.length >= 2) return "clash";
  return occupants.length === 1 ? "scheduled" : "empty";
}

/** The schedule-health classification — the closed set of three; unknown is a
 *  statement about the check and is never a fourth classification. */
export type HealthClass = "scheduled" | "empty" | "blocked";

export function healthClassOf(occupants: readonly DailyOccupant[]): HealthClass {
  if (occupants.length >= 2) return "blocked";
  return occupants.length === 1 ? "scheduled" : "empty";
}

/** The SchedulingCard status a target date reports inside the assign dialog:
 *  anything held is blocked to the incoming pick — the clash is named. */
export function cardStatusOf(occupants: readonly DailyOccupant[]): ScheduleStatus {
  return occupants.length === 0 ? "empty" : "blocked";
}

/* ── The month fixtures ──────────────────────────────────────────────────── */

function occ(
  id: string,
  title: string,
  difficulty: PracticeDifficulty,
  xp: number,
  extra: Partial<DailyOccupant> = {}
): DailyOccupant {
  return {
    id,
    title,
    difficulty,
    xp,
    bonus: null,
    learnerActivity: false,
    submissions: 0,
    solvers: 0,
    ...extra
  };
}

/**
 * The occupied dates. A date absent from this record carries nothing — an
 * empty product date is a neutral date, stated plainly, never an error.
 * Dates before DAILY_TODAY have begun: learner activity is real and move /
 * unschedule are refused by name; the past empty date (15 Aug) happened.
 */
const DAILY_MONTH: Record<string, DailyOccupant[]> = {
  "2026-08-03": [occ("merge-intervals", "Merge Overlapping Intervals", "medium", 40, { learnerActivity: true, submissions: 812, solvers: 441 })],
  "2026-08-06": [occ("binary-search", "Binary Search", "easy", 20, { learnerActivity: true, submissions: 1504, solvers: 1210 })],
  "2026-08-09": [occ("max-subarray", "Kadane's Maximum Subarray", "medium", 40, { learnerActivity: true, submissions: 977, solvers: 512 })],
  "2026-08-12": [occ("valid-parentheses", "Valid Parentheses", "easy", 20, { learnerActivity: true, submissions: 1730, solvers: 1402 })],
  "2026-08-14": [occ("lru-cache", "LRU Cache", "hard", 80, { learnerActivity: true, submissions: 655, solvers: 208, bonus: 40 })],
  "2026-08-17": [occ("climbing-stairs", "Climbing Stairs", "easy", 20, { learnerActivity: true, submissions: 1988, solvers: 1701 })],
  "2026-08-19": [occ("anagram-groups", "Group Anagrams", "medium", 40, { learnerActivity: true, submissions: 1104, solvers: 720 })],
  "2026-08-20": [occ("two-sum", "Two Sum", "easy", 20, { learnerActivity: true, submissions: 2207, solvers: 1930, bonus: 25 })],
  /* Today — begun on the product clock. The date's facts are locked; archive
     stays reachable, move and unschedule are refused by name. */
  "2026-08-21": [occ("balanced-brackets", "Balanced Brackets", "medium", 40, { learnerActivity: true, submissions: 1439, solvers: 986 })],
  /* The dates ahead — the health window reads 22–28 Aug. */
  "2026-08-24": [
    /* The duplicate-date fault: two published challenges hold one date.
       Learners see one deterministic winner; the repair keeps one published
       and returns the other to draft — no learner history deleted. */
    occ("unique-paths", "Grid Unique Paths", "hard", 80, { submissions: null, solvers: null }),
    occ("valid-bst", "Validate Binary Search Tree", "medium", 40, { submissions: null, solvers: null })
  ],
  "2026-08-25": [occ("koko-bananas", "Koko Eating Bananas", "medium", 40)],
  "2026-08-26": [occ("longest-substring", "Longest Substring Without Repeats", "medium", 40, { bonus: 40 })],
  "2026-08-28": [occ("trapping-rain", "Trapping Rain Water", "hard", 80)],
  "2026-08-30": [occ("course-schedule", "Course Schedule", "hard", 80)],
  /* September — next-month navigation is never a dead end. */
  "2026-09-01": [occ("serialize-tree", "Serialize a Binary Tree", "hard", 80)],
  "2026-09-03": [occ("word-ladder", "Word Ladder", "extreme", 120)],
  "2026-09-05": [occ("median-stream", "Median of a Stream", "extreme", 120)]
};

/** The schedule rows for a fixture run — a fresh copy every call so page
 *  state can mutate it freely. */
export function seedSchedule(): Record<string, DailyOccupant[]> {
  const copy: Record<string, DailyOccupant[]> = {};
  for (const [date, list] of Object.entries(DAILY_MONTH)) {
    copy[date] = list.map((o) => ({ ...o }));
  }
  return copy;
}

/** A clean health window — every one of the next seven product dates
 *  scheduled, so the healthy state renders rather than a blank. */
export function seedCleanWindow(): Record<string, DailyOccupant[]> {
  const rows = seedSchedule();
  const fill: Record<string, DailyOccupant> = {
    "2026-08-22": occ("koko-bananas", "Koko Eating Bananas", "medium", 40),
    "2026-08-23": occ("longest-substring", "Longest Substring Without Repeats", "medium", 40, { bonus: 40 }),
    "2026-08-24": occ("unique-paths", "Grid Unique Paths", "hard", 80),
    "2026-08-27": occ("number-islands", "Number of Islands", "medium", 40)
  };
  for (const [date, o] of Object.entries(fill)) rows[date] = [o];
  return rows;
}

export function occupantsOf(rows: Record<string, DailyOccupant[]>, date: string): DailyOccupant[] {
  return rows[date] ?? [];
}

/* ── The catalog — what an assign may pick ───────────────────────────────── */

export interface DailyCatalogEntry {
  id: string;
  title: string;
  difficulty: PracticeDifficulty;
  xp: number;
  /** Published always holds a date; a draft never does — assigning one is an
   *  act of publishing and the gate must pass first. Archived leaves the
   *  pick list. */
  lifecycle: "draft" | "published" | "archived";
  holdsDate: string | null;
  /** The pre-publish gate's verdict on a draft; a failing draft names what is
   *  missing rather than a generic validation message. Unused on published. */
  gateReady?: boolean;
  gateMissing?: string;
  /** Ever published — a pristine draft is never-published with no learner
   *  contact, and only a pristine unscheduled draft is hard-deletable. */
  everPublished: boolean;
  /** Learner-contact counts behind the archive blast radius — null where they
   *  could not be read, which leaves that confirmation unreachable rather
   *  than guessed and pristine unconfirmable. */
  submissions: number | null;
  solvers: number | null;
}

/** The only catalog rows a hard delete reaches: a pristine unscheduled draft —
 *  never published, no learner contact, holding no product date. Null counts
 *  leave pristine unconfirmable, so the delete control never renders there. */
export function isPristineCatalogDraft(entry: DailyCatalogEntry): boolean {
  return (
    entry.lifecycle === "draft" &&
    entry.holdsDate === null &&
    !entry.everPublished &&
    entry.submissions === 0 &&
    entry.solvers === 0
  );
}

/** Where a draft's contact counts could not be read, permanent delete stays
 *  unreachable — the row says so rather than failing later. */
export function countsUnread(entry: DailyCatalogEntry): boolean {
  return entry.submissions === null || entry.solvers === null;
}

export function seedCatalog(): DailyCatalogEntry[] {
  return [
    /* The drafts — none holds a product date. `top-k-frequent` and
       `fizzbuzz-extended` are pristine (never published, no learner contact),
       so Delete… reaches them; `lca-bst` was published once and unscheduled
       back, so only archive stands; `number-islands`' counts are unread, which
       keeps every destructive act unreachable. */
    { id: "top-k-frequent", title: "Top K Frequent Elements", difficulty: "medium", xp: 40, lifecycle: "draft", holdsDate: null, gateReady: true, everPublished: false, submissions: 0, solvers: 0 },
    { id: "fizzbuzz-extended", title: "FizzBuzz, Extended", difficulty: "easy", xp: 20, lifecycle: "draft", holdsDate: null, gateReady: true, everPublished: false, submissions: 0, solvers: 0 },
    { id: "lca-bst", title: "Lowest Common Ancestor of a BST", difficulty: "medium", xp: 40, lifecycle: "draft", holdsDate: null, gateReady: true, everPublished: true, submissions: 96, solvers: 51 },
    { id: "number-islands", title: "Number of Islands", difficulty: "medium", xp: 40, lifecycle: "draft", holdsDate: null, gateReady: true, everPublished: false, submissions: null, solvers: null },
    { id: "sudoku-solver", title: "Sudoku Solver", difficulty: "extreme", xp: 120, lifecycle: "draft", holdsDate: null, gateReady: false, gateMissing: "no hidden case and no reference solution", everPublished: false, submissions: 0, solvers: 0 },
    /* The scheduled — each holds a product date. The 24 Aug pair is the
       duplicate-date fault; their counts are unread, so archive stays
       unreachable until the clash is repaired. */
    { id: "unique-paths", title: "Grid Unique Paths", difficulty: "hard", xp: 80, lifecycle: "published", holdsDate: "2026-08-24", everPublished: true, submissions: null, solvers: null },
    { id: "valid-bst", title: "Validate Binary Search Tree", difficulty: "medium", xp: 40, lifecycle: "published", holdsDate: "2026-08-24", everPublished: true, submissions: null, solvers: null },
    { id: "koko-bananas", title: "Koko Eating Bananas", difficulty: "medium", xp: 40, lifecycle: "published", holdsDate: "2026-08-25", everPublished: true, submissions: 0, solvers: 0 },
    { id: "longest-substring", title: "Longest Substring Without Repeats", difficulty: "medium", xp: 40, lifecycle: "published", holdsDate: "2026-08-26", everPublished: true, submissions: 0, solvers: 0 },
    { id: "trapping-rain", title: "Trapping Rain Water", difficulty: "hard", xp: 80, lifecycle: "published", holdsDate: "2026-08-28", everPublished: true, submissions: 0, solvers: 0 },
    { id: "course-schedule", title: "Course Schedule", difficulty: "hard", xp: 80, lifecycle: "published", holdsDate: "2026-08-30", everPublished: true, submissions: 0, solvers: 0 },
    /* Archived stays seeded so the list's filter has real work — it never
       renders in the catalog list or the pick tray. */
    { id: "flatten-nested", title: "Flatten a Nested Array", difficulty: "medium", xp: 40, lifecycle: "archived", holdsDate: null, everPublished: true, submissions: 208, solvers: 97 }
  ];
}

/* ── Product-date math — pure UTC, no locale leakage ─────────────────────── */

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Shift an ISO product date by whole days — pure UTC math. */
export function addDays(date: string, delta: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

export interface MonthRef {
  year: number;
  month: number; // 1-based
}

export function monthOfDate(date: string): MonthRef {
  return { year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) };
}

export function shiftMonth(ref: MonthRef, delta: -1 | 1): MonthRef {
  let month = ref.month + delta;
  let year = ref.year;
  if (month < 1) { month = 12; year -= 1; }
  else if (month > 12) { month = 1; year += 1; }
  return { year, month };
}

export function daysInMonth(year: number, month: number): number {
  const d = new Date(0);
  d.setFullYear(year, month, 0);
  return d.getDate();
}

export function monthLabel(ref: MonthRef): string {
  const name = new Date(Date.UTC(ref.year, ref.month - 1, 1)).toLocaleString("en-GB", {
    month: "long",
    timeZone: "UTC"
  });
  return `${name} ${ref.year}`;
}

/** The month's cells, Monday-first — nulls pad the lead. */
export function monthCells(ref: MonthRef): (string | null)[] {
  const total = daysInMonth(ref.year, ref.month);
  const lead = (new Date(Date.UTC(ref.year, ref.month - 1, 1)).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(`${ref.year}-${pad2(ref.month)}-${pad2(d)}`);
  return cells;
}

export const DAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

/* ── Classification helpers over the fixture clock ───────────────────────── */

/** A begun date — today or past on the product clock — refuses move and
 *  unschedule by name, and nothing fills it now. */
export function isBegun(date: string): boolean {
  return date <= DAILY_TODAY;
}

/** The next DAILY_SCHEDULE_HEALTH_DAYS product dates — tomorrow first. */
export function healthDates(): string[] {
  return Array.from({ length: FIG.DAILY_SCHEDULE_HEALTH_DAYS }, (_, i) => addDays(DAILY_TODAY, i + 1));
}

/** An empty date inside the window, while there is still time, is the gap. */
export function inHealthWindow(date: string): boolean {
  return date > DAILY_TODAY && date <= addDays(DAILY_TODAY, FIG.DAILY_SCHEDULE_HEALTH_DAYS);
}

/** The store's registered gap date is a display string ("22 Aug 2026"). */
export function gapIso(store: Store): string | null {
  const d = new Date(store.adminDailyGap);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** "Sat 22 Aug 2026" — the date named on rows, never a bare ISO. */
export function formatProductDate(iso: string, weekday = false): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    ...(weekday ? { weekday: "short" } : {}),
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });
}

/** The nearest date inside the window that is not scheduled — the gap read
 *  the hub's `daily_challenge_schedule_gap` condition names. */
export function nearestRisk(rows: Record<string, DailyOccupant[]>): string | null {
  return healthDates().find((d) => healthClassOf(occupantsOf(rows, d)) !== "scheduled") ?? null;
}
