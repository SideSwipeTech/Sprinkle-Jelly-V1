/**
 * Practice studio fixtures — the authored material behind the three editors.
 *
 * Rows the demo store already holds (adminChallenges, adminDebugCases,
 * adminDailyGap) resolve over these: the store owns title/lifecycle/revision,
 * the fixture owns the draft body, the checklist and the domain extras. An id
 * the store holds but no fixture fleshes out gets a scaffold draft — the
 * space's honest empty surfaces do the talking. "new" is the create flow.
 */

import type { Store } from "@state/store";
import {
  emptyPracticeDraft,
  type PracticeChecklistItem,
  type PracticeDraft,
  type PracticeLifecycle
} from "../../extraction/components/PracticeEditorSpace/PracticeEditorSpace";
import type { ScheduleStatus } from "../../extraction/components/SchedulingCard/SchedulingCard";
import type { HintRung } from "../../extraction/components/HintLadder/HintLadder";

/** The award difficulty resolves — a display fixture, never an authored field. */
export const XP_BY_DIFFICULTY = { easy: 20, medium: 40, hard: 80, extreme: 120 } as const;

/* ── Shared checklist (challenges 04-authoring: the gate's conditions) ────── */

const GATE_CHECKLIST: PracticeChecklistItem[] = [
  { key: "statement", label: "Non-empty title and statement with structured input and output descriptions and constraints", met: true },
  { key: "cases", label: "At least one visible case and at least one hidden case, each with an expected output", met: true },
  { key: "policy", label: "An explicit comparison policy", met: true },
  { key: "limits", label: "Time and memory limits valid within the platform's execution bounds", met: true },
  { key: "starter", label: "Per offered language: a learner-visible starter that does not already pass", met: true },
  { key: "reference", label: "Per offered language: a reference solution that passes every case, validated by execution", met: true }
];

/* ── Challenges ──────────────────────────────────────────────────────────── */

export interface ChallengeFixture {
  id: string;
  lifecycle: PracticeLifecycle;
  revision: number;
  /** The resolved award — read-only in the space, never authored. */
  xp: number | null;
  checklist: PracticeChecklistItem[];
  draft: PracticeDraft;
}

