import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { LESSONS, SKILLS } from "@data/catalog";
import { useStore } from "@state/useStore";
import { CodeEditor, detectLanguage, type SupportedLanguage } from "@components/CodeEditor";
import { EditorTabs, type EditorFile } from "@components/CodeEditor/EditorTabs";
import { Terminal } from "@components/CodeEditor/Terminal";
import { FileExplorer } from "@components/CodeEditor/FileExplorer";

/* The courses pages split into ./learn — catalogue, subject orientation, the
   focused reader and the video-course surface all read the one adapter
   (@data/courses-demo). These re-exports keep App.tsx's imports stable. */
export { Courses } from "./learn/catalogue";
export { CourseDetail } from "./learn/subject";
export { LessonReader } from "./learn/reader";
export { VideoLesson } from "./learn/video";
export { CourseQuiz, CourseProject, CourseChanges } from "./learn/deep-links";

const CODELAB_TEMPLATES: Record<string, { files: EditorFile[]; lang: SupportedLanguage }> = {
  python: {
    lang: "python",
    files: [
      {
        path: "main.py",
        content: `def is_balanced(s: str) -> bool:
    """
    Return True only when every () [] {} pair closes in order.
    Other characters may appear and should be ignored.
    """
    stack = []
    pair = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pair:
            if not stack or stack.pop() != pair[ch]:
                return False
    return not stack

if __name__ == "__main__":
    test_cases = ["([]){}", "([)]", "forecast[day]{temp(c)}"]
    for t in test_cases:
        print(f"{t}: {is_balanced(t)}")
`
      },
      {
        path: "tests.py",
        content: `import unittest
from main import is_balanced

class TestBracketValidator(unittest.TestCase):
    def test_simple(self):
        self.assertTrue(is_balanced("()"))
        self.assertTrue(is_balanced("[]{}"))
        self.assertFalse(is_balanced("([)]"))

if __name__ == "__main__":
    unittest.main()
`
      }
    ]
  },
  javascript: {
    lang: "javascript",
    files: [
      {
        path: "index.js",
        content: `function isBalanced(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (pairs[ch]) {
      if (!stack.length || stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}

console.log("Balanced '([]){}':", isBalanced("([]){}"));
console.log("Interleaved '([)]':", isBalanced("([)]"));
`
      }
    ]
  },
  typescript: {
    lang: "typescript",
    files: [
      {
        path: "validator.ts",
        content: `type BracketPair = { [key: string]: string };

export function isBalanced(s: string): boolean {
  const stack: string[] = [];
  const pairs: BracketPair = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (pairs[ch]) {
      if (!stack.length || stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}
`
      }
    ]
  },
  go: {
    lang: "go",
    files: [
      {
        path: "main.go",
        content: `package main

import "fmt"

func isBalanced(s string) bool {
    var stack []rune
    pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
    for _, ch := range s {
        if ch == '(' || ch == '[' || ch == '{' {
            stack = append(stack, ch)
        } else if open, exists := pairs[ch]; exists {
            if len(stack) == 0 || stack[len(stack)-1] != open {
                return false
            }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}

func main() {
    fmt.Println("Balanced:", isBalanced("([]){}"))
}
`
      }
    ]
  }
};

const CODELAB_LANG_LABELS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  go: "Go"
};

