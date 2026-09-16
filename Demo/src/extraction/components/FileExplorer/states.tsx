import type { ReactNode } from "react";
import { useState } from "react";
import { FileExplorer } from "./FileExplorer";
import type { EditorFile } from "@components/CodeEditor";

const FILES: EditorFile[] = [
  { path: "main.py", content: "" },
  { path: "helpers/parse.py", content: "" },
  { path: "helpers/text/wrap.py", content: "" },
  { path: "README.md", content: "" }
];

/* The explorer lives in a rail (190-224px on the real pages) — bound the demo
   to the rail token so the cell's full width doesn't flatten it into a list. */
const RAIL = { maxWidth: "var(--shell-nav-rail-width)" } as const;

function Demo({ full = true }: { full?: boolean }) {
  const [files, setFiles] = useState(FILES);
  const [active, setActive] = useState("main.py");
  return (
    <div style={RAIL}>
      <FileExplorer
        files={files}
        activeFile={active}
        onSelectFile={setActive}
        onAddFile={full ? (name) => setFiles((prev) => [...prev, { path: name, content: "" }]) : undefined}
        onDeleteFile={full ? (p) => setFiles((prev) => prev.filter((f) => f.path !== p)) : undefined}
        onRenameFile={
          full
            ? (oldPath, newPath) =>
                setFiles((prev) => prev.map((f) => (f.path === oldPath ? { ...f, path: newPath } : f)))
            : undefined
        }
      />
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "full",
    label: "Full — depth-indented tree, new-file form, inline rename, delete via x-dialog confirm",
    render: () => <Demo />
  },
  {
    key: "read-only",
    label: "Read-only rail — selection only, no affordances",
    render: () => <Demo full={false} />
  }
];
