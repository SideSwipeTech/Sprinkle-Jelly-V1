/**
 * fixtures.ts — the courses studio's fixture data. Real item and lesson names
 * come from @data/catalog (Foundations of Python, Python Studio: Closures &
 * Scopes…) and the store's admin rows (HTTP and API Design, Time and Space,
 * Honestly). Pages read the session overlay (readStudioTree/writeStudioTree)
 * so a write on one page is what the next page reads back; nothing persists
 * beyond the session.
 *
 * Spec vocabulary is verbatim: lifecycle is draft / submitted / published /
 * archived; the two families are Interactive Lessons (subject, chapter,
 * lesson) and Video Courses (course, module, lesson); lesson types are the
 * five; blocks are the six.
 */

import type { LessonBlock } from "../../extraction/components/LessonBlockEditor/LessonBlockEditor";

export type LessonType = "text" | "video" | "quiz" | "course-project" | "integration-reference";
export type Lifecycle = "draft" | "submitted" | "published" | "archived";
export type Family = "interactive" | "video";

export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  text: "Text",
  video: "Video",
  quiz: "Quiz",
  "course-project": "Course project",
  "integration-reference": "Integration reference"
};

export const FAMILY_LABEL: Record<Family, string> = {
  interactive: "Interactive Lessons",
  video: "Video Courses"
};

/** The mid level of each family's tree — chapter under a subject, module under a course. */
export const GROUP_LABEL: Record<Family, string> = {
  interactive: "chapter",
  video: "module"
};

/** The top level of each family's tree — subject or course. */
export const ITEM_LABEL: Record<Family, string> = {
  interactive: "subject",
  video: "course"
};

export interface StudioQuizQuestion {
  id: string;
  kind: "single" | "multiple" | "numerical" | "true-false";
  prompt: string;
  /** Authored choices — a quiz without them renders honestly unanswerable. */
  choices?: string[];
  /** The right answer — an index for single/true-false/numerical, indexes for multiple. */
  answer?: number | number[];
}

export interface StudioLesson {
  id: string;
  title: string;
  address: string;
  type: LessonType;
  /** Video courses mark every lesson required or optional. */
  required: boolean;
  lifecycle: Lifecycle;
  /** A lesson is visible to a learner only with saved content. */
  saved: boolean;
  /** Drafts may be incomplete — an incomplete draft always saves. */
  incomplete?: boolean;
  /** An unauthorized open is refused at the named action. */
  restricted?: boolean;
  /** The save line's scripted outcome — the demo's deterministic transitions. */
  saveBehaviour?: "ok" | "fails-once" | "conflict" | "offline";
  /** Estimated minutes — the learner's honest time read. */
  minutes?: number;
  outcomes: string[];
  skill: string;
  topic: string;
  blocks?: LessonBlock[];
  video?: {
    videoId: string;
    encoding: "ready" | "processing" | "failed";
    captionsReady: boolean;
    transcriptReady: boolean;
  };
  quiz?: StudioQuizQuestion[];
  projectTemplate?: string;
  referenceTarget?: string;
}

export interface StudioGroup {
  id: string;
  title: string;
  lessons: StudioLesson[];
}

export interface StudioItem {
  id: string;
  family: Family;
  title: string;
  address: string;
  lifecycle: Lifecycle;
  /** Video courses are authored open or Sequential. */
  navigation?: "open" | "sequential";
  /** Hard delete is reserved for a pristine draft. */
  pristine?: boolean;
  /** Cascade rejects rather than half-sweeping when the state changed underneath. */
  sweepStale?: boolean;
  /** An export that cannot be produced says so. */
  exportable?: boolean;
  exportNote?: string;
  enrolled: number;
  groups: StudioGroup[];
}

export function cloneStudio(items: StudioItem[]): StudioItem[] {
  return JSON.parse(JSON.stringify(items)) as StudioItem[];
}

export function findLesson(
  items: StudioItem[],
  lessonId: string
): { item: StudioItem; group: StudioGroup; lesson: StudioLesson } | null {
  for (const item of items) {
    for (const group of item.groups) {
      const lesson = group.lessons.find((l) => l.id === lessonId);
      if (lesson) return { item, group, lesson };
    }
  }
  return null;
}

export function findItem(items: StudioItem[], id: string): StudioItem | null {
  return items.find((i) => i.id === id) ?? null;
}

export function findGroup(
  items: StudioItem[],
  itemId: string,
  groupId: string
): { item: StudioItem; group: StudioGroup } | null {
  const item = findItem(items, itemId);
  const group = item?.groups.find((g) => g.id === groupId);
  return item && group ? { item, group } : null;
}

/** The structural counts a card reads — chapters/modules, lessons, and how
 *  many lessons still sit in draft. Derived, never stored. */
