/**
 * The thirty-nine moment kinds — AST-R36's closed registry, read here and
 * nowhere else. Each kind carries one tone (of five), one expression (of nine),
 * a display class that decides its duration (AST-R3), whether it sticks and
 * whether it celebrates.
 *
 * The per-kind words are T3-01's artifact: one author, one artifact, delivered
 * with the companion's content set. This prototype carries demo copy only for
 * the kinds its click-throughs actually raise; every other kind has `fact: null`
 * and renders the generic fallback so nobody mistakes placeholder prose for the
 * authored artifact. A kind with no fact cannot be published (AST-R4) — the
 * fallback here is the prototype being honest, not the product's behaviour.
 */

export type Tone = "neutral" | "informational" | "encouraging" | "warning" | "serious";
export type Expression = "neutral" | "attentive" | "thinking" | "informational" | "encouraging" | "success" | "celebration" | "warning" | "serious";
/** AST-R3's notice classes — the timing axis. `success` here is a display class, never a tone. */
export type DisplayClass = "informational" | "success" | "warning" | "error" | "ack";

export interface MomentKind {
  family: string;
  tone: Tone;
  expression: Expression;
  cls: DisplayClass;
  sticks: boolean;
  celebrates: boolean;
  /** Required fact template; `{name}` style values are substituted. null = not authored in this prototype. */
  fact: string | null;
  /** Optional flourish, companion presentation only. */
  flourish?: string;
  /** Values the kind needs, by name (for the coverage view). */
  values?: string[];
}

const K = (family: string, tone: Tone, expression: Expression, cls: DisplayClass, extra: Partial<MomentKind> = {}): MomentKind => ({
  family, tone, expression, cls, sticks: cls === "error" || cls === "ack", celebrates: false, fact: null, ...extra
});

export const MOMENT_KINDS: Record<string, MomentKind> = {
  // Durable work
  "work saved":            K("Durable work", "neutral", "neutral", "success"),
  "saved locally":         K("Durable work", "informational", "informational", "informational", { fact: "Saved on this device only. It will not follow you to another one.", values: ["what"] }),
  "conflict":              K("Durable work", "warning", "warning", "ack"),
  "at risk":               K("Durable work", "serious", "serious", "ack"),
  // Actions
  "completed":             K("Actions", "encouraging", "success", "success", { fact: "{what} is marked complete.", flourish: "On to the next one." , values: ["what"] }),
  "refused":               K("Actions", "serious", "serious", "error"),
  "failed but retryable":  K("Actions", "encouraging", "encouraging", "error", { fact: "That did not go through. Nothing was lost — Retry runs the same step again.", flourish: "Happens to the best of us." }),
  // Execution
  "started":               K("Execution", "informational", "thinking", "informational"),
  "stopped":               K("Execution", "neutral", "neutral", "informational"),
  "succeeded":             K("Execution", "encouraging", "success", "success", { fact: "Your run finished with exit code 0.", flourish: "Clean exit.", values: ["runtime"] }),
  "failed":                K("Execution", "encouraging", "encouraging", "error", { fact: "Your run stopped with an error. The output panel has the line.", flourish: "Read it top-down — the first error is usually the real one." }),
  // Practice
  "accepted":              K("Practice", "encouraging", "success", "success", { fact: "{title}: accepted. Every visible test passed.", flourish: "That is a solved one.", values: ["title"] }),
  "not accepted":          K("Practice", "encouraging", "encouraging", "warning", { fact: "{title}: not accepted yet. The visible tests that failed are listed on this page.", values: ["title"] }),
  "hint revealed":         K("Practice", "informational", "informational", "informational", { fact: "Hint {rung} is open on this page. Hints cost nothing.", values: ["rung"] }),
  "editorial unlocked":    K("Practice", "informational", "informational", "success"),
  // Guidance
  "answer":                K("Guidance", "neutral", "attentive", "informational"),
  "no match":              K("Guidance", "neutral", "thinking", "informational"),
  "skills next action":    K("Guidance", "encouraging", "encouraging", "informational", { fact: "Your recent {skill} evidence suggests practising {topic} next. Open the recommended challenge?", values: ["skill", "topic"] }),
  // Learning completion
  "daily completed":       K("Learning completion", "encouraging", "celebration", "success", { celebrates: true, fact: "Today's Daily is done.", flourish: "Same time tomorrow." }),
  "track completed":       K("Learning completion", "encouraging", "celebration", "success", { celebrates: true }),
  "subject completed":     K("Learning completion", "encouraging", "celebration", "success", { celebrates: true }),
  "course completed":      K("Learning completion", "encouraging", "celebration", "success", { celebrates: true, fact: "{course} is complete — every lesson marked.", flourish: "Whole thing. Nicely done.", values: ["course"] }),
  "solutions milestone":   K("Learning completion", "encouraging", "celebration", "success", { celebrates: true }),
  // Assessment
  "submitted":             K("Assessment", "neutral", "neutral", "informational", { fact: "Your paper is submitted." }),
  "auto-submitted":        K("Assessment", "serious", "serious", "ack", { values: ["reason"] }),
  "grading":               K("Assessment", "informational", "thinking", "informational"),
  "result ready":          K("Assessment", "neutral", "attentive", "informational", { fact: "Your result is ready on this page. It is yours alone — nothing here is shared.", values: ["paper"] }),
  "invalidated":           K("Assessment", "serious", "serious", "ack"),
  // Content
  "changed after use":     K("Content", "warning", "warning", "ack"),
  // Progress administration
  "progress reset":        K("Progress administration", "serious", "serious", "ack"),
  // Recognition
  "achievement unlocked":  K("Recognition", "encouraging", "celebration", "success", { celebrates: true, fact: "Achievement unlocked: {name}.", values: ["name"] }),
  "level crossed":         K("Recognition", "encouraging", "celebration", "success", { celebrates: true, fact: "Level {level}.", flourish: "That is a new level.", values: ["level"] }),
  "streak milestone":      K("Recognition", "encouraging", "celebration", "success", { celebrates: true, values: ["days"] }),
  // Certificate
  "issued":                K("Certificate", "encouraging", "success", "success"),
  "revoked":               K("Certificate", "serious", "serious", "ack"),
  // Availability
  "dependency unavailable": K("Availability", "warning", "warning", "warning"),
  "maintenance active":    K("Availability", "warning", "warning", "ack"),
  // First run
  "tour step":             K("First run", "informational", "attentive", "informational"),
  "tour completed":        K("First run", "encouraging", "success", "success")
};

export const MOMENT_KIND_COUNT = Object.keys(MOMENT_KINDS).length; // 39

/** The generic fact rendered for a kind with no authored copy (AST-R5: never a blank, never a placeholder token). */
export const GENERIC_FACT = "Something just happened here; the surface you are on has the detail.";

/** Fill `{name}` slots; a missing value falls back to the bare slot name in plain words rather than a placeholder token. */
export function compose(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = values[key];
    return v === undefined || v === null ? `the ${key}` : String(v);
  });
}

/** AST-R3 durations by display class, in milliseconds. Error and ack have none — they stick. */
export const DURATIONS: Record<DisplayClass, number | null> = {
  informational: 8000,
  success: 6000,
  warning: 12000,
  error: null,
  ack: null
};
export const MIN_VISIBLE_MS = 2500;   // no manual advance before this
export const QUEUE_LIMIT = 5;         // waiting behind the one on screen
