/**
 * LessonBlockEditor state matrix for the Kitchen Sink — editing, the
 * running-disabled preview, the unsaved-work guard, and the save-conflict
 * refusal with its comparison.
 */
import { useState, type ReactNode } from "react";
import { LessonBlockEditor } from "./LessonBlockEditor";
import type { LessonBlock, SaveConflict } from "./LessonBlockEditor";

const DEMO_BLOCKS: LessonBlock[] = [
  { id: "b1", type: "heading", text: "Closures in Practice", level: 2 },
  {
    id: "b2",
    type: "rich-text",
    text: "A closure keeps its enclosing scope alive after the outer call returns.\n\nThe loop-variable pitfall binds the cell, not the snapshot."
  },
  { id: "b3", type: "callout", kind: "key-takeaway", text: "Capture loop values with a default argument binding." },
  {
    id: "b4",
    type: "runnable-code",
    language: "python",
    filename: "closure.py",
    code: "def make_multipliers():\n    return [lambda x, i=i: x * i for i in range(4)]\n\nprint([m(2) for m in make_multipliers()])"
  }
];

function EditingDemo() {
  const [blocks, setBlocks] = useState<LessonBlock[]>(DEMO_BLOCKS);
  const [dirty, setDirty] = useState(false);
  return (
    <LessonBlockEditor
      blocks={blocks}
      dirty={dirty}
      saveState="saved"
      onChange={(next) => {
        setBlocks(next);
        setDirty(true);
      }}
      onSave={() => setDirty(false)}
    />
  );
}

function GuardDemo() {
  const [blocks] = useState<LessonBlock[]>(DEMO_BLOCKS);
  return (
    <LessonBlockEditor
      blocks={blocks}
      dirty
      saveState="saved"
      leaveGuard={{ open: true, onStay: () => {}, onLeave: () => {} }}
    />
  );
}

const CONFLICT: SaveConflict = {
  savedBy: "Meera",
  savedAt: "14:32 today",
  theirBlocks: [
    { id: "s1", type: "heading", text: "Closures, rewritten", level: 2 },
    { id: "s2", type: "rich-text", text: "A closure retains the cell, not the value." },
    { id: "s3", type: "image", src: "closure-cells.png", alt: "Cell diagram" }
  ]
};

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "editing",
    label: "Editing — the six block types, reorder, add",
    render: () => <EditingDemo />
  },
  {
    key: "preview",
    label: "Preview — runnable reads Preview only, unsupported reads coming soon",
    render: () => (
      <LessonBlockEditor
        blocks={[
          {
            id: "p1",
            type: "runnable-code",
            language: "python",
            filename: "scopes.py",
            code: "x = 1\nprint(x)"
          },
          {
            id: "p2",
            type: "runnable-code",
            language: "rust",
            filename: "main.rs",
            code: "fn main() { println!(\"hi\"); }"
          },
          {
            id: "p3",
            type: "display-code",
            language: "sql",
            filename: "query.sql",
            code: "select 1;"
          }
        ]}
        saveState="saved"
      />
    )
  },
  {
    key: "unsaved-guard",
    label: "Unsaved-work guard — leave without saving dialog",
    render: () => <GuardDemo />
  },
  {
    key: "save-conflict",
    label: "Save-conflict refusal — named, with comparison",
    render: () => (
      <LessonBlockEditor
        blocks={DEMO_BLOCKS}
        dirty
        saveState="conflict"
        conflict={CONFLICT}
        onConflictResolve={() => {}}
        onSave={() => {}}
      />
    )
  },
  {
    key: "retry",
    label: "Not saved — tap to retry",
    render: () => (
      <LessonBlockEditor blocks={DEMO_BLOCKS} dirty saveState="retry" onSave={() => {}} />
    )
  },
  {
    key: "saved-locally",
    label: "Saved locally — never renders as saved",
    render: () => (
      <LessonBlockEditor blocks={DEMO_BLOCKS} saveState="saved-locally" onSave={() => {}} />
    )
  }
];
