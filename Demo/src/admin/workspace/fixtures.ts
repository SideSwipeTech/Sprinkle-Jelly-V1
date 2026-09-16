/**
 * fixtures.ts — the template studio's fixture state.
 *
 * Every record a screen here reads is local: no store writes, no network.
 * Templates are the workspace domain's starter templates; names echo the real
 * catalogue entries (@data/catalog PROJECT_TEMPLATES / adminTemplates).
 *
 * The bounds named in copy are the platform's own placeholder names
 * (docs/product/DEFERRED.md): WORKSPACE_PROJECT_FILE_CEILING 40 files,
 * WORKSPACE_PROJECT_BYTES 20 MB, WORKSPACE_TASK_LIMIT 12 tasks,
 * WORKSPACE_PATH_CHARACTERS 240, WORKSPACE_INSTRUCTION_CHARACTERS 500.
 */

import type { EditorFile } from "@components/CodeEditor";

export const FILE_CEILING = 40; // WORKSPACE_PROJECT_FILE_CEILING
export const PROJECT_BYTES = 20_000_000; // WORKSPACE_PROJECT_BYTES — 20 MB
export const TASK_LIMIT = 12; // WORKSPACE_TASK_LIMIT
export const PATH_CHARACTERS = 240; // WORKSPACE_PATH_CHARACTERS
export const INSTRUCTION_CHARACTERS = 500; // WORKSPACE_INSTRUCTION_CHARACTERS
export const TEXT_FILE_BYTES = 2_097_152; // WORKSPACE_TEXT_FILE_BYTES — 2 MiB

/** The fixed page size the studio index pages at — PLATFORM_LIST_PAGE_ITEMS. */
export const PLATFORM_LIST_PAGE_ITEMS = 20;

export type TemplateLifecycle = "draft" | "published" | "archived";
export type TemplateLevel = "Beginner" | "Intermediate" | "Advanced";
export type TemplateLane = "terminal" | "browser";

export interface TemplateRuntime {
  id: string;
  label: string;
  lane: TemplateLane;
  /** A runtime awaiting rehearsal cannot be chosen — the refusal lands at choosing. */
  unavailableReason?: string;
}

/** Selectable runtimes come from the one runtime registry, not a list of this page's. */
export const TEMPLATE_RUNTIMES: TemplateRuntime[] = [
  { id: "python-3.12", label: "Python 3.12", lane: "terminal" },
  { id: "node-20", label: "Node 20", lane: "terminal" },
  { id: "go-1.22", label: "Go 1.22", lane: "terminal" },
  { id: "browser-web", label: "Browser — HTML/CSS/JS preview", lane: "browser" },
  {
    id: "java-21",
    label: "Java 21",
    lane: "terminal",
    unavailableReason: "awaiting rehearsal — its starter does not yet run as written"
  }
];

export interface CheckRun {
  ok: boolean;
  at: string;
  output: string;
}

export interface StudioTemplate {
  id: string;
  name: string;
  description: string;
  level: TemplateLevel;
  /** Primary skill + topic — publication refuses without them. */
  skill: string;
  topic: string;
  runtime: string;
  /** The file a run starts from — an authored fact, not a per-run choice. */
  entryPath: string;
  files: EditorFile[];
  /** The learner checklist the template ships — task titles, ordered. */
  checklist: string[];
  lifecycle: TemplateLifecycle;
  revision: number;
  /** Projects already created from this template — the destruction's blast
   *  radius. null = the count could not be produced; it is never a zero. */
  dependents: number | null;
  /** The publish gate's last reference run of the starter. A browser-preview
   *  runtime has none — rendering as written is an author's-checklist item. */
  checkRun?: CheckRun;
  /** Fixture flag: another author saved while this draft is open — the
   *  keep-mine / take-theirs choice surfaces. */
  concurrentEdit?: { author: string; revision: number; at: string };
}

export const STUDIO_SKILLS = [
  "Python 3 & Runtime Internals",
  "Algorithms & Data Structures",
  "Modern JavaScript & Async Engine",
  "Relational SQL & Query Planning",
  "Unix Systems & Shell Architecture"
];

