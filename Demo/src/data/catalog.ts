export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Course {
  id: string;
  title: string;
  track: string;
  language: string;
  level: string;
  lessons: number;
  duration: string;
  summary: string;
  enrolled?: boolean;
  prerequisites?: string[];
  outcomes?: string[];
  coverGradient?: string;
  hasVideo?: boolean;
  /** The video-course sibling covering the same ground, when one is published. */
  videoCourseId?: string;
  /**
   * The change record a returning enrolled learner meets on the subject page,
   * grouped the way the change brief groups it. Absent means nothing to show —
   * a first visit or no record is not an error.
   */
  changeBrief?: { added: string[]; updated: string[]; removed: string[] };
}

/** The closed set of lesson types — a type is never a block kind. */
export type CourseLessonType = "text" | "video" | "quiz" | "course-project" | "integration-reference";

export interface LessonQuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  /** Index into choices. */
  answer: number;
  explanation?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  minutes: number;
  body: string[];
  /** Defaults to "text". Quiz, project, video and integration-reference lessons
   *  carry their own completion rules; a plain Next never completes anything. */
  type?: CourseLessonType;
  codeSample?: string;
  codeLang?: string;
  keyTakeaway?: string;
  /** Quiz lessons: the authored questions, choices included. */
  quiz?: LessonQuizQuestion[];
  /** Course-project lessons: the assigned starter template. */
  projectTemplateId?: string;
  /** Integration-reference lessons: the platform item this lesson points at. */
  referenceTarget?: { kind: "challenge"; id: string; title: string };
}

/** The authored mid level of a subject's outline — chapters order lessons. */
export interface CourseChapter {
  id: string;
  courseId: string;
  title: string;
  lessonIds: string[];
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solved?: boolean;
  prompt: string;
  starterCode?: string;
  solutionEditorial?: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    code: string;
  };
}

export interface MockPaper {
  id: string;
  title: string;
  minutes: number;
  questions: number;
  tags: string[];
  summary: string;
  difficulty: Difficulty;
  category: string;
  passingScore?: number;
  type: "mock" | "company";
  /** Reveal flags in force — default on when absent. A flag set false seals
   *  that part of the result page's review at view time. */
  revealReview?: boolean;
  revealAnswers?: boolean;
  revealExplanations?: boolean;
}

export interface Company {
  id: string;
  name: string;
  /** Published papers on this company's page — matches COMPANY_PAPERS. */
  papers: number;
  summary: string;
  focusAreas: string[];
  difficulty: Difficulty;
  provenance: "Actual" | "Pattern";
  readinessIndex: number;
  recentForm: number;
  role?: string;
  year?: string;
  logoIcon?: string;
}

/** A Company paper — owned by exactly one company, opened only from that
 *  company's page (assessments.F43). Learner-side fixture: every entry renders
 *  the shared COMPANY_QUESTIONS bank, so `questions` names that bank's size. */
export interface CompanyPaper {
  id: string;
  /** Owning company — set at authoring, never changes. */
  companyId: string;
  title: string;
  minutes: number;
  questions: number;
  provenance: "Actual" | "Pattern";
  /** The strictness in force, stated on the briefing. */
  strictness: "standard" | "strict";
  /** Present only where entry is refused — the named reason, never Not found. */
  blockedReason?: string;
}

export interface TopicRequest {
  id: string;
  title: string;
  description: string;
  author: string;
  upvotes: number;
  status: "Under Review" | "Planned" | "In Authoring" | "Published" | "Withdrawn";
  sourceArea: "Courses" | "Challenges" | "Assessments" | "CodeLab" | "Projects";
  tags: string[];
  createdAt: string;
}

export const LEARNER = {
  name: "Yash",
  lab: "Yash's Lab",
  level: 14,
  xp: 28450,
  xpToNext: 950,
  streak: 23,
  solved: 142,
  membershipEnd: "12 Mar 2031"
};

export const COURSES: Course[] = [
  {
    id: "python-foundations",
    title: "Foundations of Python",
    track: "Language",
    language: "Python",
    level: "Beginner",
    lessons: 7,
    duration: "6 h",
    summary: "Names, scope, functions, and the habits that keep a first program honest.",
    prerequisites: ["None — first principles"],
    outcomes: ["LEGB Scope Rules", "Mutable vs Immutable references", "Decorators & Closures", "Clean idiomatic scripts"],
    coverGradient: "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
    hasVideo: true,
    videoCourseId: "py-studio-01",
    changeBrief: {
      added: ["Runnable scope example inside Functions and Scope"],
      updated: ["Closures in Practice — rewritten against current CPython wording"],
      removed: []
    }
  },
  {
    id: "dsa-patterns",
    title: "Patterns in Data Structures",
    track: "Interview",
    language: "Python",
    level: "Intermediate",
    lessons: 3,
    duration: "3 h",
    summary: "Stacks, maps, two pointers, and the shape of a fair timed attempt.",
    prerequisites: ["Foundations of Python"],
    outcomes: ["Two-pointer convergence", "Sliding window invariants", "Tree traversals", "Hash-map state indexing"],
    coverGradient: "linear-gradient(135deg, #2DD4BF 0%, #0284C7 100%)",
    hasVideo: true,
    videoCourseId: "dsa-studio-01"
  },
  {
    id: "sql-readiness",
    title: "SQL for Readiness",
    track: "Data",
    language: "SQL",
    level: "Intermediate",
    lessons: 4,
    duration: "5 h",
    summary: "Joins, grouping, and explaining an execution plan without inventing a number.",
    prerequisites: ["Basic relational concepts"],
    outcomes: ["Window functions (RANK, DENSE_RANK)", "CTEs and recursive queries", "Query planner analysis", "Index selectivity"],
    coverGradient: "linear-gradient(135deg, #FBBF24 0%, #EA580C 100%)",
    hasVideo: false
  },
  {
    id: "js-runtime",
    title: "JavaScript in Depth",
    track: "Language",
    language: "JavaScript",
    level: "Intermediate",
    lessons: 4,
    duration: "6 h",
    summary: "Master closures, async event loop, browser microtasks, and runtime engine mechanics.",
    prerequisites: ["Basic programming"],
    outcomes: ["Microtask vs Macrotask queue", "Prototype inheritance", "Memory leak diagnostics", "Event delegation patterns"],
    coverGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    hasVideo: false
  },
  {
    id: "react-interfaces",
    title: "React Interface Engineering",
    track: "Frontend",
    language: "TypeScript",
    level: "Intermediate",
    lessons: 4,
    duration: "12 h",
    summary: "Compose resilient interfaces with deliberate state, accessible interactions, and sharp component APIs.",
    prerequisites: ["JavaScript in Depth"],
    outcomes: ["Compound component patterns", "Custom hook architectures", "FLIP transition mechanics", "Accessible ARIA primitives"],
    coverGradient: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)",
    hasVideo: false
  },
  {
    id: "systems-unix",
    title: "Unix Tools for Engineers",
    track: "Systems",
    language: "Shell",
    level: "Beginner",
    lessons: 4,
    duration: "4 h",
    summary: "Pipes, processes, memory paging, and the foundational commands that still earn their keep.",
    prerequisites: ["Command Line Basics"],
    outcomes: ["Process management & signals", "Standard I/O stream redirection", "Text stream pipelines (awk, sed)", "File descriptor mechanics"],
    coverGradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
    hasVideo: false
  },
  {
    id: "go-microservices",
    title: "Go Microservice Architecture",
    track: "Backend",
    language: "Go",
    level: "Advanced",
    lessons: 4,
    duration: "8 h",
    summary: "Concurrency primitives, channels, bounded workers, and low-latency gRPC service design.",
    prerequisites: ["Systems Foundations"],
    outcomes: ["Goroutines & channel synchronisation", "Context cancellation & timeouts", "gRPC proto contract design", "Graceful shutdown lifecycles"],
    coverGradient: "linear-gradient(135deg, #00ADD8 0%, #007D9C 100%)",
    hasVideo: true
  },
  {
    id: "rust-ownership",
    title: "Rust Systems & Memory",
    track: "Systems",
    language: "Rust",
    level: "Advanced",
    lessons: 4,
    duration: "10 h",
    summary: "Zero-cost abstractions, borrow checker mastery, lifetimes, and deterministic concurrency without GC.",
    prerequisites: ["C/C++ or Systems Concepts"],
    outcomes: ["Ownership & Move semantics", "Explicit lifetime annotations", "Trait objects vs Generics monomorphization", "Fearless concurrency primitives"],
    coverGradient: "linear-gradient(135deg, #F97316 0%, #C2410C 100%)",
    hasVideo: false
  }
];

