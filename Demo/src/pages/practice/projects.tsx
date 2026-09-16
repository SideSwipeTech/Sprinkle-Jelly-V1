/**
 * projects — the personal workspace pages, on the shared code workbench.
 * File creation and deletion run through dialogs instead of window.prompt /
 * window.confirm; runs are simulated on this device and their last output is
 * kept with the project.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { PROJECT_TEMPLATES } from "@data/catalog";
import { addProject, deleteProjectFile, saveProjectFile, setProjectActive, setProjectOutput } from "@state/store";
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
  simulateProgram,
  type RunResult,
  type SupportedLanguage
} from "@components/CodeEditor";
import { FileExplorer } from "../../extraction/components/FileExplorer/FileExplorer";
import { EditorTabs } from "../../extraction/components/EditorTabs/EditorTabs";
import { PromptDialog } from "../../extraction/components/Dialog/Dialog.variants";

export function Projects() {
  const store = useStore();
  return (
    <Page kind="sink" kicker="Practice" title="Projects" lead="Personal workspace. No public sharing, no project grading.">
      <div className="row">
        <Link className="btn btn--primary" to="/projects/new">New project</Link>
        <Link className="btn btn--secondary" to="/projects/templates">Templates</Link>
      </div>
      {store.projects.length === 0 ? (
        <Card>
          <StateBlock state="empty" message="No project yet." action={<Link className="btn btn--primary" to="/projects/new">New project</Link>} />
        </Card>
      ) : (
        <div className="list">
          {store.projects.map((p) => (
            <Link key={p.id} className="list-row" to={`/projects/${p.id}`}>
              <div>
                <strong>{p.name}</strong>
                <p className="meta">{p.template} · {new Date(p.at).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}

export function ProjectTemplates() {
  return (
    <Page kind="sink" kicker="Projects" title="Project starter templates" lead="Starter templates with multi-file layouts for local runs." actions={<Back to="/projects">Workspace</Back>}>
      <div className="courses__grid">
        {PROJECT_TEMPLATES.map((t) => (
          <Card key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <CardHeader title={t.title} icon="projects" />
              <span className="chip" style={{ fontSize: "11px" }}>{t.language}</span>
            </div>
            <p className="page__lead">{t.summary}</p>
            <p className="meta">{t.fileCount} starter files · local run only</p>
            <div style={{ marginTop: "var(--space-4)" }}>
              <Link className="btn btn--primary" to={`/projects/new?template=${t.id}`}>Use this template</Link>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}

export function ProjectNew() {
  const [name, setName] = useState("Bracket lab notes");
  const [template, setTemplate] = useState(PROJECT_TEMPLATES[0]?.id ?? "notes-cli");
  const navigate = useNavigate();
  return (
    <Page kind="sink" kicker="Projects" title="New project" lead="Files stay in local state." actions={<Back to="/projects">Workspace</Back>}>
      <Card>
        <label className="field">
          <span className="meta">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span className="meta">Template</span>
          <select value={template} onChange={(e) => setTemplate(e.target.value)}>
            {PROJECT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </label>
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => {
            const id = addProject(name.trim() || "Untitled", template);
            navigate(`/projects/${id}`);
          }}
        >
          Create
        </button>
      </Card>
    </Page>
  );
}

/** A new file starts with a line its own language reads as a comment. */
function starterContent(path: string): string {
  switch (detectLanguage(path)) {
    case "python":
      return "# New file\n";
    case "javascript":
    case "typescript":
    case "java":
    case "cpp":
    case "go":
      return "// New file\n";
    case "json":
      return "{}\n";
    case "markdown":
      return "# Notes\n";
    case "css":
      return "/* New file */\n";
    case "html":
      return "<!-- New file -->\n";
    default:
      return "";
  }
}

