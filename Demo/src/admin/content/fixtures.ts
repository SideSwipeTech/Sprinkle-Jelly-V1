/**
 * fixtures — the content consoles' prepared data. Fixture state only; nothing
 * here persists across pages. Vocabulary is the domains' own: a report is a
 * learner content report; a request is a topic request; a broadcast is one
 * announcement; the taxonomy is the one shared vocabulary.
 *
 * Named privileged actions: verbatim where the documents state them
 * (`admin.move_review_item`, `publishing.set_home_suggestion`); the rest are
 * chosen, not stated, and named once here.
 */

export const ACTION = {
  decideApproval: "publishing.decide_approval", // chosen, not stated
  moveReviewItem: "admin.move_review_item", // verbatim — admin/05, decisions 72 and 144
  curateTaxonomy: "publishing.curate_taxonomy", // chosen, not stated
  editKnowledge: "companion.edit_kb_entry", // chosen, not stated
  publishKnowledge: "companion.publish_kb_entry", // chosen, not stated
  /* The spec names no delete for the knowledge base — authoring, publishing,
     unpublishing and synonym upkeep are the stated acts. This console removes
     drafts alone, behind a typed confirmation. Chosen, not stated. */
  deleteKnowledge: "companion.delete_kb_entry", // chosen, not stated
  reviewRequests: "requests.review_queue", // chosen, not stated
  readGaps: "admin.read_content_gaps", // chosen, not stated
  setHomeSuggestion: "publishing.set_home_suggestion", // verbatim — analytics/03-rules
  sendBroadcast: "notifications.send_broadcast", // chosen, not stated
  stopBroadcast: "notifications.stop_broadcast" // chosen, not stated
} as const;

/* The platform figures these screens read, each by its registered name —
   launch values from docs/product/DEFERRED.md. */
export const FIG = {
  PLATFORM_TITLE_CHARS: 120,
  PLATFORM_DESCRIPTION_CHARS: 2000,
  PLATFORM_LIST_PAGE_ITEMS: 20,
  PLATFORM_EXPORT_ROW_CAP: 5000,
  NOTIFICATIONS_BROADCAST_MESSAGE_CHARS: 4000,
  NOTIFICATIONS_BROADCAST_SECOND_CONFIRMATION_RECIPIENTS: 5000,
  NOTIFICATIONS_BROADCAST_DEFAULT_ICON: "megaphone",
  COMPANION_KB_MINIMUM_SCORE: 0.6,
  COMPANION_KB_MINIMUM_MARGIN: 0.15,
  COMPANION_KB_REVIEW_DUE_DAYS: 90,
  COMPANION_GAP_MINIMUM_OCCURRENCES: 5,
  COMPANION_GAP_WINDOW_DAYS: 90,
  PUBLISHING_TAXONOMY_CEILING: 2000,
  PUBLISHING_TAXONOMY_WARNING_THRESHOLD: 1800,
  PUBLISHING_ACTIVE_NAME_GUIDELINE: 200
} as const;

/** The product clock's fixture today — the demo's other fixtures cluster here. */
export const TODAY = "2026-08-24";

/* ── Publish approvals ────────────────────────────────────────────────────── */

/** One row of the change record: field, the published half, the submitted half. */
export interface ChangeHalf {
  field: string;
  published: string;
  submitted: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  kind: string;
  /** The studio the item was authored in, and its address. */
  studio: string;
  studioTo: string;
  submitter: string;
  submittedAt: string;
  revision: number;
  status: "pending" | "approved" | "rejected";
  /** Both halves of the change record. */
  changes: ChangeHalf[];
  /** What the publish would replace. */
  replaces: string;
  classification: { skill: string; topic: string; verdict: string };
  /** How far the change reaches — null where the reach cannot be read. */
  reach: string | null;
  /** A draft edited after submission conflicts against the revision the approver saw. */
  editedAfterSubmission?: boolean;
  decision?: { outcome: "approved" | "rejected"; by: string; at: string; note?: string };
}