export const LESSONS: Lesson[] = [
  // Foundations of Python
  {
    id: "functions-and-scope",
    courseId: "python-foundations",
    title: "Functions and Scope",
    minutes: 45,
    keyTakeaway: "Python resolves names from innermost local frame outward through enclosing, global, and built-in scopes.",
    body: [
      "In Python, names are not variables in the C sense: they are bindings in an execution namespace dictionary.",
      "The LEGB rule governs name resolution: Local, Enclosing, Global, Built-in.",
      "Assigning to a variable anywhere in a function body marks that identifier as local for the entire scope unless explicitly declared `global` or `nonlocal`."
    ],
    codeLang: "python",
    codeSample: `def outer():\n    x = 10\n    def inner():\n        nonlocal x\n        x += 5\n        return x\n    return inner\n\nfn = outer()\nprint(fn()) # 15\nprint(fn()) # 20`
  },
  {
    id: "names-and-assignment",
    courseId: "python-foundations",
    title: "Names and Assignment",
    minutes: 40,
    keyTakeaway: "Assignment binds a name to an object reference; it never copies the underlying value.",
    body: [
      "Every value in Python is an object with an identity, a type, and a value.",
      "Immutable types (int, str, tuple, frozenset) cannot be modified in place.",
      "Mutable objects (list, dict, set) mutate their internal buffer, affecting all bound aliases."
    ],
    codeLang: "python",
    codeSample: `a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a) # [1, 2, 3, 4] - alias affected!\n\n# Defensive clone:\nc = a.copy()\nc.append(5)\nprint(a) # [1, 2, 3, 4]`
  },
  {
    id: "closures-in-practice",
    courseId: "python-foundations",
    title: "Closures in Practice",
    minutes: 50,
    keyTakeaway: "A closure encapsulates both the function bytecode and the lexical environment cell references.",
    body: [
      "A closure occurs when an inner function retains references to variables from an outer enclosing function even after the outer scope has returned.",
      "Common pitfall: closed-over loop variables bind to the cell, not the snapshot value during loop execution.",
      "Use default argument binding or explicit factory closures to capture loop values cleanly."
    ],
    codeLang: "python",
    codeSample: `def make_multipliers():\n    # Capture i with default arg binding\n    return [lambda x, i=i: x * i for i in range(4)]\n\nmultipliers = make_multipliers()\nprint([m(2) for m in multipliers]) # [0, 2, 4, 6]`
  },
  {
    id: "lists-without-alias-bugs",
    courseId: "python-foundations",
    title: "Lists without Alias Bugs",
    minutes: 35,
    keyTakeaway: "Avoid mutable default arguments in function definitions.",
    body: [
      "Function default arguments are evaluated once at module definition time, not per call.",
      "Passing `def append_to(item, target=[])` creates a shared list across every call that omits the parameter.",
      "Always use `None` as the default sentinel and initialize a fresh list inside the body."
    ],
    codeLang: "python",
    codeSample: `def append_to(element, target=None):\n    if target is None:\n        target = []\n    target.append(element)\n    return target`
  },
  {
    id: "exceptions-as-contracts",
    courseId: "python-foundations",
    title: "Exceptions as Contracts",
    minutes: 45,
    keyTakeaway: "EAFP (Easier to Ask for Forgiveness than Permission) is the idiomatic Python design standard.",
    body: [
      "Use specific exception handling rather than catching bare `Exception`.",
      "The `else` block executes when no exception occurred in the `try` clause.",
      "The `finally` block guarantees resource cleanup (file closes, lock releases)."
    ],
    codeLang: "python",
    codeSample: `try:\n    value = int(user_input)\nexcept ValueError:\n    handle_invalid()\nelse:\n    process(value)\nfinally:\n    cleanup_resources()`
  },
  {
    id: "modules-and-the-path",
    courseId: "python-foundations",
    title: "Modules and the Path",
    minutes: 30,
    keyTakeaway: "Python resolves imports via `sys.path` and caches loaded modules in `sys.modules`.",
    body: [
      "`sys.path` defines the ordered directories Python inspects for module files.",
      "Relative imports use dots (`from .utils import helper`) and require a package boundary context.",
      "`__all__` controls what symbols are exposed during `from module import *`."
    ]
  },
  {
    id: "pf-scope-visualizer",
    courseId: "python-foundations",
    title: "Course Project: Scope Visualizer",
    minutes: 60,
    type: "course-project",
    projectTemplateId: "bracket-lab",
    keyTakeaway: "You judge your own project work — the checklist is evidence before the decision, never the decision.",
    body: [
      "Build a small tool that reads a Python source file and reports the scope every name binds in: local, enclosing, global or built-in.",
      "The starter template gives you a parser skeleton and a stack of frames to fill in. Work happens in your project workspace; nothing is graded externally.",
      "When you are satisfied the tool reports each binding's scope correctly, mark the lesson complete. Completion here is your own assessment of your own work."
    ]
  },

  // Patterns in Data Structures
  {
    id: "two-pointers-technique",
    courseId: "dsa-patterns",
    title: "Two-Pointers Convergence",
    minutes: 50,
    keyTakeaway: "Shrink search spaces from O(N^2) to O(N) using monotonic index convergence.",
    body: [
      "When an array is sorted or possesses monotonic properties, two pointers moving inward can evaluate pairs without full cartesian combinations.",
      "Maintain clear loop invariants: all elements outside the left and right boundaries are definitively disqualified."
    ],
    codeLang: "python",
    codeSample: `def two_sum_sorted(numbers: list[int], target: int) -> list[int]:\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        curr = numbers[left] + numbers[right]\n        if curr == target:\n            return [left + 1, right + 1]\n        elif curr < target:\n            left += 1\n        else:\n            right -= 1\n    return []`
  },
  {
    id: "sliding-window-invariants",
    courseId: "dsa-patterns",
    title: "Sliding Window Invariants",
    minutes: 55,
    type: "quiz",
    keyTakeaway: "Maintain a valid window by expanding right and contracting left.",
    body: [
      "A sliding window tracks contiguous sub-arrays.",
      "Fixed-size windows slide by shifting both left and right simultaneously.",
      "Dynamic-size windows expand the right pointer to find validity and contract the left pointer to optimize."
    ],
    quiz: [
      {
        id: "sw-q1",
        prompt: "A dynamic sliding window has gone invalid. Which pointer moves?",
        choices: [
          "The left pointer contracts the window",
          "The right pointer expands it further",
          "Both move together",
          "Neither — the window resets to empty"
        ],
        answer: 0,
        explanation: "A dynamic window expands right while the invariant holds; when it breaks, the left bound contracts until the window is valid again."
      },
      {
        id: "sw-q2",
        prompt: "A fixed-size window moves both bounds together.",
        choices: ["True", "False"],
        answer: 0,
        explanation: "Fixed windows slide by shifting left and right in the same step, keeping the length constant."
      },
      {
        id: "sw-q3",
        prompt: "For [2, 1, 1, 2] with a sum cap of 3, the longest valid window has length:",
        choices: ["2", "3", "4", "1"],
        answer: 0,
        explanation: "[1, 1] sums to 2 and is length 2; including either neighbouring 2 breaks the cap."
      }
    ]
  },
  {
    id: "stack-monotonic-chains",
    courseId: "dsa-patterns",
    title: "Monotonic Stack Applications",
    minutes: 60,
    type: "integration-reference",
    keyTakeaway: "Monotonic stacks solve 'next greater element' problems in strict O(N) time.",
    body: [
      "Maintain a stack with strictly increasing or decreasing elements.",
      "Popping an element reveals the boundary relationship for the current index.",
      "The authored pointer below routes you to the challenge this technique is practised on; the lesson stands as covered when the target does."
    ],
    referenceTarget: { kind: "challenge", id: "balanced-brackets", title: "Balanced Brackets" }
  }
];

/* ── Lessons for the remaining published subjects ──────────────────────────
   Every subject in the catalogue carries a real authored outline — a card's
   lesson count and a subject's structure read the same rows. */

