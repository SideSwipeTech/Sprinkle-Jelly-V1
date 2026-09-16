/**
 * Learner practice fixtures — the authored per-challenge material the solve
 * workbench, the daily workbench and the track pages read.
 *
 * `catalog.ts` carries each challenge's identity; this module carries the
 * seeded cases, constraints, hint ladders, offered languages and catalogue
 * figures that let the demo's simulated judge stay honest:
 *
 *   - Run executes the visible samples only and writes nothing of record.
 *   - Submit grades the visible + hidden set and is the submission of record.
 *   - A platform fault is never a false solve failure: the challenges whose
 *     `judgeDown` is set cannot be graded in this demo and say so in the
 *     platform's own name, recording nothing and touching no status.
 *
 * The award figure per difficulty is the platform's one award table, shared
 * with the practice studio's fixtures.
 */

import type { Challenge, Difficulty } from "@data/catalog";
import type { HintRung } from "../../extraction/components/HintLadder/HintLadder";
import { XP_BY_DIFFICULTY } from "../../admin/practice/fixtures";

/** The award the platform actually pays on a first accepted solve. */
export function xpFor(difficulty: Difficulty): number {
  return XP_BY_DIFFICULTY[difficulty.toLowerCase() as keyof typeof XP_BY_DIFFICULTY] ?? 40;
}

export const EDITOR_LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "javascript", label: "JavaScript (ES6)" },
  { value: "typescript", label: "TypeScript 5.5" },
  { value: "java", label: "Java 21" },
  { value: "cpp", label: "C++ 20" },
  { value: "go", label: "Go 1.22" }
] as const;

export type EditorLanguage = (typeof EDITOR_LANGUAGES)[number]["value"];

export function languageLabel(value: string): string {
  return EDITOR_LANGUAGES.find((l) => l.value === value)?.label ?? value;
}

/* ── Per-challenge authored detail ───────────────────────────────────────── */

export interface ChallengeDetail {
  /** The visible sample cases — Run executes these and nothing else. */
  samples: { input: string; expected: string }[];
  /** Hidden cases contribute to the verdict and the count, nothing else. */
  hiddenCount: number;
  constraints: string[];
  /** Only the languages the challenge was authored for (challenges §4.3). */
  languages: EditorLanguage[];
  hints: HintRung[];
  /** Catalogue acceptance figure — a seeded fixture, never uniform filler. */
  acceptRate: number | null;
  /** The comparison policy in force, stated before any run. */
  comparison: string;
  /** The simulated platform fault: when set, grading cannot run at all. */
  judgeDown?: string;
}

const ALL_SIX: EditorLanguage[] = ["python", "javascript", "typescript", "java", "cpp", "go"];

