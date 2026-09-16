/**
 * fixtures.ts — the editorial studio's fixture state.
 *
 * Platform-authored worked solutions per item and per language (admin
 * 01-pages.md destinations table; challenges.F30; solving.C08): the authored
 * approach, its explanation, its complexity notes, and its own review and
 * execution gate — held to the same execution check as the reference
 * solution, never the same object as it, never derived from a learner's code.
 *
 * Item names and solution bodies echo the real catalogue (@data/catalog
 * CHALLENGES / DAILY / DEBUG_CASES). Fixture state only — no store writes.
 */

export type EditorialLanguage = "python" | "javascript" | "typescript" | "java" | "cpp" | "go";
export type EditorialLifecycle = "draft" | "in-review" | "published";
export type EditorialKind = "challenge" | "daily" | "debug";

/** The execution gate's readings. `unverifiable` is the state where a check
 *  cannot run at all — said plainly, never passed off as a pass or a skip. */
export type GateStatus = "unrun" | "passing" | "failing" | "unverifiable";

export interface GateState {
  status: GateStatus;
  /** The sentence a refused publish names. */
  detail: string;
  /** The check's own output where it ran. */
  output?: string;
  cases?: {
    name: string;
    passed: boolean;
    durationMs: number;
    /** A failing case shows expected/actual — the refusal names them. */
    expected?: string;
    actual?: string;
    details?: string;
  }[];
}

export interface WorkedSolution {
  language: EditorialLanguage;
  /** The authored approach title. */
  approach: string;
  /** The explanation body. */
  explanation: string;
  /** Complexity notes — time and space, separately. */
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
  lifecycle: EditorialLifecycle;
  gate: GateState;
}

export interface EditorialItem {
  id: string;
  title: string;
  kind: EditorialKind;
  /** The item's supported languages — an editorial exists per language, or doesn't. */
  languages: EditorialLanguage[];
  solutions: Partial<Record<EditorialLanguage, WorkedSolution>>;
}

export const LANGUAGE_LABEL: Record<EditorialLanguage, string> = {
  python: "Python 3",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java 21",
  cpp: "C++ 20",
  go: "Go 1.22"
};