LESSONS.push(
  // SQL for Readiness
  {
    id: "window-functions",
    courseId: "sql-readiness",
    title: "Window Functions",
    minutes: 45,
    keyTakeaway: "A window function computes across a peer group of rows without collapsing them the way GROUP BY does.",
    body: [
      "OVER() opens a window over the result rows; PARTITION BY slices it into peer groups and ORDER BY inside the frame decides which peers accumulate.",
      "RANK() and DENSE_RANK() differ exactly on ties: RANK leaves gaps after a shared place, DENSE_RANK does not.",
      "Frames like ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW turn a window into a running total — read them as a physical row range, not a logical one."
    ],
    codeLang: "sql",
    codeSample: `SELECT rep, sale,\n  RANK() OVER (PARTITION BY region ORDER BY sale DESC) AS place,\n  SUM(sale) OVER (PARTITION BY region) AS region_total\nFROM orders;`
  },
  {
    id: "inner-join-truth",
    courseId: "sql-readiness",
    title: "Why INNER JOIN Drops Rows",
    minutes: 40,
    keyTakeaway: "INNER JOIN keeps only the row pairs whose ON predicate evaluates to TRUE — FALSE and NULL both exclude.",
    body: [
      "A join predicate is a three-valued test: TRUE keeps the pair, FALSE and UNKNOWN (any NULL comparison) drop it.",
      "A missing row after a join is almost never a defect — it is a predicate that did not evaluate to TRUE for that pair.",
      "LEFT JOIN keeps the left row and pads the right side with NULLs; the same predicate rules decide what matches."
    ],
    codeLang: "sql",
    codeSample: `SELECT o.id, c.name\nFROM orders o\nINNER JOIN customers c ON c.id = o.customer_id;\n-- A customer_id that is NULL never joins: NULL = anything is UNKNOWN, not TRUE.`
  },
  {
    id: "cte-composition",
    courseId: "sql-readiness",
    title: "Composing with CTEs",
    minutes: 40,
    keyTakeaway: "A CTE names one step of a query so the next step reads like a sentence.",
    body: [
      "WITH name AS (...) defines an inline, single-statement table expression — a named intermediate result, not a stored object.",
      "Chaining CTEs lets each stage stay small enough to check by eye: filter, then aggregate, then rank.",
      "A recursive CTE carries an anchor member and a recursive member joined by UNION ALL; it walks hierarchies one level per iteration."
    ]
  },
  {
    id: "reading-the-plan",
    courseId: "sql-readiness",
    title: "Reading an Execution Plan",
    minutes: 50,
    keyTakeaway: "EXPLAIN shows what the planner intends; EXPLAIN ANALYZE shows what it actually did — read row estimates against actuals.",
    body: [
      "A plan is a tree of operators read inside-out: scans feed joins, joins feed aggregation.",
      "Seq Scan versus Index Scan is a cost decision, not a quality verdict — a small table scans faster than an index walk.",
      "When estimated rows diverge wildly from actual rows, the statistics are stale; the fix is ANALYZE, not a hint."
    ],
    codeLang: "sql",
    codeSample: `EXPLAIN ANALYZE\nSELECT * FROM orders WHERE customer_id = 42;\n-- Compare "rows=NNN" (estimated) against "actual rows=NNN".`
  },

  // JavaScript in Depth
  {
    id: "event-loop-turn",
    courseId: "js-runtime",
    title: "The Event Loop, One Turn at a Time",
    minutes: 45,
    keyTakeaway: "The loop runs the current task to completion, drains every queued microtask, then takes the next macrotask.",
    body: [
      "JavaScript executes one task at a time on a single thread; nothing interrupts a running task.",
      "When the call stack empties, the engine drains the entire microtask queue — microtasks queued by microtasks run in the same drain.",
      "Rendering and the next macrotask (timers, I/O, events) wait for a clean stack and an empty microtask queue."
    ],
    codeLang: "javascript",
    codeSample: `console.log('task');\nsetTimeout(() => console.log('macrotask'), 0);\nPromise.resolve().then(() => console.log('microtask'));\n// Order: task -> microtask -> macrotask`
  },
  {
    id: "microtasks-first",
    courseId: "js-runtime",
    title: "Microtasks Before Macrotasks",
    minutes: 40,
    keyTakeaway: "Promise callbacks are microtasks; setTimeout callbacks are macrotasks — the queue drains in that priority.",
    body: [
      "Promise.then, queueMicrotask and MutationObserver enqueue microtasks; setTimeout, setInterval and I/O enqueue macrotasks.",
      "A microtask loop that queues itself forever starves the macrotask queue — the page freezes with timers pending.",
      "Async/await is promise syntax: everything after an await is a microtask continuation."
    ],
    codeLang: "javascript",
    codeSample: `async function f() {\n  console.log('a');\n  await null;\n  console.log('b'); // resumes as a microtask\n}\nf();\nconsole.log('c'); // a -> c -> b`
  },
  {
    id: "closures-and-cells",
    courseId: "js-runtime",
    title: "Closures Capture Cells",
    minutes: 45,
    keyTakeaway: "A closure keeps a live reference to the variable cell, not a copy of its value — loop captures share the cell.",
    body: [
      "An inner function retains the enclosing scope's variable bindings after the outer frame returns.",
      "var in a loop header shares one cell across iterations; let creates a fresh cell per iteration.",
      "Capturing a cell means later reads see later writes — the classic `for (var i…)` surprise."
    ],
    codeLang: "javascript",
    codeSample: `const fns = [];\nfor (let i = 0; i < 3; i++) fns.push(() => i);\nconsole.log(fns.map(f => f())); // [0, 1, 2]\n// With var the same code prints [3, 3, 3].`
  },
  {
    id: "prototype-walk",
    courseId: "js-runtime",
    title: "Walking the Prototype Chain",
    minutes: 50,
    keyTakeaway: "Property lookup walks the [[Prototype]] chain until the name resolves or the chain ends at null.",
    body: [
      "Every object carries an internal [[Prototype]] link; obj.foo searches obj, then its prototype, and so on to null.",
      "Object.create(proto) builds an object whose first link is proto — the cleanest way to see the chain.",
      "A method call sets `this` to the receiver the call began on, wherever the method was found along the chain."
    ],
    codeLang: "javascript",
    codeSample: `const base = { greet() { return 'hi ' + this.name; } };\nconst obj = Object.create(base);\nobj.name = 'reader';\nconsole.log(obj.greet()); // 'hi reader'`
  },

  // React Interface Engineering
  {
    id: "state-as-snapshot",
    courseId: "react-interfaces",
    title: "State Is a Snapshot",
    minutes: 45,
    keyTakeaway: "State is a value frozen at render time — updating it schedules a new render with a new snapshot.",
    body: [
      "Setting state never mutates the variable the current render holds; it queues a render that will read the new value.",
      "Event handlers see the snapshot of the render that created them — the basis of every 'stale closure' bug.",
      "Functional updates (setX(x => x + 1)) read the pending value at apply time, sidestepping the snapshot."
    ],
    codeLang: "typescript",
    codeSample: `function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => {\n    setN(n + 1); setN(n + 1); // still one increment: same snapshot\n    setN(x => x + 1);         // now three total\n  }}>{n}</button>;\n}`
  },
  {
    id: "keys-and-identity",
    courseId: "react-interfaces",
    title: "Keys Are Identity",
    minutes: 40,
    keyTakeaway: "A key tells React which child this is across renders — index keys reuse state on the wrong row when order changes.",
    body: [
      "Reconciliation pairs children by position within a key; a stable key keeps state attached to the same logical row.",
      "Index keys invert identity when the list reorders or filters — a deleted row passes its state to the next row.",
      "A key only needs to be unique among its siblings, not globally."
    ]
  },
  {
    id: "custom-hooks",
    courseId: "react-interfaces",
    title: "Custom Hooks Own the Wiring",
    minutes: 45,
    keyTakeaway: "A custom hook packages stateful wiring — subscriptions, timers, syncing — behind a plain function call.",
    body: [
      "Custom hooks share logic, never state: each call site gets its own independent state chain.",
      "The useX naming convention is the lint rule's hook — it is how the linter knows to check the rules of hooks.",
      "Keep the return shape boring: a value, a setter, maybe a status. The hook hides mechanism, not meaning."
    ],
    codeLang: "typescript",
    codeSample: `function useNow(periodMs: number) {\n  const [now, setNow] = useState(() => Date.now());\n  useEffect(() => {\n    const id = setInterval(() => setNow(Date.now()), periodMs);\n    return () => clearInterval(id);\n  }, [periodMs]);\n  return now;\n}`
  },
  {
    id: "aria-primitives",
    courseId: "react-interfaces",
    title: "Accessible Primitives First",
    minutes: 50,
    keyTakeaway: "Role, name and keyboard contract are part of the component's API — they are not a polish pass.",
    body: [
      "A custom control without a role is a div: assistive tech announces nothing and keyboard users cannot operate it.",
      "Focus management is the component's job — a dialog takes focus in, traps Tab, and returns focus on close.",
      "Prefer the platform element (button, dialog, details) and style it; rebuild behaviour only when the platform has no element."
    ]
  },

  // Unix Tools for Engineers
  {
    id: "pipes-redirection",
    courseId: "systems-unix",
    title: "Pipes and Redirection",
    minutes: 40,
    keyTakeaway: "A pipe connects one program's stdout to the next program's stdin — redirection does the same with files.",
    body: [
      "Every process starts with three descriptors: 0 stdin, 1 stdout, 2 stderr. `>` rewires 1, `<` rewires 0, `2>` rewires 2.",
      "A pipeline is concurrent: both sides run at once, the kernel buffering between them.",
      "`>>` appends; `2>&1` sends stderr to wherever stdout currently points — order matters."
    ],
    codeLang: "shell",
    codeSample: `grep -i error app.log | sort | uniq -c | sort -rn | head\n# reads app.log, counts distinct error lines, prints the top ten`
  },
  {
    id: "processes-signals",
    courseId: "systems-unix",
    title: "Processes and Signals",
    minutes: 45,
    keyTakeaway: "A signal is a delivered interrupt; SIGTERM asks, SIGKILL decides, and SIGCHLD is how a parent hears news.",
    body: [
      "kill sends a signal by pid — the name is misleading: most signals are requests, not murders.",
      "SIGTERM (15) lets a process clean up; SIGKILL (9) cannot be caught, blocked or ignored.",
      "A zombie is a dead child whose exit status the parent has not collected — the parent, not the child, is the bug."
    ],
    codeLang: "shell",
    codeSample: `kill -TERM 4242   # ask politely\nsleep 5\nkill -KILL 4242   # decide, only if it ignored the ask`
  },
  {
    id: "text-pipelines",
    courseId: "systems-unix",
    title: "Text Pipelines: awk and sed",
    minutes: 45,
    keyTakeaway: "awk sees fields, sed sees lines — pick the tool whose unit matches the job.",
    body: [
      "awk splits each line into $1…$NF fields and runs pattern { action } pairs — a column query language.",
      "sed applies edit scripts per line: s/old/new/ is the famous one, but /pattern/d deletes by match.",
      "Compose rather than contort: grep to select, awk to reshape, sort | uniq -c to count."
    ],
    codeLang: "shell",
    codeSample: `awk '{print $1}' access.log | sort | uniq -c | sort -rn | head\n# busiest client addresses, counted`
  },
  {
    id: "file-descriptors",
    courseId: "systems-unix",
    title: "File Descriptors and Where Output Goes",
    minutes: 35,
    keyTakeaway: "A descriptor is a handle into the kernel's open-file table — pipes, sockets and files are all descriptors.",
    body: [
      "ls /proc/self/fd shows a process's open descriptors: files, pipes and sockets share the one namespace.",
      "Duplicating descriptors with >&2 sends a status line to stderr so a pipeline can still consume stdout cleanly.",
      "exec > log.txt rewires the shell's own stdout for the rest of the script — logging without touching every line."
    ],
    codeLang: "shell",
    codeSample: `echo 'starts' >&2   # status to stderr, stdout stays clean\nexec > run.log     # everything after this logs to the file`
  },

  // Go Microservice Architecture
  {
    id: "goroutines-channels",
    courseId: "go-microservices",
    title: "Goroutines and Channels",
    minutes: 50,
    keyTakeaway: "A goroutine is a cheap task; a channel is the handoff that makes sharing memory unnecessary.",
    body: [
      "go f() starts f on the runtime's scheduler — thousands of goroutines multiplex onto a handful of OS threads.",
      "An unbuffered channel synchronizes: send blocks until a receive, receive blocks until a send.",
      "Closing a channel tells receivers the stream ended; sending on a closed channel panics."
    ],
    codeLang: "go",
    codeSample: `jobs := make(chan int, 8)\ngo func() {\n  for j := range jobs {\n    fmt.Println(\"job\", j)\n  }\n}()\njobs <- 1\nclose(jobs)`
  },
  {
    id: "context-cancellation",
    courseId: "go-microservices",
    title: "Context: Cancellation and Deadlines",
    minutes: 45,
    keyTakeaway: "context.Context travels down the call graph carrying the caller's deadline — honour it or hang.",
    body: [
      "Every request handler receives a context; passing it down is how a cancelled client stops the whole call tree.",
      "ctx.Done() closes on cancel or deadline — select on it beside real work.",
      "context.WithTimeout returns a cancel function; defer cancel() always, or the timer leaks."
    ],
    codeLang: "go",
    codeSample: `ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)\ndefer cancel()\nresult, err := db.Fetch(ctx, id)`
  },
  {
    id: "grpc-contracts",
    courseId: "go-microservices",
    title: "gRPC Contracts that Age Well",
    minutes: 50,
    keyTakeaway: "A proto file is a compatibility contract — field numbers are forever, and removing them breaks old clients.",
    body: [
      "protobuf field numbers are the wire identity: rename a field freely, never reuse a number.",
      "reserved marks retired numbers and names so a later edit cannot silently collide.",
      "New fields must read correctly when absent — design defaults for the zero value."
    ]
  },
  {
    id: "graceful-shutdown",
    courseId: "go-microservices",
    title: "Graceful Shutdown",
    minutes: 45,
    keyTakeaway: "On SIGTERM: stop accepting, drain in-flight requests with a deadline, then exit.",
    body: [
      "http.Server.Shutdown(ctx) stops listeners and waits for active connections to finish within the context's deadline.",
      "A request still running when the deadline hits is cut — the deadline is the honest bound, not a formality.",
      "signal.NotifyContext wires SIGINT/SIGTERM to a context in three lines; the demo uses it verbatim."
    ],
    codeLang: "go",
    codeSample: `ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)\ndefer stop()\n<-ctx.Done()\nsrv.Shutdown(context.WithTimeout(context.Background(), 5*time.Second))`
  },

  // Rust Systems & Memory
  {
    id: "ownership-moves",
    courseId: "rust-ownership",
    title: "Ownership and Moves",
    minutes: 50,
    keyTakeaway: "Every value has exactly one owner; assignment moves ownership, and the old binding is dead.",
    body: [
      "Rust's rule: one owner per value, and the value drops when the owner leaves scope — no GC, no manual free.",
      "let b = a moves ownership for heap types; a can no longer be used and the compiler says so at compile time.",
      "Copy types (integers, bools, chars) duplicate on assignment — the move rules apply to values that own heap state."
    ],
    codeLang: "rust",
    codeSample: `let a = String::from(\"scope\");\nlet b = a;                 // ownership moves\n// println!(\"{a}\");        // compile error: a is dead\nprintln!(\"{b}\");`
  },
  {
    id: "borrowing-rules",
    courseId: "rust-ownership",
    title: "Borrowing Without Fights",
    minutes: 50,
    keyTakeaway: "At any moment: many readers (&T) or exactly one writer (&mut T) — never both, checked at compile time.",
    body: [
      "&T lends read access; &mut T lends exclusive write access — the borrow checker enforces the xor.",
      "A reference may never outlive its referent; the compiler tracks the relationship as lifetimes.",
      "data races are a compile error in safe Rust — the rules you fight in the borrow checker are the race conditions."
    ],
    codeLang: "rust",
    codeSample: `fn shout(s: &mut String) { s.push('!'); }\nlet mut name = String::from(\"borrow\");\nshout(&mut name);          // one mutable loan\nprintln!(\"{name}\");`
  },
  {
    id: "lifetimes",
    courseId: "rust-ownership",
    title: "Lifetimes Name Relationships",
    minutes: 55,
    keyTakeaway: "A lifetime annotation says which input a returned reference can point at — it changes nothing at runtime.",
    body: [
      "'a names a scope: fn first<'a>(x: &'a str, y: &'a str) -> &'a str says the result lives as long as the shorter input.",
      "Elision rules cover the common cases; annotations appear when the compiler cannot infer which borrow returns.",
      "Lifetimes are checked, not executed — the annotation is documentation the compiler enforces."
    ],
    codeLang: "rust",
    codeSample: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() > b.len() { a } else { b }\n}`
  },
  {
    id: "fearless-concurrency",
    courseId: "rust-ownership",
    title: "Fearless Concurrency",
    minutes: 55,
    keyTakeaway: "Send and Sync are the markers that make 'shared across threads' a compile-time proof, not a hope.",
    body: [
      "A type is Send if ownership may cross threads, Sync if &T may be shared — the compiler checks every crossing.",
      "Mutex<T> wraps data in mutual exclusion; lock() returns a guard that unlocks on drop.",
      "Channels (mpsc) move values between threads; the sender clones, the receiver owns what arrives."
    ],
    codeLang: "rust",
    codeSample: `let (tx, rx) = std::sync::mpsc::channel();\nstd::thread::spawn(move || { tx.send(42).unwrap(); });\nprintln!(\"{}\", rx.recv().unwrap());`
  }
);

