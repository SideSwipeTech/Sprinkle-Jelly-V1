/**
 * fixtures — the assessment studio's prepared data: papers with their sections
 * and questions, companies and roles, sittings with their Recorded Events, and
 * the aggregate analytics shapes. Fixture state only; nothing here persists.
 *
 * Vocabulary is the domain's own: paper (type Mock or Company, immutable),
 * test, Recorded Event, the five kinds, the four invalidation reasons, the
 * three analytics families.
 */

import type { QuestionDraft } from "../../extraction/components/QuestionEditor/QuestionEditor";
import { emptyKeyFor, validateQuestion } from "../../extraction/components/QuestionEditor/QuestionEditor";
import type { RecordedEventEntry } from "../../extraction/components/RecordedEventTimeline/RecordedEventTimeline";

export type PaperType = "mock" | "company";
export type Lifecycle = "draft" | "published" | "archived";
export type Strictness = "off" | "standard" | "strict";
export type Provenance = "actual" | "pattern";
export type TestState =
  | "in progress"
  | "submitted"
  | "auto-submitted"
  | "grading"
  | "finalized"
  | "invalidated";

export interface StudioSection {
  id: string;
  name: string;
  /** Primary subject. */
  subject: string;
  /** The briefing shown before the section. */
  briefing: string;
  /** Optional coding-run allowance; null means unlimited and is never read as zero. */
  codingAllowance: number | null;
  /** Optional suggested duration — advisory pacing, never a limit. */
  suggestedMinutes: number | null;
  /** The draft-time inclusion switch; it disappears at the freeze. */
  include: boolean;
}

export interface StudioQuestion extends QuestionDraft {
  id: string;
  sectionId: string;
  order: number;
}

export interface StudioPaper {
  id: string;
  /** The immutable type, selected first at creation and never changed. */
  type: PaperType;
  title: string;
  /** Mock: doubles as the learner-facing instructions. Company: paired with briefingInstructions. */
  description: string;
  lifecycle: Lifecycle;
  /* The assessment constants a paper may set */
  durationMinutes: number;
  graceSeconds: number;
  strictness: Strictness;
  countedEventCeiling: number;
  fullscreenRequired: boolean;
  clipboardCounted: boolean;
  restrictedNavigationCounted: boolean;
  numericalTolerance: { mode: "exact" | "absolute" | "relative"; value: number };
  availabilityStart: string;
  availabilityEnd: string;
  featured: boolean;
  revealReview: boolean;
  revealAnswers: boolean;
  revealExplanations: boolean;
  /* Mock adds */
  category: string;
  difficulty: "" | "easy" | "medium" | "hard" | "extreme";
  passingPercent: number | null;
  examFlags: {
    timer: boolean;
    palette: boolean;
    review: boolean;
    skip: boolean;
    revisit: boolean;
    sectionSwitching: boolean;
  };
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  /* Company adds — company, role and year freeze absolutely at publish */
  companyId: string | null;
  roleId: string | null;
  year: string;
  provenance: Provenance;
  /** Actual is gated at publish: a dated source and a documented right to reproduce. */
  provenanceSource: string;
  provenanceRight: boolean;
  briefingInstructions: string;
  /* Coding reference runs — one per offered side; null = could not run. */
  referenceRunsPassed: boolean | null;
  sections: StudioSection[];
  questions: StudioQuestion[];
  /** Tests on record — the archive confirmation names the object and this count. */
  testCount: number;
  /** How many people a settings-change notice reaches; null = the count cannot
   *  be computed, which blocks the confirmation that depends on it. */
  audienceCount: number | null;
  /** The paper's last-change stamp — the index's Updated column. Session
   *  mutations stamp the scenario's product date, never the real clock. */
  updatedAt: string;
}

export interface CompanyFixture {
  id: string;
  name: string;
  details: string;
  state: "listed" | "deactivated";
  roles: { id: string; name: string }[];
  /** Optional per-company marks and negative-marking defaults — pre-fill only,
   *  never move an existing question. null = the platform's own. */
  markingDefaults: { marks: number; negativeMarks: number } | null;
  publishedPapers: number;
  dependentTests: number;
}

export interface SittingFixture {
  id: string;
  paperId: string;
  paperTitle: string;
  state: TestState;
  strictness: Strictness;
  countedEventCeiling: number;
  startedAt: string;
  endedAt: string | null;
  /** The reason the platform ended the test, in plain language. */
  endingReason: string | null;
  events: RecordedEventEntry[];
  invalidation: { reason: string; administrator: string; note: string; at: string } | null;
}

/* ── The editable-after-publish set, enumerated once per type ────────────── */

export const EDITABLE_SHARED = [
  "time limit",
  "grace",
  "the integrity settings",
  "availability window",
  "per-question authored target time",
  "featured marking",
  "description"
] as const;

export const EDITABLE_MOCK = [
  "passing percentage",
  "reveal flags",
  "exam-XP flags",
  "randomization flags",
  "category",
  "difficulty",
  "title"
] as const;

export const EDITABLE_COMPANY = ["the separate briefing instructions"] as const;

export function editableSetFor(type: PaperType): readonly string[] {
  return type === "mock"
    ? [...EDITABLE_SHARED, ...EDITABLE_MOCK]
    : [...EDITABLE_SHARED, ...EDITABLE_COMPANY];
}

/* ── The publish gate: shared checks plus the selected type's own ─────────── */

export interface PublishCheck {
  id: string;
  /** The named check. */
  name: string;
  scope: "shared" | "mock" | "company";
  status: "pass" | "fail" | "unverifiable";
  /** Each failure is reported individually and actionably. */
  fix?: string;
  /** The workspace address of the field or section the fix lands on. */
  to?: string;
  /** The offending questions, each linked to its own authoring address. */
  links?: { label: string; to: string }[];
  detail?: string;
}

/** The workspace tab a fix lives on — kept in one place so every check and
 *  warning points at the same addresses. */
function paperTab(paper: StudioPaper, tab: "overview" | "questions" | "settings"): string {
  return `/admin/mocks/${paper.id}?tab=${tab}`;
}

function questionTo(paper: StudioPaper, q: StudioQuestion): string {
  return `/admin/mocks/${paper.id}/sections/${q.sectionId}/questions/${q.id}`;
}

