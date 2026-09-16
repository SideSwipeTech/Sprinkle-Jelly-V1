import type { AppRole } from "@admin/roles";
import { readPersistedRole } from "@admin/roles";
import type { Store } from "./store";

export function createDemoStore(role: AppRole = readPersistedRole()): Store {
  return {
    enrolled: ["python-foundations", "dsa-patterns", "sql-readiness", "js-runtime"],
    // The last place the learner was active: Closures in Practice, with
    // 3 of 7 published lessons covered (43%). The percent field is a
    // denormalised cache — every surface derives the live figure itself.
    continue: { courseId: "python-foundations", lessonId: "closures-in-practice", percent: 43, family: "interactive" },
    completedLessons: [
      "functions-and-scope",
      "names-and-assignment",
      "lists-without-alias-bugs",
      "two-pointers-technique"
    ],
    coursePublications: {},
    videoProgress: { "dsa-studio-01": [0, 1] },
    notes: [
      { id: "n0", text: "LEGB is lookup order: Local -> Enclosing -> Global -> Built-in. Write it down before starting the OA.", at: "Today · 2:18 PM" },
      { id: "n1", text: "Window invariant: Every index in [left, right] satisfies frequency constraint <= k.", at: "Yesterday · 7:04 PM" },
      { id: "n2", text: "Monotonic stack: Push indices for next greater element; pop whenever current > stack top.", at: "3 days ago" },
      { id: "n3", text: "Postgres EXPLAIN ANALYZE: Check Seq Scan vs Index Scan cost bounds.", at: "5 days ago" }
    ],
    credits: 42,
    creditClaimed: true,
    mockResults: [
      {
        paperId: "oa-python-01",
        score: 8,
        at: "2026-08-16T10:40:00.000Z",
        answers: [0, 2, 1, 2, 0, 1, 1, 1]
      },
      /* Invalidated — the measured attempt was restored (the paper can be sat
         again) and open practice re-locked. History keeps the row flagged. */
      {
        paperId: "dsa-90",
        score: 7,
        at: "2026-08-10T14:30:00.000Z",
        answers: [0, 2, 1, 2, 0, 1, 1, 0],
        invalidation: {
          reason: "The authored content was wrong",
          at: "2026-08-12T09:15:00.000Z"
        }
      },
      /* sql-screen finalizes with revealExplanations off — its scorecard shows
         the sealed-review gate. */
      {
        paperId: "sql-screen",
        score: 7,
        at: "2026-08-05T11:05:00.000Z",
        answers: [0, 2, -1, 2, 0, 1, 1, 1]
      }
    ],
    companyResults: [
      { companyId: "google", paperId: "google-graphs", paperTitle: "Graph Algorithms & Complexity", at: "2026-08-14T16:20:00.000Z", answered: 2, total: 2 },
      /* Invalidated — the attempt is restored and the row stays flagged. */
      {
        companyId: "microsoft",
        paperId: "microsoft-trees",
        paperTitle: "Trees & Tries Fundamentals",
        at: "2026-08-08T15:12:00.000Z",
        answered: 1,
        total: 2,
        invalidation: {
          reason: "The authored content was wrong",
          at: "2026-08-09T08:40:00.000Z"
        }
      }
    ],
    solved: [
      "two-sum",
      "balanced-brackets",
      "binary-search",
      "anagram-groups",
      "valid-bst"
    ],
    /* Practice slice seeds — the learner's own submissions, device drafts,
       completed daily dates, debug state and track completions. */
    submitted: ["merge-intervals"],
    challengeDrafts: {
      /* Today's Daily already carries a device draft — the overview's one
         action reads Continue until it is submitted. */
      "balanced-brackets:python":
        "def solve(s: str) -> bool:\n    stack = []\n    pairs = {')': '(', ']': '[', '}': '{'}\n    for ch in s:\n        # TODO: finish the matching branch\n"
    },
    submissions: [
      { id: "sub-seed-6", challengeId: "two-sum", language: "python", verdict: "accepted", casesPassed: 38, casesTotal: 38, at: "2026-08-20T09:12:00.000Z" },
      { id: "sub-seed-5", challengeId: "anagram-groups", language: "python", verdict: "accepted", casesPassed: 27, casesTotal: 27, at: "2026-08-19T18:40:00.000Z" },
      { id: "sub-seed-4", challengeId: "valid-bst", language: "python", verdict: "accepted", casesPassed: 31, casesTotal: 31, at: "2026-08-15T08:05:00.000Z" },
      { id: "sub-seed-3", challengeId: "balanced-brackets", language: "python", verdict: "accepted", casesPassed: 22, casesTotal: 22, at: "2026-08-11T20:30:00.000Z" },
      { id: "sub-seed-2", challengeId: "binary-search", language: "python", verdict: "accepted", casesPassed: 19, casesTotal: 19, at: "2026-08-06T07:50:00.000Z" },
      { id: "sub-seed-1", challengeId: "merge-intervals", language: "python", verdict: "wrong_answer", casesPassed: 4, casesTotal: 21, at: "2026-08-03T16:22:00.000Z" }
    ],
    /* Product dates already completed — the schedule's other past dates stay
       open for catch-up at the full award. */
    dailySolved: ["2026-08-06", "2026-08-09", "2026-08-12", "2026-08-17", "2026-08-19", "2026-08-20"],
    debugSubmitted: [],
    debugSubmissions: [],
    debugWindow: null,
    debugWindowsUsed: {},
    trackCompletions: {},
    session: { signedIn: true, name: "Yash", role },
    notificationsRead: ["n4"],
    searchQuery: "",
    debugResolved: ["closed-over-loop", "window-overrun", "mutable-default-arg"],
    projects: [
      {
        id: "proj-weather",
        name: "weather-dashboard",
        template: "notes-cli",
        at: "2026-08-10T09:00:00.000Z",
        activePath: "main.py",
        output: "Bengaluru: 24 C, monsoon sample\nExecution completed with status code 0.",
        files: [
          {
            path: "main.py",
            content: "from weather import fetch_forecast\n\ndef main():\n    city = 'Bengaluru'\n    print(fetch_forecast(city))\n\nif __name__ == '__main__':\n    main()\n"
          },
          {
            path: "weather.py",
            content: "def fetch_forecast(city: str) -> str:\n    # Deterministic local sample fixture\n    return f'{city}: 24 C, monsoon sample'\n"
          },
          {
            path: "README.md",
            content: "# weather-dashboard\n\nA compact Python CLI dashboard for weather forecasts.\n"
          }
        ]
      },
      {
        id: "proj-brackets",
        name: "syntax-parser-lab",
        template: "bracket-lab",
        at: "2026-08-15T11:20:00.000Z",
        activePath: "parser.py",
        output: "All 12 AST validation test cases passed.",
        files: [
          {
            path: "parser.py",
            content: "def validate_tokens(stream):\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for token in stream:\n        if token in pairs.values():\n            stack.append(token)\n        elif token in pairs:\n            if not stack or stack.pop() != pairs[token]:\n                return False\n    return len(stack) == 0\n"
          },
          {
            path: "test_parser.py",
            content: "from parser import validate_tokens\n\ndef test_suite():\n    assert validate_tokens('({[]})') == True\n    assert validate_tokens('([)]') == False\n    print('All tests passed!')\n\nif __name__ == '__main__':\n    test_suite()\n"
          }
        ]
      }
    ],
    lessonNotes: {
      "functions-and-scope": "Local first. If it isn't there, enclosing, then global, then built-in.",
      "names-and-assignment": "Assignment binds a name reference in the frame dictionary; it does not clone the object buffer."
    },
    notifPrefs: { product: true },
    creditLedger: [
      { id: "g0", at: "1 Aug 2026", delta: 40, reason: "Monthly allowance grant" },
      { id: "g1", at: "8 Aug 2026", delta: -1, reason: "Hint 1 reserved on Balanced Brackets" },
      { id: "g2", at: "12 Aug 2026", delta: -2, reason: "Diagnostic report on LRU Cache" },
      { id: "g3", at: "15 Aug 2026", delta: 5, reason: "Bug bounty finding on CodeLab runner" }
    ],
    codelabFiles: {},
    scratchpad: "# Quick Notes\n\n- LEGB is lookup order: Local -> Enclosing -> Global -> Built-in.\n- Sliding window invariant: [left, right] satisfies frequency <= k.\n- Monotonic stack: Pop whenever current element > top element.\n- Postgres EXPLAIN ANALYZE: Check Seq Scan vs Index Scan cost bounds.",
    userSettings: {
      theme: "matrix",
      reducedMotion: false,
      companion: "companion",
      companionVolume: "present",
      companionName: "",
      editorTabSize: 2,
      lineNumbers: true,
      wordWrap: true,
      displayName: "Yash"
    },
    profile: {
      level: 14,
      xp: 28450,
      xpToNext: 950,
      streak: 23,
      solvedCount: 142,
      membershipEnd: "12 Mar 2031"
    },
    certificates: [
      {
        id: "cert-py-01",
        title: "Foundations of Python",
        awarded: "2 Jun 2026",
        valid: true,
        visibility: "public",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        issuer: "Wizly Labs Accreditation Authority"
      },
      {
        id: "cert-dsa-02",
        title: "Patterns in Data Structures",
        awarded: "18 Jul 2026",
        valid: true,
        visibility: "public",
        hash: "a9f4c3b281de2e478901bcda9384729184758291048274910283749281726354",
        issuer: "Wizly Labs Accreditation Authority"
      }
    ],
    adminUsers: [
      { id: "u-yash", name: "Yash", email: "yash@labs.local", status: "active", enrolled: ["python-foundations", "dsa-patterns", "sql-readiness"], credits: 42 },
      { id: "u-meera", name: "Meera", email: "meera@labs.local", status: "active", enrolled: ["dsa-patterns"], credits: 28 },
      { id: "u-arun", name: "Arun", email: "arun@labs.local", status: "disabled", enrolled: [], credits: 0 },
      { id: "u-kira", name: "Kira", email: "kira@labs.local", status: "active", enrolled: ["sql-readiness", "js-runtime"], credits: 19 },
      { id: "u-devan", name: "Devan", email: "devan@labs.local", status: "active", enrolled: ["react-interfaces"], credits: 35 }
    ],
    adminCourses: [
      { id: "python-foundations", title: "Foundations of Python", lifecycle: "published", revision: 18, container: "Language Foundations" },
      { id: "dsa-patterns", title: "Patterns in Data Structures", lifecycle: "published", revision: 9, container: "Algorithms" },
      { id: "sql-readiness", title: "SQL for Readiness", lifecycle: "published", revision: 6, container: "Data" },
      { id: "http-apis", title: "HTTP and API Design", lifecycle: "submitted", revision: 3, container: "Backend" },
      { id: "complexity", title: "Time and Space, Honestly", lifecycle: "draft", revision: 2, container: "Interview Prep" }
    ],
    adminChallenges: [
      { id: "two-sum", title: "Two Sum", lifecycle: "published", revision: 5 },
      { id: "balanced-brackets", title: "Balanced Brackets", lifecycle: "published", revision: 4 },
      { id: "anagram-groups", title: "Group Anagrams", lifecycle: "published", revision: 2 },
      { id: "unique-paths", title: "Grid Unique Paths", lifecycle: "submitted", revision: 1 },
      { id: "valid-bst", title: "Validate Binary Search Tree", lifecycle: "published", revision: 3 }
    ],
    adminReports: [
      { id: "r1", target: "Balanced Brackets", domain: "challenges", status: "open", note: "Add TypeScript edge case snippet", editor: "/admin/challenges" },
      { id: "r2", target: "Foundations of Python", domain: "courses", status: "in_review", note: "Expand closures section", editor: "/admin/curriculum" },
      { id: "r3", target: "weather-dashboard", domain: "projects", status: "resolved", note: "Verified CLI sandbox dependencies", editor: "/admin/templates" }
    ],
    adminBroadcasts: [
      { id: "b1", body: "Foundations of Python studio hours live this week.", status: "finished", estimated: 1200, delivered: 1184, failed: 6, skipped: 10, stopped: 0 },
      { id: "b2", body: "Monthly credit grant dispatched to all active memberships.", status: "finished", estimated: 2400, delivered: 2398, failed: 2, skipped: 0, stopped: 0 },
      { id: "b3", body: "Daily window reminder — not a competitive ranking.", status: "held", estimated: null, delivered: 0, failed: 0, skipped: 0, stopped: 0 }
    ],
    adminApprovals: [
      { id: "a1", kind: "course", title: "HTTP and API Design", revision: 3, status: "pending" },
      { id: "a2", kind: "challenge", title: "Grid Unique Paths", revision: 1, status: "pending" }
    ],
    adminTickets: [
      { id: "t1", title: "Request: Rust Concurrency track", status: "open" },
      { id: "t2", title: "Request: More SQL window function drill papers", status: "in_review" },
      { id: "t3", title: "Request: Distributed Systems Raft tutorial", status: "open" }
    ],
    adminAudit: [
      { id: "au1", at: "16 Aug 2026", actor: "Yash", action: "Published Python Studio Hours v2" },
      { id: "au2", at: "14 Aug 2026", actor: "Meera", action: "Submitted HTTP and API Design for staff review" },
      { id: "au3", at: "12 Aug 2026", actor: "System", action: "Automated monthly credit allowance grant cycle completed" }
    ],
    adminSuggestion: { item: "Foundations of Python", line: "Continue the closures sequence." },
    adminDailyGap: "22 Aug 2026",
    adminEditorial: [
      { id: "ed-brackets", title: "Balanced Brackets", body: "A linear stack pass. Push openers; a closer must match the most recent unmatched opener. Hidden tests stay hidden." },
      { id: "ed-twosum", title: "Two Sum", body: "Maintain a value-to-index map during a single linear sweep. Look for target - current." }
    ],
    adminTaxonomy: [
      { id: "tx-py", label: "Python", parent: "Languages", archived: false },
      { id: "tx-fn", label: "Functions", parent: "Language foundations", archived: false },
      { id: "tx-dsa", label: "Data Structures", parent: "Computer Science", archived: false },
      { id: "tx-sql", label: "Relational Databases", parent: "Data Engineering", archived: false }
    ],
    adminTracks: [
      { id: "arrays", title: "Arrays & Hashing", count: 42, outline: "Two sum -> Group anagrams -> Longest substring -> First missing positive" },
      { id: "graphs", title: "Graphs & Topological Sort", count: 28, outline: "BFS frontier -> Dijkstra shortest path -> Course schedule" }
    ],
    adminTemplates: [
      { id: "notes-cli", title: "Notes CLI Utility", summary: "A local notes tool. Structured JSON storage with zero network overhead." },
      { id: "bracket-lab", title: "Bracket Parser & Visualizer", summary: "A parser you can step through with stack state frames." },
      { id: "fastapi-service", title: "FastAPI Clean Architecture Service", summary: "Asynchronous REST backend with dependency injection." }
    ],
    adminPapers: [
      { id: "oa-python-01", title: "Python OA — Standard Set", kind: "mock", minutes: 45, locked: true, settings: "Attempt cap 2 · time 45m" },
      { id: "dsa-90", title: "DSA Comprehensive 90-Minute Paper", kind: "mock", minutes: 90, locked: true, settings: "Attempt cap 1 · time 90m" },
      { id: "google", title: "Google Algorithmic OA", kind: "company", minutes: 60, locked: true, settings: "Type Company · Pass/Fail Off" }
    ],
    adminKnowledge: [
      { id: "kb1", title: "What Coverage Means", body: "Coverage records what was covered on this device. It never claims competitive mastery.", published: true },
      { id: "kb2", title: "Assessment privacy", body: "Assessment results remain learner-only and are never transmitted to employers.", published: true },
      { id: "kb3", title: "Integrity Events", body: "Recorded as deterministic local events — never via intrusive webcam monitoring.", published: true }
    ],
    adminDebugCases: [
      { id: "window-overrun", title: "Off-by-one in a Sliding Window", lifecycle: "published" },
      { id: "closed-over-loop", title: "Closed-over Loop Variable", lifecycle: "published" },
      { id: "mutable-default-arg", title: "Mutable Default Argument Leak", lifecycle: "published" }
    ],
    assistant: {
      note: "Default name is fixed. Learners rename only their own assistant.",
      responses: "Refuse ranking. Refuse employer judgment. Cite authored material only.",
      nudges: "Daily window reminder — not a ranking. Off by default for new accounts.",
      gate: "score 0.62 · margin 0.08 · version 3"
    },
    identityEvents: [
      { id: "ie1", kind: "Membership start · Yash", age: "6m", state: "waiting", error: "" },
      { id: "ie2", kind: "Posture verification · Meera", age: "2h", state: "applied", error: "" }
    ],
    failedRewards: [
      { id: "rw1", person: "Yash", amount: 40, retried: false }
    ],
    lifecycleHold: false,
    maintenanceNote: "",
    searchMisses: [{ phrase: "rust actor model" }, { phrase: "raft consensus" }]
  };
}
