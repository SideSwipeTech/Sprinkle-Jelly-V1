/**
 * blocks.tsx — the six authored block types the course studio edits
 * (courses.F08): heading, rich text, callout, image, display-only code and
 * runnable code. A closed set — quizzes, videos, integration references and
 * course-assigned projects are lesson types, never a seventh block.
 *
 * Two renderers per type, split from LessonBlockEditor.tsx for the file bound:
 *
 *   BlockFields   the authoring side — every region where a person types code
 *                 renders the one registered code editor (CodeEditorChrome,
 *                 the `courses` variant: compact and inline in the reader's
 *                 measure).
 *   BlockPreview  the live preview — the real learner view with running
 *                 disabled, so it cannot diverge from what a learner meets.
 *                 A runnable block reads Preview only; an unsupported
 *                 language reads coming soon.
 */

import { useState } from "react";
import { Icon } from "@icons/Icon";
import { CodeEditorChrome } from "../CodeEditorChrome/CodeEditorChrome";
import type { SupportedLanguage } from "../CodeEditorChrome/CodeEditorChrome";
import { Field } from "../Field/Field";
import { Select } from "../Select/Select";

/* ── The six block types ─────────────────────────────────────────────────── */

export type LessonBlockKind =
  | "heading"
  | "rich-text"
  | "callout"
  | "image"
  | "display-code"
  | "runnable-code";

export type CalloutKind = "note" | "key-takeaway";

export interface LessonBlock {
  id: string;
  type: LessonBlockKind;
  /** heading text · rich-text body · callout body. */
  text?: string;
  /** heading level — 2 or 3, the only authored depths. */
  level?: 2 | 3;
  /** callout kind — the closed set the reader renders. */
  kind?: CalloutKind;
  /** image fields. */
  src?: string;
  alt?: string;
  caption?: string;
  /** code fields — display-only and runnable. */
  language?: string;
  code?: string;
  filename?: string;
}

export const BLOCK_ORDER: readonly LessonBlockKind[] = [
  "heading",
  "rich-text",
  "callout",
  "image",
  "display-code",
  "runnable-code"
];

export const BLOCK_LABEL: Record<LessonBlockKind, string> = {
  heading: "Heading",
  "rich-text": "Rich text",
  callout: "Callout",
  image: "Image",
  "display-code": "Display-only code",
  "runnable-code": "Runnable code"
};

/** What an empty block of each kind carries when it is added. */
export function emptyBlock(type: LessonBlockKind, id: string): LessonBlock {
  const base: LessonBlock = { id, type };
  if (type === "heading") return { ...base, text: "", level: 2 };
  if (type === "callout") return { ...base, kind: "note", text: "" };
  if (type === "display-code")
    return { ...base, language: "python", filename: "example.py", code: "" };
  if (type === "runnable-code")
    return { ...base, language: "python", filename: "try-it.py", code: "" };
  return base;
}

/** The one-line label a comparison row carries — type plus its first words. */
export function blockSummary(block: LessonBlock): string {
  const label = BLOCK_LABEL[block.type];
  const detail =
    block.text?.trim() || block.filename || block.alt || block.src || "";
  return detail ? `${label} — “${detail.slice(0, 40)}${detail.length > 40 ? "…" : ""}”` : label;
}

/* ── Languages ───────────────────────────────────────────────────────────── */

/** The runtimes a runnable block may name — the platform's registry set. */
export const RUNNABLE_LANGUAGES: readonly string[] = [
  "python",
  "javascript",
  "typescript",
  "java",
  "cpp",
  "go"
];

export const RUNNABLE_LANGUAGE_LABEL: Record<string, string> = {
  python: "Python 3",
  javascript: "JavaScript (ES6)",
  typescript: "TypeScript 5.5",
  java: "Java 21",
  cpp: "C++ 20",
  go: "Go 1.22"
};

/** The grammars display-only code may name. */
export const DISPLAY_LANGUAGES: readonly SupportedLanguage[] = [
  "python",
  "javascript",
  "typescript",
  "java",
  "cpp",
  "go",
  "json",
  "markdown",
  "html",
  "css"
];

export function isRunnableSupported(language: string | undefined): boolean {
  return RUNNABLE_LANGUAGES.includes(language ?? "");
}

/**
 * The authored id passes straight through — a language the editor has no
 * grammar for falls through to Monaco's plain text, and the chrome's badge
 * still prints the authored id rather than a substituted one.
 */
export function editorLanguage(language: string | undefined): SupportedLanguage {
  return (language ?? "python") as SupportedLanguage;
}

/* ── Authoring side ──────────────────────────────────────────────────────── */

export interface BlockFieldsProps {
  block: LessonBlock;
  onPatch: (patch: Partial<LessonBlock>) => void;
}