const CHALLENGE_FIXTURES: Record<string, ChallengeFixture> = {
  "two-sum": {
    id: "two-sum",
    lifecycle: "published",
    revision: 5,
    xp: 20,
    checklist: GATE_CHECKLIST,
    draft: {
      title: "Two Sum",
      difficulty: "easy",
      topics: "arrays, hashing",
      statement: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.",
      inputDescription: "First line: `nums` as a JSON array. Second line: `target`.",
      outputDescription: "The two indices as a JSON array, ascending.",
      constraints: "2 ≤ nums.length ≤ 10⁴\nExactly one valid answer exists.",
      interfaceKind: "console",
      comparisonPolicy: "console-default",
      tolerance: "",
      timeLimit: "",
      memoryLimit: "",
      editorial: "Maintain a value-to-index map during a single linear sweep. Look for target - current.",
      languages: [
        {
          key: "python",
          label: "Python 3",
          language: "python",
          starter: "def two_sum(nums, target):\n    # your solution here\n    return []\n",
          reference:
            "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n"
        },
        {
          key: "javascript",
          label: "JavaScript (ES6)",
          language: "javascript",
          starter: "function twoSum(nums, target) {\n  // your solution here\n  return [];\n}\n",
          reference:
            "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n"
        }
      ],
      cases: [
        { key: "c1", visibility: "visible", input: "[2, 7, 11, 15] · 9", expected: "[0, 1]" },
        { key: "c2", visibility: "visible", input: "[3, 2, 4] · 6", expected: "[1, 2]" },
        { key: "c3", visibility: "hidden", input: "[3, 3] · 6", expected: "[0, 1]" }
      ]
    }
  },
  "balanced-brackets": {
    id: "balanced-brackets",
    lifecycle: "published",
    revision: 4,
    xp: 40,
    checklist: GATE_CHECKLIST,
    draft: {
      title: "Balanced Brackets",
      difficulty: "medium",
      topics: "stacks, strings",
      statement: "Given a string of brackets, decide whether every closer matches the most recent unmatched opener.",
      inputDescription: "A single line holding the bracket string `s`.",
      outputDescription: "`true` when balanced, `false` otherwise.",
      constraints: "1 ≤ s.length ≤ 10⁵\ns carries only ( ) [ ] { }",
      interfaceKind: "console",
      comparisonPolicy: "console-default",
      tolerance: "",
      timeLimit: "",
      memoryLimit: "128",
      editorial: "A linear stack pass. Push openers; a closer must match the most recent unmatched opener.",
      languages: [
        {
          key: "python",
          label: "Python 3",
          language: "python",
          starter: "def is_balanced(s: str) -> bool:\n    # your solution here\n    return False\n",
          reference:
            "def is_balanced(s: str) -> bool:\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for ch in s:\n        if ch in '([{':\n            stack.append(ch)\n        elif not stack or stack.pop() != pairs[ch]:\n            return False\n    return not stack\n"
        }
      ],
      cases: [
        { key: "c1", visibility: "visible", input: "([]){}", expected: "true" },
        { key: "c2", visibility: "hidden", input: "([)]", expected: "false" }
      ]
    }
  },
  "anagram-groups": {
    id: "anagram-groups",
    lifecycle: "draft",
    revision: 2,
    xp: 40,
    checklist: GATE_CHECKLIST.map((item) =>
      item.key === "cases" || item.key === "reference" ? { ...item, met: false } : item
    ),
    draft: {
      title: "Group Anagrams",
      difficulty: "medium",
      topics: "strings, hashing",
      statement: "Group the words that are anagrams of one another.",
      inputDescription: "A JSON array of lowercase words.",
      outputDescription: "An array of groups, each a JSON array.",
      constraints: "1 ≤ words.length ≤ 10⁴",
      interfaceKind: "console",
      comparisonPolicy: "console-default",
      tolerance: "",
      timeLimit: "",
      memoryLimit: "",
      editorial: "",
      languages: [
        {
          key: "python",
          label: "Python 3",
          language: "python",
          starter: "def group_anagrams(words):\n    # your solution here\n    return []\n",
          reference: ""
        }
      ],
      cases: [{ key: "c1", visibility: "visible", input: '["eat","tea","tan"]', expected: '[["eat","tea"],["tan"]]' }]
    }
  }
};

export function resolveChallenge(
  id: string,
  store: Store,
  extraRows?: readonly { challengeId: string; title: string; lifecycle: string | null; difficulty: string }[]
): ChallengeFixture | null {
  if (id === "new") {
    return { id, lifecycle: "draft", revision: 0, xp: null, checklist: [], draft: emptyPracticeDraft() };
  }
  const row = store.adminChallenges.find((c) => c.id === id);
  const fixture = CHALLENGE_FIXTURES[id];
  if (fixture) {
    return row ? { ...fixture, lifecycle: row.lifecycle, revision: row.revision, draft: { ...fixture.draft, title: row.title } } : fixture;
  }
  if (row) {
    const draft = { ...emptyPracticeDraft(), title: row.title };
    return { id, lifecycle: row.lifecycle, revision: row.revision, xp: null, checklist: [], draft };
  }
  // Track-owned entries (challenges/fixtures.ts) never join the catalogue
  // rows — resolve them to a sparse draft so a track entry's Open lands on a
  // real editor, not an "unavailable" for a challenge the track itself lists.
  const entry = extraRows?.find((r) => r.challengeId === id);
  if (entry) {
    const draft = {
      ...emptyPracticeDraft(),
      title: entry.title,
      difficulty: (["easy", "medium", "hard", "extreme"] as const).find((d) => d === entry.difficulty) ?? "medium"
    };
    const life: ChallengeFixture["lifecycle"] =
      entry.lifecycle === "published" || entry.lifecycle === "submitted" || entry.lifecycle === "archived" ? entry.lifecycle : "draft";
    return { id, lifecycle: life, revision: 0, xp: null, checklist: [], draft };
  }
  return null;
}

/* ── Daily ───────────────────────────────────────────────────────────────── */

export interface DailyFixture {
  /** ISO product date the route carries. */
  date: string;
  status: ScheduleStatus;
  occupyingTitle?: string;
  occupyingDate?: string;
  /** Inside the health window, an empty date is schedule risk. */
  isGap: boolean;
  /** The authored bonus — one of the two authorable fields this domain adds. */
  bonus: string;
  checklist: PracticeChecklistItem[];
  draft: PracticeDraft;
}