export const APPROVALS: ApprovalItem[] = [
  {
    id: "ap-114",
    title: "Foundations of Python — revision 7",
    kind: "course",
    studio: "Courses studio",
    studioTo: "/admin/curriculum",
    submitter: "Priya S.",
    submittedAt: "2026-08-22T16:40:00Z",
    revision: 7,
    status: "pending",
    changes: [
      { field: "title", published: "Foundations of Python", submitted: "Foundations of Python" },
      { field: "description", published: "Twelve lessons, no prerequisites.", submitted: "Twelve lessons and a closing project, no prerequisites." },
      { field: "lessons", published: "12 lessons", submitted: "13 lessons — adds 'Working with files'" },
      { field: "estimated effort", published: "6 hours", submitted: "7 hours" }
    ],
    replaces: "The currently published revision 6 of Foundations of Python — learners enrolled keep their progress against the shared lesson identities.",
    classification: { skill: "Language foundations", topic: "Syntax", verdict: "every lesson classified against a live skill and topic" },
    reach: "The published catalogue entry, 214 active enrolments' reading experience, and the course-publish notice's eligible audience of 214.",
  },
  {
    id: "ap-115",
    title: "Balanced Brackets — revision 3",
    kind: "challenge",
    studio: "Challenge studio",
    studioTo: "/admin/challenges",
    submitter: "Arjun D.",
    submittedAt: "2026-08-23T09:12:00Z",
    revision: 3,
    status: "pending",
    changes: [
      { field: "prompt", published: "Check whether the brackets balance.", submitted: "Check whether the brackets balance — braces, brackets and parentheses, nested to any depth." },
      { field: "difficulty", published: "medium", submitted: "hard" },
      { field: "cases", published: "8 cases", submitted: "11 cases — three adversarial nested inputs added" }
    ],
    replaces: "The currently published revision 2 of Balanced Brackets; accepted solutions keep their acceptance against the prior case set.",
    classification: { skill: "Algorithms", topic: "Data structures", verdict: "classified" },
    /* The reach cannot be read on this fixture — the decision controls never
       become reachable, because the picture cannot be assembled. */
    reach: null
  },
  {
    id: "ap-116",
    title: "Knowledge-base entry — “How do Credits clear?”",
    kind: "knowledge-base entry",
    studio: "Knowledge Base studio",
    studioTo: "/admin/knowledge",
    submitter: "Meera K.",
    submittedAt: "2026-08-21T11:05:00Z",
    revision: 2,
    status: "pending",
    /* The draft moved after it was submitted — deciding it now would review a
       revision nobody saw, so it is refused as a conflict. */
    editedAfterSubmission: true,
    changes: [
      { field: "answer", published: "—", submitted: "Credits return to nothing at a cycle's end — clearing, never expiry." },
      { field: "synonyms", published: "—", submitted: "expire, reset, disappear" },
      { field: "rule it explains", published: "—", submitted: "economy.credits.clearing" }
    ],
    replaces: "Nothing — a new entry; nothing currently published is replaced.",
    classification: { skill: "Platform use", topic: "Credits", verdict: "classified" },
    reach: "The companion's answer set: this entry begins answering once published and reviewed."
  },
  {
    id: "ap-112",
    title: "Time and Space, Honestly — revision 4",
    kind: "course",
    studio: "Courses studio",
    studioTo: "/admin/curriculum",
    submitter: "Priya S.",
    submittedAt: "2026-08-19T10:30:00Z",
    revision: 4,
    status: "approved",
    changes: [
      { field: "title", published: "Time and Space", submitted: "Time and Space, Honestly" }
    ],
    replaces: "Revision 3 of the same course.",
    classification: { skill: "Algorithms", topic: "Complexity", verdict: "classified" },
    reach: "The published catalogue entry and 96 active enrolments.",
    decision: { outcome: "approved", by: "Nandini R.", at: "2026-08-19T15:02:00Z" }
  }
];

/* ── The review queue ─────────────────────────────────────────────────────── */

export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";
export type ReportReason = "spam" | "incorrect" | "inappropriate" | "other";
export type ResolutionKind = "corrected" | "no-action" | "escalated" | "duplicate";

export const REPORT_STATUSES: ReportStatus[] = ["open", "investigating", "resolved", "dismissed"];
export const RESOLUTION_KINDS: ResolutionKind[] = ["corrected", "no-action", "escalated", "duplicate"];

/** The one controlled graph — a move it does not list is never offered. */
export const REVIEW_GRAPH: Record<ReportStatus, ReportStatus[]> = {
  open: ["investigating", "resolved", "dismissed"],
  investigating: ["open", "resolved", "dismissed"],
  resolved: ["open"],
  dismissed: ["open"]
};

export interface ContentReport {
  id: string;
  filedAt: string;
  /** The product area the reported content belongs to. */
  area: "courses" | "challenges" | "daily" | "debug" | "templates";
  /** The frozen reference — what the reporter saw, named as it was filed. */
  target: string;
  /** The current editor's address — null where the content is gone. */
  editorTo: string | null;
  /** Where the content moved on since the report, the row says so. */
  movedOn?: boolean;
  reason: ReportReason;
  /** The reporter's optional note. */
  note: string | null;
  status: ReportStatus;
  triageNote?: string;
  /** Stored closer and closing time; a reopen clears both. */
  closer?: { by: string; at: string; kind?: ResolutionKind; reason?: string; reference?: string };
}

