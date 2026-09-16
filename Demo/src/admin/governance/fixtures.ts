/**
 * fixtures — the governance pages' prepared data: the nine reset scopes and
 * their counted blast radii, the audit trail's older rows, legal holds, the
 * read-only deletion queue, boundary-event detail the store's list does not
 * carry, and the reporting area's prepared figures.
 *
 * Fixture state only; nothing here persists beyond the audit rows these pages
 * append to the demo store — every staff write commits with its record.
 */

import { getStore, patchStore } from "@state/store";

/* ── Figure names — configuration read by name, demo values standing in ───── */

export const PLATFORM_LIST_PAGE_ITEMS = 20;
export const PLATFORM_EXPORT_ROW_CAP = 500;
export const ANALYTICS_REVIEW_RESOLVED_WINDOW_DAYS = 30;
export const RETENTION_HOLD_REVIEW_DAYS = 90;
export const OPERATIONS_BOUNDARY_CHANGE_READABILITY_DAYS = 7;
export const BROADCAST_ICON_KEY = "NOTIFICATIONS_BROADCAST_DEFAULT_ICON";
/** The figure's own default for the broadcast icon. */
export const BROADCAST_ICON_DEFAULT = "megaphone";

/* ── The demo's clock — fixture instants are ages against this ────────────── */