function questionLink(paper: StudioPaper) {
  return (q: StudioQuestion) => ({
    label: q.prompt.trim() ? q.prompt.trim().slice(0, 56) : q.id,
    to: questionTo(paper, q)
  });
}

export function publishChecksFor(paper: StudioPaper): PublishCheck[] {
  const carried = paper.sections.filter((s) => s.include);
  const carriedQuestions = paper.questions.filter((q) =>
    carried.some((s) => s.id === q.sectionId)
  );
  const marksTotal = carriedQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const unclassified = carriedQuestions.filter((q) => !q.skill || !q.topic);
  const codingQuestions = carriedQuestions.filter((q) => q.kind === "coding");
  const badKeys = carriedQuestions.filter((q) =>
    validateQuestion(q).some((e) => e.field === "key" || e.field === "options" || e.field === "cases")
  );
  const codingMissing = codingQuestions.filter((q) => q.cases.length === 0 || !q.language);

  const overview = paperTab(paper, "overview");
  const questions = paperTab(paper, "questions");
  const checks: PublishCheck[] = [
    {
      id: "title",
      name: "A usable title",
      scope: "shared",
      status: paper.title.trim() ? "pass" : "fail",
      fix: "Name the paper in Details.",
      to: overview
    },
    {
      id: "duration",
      name: "A positive duration",
      scope: "shared",
      status: paper.durationMinutes > 0 ? "pass" : "fail",
      fix: "Set the time limit in Details.",
      to: overview
    },
    {
      id: "window",
      name: "A window whose end follows its start",
      scope: "shared",
      status:
        !paper.availabilityStart || !paper.availabilityEnd || paper.availabilityEnd > paper.availabilityStart
          ? "pass"
          : "fail",
      fix: "Correct the availability window in Details.",
      to: overview
    },
    {
      id: "sections",
      name: "At least one section and one carried question",
      scope: "shared",
      status: carried.length > 0 && carriedQuestions.length > 0 ? "pass" : "fail",
      fix: "Add a section and a question in Structure.",
      to: questions
    },
    {
      id: "marks",
      name: "A positive marks total",
      scope: "shared",
      status: marksTotal > 0 ? "pass" : "fail",
      fix: "Give a question positive marks.",
      to: questions,
      detail: `${marksTotal} marks across ${carriedQuestions.length} carried questions`
    },
    {
      id: "classification",
      name: "Every question classified against a live skill and topic",
      scope: "shared",
      status: unclassified.length === 0 ? "pass" : "fail",
      fix: unclassified.length ? `Classify ${unclassified.length} question${unclassified.length === 1 ? "" : "s"} in their sections.` : undefined,
      to: questions,
      links: unclassified.map(questionLink(paper))
    },
    {
      id: "keys",
      name: "Well-formed keys",
      scope: "shared",
      status: badKeys.length === 0 ? "pass" : "fail",
      fix: badKeys.length ? `Repair the key on ${badKeys.length} question${badKeys.length === 1 ? "" : "s"}.` : undefined,
      to: questions,
      links: badKeys.map(questionLink(paper))
    },
    {
      id: "coding-shape",
      name: "Every coding question holding a case and a language",
      scope: "shared",
      status: codingMissing.length === 0 ? "pass" : "fail",
      fix: codingMissing.length ? `Add a case and a language to ${codingMissing.length} coding question${codingMissing.length === 1 ? "" : "s"}.` : undefined,
      to: questions,
      links: codingMissing.map(questionLink(paper))
    }
  ];

  if (codingQuestions.length > 0) {
    checks.push({
      id: "reference-runs",
      name: "Coding reference runs pass, one per offered side",
      scope: "shared",
      status:
        paper.referenceRunsPassed === null
          ? "unverifiable"
          : paper.referenceRunsPassed
            ? "pass"
            : "fail",
      fix: paper.referenceRunsPassed === false ? "A failing run returns the draft with the gate's message." : undefined,
      to: questions,
      detail: paper.referenceRunsPassed === null ? "not yet verifiable — the run could not be started" : undefined
    });
  }

  if (paper.type === "mock") {
    checks.push({
      id: "passing",
      name: "A passing percentage in range",
      scope: "mock",
      status:
        paper.passingPercent !== null && paper.passingPercent >= 1 && paper.passingPercent <= 100
          ? "pass"
          : "fail",
      fix: "Set the passing percentage (1 to 100) in the Mock fields.",
      to: overview
    });
  } else {
    const roleOk =
      !!paper.companyId &&
      !!paper.roleId &&
      (companies().find((c) => c.id === paper.companyId)?.roles.some((r) => r.id === paper.roleId) ?? false);
    checks.push(
      {
        id: "owning-company",
        name: "An owning company and a role belonging to it",
        scope: "company",
        status: roleOk ? "pass" : "fail",
        fix: "Set the owning company and one of its own roles — a role of another company is refused by name.",
        to: overview
      },
      {
        id: "provenance",
        name: "The Actual provenance gate: a dated source and a documented right to reproduce",
        scope: "company",
        status:
          paper.provenance === "pattern"
            ? "pass"
            : paper.provenanceSource.trim() && paper.provenanceRight
              ? "pass"
              : "fail",
        fix:
          paper.provenance === "actual"
            ? "Record the dated source and the documented right to reproduce, or downgrade to Pattern."
            : undefined,
        to: overview,
        detail: paper.provenance === "pattern" ? "Pattern carries no rights claim and is not gated" : undefined
      }
    );
  }
  return checks;
}

/* ── The publish warnings — advisory findings the gate does not block on ────
   Each is derived from the draft itself and links to where it is addressed;
   publish goes through with them, which is exactly why they list separately
   from the blockers. */

export interface PublishWarning {
  id: string;
  message: string;
  /** The workspace address the warning is addressed at. */
  to: string;
}