export const REPORTS: ContentReport[] = [
  {
    id: "rep-341", filedAt: "2026-08-14T07:22:00Z", area: "challenges",
    target: "Balanced Brackets", editorTo: "/admin/challenges", movedOn: true,
    reason: "incorrect", note: "The third visible case contradicts the prompt's brace rule.",
    status: "open"
  },
  {
    id: "rep-338", filedAt: "2026-08-13T18:01:00Z", area: "courses",
    target: "Foundations of Python · lesson 9", editorTo: "/admin/curriculum",
    reason: "incorrect", note: null,
    status: "open"
  },
  {
    id: "rep-330", filedAt: "2026-08-11T12:44:00Z", area: "debug",
    target: "The Off-by-One Window", editorTo: "/admin/debug",
    reason: "inappropriate", note: "The case narrative reads like a job posting.",
    status: "investigating", triageNote: "Reading the case narrative against the tone guide."
  },
  {
    id: "rep-317", filedAt: "2026-08-08T09:15:00Z", area: "challenges",
    target: "Two-Sum Variants", editorTo: "/admin/challenges",
    reason: "spam", note: null,
    status: "resolved",
    closer: { by: "Nandini R.", at: "2026-08-10T13:00:00Z", kind: "no-action" }
  },
  {
    id: "rep-312", filedAt: "2026-08-06T15:37:00Z", area: "courses",
    target: "Legacy arithmetic drill", editorTo: null,
    reason: "other", note: "Retired content still shows in search.",
    status: "dismissed",
    closer: { by: "Meera K.", at: "2026-08-07T10:20:00Z", reason: "The item was already retired; the search index has since caught up." }
  },
  {
    id: "rep-309", filedAt: "2026-08-05T08:02:00Z", area: "templates",
    target: "CLI starter template", editorTo: "/admin/templates",
    reason: "incorrect", note: "Step 4 names a file the template does not create.",
    status: "investigating", triageNote: "Reproduced — the file is created one step later."
  }
];

/* ── The taxonomy ─────────────────────────────────────────────────────────── */

export type TaxState = "active" | "archived" | "merged";

export interface TaxNode {
  id: string;
  label: string;
  kind: "skill" | "topic";
  /** Topics carry their skill; skills carry none. */
  parentId: string | null;
  state: TaxState;
  /** Where a merged node's name went. */
  mergedInto?: string;
  /** What a retire or merge moves, broken out by domain — never one large number. */
  blast: { domain: string; count: number; items: string[] }[];
  /** Null where the blast-radius count cannot be read — the confirm stays unreachable. */
  blastReadable?: boolean;
}

export const TAXONOMY: TaxNode[] = [
  {
    id: "sk-algo", label: "Algorithms", kind: "skill", parentId: null, state: "active",
    blast: [{ domain: "challenges", count: 41, items: ["Balanced Brackets", "Two-Sum Variants", "Longest Run"] },
            { domain: "courses", count: 6, items: ["Time and Space, Honestly"] }]
  },
  { id: "tp-complexity", label: "Complexity", kind: "topic", parentId: "sk-algo", state: "active",
    blast: [{ domain: "challenges", count: 12, items: ["Longest Run"] }] },
  { id: "tp-ds", label: "Data structures", kind: "topic", parentId: "sk-algo", state: "active",
    blast: [{ domain: "challenges", count: 29, items: ["Balanced Brackets", "Two-Sum Variants"] }] },
  {
    id: "sk-lang", label: "Language foundations", kind: "skill", parentId: null, state: "active",
    blast: [{ domain: "courses", count: 9, items: ["Foundations of Python"] },
            { domain: "daily", count: 14, items: [] }]
  },
  { id: "tp-syntax", label: "Syntax", kind: "topic", parentId: "sk-lang", state: "active",
    blast: [{ domain: "courses", count: 9, items: ["Foundations of Python"] }] },
  { id: "tp-idioms", label: "Idioms", kind: "topic", parentId: "sk-lang", state: "active",
    blast: [{ domain: "courses", count: 3, items: ["Python Studio: Closures & Scopes"] }] },
  {
    id: "sk-math", label: "Mathematics", kind: "skill", parentId: null, state: "active",
    blast: [{ domain: "assessments", count: 7, items: ["Algebra II readiness"] }]
  },
  { id: "tp-prob", label: "Probability", kind: "topic", parentId: "sk-math", state: "active",
    blast: [{ domain: "assessments", count: 4, items: [] }] },
  {
    id: "sk-web", label: "Web interfaces", kind: "skill", parentId: null, state: "active",
    /* The count behind this node cannot be read — a retire or merge against it
       previews the unknown and keeps its confirm unreachable. */
    blastReadable: false,
    blast: []
  },
  { id: "tp-dom", label: "The DOM", kind: "topic", parentId: "sk-web", state: "active",
    blast: [{ domain: "challenges", count: 5, items: ["Drag and Drop Board"] }] },
  {
    id: "sk-legacy", label: "Legacy arithmetic", kind: "skill", parentId: null, state: "archived",
    blast: [{ domain: "challenges", count: 0, items: [] }]
  },
  {
    id: "sk-tables", label: "Lookup tables", kind: "skill", parentId: null, state: "merged", mergedInto: "Data structures",
    blast: [{ domain: "challenges", count: 3, items: ["Hash Warmup"] }]
  }
];