export function ProjectWorkspace() {
  const { projectId } = useParams();
  const store = useStore();
  const project = store.projects.find((p) => p.id === projectId);
  const [pending, setPending] = useState(false);
  const [namingFile, setNamingFile] = useState(false);
  const [result, setResult] = useState<{ run: RunResult; language: SupportedLanguage } | null>(null);
  const [stdin, setStdin] = useState("");
  const [inputRequest, setInputRequest] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);

  if (!project) {
    return (
      <Page kind="sink" title="Project unavailable">
        <StateBlock state="unavailable" message="This workspace does not resolve. A deleted or never-created id is not filled with a sample." action={<Back to="/projects">Projects</Back>} />
      </Page>
    );
  }

  const active = project.files.find((f) => f.path === project.activePath) ?? project.files[0];
  const activeLanguage = active ? detectLanguage(active.path) : undefined;
  const target = active && isRunnable(activeLanguage) ? active : project.files.find((f) => isRunnable(detectLanguage(f.path)));
  const targetLanguage = target ? detectLanguage(target.path) : undefined;

  function createFile(path: string) {
    if (!project) return;
    const clean = path.trim();
    if (!clean) return;
    if (!project.files.some((f) => f.path === clean)) saveProjectFile(project.id, clean, starterContent(clean));
    setProjectActive(project.id, clean);
  }

  const handleRun = () => {
    if (!project || pending || !target || !isRunnable(targetLanguage)) return;
    const snapshot = { source: target.content, path: target.path, language: targetLanguage, stdin };
    setPending(true);
    timerRef.current = window.setTimeout(() => {
      const run = simulateProgram(snapshot);
      setResult({ run, language: snapshot.language });
      setProjectOutput(project.id, [run.stdout, run.stderr].filter(Boolean).join("\n"));
      setPending(false);
    }, 650);
  };

  const clear = () => {
    setResult(null);
    setProjectOutput(project.id, "");
  };

  return (
    <Page kind="sink" kicker="Workspace" title={project.name} lead={`Template · ${project.template} · files stay on this device`} actions={<Back to="/projects">All projects</Back>}>
      <div className="lab-workspace stack--md">
        <Card className="lab__brief">
          <p className="meta">
            {target ? (
              <>
                Run target: <code>{target.path}</code> · the active file runs when it is a program
              </>
            ) : (
              "No runnable file yet — add a .py, .js, .ts, .go, .java or .cpp file to run."
            )}{" "}
            · Maximum 40 files in workspace · Local persistent sandbox
          </p>
        </Card>

        <CodeWorkbench
          label={`${project.name} workspace`}
          onRun={handleRun}
          busy={pending}
          toolbar={
            <span className="code-wb__hint" title="Run executes the active file when it is a program">
              <Icon name="play" size={12} />
              <span>{target ? target.path : "nothing to run"}</span>
            </span>
          }
          actions={
            <>
              <ToolButton icon="plus" onClick={() => setNamingFile(true)} title="Create a file">
                New file
              </ToolButton>
              <ToolButton icon="edit" onClick={() => setInputRequest((n) => n + 1)} title="Standard input for the next run">
                Input
              </ToolButton>
            </>
          }
          sidebar={
            <FileExplorer
              files={project.files}
              activeFile={project.activePath}
              onSelectFile={(path) => setProjectActive(project.id, path)}
              onAddFile={createFile}
              onDeleteFile={(delPath) => deleteProjectFile(project.id, delPath)}
              label={`${project.name} files`}
            />
          }
          tabs={
            <EditorTabs
              files={project.files}
              activeFile={project.activePath}
              onSelectFile={(path) => setProjectActive(project.id, path)}
              onAddFile={() => setNamingFile(true)}
            />
          }
          editor={
            active ? (
              <CodeEditor
                value={active.content}
                onChange={(newVal) => saveProjectFile(project.id, active.path, newVal)}
                language={activeLanguage ?? "markdown"}
                filename={active.path}
                path={`project/${project.id}/${active.path}`}
              />
            ) : (
              <StateBlock state="empty" message="No files yet." />
            )
          }
          console={
            <Terminal
              label="Workspace console"
              output={result ? result.run.stdout || null : project.output || null}
              errorOutput={result?.run.stderr || null}
              hint={result?.run.hint ?? null}
              statusLine={result ? describeRun(result.run, result.language) : null}
              isExecuting={pending}
              statusText={target ? `Running ${target.path} in the simulated sandbox…` : undefined}
              onClear={clear}
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
          statusItems={[`${project.files.length} ${project.files.length === 1 ? "file" : "files"}`]}
          footer={<RunButton onClick={handleRun} running={pending} disabled={!target} label={target ? `Run ${target.path}` : "Run"} />}
        />
      </div>

      <PromptDialog
        open={namingFile}
        title="New file"
        fieldLabel="File name"
        initialValue="module.py"
        submitLabel="Create file"
        onSubmit={createFile}
        onClose={() => setNamingFile(false)}
      />
    </Page>
  );
}