export function publishWarningsFor(paper: StudioPaper): PublishWarning[] {
  const carried = paper.sections.filter((s) => s.include);
  const carriedQuestions = paper.questions.filter((q) =>
    carried.some((s) => s.id === q.sectionId)
  );
  const warnings: PublishWarning[] = [];
  const overview = paperTab(paper, "overview");
  const questions = paperTab(paper, "questions");

  if (!paper.availabilityStart && !paper.availabilityEnd) {
    warnings.push({
      id: "window",
      message: "No availability window — the paper is always open.",
      to: overview
    });
  }
  const unbriefed = carried.filter((s) => !s.briefing.trim());
  if (unbriefed.length > 0) {
    warnings.push({
      id: "section-briefings",
      message: `${unbriefed.length} carried section${unbriefed.length === 1 ? "" : "s"} (${unbriefed.map((s) => s.name || "unnamed").join(", ")}) carry no briefing — the learner meets the questions cold.`,
      to: questions
    });
  }
  const untimed = carriedQuestions.filter((q) => !q.targetSeconds.trim());
  if (untimed.length > 0) {
    warnings.push({
      id: "target-times",
      message: `${untimed.length} carried question${untimed.length === 1 ? "" : "s"} carry no authored target time — the pace-based review reasons lose their denominator.`,
      to: questions
    });
  }
  const unexplained = carriedQuestions.filter((q) => !q.explanation.trim());
  if (unexplained.length > 0) {
    warnings.push({
      id: "explanations",
      message: `${unexplained.length} carried question${unexplained.length === 1 ? "" : "s"} carry no explanation — the review reveals a key with nothing behind it.`,
      to: questions
    });
  }
  if (paper.type === "company" && !paper.briefingInstructions.trim()) {
    warnings.push({
      id: "briefing",
      message: "No separate briefing instructions — the Company paper's briefing stage has nothing of its own to say.",
      to: overview
    });
  }
  return warnings;
}

/* ── The bulk importer ────────────────────────────────────────────────────── */

/** The shared bound on a batch — JOBS_SWEEP_PAGE_RECORDS. */
export const IMPORT_BATCH_BOUND = 500;

export const IMPORT_TEMPLATE =
  "section,kind,prompt,marks,negative_marks,options,correct,explanation,target_seconds\n" +
  "Quantitative,single-choice,\"Which structure gives O(1) lookup?\",4,1,\"list|hash table|tree\",\"hash table\",\"Hashing maps the key.\",45";

export interface ImportRow {
  row: number;
  section: string;
  kind: string;
  prompt: string;
  marks: string;
  status: "ok" | "error";
  errors: string[];
}

/** One prepared batch: two clean rows, two refused rows — every row is
 *  validated across the whole batch and the commit is all or none. */
export const SAMPLE_BATCH: ImportRow[] = [
  { row: 1, section: "Quantitative", kind: "single-choice", prompt: "Which structure gives O(1) average lookup?", marks: "4", status: "ok", errors: [] },
  { row: 2, section: "Quantitative", kind: "numerical", prompt: "Expected heads in 10 fair tosses?", marks: "2", status: "ok", errors: [] },
  { row: 3, section: "Reasoning", kind: "single-choice", prompt: "", marks: "4", status: "error", errors: ["prompt is empty", "no correct option named"] },
  { row: 4, section: "Reasoning", kind: "multiple-choice", prompt: "Select every prime.", marks: "4", status: "error", errors: ["correct names no listed option"] },
  { row: 5, section: "No such section", kind: "single-choice", prompt: "Pick the sorting bound.", marks: "3", status: "error", errors: ["section name maps to no section on the paper"] }
];

/* ── The advisory review reasons — the Assessment namespace, six members ──── */

export const ASSESSMENT_REVIEW_REASONS = [
  "very low accuracy",
  "very high accuracy",
  "frequently skipped",
  "unusually slow",
  "high partial credit",
  "possible grading failure"
] as const;

/* ── Invalidation ─────────────────────────────────────────────────────────── */

export const INVALIDATION_REASON = "An administrator invalidated it";

export const INVALIDATION_REASONS = [
  "The platform failed",
  "The authored content was wrong",
  "A security action left it unsafe to finalize",
  INVALIDATION_REASON
] as const;

/* ── Named actions (only assessments.review_recorded_event is verbatim in the
   documents; the studio's other privileged acts are the super administrator's
   at launch — these names are chosen, not stated) ─────────────────────────── */

export const ACTION = {
  editPaper: "assessments.edit_paper",
  importQuestions: "assessments.import_questions",
  publishPaper: "assessments.publish_paper",
  editSettings: "assessments.edit_settings",
  manageCompanies: "assessments.manage_companies",
  invalidateTest: "assessments.invalidate_test",
  reviewRecordedEvent: "assessments.review_recorded_event",
  readAnalytics: "assessments.read_analytics"
} as const;

/* ── Papers ───────────────────────────────────────────────────────────────── */

/** The studio index's honest page bound — the platform's list page size. */
export const PLATFORM_LIST_PAGE_ITEMS = 20;

/** The studio's product date — the one consistent scenario clock (the
 *  analytics computed-at day). Session mutations stamp it rather than mixing
 *  the real clock into an August 2026 scenario. */
export const STUDIO_TODAY = "2026-08-23";

const algebraSections: StudioSection[] = [
  {
    id: "sec-quant",
    name: "Quantitative",
    subject: "Mathematics",
    briefing: "Four questions, mixed kinds. Marks shown on each.",
    codingAllowance: null,
    suggestedMinutes: 15,
    include: true
  },
  {
    id: "sec-reason",
    name: "Reasoning",
    subject: "Logic",
    briefing: "Read each stem fully before answering.",
    codingAllowance: null,
    suggestedMinutes: null,
    include: true
  },
  {
    id: "sec-code",
    name: "Hands-on",
    subject: "Algorithms",
    briefing: "One coding question. Visible cases run inside this section's allowance of 5.",
    codingAllowance: 5,
    suggestedMinutes: null,
    include: true
  }
];

