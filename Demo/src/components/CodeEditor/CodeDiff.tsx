/**
 * CodeDiff — a read-only comparison of two versions of a program, in the same
 * token-painted Monaco as the editor. Side by side when there is room, inline
 * when there is not. Inside a workbench it reports its change count to the
 * status bar in place of a cursor.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { DiffEditor, type DiffOnMount } from "@monaco-editor/react";
import { useLiveEditorTheme } from "./editor-theme";
import { languageName, type SupportedLanguage } from "./language";
import { useEditorPreferences } from "./preferences";
import { useWorkbench } from "./workbench-context";

interface DiffInstance {
  onDidUpdateDiff(listener: () => void): { dispose(): void };
  getLineChanges(): unknown[] | null;
}

export interface CodeDiffProps {
  original: string;
  modified: string;
  language: SupportedLanguage;
  /** Unique per comparison so models never leak between cases. */
  modelKey: string;
  originalLabel?: string;
  modifiedLabel?: string;
}

export function CodeDiff({
  original,
  modified,
  language,
  modelKey,
  originalLabel = "Original",
  modifiedLabel = "Yours"
}: CodeDiffProps) {
  const workbench = useWorkbench();
  const prefs = useEditorPreferences();
  const { theme, hostRef, beforeMount } = useLiveEditorTheme();
  const [fontFamily, setFontFamily] = useState<string | undefined>(undefined);
  const [changes, setChanges] = useState<number | null>(null);
  const subscription = useRef<{ dispose(): void } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const family = getComputedStyle(host).getPropertyValue("--font-mono").trim();
    if (family) setFontFamily(family);
  }, [hostRef]);

  useEffect(() => {
    if (!workbench) return;
    workbench.status.set({ language, readOnly: true, changes: changes ?? 0, selected: 0 });
  }, [workbench, language, changes]);

  useEffect(
    () => () => {
      subscription.current?.dispose();
      workbench?.status.set({ changes: null, readOnly: false });
    },
    [workbench]
  );

  const handleMount: DiffOnMount = (instance) => {
    const diff = instance as unknown as DiffInstance;
    const update = () => setChanges(diff.getLineChanges()?.length ?? 0);
    subscription.current = diff.onDidUpdateDiff(update);
  };

  const options = useMemo(
    () => ({
      readOnly: true,
      originalEditable: false,
      renderSideBySide: true,
      useInlineViewWhenSpaceIsLimited: true,
      renderSideBySideInlineBreakpoint: 720,
      fontSize: prefs.fontSize,
      lineHeight: Math.round(prefs.fontSize * 1.6),
      fontFamily,
      fontLigatures: true,
      wordWrap: prefs.wordWrap ? ("on" as const) : ("off" as const),
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      renderOverviewRuler: false,
      ignoreTrimWhitespace: false,
      renderIndicators: true,
      padding: { top: prefs.fontSize, bottom: prefs.fontSize },
      scrollbar: { useShadows: false, verticalScrollbarSize: 10, horizontalScrollbarSize: 10 }
    }),
    [prefs.fontSize, prefs.wordWrap, fontFamily]
  );

  return (
    <div ref={hostRef} className="code-diff" aria-label={`Comparison of ${originalLabel} and ${modifiedLabel}, ${languageName(language)}`} role="region">
      <div className="code-diff__labels" aria-hidden="true">
        <span data-side="original">{originalLabel}</span>
        <span data-side="modified">{modifiedLabel}</span>
      </div>
      <div className="code-diff__body">
        <DiffEditor
          height="100%"
          language={language}
          original={original}
          modified={modified}
          originalModelPath={`diff/${modelKey}/original`}
          modifiedModelPath={`diff/${modelKey}/modified`}
          keepCurrentOriginalModel
          keepCurrentModifiedModel
          theme={theme}
          beforeMount={beforeMount}
          onMount={handleMount}
          options={options}
          loading={<div className="pro-editor__loading" role="status"><span className="pro-editor__loading-text">Loading comparison…</span></div>}
        />
      </div>
    </div>
  );
}