/* ── Authored outlines: chapters order each subject's lessons ──────────────
   This is the published snapshot of structure — the studio's draft reorder
   moves nothing here until a publish lands. A subject without chapters falls
   back to a single unlabelled section of its lessons in data order. */

export const COURSE_CHAPTERS: CourseChapter[] = [
  {
    id: "ch-pf-foundations",
    courseId: "python-foundations",
    title: "Names, scope and closures",
    lessonIds: ["names-and-assignment", "functions-and-scope", "closures-in-practice"]
  },
  {
    id: "ch-pf-practice",
    courseId: "python-foundations",
    title: "Keeping programs honest",
    lessonIds: ["lists-without-alias-bugs", "exceptions-as-contracts", "modules-and-the-path"]
  },
  {
    id: "ch-pf-apply",
    courseId: "python-foundations",
    title: "Apply it",
    lessonIds: ["pf-scope-visualizer"]
  },
  {
    id: "ch-dsa-linear",
    courseId: "dsa-patterns",
    title: "Linear patterns",
    lessonIds: ["two-pointers-technique", "sliding-window-invariants"]
  },
  {
    id: "ch-dsa-structures",
    courseId: "dsa-patterns",
    title: "Structure patterns",
    lessonIds: ["stack-monotonic-chains"]
  },
  {
    id: "ch-sql-relational",
    courseId: "sql-readiness",
    title: "Relational core",
    lessonIds: ["window-functions", "inner-join-truth", "cte-composition", "reading-the-plan"]
  },
  {
    id: "ch-js-runtime",
    courseId: "js-runtime",
    title: "Inside the runtime",
    lessonIds: ["event-loop-turn", "microtasks-first", "closures-and-cells", "prototype-walk"]
  },
  {
    id: "ch-react-state",
    courseId: "react-interfaces",
    title: "State and composition",
    lessonIds: ["state-as-snapshot", "keys-and-identity", "custom-hooks", "aria-primitives"]
  },
  {
    id: "ch-unix-toolkit",
    courseId: "systems-unix",
    title: "The working toolkit",
    lessonIds: ["pipes-redirection", "processes-signals", "text-pipelines", "file-descriptors"]
  },
  {
    id: "ch-go-concurrency",
    courseId: "go-microservices",
    title: "Concurrency first",
    lessonIds: ["goroutines-channels", "context-cancellation", "grpc-contracts", "graceful-shutdown"]
  },
  {
    id: "ch-rust-ownership",
    courseId: "rust-ownership",
    title: "Ownership and borrowing",
    lessonIds: ["ownership-moves", "borrowing-rules", "lifetimes", "fearless-concurrency"]
  }
];