const algebraQuestions: StudioQuestion[] = [
  {
    id: "q-lookup", sectionId: "sec-quant", order: 1, kind: "single-choice",
    prompt: "Which structure gives O(1) average lookup?", marks: "4", negativeMarks: "1",
    difficulty: "easy", skill: "Data structures", topic: "Arrays",
    explanation: "A hash table hashes the key once.", targetSeconds: "45",
    options: [
      { id: "o1", text: "Linked list" },
      { id: "o2", text: "Hash table" },
      { id: "o3", text: "Binary search tree" }
    ],
    key: { kind: "single-choice", optionId: "o2" }, language: "", cases: []
  },
  {
    id: "q-primes", sectionId: "sec-quant", order: 2, kind: "multiple-choice",
    prompt: "Select every prime.", marks: "4", negativeMarks: "",
    difficulty: "easy", skill: "Algorithms", topic: "Complexity",
    explanation: "", targetSeconds: "",
    options: [
      { id: "o1", text: "2" }, { id: "o2", text: "9" }, { id: "o3", text: "11" }, { id: "o4", text: "15" }
    ],
    key: { kind: "multiple-choice", optionIds: ["o1", "o3"] }, language: "", cases: []
  },
  {
    id: "q-heads", sectionId: "sec-quant", order: 3, kind: "numerical",
    prompt: "A fair coin is tossed 10 times. Expected number of heads?", marks: "2", negativeMarks: "",
    difficulty: "medium", skill: "Algorithms", topic: "Complexity",
    explanation: "Linearity of expectation.", targetSeconds: "60",
    options: [],
    key: { kind: "numerical", value: "5", toleranceMode: "absolute", tolerance: "0.01" },
    language: "", cases: []
  },
  {
    /* Deliberately unclassified — the publish checklist reports it by name. */
    id: "q-pigeon", sectionId: "sec-reason", order: 1, kind: "true-false",
    prompt: "With 11 pigeons and 10 holes, some hole holds at least two.", marks: "2", negativeMarks: "",
    difficulty: "medium", skill: "", topic: "",
    explanation: "", targetSeconds: "",
    options: [],
    key: { kind: "true-false", value: true },
    language: "", cases: []
  },
  {
    /* Well-formed coding question; the paper's referenceRunsPassed is null, so
       the publish checklist reports the gate as not yet verifiable. */
    id: "q-longrun", sectionId: "sec-code", order: 1, kind: "coding",
    prompt: "Write a function returning the longest run of equal characters.", marks: "10", negativeMarks: "",
    difficulty: "hard", skill: "Algorithms", topic: "Syntax",
    explanation: "Two pointers suffice.", targetSeconds: "600",
    options: [], key: { kind: "coding" }, language: "python",
    cases: [
      { id: "c1", visible: true, input: '"aabbb"', expected: "3", comparison: "exact" },
      { id: "c2", visible: false, input: '"abcccccde"', expected: "5", comparison: "trimmed" }
    ]
  }
];

const dsaSections: StudioSection[] = [
  {
    id: "sec-mcq", name: "Concepts", subject: "Data structures",
    briefing: "Conceptual checks first.", codingAllowance: null, suggestedMinutes: 10, include: true
  },
  {
    id: "sec-code", name: "Implementation", subject: "Algorithms",
    briefing: "One coding question. Visible cases run inside this section's allowance of 5.",
    codingAllowance: 5, suggestedMinutes: 30, include: true
  }
];

const dsaQuestions: StudioQuestion[] = [
  {
    id: "q-big-o", sectionId: "sec-mcq", order: 1, kind: "single-choice",
    prompt: "Worst-case time of binary search on a sorted array?", marks: "4", negativeMarks: "1",
    difficulty: "easy", skill: "Algorithms", topic: "Complexity",
    explanation: "Each step halves the interval.", targetSeconds: "30",
    options: [
      { id: "o1", text: "O(n)" }, { id: "o2", text: "O(log n)" }, { id: "o3", text: "O(n log n)" }
    ],
    key: { kind: "single-choice", optionId: "o2" }, language: "", cases: []
  },
  {
    id: "q-run", sectionId: "sec-code", order: 1, kind: "coding",
    prompt: "Write a function returning the longest run of equal characters.", marks: "10", negativeMarks: "",
    difficulty: "hard", skill: "Algorithms", topic: "Syntax",
    explanation: "Two pointers suffice.", targetSeconds: "600",
    options: [], key: { kind: "coding" }, language: "python",
    cases: [
      { id: "c1", visible: true, input: '"aabbb"', expected: "3", comparison: "exact" },
      { id: "c2", visible: true, input: '""', expected: "0", comparison: "exact" },
      { id: "c3", visible: false, input: '"abcccccde"', expected: "5", comparison: "trimmed" }
    ]
  }
];

const acmeSections: StudioSection[] = [
  {
    id: "sec-fe", name: "Frontend fundamentals", subject: "Interfaces",
    briefing: "Sectional locking applies — a completed section locks.",
    codingAllowance: null, suggestedMinutes: 20, include: true
  }
];

const acmeQuestions: StudioQuestion[] = [
  {
    id: "q-dom", sectionId: "sec-fe", order: 1, kind: "single-choice",
    prompt: "Which API reads a node's layout box?", marks: "4", negativeMarks: "",
    difficulty: "medium", skill: "Language foundations", topic: "Syntax",
    explanation: "", targetSeconds: "40",
    options: [
      { id: "o1", text: "getBoundingClientRect" }, { id: "o2", text: "querySelector" }, { id: "o3", text: "requestAnimationFrame" }
    ],
    key: { kind: "single-choice", optionId: "o1" }, language: "", cases: []
  },
  {
    id: "q-events", sectionId: "sec-fe", order: 2, kind: "multiple-choice",
    prompt: "Select every event fired during a drag.", marks: "4", negativeMarks: "1",
    difficulty: "hard", skill: "Language foundations", topic: "Syntax",
    explanation: "", targetSeconds: "",
    options: [
      { id: "o1", text: "dragover" }, { id: "o2", text: "dragstart" }, { id: "o3", text: "keypress" }
    ],
    key: { kind: "multiple-choice", optionIds: ["o1", "o2"] }, language: "", cases: []
  }
];

