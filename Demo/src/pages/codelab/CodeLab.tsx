/**
 * CodeLab — the multi-file sandbox for trying ideas.
 *
 * Runs are simulated on this device and nothing is recorded. Files are kept
 * per starter language, so switching language or leaving the page never loses
 * work; Reset returns that language to its starter. Run executes the active
 * file when it is a program, otherwise the language's entry file. Closing a
 * tab only closes it — deleting a file is the explorer's, with a confirmation.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Page } from "@components/Page";
import { Icon } from "@icons/Icon";
import { saveCodelabFiles } from "@state/store";
import { useStore } from "@state/useStore";
import {
  CodeEditor,
  CodeWorkbench,
  RunButton,
  Terminal,
  ToolButton,
  describeRun,
  detectLanguage,
  isRunnable,
  measureRun,
  simulateProgram,
  type EditorFile,
  type RunResult,
  type SupportedLanguage,
  type TerminalTestCase
} from "@components/CodeEditor";
import { FileExplorer } from "../../extraction/components/FileExplorer/FileExplorer";
import { EditorTabs } from "../../extraction/components/EditorTabs/EditorTabs";
import { LanguageSelect } from "../../extraction/components/LanguageSelect/LanguageSelect";
import { CODELAB_CHECKS, CODELAB_LANGUAGES, CODELAB_TEMPLATES, type CodelabTemplate } from "./templates";

const COMPILED = new Set<SupportedLanguage>(["typescript", "java", "cpp", "go"]);

/** The brief's visible checks, judged the demo's honest way: a missing
 *  function fails every case; one without a stack cannot tell interleaved
 *  pairs apart. */
function runChecks(template: CodelabTemplate, source: string): TerminalTestCase[] {
  const show = (v: boolean) => (v ? template.truthy : template.falsy);
  const defined = template.functionPattern.test(source);
  const start = source.search(template.functionPattern);
  const body = start >= 0 ? source.slice(start) : "";
  const tracksOrder = /\b(append|push|pop|stack)\b/.test(body);
  return CODELAB_CHECKS.map((check) => {
    const actual = !defined ? null : !tracksOrder && !check.expected ? true : check.expected;
    const passed = actual === check.expected;
    return {
      name: check.label,
      passed,
      durationMs: measureRun(source, template.language).durationMs / 100,
      input: `${template.functionName}("${check.input}")`,
      expected: show(check.expected),
      actual: actual === null ? template.missingFunction : show(actual)
    };
  });
}