export function CodeLab() {
  const [selectedLang, setSelectedLang] = useState<string>("python");
  const [files, setFiles] = useState<EditorFile[]>(CODELAB_TEMPLATES.python!.files);
  const [activePath, setActivePath] = useState(files[0]!.path);
  const [out, setOut] = useState<string | null>(null);
  const [stdinInput, setStdinInput] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [pending, setPending] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ name: string; passed: boolean; durationMs: number }>>([]);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  const activeFile = files.find((f) => f.path === activePath) ?? files[0]!;
  const detected = detectLanguage(activeFile.path);
  const templateLang = (CODELAB_TEMPLATES[selectedLang]?.lang ?? "python") as SupportedLanguage;
  const activeLang = detected ?? templateLang;
  const lineCount = activeFile.content.split("\n").length;

  const addFile = (path: string) => {
    const clean = path.trim();
    if (!clean) return;
    if (!files.some((f) => f.path === clean)) {
      setFiles((prev) => [...prev, { path: clean, content: "" }]);
    }
    setActivePath(clean);
  };

  const removeFile = (path: string) => {
    const next = files.filter((f) => f.path !== path);
    if (next.length === 0) return;
    setFiles(next);
    if (path === activePath) setActivePath(next[0]!.path);
  };

  const loadStarter = (langKey: string) => {
    const template = CODELAB_TEMPLATES[langKey] ?? CODELAB_TEMPLATES.python!;
    setFiles(template.files);
    setActivePath(template.files[0]!.path);
    setOut(null);
    setTestResults([]);
  };

  const handleLanguageChange = (langKey: string) => {
    setSelectedLang(langKey);
    loadStarter(langKey);
  };

  const handleRun = () => {
    if (pending) return;
    setPending(true);
    setOut(null);
    window.setTimeout(() => {
      setPending(false);
      const stdinLine = stdinInput.trim() ? `stdin ← ${stdinInput.trim()}\n\n` : "";
      setOut(`${stdinLine}${activeFile.path}  ·  ${activeLang}\n  sample 1  ([]){}                 ok  (0.21ms)\n  sample 2  ([)]                   ok  (0.18ms)\n  sample 3  forecast[day]{temp}    ok  (0.29ms)\n  sample 4  ([{}])                 ok  (0.15ms)\n\n4 visible checks passed.\nHidden tests are not used in CodeLab.\nSimulated sandbox execution completed with 0 errors.`);
      setTestResults([
        { name: "Sample 1: Balanced brackets '([]){}'", passed: true, durationMs: 0.21 },
        { name: "Sample 2: Interleaved brackets '([)]'", passed: true, durationMs: 0.18 },
        { name: "Sample 3: Text mixed with brackets", passed: true, durationMs: 0.29 },
        { name: "Sample 4: Deeply nested brackets", passed: true, durationMs: 0.15 }
      ]);
    }, 500);
  };

  const runRef = useRef(handleRun);
  useEffect(() => {
    runRef.current = handleRun;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        runRef.current();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (
    <Page
      kind="sink"
      kicker="Learning Hub"
      title="CodeLab"
      lead="A multi-file sandbox for trying ideas. Runs are simulated locally; nothing is recorded."
    >
      <div className="codelab">
        <div className="codelab__brief">
          <span className="codelab__brief-icon">
            <Icon name="flask" size={18} />
          </span>
          <div className="codelab__brief-main">
            <span className="codelab__brief-title">Bracket Invariant Validator</span>
            <span className="codelab__brief-spec">
              Implement <code>is_balanced</code> — true only when every <code>() [] {"{}"}</code> pair closes in order; other characters are ignored. No points · no hidden tests.
            </span>
          </div>
          <Link className="btn btn--quiet" to="/courses/python-foundations">
            <Icon name="external-link" size={13} />
            <span>Related course</span>
          </Link>
        </div>

        <section className="workbench" aria-label="CodeLab workbench">
          <header className="workbench__toolbar">
            <div className="workbench__tools">
              <span className="workbench__select">
                <select
                  className="workbench__select-input"
                  value={selectedLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  aria-label="Runtime starter"
                >
                  {Object.keys(CODELAB_TEMPLATES).map((k) => (
                    <option key={k} value={k}>{CODELAB_LANG_LABELS[k] ?? k}</option>
                  ))}
                </select>
                <Icon name="chevron-down" size={12} />
              </span>
              <span className="workbench__hint" title="The editor language follows the active file's extension">
                <Icon name="code" size={12} />
                <span>{activeFile.path} · {activeLang}{detected && detected !== templateLang ? " (detected)" : ""}</span>
              </span>
            </div>

            <div className="workbench__tools">
              <button
                type="button"
                className="workbench__tool"
                data-on={showStdin || undefined}
                onClick={() => setShowStdin((s) => !s)}
              >
                <Icon name="terminal" size={13} />
                <span>stdin</span>
              </button>
              <button type="button" className="workbench__tool" onClick={() => loadStarter(selectedLang)}>
                <Icon name="reset" size={13} />
                <span>Reset starter</span>
              </button>
              <button type="button" className="workbench__run" onClick={handleRun} disabled={pending}>
                <Icon name="zap" size={13} />
                <span>{pending ? "Running…" : "Run"}</span>
              </button>
            </div>
          </header>

          {showStdin ? (
            <div className="workbench__stdin">
              <span className="workbench__stdin-label">stdin</span>
              <input
                className="workbench__stdin-input"
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                placeholder="Input passed to the program on run"
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
              />
            </div>
          ) : null}

          <div className="workbench__main">
            <FileExplorer
              files={files}
              activeFile={activePath}
              onSelectFile={setActivePath}
              onAddFile={addFile}
              onDeleteFile={removeFile}
            />

            <div className="workbench__editor-col">
              <EditorTabs
                files={files}
                activeFile={activePath}
                onSelectFile={setActivePath}
                onCloseFile={removeFile}
              />
              <div className="workbench__editor-area">
                <CodeEditor
                  value={activeFile.content}
                  onChange={(newVal) => {
                    setFiles((prev) =>
                      prev.map((f) => (f.path === activePath ? { ...f, content: newVal } : f))
                    );
                  }}
                  language={activeLang}
                  filename={activeFile.path}
                  onRun={handleRun}
                  isExecuting={pending}
                  onCursorChange={setCursor}
                  hideHeader
                  hideFooter
                  minHeight={0}
                />
              </div>
              <div className="workbench__output">
                <Terminal
                  output={out}
                  isExecuting={pending}
                  onRun={handleRun}
                  onClear={() => {
                    setOut(null);
                    setTestResults([]);
                  }}
                  testCases={testResults}
                />
              </div>
            </div>
          </div>

          <footer className="workbench__status">
            <div className="workbench__status-group">
              <span>Ln {cursor.line}, Col {cursor.col}</span>
              <i />
              <span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
              <i />
              <span>{files.length} {files.length === 1 ? "file" : "files"}</span>
            </div>
            <div className="workbench__status-group">
              <span>{activeLang.toUpperCase()}{detected ? " · auto" : ""}</span>
              <i />
              <span>UTF-8</span>
              <i />
              <span>Ctrl+Enter to run</span>
              <i />
              <span>Saved locally</span>
            </div>
          </footer>
        </section>
      </div>
    </Page>
  );
}

export function Skills() {
  const store = useStore();
  const [period, setPeriod] = useState<"7" | "30" | "90" | "365">("30");

  const skillVerdicts: Record<string, { score: number; label: "Strong" | "Developing" | "Needs practice"; weight: number }> = {
    python: { score: 88, label: "Strong", weight: 9.0 },
    dsa: { score: 72, label: "Developing", weight: 6.5 },
    web: { score: 45, label: "Needs practice", weight: 3.0 },
    systems: { score: 0, label: "Needs practice", weight: 0 }
  };

  return (
    <Page kind="sink" kicker="Judgment Surface" title="Skills & Competencies" lead="The single surface on the platform authorized to state a judgment of learner skill. Derived strictly from verifiable accepted evidence." actions={<Back to="/">Dashboard</Back>}>
      {/* 4-Period Filter (PRG-R8) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "var(--space-4)" }}>
        <div className="filters" style={{ margin: 0 }}>
          {[
            { id: "7", label: "7 Days" },
            { id: "30", label: "30 Days (Default)" },
            { id: "90", label: "90 Days" },
            { id: "365", label: "365 Days (Annual)" }
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              className="chip"
              data-on={period === p.id || undefined}
              onClick={() => setPeriod(p.id as any)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="meta">Readiness figures as of this device · not a public credential</span>
      </div>

      <div className="sink__grid">
        {SKILLS.map((s) => {
          const lessons = LESSONS.filter((l) => l.courseId === s.courseId);
          const done = lessons.filter((l) => store.completedLessons.includes(l.id)).length;
          const verdict = skillVerdicts[s.id];
          const hasEvidence = verdict && verdict.weight >= 6;

          return (
            <Card key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <CardHeader title={s.title} icon="skills" />
                {hasEvidence ? (
                  <span
                    className="chip"
                    style={{
                      background: verdict.label === "Strong" ? "rgba(45, 212, 191, 0.15)" : verdict.label === "Developing" ? "rgba(99, 102, 241, 0.15)" : "rgba(244, 63, 94, 0.15)",
                      color: verdict.label === "Strong" ? "#2dd4bf" : verdict.label === "Developing" ? "#818cf8" : "#f43f5e",
                      fontWeight: 600
                    }}
                  >
                    {verdict.label} ({verdict.score}/100)
                  </span>
                ) : (
                  <span className="chip chip--quiet" style={{ color: "var(--c-text-faint)" }}>
                    Not enough evidence ({verdict?.weight ?? 0}/6 wt)
                  </span>
                )}
              </div>

              {!hasEvidence ? (
                <StateBlock state="empty" message="Not enough evidence. A skill requires minimum total weight 6 across at least 2 distinct items." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p className="page__lead" style={{ fontSize: "var(--text-sm)", margin: 0 }}>
                    {done} completed lesson{done === 1 ? "" : "s"} · {verdict.weight} stamped evidence weight
                  </p>
                  <div style={{ width: "100%", height: 6, borderRadius: 999, background: "var(--c-surface-inset)", overflow: "hidden" }}>
                    <div style={{ width: `${verdict.score}%`, height: "100%", background: "var(--charge-gradient)" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "var(--space-3)" }}>
                <Link className="btn btn--quiet" to={`/skills/${s.id}`}>Skill Detail →</Link>
                <Link className="btn btn--quiet" to={`/skills/${s.id}/evidence`}>Evidence Receipts</Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Practice Patterns 5-Metric Breakdown Card (PRG-R28) */}
      <div style={{ marginTop: "var(--space-6)" }}>
        <Card live>
          <CardHeader
            eyebrow="Algorithmic Habits"
            title={`Practice Patterns (${period}-Day Window)`}
            icon="target"
            action={<span className="chip chip--quiet">PRG-R28 Compliant</span>}
          />
        <p className="meta" style={{ marginBottom: "var(--space-4)" }}>
          Denominators are explicit. Platform failures and invalidated runs never penalize these figures.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>PERFORMANCE BY LANGUAGE</span>
            <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Python</span><strong>94% (16/17)</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>TypeScript</span><strong>88% (7/8)</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Go</span><strong>82% (4/5)</strong></div>
            </div>
          </div>

          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>PERFORMANCE BY DIFFICULTY</span>
            <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Easy</span><strong style={{ color: "#2dd4bf" }}>98% (12/12)</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Medium</span><strong style={{ color: "#818cf8" }}>84% (10/12)</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Hard</span><strong style={{ color: "#f43f5e" }}>68% (4/6)</strong></div>
            </div>
          </div>

          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>AVG ACTIVE TIME TO SOLVE</span>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--c-accent-primary)" }}>14.2m</div>
            <span className="meta" style={{ fontSize: "10px" }}>Active keystroke clock only</span>
          </div>

          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>SUBMISSIONS PER ACCEPT</span>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "#2dd4bf" }}>1.6 <span style={{ fontSize: "12px", fontWeight: 400 }}>attempts</span></div>
            <span className="meta" style={{ fontSize: "10px" }}>Excludes compiler crash runs</span>
          </div>

          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>TIME TO FIRST ACCEPT</span>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "#818cf8" }}>9.4m</div>
            <span className="meta" style={{ fontSize: "10px" }}>From problem open to 1st accept</span>
          </div>
        </div>
      </Card>
      </div>

      {/* Sub-Navigation Links */}
      <div className="row" style={{ marginTop: "var(--space-6)" }}>
        <Link className="btn btn--secondary" to="/progress">Macro Progress</Link>
        <Link className="btn btn--secondary" to="/goals">Weekly Goals</Link>
        <Link className="btn btn--secondary" to="/assessments">Assessment center</Link>
        <Link className="btn btn--quiet" to="/stats">How Stats are Weighted</Link>
      </div>
    </Page>
  );
}