export const PAPERS: StudioPaper[] = [
  {
    id: "paper-mock-algebra", type: "mock", title: "Algebra II readiness",
    description: "A mixed-kinds readiness paper. Instructions: answer in order; marks as shown.",
    lifecycle: "draft",
    durationMinutes: 45, graceSeconds: 60, strictness: "standard", countedEventCeiling: 3,
    fullscreenRequired: false, clipboardCounted: false, restrictedNavigationCounted: false,
    numericalTolerance: { mode: "exact", value: 0 },
    availabilityStart: "", availabilityEnd: "", featured: false,
    revealReview: true, revealAnswers: true, revealExplanations: true,
    category: "Mathematics", difficulty: "medium",
    /* Deliberately unset — the Mock publish check reports it by name. */
    passingPercent: null,
    examFlags: { timer: true, palette: true, review: true, skip: true, revisit: true, sectionSwitching: true },
    shuffleQuestions: false, shuffleOptions: false,
    companyId: null, roleId: null, year: "", provenance: "pattern",
    provenanceSource: "", provenanceRight: false, briefingInstructions: "",
    referenceRunsPassed: null,
    sections: algebraSections, questions: algebraQuestions, testCount: 0, audienceCount: null,
    updatedAt: "2026-08-19"
  },
  {
    id: "paper-mock-dsa", type: "mock", title: "Data structures timed paper",
    description: "Concepts, then one implementation under the clock. Instructions are this description.",
    lifecycle: "published",
    durationMinutes: 60, graceSeconds: 60, strictness: "strict", countedEventCeiling: 3,
    fullscreenRequired: true, clipboardCounted: true, restrictedNavigationCounted: true,
    numericalTolerance: { mode: "exact", value: 0 },
    availabilityStart: "2026-08-01", availabilityEnd: "2026-12-31", featured: true,
    revealReview: true, revealAnswers: true, revealExplanations: false,
    category: "Computer science", difficulty: "hard", passingPercent: 50,
    examFlags: { timer: true, palette: true, review: true, skip: true, revisit: true, sectionSwitching: true },
    shuffleQuestions: true, shuffleOptions: true,
    companyId: null, roleId: null, year: "", provenance: "pattern",
    provenanceSource: "", provenanceRight: false, briefingInstructions: "",
    referenceRunsPassed: true,
    sections: dsaSections, questions: dsaQuestions, testCount: 128, audienceCount: 128,
    updatedAt: "2026-08-22"
  },
  {
    id: "paper-mock-legacy", type: "mock", title: "Legacy arithmetic drill",
    description: "The retired arithmetic paper.", lifecycle: "archived",
    durationMinutes: 20, graceSeconds: 30, strictness: "off", countedEventCeiling: 3,
    fullscreenRequired: false, clipboardCounted: false, restrictedNavigationCounted: false,
    numericalTolerance: { mode: "exact", value: 0 },
    availabilityStart: "", availabilityEnd: "", featured: false,
    revealReview: false, revealAnswers: false, revealExplanations: false,
    category: "Mathematics", difficulty: "easy", passingPercent: 50,
    examFlags: { timer: true, palette: false, review: false, skip: true, revisit: true, sectionSwitching: true },
    shuffleQuestions: false, shuffleOptions: false,
    companyId: null, roleId: null, year: "", provenance: "pattern",
    provenanceSource: "", provenanceRight: false, briefingInstructions: "",
    referenceRunsPassed: null,
    sections: [], questions: [], testCount: 214, audienceCount: 214,
    updatedAt: "2026-06-30"
  },
  {
    id: "paper-company-acme", type: "company", title: "Acme — frontend engineer",
    description: "The Acme frontend shape.",
    lifecycle: "published",
    durationMinutes: 40, graceSeconds: 60, strictness: "strict", countedEventCeiling: 5,
    fullscreenRequired: true, clipboardCounted: true, restrictedNavigationCounted: true,
    numericalTolerance: { mode: "exact", value: 0 },
    availabilityStart: "2026-07-01", availabilityEnd: "", featured: false,
    revealReview: true, revealAnswers: false, revealExplanations: false,
    category: "", difficulty: "", passingPercent: null,
    examFlags: { timer: true, palette: false, review: false, skip: false, revisit: false, sectionSwitching: false },
    shuffleQuestions: false, shuffleOptions: false,
    companyId: "company-acme", roleId: "role-acme-fe", year: "2026", provenance: "actual",
    provenanceSource: "Acme released paper, March 2026", provenanceRight: true,
    briefingInstructions: "Sectional locking applies. Strict proctoring, ceiling 5.",
    referenceRunsPassed: null,
    sections: acmeSections, questions: acmeQuestions, testCount: 57, audienceCount: 57,
    updatedAt: "2026-08-18"
  }
];

/* ── Session registers — the demo's create and remove acts ───────────────────
   Fixture state only: a create or remove lands here for the session so the
   index, the studio and the authoring pages agree until reload; nothing here
   persists. Every mutator refuses on anything but a draft — a published
   paper's content is frozen permanently. */

let extraSeq = 0;
const EXTRA_PAPERS: StudioPaper[] = [];

/** The defaults a created paper starts from — a draft of the selected,
 *  permanent type, with no sections and no tests. A Company paper is created
 *  inside a selected company and stays owned by it — the blank never leaves
 *  the registry an orphan. */
function blankPaper(type: PaperType, id: string, companyId: string | null, roleId: string | null): StudioPaper {
  return {
    id, type,
    title: "", description: "", lifecycle: "draft",
    durationMinutes: 45, graceSeconds: 60, strictness: "standard", countedEventCeiling: 3,
    fullscreenRequired: false, clipboardCounted: false, restrictedNavigationCounted: false,
    numericalTolerance: { mode: "exact", value: 0 },
    availabilityStart: "", availabilityEnd: "", featured: false,
    revealReview: true, revealAnswers: true, revealExplanations: true,
    category: "", difficulty: "", passingPercent: null,
    examFlags: { timer: true, palette: true, review: true, skip: true, revisit: true, sectionSwitching: true },
    shuffleQuestions: false, shuffleOptions: false,
    companyId, roleId, year: "", provenance: "pattern",
    provenanceSource: "", provenanceRight: false, briefingInstructions: "",
    referenceRunsPassed: null,
    sections: [], questions: [], testCount: 0, audienceCount: 0,
    updatedAt: STUDIO_TODAY
  };
}

/** The create act — the type is selected first, at creation, and never
 *  changes. A Company paper is refused without its owning company: ownership
 *  is chosen at creation and there is no orphan to pretend re-owning later.
 *  The new draft opens in the one workspace. */
export function createPaper(
  type: PaperType,
  ownership?: { companyId: string; roleId?: string | null }
): StudioPaper | null {
  if (type === "company" && !ownership?.companyId) return null;
  const paper = blankPaper(
    type,
    `paper-${type}-new-${++extraSeq}`,
    type === "company" ? ownership!.companyId : null,
    type === "company" ? ownership?.roleId ?? null : null
  );
  EXTRA_PAPERS.unshift(paper);
  return paper;
}