const DAILY_FIXTURES: Record<string, DailyFixture> = {
  "2026-08-20": {
    date: "2026-08-20",
    status: "scheduled",
    isGap: false,
    bonus: "25",
    checklist: GATE_CHECKLIST,
    draft: CHALLENGE_FIXTURES["two-sum"]!.draft
  },
  "2026-08-21": {
    date: "2026-08-21",
    status: "scheduled",
    isGap: false,
    bonus: "",
    checklist: GATE_CHECKLIST,
    draft: CHALLENGE_FIXTURES["balanced-brackets"]!.draft
  },
  "2026-08-22": {
    date: "2026-08-22",
    status: "empty",
    isGap: true,
    bonus: "",
    checklist: [],
    draft: emptyPracticeDraft()
  }
};

/** The store's gap date is a display string ("22 Aug 2026"); parse to ISO. */
function gapIso(store: Store): string | null {
  const d = new Date(store.adminDailyGap);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function resolveDaily(
  date: string,
  store: Store,
  occupants?: readonly { id: string; title: string; difficulty: string; bonus: number | null }[]
): DailyFixture | null {
  const gap = gapIso(store);
  if (date === "new") {
    return { date: "", status: "unscheduled", isGap: false, bonus: "", checklist: [], draft: emptyPracticeDraft() };
  }
  const fixture = DAILY_FIXTURES[date];
  if (fixture) return { ...fixture, isGap: fixture.status === "empty" && gap === date };
  // A scheduled date whose content is not a named fixture still opens on its
  // occupant's authored material (or a sparse draft titled for it) — the
  // calendar listed it as occupied, so the editor must not read "nothing
  // authored".
  const occ = occupants?.[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(date) && occ) {
    const base = CHALLENGE_FIXTURES[occ.id]?.draft ?? { ...emptyPracticeDraft(), title: occ.title };
    return {
      date,
      status: "scheduled",
      isGap: false,
      bonus: occ.bonus === null ? "" : String(occ.bonus),
      checklist: GATE_CHECKLIST,
      draft: { ...base, difficulty: (["easy", "medium", "hard", "extreme"] as const).find((d) => d === occ.difficulty) ?? base.difficulty }
    };
  }
  // A date with nothing authored is an empty slot, not an error — the
  // calendar's affordance to fill it lands here.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { date, status: "empty", isGap: gap === date, bonus: "", checklist: [], draft: emptyPracticeDraft() };
  }
  return null;
}

/* ── Debug cases ─────────────────────────────────────────────────────────── */

export interface DebugDebrief {
  rootCause: string;
  whyFails: string;
  repair: string;
  edgeCase: string;
  corrected: string;
  note: string;
}

export interface DebugFixture {
  id: string;
  lifecycle: string;
  draft: PracticeDraft;
  bugCount: string;
  bugTypes: string;
  primarySkill: string;
  internalNote: string;
  mode: "practice" | "timed";
  timedMinutes: string;
  timedAllowance: string;
  /** One debrief per offered language — all required to publish. */
  debriefs: Record<string, DebugDebrief>;
  rungs: HintRung[];
  checklist: PracticeChecklistItem[];
}

const EMPTY_DEBRIEF: DebugDebrief = { rootCause: "", whyFails: "", repair: "", edgeCase: "", corrected: "", note: "" };

const DEBUG_GATE: PracticeChecklistItem[] = [
  { key: "statement", label: "Title and description, a difficulty, a primary skill and a classification", met: true },
  { key: "bugs", label: "At least one bug type from the curated vocabulary, with the authored planted-bug count", met: true },
  { key: "sides", label: "Per offered language: the buggy program observed failing and the reference fix observed passing", met: true },
  { key: "distinct", label: "Starter and reference materially different — an identical pair is refused", met: true },
  { key: "cases", label: "At least one visible sample and one hidden case, each with an expected output", met: true },
  { key: "debrief", label: "A published debrief for every language the case offers", met: true },
  { key: "timed", label: "Valid timed duration and allowance on a timed case", met: true }
];

