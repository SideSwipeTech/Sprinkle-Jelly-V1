/**
 * fixtures — the challenge index's stats, the track studio's tracks and the
 * content-review prepared data. Fixture state only; nothing here persists.
 *
 * Rows the demo store holds (`adminChallenges`, `adminTracks`) resolve over
 * these: the store owns id/title/lifecycle/revision for challenges and
 * id/title for tracks, the fixture owns the read-model extras — case counts,
 * unique-learner figures, reference reads and the audit trail. A challenge id
 * the store holds but no fixture fleshes out gets scaffold extras — an
 * untouched draft's honest zeroes.
 *
 * Vocabulary is the domain's own: case (never test), the three lifecycles,
 * track-owned versus reference entries, the six coding-practice review
 * reasons, and *Not enough data* under the review-rate minimum.
 */

import type { Store } from "@state/store";
import type {
  PracticeDifficulty,
  PracticeLifecycle
} from "../../../extraction/components/PracticeEditorSpace/PracticeEditorSpace";

/** Named privileged actions — chosen, not stated, named once here. */
export const ACTION = {
  editChallenge: "challenges.edit_challenge",
  editTrack: "challenges.edit_track",
  readReview: "challenges.read_content_review"
} as const;

/* The platform figures these screens read, each by its registered name —
   launch values from docs/product/DEFERRED.md. */
export const FIG = {
  PLATFORM_LIST_PAGE_ITEMS: 20,
  API_PAGE_LIMIT: 100,
  PLATFORM_EXPORT_ROW_CAP: 5000,
  ANALYTICS_REVIEW_RATE_MINIMUM: 20,
  ANALYTICS_REVIEW_WINDOW_DAYS: 90,
  ANALYTICS_REVIEW_CLEARING_CALCULATIONS: 2
} as const;

/** The fixture's computation instant — every derived figure states it. */
export const COMPUTED_AT = "2026-08-24T06:00:00Z";

export function fmtInstant(iso: string | null): string {
  if (!iso) return "—";
  return iso.slice(0, 16).replace("T", " ") + "Z";
}

/** A staff export is one comma-separated file, generated-at inside it and in
 *  the name; a truncated file names itself partial. */