export function allPapers(): StudioPaper[] {
  return [...EXTRA_PAPERS, ...PAPERS];
}

/** A session change stamps the paper on the scenario's product date — the
 *  index's Updated column moves with the act that caused it. */
function touch(paper: StudioPaper) {
  paper.updatedAt = STUDIO_TODAY;
}

/** A blank authoring draft — the kind is the one field still open, fixed the
 *  moment the question exists. */
export function emptyQuestionDraft(): QuestionDraft {
  return {
    kind: "single-choice", prompt: "", marks: "", negativeMarks: "", difficulty: "",
    skill: "", topic: "", explanation: "", targetSeconds: "",
    options: [], key: emptyKeyFor("single-choice"), language: "", cases: []
  };
}

/** A section added on the studio commits on the draft paper so the index and
 *  the authoring surface agree. Returns null on a frozen paper. */
export function commitNewSection(paperId: string, name: string): StudioSection | null {
  const paper = getPaper(paperId);
  if (!paper || paper.lifecycle !== "draft") return null;
  const section: StudioSection = {
    id: `sec-new-${++extraSeq}`,
    name: name.trim() || `Section ${paper.sections.length + 1}`,
    subject: "", briefing: "", codingAllowance: null, suggestedMinutes: null, include: true
  };
  paper.sections.push(section);
  touch(paper);
  return section;
}

/** A question authored inside one section commits on the draft paper. A
 *  section the fixture does not yet hold — one added on the studio page this
 *  session — is materialized with it under the name the studio showed. */
export function commitNewQuestion(
  paperId: string,
  sectionId: string,
  sectionName: string,
  draft: QuestionDraft
): StudioQuestion | null {
  const paper = getPaper(paperId);
  if (!paper || paper.lifecycle !== "draft") return null;
  if (!paper.sections.some((s) => s.id === sectionId)) {
    paper.sections.push({
      id: sectionId,
      name: sectionName.trim() || "Added section",
      subject: "", briefing: "", codingAllowance: null, suggestedMinutes: null, include: true
    });
  }
  const order = paper.questions.filter((q) => q.sectionId === sectionId).length + 1;
  const question: StudioQuestion = { ...draft, id: `q-new-${++extraSeq}`, sectionId, order };
  paper.questions.push(question);
  touch(paper);
  return question;
}

/** A question edit saved on the authoring page commits on the draft — the
 *  record, the outline and the publish gate then agree. Returns false where
 *  the paper is frozen or the question is absent. */
export function commitQuestionUpdate(
  paperId: string,
  questionId: string,
  draft: QuestionDraft
): boolean {
  const paper = getPaper(paperId);
  if (!paper || paper.lifecycle !== "draft") return false;
  const held = paper.questions.find((q) => q.id === questionId);
  if (!held) return false;
  Object.assign(held, { ...draft, id: held.id, sectionId: held.sectionId, order: held.order });
  touch(paper);
  return true;
}

/** A question removal reaches the draft alone; returns false where the paper
 *  is frozen or the question is absent. */
export function removeQuestion(paperId: string, questionId: string): boolean {
  const paper = getPaper(paperId);
  if (!paper || paper.lifecycle !== "draft") return false;
  const before = paper.questions.length;
  paper.questions = paper.questions.filter((q) => q.id !== questionId);
  if (paper.questions.length < before) touch(paper);
  return paper.questions.length < before;
}

/** A section removal takes the questions it held with it — the confirmation
 *  names that count. Returns the held count, null on a frozen paper. */
export function removeSection(paperId: string, sectionId: string): number | null {
  const paper = getPaper(paperId);
  if (!paper || paper.lifecycle !== "draft") return null;
  const held = paper.questions.filter((q) => q.sectionId === sectionId).length;
  paper.sections = paper.sections.filter((s) => s.id !== sectionId);
  paper.questions = paper.questions.filter((q) => q.sectionId !== sectionId);
  touch(paper);
  return held;
}

export function getPaper(id: string | undefined): StudioPaper | undefined {
  return EXTRA_PAPERS.find((p) => p.id === id) ?? PAPERS.find((p) => p.id === id);
}

export function getQuestion(paper: StudioPaper, sectionId: string | undefined, questionId: string | undefined) {
  const section = paper.sections.find((s) => s.id === sectionId);
  const question = paper.questions.find((q) => q.id === questionId && q.sectionId === section?.id);
  return { section, question };
}

/** Administrative invalidation voids one test — the paper row links through
 *  to the take-down surface only while one of its tests stays invalidatable. */
export function invalidatableSittingFor(paperId: string): SittingFixture | undefined {
  return SITTINGS.find((s) => s.paperId === paperId && s.state !== "invalidated");
}

/** The freeze lands on the record — the gate commits it once the checks have
 *  run on the saved draft. Refused where the paper is not a draft. */
export function markPaperPublished(paperId: string): boolean {
  const paper = getPaper(paperId);
  if (!paper || paper.lifecycle !== "draft") return false;
  paper.lifecycle = "published";
  touch(paper);
  return true;
}

/** Archival is the one retirement step — terminal, voids nothing, leaves every
 *  result readable. Refused where the paper is already archived. */
export function archivePaper(paperId: string): boolean {
  const paper = getPaper(paperId);
  if (!paper || paper.lifecycle === "archived") return false;
  paper.lifecycle = "archived";
  touch(paper);
  return true;
}

/** Duplicate is offered from every state: an independent draft with its own
 *  identity, the same permanent type and no tests. A Company paper's copy
 *  stays owned by the same company — the duplicate is never an orphan. */