const DEBUG_FIXTURES: Record<string, DebugFixture> = {
  "window-overrun": {
    id: "window-overrun",
    lifecycle: "published",
    bugCount: "1",
    bugTypes: "off-by-one",
    primarySkill: "arrays",
    internalNote: "The window's right edge runs one past the slice end — the classic overrun.",
    mode: "timed",
    timedMinutes: "15",
    timedAllowance: "2",
    rungs: [
      { title: "Rung 1: Where to look", content: "The bug sits in the loop bound, not the sum." },
      { title: "Rung 2: The repair", content: "Compare the slice end against `end`, not `end + 1`." }
    ],
    checklist: DEBUG_GATE,
    draft: {
      title: "Off-by-one in a Sliding Window",
      difficulty: "medium",
      topics: "arrays, windows",
      statement: "The running-max window overruns by one index — find the planted bug and repair the bound.",
      inputDescription: "`nums` then `k`, the window size.",
      outputDescription: "The per-window maximum list.",
      constraints: "1 ≤ k ≤ nums.length",
      interfaceKind: "console",
      comparisonPolicy: "console-default",
      tolerance: "",
      timeLimit: "",
      memoryLimit: "",
      editorial: "",
      languages: [
        {
          key: "python",
          label: "Python 3",
          language: "python",
          starter:
            "def window_max(nums, k):\n    out = []\n    for start in range(len(nums) - k + 1):\n        end = start + k\n        out.append(max(nums[start:end + 1]))  # bug lives here\n    return out\n",
          reference:
            "def window_max(nums, k):\n    out = []\n    for start in range(len(nums) - k + 1):\n        end = start + k\n        out.append(max(nums[start:end]))\n    return out\n"
        }
      ],
      cases: [
        { key: "c1", visibility: "visible", input: "[1, 3, -1, -3, 5] · 3", expected: "[3, 3, 5]" },
        { key: "c2", visibility: "hidden", input: "[9, 8, 7] · 1", expected: "[9, 8, 7]" }
      ]
    },
    debriefs: {
      python: {
        rootCause: "The slice end is inclusive by one — `end + 1` pulls the next window's head in.",
        whyFails: "Each window's max can read one element too far right, so early windows report a later value.",
        repair: "Slice to the exclusive bound `end`, matching the loop's arithmetic.",
        edgeCase: "k = 1 — the overrun still reads a neighbour on every window but the last.",
        corrected: "out.append(max(nums[start:end]))",
        note: "Runs in O(n·k); the deque form is the stretch, not the fix."
      }
    }
  },
  "closed-over-loop": {
    id: "closed-over-loop",
    lifecycle: "published",
    bugCount: "1",
    bugTypes: "state",
    primarySkill: "closures",
    internalNote: "Every handler closes over the same loop variable — all report the last value.",
    mode: "practice",
    timedMinutes: "",
    timedAllowance: "",
    rungs: [{ title: "Rung 1: The tell", content: "All handlers fire the final value, whatever index they were made at." }],
    checklist: DEBUG_GATE.map((item) => (item.key === "timed" ? { ...item, met: null } : item)),
    draft: {
      title: "Closed-over Loop Variable",
      difficulty: "easy",
      topics: "closures, events",
      statement: "The button handlers all announce the last index — repair the closure.",
      inputDescription: "No input — the program builds handlers.",
      outputDescription: "Each handler's own index, in order.",
      constraints: "Three handlers.",
      interfaceKind: "console",
      comparisonPolicy: "console-default",
      tolerance: "",
      timeLimit: "",
      memoryLimit: "",
      editorial: "",
      languages: [
        {
          key: "javascript",
          label: "JavaScript (ES6)",
          language: "javascript",
          starter:
            "const handlers = [];\nfor (var i = 0; i < 3; i++) {\n  handlers.push(() => i);\n}\nconsole.log(handlers.map((f) => f()));\n",
          reference:
            "const handlers = [];\nfor (let i = 0; i < 3; i++) {\n  handlers.push(() => i);\n}\nconsole.log(handlers.map((f) => f()));\n"
        }
      ],
      cases: [
        { key: "c1", visibility: "visible", input: "—", expected: "[0, 1, 2]" },
        { key: "c2", visibility: "hidden", input: "—", expected: "[0, 1, 2]" }
      ]
    },
    debriefs: {
      javascript: {
        rootCause: "`var` binds once per function — every closure shares the final `i`.",
        whyFails: "By the time the handlers run, the loop has ended and `i` is 3 for all of them.",
        repair: "`let` binds per iteration, so each closure keeps its own index.",
        edgeCase: "A zero-iteration loop leaves no handlers — still correct.",
        corrected: "for (let i = 0; i < 3; i++)",
        note: ""
      }
    }
  },
  "mutable-default-arg": {
    id: "mutable-default-arg",
    lifecycle: "draft",
    bugCount: "1",
    bugTypes: "state",
    primarySkill: "functions",
    internalNote: "The default list persists across calls — state leaks between invocations.",
    mode: "timed",
    timedMinutes: "",
    timedAllowance: "",
    rungs: [],
    checklist: DEBUG_GATE.map((item) =>
      item.key === "timed" || item.key === "debrief" ? { ...item, met: false } : item
    ),
    draft: {
      title: "Mutable Default Argument Leak",
      difficulty: "medium",
      topics: "functions, state",
      statement: "Items appended in earlier calls reappear in later ones — the default argument is shared state.",
      inputDescription: "A call sequence.",
      outputDescription: "Each call's own list only.",
      constraints: "Calls run in one process.",
      interfaceKind: "console",
      comparisonPolicy: "console-default",
      tolerance: "",
      timeLimit: "",
      memoryLimit: "",
      editorial: "",
      languages: [
        {
          key: "python",
          label: "Python 3",
          language: "python",
          starter: "def collect(item, bag=[]):\n    bag.append(item)\n    return bag\n",
          reference: "def collect(item, bag=None):\n    if bag is None:\n        bag = []\n    bag.append(item)\n    return bag\n"
        }
      ],
      cases: [{ key: "c1", visibility: "visible", input: "collect(1); collect(2)", expected: "[1] then [2]" }]
    },
    debriefs: { python: { ...EMPTY_DEBRIEF, rootCause: "Default arguments evaluate once at definition time." } }
  }
};

