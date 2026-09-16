/**
 * projects — the personal workspace pages, ported to the extraction
 * components so file creation and deletion run through dialogs instead of
 * window.prompt / window.confirm.
 */

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { PROJECT_TEMPLATES } from "@data/catalog";
import { addProject, deleteProjectFile, runProject, saveProjectFile, setProjectActive } from "@state/store";
import { useStore } from "@state/useStore";
import { CodeEditor } from "@components/CodeEditor/CodeEditor";
import { Terminal } from "@components/CodeEditor/Terminal";
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

export function ProjectWorkspace() {
  const { projectId } = useParams();
  const store = useStore();
  const project = store.projects.find((p) => p.id === projectId);
  const [isExecuting, setIsExecuting] = useState(false);
  const [namingFile, setNamingFile] = useState(false);

  if (!project) {
    return (
      <Page kind="sink" title="Project unavailable">
        <StateBlock state="unavailable" message="This workspace does not resolve. A deleted or never-created id is not filled with a sample." action={<Back to="/projects">Projects</Back>} />
      </Page>
    );
  }

  const active = project.files.find((f) => f.path === project.activePath) ?? project.files[0];

  function createFile(path: string) {
    if (!project) return;
    saveProjectFile(project.id, path, "# New file\n");
    setProjectActive(project.id, path);
  }

  const handleRun = () => {
    if (!project) return;
    setIsExecuting(true);
    setTimeout(() => {
      runProject(project.id);
      setIsExecuting(false);
    }, 700);
  };

  const getLanguageFromPath = (path: string): "python" | "typescript" | "javascript" | "json" | "markdown" => {
    if (path.endsWith(".py")) return "python";
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
    if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
    if (path.endsWith(".json")) return "json";
    return "markdown";
  };

  return (
    <Page kind="sink" kicker="Workspace" title={project.name} lead={`Template · ${project.template} · files stay on this device`} actions={<Back to="/projects">All projects</Back>}>
      <div className="lab-workspace stack--md">
        <Card className="lab__brief">
          <p className="meta">
            Runtime: Python 3.12 · Entrypoint: <code>{project.activePath}</code> · Maximum 40 files in workspace · Local persistent sandbox
          </p>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1.4fr 1fr", gap: "12px", minHeight: "580px" }}>
          {/* File Explorer — the extracted component carries its own name/confirm flows */}
          <FileExplorer
            files={project.files}
            activeFile={project.activePath}
            onSelectFile={(path) => setProjectActive(project.id, path)}
            onAddFile={createFile}
            onDeleteFile={(delPath) => deleteProjectFile(project.id, delPath)}
          />

          {/* Code Editor */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <EditorTabs
              files={project.files}
              activeFile={project.activePath}
              onSelectFile={(path) => setProjectActive(project.id, path)}
              onAddFile={() => setNamingFile(true)}
            />
            <div style={{ flex: 1, minHeight: 0 }}>
              {active ? (
                <CodeEditor
                  value={active.content}
                  onChange={(newVal) => saveProjectFile(project.id, active.path, newVal)}
                  language={getLanguageFromPath(active.path)}
                  filename={active.path}
                  onRun={handleRun}
                  isExecuting={isExecuting}
                  hideHeader
                />
              ) : (
                <StateBlock state="empty" message="No files yet." />
              )}
            </div>
          </div>

          {/* Terminal Console */}
          <Terminal
            output={project.output}
            isExecuting={isExecuting}
            onRun={handleRun}
            onClear={() => {
              runProject(project.id);
            }}
          />
        </div>
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
