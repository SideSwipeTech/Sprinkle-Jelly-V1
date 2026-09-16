import { useState } from "react";
import { Icon } from "@icons/Icon";
import type { EditorFile } from "./EditorTabs";
import { fileIcon } from "./language";

export interface FileExplorerProps {
  files: EditorFile[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  onAddFile?: (filename: string) => void;
  onDeleteFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
}

export function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onAddFile,
  onDeleteFile,
}: FileExplorerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim() && onAddFile) {
      onAddFile(newFileName.trim());
      setNewFileName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer__header">
        <span className="file-explorer__title">
          <Icon name="folder" size={14} />
          <span>Explorer</span>
        </span>

        {onAddFile && (
          <button
            type="button"
            className="file-explorer__action-btn"
            onClick={() => setIsCreating(!isCreating)}
            title="New File"
          >
            <Icon name="alert" size={13} />
            <span style={{ fontSize: "12px", marginLeft: "2px" }}>+</span>
          </button>
        )}
      </div>

      {isCreating && (
        <form className="file-explorer__new-form" onSubmit={handleCreate}>
          <input
            type="text"
            className="file-explorer__new-input"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.py"
            autoFocus
            onBlur={() => {
              if (!newFileName.trim()) setIsCreating(false);
            }}
          />
        </form>
      )}

      <div className="file-explorer__tree">
        {files.map((file) => {
          const isActive = file.path === activeFile;
          return (
            <div
              key={file.path}
              className={`file-explorer__item ${isActive ? "is-active" : ""}`}
              onClick={() => onSelectFile(file.path)}
            >
              <span className="file-explorer__icon">
                <Icon name={fileIcon(file.path)} size={14} />
              </span>
              <span className="file-explorer__label">{file.path}</span>

              {onDeleteFile && files.length > 1 && (
                <button
                  type="button"
                  className="file-explorer__delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${file.path}?`)) {
                      onDeleteFile(file.path);
                    }
                  }}
                  title="Delete file"
                >
                  <Icon name="x" size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