export function itemStats(item: StudioItem): { groups: number; lessons: number; drafts: number } {
  let lessons = 0;
  let drafts = 0;
  for (const g of item.groups) {
    lessons += g.lessons.length;
    drafts += g.lessons.filter((l) => l.lifecycle !== "published").length;
  }
  return { groups: item.groups.length, lessons, drafts };
}

/** A node deletes in place only while everything it sweeps is a draft — a
 *  published node (or a draft holding published lessons) takes the
 *  retirement path. Chosen, not stated: the documents name no tree-level
 *  delete, so the conservative reading holds — retirement owns any sweep
 *  that touches live content. */
export function groupDeletable(group: StudioGroup): boolean {
  return group.lessons.every((l) => l.lifecycle === "draft");
}

export function itemDeletable(item: StudioItem): boolean {
  return item.lifecycle === "draft" && item.groups.every(groupDeletable);
}

/** The honest-list contract: "Loaded N of T" where T is counted, else "N loaded, total unavailable". */
export function loadedNote(loaded: number, total: number | null): string {
  return total === null ? `${loaded} loaded, total unavailable` : `Loaded ${loaded} of ${total}`;
}

/* ── The session overlay — writes on the tree land here so a node created,
 *  renamed, reordered or deleted on one page is what the next page reads back
 *  after navigation (the people fixtures' overlay idiom). Nothing persists
 *  beyond the session. Chosen, not stated: the documents name no per-node
 *  write path for the tree, so the whole tree is the unit of write. ──────── */

let sessionTree: StudioItem[] | null = null;
let nodeSeq = 0;

/** The tree as this session holds it — a fresh clone of the fixtures plus
 *  every committed write, so callers may hold the result in local state. */
export function readStudioTree(): StudioItem[] {
  return cloneStudio(sessionTree ?? STUDIO_ITEMS);
}

/** Commits a whole updated tree — the tree is the unit of write. */
export function writeStudioTree(next: StudioItem[]): void {
  sessionTree = cloneStudio(next);
}

/** A session-unique id for a node created on the tree. */
export function nextNodeId(kind: string): string {
  nodeSeq += 1;
  return `new-${kind}-${nodeSeq}`;
}

/** Address names are lowercase letters, digits and hyphens (the import
 *  validator's own bound); a create that leaves the address empty derives
 *  one from the title. Chosen, not stated — no document names an address
 *  rule for a tree-level create. */
export function addressFromTitle(title: string): string {
  const derived = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return derived || `untitled-${nodeSeq + 1}`;
}

/* ── The studio tree ─────────────────────────────────────────────────────── */

