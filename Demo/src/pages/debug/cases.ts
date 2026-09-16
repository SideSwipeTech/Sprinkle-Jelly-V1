/**
 * Debug learner fixtures — per-case metadata the board and the solver read.
 *
 * Mirrors the studio's authored material (bug types, planted counts, modes,
 * budgets, hint rungs, debriefs) for the learner surface. A "timed" case is
 * timed-then-practice: the timed window opens only on an explicit Start,
 * spends one allowance, and practice stays open after it ends. The reference
 * fix never reaches the learner — the debrief unlocks on acceptance.
 */

import type { Difficulty } from "@data/catalog";
import type { HintRung } from "../../extraction/components/HintLadder/HintLadder";
import type { EditorLanguage } from "../practice/data";

export interface DebugCaseMeta {
  /** The editor language of the case's one file. */
  language: EditorLanguage;
  languageLabel: string;
  bugTypes: string[];
  bugCount: number;
  /** "timed" = timed-then-practice; "practice" = practice-only. */
  mode: "practice" | "timed";
  timedMinutes: number | null;
  /** Timed windows the learner may open on this case. */
  timedAllowance: number | null;
  visible: { input: string; expected: string }[];
  hiddenCount: number;
  /** The authored buggy program — the solver's starting code, read as its file. */
  broken: string;
  hints: HintRung[];
  /** The published debrief — unlocks on acceptance, never before. */
  debrief: {
    rootCause: string;
    whyFails: string;
    repair: string;
    edgeCase: string;
    corrected: string;
    note: string;
  } | null;
}

export const DEBUG_CASE_META: Record<string, DebugCaseMeta> = {
  "window-overrun": {
    language: "python",
    languageLabel: "Python 3",
    bugTypes: ["off-by-one"],
    bugCount: 1,
    mode: "timed",
    timedMinutes: 15,
    timedAllowance: 2,
    visible: [{ input: "[1, 3, -1, -3, 5] · 3", expected: "[3, 3, 5]" }],
    hiddenCount: 1,
    broken:
      "def window_max(nums, k):\n    out = []\n    for start in range(len(nums) - k + 1):\n        end = start + k\n        out.append(max(nums[start:end + 1]))  # bug lives here\n    return out\n",
    hints: [
      { title: "Rung 1: Where to look", content: "The bug sits in the loop bound, not the sum." },
      { title: "Rung 2: The repair", content: "Compare the slice end against `end`, not `end + 1`." }
    ],
    debrief: {
      rootCause: "The slice end is inclusive by one — `end + 1` pulls the next window's head in.",
      whyFails: "Each window's max can read one element too far right, so early windows report a later value.",
      repair: "Slice to the exclusive bound `end`, matching the loop's arithmetic.",
      edgeCase: "k = 1 — the overrun still reads a neighbour on every window but the last.",
      corrected: "out.append(max(nums[start:end]))",
      note: "Runs in O(n·k); the deque form is the stretch, not the fix."
    }
  },
  "closed-over-loop": {
    language: "javascript",
    languageLabel: "JavaScript (ES6)",
    bugTypes: ["state"],
    bugCount: 1,
    mode: "practice",
    timedMinutes: null,
    timedAllowance: null,
    visible: [{ input: "—", expected: "[0, 1, 2]" }],
    hiddenCount: 1,
    broken:
      "const handlers = [];\nfor (var i = 0; i < 3; i++) {\n  handlers.push(() => i);\n}\nconsole.log(handlers.map((f) => f()));\n",
    hints: [
      { title: "Rung 1: The tell", content: "All handlers fire the final value, whatever index they were made at." }
    ],
    debrief: {
      rootCause: "`var` binds once per function — every closure shares the final `i`.",
      whyFails: "By the time the handlers run, the loop has ended and `i` is 3 for all of them.",
      repair: "`let` binds per iteration, so each closure keeps its own index.",
      edgeCase: "A zero-iteration loop leaves no handlers — still correct.",
      corrected: "for (let i = 0; i < 3; i++)",
      note: ""
    }
  },
  "mutable-default-arg": {
    language: "python",
    languageLabel: "Python 3",
    bugTypes: ["state"],
    bugCount: 1,
    mode: "timed",
    timedMinutes: 12,
    timedAllowance: 2,
    visible: [{ input: "collect(1); collect(2)", expected: "[1] then [2]" }],
    hiddenCount: 1,
    broken:
      "def collect(item, bag=[]):\n    bag.append(item)\n    return bag\n",
    hints: [
      { title: "Rung 1: The leak", content: "The default argument is evaluated once — the same list serves every call that omits it." },
      { title: "Rung 2: The repair", content: "Default to `None`, then create the list inside the body." }
    ],
    debrief: {
      rootCause: "Default arguments evaluate once at definition time.",
      whyFails: "Items appended in earlier calls reappear in later ones — the default is shared state.",
      repair: "`def collect(item, bag=None):` then `bag = bag or []`.",
      edgeCase: "Passing a list explicitly never sees the leak.",
      corrected: "def collect(item, bag=None):",
      note: ""
    }
  },
  "async-race-condition": {
    language: "javascript",
    languageLabel: "JavaScript (ES6)",
    bugTypes: ["logic", "resource"],
    bugCount: 1,
    mode: "practice",
    timedMinutes: null,
    timedAllowance: null,
    visible: [{ input: "two overlapping calls", expected: "the last write wins" }],
    hiddenCount: 1,
    broken:
      "let latest = null;\nasync function load(id) {\n  const data = await fetchItem(id);\n  latest = data;            // bug lives here\n  return latest;\n}\n",
    hints: [
      { title: "Rung 1: The race", content: "Two in-flight calls resolve out of order — whichever lands last overwrites `latest`, not the one that should." },
      { title: "Rung 2: The guard", content: "Stamp each call with a sequence number; only write when yours is still the newest." }
    ],
    debrief: {
      rootCause: "The write is unconditional — a slower earlier call wins over the newest one.",
      whyFails: "The second call starts later but the first's resolve can land after it, leaving stale data.",
      repair: "Track a monotonically increasing call id and write only when it matches.",
      edgeCase: "A single call never races — the bug needs overlap.",
      corrected: "if (seq === latestSeq) latest = data;",
      note: "A token/cancellation design is the general fix."
    }
  }
};

export function debugMetaFor(id: string): DebugCaseMeta | null {
  return DEBUG_CASE_META[id] ?? null;
}

/** XP a fix pays on first acceptance — the same difficulty award table. */
export function debugXp(difficulty: Difficulty): number {
  return { Easy: 20, Medium: 40, Hard: 80 }[difficulty] ?? 40;
}
