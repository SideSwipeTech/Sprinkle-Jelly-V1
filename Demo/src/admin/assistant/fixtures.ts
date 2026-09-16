/**
 * fixtures — the WizBit domain's admin fixture state.
 *
 * Every record a screen here reads is local: no store writes, no network.
 *
 * Sources:
 *   companion/01-pages.md §"The five admin destinations" — Identity,
 *     Responses, Nudges and Knowledge base administration under Assistant,
 *     each separately permissioned.
 *   companion/03-rules.md — the five tones, the nine expressions, the
 *     thirteen families and their thirty-nine moment kinds; the copy bounds
 *     COMPANION_FACT_MAX_CHARACTERS 500 / COMPANION_FLOURISH_MAX_CHARACTERS 240.
 *   companion/05-assistance-and-administration.md — the three nudge levers,
 *     the bounds no role may loosen, the evaluation-set preview discipline.
 *   notifications/README.md — the four nudge bounds.
 *   companion/02-records.md — companion_kb_gate: COMPANION_KB_MINIMUM_SCORE,
 *     COMPANION_KB_MINIMUM_MARGIN, with a version record per change.
 */

/* ── Companion identity ───────────────────────────────────────────────────── */

export interface ApprovedArtwork {
  id: string;
  label: string;
  /** Approved animated treatment + still + differentiation + safe fallback —
   *  the four things every expression's artwork owes. */
  coversExpressions: number; // of nine
  /** Fixture flag: this artwork's record cannot be read — choosing it leaves
   *  the previous approved artwork in place. */
  unreadable?: boolean;
}

export const APPROVED_ARTWORK: ApprovedArtwork[] = [
  { id: "spark-default", label: "Spark — the shipped set", coversExpressions: 9 },
  { id: "spark-stills", label: "Spark — stills-first treatment", coversExpressions: 9 },
  { id: "spark-v3-draft", label: "Spark — third treatment (awaiting approval)", coversExpressions: 7, unreadable: true }
];

export interface AccentOption {
  key: string;
  label: string;
  /** Fixture flag: this accent would fail the shared contrast requirement
   *  against one of the five tone colours — refused, naming the failure. */
  failsAgainstTone?: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { key: "default", label: "Theme default" },
  { key: "ember", label: "Ember", failsAgainstTone: "warning" },
  { key: "jade", label: "Jade" },
  { key: "orchid", label: "Orchid" },
  { key: "glacier", label: "Glacier" },
  { key: "azure", label: "Azure" }
];

/* ── Response rules — the closed registry of thirty-nine moment kinds ─────── */

export const TONES = ["neutral", "informational", "encouraging", "warning", "serious"] as const;
export type Tone = (typeof TONES)[number];

export const EXPRESSIONS = [
  "neutral",
  "attentive",
  "thinking",
  "informational",
  "encouraging",
  "warning",
  "serious",
  "success",
  "celebration"
] as const;
export type Expression = (typeof EXPRESSIONS)[number];

export const FACT_MAX = 500; // COMPANION_FACT_MAX_CHARACTERS
export const FLOURISH_MAX = 240; // COMPANION_FLOURISH_MAX_CHARACTERS

export interface ResponseRule {
  fact: string;
  flourish: string;
  tone: Tone;
  expression: Expression;
  celebrates: boolean;
  sticks: boolean;
  /** The values the kind needs — supplied data never overrides the words. */
  values: string[];
}

export interface MomentKind {
  id: string;
  label: string;
  family: string;
  /** The page that really raises it — the coverage view reads this. */
  raisedBy: string;
  rule: ResponseRule;
}

function rule(
  fact: string,
  tone: Tone,
  expression: Expression,
  opts: Partial<Pick<ResponseRule, "flourish" | "celebrates" | "sticks" | "values">> = {}
): ResponseRule {
  return {
    fact,
    flourish: opts.flourish ?? "",
    tone,
    expression,
    celebrates: opts.celebrates ?? false,
    sticks: opts.sticks ?? false,
    values: opts.values ?? []
  };
}

/** The thirty-nine kinds in their thirteen families, in the spec table's
 *  order. Copy here is abbreviated authoring, not the shipped artifact. */