export const STUDIO_ITEMS: StudioItem[] = [
  {
    id: "python-foundations",
    family: "interactive",
    title: "Foundations of Python",
    address: "python-foundations",
    lifecycle: "published",
    enrolled: 1184,
    groups: [
      {
        id: "ch-getting-started",
        title: "Getting started",
        lessons: [
          {
            id: "names-and-assignment",
            title: "Names and Assignment",
            address: "names-and-assignment",
            type: "text",
            required: true,
            lifecycle: "published",
            saved: true,
            minutes: 40,
            outcomes: ["Assignment binds a name to a reference"],
            skill: "Python",
            topic: "Language foundations",
            /* A published lesson opens on its real blocks — the draft carries
               the same content the live version serves (the learner
               catalogue's authored body for this lesson). */
            blocks: [
              { id: "nb1", type: "heading", text: "A name is a binding, not a box", level: 2 },
              {
                id: "nb2",
                type: "rich-text",
                text: "Every value in Python is an object with an identity, a type, and a value.\n\nImmutable types (int, str, tuple, frozenset) cannot be modified in place. Mutable objects (list, dict, set) mutate their internal buffer, affecting every bound alias."
              },
              {
                id: "nb3",
                type: "runnable-code",
                language: "python",
                filename: "aliases.py",
                code: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)  # [1, 2, 3, 4] — the alias sees the mutation\n\n# Defensive clone:\nc = a.copy()\nc.append(5)\nprint(a)  # still [1, 2, 3, 4]"
              },
              { id: "nb4", type: "callout", kind: "key-takeaway", text: "Assignment binds a name to an object reference; it never copies the underlying value." }
            ]
          },
          {
            id: "functions-and-scope",
            title: "Functions and Scope",
            address: "functions-and-scope",
            type: "text",
            required: true,
            lifecycle: "published",
            saved: true,
            outcomes: ["LEGB name resolution", "Closures capture cells, not values"],
            skill: "Python",
            topic: "Language foundations",
            minutes: 45,
            blocks: [
              { id: "fb1", type: "heading", text: "How Python resolves a name", level: 2 },
              {
                id: "fb2",
                type: "rich-text",
                text: "Names are bindings in an execution namespace, not variables in the C sense.\n\nThe LEGB rule governs resolution: Local, Enclosing, Global, Built-in."
              },
              {
                id: "fb3",
                type: "runnable-code",
                language: "python",
                filename: "scopes.py",
                code: "def outer():\n    x = 10\n    def inner():\n        nonlocal x\n        x += 5\n        return x\n    return inner\n\nfn = outer()\nprint(fn())  # 15"
              },
              { id: "fb4", type: "callout", kind: "key-takeaway", text: "Python resolves names from the innermost local frame outward." },
              {
                id: "fb5",
                type: "display-code",
                language: "python",
                filename: "closure.py",
                code: "def make_multipliers():\n    return [lambda x, i=i: x * i for i in range(4)]"
              },
              { id: "fb6", type: "image", src: "", alt: "Namespace lookup order", caption: "LEGB lookup order" }
            ]
          },
          {
            id: "lists-without-alias-bugs",
            title: "Lists without Alias Bugs",
            address: "lists-without-alias-bugs",
            type: "text",
            required: true,
            lifecycle: "draft",
            saved: true,
            incomplete: true,
            minutes: 35,
            outcomes: [],
            skill: "Python",
            topic: "Language foundations",
            saveBehaviour: "fails-once",
            blocks: [
              { id: "lb1", type: "heading", text: "Mutable defaults bite once", level: 2 },
              { id: "lb2", type: "rich-text", text: "Default arguments are evaluated once, at definition time." }
            ]
          }
        ]
      },
      {
        id: "ch-going-further",
        title: "Going further",
        lessons: [
          {
            id: "exceptions-as-contracts",
            title: "Exceptions as Contracts",
            address: "exceptions-as-contracts",
            type: "text",
            required: true,
            lifecycle: "published",
            saved: true,
            minutes: 45,
            outcomes: ["EAFP is the idiomatic standard"],
            skill: "Python",
            topic: "Language foundations",
            blocks: [
              { id: "eb1", type: "heading", text: "Ask forgiveness, not permission", level: 2 },
              {
                id: "eb2",
                type: "rich-text",
                text: "Use specific exception handling rather than catching bare `Exception`.\n\nThe `else` block executes when no exception occurred in the `try` clause. The `finally` block guarantees resource cleanup — file closes, lock releases."
              },
              {
                id: "eb3",
                type: "display-code",
                language: "python",
                filename: "eafp.py",
                code: "try:\n    value = int(user_input)\nexcept ValueError:\n    handle_invalid()\nelse:\n    process(value)\nfinally:\n    cleanup_resources()"
              },
              { id: "eb4", type: "callout", kind: "key-takeaway", text: "EAFP — Easier to Ask for Forgiveness than Permission — is the idiomatic Python design standard." }
            ]
          },
          {
            id: "modules-and-the-path",
            title: "Modules and the Path",
            address: "modules-and-the-path",
            type: "text",
            required: true,
            lifecycle: "draft",
            saved: false,
            incomplete: true,
            minutes: 30,
            outcomes: [],
            skill: "Python",
            topic: "Language foundations",
            saveBehaviour: "conflict",
            blocks: [{ id: "mb1", type: "heading", text: "The import machinery", level: 2 }]
          },
          {
            id: "closures-deep-dive",
            title: "Closures Deep Dive",
            address: "closures-deep-dive",
            type: "text",
            required: true,
            lifecycle: "draft",
            saved: true,
            restricted: true,
            outcomes: ["Closed-over cells outlive the frame"],
            skill: "Python",
            topic: "Language foundations",
            saveBehaviour: "offline",
            blocks: [{ id: "cb1", type: "rich-text", text: "A cell object outlives the frame that created it." }]
          }
        ]
      }
    ]
  },
  {
    id: "dsa-patterns",
    family: "interactive",
    title: "Patterns in Data Structures",
    address: "dsa-patterns",
    lifecycle: "published",
    enrolled: 942,
    groups: [
      {
        id: "ch-linear",
        title: "Linear patterns",
        lessons: [
          {
            id: "two-pointers-technique",
            title: "Two-Pointers Convergence",
            address: "two-pointers-technique",
            type: "text",
            required: true,
            lifecycle: "published",
            saved: true,
            minutes: 50,
            outcomes: ["Shrink O(N²) scans to O(N)"],
            skill: "Data Structures",
            topic: "Algorithms",
            blocks: [
              { id: "tb1", type: "heading", text: "Converge instead of scanning", level: 2 },
              {
                id: "tb2",
                type: "rich-text",
                text: "When an array is sorted or possesses monotonic properties, two pointers moving inward can evaluate pairs without full cartesian combinations.\n\nMaintain a clear loop invariant: every element outside the left and right boundaries is definitively disqualified."
              },
              {
                id: "tb3",
                type: "runnable-code",
                language: "python",
                filename: "two_sum_sorted.py",
                code: "def two_sum_sorted(numbers: list[int], target: int) -> list[int]:\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        curr = numbers[left] + numbers[right]\n        if curr == target:\n            return [left + 1, right + 1]\n        elif curr < target:\n            left += 1\n        else:\n            right -= 1\n    return []"
              },
              { id: "tb4", type: "callout", kind: "key-takeaway", text: "Shrink search spaces from O(N²) to O(N) using monotonic index convergence." }
            ]
          },
          {
            id: "sliding-window-invariants",
            title: "Sliding Window Invariants",
            address: "sliding-window-invariants",
            type: "quiz",
            required: true,
            lifecycle: "published",
            saved: true,
            minutes: 55,
            outcomes: ["Maintain a valid window by expansion and contraction"],
            skill: "Data Structures",
            topic: "Algorithms",
            quiz: [
              { id: "q1", kind: "single", prompt: "Which pointer moves when a dynamic window is invalid?" },
              { id: "q2", kind: "true-false", prompt: "A fixed-size window moves both bounds together." },
              { id: "q3", kind: "numerical", prompt: "Longest valid window for [2,1,1,2] with sum ≤ 3?" }
            ]
          }
        ]
      },
      {
        id: "ch-structures",
        title: "Structure patterns",
        lessons: [
          {
            id: "stack-monotonic-chains",
            title: "Monotonic Stack Applications",
            address: "stack-monotonic-chains",
            type: "integration-reference",
            required: false,
            lifecycle: "published",
            saved: true,
            minutes: 60,
            outcomes: ["Next-greater-element in strict O(N)"],
            skill: "Data Structures",
            topic: "Algorithms",
            referenceTarget: "Challenge: Balanced Brackets"
          }
        ]
      }
    ]
  },
  {
    id: "complexity",
    family: "interactive",
    title: "Time and Space, Honestly",
    address: "complexity",
    lifecycle: "draft",
    pristine: true,
    enrolled: 0,
    groups: [
      {
        id: "ch-first-pass",
        title: "First pass",
        lessons: [
          {
            id: "counting-operations",
            title: "Counting Operations",
            address: "counting-operations",
            type: "text",
            required: true,
            lifecycle: "draft",
            saved: true,
            incomplete: true,
            outcomes: [],
            skill: "Algorithms",
            topic: "Interview prep",
            blocks: [{ id: "cbx1", type: "heading", text: "Count, don't guess", level: 2 }]
          }
        ]
      }
    ]
  },
  {
    id: "py-studio-01",
    family: "video",
    title: "Python Studio: Closures & Scopes",
    address: "python-studio-closures",
    lifecycle: "published",
    navigation: "sequential",
    enrolled: 611,
    groups: [
      {
        id: "mod-foundations",
        title: "Foundations",
        lessons: [
          {
            id: "lexical-namespaces",
            title: "Introduction to Lexical Namespaces",
            address: "lexical-namespaces",
            type: "video",
            required: true,
            lifecycle: "published",
            saved: true,
            outcomes: ["Names resolve at compile time"],
            skill: "Python",
            topic: "Language foundations",
            minutes: 18,
            video: { videoId: "bny-8f31aa", encoding: "ready", captionsReady: true, transcriptReady: true }
          },
          {
            id: "legb-scope-traversal",
            title: "LEGB Scope Traversal in CPython",
            address: "legb-scope-traversal",
            type: "video",
            required: true,
            lifecycle: "published",
            saved: true,
            outcomes: [],
            skill: "Python",
            topic: "Language foundations",
            minutes: 22,
            video: { videoId: "bny-44c1d2", encoding: "ready", captionsReady: false, transcriptReady: true }
          },
          {
            id: "closure-cell-quiz",
            title: "Closure Cells Check",
            address: "closure-cell-quiz",
            type: "quiz",
            required: false,
            lifecycle: "published",
            saved: true,
            outcomes: ["Cell objects hold closed-over values"],
            skill: "Python",
            topic: "Language foundations",
            quiz: [
              { id: "q1", kind: "single", prompt: "What does LOAD_DEREF read?" },
              { id: "q2", kind: "multiple", prompt: "Which frames can a closure reach?" }
            ]
          }
        ]
      },
      {
        id: "mod-applied",
        title: "Applied",
        lessons: [
          {
            id: "decorators-walkthrough",
            title: "Parametrized Decorators in Practice",
            address: "decorators-walkthrough",
            type: "video",
            required: true,
            lifecycle: "draft",
            saved: true,
            incomplete: true,
            outcomes: ["A decorator factory binds arguments at wrap time"],
            skill: "Python",
            topic: "Language foundations",
            video: { videoId: "bny-9e77c0", encoding: "processing", captionsReady: true, transcriptReady: false }
          },
          {
            id: "closures-project",
            title: "Course Project: Scope Visualizer",
            address: "closures-project",
            type: "course-project",
            required: false,
            lifecycle: "draft",
            saved: true,
            outcomes: ["Render a closure's cell graph"],
            skill: "Python",
            topic: "Language foundations",
            projectTemplate: "Bracket Parser & Visualizer"
          }
        ]
      },
      { id: "mod-capstone", title: "Capstone Studio", lessons: [] }
    ]
  },
  {
    id: "dsa-studio-01",
    family: "video",
    title: "DSA Studio: Mastering Sliding Windows",
    address: "dsa-studio-windows",
    lifecycle: "published",
    navigation: "open",
    enrolled: 402,
    groups: [
      {
        id: "mod-windows",
        title: "The window",
        lessons: [
          {
            id: "window-invariants",
            title: "Window Invariant Principles",
            address: "window-invariants",
            type: "video",
            required: true,
            lifecycle: "published",
            saved: true,
            outcomes: ["A window is valid or it is not"],
            skill: "Data Structures",
            topic: "Algorithms",
            minutes: 24,
            video: { videoId: "bny-1a90be", encoding: "ready", captionsReady: true, transcriptReady: true }
          },
          {
            id: "longest-substring",
            title: "Longest Substring Without Repeating Characters",
            address: "longest-substring",
            type: "video",
            required: true,
            lifecycle: "published",
            saved: true,
            outcomes: ["Shrink on duplicate, grow otherwise"],
            skill: "Data Structures",
            topic: "Algorithms",
            minutes: 30,
            video: { videoId: "bny-55f2aa", encoding: "ready", captionsReady: true, transcriptReady: true }
          }
        ]
      }
    ]
  },
  {
    id: "sql-readiness",
    family: "interactive",
    title: "SQL for Readiness",
    address: "sql-readiness",
    lifecycle: "published",
    enrolled: 733,
    exportable: false,
    exportNote: "its draft could not be read — the export was not produced",
    groups: [
      {
        id: "ch-relational",
        title: "Relational core",
        lessons: [
          {
            id: "window-functions",
            title: "Window Functions",
            address: "window-functions",
            type: "text",
            required: true,
            lifecycle: "published",
            saved: true,
            outcomes: ["RANK vs DENSE_RANK"],
            skill: "SQL",
            topic: "Data engineering",
            minutes: 40,
            blocks: [
              { id: "sb1", type: "heading", text: "Windows over rows", level: 2 },
              {
                id: "sb2",
                type: "rich-text",
                text: "A window function computes across a set of rows related to the current row without collapsing them the way GROUP BY does.\n\nRANK leaves gaps after ties; DENSE_RANK does not."
              },
              {
                id: "sb3",
                type: "display-code",
                language: "sql",
                filename: "windows.sql",
                code: "SELECT\n  reviewer,\n  score,\n  RANK()       OVER (ORDER BY score DESC) AS rank,\n  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank\nFROM reviews;"
              },
              { id: "sb4", type: "callout", kind: "key-takeaway", text: "RANK vs DENSE_RANK — gaps after ties or none." }
            ]
          }
        ]
      }
    ]
  }
];