/** Lifetime-combined: active, archived and merged-source nodes together. */
export const TAXONOMY_TOTALS = {
  persistent: TAXONOMY.length,
  active: TAXONOMY.filter((n) => n.state === "active").length,
  archived: TAXONOMY.filter((n) => n.state === "archived").length,
  merged: TAXONOMY.filter((n) => n.state === "merged").length
};

/** The four-value difficulty scale — a read-only card, never edited here. */
export const DIFFICULTY_SCALE = ["easy", "medium", "hard", "extreme"] as const;

/** The language registry — whatever it holds, rendered; never edited in a studio. */
export interface LanguageRow {
  key: string;
  label: string;
  on: boolean;
  /** Where a language is turned off: what can neither publish nor start. */
  offNote?: string;
}
export const LANGUAGE_REGISTRY: LanguageRow[] = [
  { key: "python", label: "Python", on: true },
  { key: "javascript", label: "JavaScript", on: true },
  { key: "typescript", label: "TypeScript", on: true },
  { key: "java", label: "Java", on: true },
  { key: "cpp", label: "C++", on: true },
  {
    key: "go", label: "Go", on: false,
    offNote: "Turned off: new Go content can neither publish nor start; already-recorded work keeps its Go label."
  }
];

/* ── The knowledge base ───────────────────────────────────────────────────── */

export type KbLifecycle = "draft" | "published" | "archived";

export interface KbEntry {
  id: string;
  /** The question, in the words a learner would use. */
  question: string;
  /** The answer — authored public content. */
  answer: string;
  /** The words learners use — the only tuning lexical matching offers. */
  synonyms: string[];
  /** Classified against the one shared vocabulary. */
  tags: string[];
  /** The rule the entry explains — required; an entry citing none is uncheckable. */
  rule: string;
  lifecycle: KbLifecycle;
  /** Stamps that a person looked; a never-reviewed entry sorts as the stalest. */
  lastReviewed: string | null;
  author: string;
  changedAt: string;
  /** An entry that cannot be read — a third fact beside unpublished and not authored. */
  readable?: boolean;
}

export const KB_ENTRIES: KbEntry[] = [
  {
    id: "kb-credits-clear",
    question: "How do Credits clear?",
    answer: "Credits return to nothing at a cycle's end — the platform calls it clearing, never expiry. Nothing carries over.",
    synonyms: ["expire", "reset", "disappear"],
    tags: ["Credits"],
    rule: "economy.credits.clearing",
    lifecycle: "published",
    lastReviewed: "2026-04-30",
    author: "Meera K.",
    changedAt: "2026-08-21T11:05:00Z"
  },
  {
    id: "kb-streak",
    question: "What breaks my streak?",
    answer: "Only a product day with no accepted daily-challenge solve breaks the streak. Practice and lessons do not count either way.",
    synonyms: ["freeze", "lose", "keep alive"],
    tags: ["Streaks", "Daily Challenges"],
    rule: "daily.streak.counting",
    lifecycle: "published",
    lastReviewed: "2026-07-18",
    author: "Priya S.",
    changedAt: "2026-07-18T09:00:00Z"
  },
  {
    id: "kb-mock-company",
    question: "What is the difference between a Mock and a Company test?",
    answer: "A Mock is a practice paper under the platform's own clock; a Company test is an employer's paper with its own provenance. Both are tests — measured, sealed, timed.",
    synonyms: ["placement test", "interview prep", "employer paper"],
    tags: ["Assessment"],
    rule: "assessments.paper.types",
    lifecycle: "published",
    /* Never reviewed — sorts as the stalest. */
    lastReviewed: null,
    author: "Arjun D.",
    changedAt: "2026-06-02T14:20:00Z"
  },
  {
    id: "kb-hidden-cases",
    question: "Why can't I see the failing case?",
    answer: "Hidden cases stay hidden so a solution has to be general, not fitted to the shown inputs. The visible cases and the prompt are the whole contract.",
    synonyms: ["secret test", "locked input", "edge case"],
    tags: ["Challenges"],
    /* No rule cited — publishing is refused, naming what is missing. */
    rule: "",
    lifecycle: "draft",
    lastReviewed: null,
    author: "Priya S.",
    changedAt: "2026-08-20T16:44:00Z"
  },
  {
    id: "kb-unreadable",
    question: "An entry that cannot be read",
    answer: "",
    synonyms: [],
    tags: [],
    rule: "",
    lifecycle: "draft",
    lastReviewed: null,
    author: "—",
    changedAt: "",
    readable: false
  }
];