export const MOMENT_KINDS: MomentKind[] = [
  // Durable work
  { id: "work-saved", label: "work saved", family: "Durable work", raisedBy: "every saving surface", rule: rule("Saved.", "neutral", "neutral", { values: ["what"] }) },
  { id: "saved-locally", label: "saved locally", family: "Durable work", raisedBy: "offline-capable saves", rule: rule("Saved on this device — it syncs when the connection does.", "informational", "informational") },
  { id: "conflict", label: "conflict", family: "Durable work", raisedBy: "the save path", rule: rule("This changed somewhere else while you worked — your typed work is held, nothing discarded.", "warning", "attentive", { sticks: true }) },
  { id: "at-risk", label: "at risk", family: "Durable work", raisedBy: "the save path", rule: rule("This could not be saved — copy it somewhere safe before leaving.", "serious", "serious", { sticks: true }) },
  // Actions
  { id: "completed", label: "completed", family: "Actions", raisedBy: "completed durable actions", rule: rule("Done.", "encouraging", "success", { values: ["what"] }) },
  { id: "refused", label: "refused", family: "Actions", raisedBy: "the refusal path", rule: rule("That was refused — nothing changed.", "neutral", "neutral", { values: ["reason"], sticks: true }) },
  { id: "failed-retryable", label: "failed but retryable", family: "Actions", raisedBy: "retryable failures", rule: rule("That did not go through — Retry tries the exact same operation.", "warning", "warning", { sticks: true }) },
  // Execution
  { id: "started", label: "started", family: "Execution", raisedBy: "run pages", rule: rule("Running.", "neutral", "thinking") },
  { id: "stopped", label: "stopped", family: "Execution", raisedBy: "run pages", rule: rule("Stopped — nothing was recorded.", "neutral", "neutral") },
  { id: "succeeded", label: "succeeded", family: "Execution", raisedBy: "run pages", rule: rule("Finished.", "informational", "success") },
  { id: "failed", label: "failed", family: "Execution", raisedBy: "run pages", rule: rule("The run failed — your code is untouched.", "warning", "warning", { sticks: true }) },
  // Practice
  { id: "accepted", label: "accepted", family: "Practice", raisedBy: "solve pages", rule: rule("Accepted.", "encouraging", "success", { celebrates: true }) },
  { id: "not-accepted", label: "not accepted", family: "Practice", raisedBy: "solve pages", rule: rule("Not accepted — the verdict names what failed.", "neutral", "neutral") },
  { id: "hint-revealed", label: "hint revealed", family: "Practice", raisedBy: "solve pages", rule: rule("Hint revealed.", "informational", "informational") },
  { id: "editorial-unlocked", label: "editorial unlocked", family: "Practice", raisedBy: "solve pages", rule: rule("The worked solution is open.", "informational", "informational") },
  // Guidance
  { id: "answer", label: "answer", family: "Guidance", raisedBy: "the door", rule: rule("The knowledge base answered.", "informational", "informational", { values: ["answer"] }) },
  { id: "no-match", label: "no match", family: "Guidance", raisedBy: "the door", rule: rule("I searched and found nothing good enough.", "neutral", "neutral", { values: ["topics"] }) },
  { id: "skills-next-action", label: "skills next action", family: "Guidance", raisedBy: "the one registered nudge producer", rule: rule("Your next step is ready on Skills.", "encouraging", "attentive", { values: ["action"] }) },
  // Learning completion
  { id: "daily-completed", label: "daily completed", family: "Learning completion", raisedBy: "the daily challenge", rule: rule("Daily done.", "encouraging", "celebration", { celebrates: true }) },
  { id: "track-completed", label: "track completed", family: "Learning completion", raisedBy: "Tracks", rule: rule("Track complete.", "encouraging", "celebration", { celebrates: true }) },
  { id: "subject-completed", label: "subject completed", family: "Learning completion", raisedBy: "Courses", rule: rule("Subject complete.", "encouraging", "celebration", { celebrates: true }) },
  { id: "course-completed", label: "course completed", family: "Learning completion", raisedBy: "Courses", rule: rule("Course complete.", "encouraging", "celebration", { celebrates: true }) },
  { id: "solutions-milestone", label: "solutions milestone", family: "Learning completion", raisedBy: "the Solutions archive", rule: rule("A milestone of accepted solutions.", "encouraging", "celebration", { celebrates: true }) },
  // Assessment
  { id: "submitted", label: "submitted", family: "Assessment", raisedBy: "the test runner", rule: rule("Submitted — grading is in progress.", "neutral", "neutral") },
  { id: "auto-submitted", label: "auto-submitted", rule: rule("Submitted for you — the test ended.", "serious", "serious", { values: ["reason"], sticks: true }), family: "Assessment", raisedBy: "the test runner" },
  { id: "grading", label: "grading", family: "Assessment", raisedBy: "the test runner", rule: rule("Grading is in progress.", "neutral", "thinking") },
  { id: "result-ready", label: "result ready", family: "Assessment", raisedBy: "the test runner", rule: rule("Your result is ready.", "informational", "informational") },
  { id: "invalidated", label: "invalidated", family: "Assessment", raisedBy: "the test runner", rule: rule("That sitting was invalidated — the record says why.", "serious", "serious", { sticks: true }) },
  // Content
  { id: "changed-after-use", label: "changed after use", family: "Content", raisedBy: "republished material", rule: rule("This changed since you last saw it.", "neutral", "neutral") },
  // Progress administration
  { id: "progress-reset", label: "progress reset", family: "Progress administration", raisedBy: "Administration", rule: rule("Progress was reset — the scope says what ran and what it left.", "serious", "serious", { values: ["scope"], sticks: true }) },
  // Recognition
  { id: "achievement-unlocked", label: "achievement unlocked", family: "Recognition", raisedBy: "Economy", rule: rule("Achievement unlocked.", "encouraging", "celebration", { celebrates: true, values: ["member"] }) },
  { id: "level-crossed", label: "level crossed", family: "Recognition", raisedBy: "Economy", rule: rule("Level up.", "encouraging", "celebration", { celebrates: true, values: ["level"] }) },
  { id: "streak-milestone", label: "streak milestone", family: "Recognition", raisedBy: "the streak", rule: rule("Streak milestone.", "encouraging", "celebration", { celebrates: true, values: ["days"] }) },
  // Certificate
  { id: "issued", label: "issued", family: "Certificate", raisedBy: "Certificates", rule: rule("Your certificate is issued.", "encouraging", "success", { celebrates: true }) },
  { id: "revoked", label: "revoked", family: "Certificate", raisedBy: "Certificates", rule: rule("A certificate was revoked — the record says why.", "serious", "serious", { sticks: true }) },
  // Availability
  { id: "dependency-unavailable", label: "dependency unavailable", family: "Availability", raisedBy: "affected pages", rule: rule("Part of the platform is unavailable right now — everything deterministic still works.", "warning", "warning", { sticks: true }) },
  { id: "maintenance-active", label: "maintenance active", family: "Availability", raisedBy: "the declared window", rule: rule("A maintenance window is active — the declared message says what it affects.", "informational", "informational", { sticks: true }) },
  // First run
  { id: "tour-step", label: "tour step", family: "First run", raisedBy: "the orientation", rule: rule("A step of the orientation.", "informational", "attentive", { values: ["step"] }) },
  { id: "tour-completed", label: "tour completed", family: "First run", raisedBy: "the orientation", rule: rule("That is the whole tour.", "encouraging", "success") }
];