export const DEMO_NOW = Date.parse("2026-08-24T12:00:00Z");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "24 Aug 2026 · 09:12" — the one instant shape these pages render. */
export function displayInstant(epochOrIso: number | string): string {
  const d = new Date(epochOrIso);
  if (Number.isNaN(d.getTime())) return String(epochOrIso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${hh}:${mm}`;
}

/** "24 Aug 2026" — a day, no clock. */
export function displayDay(epochOrIso: number | string): string {
  const d = new Date(epochOrIso);
  if (Number.isNaN(d.getTime())) return String(epochOrIso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Whole days between an epoch and the demo's now — never negative. */
export function daysOld(epoch: number): number {
  return Math.max(0, Math.floor((DEMO_NOW - epoch) / 86_400_000));
}

/* ── The one audit append — a staff write commits with its record ─────────── */

export function recordAudit(action: string) {
  const s = getStore();
  const row = {
    id: `au-${Date.now()}`,
    at: new Date().toISOString(),
    actor: s.session.name,
    action
  };
  patchStore({ adminAudit: [row, ...s.adminAudit] });
}

/* ── Progress reset — the nine independently selectable scopes ────────────── */

export interface ResetScope {
  id: string;
  /** The scope's own name, stated on the confirm and in the reset notice. */
  title: string;
  /** What the scope reaches — and what it never reaches. */
  covers: string;
}

export const RESET_SCOPES: ResetScope[] = [
  { id: "course-completion", title: "Course completion", covers: "Enrolment progress and lesson completion records." },
  { id: "challenge-track-progress", title: "Challenge and track progress", covers: "Challenge progress records and position inside tracks." },
  { id: "daily-completion-streak", title: "Daily completion and streak", covers: "Daily-challenge completions and the running streak." },
  { id: "debug-progress", title: "Timed Debug progress", covers: "Debug Detective attempts, timings and completion." },
  { id: "mock-tests", title: "Mock-type tests and the evidence derived from them", covers: "Sittings, results and the evidence derived from Mock papers." },
  { id: "company-tests", title: "Company-type tests, their readiness and the evidence derived from them", covers: "Company sittings, the readiness figure and derived evidence." },
  { id: "workspace-completion", title: "Workspace completion and checklist state — never files", covers: "Checklist and completion records; workspace files are never touched." },
  { id: "skill-evidence", title: "Skill evidence and the verdicts derived from it", covers: "The evidence rows; the verdicts recompute honestly from what remains." },
  { id: "preferences-continue", title: "Learning preferences and continue state — never identity or access", covers: "Preferences and the recorded resume target. Identity and access are outside this scope." }
];

/** What survives every scope — stated beside the picker, never implied. */
export const RESET_SURVIVORS: string[] = [
  "earned XP and level — a reset never revokes them",
  "the permanent solve facts and the reward identities that already paid, so a re-solve pays nothing",
  "the economy ledger",
  "certificates",
  "the learner's notes and files, which move only through their own workflows",
  "achievements — not one of the nine, never reset; undoing one is a compensating record in Economy"
];

/**
 * The blast radius — exact counts produced under the same authorization,
 * scopes and snapshot the reset itself will use, per person and per scope.
 * `null` is a count that could not be produced; it blocks the confirmation.
 */
export const BLAST_RADIUS: Record<string, Record<string, number | null>> = {
  "u-yash": {
    "course-completion": 4,
    "challenge-track-progress": 5,
    "daily-completion-streak": 23,
    "debug-progress": 3,
    "mock-tests": 2,
    "company-tests": 2,
    "workspace-completion": 2,
    "skill-evidence": 41,
    "preferences-continue": 3
  },
  "u-meera": {
    "course-completion": 1,
    "challenge-track-progress": 2,
    "daily-completion-streak": 6,
    "debug-progress": 0,
    "mock-tests": 0,
    "company-tests": 0,
    "workspace-completion": 1,
    "skill-evidence": 12,
    "preferences-continue": 2
  },
  "u-arun": {
    "course-completion": 0,
    "challenge-track-progress": 0,
    "daily-completion-streak": 0,
    "debug-progress": 0,
    "mock-tests": 0,
    "company-tests": 0,
    "workspace-completion": 0,
    /* The evidence rollup for this account cannot be read under this snapshot —
       the count is unproduced, and the confirmation stays blocked. */
    "skill-evidence": null,
    "preferences-continue": 1
  },
  "u-kira": {
    "course-completion": 2,
    "challenge-track-progress": 1,
    "daily-completion-streak": 4,
    "debug-progress": 1,
    "mock-tests": 1,
    "company-tests": 0,
    "workspace-completion": 0,
    "skill-evidence": 9,
    "preferences-continue": 2
  },
  "u-devan": {
    "course-completion": 1,
    "challenge-track-progress": 0,
    "daily-completion-streak": 0,
    "debug-progress": 0,
    "mock-tests": 0,
    "company-tests": 0,
    "workspace-completion": 1,
    "skill-evidence": 4,
    "preferences-continue": 1
  }
};

export function blastRadius(personId: string, scopeId: string): number | null {
  const row = BLAST_RADIUS[personId];
  if (!row) return null;
  return row[scopeId] ?? null;
}

/* ── The audit trail — older rows; this session's writes prepend live ─────── */

export interface AuditFixtureRow {
  id: string;
  /** Display instant, newest first. */
  at: string;
  /** Sort key — the fixture's own epoch. */
  epoch: number;
  actor: string;
  action: string;
  target: string;
  /** The captured reason, where one was taken. */
  reason: string | null;
}

const T = (iso: string) => Date.parse(iso);

export const AUDIT_ROWS: AuditFixtureRow[] = [
  { id: "au-f14", at: "18 Aug 2026 · 16:02", epoch: T("2026-08-18T16:02:00Z"), actor: "Meera", action: "Legal hold placed", target: "P-1055 · Devan", reason: "Documented legal request L-2026-011 — moderation records" },
  { id: "au-f13", at: "17 Aug 2026 · 11:26", epoch: T("2026-08-17T11:26:00Z"), actor: "Yash", action: "Export taken — content review, challenges", target: "Reporting", reason: null },
  { id: "au-f12", at: "16 Aug 2026 · 10:40", epoch: T("2026-08-16T10:40:00Z"), actor: "Yash", action: "Published Python Studio Hours v2", target: "Assessment paper oa-python-01", reason: null },
  { id: "au-f11", at: "15 Aug 2026 · 09:18", epoch: T("2026-08-15T09:18:00Z"), actor: "Meera", action: "Released legal hold LH-2026-003", target: "P-1051 · Kira", reason: "Basis expired — review date reached" },
  { id: "au-f10", at: "14 Aug 2026 · 18:55", epoch: T("2026-08-14T18:55:00Z"), actor: "Meera", action: "Submitted HTTP and API Design for staff review", target: "Course http-apis", reason: null },
  { id: "au-f09", at: "14 Aug 2026 · 12:03", epoch: T("2026-08-14T12:03:00Z"), actor: "System", action: "Identity event retried — verify answered", target: "Boundary event ie2", reason: null },
  { id: "au-f08", at: "13 Aug 2026 · 08:31", epoch: T("2026-08-13T08:31:00Z"), actor: "Yash", action: "Certificate cert-dsa-02 reissued", target: "P-1042 · Yash", reason: "Name correction approved — learner's own value" },
  { id: "au-f07", at: "12 Aug 2026 · 15:44", epoch: T("2026-08-12T15:44:00Z"), actor: "System", action: "Automated monthly credit allowance grant cycle completed", target: "All active memberships", reason: null },
  { id: "au-f06", at: "12 Aug 2026 · 09:02", epoch: T("2026-08-12T09:02:00Z"), actor: "Meera", action: "Maintenance window declared", target: "Batch execution, assessment grading", reason: "Planned storage migration" },
  { id: "au-f05", at: "11 Aug 2026 · 19:37", epoch: T("2026-08-11T19:37:00Z"), actor: "Yash", action: "Broadcast send confirmed to every eligible learner", target: "Broadcast b2", reason: null },
  { id: "au-f04", at: "10 Aug 2026 · 14:20", epoch: T("2026-08-10T14:20:00Z"), actor: "Yash", action: "Progress reset confirmed", target: "P-1044 · Arun", reason: "Support ticket SUP-2026-090 — learner asked for a clean start" },
  { id: "au-f03", at: "09 Aug 2026 · 13:11", epoch: T("2026-08-09T13:11:00Z"), actor: "Meera", action: "Report r3 → resolved", target: "Content report r3 · weather-dashboard", reason: "Verified CLI sandbox dependencies" },
  { id: "au-f02", at: "08 Aug 2026 · 10:29", epoch: T("2026-08-08T10:29:00Z"), actor: "System", action: "Erasure ER-2026-0039 completed — 16 of 16 steps", target: "P-1051 · Kira", reason: null },
  { id: "au-f01", at: "07 Aug 2026 · 08:14", epoch: T("2026-08-07T08:14:00Z"), actor: "Yash", action: "Home suggestion updated", target: "Foundations of Python", reason: "Continue the closures sequence" }
];

/* ── Data lifecycle — legal holds, listed per person newest first ─────────── */

export interface LegalHold {
  id: string;
  /** The person the hold names, with their directory reference. */
  person: string;
  personRef: string;
  /** The exact data the hold covers — never a general keep-everything switch. */
  covers: string;
  reason: string;
  /** The individual who authorized it — never a shared identity. */
  authorizedBy: string;
  began: string;
  beganEpoch: number;
  nextReview: string;
  ended: string | null;
}

export const LEGAL_HOLDS: LegalHold[] = [
  {
    id: "LH-2026-011",
    person: "Devan",
    personRef: "P-1055",
    covers: "Matching moderation records only",
    reason: "Documented legal request L-2026-011",
    authorizedBy: "Meera",
    began: "18 Aug 2026",
    beganEpoch: T("2026-08-18T00:00:00Z"),
    nextReview: "16 Nov 2026",
    ended: null
  },
  {
    id: "LH-2026-007",
    person: "Meera",
    personRef: "P-1048",
    covers: "Matching assessment records only",
    reason: "Documented legal request L-2026-007",
    authorizedBy: "Yash",
    began: "3 Aug 2026",
    beganEpoch: T("2026-08-03T00:00:00Z"),
    nextReview: "1 Nov 2026",
    ended: null
  },
  {
    id: "LH-2026-003",
    person: "Kira",
    personRef: "P-1051",
    covers: "Matching assessment records only",
    reason: "Documented legal request L-2026-003",
    authorizedBy: "Meera",
    began: "12 Jun 2026",
    beganEpoch: T("2026-06-12T00:00:00Z"),
    nextReview: "—",
    ended: "15 Aug 2026"
  }
];

/* ── The deletion queue — read-only visibility, not a gate ────────────────── */

export type DeletionStatus = "pending" | "running" | "held" | "failed" | "completed";

export interface DeletionRequest {
  id: string;
  person: string;
  personRef: string;
  status: DeletionStatus;
  /** Erasure is self-service; an administrator-initiated request is marked. */
  source: "learner" | "administrator";
  requested: string;
  requestedEpoch: number;
  /** Where one applies — the learner's own cancel window. */
  scheduledStart: string | null;
  updated: string;
  step: string;
  lastError: string | null;
}

export const DELETION_QUEUE: DeletionRequest[] = [
  {
    id: "ER-2026-0044",
    person: "Meera",
    personRef: "P-1048",
    status: "held",
    source: "learner",
    requested: "21 Aug 2026 · 22:04",
    requestedEpoch: T("2026-08-21T22:04:00Z"),
    scheduledStart: null,
    updated: "22 Aug 2026 · 06:10",
    step: "7 of 16 — parked by legal hold LH-2026-007",
    lastError: null
  },
  {
    id: "ER-2026-0043",
    person: "Devan",
    personRef: "P-1055",
    status: "failed",
    source: "administrator",
    requested: "20 Aug 2026 · 11:40",
    requestedEpoch: T("2026-08-20T11:40:00Z"),
    scheduledStart: null,
    updated: "23 Aug 2026 · 02:31",
    step: "11 of 16",
    lastError: "The object store refused the deletion batch — the constraint that stopped it, not a generic failure"
  },
  {
    id: "ER-2026-0042",
    person: "Kira",
    personRef: "P-1051",
    status: "pending",
    source: "learner",
    requested: "19 Aug 2026 · 09:15",
    requestedEpoch: T("2026-08-19T09:15:00Z"),
    scheduledStart: "28 Aug 2026 · 09:15",
    updated: "19 Aug 2026 · 09:15",
    step: "scheduled — inside the requester's own cancel window",
    lastError: null
  },
  {
    id: "ER-2026-0040",
    person: "Arun",
    personRef: "P-1044",
    status: "running",
    source: "administrator",
    requested: "17 Aug 2026 · 15:52",
    requestedEpoch: T("2026-08-17T15:52:00Z"),
    scheduledStart: null,
    updated: "24 Aug 2026 · 08:02",
    step: "4 of 16",
    lastError: null
  },
  {
    id: "ER-2026-0039",
    person: "Kira",
    personRef: "P-1051",
    status: "completed",
    source: "learner",
    requested: "2 Aug 2026 · 10:01",
    requestedEpoch: T("2026-08-02T10:01:00Z"),
    scheduledStart: null,
    updated: "8 Aug 2026 · 10:29",
    step: "16 of 16 — done",
    lastError: null
  }
];

/* ── Identity delivery — detail the store's boundary-event list omits ─────── */

export interface BoundaryDetail {
  /** When the main site's report arrived. */
  arrival: string;
  /** The instant the verify fell due. */
  due: string;
  /** Verify attempts so far. */
  tries: number;
  /** The last failure a waiting or failed row carries. */
  lastError: string;
}

export const IDENTITY_DETAIL: Record<string, BoundaryDetail> = {
  ie1: {
    arrival: "24 Aug 2026 · 09:12",
    due: "24 Aug 2026 · 09:12",
    tries: 3,
    lastError: "The main site did not answer the verify — timed out after 3 tries"
  },
  ie2: {
    arrival: "24 Aug 2026 · 07:40",
    due: "24 Aug 2026 · 07:41",
    tries: 1,
    lastError: ""
  }
};

/** The choices a super administrator may store over the figure default —
 *  keyline names only; the figure's own "megaphone" has no keyline glyph. */
export const BROADCAST_ICON_CHOICES = ["notifications", "message", "star", "sparkles", "info", "zap"] as const;

/* ── Reporting — prepared-in-advance figures, never scanned live ──────────── */

export type Bucket = "daily" | "weekly" | "monthly";

/** The closed set of eight activity kinds — an explicit zero, never a dropped row. */
export const ACTIVITY_KINDS = [
  "practice solves",
  "daily solves",
  "debug cases completed",
  "lessons completed",
  "quizzes submitted",
  "tests taken",
  "projects completed",
  "sandbox runs"
] as const;

export interface ParticipationBucket {
  /** When the figures were last recomputed — freshness rides every figure. */
  recomputed: string;
  distinctActive: number;
  firstTime: number;
  returning: number;
  /** Area and kind each total the bucket's activity exactly — the check. */
  byArea: [string, number][];
  byKind: [string, number][];
}

export const PARTICIPATION: Record<Bucket, ParticipationBucket> = {
  daily: {
    recomputed: "today · 06:00",
    distinctActive: 61,
    firstTime: 7,
    returning: 54,
    byArea: [
      ["Practice", 42],
      ["Daily challenges", 18],
      ["Debug Detective", 4],
      ["Courses", 40],
      ["Assessments", 6],
      ["Workspaces", 22]
    ],
    byKind: [
      ["practice solves", 42],
      ["daily solves", 18],
      ["debug cases completed", 4],
      ["lessons completed", 31],
      ["quizzes submitted", 9],
      ["tests taken", 6],
      ["projects completed", 0],
      ["sandbox runs", 22]
    ]
  },
  weekly: {
    recomputed: "yesterday's close",
    distinctActive: 214,
    firstTime: 26,
    returning: 188,
    byArea: [
      ["Practice", 180],
      ["Daily challenges", 72],
      ["Debug Detective", 15],
      ["Courses", 168],
      ["Assessments", 24],
      ["Workspaces", 99]
    ],
    byKind: [
      ["practice solves", 180],
      ["daily solves", 72],
      ["debug cases completed", 15],
      ["lessons completed", 128],
      ["quizzes submitted", 40],
      ["tests taken", 24],
      ["projects completed", 3],
      ["sandbox runs", 96]
    ]
  },
  monthly: {
    recomputed: "yesterday's close",
    distinctActive: 611,
    firstTime: 88,
    returning: 523,
    byArea: [
      ["Practice", 640],
      ["Daily challenges", 290],
      ["Debug Detective", 52],
      ["Courses", 620],
      ["Assessments", 80],
      ["Workspaces", 351]
    ],
    byKind: [
      ["practice solves", 640],
      ["daily solves", 290],
      ["debug cases completed", 52],
      ["lessons completed", 470],
      ["quizzes submitted", 150],
      ["tests taken", 80],
      ["projects completed", 11],
      ["sandbox runs", 340]
    ]
  }
};

/* ── The per-area content-review reports — one shape for all six ──────────── */

export type ReportState = "data" | "empty" | "unavailable" | "unauthored";

export interface ReviewRow {
  item: string;
  /** Unresolved learner reports — a count, never a quality claim. */
  unresolved: number;
  oldestAge: string;
  /** Advisory reasons from the closed vocabularies — learner-anonymous. */
  reasons: string[];
}

export interface ReviewArea {
  id: string;
  label: string;
  state: ReportState;
  recomputed: string;
  flagged: number;
  oldestUnresolved: string;
  resolvedInWindow: number;
  medianResolution: string;
  /** Ordered most-reported-unresolved first, then age — a stable tie-break. */
  rows: ReviewRow[];
}

export const REVIEW_AREAS: ReviewArea[] = [
  {
    id: "courses",
    label: "Courses",
    state: "data",
    recomputed: "yesterday's close",
    flagged: 9,
    oldestUnresolved: "9 days",
    resolvedInWindow: 4,
    medianResolution: "3 days",
    rows: [
      { item: "Foundations of Python", unresolved: 6, oldestAge: "9 days", reasons: [] },
      { item: "HTTP and API Design", unresolved: 3, oldestAge: "4 days", reasons: [] }
    ]
  },
  {
    id: "challenges",
    label: "Challenges",
    state: "data",
    recomputed: "yesterday's close",
    flagged: 14,
    oldestUnresolved: "12 days",
    resolvedInWindow: 7,
    medianResolution: "2 days",
    rows: [
      { item: "Balanced Brackets", unresolved: 8, oldestAge: "12 days", reasons: ["solve rate out of band", "many submissions per accept"] },
      { item: "Two Sum", unresolved: 4, oldestAge: "6 days", reasons: ["high hint usage"] },
      { item: "Grid Unique Paths", unresolved: 2, oldestAge: "2 days", reasons: ["missing or invalid classification"] }
    ]
  },
  {
    id: "daily-challenges",
    label: "Daily challenges",
    state: "data",
    recomputed: "yesterday's close",
    flagged: 3,
    oldestUnresolved: "3 days",
    resolvedInWindow: 5,
    medianResolution: "1 day",
    rows: [
      { item: "21 Aug pick", unresolved: 3, oldestAge: "3 days", reasons: ["probable case or reference failure"] }
    ]
  },
  {
    id: "debug-cases",
    label: "Debug cases",
    state: "empty",
    recomputed: "yesterday's close",
    flagged: 0,
    oldestUnresolved: "—",
    resolvedInWindow: 1,
    medianResolution: "—",
    rows: []
  },
  {
    id: "assessment-papers",
    label: "Assessment papers",
    state: "data",
    recomputed: "yesterday's close",
    flagged: 7,
    oldestUnresolved: "8 days",
    resolvedInWindow: 2,
    medianResolution: "4 days",
    rows: [
      { item: "DSA Comprehensive 90-Minute Paper", unresolved: 5, oldestAge: "8 days", reasons: ["unusually slow", "high partial credit"] },
      { item: "Google Algorithmic OA", unresolved: 2, oldestAge: "5 days", reasons: ["possible grading failure"] }
    ]
  },
  {
    id: "project-templates",
    label: "Project templates",
    state: "unavailable",
    recomputed: "—",
    flagged: 0,
    oldestUnresolved: "—",
    resolvedInWindow: 0,
    medianResolution: "—",
    rows: []
  }
];