export interface VideoCourse {
  id: string;
  title: string;
  minutes: number;
  modules: number;
  summary: string;
  videoUrl: string;
  /** The interactive subject covering the same ground, when one is published. */
  subjectId?: string;
  chapters: { time: string; title: string }[];
  transcript: { time: string; speaker: string; text: string }[];
}

export const VIDEO_COURSES: VideoCourse[] = [
  {
    id: "py-studio-01",
    title: "Python Studio: Closures & Scopes",
    minutes: 48,
    modules: 6,
    summary: "Deep walkthrough of Python's name lookup resolution, closure cell memory layouts, and decorator patterns with live editor debugging.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    subjectId: "python-foundations",
    chapters: [
      { time: "0:00", title: "Introduction to Lexical Namespaces" },
      { time: "8:20", title: "LEGB Scope Traversal in CPython" },
      { time: "19:45", title: "Dissecting Closure Cell Objects" },
      { time: "32:10", title: "Parametrized Decorators in Practice" },
      { time: "44:00", title: "Summary & CodeLab Challenge" }
    ],
    transcript: [
      { time: "0:12", speaker: "Instructor", text: "Welcome to Python Studio Hours. Today we analyze how Python resolves variable bindings under the hood." },
      { time: "1:45", speaker: "Instructor", text: "When you reference an identifier in Python, the bytecode performs a LOAD_FAST, LOAD_DEREF, or LOAD_GLOBAL based on static compile-time inspection." },
      { time: "8:30", speaker: "Instructor", text: "Let's inspect the LEGB lookup chain. Local scope is checked first in the local frame's fast array." }
    ]
  },
  {
    id: "dsa-studio-01",
    title: "DSA Studio: Mastering Sliding Windows",
    minutes: 54,
    modules: 5,
    summary: "Visual step-through of dynamic sliding windows, frequency maps, and string substring optimization.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    subjectId: "dsa-patterns",
    chapters: [
      { time: "0:00", title: "Window Invariant Principles" },
      { time: "12:15", title: "Longest Substring Without Repeating Characters" },
      { time: "28:40", title: "Minimum Window Substring" },
      { time: "48:00", title: "Complexity & Edge Case Checklist" }
    ],
    transcript: [
      { time: "0:10", speaker: "Instructor", text: "In this studio hour, we tackle contiguous sub-array problems using the sliding window pattern." }
    ]
  }
];