/* ── Revisions ───────────────────────────────────────────────────────────── */

export interface RevisionRow {
  id: string;
  at: string;
  author: string;
  summary: string;
  /** The revision the live version carries. */
  live?: boolean;
}

export const REVISIONS: Record<string, RevisionRow[]> = {
  "functions-and-scope": [
    { id: "r18", at: "16 Aug 2026, 14:32", author: "Meera", summary: "Rewrote the LEGB section", live: true },
    { id: "r17", at: "15 Aug 2026, 09:12", author: "Yash", summary: "Added the runnable scope example" },
    { id: "r16", at: "11 Aug 2026, 17:40", author: "Yash", summary: "First full draft" },
    { id: "r15", at: "09 Aug 2026, 11:05", author: "Meera", summary: "Outline only" }
  ],
  "lists-without-alias-bugs": [
    { id: "r3", at: "14 Aug 2026, 10:22", author: "Yash", summary: "Draft — mutable defaults section" },
    { id: "r2", at: "12 Aug 2026, 16:48", author: "Yash", summary: "Stub" }
  ]
};

/* ── The dry run ─────────────────────────────────────────────────────────── */

export interface Finding {
  id: string;
  /** The lesson or field the finding concerns. */
  target: string;
  field: string;
  to?: string;
  message: string;
}