export function resolveDebugCase(
  id: string,
  store: Store,
  extraRows?: readonly {
    id: string; title: string; lifecycle: string; difficulty: string;
    primarySkill: string; bugTypes: readonly string[]; bugCount: number | null;
    mode: string; budgetMinutes: number | null;
  }[]
): DebugFixture | null {
  if (id === "new") {
    return {
      id,
      lifecycle: "draft",
      draft: emptyPracticeDraft(),
      bugCount: "",
      bugTypes: "",
      primarySkill: "",
      internalNote: "",
      mode: "practice",
      timedMinutes: "",
      timedAllowance: "",
      debriefs: {},
      rungs: [],
      checklist: []
    };
  }
  const row = store.adminDebugCases.find((c) => c.id === id);
  const fixture = DEBUG_FIXTURES[id];
  if (fixture) {
    return row ? { ...fixture, lifecycle: row.lifecycle, draft: { ...fixture.draft, title: row.title } } : fixture;
  }
  if (row) {
    return {
      ...DEBUG_FIXTURES["mutable-default-arg"]!,
      id,
      lifecycle: row.lifecycle,
      draft: { ...emptyPracticeDraft(), title: row.title },
      bugCount: "",
      bugTypes: "",
      primarySkill: "",
      internalNote: "",
      rungs: [],
      checklist: []
    };
  }
  // Fixture-only index rows (debug/fixtures.ts) resolve to a sparse draft —
  // what an incomplete draft honestly is — so a row's Open never lands on
  // "unavailable" for a case the index itself listed.
  const extra = extraRows?.find((r) => r.id === id);
  if (extra) {
    return {
      id: extra.id,
      lifecycle: extra.lifecycle,
      draft: { ...emptyPracticeDraft(), title: extra.title, difficulty: (["easy", "medium", "hard", "extreme"] as const).find((d) => d === extra.difficulty) ?? "medium" },
      bugCount: extra.bugCount === null ? "" : String(extra.bugCount),
      bugTypes: extra.bugTypes.join(", "),
      primarySkill: extra.primarySkill,
      internalNote: "",
      mode: extra.mode === "timed" ? "timed" : "practice",
      timedMinutes: extra.mode === "timed" && extra.budgetMinutes !== null ? String(extra.budgetMinutes) : "",
      timedAllowance: "",
      debriefs: {},
      rungs: [],
      checklist: []
    };
  }
  return null;
}

export { EMPTY_DEBRIEF };
