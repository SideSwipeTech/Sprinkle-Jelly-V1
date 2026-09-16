import { Icon } from "@icons/Icon";
import { fileIcon } from "./language";

export interface EditorFile {
  path: string;
  name?: string;
  language?: string;
  isDirty?: boolean;
  content: string;
}

export interface EditorTabsProps {
  files: EditorFile[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  onCloseFile?: (path: string) => void;
  onAddFile?: () => void;
}

export function EditorTabs({
  files,
  activeFile,
  onSelectFile,
  onCloseFile,
  onAddFile,
}: EditorTabsProps) {
  return (
    <div className="editor-tabs" role="tablist" aria-label="Editor open files">
      <div className="editor-tabs__list">
        {files.map((file) => {
          const isActive = file.path === activeFile;
          const fileName = file.name || file.path.split("/").pop() || file.path;

          return (
            <div
              key={file.path}
              className={`editor-tab ${isActive ? "is-active" : ""}`}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => onSelectFile(file.path)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectFile(file.path);
                }
              }}
            >
              <span className="editor-tab__icon">
                <Icon name={fileIcon(fileName)} size={14} />
              </span>
              <span className="editor-tab__name">{fileName}</span>

              {file.isDirty && <span className="editor-tab__dirty-dot" title="Unsaved changes" />}

              {onCloseFile && files.length > 1 && (
                <button
                  type="button"
                  className="editor-tab__close"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.path);
                  }}
                  aria-label={`Close ${fileName}`}
                >
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {onAddFile && (
        <button
          type="button"
          className="editor-tabs__add-btn"
          onClick={onAddFile}
          title="Create new file"
        >
          <Icon name="alert" size={14} />
          <span style={{ fontSize: "12px", marginLeft: "4px" }}>+</span>
        </button>
      )}
    </div>
  );
}