export interface CheckLine {
  id: string;
  label: string;
  state: "ready" | "processing" | "not-verifiable";
  note?: string;
}

export interface DryRunFixture {
  blockers: Finding[];
  warnings: Finding[];
  checks: CheckLine[];
  /** A blocker that only appears when the publish itself re-checks. */
  blockerAtPublish?: Finding;
}

export const DRY_RUNS: Record<string, DryRunFixture> = {
  "py-studio-01": {
    blockers: [
      {
        id: "bk1",
        target: "LEGB Scope Traversal in CPython",
        field: "captions",
        to: "/admin/curriculum/lessons/legb-scope-traversal",
        message: "A required video lesson is missing captions"
      },
      {
        id: "bk2",
        target: "Capstone Studio",
        field: "lessons",
        message: "A published module is left holding no published lesson"
      },
      {
        id: "bk3",
        target: "Parametrized Decorators in Practice",
        field: "outcomes",
        to: "/admin/curriculum/lessons/decorators-walkthrough",
        message: "Missing learning outcomes on a published-bound lesson"
      }
    ],
    warnings: [
      {
        id: "wn1",
        target: "Course Project: Scope Visualizer",
        field: "estimated duration",
        to: "/admin/curriculum/lessons/closures-project",
        message: "An optional lesson carries no estimated duration"
      },
      {
        id: "wn2",
        target: "Python Studio: Closures & Scopes",
        field: "description",
        message: "The description is shorter than the catalogue reads well at"
      }
    ],
    checks: [
      {
        id: "ck1",
        label: "Media readiness — Parametrized Decorators in Practice (bny-9e77c0)",
        state: "processing",
        note: "processing — never ready and never failed until the provider settles it"
      },
      {
        id: "ck2",
        label: "Address-name uniqueness across the catalogue",
        state: "not-verifiable",
        note: "not yet verifiable — the check could not run"
      },
      { id: "ck3", label: "Reachability — every required lesson", state: "ready" }
    ]
  },
  "dsa-studio-01": {
    blockers: [],
    warnings: [
      {
        id: "wn1",
        target: "Window Invariant Principles",
        field: "next actions",
        message: "No authored next actions — nothing renders at completion"
      }
    ],
    checks: [
      { id: "ck1", label: "Media readiness — 2 video lessons", state: "ready" },
      { id: "ck2", label: "Reachability — every required lesson", state: "ready" }
    ]
  },
  complexity: {
    blockers: [],
    warnings: [],
    checks: [{ id: "ck1", label: "Reachability — every required lesson", state: "ready" }],
    blockerAtPublish: {
      id: "bkp1",
      target: "First pass",
      field: "lessons",
      message: "A published chapter is left holding no published lesson — the state changed underneath the dry run"
    }
  }
};