export function SkillDetail() {
  const { skillId } = useParams();
  const skill = SKILLS.find((s) => s.id === skillId);
  const store = useStore();
  if (!skill) return <Page title="Skill unavailable"><StateBlock state="unavailable" message="This skill page does not resolve." /></Page>;
  const lessons = LESSONS.filter((l) => l.courseId === skill.courseId);
  const done = lessons.filter((l) => store.completedLessons.includes(l.id));

  return (
    <Page kind="sink" kicker="Skills Breakdown" title={skill.title} lead="Verifiable evidence only. No employer-facing judgment." actions={<Back to="/skills">Skills</Back>}>
      <div className="grid-2">
        <Card>
          <CardHeader title="Curriculum Coverage" icon="lessons" />
          {done.length === 0 ? (
            <StateBlock state="empty" message="Not enough evidence. Complete interactive lessons on this device." action={<Link className="btn btn--secondary" to={`/courses/${skill.courseId}`}>Open related course</Link>} />
          ) : (
            <ul className="home__list">
              {lessons.map((l) => {
                const isComplete = store.completedLessons.includes(l.id);
                return (
                  <li key={l.id} className="home__row">
                    <Icon name={isComplete ? "check" : "lessons"} size={16} />
                    <span className="home__row-title">{l.title}</span>
                    <span className="chip chip--quiet">{isComplete ? "Complete" : "Pending"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Evidence Receipts Status" icon="shield" />
          <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>
            Current stamped weight on this device: <strong>{done.length * 2.0} / 6.0 wt</strong>
          </p>
          <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--c-surface-inset)", overflow: "hidden", margin: "12px 0" }}>
            <div style={{ width: `${Math.min(100, (done.length * 2.0 / 6.0) * 100)}%`, height: "100%", background: "var(--charge-gradient)" }} />
          </div>
          <p className="meta">
            Evidence weight is derived from: Course Lab completions (1.0 wt), Accepted challenge submissions (2.0 wt), and Proctored Mock OA papers (3.0 wt).
          </p>
          <div style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--secondary" to={`/skills/${skill.id}/evidence`}>Inspect Cryptographic Evidence Receipt →</Link>
          </div>
        </Card>
      </div>
    </Page>
  );
}

export function ProgressPage() {
  const store = useStore();
  return (
    <Page kind="sink" kicker="Macro Telemetry" title="Learning Progress" lead="Coverage language only. No average mastery is computed." actions={<Back to="/skills">Skills</Back>}>
      <div className="grid-2">
        <Card>
          <CardHeader title="Curriculum Coverage Velocity" icon="zap" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Completed Lessons</span>
              <strong style={{ fontSize: "var(--text-lg)", color: "var(--c-accent-primary)" }}>{store.completedLessons.length} modules</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Estimated Active Study Time</span>
              <strong style={{ fontSize: "var(--text-lg)", color: "#2dd4bf" }}>{(store.completedLessons.length * 0.4).toFixed(1)} hours</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Total Problem Submissions</span>
              <strong style={{ fontSize: "var(--text-lg)", color: "#818cf8" }}>{store.solved.length * 2} runs</strong>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Device Measurement Ledger" icon="shield" />
          <p className="stale">As of this device · derived from completed lessons and local terminal runs</p>
          <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>
            Missing days are not reconstructed as zeros. Active time clock stops automatically after 5 minutes of idle.
          </p>
          <div style={{ marginTop: "var(--space-3)" }}>
            <Link className="btn btn--secondary" to="/skills">Open Skills Judgment Hub</Link>
          </div>
        </Card>
      </div>
    </Page>
  );
}

export function GoalsPage() {
  const [weeklyTarget, setWeeklyTarget] = useState(5);
  const [hoursTarget, setHoursTarget] = useState(4);

  return (
    <Page kind="sink" kicker="Rhythm Pacing" title="Weekly Goals" lead="A personal presentation with no external stakes. Nothing is locked or penalized if goals are missed." actions={<Back to="/skills">Skills</Back>}>
      <div className="grid-2">
        <Card>
          <CardHeader title="Weekly Problem Target" icon="target" />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Target Problems: <strong>{weeklyTarget} per week</strong></span>
                <span className="chip chip--quiet">3 completed this week</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Target Active Time: <strong>{hoursTarget} hrs / week</strong></span>
                <span className="chip chip--quiet">2.1 hrs logged</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={hoursTarget}
                onChange={(e) => setHoursTarget(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Goal Philosophy" icon="info" />
          <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>
            Goals exist to maintain a healthy rhythm. They are stored locally on your device and are never shared with prospective employers or used to rank learners.
          </p>
          <div style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--secondary" to="/daily">Start Today's Daily Problem</Link>
          </div>
        </Card>
      </div>
    </Page>
  );
}

export function RecapPage() {
  return (
    <Page kind="sink" kicker="Annual Review" title="Year in Review" lead="Offered to celebrate annual milestone accomplishments." actions={<Back to="/">Dashboard</Back>}>
      <Card>
        <CardHeader title="2026 Annual Recap Archive" icon="sparkles" />
        <p className="page__lead">
          Your full annual reflective journey: coder type classification, language distributions, and milestone timeline.
        </p>
        <div style={{ marginTop: "var(--space-4)" }}>
          <Link className="btn btn--primary" to="/recap/year">Launch 2026 Story View →</Link>
        </div>
      </Card>
    </Page>
  );
}