/** The answering gate — shown in the studio, edited nowhere in it. */
export const KB_GATE = {
  score: FIG.COMPANION_KB_MINIMUM_SCORE,
  margin: FIG.COMPANION_KB_MINIMUM_MARGIN,
  version: "v9",
  effect:
    "Lowering the minimum score by one step of 0.01 would have answered 3 of the last 90 days' no-matches; raising the margin by the same step would have withheld 6 answers that were given."
};

/* ── Topic requests ───────────────────────────────────────────────────────── */

export type RequestStatus = "pending" | "approved" | "implemented" | "rejected" | "archived";

export const REQUEST_STATUSES: RequestStatus[] = ["pending", "approved", "implemented", "rejected", "archived"];

/** The permitted status graph — eight declared moves and no ninth. Staff never
 *  set archived; the learner alone takes an ask back, and only from pending. */
export const REQUEST_GRAPH: Record<RequestStatus, { to: RequestStatus; reason: boolean }[]> = {
  pending: [{ to: "approved", reason: false }, { to: "rejected", reason: false }],
  approved: [
    { to: "implemented", reason: false },
    { to: "rejected", reason: false },
    { to: "pending", reason: true }
  ],
  implemented: [{ to: "approved", reason: true }],
  rejected: [{ to: "pending", reason: true }],
  archived: []
};

export interface TopicRequest {
  id: string;
  title: string;
  description: string;
  /** The source area's own label. */
  area: "Courses" | "Challenges" | "Daily Challenges" | "Debug Detective" | "project templates";
  targetType: string;
  /** The readable label the origin context derives — "Challenges › Python › Arrays". */
  contextLabel: string;
  status: RequestStatus;
  filedAt: string;
  /** The one team note — staff-only, reaches the learner nowhere. */
  teamNote: { text: string; by: string; at: string } | null;
  /** The implementation reference — evidence a learner could actually open. */
  reference: { label: string; to: string } | null;
  reviewStamp: { by: string; at: string } | null;
}

export const REQUESTS: TopicRequest[] = [
  {
    id: "req-771", title: "A course on system design basics",
    description: "Something between the language courses and real architecture work — queues, caching, how a request travels.",
    area: "Courses", targetType: "course", contextLabel: "Courses › Catalogue",
    status: "pending", filedAt: "2026-08-23T19:20:00Z",
    teamNote: { text: "Third ask in this bucket this month — worth a planning slot.", by: "Nandini R.", at: "2026-08-24T08:10:00Z" },
    reference: null, reviewStamp: null
  },
  {
    id: "req-770", title: "Graph traversal challenges",
    description: "BFS and DFS practice beyond the one traversal challenge that exists. The description field carries the detail — which is why search reads it too.",
    area: "Challenges", targetType: "challenge", contextLabel: "Challenges › Algorithms › Graphs",
    status: "approved", filedAt: "2026-08-22T11:02:00Z",
    teamNote: null, reviewStamp: { by: "Nandini R.", at: "2026-08-23T09:00:00Z" },
    reference: null
  },
  {
    id: "req-768", title: "A debugging case on race conditions",
    description: "The existing cases are all single-threaded. A race that only shows under interleaving would teach real debugging.",
    area: "Debug Detective", targetType: "case", contextLabel: "Debug Detective › Board",
    status: "approved", filedAt: "2026-08-21T14:37:00Z",
    teamNote: { text: "Needs a two-process harness — flagged for the studio.", by: "Meera K.", at: "2026-08-22T10:00:00Z" },
    reference: null, reviewStamp: { by: "Meera K.", at: "2026-08-22T10:00:00Z" }
  },
  {
    id: "req-766", title: "Python decorators, slowly",
    description: "The closures lesson jumps too fast. A daily challenge track on decorators would build it gradually.",
    area: "Daily Challenges", targetType: "topic for a future daily challenge", contextLabel: "Daily Challenges › Overview",
    status: "implemented", filedAt: "2026-08-18T08:55:00Z",
    teamNote: null, reviewStamp: { by: "Nandini R.", at: "2026-08-20T12:00:00Z" },
    reference: { label: "Daily challenge — Decorators I, 2026-08-21", to: "/admin/daily" }
  },
  {
    id: "req-764", title: "SQL joins practice",
    description: "Nothing on the platform touches databases. A joins challenge set would help.",
    area: "Challenges", targetType: "topic", contextLabel: "Challenges › Catalogue",
    status: "rejected", filedAt: "2026-08-15T17:28:00Z",
    teamNote: { text: "Outside the current catalogue scope — kept as demand.", by: "Nandini R.", at: "2026-08-16T09:30:00Z" },
    reference: null, reviewStamp: { by: "Nandini R.", at: "2026-08-16T09:30:00Z" }
  },
  {
    id: "req-761", title: "A starter template for a REST API",
    description: "The templates list has CLI and UI starters but nothing that serves HTTP.",
    area: "project templates", targetType: "template", contextLabel: "Workspace › Templates",
    status: "pending", filedAt: "2026-08-12T13:40:00Z",
    teamNote: null, reference: null, reviewStamp: null
  },
  {
    id: "req-755", title: "Regex challenges",
    description: "Asked for twice in the same week — matching and groups at least.",
    area: "Challenges", targetType: "track", contextLabel: "Challenges › Tracks",
    status: "archived", filedAt: "2026-08-09T10:12:00Z",
    teamNote: null, reference: null, reviewStamp: null
  }
];

