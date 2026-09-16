/**
 * The page guide (AST-R15) and the surface presence levels (AST-R7).
 *
 * A surface registers a greeting, ordered tips and an optional hint slot;
 * activating the companion presents the next item and then wraps, identically
 * every time, resetting when the surface changes. A surface registering nothing
 * gets the default greeting. Context is held only while the surface is on
 * screen and never stored.
 *
 * In the product each surface's own specification declares these. The
 * prototype keeps one registry keyed on route patterns so the shape of the
 * contract is visible; the words are prototype copy, not the authored artifact.
 */

export type Presence = "present" | "quiet" | "suppressed";

export interface GuideItem { kind: "greeting" | "tip" | "hint"; text: string; }

export interface SurfaceGuide {
  /** Route pattern: a prefix, or a regex for parameterised routes. */
  match: string | RegExp;
  presence?: Presence;
  greeting?: string;
  tips?: string[];
  /** A pointer to the owning surface's hint — content, availability and cost are that surface's, never this one's (AST-R16). */
  hint?: string;
  /** Suggested question chips for the door (AST-R18). */
  chips?: string[];
}

export const DEFAULT_GREETING = "I can point out what is on this page. Activate me again for the next tip.";

export const GUIDES: SurfaceGuide[] = [
  // ── Suppressed: sealed sittings and the pre-sitting check (AST-R11 — begins before the sitting) ──
  { match: /^\/(mock|company)\/[^/]+\/(sitting|start)$/, presence: "suppressed" },

  // ── Quiet: open practice is unsealed but is still a workbench ──
  {
    match: /^\/(mock|company)\/[^/]+\/practice$/,
    presence: "quiet",
    greeting: "Unsealed practice — nothing here is recorded or measured.",
    tips: ["The run's figures are transient: they land nowhere and change no record."]
  },

  // ── Quiet: the solve workbenches, Code Lab, the workspace (AST-R7) ──
  {
    match: /^\/challenges\/(?!dashboard$|random$|history$)[^/]+$/, presence: "quiet",
    greeting: "A solve surface. I only answer when asked here — no celebrations, nothing volunteered.",
    tips: ["Read the constraints before the examples; the invariant usually hides in a bound.", "Run with a custom input first. Submit only judges the visible tests."],
    hint: "Hints live on this page, in the ladder beside the brief. Revealing one costs nothing and I own none of them.",
    chips: ["How do hints work?", "What does accepted mean?"]
  },
  { match: "/codelab", presence: "quiet", greeting: "The sandbox. Nothing here is measured — runs are yours to throw away.", tips: ["Files on the left, output on the right. Ctrl+Enter runs.", "Pick a runtime starter to reset the buffer."], chips: ["Is Code Lab graded?"] },
  { match: /^\/projects\/[^/]+$/, presence: "quiet", greeting: "Your workspace. Saves go to this device's buffer.", tips: ["The file tree supports at most 40 files.", "Run writes to the output pane; it never changes your files."] },
  { match: /^\/debug\/[^/]+$/, presence: "quiet", greeting: "A debug case. Find the defect, then Validate Fix.", tips: ["The failing test names the symptom, not the cause."] },
  { match: /^\/daily\/(solve|[^/]+)$/, presence: "quiet", greeting: "Today's Daily. One accepted solve keeps the streak.", tips: ["Missed days are simply absent from the archive — never zeros."] },

  // ── Present surfaces ──
  { match: "/", greeting: "Welcome back. Continue is the card at the top; the smallest unfinished item is usually the next useful step.", tips: ["The rail on the left is the whole product. Nothing is hidden anywhere else.", "Settings holds the presentation choice — me, or plain messages. Either way you get the same facts."], chips: ["Where should I go next?", "How is my progress measured?"] },
  { match: "/courses", greeting: "Courses. Interactive and video families sit on separate tabs.", tips: ["A course hub shows the outline and your position in it.", "Lesson notes save on this device."], chips: ["What does coverage mean?"] },
  { match: "/skills", greeting: "Skills. Every figure here is evidence-backed and says when it was computed.", tips: ["Needs practice · developing · strong are observations, never verdicts about you."], chips: ["How is my progress measured?"] },
  { match: "/challenges", greeting: "The challenge catalogue. Filters narrow; tracks group.", tips: ["Random picks from what you have not solved."] },
  { match: "/assessments", greeting: "Assessments. Mock results are private; company papers never produce pass or fail.", tips: ["During a sitting I am silent and the platform refuses every assistant-adjacent request — that is the rule, not a setting."], chips: ["Are assessment results private?"] },
  { match: "/projects", greeting: "Projects. Start from a template or a blank workspace.", tips: ["Each project keeps its own file buffer on this device."] },
  { match: "/settings", greeting: "Settings. My presentation and volume live here, and you can rename me — Reset brings back WizBit.", tips: ["Plain messages carry the same facts as I do, without the character."] },
  { match: "/daily", greeting: "Daily Challenges. The archive lists only days that happened.", tips: ["Streaks count product days on the platform clock."] },
  { match: "/solutions", greeting: "Your solutions archive — only your own accepted entries.", tips: ["Editorials unlock on acceptance."] },
  { match: "/notifications", greeting: "Your inbox. These are durable; what I show is not.", tips: ["A message from me never replaces an inbox item."] }
];

export function findGuide(pathname: string): SurfaceGuide | null {
  for (const g of GUIDES) {
    if (g.match instanceof RegExp ? g.match.test(pathname) : g.match === "/" ? pathname === "/" : pathname.startsWith(g.match)) return g;
  }
  return null;
}

export function presenceFor(pathname: string): Presence {
  return findGuide(pathname)?.presence ?? "present";
}

/** The registered sequence for a surface: greeting → tips → hint slot. Empty array = activation does nothing. */
export function sequenceFor(pathname: string): GuideItem[] {
  const g = findGuide(pathname);
  if (!g || (!g.greeting && !g.tips && !g.hint)) return [{ kind: "greeting", text: DEFAULT_GREETING }];
  const items: GuideItem[] = [];
  if (g.greeting) items.push({ kind: "greeting", text: g.greeting });
  for (const t of g.tips ?? []) items.push({ kind: "tip", text: t });
  if (g.hint) items.push({ kind: "hint", text: g.hint });
  return items;
}

export function chipsFor(pathname: string): string[] {
  return findGuide(pathname)?.chips ?? ["Where should I go next?", "How is my progress measured?"];
}

/**
 * Guidance intents (AST-R17): where to go next · a progress figure with its
 * freshness · an observation. Matched first; everything else falls through to
 * the knowledge base. Each answer reads from the producing surface — here the
 * store's own figures — and invents no figure.
 */
export interface GuidanceAnswer { text: string; to?: string; toLabel?: string; }
export function guidanceFor(question: string, ctx: { continueLabel: string | null; continueTo: string | null; streak: number; solved: number; asOf: string }): GuidanceAnswer | null {
  const q = question.toLowerCase();
  if (/where.*(next|go)|what.*next|next step/.test(q)) {
    if (ctx.continueTo) return { text: `Continue is waiting: ${ctx.continueLabel}.`, to: ctx.continueTo, toLabel: "Open it" };
    return { text: "Nothing is in progress. Courses is a good first door.", to: "/courses", toLabel: "Open Courses" };
  }
  if (/progress|measured|streak|solved|how am i/.test(q)) {
    return { text: `On this device: ${ctx.solved} accepted solves and a ${ctx.streak}-day streak, as of ${ctx.asOf}. These are observations read from your own record — not a verdict.`, to: "/skills", toLabel: "Open Skills" };
  }
  return null;
}