export const CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Hash Map", "Arrays"],
    prompt: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    starterCode: `def solve(nums: list[int], target: int) -> list[int]:
    # Your implementation here
    return []
`,
    solutionEditorial: {
      approach: "One-pass Hash Map lookup",
      timeComplexity: "O(N) - single linear traversal",
      spaceComplexity: "O(N) - hash map stores at most N entries",
      code: `def solve(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    }
  },
  {
    id: "balanced-brackets",
    title: "Balanced Brackets",
    difficulty: "Medium",
    tags: ["Stack", "Strings"],
    prompt: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    starterCode: `def solve(s: str) -> bool:
    # Stack-based bracket validator
    return True
`,
    solutionEditorial: {
      approach: "LIFO Stack validation",
      timeComplexity: "O(N) - inspect each character once",
      spaceComplexity: "O(N) - stack holds at most N/2 openers",
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
    return not stack`
    }
  },
  {
    id: "anagram-groups",
    title: "Group Anagrams",
    difficulty: "Medium",
    tags: ["Hash Map", "Strings", "Sorting"],
    prompt: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.",
    starterCode: `def solve(strs: list[str]) -> list[list[str]]:
    return []
`
  },
  {
    id: "unique-paths",
    title: "Grid Unique Paths",
    difficulty: "Hard",
    tags: ["Dynamic Programming", "Combinatorics"],
    prompt: "There is a robot on an `m x n` grid. The robot is initially located at the top-left corner `(0, 0)`. The robot tries to move to the bottom-right corner `(m - 1, n - 1)`. The robot can only move either down or right at any point in time.\n\nGiven the two integers `m` and `n`, return the number of possible unique paths that the robot can take to reach the bottom-right corner.",
    starterCode: `def solve(m: int, n: int) -> int:
    return 1
`
  },
  {
    id: "first-missing",
    title: "First Missing Positive",
    difficulty: "Hard",
    tags: ["Arrays", "Index Hash"],
    prompt: "Given an unsorted integer array `nums`. Return the smallest positive integer that is not present in `nums`.\n\nYou must implement an algorithm that runs in `O(n)` time and uses `O(1)` auxiliary space.",
    starterCode: `def solve(nums: list[int]) -> int:
    return 1
`
  },
  {
    id: "valid-bst",
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    tags: ["Trees", "Recursion", "DFS"],
    prompt: "Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys strictly less than the node's key.\n- The right subtree of a node contains only nodes with keys strictly greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
    starterCode: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef solve(root: TreeNode) -> bool:\n    return True
`
  },
  {
    id: "lru-cache",
    title: "LRU Cache Design",
    difficulty: "Hard",
    tags: ["Design", "Doubly Linked List", "Hash Map"],
    prompt: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class with `get(key)` and `put(key, value)` both running in `O(1)` average time complexity.",
    starterCode: `class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        return -1\n    def put(self, key: int, value: int) -> None:\n        pass\n`
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Sliding Window", "Hash Map"],
    prompt: "Given a string `s`, find the length of the longest substring without repeating characters.",
    starterCode: `def solve(s: str) -> int:\n    return 0\n`
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Binary Search", "Arrays"],
    prompt: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    starterCode: `def solve(nums: list[int], target: int) -> int:\n    return -1\n`
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Arrays", "Sorting"],
    prompt: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    starterCode: `def solve(intervals: list[list[int]]) -> list[list[int]]:\n    return []\n`
  }
];

export const TRACKS = [
  { id: "arrays", title: "Arrays & Hashing", count: 42, done: 18, description: "Hash maps, two pointers, prefix sums, frequency buckets." },
  { id: "graphs", title: "Graphs & Topological Sort", count: 28, done: 4, description: "BFS, DFS, Dijkstra, cycle detection, connected components." },
  { id: "sql", title: "SQL & Relational Drills", count: 16, done: 9, description: "Window functions, correlated subqueries, join semantics." },
  { id: "trees", title: "Binary Trees & BSTs", count: 24, done: 12, description: "Traversals, lowest common ancestor, path sum invariants." }
];

export const MOCKS: MockPaper[] = [
  {
    id: "oa-python-01",
    title: "Python Online Assessment — Standard Set",
    minutes: 45,
    questions: 8,
    difficulty: "Medium",
    category: "Python OA",
    tags: ["Python", "OA", "Core"],
    summary: "Timed mixed sitting with 6 conceptual precision questions and 2 algorithmic diagnostics. Strict timer on device.",
    passingScore: 6,
    type: "mock"
  },
  {
    id: "dsa-90",
    title: "DSA Comprehensive 90-Minute Paper",
    minutes: 90,
    questions: 8,
    difficulty: "Hard",
    category: "DSA Comprehensive",
    tags: ["DSA", "Algorithms", "Advanced"],
    summary: "Four structured problem domains covering arrays, trees, dynamic programming, and graphs. Hidden tests stay hidden.",
    passingScore: 6,
    type: "mock"
  },
  {
    id: "sql-screen",
    title: "SQL & Data Engineering Screening",
    minutes: 30,
    questions: 8,
    difficulty: "Medium",
    category: "SQL & Data",
    tags: ["SQL", "Analytics", "Database"],
    summary: "Write queries against a normalized e-commerce schema with strict execution cost benchmarks.",
    passingScore: 6,
    type: "mock",
    revealExplanations: false
  },
  {
    id: "frontend-arch",
    title: "Frontend Engineering & React OA",
    minutes: 60,
    questions: 8,
    difficulty: "Hard",
    category: "Frontend & React",
    tags: ["React", "TypeScript", "Frontend"],
    summary: "Component lifecycle, async state synchronization, re-render avoidance, and DOM accessibility standards.",
    passingScore: 7,
    type: "mock"
  }
];

export const MOCK_QUESTIONS = [
  {
    id: "q1",
    prompt: "What does Python's LEGB rule describe?",
    choices: [
      "The exact scope resolution order Python inspects for name bindings (Local, Enclosing, Global, Built-in)",
      "A compression format for CPython bytecode instructions",
      "A PEP-8 linter convention for alphabetical module imports",
      "The memory layout of PyObject pointers inside CPython's arena allocator"
    ],
    answer: 0,
    explanation: "Python evaluates unqualified names following LEGB: first checking the current Local function frame, then lexical Enclosing functions, then Module Global namespace, and finally the __builtins__ dictionary."
  },
  {
    id: "q2",
    prompt: "A nested function reads a name assigned in the enclosing function. Which scope is evaluated first for that name?",
    choices: ["Built-in scope", "Module Global scope", "Lexical Enclosing frame", "The dynamic caller's callstack frame"],
    answer: 2,
    explanation: "Because Python uses static lexical scoping, nested functions inspect their enclosing function's lexical cell variable before evaluating the module's global namespace."
  },
  {
    id: "q3",
    prompt: "Which statement is true of an active Wizly Labs Assessment sitting?",
    choices: [
      "The learner's device may reveal hidden test cases upon request",
      "Deadlines, timer constraints, and grading policies are governed strictly by the exam contract",
      "A third-party webcam proctor is mandatory for score publishing",
      "Scores are ranked against live campus percentiles"
    ],
    answer: 1,
    explanation: "Assessment sittings run sealed under strict deterministic time bounds. Hidden tests remain permanently hidden and scores are strictly private on-device."
  },
  {
    id: "q4",
    prompt: "Which HTTP status code is honest when a resource has been permanently deleted and should never return?",
    choices: ["200 OK with an empty array payload", "404 Not Found", "410 Gone", "500 Internal Server Error"],
    answer: 2,
    explanation: "HTTP 410 Gone explicitly signifies that the target resource was intentionally purged and forwarding addresses do not exist, allowing search engines and caches to purge references."
  },
  {
    id: "q5",
    prompt: "A sliding window pattern is best characterized as:",
    choices: [
      "Two pointers defining a contiguous interval with a verified internal invariant",
      "A nested for-loop scan that uses less stack memory",
      "Quicksort followed by binary search",
      "An asynchronous event stream buffer"
    ],
    answer: 0,
    explanation: "Sliding window bounds a contiguous subsegment with two pointers, expanding and contracting dynamically while preserving an invariant in O(N) linear time."
  },
  {
    id: "q6",
    prompt: "Which public certificate response protects a learner whose record is hidden?",
    choices: [
      "Marked private by the learner",
      "Revoked or expired",
      "The same non-disclosing response used for an unknown record",
      "Ask the verifier to sign in"
    ],
    answer: 2,
    explanation: "Unknown, hidden, and inaccessible certificate records share one response so the public check does not reveal that a record exists."
  },
  {
    id: "q7",
    prompt: "When an SQL INNER JOIN drops rows from the output, why did this happen?",
    choices: [
      "The database engine encountered a syntax defect",
      "The join predicate evaluated to FALSE or NULL for those candidate row pairs",
      "NULL values were automatically converted to integer zero",
      "The cost optimizer pruned tables with lower statistics"
    ],
    answer: 1,
    explanation: "INNER JOIN preserves only those row pairs where the ON condition evaluates strictly to TRUE. Rows evaluating to FALSE or three-valued NULL are excluded."
  },
  {
    id: "q8",
    prompt: "What does 'Coverage' measure in Wizly Labs?",
    choices: [
      "Employer-facing comparative competency percentile",
      "The factual record of what learning material was completed on this device",
      "A regional leaderboard ranking",
      "The hidden-test pass rate on first attempts"
    ],
    answer: 1,
    explanation: "Coverage is the factual audit ledger of completed course lessons, challenges, and labs recorded privately on this device."
  }
];

export const COMPANIES: Company[] = [
  {
    id: "google",
    name: "Google",
    papers: 4,
    summary: "Algorithmic problem solving with heavy emphasis on computational complexity, graph frontiers, and clean idiomatic code.",
    focusAreas: ["Graph Algorithms", "Dynamic Programming", "Concurrency", "Big-O Defense"],
    difficulty: "Hard",
    provenance: "Actual",
    readinessIndex: 84,
    recentForm: 90,
    role: "Software Engineer III (L4)",
    year: "2026"
  },
  {
    id: "microsoft",
    name: "Microsoft",
    papers: 3,
    summary: "System design fundamentals, tree manipulations, and robust error handling in enterprise contexts.",
    focusAreas: ["Trees & Tries", "Object Oriented Design", "System APIs", "Memory Safety"],
    difficulty: "Medium",
    provenance: "Actual",
    readinessIndex: 91,
    recentForm: 94,
    role: "Software Engineer II (SDE-2)",
    year: "2026"
  },
  {
    id: "meta",
    name: "Meta",
    papers: 3,
    summary: "Rapid algorithmic implementation under tight time bounds, strings, arrays, and graph traversals.",
    focusAreas: ["Binary Search", "Hash Tables", "Breadth-First Search", "Sliding Window"],
    difficulty: "Hard",
    provenance: "Actual",
    readinessIndex: 78,
    recentForm: 86,
    role: "Software Engineer (E4/E5)",
    year: "2026"
  },
  {
    id: "amazon",
    name: "Amazon",
    papers: 3,
    summary: "Customer-centric software challenges, multi-threaded queues, and scalable data structure choices.",
    focusAreas: ["Priority Queues", "LRU Caches", "Tree BFS", "Modular Architecture"],
    difficulty: "Medium",
    provenance: "Pattern",
    readinessIndex: 88,
    recentForm: 92,
    role: "SDE II Core Systems",
    year: "2026"
  },
  {
    id: "apple",
    name: "Apple",
    papers: 2,
    summary: "Systems-level precision, memory layouts, pointer management, and deterministic performance.",
    focusAreas: ["Low-level Data Structures", "Bit Manipulation", "POSIX APIs", "Memory Limits"],
    difficulty: "Hard",
    provenance: "Pattern",
    readinessIndex: 82,
    recentForm: 88,
    role: "Software Systems Engineer",
    year: "2026"
  },
  {
    id: "stripe",
    name: "Stripe",
    papers: 2,
    summary: "Clean API contract design, idempotent request processing, and financial transaction state machines.",
    focusAreas: ["HTTP Protocols", "State Machine Parsing", "Clean Code Architecture", "Test Driven Design"],
    difficulty: "Hard",
    provenance: "Actual",
    readinessIndex: 89,
    recentForm: 95,
    role: "Backend Infrastructure Engineer",
    year: "2026"
  }
];

export const COMPANY_QUESTIONS = [
  {
    id: "cq1",
    prompt: "When designing an idempotent payment charge API, what header mechanism ensures duplicate network retries do not double-bill?",
    choices: [
      "A timestamp in the URL path",
      "An Idempotency-Key header verified against a persistent transaction ledger",
      "Setting Cache-Control to no-store",
      "Using HTTP Basic Authentication"
    ],
    answer: 1
  },
  {
    id: "cq2",
    prompt: "Company assessment papers on Wizly Labs report which outcome to the learner?",
    choices: [
      "A pass/fail grade sent directly to hiring managers",
      "A campus percentile compared against peer universities",
      "Your own honest sitting record with detailed breakdown and no external pass/fail badge",
      "An automatic interview guarantee token"
    ],
    answer: 2
  }
];

/** The Company catalogue's per-employer papers — each owned by its company and
 *  opened only from that company's page. Every paper runs the shared company
 *  item bank on this demo, so `questions` names its real size. A paper that
 *  cannot be entered carries its blockedReason instead of a dead link. */
export const COMPANY_PAPERS: CompanyPaper[] = [
  { id: "google-graphs", companyId: "google", title: "Graph Algorithms & Complexity", minutes: 40, questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "strict" },
  { id: "google-dp", companyId: "google", title: "Dynamic Programming Deep Set", minutes: 45, questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "strict" },
  { id: "google-concurrency", companyId: "google", title: "Concurrency & Parallelism", minutes: 35, questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "standard" },
  { id: "google-bigo", companyId: "google", title: "Big-O Defence Drill", minutes: 25, questions: COMPANY_QUESTIONS.length, provenance: "Pattern", strictness: "standard" },
  { id: "microsoft-trees", companyId: "microsoft", title: "Trees & Tries Fundamentals", minutes: 35, questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "standard" },
  { id: "microsoft-ood", companyId: "microsoft", title: "Object-Oriented Design Round", minutes: 40, questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "standard" },
  { id: "microsoft-systems", companyId: "microsoft", title: "System APIs & Memory Safety", minutes: 40, questions: COMPANY_QUESTIONS.length, provenance: "Pattern", strictness: "standard" },
  { id: "meta-search", companyId: "meta", title: "Binary Search & Arrays Sprint", minutes: 30, questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "strict" },
  { id: "meta-hash", companyId: "meta", title: "Hash Tables & Strings", minutes: 30, questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "strict" },
  { id: "meta-bfs", companyId: "meta", title: "BFS & Sliding Window", minutes: 30, questions: COMPANY_QUESTIONS.length, provenance: "Pattern", strictness: "standard" },
  { id: "amazon-queues", companyId: "amazon", title: "Priority Queues & Caching", minutes: 35, questions: COMPANY_QUESTIONS.length, provenance: "Pattern", strictness: "standard" },
  { id: "amazon-bfs", companyId: "amazon", title: "Tree BFS & Modular Design", minutes: 35, questions: COMPANY_QUESTIONS.length, provenance: "Pattern", strictness: "standard" },
  { id: "amazon-scale", companyId: "amazon", title: "Scaling & Modular Architecture", minutes: 40, questions: COMPANY_QUESTIONS.length, provenance: "Pattern", strictness: "standard" },
  { id: "apple-lowlevel", companyId: "apple", title: "Low-Level Data Structures", minutes: 40, questions: COMPANY_QUESTIONS.length, provenance: "Pattern", strictness: "strict" },
  {
    id: "apple-bits", companyId: "apple", title: "Bit Manipulation & Memory Limits", minutes: 35,
    questions: COMPANY_QUESTIONS.length, provenance: "Pattern", strictness: "strict",
    blockedReason: "This paper's availability window has closed."
  },
  { id: "stripe-http", companyId: "stripe", title: "HTTP & Idempotency Design", minutes: 40, questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "strict" },
  {
    id: "stripe-state", companyId: "stripe", title: "State Machines & Clean Architecture", minutes: 40,
    questions: COMPANY_QUESTIONS.length, provenance: "Actual", strictness: "strict",
    blockedReason: "This paper was archived by the publisher — sittings are no longer admitted."
  }
];

export function companyPapersFor(companyId: string): CompanyPaper[] {
  return COMPANY_PAPERS.filter((p) => p.companyId === companyId);
}

export function companyPaperById(id: string | undefined): CompanyPaper | undefined {
  return COMPANY_PAPERS.find((p) => p.id === id);
}

export const ACHIEVEMENTS = [
  { id: "first-solve", title: "First Accepted Solve", detail: "An accepted verdict on any coding challenge.", unlocked: true },
  { id: "week-streak", title: "Seven Quiet Days", detail: "A seven-day continuous learning streak on this device.", unlocked: true },
  { id: "mock-complete", title: "Assessment Sitting Completed", detail: "Submit a mock examination paper. The scorecard is recorded for you.", unlocked: true },
  { id: "course-done", title: "Course Completed", detail: "Every required lesson in a curriculum marked complete.", unlocked: true },
  { id: "debug-detective", title: "Bug Hunter", detail: "Successfully diagnose and patch 3 Debug Detective fault cases.", unlocked: true },
  { id: "polyglot-lab", title: "Polyglot Sandboxer", detail: "Execute code in 3 different languages inside CodeLab.", unlocked: true }
];

export const CERTIFICATES = [
  {
    id: "cert-py-01",
    title: "Foundations of Python",
    awarded: "2 Jun 2026",
    valid: true,
    verificationCode: "WZL-PY-88392-VALID",
    issuedTo: "Yash",
    issuer: "Wizly Labs Accreditation Authority",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    id: "cert-dsa-02",
    title: "Patterns in Data Structures",
    awarded: "18 Jul 2026",
    valid: true,
    verificationCode: "WZL-DSA-99214-VALID",
    issuedTo: "Yash",
    issuer: "Wizly Labs Accreditation Authority",
    hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
  }
];

export const DAILY = {
  id: "balanced-brackets",
  title: "Balanced Brackets",
  difficulty: "Medium" as Difficulty,
  languages: ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go"],
  blurb: "Validate nested bracket sequences using an optimal stack pass and explain why memory is bounded by N/2."
};

export const DAILY_ARCHIVE = [
  { id: "anagram-groups", title: "Group Anagrams", day: "19 Aug 2026", difficulty: "Medium" as Difficulty, status: "Solved" },
  { id: "unique-paths", title: "Grid Unique Paths", day: "18 Aug 2026", difficulty: "Hard" as Difficulty, status: "Solved" },
  { id: "two-sum", title: "Two Sum", day: "17 Aug 2026", difficulty: "Easy" as Difficulty, status: "Solved" },
  { id: "binary-search", title: "Binary Search", day: "16 Aug 2026", difficulty: "Easy" as Difficulty, status: "Solved" },
  { id: "merge-intervals", title: "Merge Overlapping Intervals", day: "15 Aug 2026", difficulty: "Medium" as Difficulty, status: "Attempted" },
  { id: "valid-bst", title: "Validate Binary Search Tree", day: "14 Aug 2026", difficulty: "Medium" as Difficulty, status: "Solved" }
];

export const DEBUG_CASES = [
  {
    id: "window-overrun",
    title: "Off-by-one in a Sliding Window",
    difficulty: "Medium" as Difficulty,
    snippet: `def max_subarray_sum(nums, k):\n    best = 0\n    for i in range(len(nums)):\n        window = nums[i:i+k]\n        if sum(window) > best:\n            best = sum(window)\n    return best`,
    brief: "The slice bounds overrun the end of the array when `i + k > len(nums)`. Refactor the loop range to avoid evaluating truncated slices."
  },
  {
    id: "closed-over-loop",
    title: "Closed-over Loop Variable Binding",
    difficulty: "Easy" as Difficulty,
    snippet: `handlers = []\nfor i in range(3):\n    handlers.append(lambda: i)\n\nprint([h() for h in handlers]) # Prints [2, 2, 2] instead of [0, 1, 2]`,
    brief: "Each lambda captures the cell reference of variable `i`, which holds `2` when the loop completes. Fix with default argument binding."
  },
  {
    id: "mutable-default-arg",
    title: "Mutable Default Argument Leak",
    difficulty: "Easy" as Difficulty,
    snippet: `def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item('apple'))\nprint(add_item('banana')) # Returns ['apple', 'banana']!`,
    brief: "The default list is instantiated once at function definition time, creating an unintended shared memory state. Fix with a None sentinel."
  },
  {
    id: "async-race-condition",
    title: "Async Microtask Race Condition",
    difficulty: "Hard" as Difficulty,
    snippet: `let balance = 100;\n\nasync function withdraw(amount) {\n  if (balance >= amount) {\n    await fetch('/audit-log');\n    balance -= amount;\n  }\n}`,
    brief: "Interleaving async operations during the `await` gap allows concurrent withdrawals before balance deduction. Implement optimistic locking."
  }
];