/** The run an item gets. Scripted fixtures stand where the demo means to
 *  show a named state — a check still processing, one not yet verifiable, a
 *  blocker that lands at the publish itself. Every other item is checked for
 *  real against the studio tree: blockers and warnings are derived from the
 *  actual draft, each pointing at the lesson or group it concerns, and the
 *  registered checks are the ones that genuinely ran. An item whose draft
 *  cannot be read registers no checks at all — the run cannot verify, and
 *  the page must say so rather than claim ready. */
export function dryRunFor(item: StudioItem): DryRunFixture {
  const scripted = DRY_RUNS[item.id];
  if (scripted) return scripted;
  if (item.exportable === false) return { blockers: [], warnings: [], checks: [] };

  const blockers: Finding[] = [];
  const warnings: Finding[] = [];
  const checks: CheckLine[] = [];
  const groupWord = GROUP_LABEL[item.family];

  let videoLessons = 0;
  let totalLessons = 0;
  for (const group of item.groups) {
    const publishedInGroup = group.lessons.filter((l) => l.lifecycle === "published");
    if (item.lifecycle === "published" && publishedInGroup.length === 0) {
      blockers.push({
        id: `dg-${group.id}`,
        target: group.title,
        field: "lessons",
        to: `/admin/curriculum/items/${item.id}/groups/${group.id}`,
        message: `A published ${groupWord} is left holding no published lesson`
      });
    }
    for (const lesson of group.lessons) {
      totalLessons += 1;
      const to = `/admin/curriculum/lessons/${lesson.id}`;
      if (lesson.type === "video") videoLessons += 1;
      if (lesson.lifecycle === "published" && !lesson.saved) {
        blockers.push({
          id: `dl-${lesson.id}`,
          target: lesson.title,
          field: "content",
          to,
          message: "A published lesson carries no saved content"
        });
      }
      if (
        lesson.lifecycle === "published" &&
        lesson.type === "text" &&
        (lesson.blocks ?? []).length === 0
      ) {
        blockers.push({
          id: `db-${lesson.id}`,
          target: lesson.title,
          field: "blocks",
          to,
          message: "A published text lesson holds no authored blocks"
        });
      }
      if (lesson.lifecycle === "published" && lesson.outcomes.length === 0) {
        blockers.push({
          id: `do-${lesson.id}`,
          target: lesson.title,
          field: "outcomes",
          to,
          message: "Missing learning outcomes on a published-bound lesson"
        });
      }
      if (
        lesson.type === "video" &&
        lesson.required &&
        lesson.lifecycle === "published" &&
        lesson.video &&
        (!lesson.video.captionsReady || !lesson.video.transcriptReady)
      ) {
        blockers.push({
          id: `dv-${lesson.id}`,
          target: lesson.title,
          field: "captions",
          to,
          message: "A required video lesson is missing captions or a transcript"
        });
      }
      if (lesson.incomplete) {
        warnings.push({
          id: `wi-${lesson.id}`,
          target: lesson.title,
          field: "draft",
          to,
          message: "An incomplete draft — not part of this publish"
        });
      }
      if (!lesson.required && lesson.minutes === undefined) {
        warnings.push({
          id: `wm-${lesson.id}`,
          target: lesson.title,
          field: "estimated duration",
          to,
          message: "An optional lesson carries no estimated duration"
        });
      }
    }
  }
  if (totalLessons === 0) {
    blockers.push({
      id: `de-${item.id}`,
      target: item.title,
      field: "lessons",
      to: `/admin/curriculum/items/${item.id}`,
      message: "The draft holds no lessons — nothing would be published"
    });
  }

  checks.push({
    id: "ck-reach",
    label: "Reachability — every required lesson carries saved content",
    state: "ready"
  });
  checks.push({
    id: "ck-structure",
    label: `Structure — every published ${groupWord} holds a published lesson`,
    state: "ready"
  });
  if (videoLessons > 0) {
    checks.push({
      id: "ck-media",
      label: `Media readiness — ${videoLessons} video ${videoLessons === 1 ? "lesson" : "lessons"}`,
      state: "ready"
    });
  }
  return { blockers, warnings, checks };
}