/* Enough rows to page for real at PLATFORM_LIST_PAGE_ITEMS — generated asks
   stay literal-searchable over title and description. */
const REQUEST_FILL: { title: string; area: TopicRequest["area"]; targetType: string; context: string }[] = [
  { title: "TypeScript generics course", area: "Courses", targetType: "course", context: "Courses › TypeScript" },
  { title: "Binary search variations", area: "Challenges", targetType: "challenge", context: "Challenges › Algorithms › Searching" },
  { title: "A case on silent data corruption", area: "Debug Detective", targetType: "case", context: "Debug Detective › Board" },
  { title: "Dynamic programming track", area: "Challenges", targetType: "track", context: "Challenges › Tracks" },
  { title: "Pointers in C++", area: "Daily Challenges", targetType: "topic for a future daily challenge", context: "Daily Challenges › Overview" },
  { title: "Docker project template", area: "project templates", targetType: "template", context: "Workspace › Templates" },
  { title: "A lesson on database indexes", area: "Courses", targetType: "lesson", context: "Courses › Databases" },
  { title: "More bitmask challenges", area: "Challenges", targetType: "challenge", context: "Challenges › Algorithms › Bit tricks" },
  { title: "Heaps and priority queues", area: "Challenges", targetType: "topic", context: "Challenges › Catalogue" },
  { title: "A debugging case on timezone math", area: "Debug Detective", targetType: "case", context: "Debug Detective › Board" },
  { title: "Linked lists from scratch", area: "Courses", targetType: "subject", context: "Courses › Computer science" },
  { title: "A template for a Chrome extension", area: "project templates", targetType: "topic", context: "Workspace › Templates" },
  { title: "Greedy algorithm drills", area: "Challenges", targetType: "challenge", context: "Challenges › Algorithms › Greedy" },
  { title: "Git workflows, taught properly", area: "Courses", targetType: "topic", context: "Courses › Tools" },
  { title: "A case on an off-by-one in pagination", area: "Debug Detective", targetType: "case", context: "Debug Detective › Board" },
  { title: "Two-pointer daily set", area: "Daily Challenges", targetType: "topic for a future daily challenge", context: "Daily Challenges › Overview" },
  { title: "Operating-systems fundamentals", area: "Courses", targetType: "course", context: "Courses › Computer science" },
  { title: "Sliding window challenges", area: "Challenges", targetType: "challenge", context: "Challenges › Algorithms › Arrays" },
  { title: "A template for a Discord bot", area: "project templates", targetType: "template", context: "Workspace › Templates" }
];

export const ALL_REQUESTS: TopicRequest[] = [
  ...REQUESTS,
  ...REQUEST_FILL.map((f, i) => ({
    id: `req-7${40 - i}`,
    title: f.title,
    description: `Filed from ${f.context}. The description carries the detail the title could not.`,
    area: f.area,
    targetType: f.targetType,
    contextLabel: f.context,
    status: "pending" as RequestStatus,
    filedAt: `2026-08-${String(1 + (i % 9)).padStart(2, "0")}T${String(8 + (i % 10)).padStart(2, "0")}:00:00Z`,
    teamNote: null,
    reference: null,
    reviewStamp: null
  }))
].sort((a, b) => (a.filedAt < b.filedAt ? 1 : -1)); // newest first, always

/* ── Content Gaps — two panels, two sources ───────────────────────────────── */

/** The four rollup windows and no fifth — 90 days is the default. */
export const GAP_WINDOWS = ["30 days", "90 days", "365 days", "all time"] as const;
export type GapWindow = (typeof GAP_WINDOWS)[number];

export interface DemandRollupRow {
  /** The label the demand key's context supplies — grouping is by stable
   *  demand key, never by the words displayed. */
  context: string;
  total: number;
  stillOpen: number;
  byStatus: { pending: number; approved: number; implemented: number; rejected: number };
}

export interface AskedForPanel {
  available: boolean;
  generatedAt: string;
  rows: DemandRollupRow[];
}

