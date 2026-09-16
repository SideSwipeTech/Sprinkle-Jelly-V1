/**
 * PracticeCaseTable — the Cases section of the shared practice editing
 * space: one row per authored case, marked visible or hidden, each carrying
 * its prepared input and expected output. A draft with no cases says so —
 * publish needs at least one visible and one hidden case, and the checklist
 * names it.
 *
 * Rows edit inline (DataTable cells hold the controls); read-only surfaces
 * render the same grid as facts.
 */

import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Select } from "../Select/Select";
import { DataTable } from "../DataTable/DataTable";
import type { DataRowSpec } from "../DataTable/DataTable";
import { PracticeSection } from "./PracticeSection";
import type { PracticeCase, PracticeDraft } from "./types";

export interface PracticeCaseTableProps {
  draft: PracticeDraft;
  readOnly?: boolean;
  onDraftChange?: (patch: Partial<PracticeDraft>) => void;
}

export function PracticeCaseTable({ draft, readOnly = false, onDraftChange }: PracticeCaseTableProps) {
  const patch = (p: Partial<PracticeDraft>) => onDraftChange?.(p);
  const patchCase = (key: string, p: Partial<PracticeCase>) =>
    patch({ cases: draft.cases.map((c) => (c.key === key ? { ...c, ...p } : c)) });

  const rows: DataRowSpec[] = draft.cases.map((c, i) => ({
    key: c.key,
    cells: [
      <span className="x-practice-space__case-name">Case {i + 1}</span>,
      readOnly ? (
        c.visibility
      ) : (
        <Select
          size="sm"
          aria-label={`Case ${i + 1} visibility`}
          value={c.visibility}
          options={[
            { value: "visible", label: "Visible" },
            { value: "hidden", label: "Hidden" }
          ]}
          onChange={(v) => patchCase(c.key, { visibility: v as PracticeCase["visibility"] })}
        />
      ),
      readOnly ? (
        <code className="x-practice-space__case-value">{c.input || "—"}</code>
      ) : (
        <input
          className="x-practice-space__case-input"
          value={c.input}
          aria-label={`Case ${i + 1} prepared input`}
          onChange={(e) => patchCase(c.key, { input: e.target.value })}
        />
      ),
      readOnly ? (
        <code className="x-practice-space__case-value">{c.expected || "—"}</code>
      ) : (
        <input
          className="x-practice-space__case-input"
          value={c.expected}
          aria-label={`Case ${i + 1} expected output`}
          onChange={(e) => patchCase(c.key, { expected: e.target.value })}
        />
      ),
      readOnly ? null : (
        <IconButton
          icon="x"
          iconSize={13}
          label={`Remove case ${i + 1}`}
          onClick={() => patch({ cases: draft.cases.filter((x) => x.key !== c.key) })}
        />
      )
    ]
  }));

  return (
    <PracticeSection
      title="Cases"
      aside={
        !readOnly && onDraftChange ? (
          <Button
            variant="quiet"
            size="sm"
            icon="plus"
            onClick={() =>
              patch({
                cases: [
                  ...draft.cases,
                  { key: `case-${draft.cases.length + 1}`, visibility: "visible", input: "", expected: "" }
                ]
              })
            }
          >
            Add case
          </Button>
        ) : undefined
      }
    >
      {draft.cases.length === 0 ? (
        <p className="x-practice-space__empty">
          No cases authored yet — publish needs at least one visible and one hidden case.
        </p>
      ) : (
        <DataTable
          columns={["Case", "Visibility", "Prepared input", "Expected output", ""]}
          rows={rows}
          label="Test cases"
        />
      )}
    </PracticeSection>
  );
}
