import type { ReactNode } from "react";
import { useState } from "react";
import { Icon } from "@icons/Icon";
import { TemplateFileSet } from "./TemplateFileSet";

/* Panel stand-ins: the real surfaces are sibling components (x-file-explorer,
   x-editor-tabs, x-editor, x-terminal) referenced by class per contract §6 —
   these divs carry the same hooks so the fusion rules demonstrate in the sink
   without mounting a Monaco instance per state. */

const FILES = ["main.py", "notes/store.py", "README.md"];

function FakeExplorer({ active }: { active: string }) {
  return (
    <div className="x-file-explorer">
      <div className="x-file-explorer__head">
        <span className="x-file-explorer__title">Explorer</span>
      </div>
      <ul className="x-file-explorer__tree">
        {FILES.map((path) => (
          <li key={path} className="x-file-explorer__item" data-on={path === active || undefined}>
            <button
              type="button"
              className="x-file-explorer__select"
              aria-current={path === active || undefined}
            >
              {path}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FakeTabs({ active, onSelect }: { active: string; onSelect: (p: string) => void }) {
  return (
    <div className="x-editor-tabs" role="tablist" aria-label="Open files">
      <div className="x-editor-tabs__list">
        {FILES.map((path) => (
          <div
            key={path}
            className="x-editor-tab"
            role="tab"
            data-on={path === active || undefined}
            aria-selected={path === active}
            tabIndex={path === active ? 0 : -1}
            onClick={() => onSelect(path)}
          >
            <span className="x-editor-tab__name">{path.split("/").pop()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FakeEditor({ path }: { path: string }) {
  return (
    <div className="x-editor">
      <header className="x-editor__header">
        <div className="x-editor__file-meta">
          <span className="x-editor__filename">{path}</span>
          <span className="x-editor__lang">python</span>
        </div>
      </header>
    </div>
  );
}

function FakeTerminal() {
  return (
    <div className="x-terminal">
      <div className="x-terminal__body">
        <div className="x-terminal__prompt">
          <span className="x-terminal__prompt-sign" aria-hidden="true">$</span>
          <span>python main.py</span>
        </div>
        <pre className="x-terminal__output">{"notes> add \"call the dentist\"\nsaved · notes.json"}</pre>
      </div>
    </div>
  );
}

function Checklist() {
  return (
    <>
      <p className="x-template-files__side-title">Checklist — what a learner gets</p>
      <ul className="x-template-files__tasks">
        <li className="x-template-files__task">
          <span className="x-template-files__task-box" aria-hidden="true" />
          Wire the add command to the store
        </li>
        <li className="x-template-files__task">
          <span className="x-template-files__task-box" aria-hidden="true" />
          Persist notes to notes.json
        </li>
      </ul>
    </>
  );
}

function PathRow({ entry = false }: { entry?: boolean }) {
  return (
    <>
      <span className="x-template-files__path-name">main.py</span>
      <span className="x-template-files__path-actions">
        {entry ? <span><Icon name="star" size={12} /> entry file</span> : null}
      </span>
    </>
  );
}

function SetDemo({ mode = "author", output = true, files = true, checklist = true }: {
  mode?: "author" | "preview";
  output?: boolean;
  files?: boolean;
  checklist?: boolean;
}) {
  const [active, setActive] = useState("main.py");
  return (
    <TemplateFileSet
      label="Notes CLI Utility — draft"
      mode={mode}
      explorer={<FakeExplorer active={active} />}
      tabs={files ? <FakeTabs active={active} onSelect={setActive} /> : undefined}
      pathRow={<PathRow entry />}
      editor={files ? <FakeEditor path={active} /> : undefined}
      output={output ? <FakeTerminal /> : undefined}
      checklist={checklist ? <Checklist /> : undefined}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "author",
    label: "Author — rail · tabs · path row · editor · output dock · checklist strip",
    render: () => <SetDemo />
  },
  {
    key: "preview",
    label: "Preview — the draft exactly as a learner meets it (no output dock)",
    render: () => <SetDemo mode="preview" output={false} />
  },
  {
    key: "no-side",
    label: "No checklist — the side column collapses",
    render: () => <SetDemo checklist={false} />
  },
  {
    key: "empty",
    label: "No files — honest empty editor well, no dock",
    render: () => <SetDemo files={false} output={false} checklist={false} />
  }
];