export function BlockFields({ block, onPatch }: BlockFieldsProps) {
  switch (block.type) {
    case "heading":
      return (
        <div className="x-block-editor__fields">
          <Field label="Heading text">
            <input
              value={block.text ?? ""}
              onChange={(e) => onPatch({ text: e.target.value })}
            />
          </Field>
          <Field label="Level" hint="The only authored depths — section and sub-section.">
            <Select
              value={String(block.level ?? 2)}
              options={[
                { value: "2", label: "Heading 2" },
                { value: "3", label: "Heading 3" }
              ]}
              onChange={(v) => onPatch({ level: v === "3" ? 3 : 2 })}
            />
          </Field>
        </div>
      );
    case "rich-text":
      return (
        <Field label="Body" hint="Blank lines separate paragraphs.">
          <textarea
            value={block.text ?? ""}
            onChange={(e) => onPatch({ text: e.target.value })}
          />
        </Field>
      );
    case "callout":
      return (
        <div className="x-block-editor__fields">
          <Field label="Callout kind" hint="A closed set — no new callout kind.">
            <Select
              value={block.kind ?? "note"}
              options={[
                { value: "note", label: "Note" },
                { value: "key-takeaway", label: "Key takeaway" }
              ]}
              onChange={(v) => onPatch({ kind: v as CalloutKind })}
            />
          </Field>
          <Field label="Callout text">
            <textarea
              value={block.text ?? ""}
              onChange={(e) => onPatch({ text: e.target.value })}
            />
          </Field>
        </div>
      );
    case "image":
      return (
        <div className="x-block-editor__fields">
          <Field label="Image address" hint="A missing or unreadable image renders “Image unavailable” to the learner.">
            <input
              value={block.src ?? ""}
              onChange={(e) => onPatch({ src: e.target.value })}
            />
          </Field>
          <Field label="Alt text">
            <input
              value={block.alt ?? ""}
              onChange={(e) => onPatch({ alt: e.target.value })}
            />
          </Field>
          <Field label="Caption">
            <input
              value={block.caption ?? ""}
              onChange={(e) => onPatch({ caption: e.target.value })}
            />
          </Field>
        </div>
      );
    case "display-code":
    case "runnable-code": {
      const runnable = block.type === "runnable-code";
      const known = runnable ? isRunnableSupported(block.language) : true;
      const options = runnable
        ? [
            ...RUNNABLE_LANGUAGES.map((v) => ({
              value: v,
              label: RUNNABLE_LANGUAGE_LABEL[v] ?? v
            })),
            ...(known
              ? []
              : [{ value: block.language ?? "", label: `${block.language} — coming soon` }])
          ]
        : DISPLAY_LANGUAGES.map((v) => ({ value: v, label: v }));
      return (
        <div className="x-block-editor__fields x-block-editor__fields--code">
          <div className="x-block-editor__code-meta">
            <Field label="File name">
              <input
                value={block.filename ?? ""}
                onChange={(e) => onPatch({ filename: e.target.value })}
              />
            </Field>
            <Field
              label="Language"
              hint={
                runnable
                  ? "The platform's runtime registry — an unsupported language reads coming soon to the learner."
                  : "Display only — the learner never runs it."
              }
            >
              <Select
                value={block.language ?? ""}
                options={options}
                onChange={(v) => onPatch({ language: v })}
              />
            </Field>
          </div>
          <div className="x-block-editor__code">
            <CodeEditorChrome
              value={block.code ?? ""}
              onChange={(v) => onPatch({ code: v })}
              language={editorLanguage(block.language)}
              filename={block.filename || "untitled"}
              height="var(--x-block-editor-code-height, 14rem)"
              showMinimap={false}
            />
          </div>
          {runnable ? (
            <p className="x-block-editor__block-note">
              Runs in the lesson reader on the platform's execution lanes — the
              preview beside it keeps running disabled.
            </p>
          ) : null}
        </div>
      );
    }
  }
}

/* ── Learner side (the live preview) ─────────────────────────────────────── */

function ImagePreview({ block }: { block: LessonBlock }) {
  const [failed, setFailed] = useState(false);
  if (!block.src || failed) {
    return (
      <p className="x-block-editor__pv-missing" role="status">
        <Icon name="alert" size={14} /> Image unavailable
      </p>
    );
  }
  return (
    <figure className="x-block-editor__pv-figure">
      <img
        src={block.src}
        alt={block.alt ?? ""}
        onError={() => setFailed(true)}
      />
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  );
}

export function BlockPreview({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = block.level === 3 ? "h4" : "h3";
      return (
        <Tag className="x-block-editor__pv-heading">
          {block.text?.trim() || "Untitled heading"}
        </Tag>
      );
    }
    case "rich-text":
      return (
        <div className="x-block-editor__pv-prose">
          {(block.text ?? "").split(/\n\s*\n/).map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : null
          )}
        </div>
      );
    case "callout":
      return (
        <div
          className="x-block-editor__pv-callout"
          data-kind={block.kind ?? "note"}
        >
          <span className="x-block-editor__pv-callout-label">
            {block.kind === "key-takeaway" ? "Key takeaway" : "Note"}
          </span>
          <p>{block.text}</p>
        </div>
      );
    case "image":
      return <ImagePreview block={block} />;
    case "display-code":
      return (
        <CodeEditorChrome
          value={block.code ?? ""}
          language={editorLanguage(block.language)}
          filename={block.filename || "untitled"}
          height="var(--x-block-editor-pv-code-height, 12rem)"
          showMinimap={false}
          readOnly
        />
      );
    case "runnable-code":
      if (!isRunnableSupported(block.language)) {
        return (
          <p className="x-block-editor__pv-missing" role="status">
            <Icon name="clock" size={14} /> {block.language || "This language"} — coming soon
          </p>
        );
      }
      return (
        <div className="x-block-editor__pv-runnable">
          <CodeEditorChrome
            value={block.code ?? ""}
            language={editorLanguage(block.language)}
            filename={block.filename || "untitled"}
            height="var(--x-block-editor-pv-code-height, 12rem)"
            showMinimap={false}
            readOnly
            toolbarActions={
              <span className="x-block-editor__pv-only">
                <Icon name="lock" size={12} /> Preview only
              </span>
            }
          />
          <p className="x-block-editor__pv-note">
            Preview only — running is disabled in the studio preview.
          </p>
        </div>
      );
  }
}