/* ── The approval queue ──────────────────────────────────────────────────── */

export interface Submission {
  id: string;
  itemId: string;
  title: string;
  author: string;
  submittedAt: string;
  note: string;
}

export const SUBMISSIONS: Submission[] = [
  {
    id: "sub-http-apis",
    itemId: "http-apis",
    title: "HTTP and API Design",
    author: "Meera",
    submittedAt: "14 Aug 2026, 09:58",
    note: "Revision 3 — ready for review"
  },
  {
    id: "sub-complexity",
    itemId: "complexity",
    title: "Time and Space, Honestly",
    author: "Arun",
    submittedAt: "15 Aug 2026, 18:20",
    note: "First full draft of the complexity subject"
  }
];

/* The queue shares the session-overlay idiom with the tree: a submission
 *  made on the review & publish page lands here, and the approval queue
 *  reads the same list back after navigation. Nothing persists beyond the
 *  session. */
let sessionSubmissions: Submission[] | null = null;

export function readSubmissions(): Submission[] {
  return (sessionSubmissions ?? SUBMISSIONS).map((s) => ({ ...s }));
}

export function addSubmission(s: Submission): void {
  sessionSubmissions = [...readSubmissions(), { ...s }];
}

/* ── Settings ────────────────────────────────────────────────────────────── */

export interface SettingsFixture {
  itemId: string;
  title: string;
  address: string;
  description: string;
  difficulty: string;
  tags: string;
  icon: string;
  position: string;
  duration: string;
  certificateBearing: boolean;
  certPolicy: "platform-style" | "course-specific";
  certTemplate: string;
  skill: string;
  topic: string;
}

export const SETTINGS: Record<string, SettingsFixture> = {
  "py-studio-01": {
    itemId: "py-studio-01",
    title: "Python Studio: Closures & Scopes",
    address: "python-studio-closures",
    description: "Deep walkthrough of Python's name lookup resolution, closure cell memory layouts, and decorator patterns.",
    difficulty: "Intermediate",
    tags: "python, closures, scope",
    icon: "courses",
    position: "3",
    duration: "48 minutes",
    certificateBearing: true,
    certPolicy: "course-specific",
    certTemplate: "cert-tpl-studio-ribbon",
    skill: "Python",
    topic: "Language foundations"
  },
  "dsa-studio-01": {
    itemId: "dsa-studio-01",
    title: "DSA Studio: Mastering Sliding Windows",
    address: "dsa-studio-windows",
    description: "Visual step-through of dynamic sliding windows and substring optimization.",
    difficulty: "Intermediate",
    tags: "algorithms, windows",
    icon: "courses",
    position: "4",
    duration: "54 minutes",
    certificateBearing: true,
    certPolicy: "platform-style",
    certTemplate: "",
    skill: "Data Structures",
    topic: "Algorithms"
  },
  "python-foundations": {
    itemId: "python-foundations",
    title: "Foundations of Python",
    address: "python-foundations",
    description: "Names, scope, functions, and the habits that keep a first program honest.",
    difficulty: "Beginner",
    tags: "python, functions",
    icon: "courses",
    position: "1",
    duration: "6 hours",
    certificateBearing: true,
    certPolicy: "platform-style",
    certTemplate: "",
    skill: "Python",
    topic: "Language foundations"
  }
};