export function duplicatePaper(paperId: string): StudioPaper | null {
  const paper = getPaper(paperId);
  if (!paper) return null;
  const seq = ++extraSeq;
  const id = `paper-${paper.type}-copy-${seq}`;
  const sectionIds = new Map<string, string>();
  const copy: StudioPaper = {
    ...paper,
    id,
    title: paper.title ? `${paper.title} (copy)` : "",
    lifecycle: "draft",
    referenceRunsPassed: null,
    sections: paper.sections.map((s, i) => {
      const sid = `sec-copy-${seq}-${i + 1}`;
      sectionIds.set(s.id, sid);
      return { ...s, id: sid };
    }),
    questions: paper.questions.map((q, i) => ({
      ...q,
      id: `q-copy-${seq}-${i + 1}`,
      sectionId: sectionIds.get(q.sectionId) ?? q.sectionId,
      key: q.key ? { ...q.key } : q.key,
      options: q.options.map((o) => ({ ...o })),
      cases: q.cases.map((c) => ({ ...c }))
    })),
    testCount: 0,
    audienceCount: 0,
    updatedAt: STUDIO_TODAY
  };
  EXTRA_PAPERS.unshift(copy);
  return copy;
}

/** A company's papers list — the only list a Company paper is opened from. */
export function papersForCompany(companyId: string): StudioPaper[] {
  return allPapers().filter((p) => p.type === "company" && p.companyId === companyId);
}

export function getCompany(id: string | undefined): CompanyFixture | undefined {
  return COMPANIES.find((c) => c.id === id);
}

/* ── Companies and roles ──────────────────────────────────────────────────── */

const COMPANIES: CompanyFixture[] = [
  {
    id: "company-acme", name: "Acme", details: "Product company — interfaces and tools.",
    state: "listed",
    roles: [
      { id: "role-acme-fe", name: "Frontend Engineer 2026" },
      { id: "role-acme-be", name: "Backend Engineer 2026" }
    ],
    markingDefaults: { marks: 4, negativeMarks: 1 },
    publishedPapers: 1, dependentTests: 57
  },
  {
    id: "company-zenitech", name: "Zenitech", details: "Consultancy — data practice.",
    state: "listed",
    roles: [{ id: "role-zeni-da", name: "Data Analyst" }],
    markingDefaults: null,
    publishedPapers: 0, dependentTests: 0
  },
  {
    id: "company-initech", name: "Initech", details: "Legacy listing kept for its results.",
    state: "deactivated",
    roles: [{ id: "role-ini-ops", name: "Operations Analyst" }],
    markingDefaults: null,
    publishedPapers: 2, dependentTests: 183
  },
  {
    id: "company-pristine", name: "Pristine Labs", details: "Registered, never published a paper.",
    state: "listed",
    roles: [],
    markingDefaults: null,
    publishedPapers: 0, dependentTests: 0
  }
];

export function companies(): CompanyFixture[] {
  return COMPANIES;
}

/** Pristine = no published papers and no dependent history. Publication alone
 *  disqualifies a company from deletion. */
export function isPristine(c: CompanyFixture): boolean {
  return c.publishedPapers === 0 && c.dependentTests === 0;
}

/* The registry's session mutators — the companies index and a company's own
   page read the same records for the session; nothing here persists. */

export function createCompany(name: string): CompanyFixture {
  const company: CompanyFixture = {
    id: `company-new-${++extraSeq}`,
    name: name.trim(),
    details: "Registered this session — listed, pristine, deletable until its first publication or dependent history.",
    state: "listed",
    roles: [],
    markingDefaults: null,
    publishedPapers: 0,
    dependentTests: 0
  };
  COMPANIES.push(company);
  return company;
}

/** Details, roles, state and the marking defaults land by replacement — a
 *  patch never reaches a paper. Returns false where the company is absent. */
export function patchCompany(id: string, patch: Partial<CompanyFixture>): boolean {
  const company = getCompany(id);
  if (!company) return false;
  Object.assign(company, { ...patch, id: company.id });
  return true;
}

/** A pristine company still deletes after a confirmation naming exactly what
 *  it removes; the guard refuses anything with published papers or dependent
 *  history. */
export function removeCompany(id: string): boolean {
  const company = getCompany(id);
  if (!company || !isPristine(company) || company.roles.length > 0) return false;
  const idx = COMPANIES.findIndex((c) => c.id === id);
  COMPANIES.splice(idx, 1);
  return true;
}

/* ── Sittings (tests) and their Recorded Events ───────────────────────────── */

export const SITTINGS: SittingFixture[] = [
  {
    id: "T-2291", paperId: "paper-mock-dsa", paperTitle: "Data structures timed paper",
    state: "auto-submitted", strictness: "strict", countedEventCeiling: 3,
    startedAt: "2026-08-21T10:02:00Z", endedAt: "2026-08-21T10:26:30Z",
    endingReason: "The integrity ceiling was reached",
    events: [
      { id: "e1", kind: "page-hidden", at: "2026-08-21T10:14:02Z", test: "T-2291", counted: true, source: "document.visibilitychange" },
      { id: "e2", kind: "window-blur", at: "2026-08-21T10:14:41Z", test: "T-2291", counted: true, source: "window blur listener" },
      { id: "e3", kind: "clipboard-action", at: "2026-08-21T10:17:09Z", test: "T-2291", counted: true, source: "clipboard/context-menu listener" },
      { id: "e4", kind: "restricted-navigation", at: "2026-08-21T10:21:55Z", test: "T-2291", counted: false, source: "keydown shortcut guard", note: "not counted — the paper's restricted-navigation switch was off on the stamped settings" },
      { id: "e5", kind: "page-hidden", at: "2026-08-21T10:24:13Z", test: "T-2291", counted: true, source: "document.visibilitychange" },
      { id: "e6", kind: "fullscreen-exit", at: "2026-08-21T10:26:30Z", test: "T-2291", counted: false, source: "fullscreenchange listener", note: "not counted — the paper's fullscreen switch was off on the stamped settings" }
    ],
    invalidation: null
  },
  {
    id: "T-2292", paperId: "paper-mock-dsa", paperTitle: "Data structures timed paper",
    state: "finalized", strictness: "standard", countedEventCeiling: 3,
    startedAt: "2026-08-22T09:00:00Z", endedAt: "2026-08-22T09:41:12Z",
    endingReason: "The learner submitted",
    events: [
      { id: "e1", kind: "page-hidden", at: "2026-08-22T09:02:11Z", test: "T-2292", counted: true, source: "document.visibilitychange" }
    ],
    invalidation: null
  },
  {
    id: "T-2293", paperId: "paper-company-acme", paperTitle: "Acme — frontend engineer",
    state: "invalidated", strictness: "strict", countedEventCeiling: 5,
    startedAt: "2026-08-20T14:10:00Z", endedAt: "2026-08-20T14:44:00Z",
    endingReason: "The deadline arrived",
    events: [
      { id: "e1", kind: "window-blur", at: "2026-08-20T14:20:00Z", test: "T-2293", counted: true, source: "window blur listener" },
      { id: "e2", kind: "clipboard-action", at: "2026-08-20T14:33:44Z", test: "T-2293", counted: true, source: "clipboard/context-menu listener" }
    ],
    invalidation: {
      reason: "An administrator invalidated it",
      administrator: "Meera K.",
      note: "The paper's second section shipped a mis-keyed option; the result could not stand.",
      at: "2026-08-23T08:15:00Z"
    }
  }
];