export const CHALLENGE_DETAILS: Record<string, ChallengeDetail> = {
  "two-sum": {
    samples: [
      { input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]" },
      { input: "nums = [3,2,4], target = 6", expected: "[1, 2]" },
      { input: "nums = [3,3], target = 6", expected: "[0, 1]" }
    ],
    hiddenCount: 39,
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i], target <= 10^9", "Exactly one valid pair exists per input."],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: Conceptual direction", content: "A second pass over the array is avoidable. While scanning once, what would let you recognise the complement in O(1)?" },
      { title: "Rung 2: The data structure", content: "Keep a map from value to index. For each n at i, check whether target - n was already seen." },
      { title: "Rung 3: The shape", content: "seen = {}\nfor i, n in enumerate(nums):\n    if target - n in seen: return [seen[target - n], i]\n    seen[n] = i" }
    ],
    acceptRate: 52,
    comparison: "console-default · normalized stdout"
  },
  "balanced-brackets": {
    samples: [
      { input: 's = "([]){}"', expected: "true" },
      { input: 's = "([)]"', expected: "false" },
      { input: 's = "{[]}"', expected: "true" }
    ],
    hiddenCount: 19,
    constraints: ["1 <= s.length <= 10^4", "s contains only bracket characters."],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: Where correctness lives", content: "A closing bracket must match the most recent unmatched opener — that is a stack's job." },
      { title: "Rung 2: The invariant", content: "Push openers; on a closer, pop and compare. A mismatch or an early closer on an empty stack fails." },
      { title: "Rung 3: The exit condition", content: "The string is valid only if the stack is empty at the end." }
    ],
    acceptRate: 61,
    comparison: "console-default · normalized stdout"
  },
  "anagram-groups": {
    samples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', expected: '[[""]]' }
    ],
    hiddenCount: 25,
    constraints: ["1 <= strs.length <= 10^4", "Lowercase English letters only."],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: The grouping key", content: "Anagrams share a canonical form. Sorting the letters of each word gives the same key for the whole group." },
      { title: "Rung 2: The structure", content: "A map from sorted-word key to list of originals. One pass builds every group." }
    ],
    acceptRate: 58,
    comparison: "console-default · order-insensitive groups"
  },
  "unique-paths": {
    samples: [
      { input: "m = 3, n = 7", expected: "28" },
      { input: "m = 3, n = 2", expected: "3" }
    ],
    hiddenCount: 33,
    constraints: ["1 <= m, n <= 100"],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: The subproblem", content: "paths(i, j) = paths(i-1, j) + paths(i, j-1). Only down and right moves exist." },
      { title: "Rung 2: The boundary", content: "The first row and first column are all 1 — one way to reach each." }
    ],
    acceptRate: 44,
    comparison: "console-default · normalized stdout"
  },
  "first-missing": {
    samples: [
      { input: "nums = [1,2,0]", expected: "3" },
      { input: "nums = [3,4,-1,1]", expected: "2" },
      { input: "nums = [7,8,9,11,12]", expected: "1" }
    ],
    hiddenCount: 41,
    constraints: ["1 <= nums.length <= 5 * 10^5", "O(n) time, O(1) auxiliary space required."],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: Where the answer lives", content: "The answer is always in [1, n+1]. The array itself can hold the presence flags." },
      { title: "Rung 2: The placement", content: "Put each value v at index v-1 by swapping, then scan for the first index whose value is not index+1." }
    ],
    acceptRate: 36,
    comparison: "console-default · normalized stdout"
  },
  "valid-bst": {
    samples: [
      { input: "root = [2,1,3]", expected: "true" },
      { input: "root = [5,1,4,null,null,3,6]", expected: "false" }
    ],
    hiddenCount: 29,
    constraints: ["Node keys are unique integers.", "The tree has between 1 and 10^4 nodes."],
    languages: ["python", "java"],
    hints: [
      { title: "Rung 1: Not just the parent", content: "Each node must sit inside an inherited (low, high) bound — comparing only to the parent is the classic bug." },
      { title: "Rung 2: The recursion", content: "Recurse with (node, low, high): left child tightens high, right child tightens low." }
    ],
    acceptRate: 33,
    comparison: "console-default · tree literal parse"
  },
  "lru-cache": {
    samples: [
      { input: 'ops = ["LRUCache","put","put","get"], args = [[2],[1,1],[2,2],[1]]', expected: "[null,null,null,1]" }
    ],
    hiddenCount: 17,
    constraints: ["1 <= capacity <= 3000", "get and put must average O(1)."],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: The two structures", content: "O(1) lookup wants a hash map; O(1) eviction of the oldest wants a doubly linked list. You need both, keyed together." }
    ],
    acceptRate: 41,
    comparison: "console-default · normalized stdout",
    /* The simulated platform fault: this challenge's grading lane is down in
       the demo — runs and submits report the platform's failure, never a
       learner failure, and record nothing. */
    judgeDown: "The grading lane for this challenge is unreachable."
  },
  "longest-substring": {
    samples: [
      { input: 's = "abcabcbb"', expected: "3" },
      { input: 's = "bbbbb"', expected: "1" },
      { input: 's = "pwwkew"', expected: "3" }
    ],
    hiddenCount: 30,
    constraints: ["0 <= s.length <= 5 * 10^4", "Printable ASCII."],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: The window", content: "A sliding window [left, right] holds only unique characters; on a repeat, move left past the previous occurrence." },
      { title: "Rung 2: The bookkeeping", content: "Keep the last seen index per character in a map; left = max(left, seen[ch] + 1)." }
    ],
    acceptRate: 37,
    comparison: "console-default · normalized stdout"
  },
  "binary-search": {
    samples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", expected: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", expected: "-1" }
    ],
    hiddenCount: 17,
    constraints: ["nums is sorted ascending.", "O(log n) runtime required."],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: The halves", content: "Compare the middle element; the sorted half that cannot hold the target is discarded wholesale." }
    ],
    acceptRate: 68,
    comparison: "console-default · normalized stdout"
  },
  "merge-intervals": {
    samples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]" },
      { input: "intervals = [[1,4],[4,5]]", expected: "[[1,5]]" }
    ],
    hiddenCount: 19,
    constraints: ["1 <= intervals.length <= 10^4"],
    languages: ALL_SIX,
    hints: [
      { title: "Rung 1: The ordering", content: "Sort by start. Overlaps then only ever touch the tail of the merged list." },
      { title: "Rung 2: The merge rule", content: "If the next interval starts before the current end, extend the end; otherwise push a new merged interval." }
    ],
    acceptRate: 47,
    comparison: "console-default · normalized stdout"
  }
};