export const RULE_VERSIONS = [
  { version: 5, at: "18 Aug 2026, 16:20 IST", actor: "S. Rao", kinds: 39, note: "The shipped artifact — every kind covered." },
  { version: 4, at: "02 Aug 2026, 11:44 IST", actor: "S. Rao", kinds: 39, note: "Assessment family re-toned serious." },
  { version: 3, at: "19 Jul 2026, 09:15 IST", actor: "S. Rao", kinds: 38, note: "Before availability gained maintenance active." }
];

/* ── Nudge configuration — three levers, four bounds ──────────────────────── */

export interface NudgePolicy {
  producerOn: boolean;
  /** COMPANION_NUDGE_PER_PRODUCER_DAILY_ALLOWANCE — 1, lowerable to 0. */
  dailyAllowance: number;
  /** COMPANION_NUDGE_COOLDOWN_DAYS — 7, lengthenable to 30. */
  cooldownDays: number;
}

export const NUDGE_POLICY: NudgePolicy = {
  producerOn: true,
  dailyAllowance: 1,
  cooldownDays: 7
};

export const NUDGE_PRODUCER = "Skills next action";
export const NUDGE_ALLOWANCE_RANGE: [number, number] = [0, 1];
export const NUDGE_COOLDOWN_RANGE: [number, number] = [7, 30]; // lengthen only, to COMPANION_NUDGE_COOLDOWN_MAX_DAYS