export const STUDIO_TOPICS = [
  "Language foundations",
  "Data Structures",
  "Frontend interfaces",
  "Backend services",
  "Tooling"
];

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    id: "notes-cli",
    name: "Notes CLI Utility",
    description:
      "A pure terminal note-taking tool. Structured JSON storage with zero network overhead — the first project a Python learner finishes.",
    level: "Beginner",
    skill: "Python 3 & Runtime Internals",
    topic: "Language foundations",
    runtime: "python-3.12",
    entryPath: "main.py",
    lifecycle: "published",
    revision: 14,
    dependents: 38,
    checkRun: {
      ok: true,
      at: "this fixture's open",
      output:
        "$ python main.py --selfcheck\nselfcheck · store round-trip ok\nselfcheck · add/list/del commands parse\nexit 0 · starter runs as written"
    },
    files: [
      {
        path: "main.py",
        content: `from notes.store import NoteStore\n\ndef main() -> None:\n    store = NoteStore("notes.json")\n    # TODO: wire the "add" command to the store\n    print("notes — a tiny terminal notebook")\n\nif __name__ == "__main__":\n    main()\n`
      },
      {
        path: "notes/store.py",
        content: `import json\nfrom pathlib import Path\n\nclass NoteStore:\n    def __init__(self, path: str) -> None:\n        self.path = Path(path)\n\n    def all(self) -> list[str]:\n        if not self.path.exists():\n            return []\n        return json.loads(self.path.read_text())\n\n    def add(self, text: str) -> None:\n        notes = self.all()\n        notes.append(text)\n        self.path.write_text(json.dumps(notes, indent=2))\n`
      },
      {
        path: "README.md",
        content: `# Notes CLI\n\nAdd, list and delete notes from the terminal.\n\n## The checklist\n\n- Wire the add command to the store\n- Persist notes to notes.json\n- Handle an empty notebook plainly\n`
      }
    ],
    checklist: [
      "Wire the add command to the store",
      "Persist notes to notes.json",
      "Handle an empty notebook plainly"
    ]
  },
  {
    id: "bracket-lab",
    name: "Bracket Parser & Visualizer",
    description:
      "Step through lexical syntax analysis with stack state frames — pairs with the Balanced Brackets challenge.",
    level: "Intermediate",
    skill: "Algorithms & Data Structures",
    topic: "Data Structures",
    runtime: "python-3.12",
    entryPath: "main.py",
    lifecycle: "draft",
    revision: 6,
    dependents: 0,
    concurrentEdit: { author: "Meera", revision: 7, at: "14:02" },
    checkRun: {
      ok: true,
      at: "this fixture's open",
      output: "$ python main.py --selfcheck\nselfcheck · frames render for []{}()\nexit 0 · starter runs as written"
    },
    files: [
      {
        path: "main.py",
        content: `from parser import frames\n\ndef main() -> None:\n    for frame in frames("[]({})"):\n        print(frame)\n\nif __name__ == "__main__":\n    main()\n`
      },
      {
        path: "parser.py",
        content: `def frames(source: str) -> list[str]:\n    """Yield one printable stack frame per character."""\n    stack: list[str] = []\n    out: list[str] = []\n    for ch in source:\n        # TODO: push openers, pop on closers\n        out.append(f"{ch!r:6} stack={stack}")\n    return out\n`
      },
      { path: "README.md", content: "# Bracket Lab\n\nWatch the stack decide.\n" }
    ],
    checklist: ["Push openers onto the stack", "Pop and match on closers", "Print one frame per character"]
  },
  {
    id: "fastapi-service",
    name: "FastAPI Clean Architecture Service",
    description:
      "Asynchronous REST backend with dependency injection and Pydantic validation.",
    level: "Advanced",
    skill: "Python 3 & Runtime Internals",
    topic: "Backend services",
    runtime: "python-3.12",
    entryPath: "main.py",
    lifecycle: "draft",
    revision: 3,
    dependents: null,
    checkRun: {
      ok: false,
      at: "this fixture's open",
      output:
        "$ python main.py\nTraceback (most recent call last):\n  File \"main.py\", line 1, in <module>\n    from fastapi import FastAPI\nModuleNotFoundError: No module named 'fastapi'\nexit 1 · the starter does not run as written"
    },
    files: [
      {
        path: "main.py",
        content: `from fastapi import FastAPI\nfrom app.routes import router\n\napp = FastAPI(title="clean-service")\napp.include_router(router)\n`
      },
      {
        path: "app/routes.py",
        content: `from fastapi import APIRouter\n\nrouter = APIRouter()\n\n@router.get("/health")\ndef health() -> dict[str, str]:\n    return {"status": "ok"}\n`
      },
      {
        path: "requirements.txt",
        content: "fastapi\nuvicorn\npydantic\n"
      }
    ],
    checklist: ["Declare the pinned dependencies", "Run the service locally", "Add one route of your own"]
  },
  {
    id: "react-design-system",
    name: "Accessible Design System Components",
    description:
      "Component library boilerplate with accessible keyboard focus rings and token variables.",
    level: "Intermediate",
    skill: "Modern JavaScript & Async Engine",
    topic: "Frontend interfaces",
    runtime: "browser-web",
    entryPath: "index.html",
    lifecycle: "published",
    revision: 9,
    dependents: 12,
    files: [
      {
        path: "index.html",
        content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <link rel="stylesheet" href="styles.css" />\n    <title>Design system starter</title>\n  </head>\n  <body>\n    <main id="app">\n      <!-- TODO: mount your first component here -->\n    </main>\n  </body>\n</html>\n`
      },
      {
        path: "styles.css",
        content: `:root {\n  --focus-ring: #4f46e5;\n}\n\n:focus-visible {\n  outline: 2px solid var(--focus-ring);\n  outline-offset: 2px;\n}\n`
      },
      {
        path: "README.md",
        content: "# Design system starter\n\nA browser-preview project — there is no run; the page renders.\n"
      }
    ],
    checklist: ["Mount a button component", "Verify its focus ring", "Name its tokens"]
  },
  {
    id: "weather-dashboard",
    name: "Weather Dashboard",
    description: "Fetch-and-render dashboard over a public weather API.",
    level: "Beginner",
    skill: "Modern JavaScript & Async Engine",
    topic: "Frontend interfaces",
    runtime: "browser-web",
    entryPath: "index.html",
    lifecycle: "archived",
    revision: 21,
    dependents: 57,
    files: [
      { path: "index.html", content: "<!doctype html>\n<html><body>archived</body></html>\n" }
    ],
    checklist: ["Fetch the feed", "Render the week strip"]
  }
];

/** The pristine blank draft `templates/new` opens on. */
export function blankDraft(): StudioTemplate {
  return {
    id: "new",
    name: "Untitled starter",
    description: "",
    level: "Beginner",
    skill: "",
    topic: "",
    runtime: "python-3.12",
    entryPath: "main.py",
    files: [
      { path: "main.py", content: "# The runtime's provided starter.\n" },
      { path: "README.md", content: "# Untitled starter\n" }
    ],
    checklist: [],
    lifecycle: "draft",
    revision: 0,
    dependents: 0
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}