export const SKILLS = [
  {
    id: "python",
    title: "Python 3 & Runtime Internals",
    courseId: "python-foundations",
    evidence: "6 lessons completed · 14 challenge solves · OA Mock Set 01 accepted (100%)",
    masteryLevel: "Proficient",
    subskills: ["LEGB Scope Rules", "Closures & Bytecode", "Decorators", "Memory Reference Management"]
  },
  {
    id: "dsa",
    title: "Algorithms & Data Structures",
    courseId: "dsa-patterns",
    evidence: "18 track challenges accepted · Monotonic Stack verified",
    masteryLevel: "Advanced",
    subskills: ["Two Pointers", "Sliding Windows", "Dynamic Programming", "Graph Frontiers"]
  },
  {
    id: "sql",
    title: "Relational SQL & Query Planning",
    courseId: "sql-readiness",
    evidence: "SQL screening passed · Window function drills completed",
    masteryLevel: "Intermediate",
    subskills: ["Window Functions", "Index Selectivity", "Query Planner Inspection", "CTEs"]
  },
  {
    id: "javascript",
    title: "Modern JavaScript & Async Engine",
    courseId: "js-runtime",
    evidence: "Event loop microtask exercises verified",
    masteryLevel: "Intermediate",
    subskills: ["Event Loop", "Promises & Async/Await", "Prototypes", "V8 Memory Management"]
  },
  {
    id: "systems",
    title: "Unix Systems & Shell Architecture",
    courseId: "systems-unix",
    evidence: "Process signal drills completed",
    masteryLevel: "Intermediate",
    subskills: ["Pipes & Redirection", "Signal Handling", "File Descriptors", "Process Forking"]
  }
];

