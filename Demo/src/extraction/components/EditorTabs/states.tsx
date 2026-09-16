import type { ReactNode } from "react";
import { useState } from "react";
import { EditorTabs, type EditorFile } from "./EditorTabs";

const FILES: EditorFile[] = [
  { path: "main.py", content: "print('hi')" },
  { path: "solution.py", content: "", isDirty: true },
  { path: "README.md", content: "# notes" },
  { path: "util.go", content: "package main" }
];

function Demo({ closable = true, addable = true }: { closable?: boolean; addable?: boolean }) {
  const [files, setFiles] = useState(FILES);
  const [active, setActive] = useState("main.py");
  return (
    <EditorTabs
      files={files}
      activeFile={active}
      onSelectFile={setActive}
      onCloseFile={
        closable
          ? (p) => {
              setFiles((prev) => prev.filter((f) => f.path !== p));
              if (active === p) setActive(files.find((f) => f.path !== p)?.path ?? "");
            }
          : undefined
      }
      onAddFile={
        addable
          ? () => {
              const path = `untitled-${files.length}.py`;
              setFiles((prev) => [...prev, { path, content: "" }]);
              setActive(path);
            }
          : undefined
      }
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "default",
    label: "Open files — dirty marker, close, add (Arrow keys move selection)",
    render: () => <Demo />
  },
  {
    key: "read-only-strip",
    label: "No close / no add (read-only strip)",
    render: () => <Demo closable={false} addable={false} />
  }
];