/** "Asked for" — produced by the requests rollup, a live aggregate. */
export const ASKED_FOR: Record<GapWindow, AskedForPanel> = {
  "30 days": {
    available: true, generatedAt: "2026-08-24T06:00:00Z",
    rows: [
      { context: "Courses › System design", total: 4, stillOpen: 3, byStatus: { pending: 2, approved: 1, implemented: 1, rejected: 0 } },
      { context: "Challenges › Algorithms › Graphs", total: 3, stillOpen: 2, byStatus: { pending: 1, approved: 1, implemented: 1, rejected: 0 } },
      { context: "Debug Detective › Board", total: 2, stillOpen: 2, byStatus: { pending: 1, approved: 1, implemented: 0, rejected: 0 } }
    ]
  },
  "90 days": {
    available: true, generatedAt: "2026-08-24T06:00:00Z",
    rows: [
      { context: "Courses › System design", total: 9, stillOpen: 5, byStatus: { pending: 3, approved: 2, implemented: 3, rejected: 1 } },
      { context: "Challenges › Algorithms › Graphs", total: 7, stillOpen: 4, byStatus: { pending: 2, approved: 2, implemented: 2, rejected: 1 } },
      { context: "project templates › Starters", total: 5, stillOpen: 4, byStatus: { pending: 3, approved: 1, implemented: 1, rejected: 0 } },
      { context: "Debug Detective › Board", total: 4, stillOpen: 3, byStatus: { pending: 2, approved: 1, implemented: 0, rejected: 1 } },
      { context: "Daily Challenges › Overview", total: 3, stillOpen: 2, byStatus: { pending: 1, approved: 1, implemented: 1, rejected: 0 } },
      /* An area whose asks were all rejected still shows — demand is what was
         asked for, not what was agreed to. */
      { context: "Courses › Databases", total: 3, stillOpen: 0, byStatus: { pending: 0, approved: 0, implemented: 0, rejected: 3 } }
    ]
  },
  "365 days": {
    available: true, generatedAt: "2026-08-24T06:00:00Z",
    rows: [
      { context: "Courses › System design", total: 21, stillOpen: 6, byStatus: { pending: 4, approved: 2, implemented: 12, rejected: 3 } },
      { context: "Challenges › Algorithms › Graphs", total: 14, stillOpen: 4, byStatus: { pending: 2, approved: 2, implemented: 8, rejected: 2 } }
    ]
  },
  "all time": {
    /* A rollup that cannot be derived says so and shows no figure — never a
       blank panel and never a guessed zero. */
    available: false, generatedAt: "", rows: []
  }
};

export interface GapPhrase {
  /** The safe generic phrase — a learner's question reduced before it is stored. */
  phrase: string;
  count: number;
}

export interface SearchedForPanel {
  available: boolean;
  windowDays: number;
  /** A period containing a search that could not run is marked incomplete
   *  rather than counted. */
  incomplete: boolean;
  generatedAt: string;
  phrases: GapPhrase[];
}

/** "Searched for and not found" — WizBit's knowledge-base no-match count.
 *  Only phrases at or above COMPANION_GAP_MINIMUM_OCCURRENCES are visible. */
export const SEARCHED_FOR: SearchedForPanel = {
  available: true,
  windowDays: FIG.COMPANION_GAP_WINDOW_DAYS,
  incomplete: true,
  generatedAt: "2026-08-24T06:00:00Z",
  phrases: [
    { phrase: "how credits clear", count: 31 },
    { phrase: "refund policy", count: 18 },
    { phrase: "certificate verification link", count: 12 },
    { phrase: "pair programming", count: 7 },
    { phrase: "dark mode on the terminal", count: 5 }
  ]
};

/* ── Home's curated suggestion ────────────────────────────────────────────── */

export type SuggestionKind = "course" | "subject" | "track" | "challenge" | "case";

export interface PublishedTarget {
  id: string;
  kind: SuggestionKind;
  title: string;
  /** A target that retires empties the slot — archived here means retired. */
  lifecycle: "published" | "archived";
}

export const PUBLISHED_TARGETS: PublishedTarget[] = [
  { id: "t-fopy", kind: "course", title: "Foundations of Python", lifecycle: "published" },
  { id: "t-tspace", kind: "course", title: "Time and Space, Honestly", lifecycle: "published" },
  { id: "t-ds", kind: "subject", title: "Data structures", lifecycle: "published" },
  { id: "t-graph", kind: "track", title: "Graph traversal track", lifecycle: "published" },
  { id: "t-brackets", kind: "challenge", title: "Balanced Brackets", lifecycle: "published" },
  { id: "t-offbyone", kind: "case", title: "The Off-by-One Window", lifecycle: "published" },
  /* Retired — choosing it is refused, and a slot pointing at it would have
     emptied itself. */
  { id: "t-legacy", kind: "course", title: "Legacy arithmetic drill", lifecycle: "archived" }
];

export interface CuratedSuggestion {
  targetId: string;
  line: string;
}

export interface SuggestionChange {
  at: string;
  by: string;
  targetTitle: string;
  reason: string;
}