export function getSitting(id: string | undefined): SittingFixture | undefined {
  return SITTINGS.find((s) => s.id === id);
}

/* ── Analytics fixtures ───────────────────────────────────────────────────── */

export interface MockAnalyticsFixture {
  learnersSat: number;
  started: number;
  completed: number;
  completionRate: number | null;
  averageScore: number | null;
  passRate: number | null;
  accuracy: number | null;
  averageTimeMinutes: number | null;
  distribution: { bucket: string; count: number }[];
  perSection: { name: string; average: number | null }[];
  byDay: { day: string; count: number }[];
  perQuestion: {
    questionId: string;
    prompt: string;
    tests: number;
    accuracy: number | null;
    skipRate: number | null;
    measuredTimeSec: number | null;
    partialCreditRate: number | null;
    reviewReasons: string[];
  }[];
  computedAt: string;
}

export const MOCK_ANALYTICS: Record<string, MockAnalyticsFixture> = {
  "paper-mock-dsa": {
    learnersSat: 96, started: 104, completed: 91,
    completionRate: 0.875, averageScore: 62.4, passRate: 0.61,
    accuracy: 0.64, averageTimeMinutes: 47,
    distribution: [
      { bucket: "0–19", count: 4 }, { bucket: "20–39", count: 12 }, { bucket: "40–59", count: 28 },
      { bucket: "60–79", count: 33 }, { bucket: "80–100", count: 14 }
    ],
    perSection: [
      { name: "Concepts", average: 71.2 },
      { name: "Implementation", average: 44.8 }
    ],
    byDay: [
      { day: "2026-08-18", count: 21 }, { day: "2026-08-19", count: 18 }, { day: "2026-08-20", count: 26 },
      { day: "2026-08-21", count: 15 }, { day: "2026-08-22", count: 11 }
    ],
    perQuestion: [
      { questionId: "q-big-o", prompt: "Worst-case time of binary search on a sorted array?", tests: 91, accuracy: 0.78, skipRate: 0.04, measuredTimeSec: 26, partialCreditRate: null, reviewReasons: [] },
      { questionId: "q-run", prompt: "Write a function returning the longest run of equal characters.", tests: 88, accuracy: 0.41, skipRate: 0.19, measuredTimeSec: 512, partialCreditRate: 0.63, reviewReasons: ["very low accuracy", "frequently skipped", "unusually slow"] }
    ],
    computedAt: "2026-08-23T06:00:00Z"
  }
};

export interface CompanyAnalyticsFixture {
  overview: { paperId: string; title: string; company: string; completionRate: number | null; oldestFinalizeAt: string; marked: boolean }[];
  perQuestion: { questionId: string; prompt: string; tests: number; accuracy: number | null; skipRate: number | null; partialCreditRate: number | null }[];
  perCompany: { company: string; papers: number; tests: number; completionRate: number | null; averageScore: number | null; trend: string }[];
  families: { family: "participation" | "outcome" | "trend"; rows: { label: string; value: number | null; unit?: string }[] }[];
  computedAt: string;
}

export const COMPANY_ANALYTICS: Record<string, CompanyAnalyticsFixture> = {
  "paper-company-acme": {
    overview: [
      /* Worst completion first; the tie between Zenitech's two papers breaks oldest first. */
      { paperId: "paper-company-zeni-b", title: "Zenitech — data analyst II", company: "Zenitech", completionRate: 0.41, oldestFinalizeAt: "2026-07-14T09:00:00Z", marked: true },
      { paperId: "paper-company-zeni-a", title: "Zenitech — data analyst I", company: "Zenitech", completionRate: 0.41, oldestFinalizeAt: "2026-08-02T09:00:00Z", marked: false },
      { paperId: "paper-company-acme", title: "Acme — frontend engineer", company: "Acme", completionRate: 0.68, oldestFinalizeAt: "2026-07-20T11:00:00Z", marked: true },
      { paperId: "paper-company-ini", title: "Initech — operations analyst", company: "Initech", completionRate: null, oldestFinalizeAt: "", marked: false }
    ],
    perQuestion: [
      { questionId: "q-dom", prompt: "Which API reads a node's layout box?", tests: 39, accuracy: 0.72, skipRate: 0.03, partialCreditRate: null },
      { questionId: "q-events", prompt: "Select every event fired during a drag.", tests: 39, accuracy: 0.36, skipRate: 0.11, partialCreditRate: 0.44 }
    ],
    perCompany: [
      { company: "Acme", papers: 1, tests: 57, completionRate: 0.68, averageScore: 58.1, trend: "stable" },
      { company: "Zenitech", papers: 2, tests: 44, completionRate: 0.41, averageScore: 49.7, trend: "declining" },
      { company: "Initech", papers: 2, tests: 0, completionRate: null, averageScore: null, trend: "unavailable" }
    ],
    families: [
      {
        family: "participation",
        rows: [
          { label: "learners who sat it", value: 52 },
          { label: "tests started", value: 61 },
          { label: "tests completed", value: 39 },
          { label: "completion rate", value: 0.68 }
        ]
      },
      {
        family: "outcome",
        rows: [
          { label: "average score", value: 58.1, unit: "%" },
          { label: "accuracy", value: 0.54 },
          { label: "average time", value: 33, unit: "min" }
        ]
      },
      {
        family: "trend",
        rows: [
          { label: "tests by product day, latest", value: 6 },
          { label: "tests by product day, prior", value: 9 },
          { label: "direction", value: null }
        ]
      }
    ],
    computedAt: "2026-08-23T06:00:00Z"
  }
};
