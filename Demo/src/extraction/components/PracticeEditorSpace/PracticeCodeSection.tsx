/**
 * PracticeCodeSection — the Code section of the shared practice editing
 * space: a language strip (EditorTabs, one tab per offered language) over a
 * two-side code surface — the learner-visible starter against the
 * administrator-only reference solution, which is labelled staff only and
 * never reaches a learner's page.
 *
 * A draft offering no language says so rather than rendering an empty
 * editor. Debug re-words the two sides through `starterWord`/`referenceWord`
 * ("Buggy program" / "Reference fix") — the same two-sided surface.
 */

import { useState } from "react";
import { EditorTabs } from "../EditorTabs/EditorTabs";
import { CodeEditorChrome } from "../CodeEditorChrome/CodeEditorChrome";
import type { SupportedLanguage } from "../CodeEditorChrome/CodeEditorChrome";
import { PracticeSection } from "./PracticeSection";
import type { PracticeDraft, PracticeLanguage } from "./types";

const CODE_EXT: Record<string, string> = {
  python: "py",
  javascript: "js",
  typescript: "ts",
  java: "java",
  cpp: "cpp",
  go: "go"
};

export interface PracticeCodeSectionProps {
  draft: PracticeDraft;
  readOnly?: boolean;
  onDraftChange?: (patch: Partial<PracticeDraft>) => void;
  starterWord: string;
  referenceWord: string;
}

export function PracticeCodeSection({
  draft,
  readOnly = false,
  onDraftChange,
  starterWord,
  referenceWord
}: PracticeCodeSectionProps) {
  const [langKey, setLangKey] = useState(draft.languages[0]?.key ?? "");
  const [side, setSide] = useState<"starter" | "reference">("starter");

  const activeLang = draft.languages.find((l) => l.key === langKey) ?? draft.languages[0];
  const ext = activeLang ? (CODE_EXT[activeLang.key] ?? "txt") : "txt";

  const patchLanguage = (key: string, p: Partial<PracticeLanguage>) =>
    onDraftChange?.({ languages: draft.languages.map((l) => (l.key === key ? { ...l, ...p } : l)) });

  return (
    <PracticeSection
      title="Code"
      aside={
        <span className="x-practice-space__section-note">
          {referenceWord.toLowerCase()} is staff only — it never reaches a learner's page.
        </span>
      }
    >
      {draft.languages.length === 0 ? (
        <p className="x-practice-space__empty">
          No languages offered yet — offered languages come from the platform's one runtime registry.
        </p>
      ) : (
        <>
          <EditorTabs
            files={draft.languages.map((l) => ({ path: l.key, name: l.label, content: "" }))}
            activeFile={activeLang?.key ?? ""}
            onSelectFile={setLangKey}
            label="Offered languages"
          />
          {activeLang ? (
            <>
              <div className="x-practice-space__side-tabs" role="tablist" aria-label="Code side">
                {(["starter", "reference"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={side === s}
                    tabIndex={side === s ? 0 : -1}
                    data-on={side === s || undefined}
                    className="x-practice-space__side-tab"
                    onClick={() => setSide(s)}
                  >
                    {s === "starter" ? starterWord : referenceWord}
                    {s === "reference" ? <span className="x-practice-space__staff-only">staff only</span> : null}
                  </button>
                ))}
              </div>
              <div className="x-practice-space__editor">
                <CodeEditorChrome
                  value={side === "starter" ? activeLang.starter : activeLang.reference}
                  onChange={(v) =>
                    patchLanguage(activeLang.key, side === "starter" ? { starter: v } : { reference: v })
                  }
                  language={activeLang.language ?? (activeLang.key as SupportedLanguage)}
                  filename={`${side}.${ext}`}
                  readOnly={readOnly}
                  height="var(--x-practice-space-editor-height, 20rem)"
                  showMinimap={false}
                />
              </div>
            </>
          ) : null}
        </>
      )}
    </PracticeSection>
  );
}