/** The four bounds no role may loosen — rendered read-only. */
export const NUDGE_BOUNDS = [
  { key: "COMPANION_NUDGE_DAILY_CEILING", value: "2 nudges per learner per product day", fixed: "may never be raised" },
  { key: "COMPANION_NUDGE_PER_PRODUCER_DAILY_ALLOWANCE", value: "1, range 0 to 1", fixed: "lower only" },
  { key: "COMPANION_NUDGE_MINIMUM_GAP_MINUTES", value: "60 minutes between any two nudges", fixed: "may never be shortened" },
  { key: "COMPANION_NUDGE_COOLDOWN_DAYS", value: "7 days, range 7 to 30", fixed: "lengthen only" }
];

/* ── The answering gate — knowledge-base administration ───────────────────── */

export interface GateSetting {
  key: string;
  what: string;
  value: number;
  bound: [number, number];
  step: number;
}

export const GATE_SETTINGS: GateSetting[] = [
  {
    key: "COMPANION_KB_MINIMUM_SCORE",
    what: "The best match's own score, below which no answer returns",
    value: 0.6,
    bound: [0.5, 0.8],
    step: 0.01
  },
  {
    key: "COMPANION_KB_MINIMUM_MARGIN",
    what: "How far the best match must exceed the runner-up",
    value: 0.15,
    bound: [0.05, 0.3],
    step: 0.01
  }
];

/** The labelled evaluation set — private, held and maintained by super
 *  administrators alone. Each probe carries the observed best score and
 *  margin; the preview recomputes the outcome under the proposed settings. */
export interface EvalProbe {
  id: string;
  question: string;
  bestScore: number;
  margin: number;
  entry: string;
}

export const EVALUATION_SET: EvalProbe[] = [
  { id: "probe-01", question: "when do my credits refresh", bestScore: 0.91, margin: 0.42, entry: "How Credits Work — the cycle" },
  { id: "probe-02", question: "can employers see my mock scores", bestScore: 0.84, margin: 0.31, entry: "Assessment privacy" },
  { id: "probe-03", question: "what does coverage mean", bestScore: 0.72, margin: 0.18, entry: "What coverage means" },
  { id: "probe-04", question: "why was my test invalidated", bestScore: 0.66, margin: 0.12, entry: "Integrity events" },
  { id: "probe-05", question: "how do hints cost credits", bestScore: 0.58, margin: 0.09, entry: "Priced assistance" },
  { id: "probe-06", question: "what is a good score on the google mock", bestScore: 0.44, margin: 0.05, entry: "— no entry clears the gate" }
];

export interface GateVersion {
  version: number;
  at: string;
  actor: string;
  score: number;
  margin: number;
  auditRef: string;
}

export const GATE_VERSIONS: GateVersion[] = [
  { version: 3, at: "14 Aug 2026, 10:26 IST", actor: "V. Krishnan", score: 0.6, margin: 0.15, auditRef: "AUD-2026-0855" },
  { version: 2, at: "21 Jun 2026, 15:03 IST", actor: "V. Krishnan", score: 0.62, margin: 0.1, auditRef: "AUD-2026-0512" },
  { version: 1, at: "30 May 2026, 09:00 IST", actor: "V. Krishnan", score: 0.6, margin: 0.08, auditRef: "AUD-2026-0390" }
];