/** The template references the presentation policy may name. */
export const CERT_TEMPLATES = ["cert-tpl-studio-ribbon", "cert-tpl-classic-serif"] as const;

/** A settings draft for an item with no authored fixture — the editable-in-place defaults. */
export function defaultSettings(item: StudioItem): SettingsFixture {
  return {
    itemId: item.id,
    title: item.title,
    address: item.address,
    description: "",
    difficulty: "Intermediate",
    tags: "",
    icon: "courses",
    position: "0",
    duration: "",
    certificateBearing: item.family === "video",
    certPolicy: "platform-style",
    certTemplate: "",
    skill: item.groups[0]?.lessons[0]?.skill ?? "",
    topic: item.groups[0]?.lessons[0]?.topic ?? ""
  };
}

export interface AuditRow {
  id: string;
  at: string;
  actor: string;
  field: string;
  from: string;
  to: string;
}

export const SETTINGS_AUDIT: AuditRow[] = [
  {
    id: "aud1",
    at: "12 Aug 2026, 15:04",
    actor: "Meera",
    field: "topic",
    from: "General programming",
    to: "Language foundations"
  }
];

/* ── Import / export ─────────────────────────────────────────────────────── */

/** Bounds the import enforces, named as the specification names them. */
export const IMPORT_BOUNDS = {
  COURSES_IMPORT_FILE_MAX_MIB: 10,
  JOBS_SWEEP_PAGE_RECORDS: 500,
  PUBLISHING_PREVIEW_LINK_LIFETIME_HOURS: 24
} as const;

export interface ImportLesson {
  title: string;
  address?: string;
  type?: string;
}

export interface ImportDraft {
  title: string;
  address?: string;
  family?: string;
  lessons?: ImportLesson[];
}

export const SAMPLE_IMPORT_OK: ImportDraft = {
  title: "HTTP and API Design",
  address: "http-apis",
  family: "interactive",
  lessons: [
    { title: "Methods and Meaning", address: "methods-and-meaning", type: "text" },
    { title: "Status Codes as Contracts", address: "status-codes", type: "text" },
    { title: "Idempotency, Honestly", address: "idempotency", type: "quiz" }
  ]
};

export const SAMPLE_IMPORT_INVALID: ImportDraft = {
  title: "Webinar Archive",
  address: "Bad Address!!",
  family: "interactive",
  lessons: [{ title: "A live webinar", address: "webinar-1", type: "webinar" }]
};

/* ── Per-lesson content review + aggregate analytics ─────────────────────── */

export interface LessonReviewRow {
  lessonId: string;
  title: string;
  reached: number;
  reachedNotCompleted: number;
  computedAt: string;
}

export interface CourseReviewFixture {
  lessons: LessonReviewRow[];
  aggregate: {
    starts: number | null;
    completions: number | null;
    dropOff: number | null;
    certificates: number | null;
  };
  computedAt: string;
}

export const COURSE_REVIEWS: Record<string, CourseReviewFixture> = {
  "python-foundations": {
    computedAt: "16 Aug 2026, 06:00",
    lessons: [
      { lessonId: "names-and-assignment", title: "Names and Assignment", reached: 903, reachedNotCompleted: 61, computedAt: "16 Aug 2026, 06:00" },
      { lessonId: "functions-and-scope", title: "Functions and Scope", reached: 812, reachedNotCompleted: 148, computedAt: "16 Aug 2026, 06:00" },
      { lessonId: "exceptions-as-contracts", title: "Exceptions as Contracts", reached: 655, reachedNotCompleted: 97, computedAt: "16 Aug 2026, 06:00" }
    ],
    aggregate: { starts: 903, completions: 512, dropOff: null, certificates: 489 }
  },
  "py-studio-01": {
    computedAt: "16 Aug 2026, 06:00",
    lessons: [
      { lessonId: "lexical-namespaces", title: "Introduction to Lexical Namespaces", reached: 611, reachedNotCompleted: 22, computedAt: "16 Aug 2026, 06:00" },
      { lessonId: "legb-scope-traversal", title: "LEGB Scope Traversal in CPython", reached: 540, reachedNotCompleted: 131, computedAt: "16 Aug 2026, 06:00" }
    ],
    aggregate: { starts: 611, completions: 388, dropOff: 36, certificates: 388 }
  }
};