export function exportCsv(filename: string, header: string, rows: string[], partial = false) {
  const body = `# generated-at ${new Date().toISOString()}\n${header}\n${rows.join("\n")}\n`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  a.download = `${filename}${partial ? "-partial" : ""}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── The language registry ────────────────────────────────────────────────── */

export interface LanguageRow {
  key: string;
  label: string;
  /** Both gates must hold for a track to lock the language or a challenge to offer it. */
  enabled: boolean;
  authoring: boolean;
}

/** The one runtime registry — read-only everywhere it renders (challenges.F26). */
export const LANGUAGE_REGISTRY: LanguageRow[] = [
  { key: "python", label: "Python 3", enabled: true, authoring: true },
  { key: "javascript", label: "JavaScript (ES6)", enabled: true, authoring: true },
  { key: "typescript", label: "TypeScript", enabled: true, authoring: true },
  { key: "java", label: "Java", enabled: true, authoring: true },
  { key: "cpp", label: "C++", enabled: true, authoring: true },
  { key: "sql", label: "SQL", enabled: true, authoring: true },
  { key: "go", label: "Go", enabled: false, authoring: false }
];

export function languageLabel(key: string): string {
  return LANGUAGE_REGISTRY.find((l) => l.key === key)?.label ?? key;
}

/* ── Challenges index — per-id read-model extras ──────────────────────────── */

export interface ChallengeExtras {
  difficulty: PracticeDifficulty | null;
  category: string | null;
  topics: string[];
  /** Registry keys of the offered language templates. */
  languages: string[];
  visibleCases: number;
  hiddenCases: number;
  /** Unique learners with any valid submission — the acceptance denominator. */
  attempted: number | null;
  /** Unique learners with an accepted submission — the numerator. */
  solved: number | null;
  /** The instant these figures were computed; null = never computed. */
  computedAt: string | null;
  /** Published tracks holding a live reference — blocks archive until removed. */
  referencedBy: { trackId: string; name: string; lifecycle: string }[];
  /** False where the reference count cannot be read — blocks the archive. */
  refsReadable: boolean;
  /** Ever published — a pristine draft is never-published with no activity. */
  everPublished: boolean;
  /** The last committed edit; null where the draft has never been touched
   *  outside creation — the column renders a dash, never a guessed instant. */
  updatedAt: string | null;
}

export interface ChallengeRow extends ChallengeExtras {
  id: string;
  title: string;
  lifecycle: PracticeLifecycle;
  revision: number;
}

const CHALLENGE_EXTRAS: Record<string, ChallengeExtras> = {
  "two-sum": {
    difficulty: "easy",
    category: "Algorithms",
    topics: ["arrays", "hashing"],
    languages: ["python", "javascript"],
    visibleCases: 2,
    hiddenCases: 1,
    attempted: 1204,
    solved: 831,
    computedAt: COMPUTED_AT,
    referencedBy: [{ trackId: "arrays", name: "Arrays & Hashing", lifecycle: "published" }],
    refsReadable: true,
    everPublished: true,
    updatedAt: "2026-08-21T15:40:00Z"
  },
  "balanced-brackets": {
    difficulty: "medium",
    category: "Algorithms",
    topics: ["stacks", "strings"],
    languages: ["python"],
    visibleCases: 1,
    hiddenCases: 1,
    attempted: 912,
    solved: 214,
    computedAt: COMPUTED_AT,
    referencedBy: [{ trackId: "arrays", name: "Arrays & Hashing", lifecycle: "published" }],
    refsReadable: true,
    everPublished: true,
    updatedAt: "2026-08-19T09:12:00Z"
  },
  "anagram-groups": {
    difficulty: "medium",
    category: "Algorithms",
    topics: ["strings", "hashing"],
    languages: ["python"],
    visibleCases: 1,
    hiddenCases: 0,
    attempted: 6,
    solved: 1,
    computedAt: COMPUTED_AT,
    referencedBy: [{ trackId: "arrays", name: "Arrays & Hashing", lifecycle: "published" }],
    refsReadable: true,
    everPublished: true,
    updatedAt: "2026-08-22T16:05:00Z"
  },
  "unique-paths": {
    difficulty: "medium",
    category: "Algorithms",
    topics: ["dynamic programming", "grids"],
    languages: ["python", "java"],
    visibleCases: 0,
    hiddenCases: 0,
    attempted: 0,
    solved: 0,
    computedAt: null,
    referencedBy: [],
    refsReadable: true,
    everPublished: false,
    updatedAt: "2026-08-22T16:20:00Z"
  },
  "valid-bst": {
    difficulty: "hard",
    category: "Data structures",
    topics: ["trees", "recursion"],
    languages: ["python", "javascript"],
    visibleCases: 3,
    hiddenCases: 2,
    attempted: 388,
    solved: 121,
    computedAt: COMPUTED_AT,
    referencedBy: [{ trackId: "graphs", name: "Graphs & Topological Sort", lifecycle: "published" }],
    refsReadable: true,
    everPublished: true,
    updatedAt: "2026-08-20T11:48:00Z"
  }
};

/** An id the fixture never fleshed out — a draft nothing has reached yet.
 *  Its zeroes are honest: no cases, no languages, no measured activity, and
 *  never published, so it reads pristine and deletable. */
function scaffoldExtras(): ChallengeExtras {
  return {
    difficulty: null,
    category: null,
    topics: [],
    languages: [],
    visibleCases: 0,
    hiddenCases: 0,
    attempted: 0,
    solved: 0,
    computedAt: null,
    referencedBy: [],
    refsReadable: true,
    everPublished: false,
    updatedAt: null
  };
}

export function challengeRows(store: Store): ChallengeRow[] {
  return store.adminChallenges.map((row) => ({
    ...scaffoldExtras(),
    ...(CHALLENGE_EXTRAS[row.id] ?? {}),
    id: row.id,
    title: row.title,
    lifecycle: row.lifecycle,
    revision: row.revision
  }));
}

/* ── The acceptance read ──────────────────────────────────────────────────── */

export type Acceptance =
  | { kind: "rate"; value: number }
  | { kind: "insufficient"; attempted: number }
  | { kind: "none" };

/** Unique accepted over unique valid-submission learners. Below the review
 *  minimum it is *Not enough data*; with no denominator it is a dash — never
 *  a percentage of zero. */
export function acceptanceOf(attempted: number | null, solved: number | null): Acceptance {
  if (attempted === null || attempted === 0) return { kind: "none" };
  if (attempted < FIG.ANALYTICS_REVIEW_RATE_MINIMUM) return { kind: "insufficient", attempted };
  return { kind: "rate", value: (solved ?? 0) / attempted };
}

export function acceptanceLabel(a: Acceptance): string {
  if (a.kind === "rate") return `${Math.round(a.value * 100)}%`;
  if (a.kind === "insufficient") return "Not enough data";
  return "—";
}

/** The only rows a hard delete reaches: pristine drafts — never published,
 *  no learner activity. */
export function isPristineDraft(row: ChallengeRow): boolean {
  return row.lifecycle === "draft" && !row.everPublished && (row.attempted ?? 0) === 0;
}

/** Live published-track references block the archive; an unreadable count
 *  blocks it too — the check never proceeds on an unknown. */
export function archiveBlock(row: ChallengeRow): { blocked: boolean; note: string } {
  if (!row.refsReadable) {
    return { blocked: true, note: "The reference count cannot be read — the archive is blocked rather than proceeding on an unknown." };
  }
  const live = row.referencedBy.filter((r) => r.lifecycle === "published");
  if (live.length > 0) {
    return {
      blocked: true,
      note: `Referenced by published ${live.length === 1 ? "track" : "tracks"} ${live.map((r) => r.name).join(", ")} — remove or replace the live references first, in one all-or-nothing operation.`
    };
  }
  return { blocked: false, note: "" };
}

/* ── The track studio ─────────────────────────────────────────────────────── */

export type TrackLifecycle = "draft" | "published" | "archived";

export interface AuditRow {
  id: string;
  at: string;
  actor: string;
  action: string;
}

export interface TrackEntry {
  entryId: string;
  /** authored = a track-owned challenge; reference = points at an underlying
   *  standalone challenge and carries nothing of its own. */
  kind: "authored" | "reference";
  /** authored: the track-owned challenge id. reference: the underlying id. */
  challengeId: string;
  title: string;
  difficulty: PracticeDifficulty;
  /** authored entries carry their own lifecycle; a reference has none — what a
   *  learner sees follows the underlying challenge and the track. */
  lifecycle: PracticeLifecycle | null;
  visibleCases: number;
  hiddenCases: number;
}

export interface TrackFixture {
  id: string;
  name: string;
  description: string;
  /** Exactly one language — chosen at creation, frozen once the track owns a
   *  challenge. */
  language: string;
  lifecycle: TrackLifecycle;
  entries: TrackEntry[];
  /** Every change the track has committed, newest first. */
  audit: AuditRow[];
}

const TRACK_SEED_AUDIT: AuditRow[] = [
  { id: "ta-01", at: "2026-08-18T10:04:00Z", actor: "Nandini R.", action: "Created the track" },
  { id: "ta-02", at: "2026-08-18T10:31:00Z", actor: "Nandini R.", action: "Added a reference to Two Sum" },
  { id: "ta-03", at: "2026-08-18T10:44:00Z", actor: "Nandini R.", action: "Added a reference to Balanced Brackets" },
  { id: "ta-04", at: "2026-08-19T09:12:00Z", actor: "Arjun D.", action: "Authored “Prefix Sums, Carefully” into the track" },
  { id: "ta-05", at: "2026-08-19T16:40:00Z", actor: "Arjun D.", action: "Reordered 4 entries" },
  { id: "ta-06", at: "2026-08-20T08:02:00Z", actor: "Nandini R.", action: "Published the track" }
];

export const TRACK_FIXTURES: TrackFixture[] = [
  {
    id: "arrays",
    name: "Arrays & Hashing",
    description: "The opening path — hashing patterns before window work.",
    language: "python",
    lifecycle: "published",
    entries: [
      { entryId: "e-arr-1", kind: "reference", challengeId: "two-sum", title: "Two Sum", difficulty: "easy", lifecycle: null, visibleCases: 2, hiddenCases: 1 },
      { entryId: "e-arr-2", kind: "reference", challengeId: "anagram-groups", title: "Group Anagrams", difficulty: "medium", lifecycle: null, visibleCases: 1, hiddenCases: 0 },
      { entryId: "e-arr-3", kind: "authored", challengeId: "trk-arrays-prefix-sums", title: "Prefix Sums, Carefully", difficulty: "medium", lifecycle: "published", visibleCases: 2, hiddenCases: 2 },
      { entryId: "e-arr-4", kind: "authored", challengeId: "trk-arrays-first-missing", title: "First Missing Positive", difficulty: "hard", lifecycle: "draft", visibleCases: 1, hiddenCases: 1 }
    ],
    audit: TRACK_SEED_AUDIT
  },
  {
    id: "graphs",
    name: "Graphs & Topological Sort",
    description: "Traversal orders, frontiers and dependency orderings.",
    language: "python",
    lifecycle: "published",
    entries: [
      { entryId: "e-gra-1", kind: "authored", challengeId: "trk-graphs-bfs", title: "BFS Frontier", difficulty: "medium", lifecycle: "published", visibleCases: 2, hiddenCases: 2 },
      { entryId: "e-gra-2", kind: "reference", challengeId: "valid-bst", title: "Validate Binary Search Tree", difficulty: "hard", lifecycle: null, visibleCases: 3, hiddenCases: 2 },
      { entryId: "e-gra-3", kind: "authored", challengeId: "trk-graphs-course-order", title: "Course Schedule Order", difficulty: "hard", lifecycle: "draft", visibleCases: 1, hiddenCases: 1 }
    ],
    audit: [
      { id: "tg-01", at: "2026-08-17T11:20:00Z", actor: "Nandini R.", action: "Created the track" },
      { id: "tg-02", at: "2026-08-17T11:42:00Z", actor: "Nandini R.", action: "Authored “BFS Frontier” into the track" },
      { id: "tg-03", at: "2026-08-18T14:05:00Z", actor: "Meera K.", action: "Added a reference to Validate Binary Search Tree" },
      { id: "tg-04", at: "2026-08-21T09:30:00Z", actor: "Meera K.", action: "Published the track" }
    ]
  },
  {
    id: "trk-sql",
    name: "SQL Query Craft",
    description: "Row policies, joins and windowed reads — a draft path.",
    language: "sql",
    lifecycle: "draft",
    entries: [],
    audit: [{ id: "ts-01", at: "2026-08-22T15:10:00Z", actor: "Arjun D.", action: "Created the track" }]
  }
];

export function newAuditRow(action: string, actor = "you"): AuditRow {
  return { id: `ta-${Date.now()}-${Math.round(Math.random() * 1e4)}`, at: new Date().toISOString(), actor, action };
}

let entrySeq = 0;
export function newEntryId(): string {
  entrySeq += 1;
  return `e-new-${Date.now()}-${entrySeq}`;
}

/* The track fixtures behind both studio pages. Page-local useState alone
   would split the index's creates from the detail's reads — a track authored
   at the index must resolve at its own address, so the fixture set lives
   here and both pages read and write it (fixture state only; nothing
   persists past the session). */
let trackStore: TrackFixture[] = TRACK_FIXTURES;

export function readTracks(): TrackFixture[] {
  return trackStore;
}

export function readTrack(id: string): TrackFixture | null {
  return trackStore.find((t) => t.id === id) ?? null;
}

export function writeTracks(next: TrackFixture[]) {
  trackStore = next;
}

/* ── Content review ───────────────────────────────────────────────────────── */

/** The coding-practice namespace — six members, closed (analytics 04-engine). */
export type ReviewReason =
  | "missing-or-invalid-classification"
  | "solve-rate-out-of-band"
  | "slow-against-target"
  | "high-hint-usage"
  | "many-submissions-per-accept"
  | "probable-case-or-reference-failure";

export const REVIEW_REASON_LABEL: Record<ReviewReason, string> = {
  "missing-or-invalid-classification": "missing or invalid classification",
  "solve-rate-out-of-band": "solve rate out of band",
  "slow-against-target": "slow against target",
  "high-hint-usage": "high hint usage",
  "many-submissions-per-accept": "many submissions per accept",
  "probable-case-or-reference-failure": "probable case or reference failure"
};

export const REVIEW_REASONS = Object.keys(REVIEW_REASON_LABEL) as ReviewReason[];

/** A raised reason states five facts: what it measured, its denominator, its
 *  threshold, its period, and when it was calculated. */
export interface RaisedReason {
  reason: ReviewReason;
  measured: string;
  denominator: string;
  threshold: string;
  period: string;
  calculatedAt: string;
}

export interface ReviewChallengeRow {
  /** Resolvable ids link into the studio; a fixture-only id renders unlinked. */
  id: string;
  title: string;
  lifecycle: PracticeLifecycle;
  attempted: number | null;
  solved: number | null;
  computedAt: string | null;
  reasons: RaisedReason[];
}

const REASON_PERIOD = `the rolling ${FIG.ANALYTICS_REVIEW_WINDOW_DAYS}-day window`;

export const REVIEW_CHALLENGES: ReviewChallengeRow[] = [
  {
    id: "balanced-brackets",
    title: "Balanced Brackets",
    lifecycle: "published",
    attempted: 912,
    solved: 214,
    computedAt: COMPUTED_AT,
    reasons: [
      {
        reason: "solve-rate-out-of-band",
        measured: "acceptance rate 23%",
        denominator: "912 unique learners with a valid submission",
        threshold: "outside the expected band for medium",
        period: REASON_PERIOD,
        calculatedAt: COMPUTED_AT
      },
      {
        reason: "many-submissions-per-accept",
        measured: "9.4 submissions per accepted solve",
        denominator: "214 accepted solves",
        threshold: "above 6 per accept",
        period: REASON_PERIOD,
        calculatedAt: COMPUTED_AT
      }
    ]
  },
  {
    id: "valid-bst",
    title: "Validate Binary Search Tree",
    lifecycle: "published",
    attempted: 388,
    solved: 121,
    computedAt: COMPUTED_AT,
    reasons: [
      {
        reason: "high-hint-usage",
        measured: "2.8 rungs revealed per attempter",
        denominator: "388 unique attempters",
        threshold: "above 2 rungs",
        period: REASON_PERIOD,
        calculatedAt: COMPUTED_AT
      }
    ]
  },
  {
    id: "two-sum",
    title: "Two Sum",
    lifecycle: "published",
    attempted: 1204,
    solved: 831,
    computedAt: COMPUTED_AT,
    reasons: []
  },
  {
    id: "anagram-groups",
    title: "Group Anagrams",
    lifecycle: "published",
    attempted: 6,
    solved: 1,
    computedAt: COMPUTED_AT,
    reasons: [
      {
        reason: "missing-or-invalid-classification",
        measured: "no primary skill on the current revision",
        denominator: "—",
        threshold: "raises at once, at no minimum",
        period: REASON_PERIOD,
        calculatedAt: COMPUTED_AT
      }
    ]
  },
  {
    id: "modulo-oddities",
    title: "Modulo Oddities",
    lifecycle: "published",
    attempted: 41,
    solved: 2,
    computedAt: COMPUTED_AT,
    reasons: [
      {
        reason: "probable-case-or-reference-failure",
        measured: "100% of valid submissions fail every hidden case",
        denominator: "41 unique learners with a valid submission",
        threshold: "uniform hidden-case failure",
        period: REASON_PERIOD,
        calculatedAt: COMPUTED_AT
      }
    ]
  },
  {
    id: "unique-paths",
    title: "Grid Unique Paths",
    lifecycle: "submitted",
    attempted: 0,
    solved: 0,
    computedAt: null,
    reasons: []
  },
  {
    id: "slow-sum-window",
    title: "Sliding Window Total",
    lifecycle: "published",
    attempted: 34,
    solved: 9,
    computedAt: COMPUTED_AT,
    reasons: [
      {
        reason: "slow-against-target",
        measured: "median solve 31 min",
        denominator: "9 accepted solves with a measured time",
        threshold: "above the authored 12-minute target",
        period: REASON_PERIOD,
        calculatedAt: COMPUTED_AT
      }
    ]
  }
];

export interface TrackRollup {
  trackId: string;
  name: string;
  language: string;
  /** Learners with a start record; null where the count could not be read. */
  started: number | null;
  /** Learners holding the durable completion fact. */
  completed: number | null;
  /** Where starters stopped — the last published entry each was on. */
  stoppedAt: { entryTitle: string; learners: number }[];
  computedAt: string | null;
}

export const REVIEW_TRACKS: TrackRollup[] = [
  {
    trackId: "arrays",
    name: "Arrays & Hashing",
    language: "python",
    started: 412,
    completed: 189,
    stoppedAt: [
      { entryTitle: "Group Anagrams", learners: 96 },
      { entryTitle: "Prefix Sums, Carefully", learners: 58 },
      { entryTitle: "First Missing Positive", learners: 41 }
    ],
    computedAt: COMPUTED_AT
  },
  {
    trackId: "graphs",
    name: "Graphs & Topological Sort",
    language: "python",
    started: 168,
    completed: 52,
    stoppedAt: [
      { entryTitle: "BFS Frontier", learners: 71 },
      { entryTitle: "Validate Binary Search Tree", learners: 30 }
    ],
    computedAt: COMPUTED_AT
  },
  {
    trackId: "trk-sql",
    name: "SQL Query Craft",
    language: "sql",
    started: 0,
    completed: 0,
    stoppedAt: [],
    computedAt: COMPUTED_AT
  }
];

/** Analytics that cannot be read are stated as unavailable — never rendered
 *  as nothing-needs-review. The preview chips flip this. */
export const REVIEW = {
  computedAt: COMPUTED_AT,
  challenges: REVIEW_CHALLENGES,
  tracks: REVIEW_TRACKS
};