export function CodeLab() {
  const store = useStore();
  const [lang, setLang] = useState("python");
  const template = CODELAB_TEMPLATES[lang] ?? CODELAB_TEMPLATES.python!;
  const files: EditorFile[] = store.codelabFiles[lang] ?? template.files;

  const [activeByLang, setActiveByLang] = useState<Record<string, string>>({});
  const [openByLang, setOpenByLang] = useState<Record<string, string[]>>({});
  const [stdin, setStdin] = useState("");
  const [inputRequest, setInputRequest] = useState(0);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ run: RunResult; path: string; language: SupportedLanguage } | null>(null);
  const [checks, setChecks] = useState<TerminalTestCase[]>([]);
  const [resetArm, setResetArm] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);

  const activePath = files.some((f) => f.path === activeByLang[lang]) ? activeByLang[lang]! : files[0]!.path;
  const activeFile = files.find((f) => f.path === activePath) ?? files[0]!;
  const activeLanguage = detectLanguage(activeFile.path);
  const openPaths = (openByLang[lang] ?? files.map((f) => f.path)).filter((p) => files.some((f) => f.path === p));
  const openFiles = files.filter((f) => openPaths.includes(f.path) || f.path === activePath);

  const entry = files.find((f) => f.path === template.entry) ?? files.find((f) => isRunnable(detectLanguage(f.path)));
  const target = isRunnable(activeLanguage) ? activeFile : entry;
  const targetLanguage = target ? detectLanguage(target.path) : undefined;

  const writeFiles = (next: EditorFile[]) => saveCodelabFiles(lang, next);

  const select = (path: string) => {
    setActiveByLang((m) => ({ ...m, [lang]: path }));
    setOpenByLang((m) => {
      const current = m[lang] ?? files.map((f) => f.path);
      return current.includes(path) ? m : { ...m, [lang]: [...current, path] };
    });
  };

  const addFile = (name: string) => {
    const path = name.trim();
    if (!path) return;
    if (!files.some((f) => f.path === path)) writeFiles([...files, { path, content: "" }]);
    select(path);
  };

  const renameFile = (from: string, to: string) => {
    const path = to.trim();
    if (!path || path === from || files.some((f) => f.path === path)) return;
    writeFiles(files.map((f) => (f.path === from ? { ...f, path } : f)));
    setOpenByLang((m) => ({ ...m, [lang]: (m[lang] ?? files.map((f) => f.path)).map((p) => (p === from ? path : p)) }));
    if (activePath === from) setActiveByLang((m) => ({ ...m, [lang]: path }));
  };

  const deleteFile = (path: string) => {
    if (files.length <= 1) return;
    const next = files.filter((f) => f.path !== path);
    writeFiles(next);
    if (activePath === path) setActiveByLang((m) => ({ ...m, [lang]: next[0]!.path }));
  };

  const closeTab = (path: string) => {
    const remaining = openPaths.filter((p) => p !== path);
    if (remaining.length === 0) return;
    setOpenByLang((m) => ({ ...m, [lang]: remaining }));
    if (activePath === path) setActiveByLang((m) => ({ ...m, [lang]: remaining[remaining.length - 1]! }));
  };

  const updateActive = (content: string) =>
    writeFiles(files.map((f) => (f.path === activeFile.path ? { ...f, content } : f)));

  const changeLanguage = (next: string) => {
    if (pending) return;
    setLang(next);
    setResult(null);
    setChecks([]);
    setResetArm(false);
  };

  const reset = () => {
    if (!resetArm) {
      setResetArm(true);
      return;
    }
    saveCodelabFiles(lang, []);
    setActiveByLang((m) => ({ ...m, [lang]: template.entry }));
    setOpenByLang((m) => ({ ...m, [lang]: template.files.map((f) => f.path) }));
    setResult(null);
    setChecks([]);
    setResetArm(false);
  };

  const run = () => {
    if (pending || !target || !isRunnable(targetLanguage)) return;
    const snapshot = { source: target.content, path: target.path, language: targetLanguage, stdin };
    setPending(true);
    setResetArm(false);
    timerRef.current = window.setTimeout(
      () => {
        const outcome = simulateProgram({ ...snapshot, knownOutput: template.knownOutput });
        setResult({ run: outcome, path: snapshot.path, language: snapshot.language });
        setChecks(
          snapshot.path === template.entry && outcome.outcome === "success" ? runChecks(template, snapshot.source) : []
        );
        setPending(false);
      },
      COMPILED.has(snapshot.language) ? 850 : 520
    );
  };

  const clear = () => {
    setResult(null);
    setChecks([]);
  };

  return (
    <Page
      kind="sink"
      kicker="Learning Hub"
      title="CodeLab"
      lead="A multi-file sandbox for trying ideas. Runs are simulated on this device; nothing is recorded."
    >
      <div className="codelab">
        <div className="codelab__brief">
          <span className="codelab__brief-icon">
            <Icon name="flask" size={18} />
          </span>
          <div className="codelab__brief-main">
            <span className="codelab__brief-title">Bracket Invariant Validator</span>
            <span className="codelab__brief-spec">
              Implement <code>{template.functionName}</code> — true only when every <code>() [] {"{}"}</code> pair closes in
              order; other characters are ignored. Running <code>{template.entry}</code> also runs {CODELAB_CHECKS.length} visible
              checks. No points · no hidden tests.
            </span>
          </div>
          <Link className="btn btn--quiet" to="/courses/python-foundations">
            <Icon name="external-link" size={13} />
            <span>Related course</span>
          </Link>
        </div>

        <CodeWorkbench
          label="CodeLab workbench"
          onRun={run}
          busy={pending}
          toolbar={
            <>
              <LanguageSelect
                value={lang}
                onChange={changeLanguage}
                options={CODELAB_LANGUAGES}
                label="Starter language"
                disabled={pending}
              />
              <span
                className="code-wb__hint"
                title="Run executes the active file when it is a program, otherwise the entry file"
              >
                <Icon name="play" size={12} />
                <span>{target ? target.path : "nothing to run"}</span>
              </span>
            </>
          }
          actions={
            <>
              <ToolButton icon="edit" onClick={() => setInputRequest((n) => n + 1)} title="Standard input for the next run">
                Input{stdin.trim() ? " ·" : ""}
              </ToolButton>
              <ToolButton
                icon="reset"
                armed={resetArm}
                disabled={pending}
                onClick={reset}
                title={`Replace every ${template.label} file with the starter`}
              >
                {resetArm ? "Confirm reset" : "Reset"}
              </ToolButton>
            </>
          }
          sidebar={
            <FileExplorer
              files={files}
              activeFile={activePath}
              onSelectFile={select}
              onAddFile={addFile}
              onDeleteFile={files.length > 1 ? deleteFile : undefined}
              onRenameFile={renameFile}
              label="CodeLab files"
            />
          }
          tabs={<EditorTabs files={openFiles} activeFile={activePath} onSelectFile={select} onCloseFile={closeTab} />}
          editor={
            <CodeEditor
              value={activeFile.content}
              onChange={updateActive}
              language={activeLanguage ?? template.language}
              filename={activeFile.path}
              path={`codelab/${lang}/${activeFile.path}`}
            />
          }
          console={
            <Terminal
              label="CodeLab console"
              output={result?.run.stdout || null}
              errorOutput={result?.run.stderr || null}
              hint={result?.run.hint ?? null}
              statusLine={result ? describeRun(result.run, result.language) : null}
              isExecuting={pending}
              statusText={target ? `Running ${target.path} in the simulated sandbox…` : undefined}
              onClear={clear}
              testCases={checks}
              input={{
                value: stdin,
                onChange: setStdin,
                label: "Input",
                placeholder: "Lines passed to the program's standard input",
                note: "Sent to the program on every run until you clear it."
              }}
              inputRequest={inputRequest}
            />
          }
          statusItems={[`${files.length} ${files.length === 1 ? "file" : "files"}`]}
          footer={
            <RunButton
              onClick={run}
              running={pending}
              disabled={!target}
              label={target ? `Run ${target.path}` : "Run"}
            />
          }
        />
      </div>
    </Page>
  );
}