export const SUGGESTION: CuratedSuggestion | null = {
  targetId: "t-fopy",
  line: "Start here — twelve lessons, no prerequisites."
};

export const SUGGESTION_HISTORY: SuggestionChange[] = [
  { at: "2026-08-10T10:00:00Z", by: "Nandini R.", targetTitle: "Foundations of Python", reason: "New-cohort onboarding push." },
  { at: "2026-07-30T15:00:00Z", by: "—", targetTitle: "Legacy arithmetic drill", reason: "The target retired — the slot emptied itself." },
  { at: "2026-07-12T09:30:00Z", by: "Meera K.", targetTitle: "Legacy arithmetic drill", reason: "Back-to-basics week." }
];

/* ── Broadcasts ───────────────────────────────────────────────────────────── */

export type BroadcastStatus = "in flight" | "delivered" | "stopped" | "failed" | "held";

export interface BroadcastRec {
  id: string;
  title: string;
  message: string;
  icon: string;
  author: string;
  createdAt: string;
  status: BroadcastStatus;
  /** Administration's upper-bound estimate at send time — null where it could
   *  not be computed; never a target. */
  estimated: number | null;
  delivered: number;
  failed: number;
  skipped: number;
  /** Real count — null where it cannot be read, never a fabricated zero. */
  stoppedBefore: number | null;
  failReason?: string;
  stopRequest?: { by: string; at: string; why: string } | null;
  /** A held send retries; a delivery still going out can be stopped. */
  note?: string;
}

export const BROADCASTS: BroadcastRec[] = [
  {
    id: "bc-42", title: "Studio hours this week",
    message: "Foundations of Python studio hours run Thursday 18:00 IST — bring your lesson-9 questions.",
    icon: "megaphone", author: "Nandini R.", createdAt: "2026-08-24T09:05:00Z",
    status: "in flight", estimated: 6140, delivered: 2011, failed: 3, skipped: 144, stoppedBefore: 0
  },
  {
    id: "bc-41", title: "Maintenance Saturday 02:00 IST",
    message: "Batch execution pauses for two hours; interactive work stays available.",
    icon: "megaphone", author: "Meera K.", createdAt: "2026-08-21T14:00:00Z",
    status: "stopped", estimated: 6120, delivered: 3502, failed: 11, skipped: 201, stoppedBefore: 2406,
    stopRequest: { by: "Nandini R.", at: "2026-08-21T14:22:00Z", why: "Superseded by an earlier window notice." }
  },
  {
    id: "bc-40", title: "New track: Graph traversal",
    message: "Eight new challenges are live under Challenges › Tracks.",
    icon: "megaphone", author: "Nandini R.", createdAt: "2026-08-18T11:00:00Z",
    status: "delivered", estimated: 5980, delivered: 5741, failed: 9, skipped: 230, stoppedBefore: 0
  },
  {
    id: "bc-39", title: "Welcome to the new term",
    message: "August cohort — your first daily challenge is live.",
    icon: "megaphone", author: "Meera K.", createdAt: "2026-08-10T08:00:00Z",
    status: "held", estimated: null, delivered: 0, failed: 0, skipped: 0, stoppedBefore: 0,
    note: "Delivery could not start — the delivery path was unavailable. Held, never reported as sent."
  },
  {
    id: "bc-38", title: "July recap",
    message: "Your July recap is ready.",
    icon: "megaphone", author: "Nandini R.", createdAt: "2026-08-01T08:00:00Z",
    status: "failed", estimated: 5900, delivered: 0, failed: 0, skipped: 0, stoppedBefore: 0,
    failReason: "The fan-out spent its tries and reached no recipient — the queue was offline through the window."
  }
];

/** The composer's own fixture settings. */
export const COMPOSER = {
  /** Administration's upper-bound estimate; null where uncomputable — which
   *  requires the second acknowledgement rather than skipping it. */
  estimatedAudience: 6140 as number | null,
  /** Where sending is unavailable the reason is stated within reach. */
  sendingAvailable: true,
  sendingReason: "",
  /** "fails-once" demonstrates the failed submission: nothing is sent and the
   *  draft is kept; the retry succeeds. */
  sendBehaviour: "fails-once" as "ok" | "fails-once"
};

/* ── Small shared helpers ─────────────────────────────────────────────────── */

export function fmtInstant(iso: string): string {
  if (!iso) return "—";
  return iso.slice(0, 16).replace("T", " ") + "Z";
}

/** A staff export is one comma-separated file, generated-at inside it and in
 *  the name; partial names itself partial. */
export function exportCsv(filename: string, header: string, rows: string[], partial = false) {
  const body = `# generated-at ${new Date().toISOString()}\n${header}\n${rows.join("\n")}\n`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  a.download = `${filename}${partial ? "-partial" : ""}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
