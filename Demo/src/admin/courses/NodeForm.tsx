/**
 * NodeForm — the one create/edit dialog the studio tree opens at every
 * level: subject or course, chapter or module, lesson. The fields are the
 * node's name and core fields only — a lesson's content still belongs to
 * the lesson editor, and a created node lands as a draft that may stay
 * incomplete.
 *
 * Chosen, not stated: the documents name no tree-level create form, so the
 * fields are the smallest set the fixtures carry — title everywhere, the
 * address name on an item or a lesson (empty derives from the title), the
 * five lesson types and required/optional on a lesson (required marking is
 * a Video Courses field), and open/Sequential navigation on a course. No
 * field here offers an active toggle.
 */

import { useState } from "react";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import {
  GROUP_LABEL,
  ITEM_LABEL,
  LESSON_TYPE_LABEL,
  addressFromTitle,
  type Family,
  type LessonType
} from "./fixtures";

export type NodeKind = "item" | "group" | "lesson";

/** The editable fields every node kind carries into the dialog. */
export interface NodeSeed {
  title: string;
  address: string;
  lessonType: LessonType;
  required: boolean;
  navigation: "open" | "sequential";
}

export const EMPTY_SEED: NodeSeed = {
  title: "",
  address: "",
  lessonType: "text",
  required: true,
  navigation: "open"
};

/** The family-aware word a node kind is named in. */
function nodeWord(kind: NodeKind, family: Family): string {
  if (kind === "item") return ITEM_LABEL[family];
  if (kind === "group") return GROUP_LABEL[family];
  return "lesson";
}

export function NodeForm({
  mode,
  kind,
  family,
  seed,
  onSubmit,
  onClose
}: {
  mode: "create" | "edit";
  kind: NodeKind;
  family: Family;
  seed: NodeSeed;
  onSubmit: (values: NodeSeed) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<NodeSeed>(seed);
  const word = nodeWord(kind, family);

  const set = <K extends keyof NodeSeed>(key: K, value: NodeSeed[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  /* The address bound is the import validator's own: lowercase letters,
     digits and hyphens. Empty is valid on a create — it derives from the
     title. */
  const hasAddress = kind === "item" || kind === "lesson";
  const addressOk =
    !hasAddress || values.address.trim() === "" || /^[a-z0-9-]+$/.test(values.address.trim());
  const valid = values.title.trim().length > 0 && addressOk;

  return (
    <Dialog
      title={`${mode === "create" ? "New" : "Edit"} ${word}`}
      icon={mode === "create" ? "plus" : "edit"}
      onClose={onClose}
      actions={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid} onClick={() => onSubmit(values)}>
            {mode === "create" ? `Create ${word}` : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="list">
        <label className="field">
          <span className="meta">Title</span>
          <input
            data-autofocus
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </label>

        {hasAddress ? (
          <label className="field">
            <span className="meta">Address name</span>
            <input
              value={values.address}
              placeholder={addressFromTitle(values.title)}
              aria-invalid={!addressOk}
              onChange={(e) => set("address", e.target.value)}
            />
            <span className="meta">
              {mode === "create"
                ? "Lowercase letters, digits and hyphens — empty derives from the title."
                : "Lowercase letters, digits and hyphens."}
            </span>
            {!addressOk ? (
              <span className="cs-refusal">
                “{values.address.trim()}” is malformed — bound: lowercase letters, digits and
                hyphens.
              </span>
            ) : null}
          </label>
        ) : null}

        {kind === "lesson" ? (
          <label className="field">
            <span className="meta">Lesson type</span>
            <select
              value={values.lessonType}
              onChange={(e) => set("lessonType", e.target.value as LessonType)}
            >
              {(Object.keys(LESSON_TYPE_LABEL) as LessonType[]).map((t) => (
                <option key={t} value={t}>
                  {LESSON_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {kind === "lesson" && family === "video" ? (
          <label className="field">
            <span className="meta">Required or optional</span>
            <select
              value={values.required ? "required" : "optional"}
              onChange={(e) => set("required", e.target.value === "required")}
            >
              <option value="required">required</option>
              <option value="optional">optional</option>
            </select>
          </label>
        ) : null}

        {kind === "item" && family === "video" ? (
          <label className="field">
            <span className="meta">Navigation</span>
            <select
              value={values.navigation}
              onChange={(e) => set("navigation", e.target.value as "open" | "sequential")}
            >
              <option value="open">open</option>
              <option value="sequential">Sequential</option>
            </select>
          </label>
        ) : null}

        {mode === "create" ? (
          <p className="cs-hint">
            Lands as a draft — a draft may be left incomplete.
            {kind === "lesson" ? " Content is authored in the lesson editor." : ""}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