export const EDITORIAL_ITEMS: EditorialItem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    kind: "challenge",
    languages: ["python", "javascript", "typescript"],
    solutions: {
      python: {
        language: "python",
        lifecycle: "published",
        approach: "One-pass hash map lookup",
        explanation:
          "Hold every value already seen in a map to its index. For each number the complement is either already held — answer found — or the number joins the map for a later number to find. One sweep, no backtracking, and the first hit is provably the only one needed.",
        timeComplexity: "O(N) — a single linear traversal",
        spaceComplexity: "O(N) — the map holds at most N entries",
        code: `def solve(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        gate: {
          status: "passing",
          detail: "the execution check passes — all three cases",
          output: "$ solve --cases visible\n  sample ([2,7,11,15], 9)        ok  (0.18ms)\n  pair at end ([3,2,4], 6)       ok  (0.15ms)\n  duplicate values ([3,3], 6)    ok  (0.11ms)",
          cases: [
            { name: "sample ([2,7,11,15], 9)", passed: true, durationMs: 0.18 },
            { name: "pair at end ([3,2,4], 6)", passed: true, durationMs: 0.15 },
            { name: "duplicate values ([3,3], 6)", passed: true, durationMs: 0.11 }
          ]
        }
      },
      javascript: {
        language: "javascript",
        lifecycle: "draft",
        approach: "Single-sweep Map of complements",
        explanation:
          "A Map keeps insertion order and O(1) lookups. The sweep stores each value's index before testing the next, so the answer surfaces the moment a complement is seen.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        code: `function solve(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen.has(diff)) {
            return [seen.get(diff), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
        gate: { status: "unrun", detail: "not yet run — the execution check is owed before publish" }
      }
    }
  },
  {
    id: "balanced-brackets",
    title: "Balanced Brackets",
    kind: "challenge",
    languages: ["python", "javascript", "java"],
    solutions: {
      python: {
        language: "python",
        lifecycle: "in-review",
        approach: "LIFO stack validation",
        explanation:
          "A closer must match the most recent unmatched opener — a stack is exactly that. Push openers; on a closer, pop and compare; an empty stack at the end means every opener was matched in order.",
        timeComplexity: "O(N) — each character is inspected once",
        spaceComplexity: "O(N) — the stack holds at most N/2 openers",
        code: `def solve(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
        gate: {
          status: "failing",
          detail: "case “mismatched closer order ([)]” failed — the editorial returns True where False is required",
          output:
            "$ solve --cases visible\n  sample (()[]{})               ok  (0.14ms)\n  nested ([{()}])               ok  (0.19ms)\n  mismatched closer order ([)]) FAIL — expected False, got True\nexit 1",
          cases: [
            { name: "sample (()[]{})", passed: true, durationMs: 0.14 },
            { name: "nested ([{()}])", passed: true, durationMs: 0.19 },
            { name: "mismatched closer order ([)])", passed: false, durationMs: 0.21, expected: "False", actual: "True" }
          ]
        }
      },
      javascript: {
        language: "javascript",
        lifecycle: "published",
        approach: "LIFO stack validation",
        explanation:
          "The same stack pass, written for the runtime a browser learner gets. A sentinel bottoms-out value keeps a closer on an empty stack from misreading.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        code: `function solve(s) {
    const stack = [];
    const mapping = { ")": "(", "}": "{", "]": "[" };
    for (const char of s) {
        if (char in mapping) {
            const top = stack.length ? stack.pop() : "#";
            if (mapping[char] !== top) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`,
        gate: {
          status: "passing",
          detail: "the execution check passes — all three cases",
          output: "$ solve --cases visible\n  sample (()[]{})          ok  (0.16ms)\n  nested ([{()}])          ok  (0.20ms)\n  empty input              ok  (0.09ms)",
          cases: [
            { name: "sample (()[]{})", passed: true, durationMs: 0.16 },
            { name: "nested ([{()}])", passed: true, durationMs: 0.2 },
            { name: "empty input", passed: true, durationMs: 0.09 }
          ]
        }
      }
    }
  },
  {
    id: "anagram-groups",
    title: "Group Anagrams",
    kind: "challenge",
    languages: ["python", "typescript"],
    solutions: {
      python: {
        language: "python",
        lifecycle: "draft",
        approach: "Sorted-key buckets",
        explanation:
          "Anagrams share one canonical form — the sorted tuple of their characters. Bucket by that key and each group forms itself. Sorting each word dominates; the grouping is a free byproduct.",
        timeComplexity: "O(N · K log K) — N words of at most K characters",
        spaceComplexity: "O(N · K) — every word is held once",
        code: `def solve(strs: list[str]) -> list[list[str]]:
    groups = {}
    for word in strs:
        key = tuple(sorted(word))
        groups.setdefault(key, []).append(word)
    return list(groups.values())`,
        gate: {
          status: "unverifiable",
          detail: "not yet verifiable — the item's cases could not be read, so the check cannot run at all"
        }
      }
    }
  },
  {
    id: "daily-balanced-brackets",
    title: "Daily · Balanced Brackets — 21 Aug 2026",
    kind: "daily",
    languages: ["python"],
    solutions: {
      python: {
        language: "python",
        lifecycle: "published",
        approach: "LIFO stack validation",
        explanation:
          "The daily pick shares the challenge's shape — one stack pass, closers matched against the most recent opener. The bounded memory point is the debrief's centre: the stack never exceeds N/2.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N) — bounded at N/2 openers",
        code: `def solve(s: str) -> bool:
    stack = []
    pairs = {")": "(", "}": "{", "]": "["}
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
        gate: {
          status: "passing",
          detail: "the execution check passes — all three cases",
          output: "$ solve --cases visible\n  sample (()[]{})          ok  (0.13ms)\n  single closer            ok  (0.07ms)\n  deep nesting             ok  (0.22ms)",
          cases: [
            { name: "sample (()[]{})", passed: true, durationMs: 0.13 },
            { name: "single closer", passed: true, durationMs: 0.07 },
            { name: "deep nesting", passed: true, durationMs: 0.22 }
          ]
        }
      }
    }
  },
  {
    id: "window-overrun",
    title: "Off-by-one in a Sliding Window",
    kind: "debug",
    languages: ["python"],
    solutions: {
      python: {
        language: "python",
        lifecycle: "published",
        approach: "Bound the slice, not the loop",
        explanation:
          "Debug's post-fix debrief is this object: the loop ran to len(nums) and sliced past the end, so trailing windows summed short silently. Range to len(nums) - k + 1 and every slice is whole. The check is the fixed code run against the case's own assertions.",
        timeComplexity: "O(N·K) — the sum inside the loop dominates",
        spaceComplexity: "O(K) — one window held at a time",
        code: `def max_subarray_sum(nums, k):
    best = 0
    for i in range(len(nums) - k + 1):
        window = nums[i:i + k]
        if sum(window) > best:
            best = sum(window)
    return best`,
        gate: {
          status: "passing",
          detail: "the execution check passes — the case's own assertions hold",
          output: "$ fix --assertions\n  windows stay whole        ok  (0.12ms)\n  max is the true max       ok  (0.14ms)",
          cases: [
            { name: "windows stay whole", passed: true, durationMs: 0.12 },
            { name: "max is the true max", passed: true, durationMs: 0.14 }
          ]
        }
      }
    }
  }
];