/** Detail fallback — a catalogue row the fixture never fleshed out gets the
 *  honest minimum, not fabricated cases. */
export function detailFor(id: string): ChallengeDetail {
  return (
    CHALLENGE_DETAILS[id] ?? {
      samples: [],
      hiddenCount: 0,
      constraints: [],
      languages: ALL_SIX,
      hints: [],
      acceptRate: null,
      comparison: "console-default · normalized stdout"
    }
  );
}

/* ── Starters — never a disguised reference solution ─────────────────────── */

const COMMENT: Record<string, string> = {
  python: "#",
  javascript: "//",
  typescript: "//",
  java: "//",
  cpp: "//",
  go: "//"
};

/** The starter for one challenge in one language. Python carries the authored
 *  starter; other languages get an honest stub — code is never transplanted
 *  across languages (challenges §4.3). */
export function starterFor(challenge: Challenge, language: EditorLanguage): string {
  if (language === "python" && challenge.starterCode) return challenge.starterCode;
  const mark = COMMENT[language] ?? "#";
  return `${mark} ${challenge.title} — ${languageLabel(language)} starter\n${mark} Implement the function the statement names. Run checks the visible samples only.\n`;
}

/* ── The simulated judge — honest, deterministic ─────────────────────────── */

/** Whether the editor still holds the untouched starter — the demo's honest
 *  proxy for "the samples cannot pass": a stub cannot satisfy a case. */
export function isUntouchedStarter(code: string, starter: string): boolean {
  return code.trim() === starter.trim() || code.trim().length === 0;
}

/* ── Tracks — contents in the author's order ─────────────────────────────── */

/** The published contents of each track, in authored order. Coverage counts
 *  against this live list — a track-owned challenge still resolves to the
 *  same underlying solve, never a second one. */
export const TRACK_CONTENTS: Record<string, string[]> = {
  arrays: ["two-sum", "anagram-groups", "merge-intervals", "first-missing"],
  graphs: ["valid-bst", "unique-paths"],
  trees: ["valid-bst"],
  /* The SQL track has nothing published yet — the honest empty track. */
  sql: []
};

/** One language per track, frozen once the track owns challenges. */
export const TRACK_LANGUAGE: Record<string, string> = {
  arrays: "Python",
  graphs: "Python",
  trees: "Python",
  sql: "SQL"
};

/** The track-context language a solve page must hold — null when the track
 *  fixes no editor language this demo can run. */
export function trackEditorLanguage(trackId: string | undefined): EditorLanguage | null {
  const label = trackId ? TRACK_LANGUAGE[trackId] : undefined;
  if (label === "Python") return "python";
  return null;
}