export const PROJECT_TEMPLATES = [
  {
    id: "notes-cli",
    title: "Notes CLI Utility",
    summary: "A pure terminal note-taking tool. Structured JSON storage with zero network overhead.",
    language: "Python",
    fileCount: 3
  },
  {
    id: "bracket-lab",
    title: "Bracket Parser & Visualizer",
    summary: "Step through lexical syntax analysis with stack state frames.",
    language: "Python",
    fileCount: 4
  },
  {
    id: "fastapi-service",
    title: "FastAPI Clean Architecture Service",
    summary: "Asynchronous REST backend with dependency injection and Pydantic validation.",
    language: "Python",
    fileCount: 5
  },
  {
    id: "react-design-system",
    title: "Accessible Design System Components",
    summary: "Component library boilerplate with accessible keyboard focus rings and token variables.",
    language: "TypeScript",
    fileCount: 6
  }
];

export const TOPIC_REQUESTS: TopicRequest[] = [
  {
    id: "req-1",
    title: "Rust Concurrency & Actor Model Patterns",
    description: "Deep-dive course on tokio, channels, sync primitives, and building lock-free actor pipelines in Rust.",
    author: "Kavya S.",
    upvotes: 84,
    status: "In Authoring",
    sourceArea: "Courses",
    tags: ["Rust", "Concurrency", "Systems"],
    createdAt: "12 Aug 2026"
  },
  {
    id: "req-2",
    title: "Distributed Consensus & Raft from Scratch",
    description: "Build a minimal 3-node Raft consensus cluster handling leader election and log replication.",
    author: "Arjun M.",
    upvotes: 62,
    status: "Planned",
    sourceArea: "Projects",
    tags: ["Distributed Systems", "Go", "Networking"],
    createdAt: "14 Aug 2026"
  },
  {
    id: "req-3",
    title: "Advanced Postgres Indexing & Query Tuning",
    description: "Hands-on analysis of B-Tree vs GIN/GiST indexes, EXPLAIN ANALYZE execution plans, and partial indexes.",
    author: "Pooja V.",
    upvotes: 49,
    status: "Under Review",
    sourceArea: "Challenges",
    tags: ["SQL", "Databases", "Performance"],
    createdAt: "16 Aug 2026"
  },
  {
    id: "req-4",
    title: "WebGL & Shader Canvas Engineering",
    description: "Creating custom GPU shader materials and particle meshes without external frameworks.",
    author: "Rohan D.",
    upvotes: 31,
    status: "Under Review",
    sourceArea: "CodeLab",
    tags: ["Frontend", "Graphics", "Canvas"],
    createdAt: "18 Aug 2026"
  }
];

export const HELP_TOPICS = [
  { id: "membership", title: "What membership opens", body: "One membership opens the whole platform. Nothing is priced per title, and no microtransactions exist." },
  { id: "privacy", title: "How learner data stays private", body: "Notes, projects, and assessment results remain learner-only. Public certificate checks disclose only a valid awarding event." },
  { id: "integrity", title: "Assessment integrity standards", body: "Integrity checks run locally as deterministic event logs — never invasive background surveillance." }
];

export const NOTIFICATIONS = [
  { id: "n1", title: "First assessment sitting completed", body: "A private milestone was recorded after your completed sitting.", unread: true, time: "just now", category: "Achievements" },
  { id: "n2", title: "Level 14 recorded", body: "Your experience ledger crossed the next level boundary.", unread: true, time: "12m ago", category: "Level Ups" },
  { id: "n3", title: "Daily window active: Balanced Brackets", body: "Today's challenge is ready. Complete it before the platform day closes.", unread: false, time: "2h ago", category: "Daily Challenges" },
  { id: "n4", title: "Twenty-three day streak", body: "A streak milestone was recorded from eligible daily activity.", unread: false, time: "yesterday", category: "Streaks" },
  { id: "n5", title: "Mock paper settings updated", body: "The time limit changed from 45 to 50 minutes. Your prior results are unchanged.", unread: false, time: "2d ago", category: "Mock Tests" },
  { id: "n6", title: "Company paper repaired", body: "A result was corrected. The sitting was not restored and no pass/fail was created.", unread: false, time: "3d ago", category: "Company Tests" },
  { id: "n7", title: "Closures in Practice lab published", body: "A focused Python lab was added to Foundations of Python.", unread: false, time: "4d ago", category: "System" }
];
