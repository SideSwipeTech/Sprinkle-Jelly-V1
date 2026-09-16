/**
 * PracticeEditorSpace — the shared practice editing space. One studio surface
 * the practice domains mount: challenge studio (challenges/01-pages.md),
 * daily studio ("the shared practice editing space … plus one addition, the
 * scheduling card"), case studio (debug, which slots its own material in via
 * `domainFields`/`domainSections`).
 *
 * Anatomy: head (lifecycle + readiness line + Save/Publish) → guard notices →
 * `children` slot (daily's scheduling card) → metadata & classification →
 * statement → per-language code (starter vs staff-only reference solution) →
 * cases → judging (comparison policy, tolerance, time/memory budget) →
 * editorial → `domainSections` → the checklist.
 *
 * Spec truths encoded:
 *  - The checklist renders the gate's result and NEVER disables Save or
 *    Publish — a draft always saves, incomplete or unclassified.
 *  - The reference solution is administrator-only: its tab is labelled staff
 *    only and never reaches a learner's page.
 *  - Console default is a fixed comparison policy, not an author's choice —
 *    the SQL interface alone gets the ordered/unordered choice.
 *  - A draft with no cases, no rungs or no languages says so (honest
 *    absence); `pending`/`unavailable` are honesty states, never a blank
 *    editor.
 *
 * Sibling imports are composed directly — a deliberate §6 deviation the task
 * brief sanctions: behaviour, not just chrome, is shared. Sections and the
 * vocabulary live in the sibling files for the contract's file bound.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import { StateBlock } from "@components/Card";
import { Button } from "../Button/Button";
import { Field } from "../Field/Field";
import { Select } from "../Select/Select";
import { Notice } from "../Notice/Notice";
import { StatusText } from "../StatusText/StatusText";
import { PracticeSection } from "./PracticeSection";
import { PracticeCodeSection } from "./PracticeCodeSection";
import { PracticeCaseTable } from "./PracticeCaseTable";
import type {
  ComparisonPolicy,
  PracticeChecklistItem,
  PracticeDifficulty,
  PracticeDraft,
  PracticeInterface,
  PracticeLifecycle
} from "./types";
import { PRACTICE_DIFFICULTIES } from "./types";
import "./PracticeEditorSpace.css";

export type {
  ComparisonPolicy,
  PracticeCase,
  PracticeChecklistItem,
  PracticeDifficulty,
  PracticeDraft,
  PracticeInterface,
  PracticeLanguage,
  PracticeLifecycle
} from "./types";
export { COMPARISON_POLICIES, emptyPracticeDraft, PRACTICE_DIFFICULTIES } from "./types";

export interface PracticeEditorSpaceProps {
  /** Accessible + visible name — "Challenge studio", "Case studio". */
  label: string;
  /** Honesty state of the space itself; `data` renders the editor. */
  state?: "data" | "pending" | "unavailable";
  onRetry?: () => void;
  lifecycle?: PracticeLifecycle;
  revision?: number;
  /** Locked surface — no edits, no Save. */
  readOnly?: boolean;
  /** Unsaved-work guard — a background refresh never overwrites it. */
  dirty?: boolean;
  draft: PracticeDraft;
  onDraftChange?: (patch: Partial<PracticeDraft>) => void;
  /** The award difficulty resolves — read-only, never authored. `null` → —. */
  xpAward?: number | null;
  /** Domain wording for the code sides (debug: "Buggy program" / "Reference fix"). */
  starterWord?: string;
  referenceWord?: string;
  checklist?: PracticeChecklistItem[];
  /** The studio readiness line — one authority with the checklist and the gate. */
  readinessLine?: string;
  /** A clash with a concurrent change, raised with a choice. */
  conflict?: { message: string; onReload?: () => void; onKeepMine?: () => void };
  onSave?: () => void;
  onPublish?: () => void;
  publishLabel?: string;
  /** Domain card slot under the head — daily's scheduling card lives here. */
  children?: ReactNode;
  /** Extra fields appended to the metadata grid (debug's duration/allowance…). */
  domainFields?: ReactNode;
  /** Extra sections before the checklist (debug's debrief, the hint ladder). */
  domainSections?: ReactNode;
}

const LIFECYCLE_TONE: Record<PracticeLifecycle, "neutral" | "info" | "success" | "warning"> = {
  draft: "neutral",
  submitted: "info",
  published: "success",
  archived: "warning"
};

export function PracticeEditorSpace({
  label,
  state = "data",
  onRetry,
  lifecycle = "draft",
  revision,
  readOnly = false,
  dirty = false,
  draft,
  onDraftChange,
  xpAward,
  starterWord = "Starter code",
  referenceWord = "Reference solution",
  checklist = [],
  readinessLine,
  conflict,
  onSave,
  onPublish,
  publishLabel = "Publish",
  children,
  domainFields,
  domainSections
}: PracticeEditorSpaceProps) {
  if (state === "pending") {
    return <StateBlock state="pending" message="Loading the shared practice editing space…" />;
  }
  if (state === "unavailable") {
    return (
      <StateBlock
        state="unavailable"
        message={`${label} is unavailable — nothing was loaded.`}
        action={onRetry ? <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button> : undefined}
      />
    );
  }

  const met = checklist.filter((i) => i.met === true).length;
  const unverifiable = checklist.filter((i) => i.met === null).length;
  const readiness =
    readinessLine ??
    (checklist.length === 0
      ? "The gate has not run on this draft."
      : unverifiable > 0
        ? `${unverifiable} gate ${unverifiable === 1 ? "condition" : "conditions"} not yet verifiable`
        : `${met} of ${checklist.length} gate conditions met`);

  const patch = (p: Partial<PracticeDraft>) => onDraftChange?.(p);

  return (
    <div className="x-practice-space" data-readonly={readOnly || undefined} aria-label={label}>
      <header className="x-practice-space__head">
        <div className="x-practice-space__head-text">
          <p className="x-practice-space__kicker">{label} · the shared practice editing space</p>
          <div className="x-practice-space__status-row">
            <StatusText tone={LIFECYCLE_TONE[lifecycle]}>{lifecycle}</StatusText>
            {revision !== undefined ? <span className="x-practice-space__revision">revision {revision}</span> : null}
            <span className="x-practice-space__readiness">{readiness}</span>
          </div>
        </div>
        <div className="x-practice-space__actions">
          {dirty ? (
            <span className="x-practice-space__dirty" role="status">
              <i className="x-practice-space__dirty-dot" aria-hidden="true" />
              Unsaved work
            </span>
          ) : null}
          {readOnly ? (
            <StatusText tone="neutral" icon="lock">Read-only</StatusText>
          ) : (
            <>
              {onSave ? <Button variant="secondary" icon="save" onClick={onSave}>Save draft</Button> : null}
              {onPublish ? <Button icon="check-mark" onClick={onPublish}>{publishLabel}</Button> : null}
            </>
          )}
        </div>
      </header>

      {conflict ? (
        <Notice
          tone="warning"
          title="Concurrent change"
          action={
            <span className="x-practice-space__conflict-actions">
              {conflict.onReload ? <Button variant="secondary" size="sm" onClick={conflict.onReload}>Reload latest</Button> : null}
              {conflict.onKeepMine ? <Button variant="quiet" size="sm" onClick={conflict.onKeepMine}>Keep my edits</Button> : null}
            </span>
          }
        >
          {conflict.message}
        </Notice>
      ) : null}
      {dirty ? (
        <Notice tone="info" title="Unsaved work">
          Leaving this space asks before it goes. A background refresh never overwrites unsaved work.
        </Notice>
      ) : null}

      {children}

      <PracticeSection title="Metadata & classification">
        <div className="x-practice-space__grid">
          <Field label="Title" required disabled={readOnly}>
            <input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Difficulty" hint="One of the platform's four authored values — it resolves the award.">
            <Select
              value={draft.difficulty}
              disabled={readOnly}
              options={PRACTICE_DIFFICULTIES.map((d) => ({ value: d, label: d }))}
              onChange={(v) => patch({ difficulty: v as PracticeDifficulty })}
            />
          </Field>
          <Field label="Topics" hint="Comma-separated — classification and tags.">
            <input value={draft.topics} readOnly={readOnly} onChange={(e) => patch({ topics: e.target.value })} />
          </Field>
          <Field label="Launch interface" hint="A console program or a SQL query — exactly one.">
            <Select
              value={draft.interfaceKind}
              disabled={readOnly}
              options={[
                { value: "console", label: "Console program" },
                { value: "sql", label: "SQL query" }
              ]}
              onChange={(v) => {
                const interfaceKind = v as PracticeInterface;
                patch({
                  interfaceKind,
                  comparisonPolicy: interfaceKind === "console" ? "console-default" : "sql-ordered"
                });
              }}
            />
          </Field>
          <div className="x-practice-space__award">
            <span className="x-practice-space__award-label">Award</span>
            <strong className="numeral x-practice-space__award-value">
              {xpAward === null || xpAward === undefined ? "—" : `${xpAward} XP`}
            </strong>
            <span className="x-practice-space__award-note">resolved from difficulty — never authored</span>
          </div>
          {domainFields}
        </div>
      </PracticeSection>

      <PracticeSection title="Statement">
        <Field label="Description" required disabled={readOnly}>
          <textarea value={draft.statement} onChange={(e) => patch({ statement: e.target.value })} />
        </Field>
        <div className="x-practice-space__grid">
          <Field label="Input description" disabled={readOnly}>
            <textarea value={draft.inputDescription} onChange={(e) => patch({ inputDescription: e.target.value })} />
          </Field>
          <Field label="Output description" disabled={readOnly}>
            <textarea value={draft.outputDescription} onChange={(e) => patch({ outputDescription: e.target.value })} />
          </Field>
        </div>
        <Field label="Constraints" hint="One per line." disabled={readOnly}>
          <textarea value={draft.constraints} onChange={(e) => patch({ constraints: e.target.value })} />
        </Field>
      </PracticeSection>

      <PracticeCodeSection
        draft={draft}
        readOnly={readOnly}
        onDraftChange={onDraftChange}
        starterWord={starterWord}
        referenceWord={referenceWord}
      />

      <PracticeCaseTable draft={draft} readOnly={readOnly} onDraftChange={onDraftChange} />

      <PracticeSection title="Comparison & limits">
        <div className="x-practice-space__grid">
          <Field label="Comparison policy" hint="Stated to the learner before they run or submit.">
            {draft.interfaceKind === "console" ? (
              <p className="x-practice-space__fixed">
                Console default — fixed for a console program, not an author's choice.
              </p>
            ) : (
              <Select
                value={draft.comparisonPolicy}
                disabled={readOnly}
                options={[
                  { value: "sql-ordered", label: "SQL ordered" },
                  { value: "sql-unordered", label: "SQL unordered" }
                ]}
                onChange={(v) => patch({ comparisonPolicy: v as ComparisonPolicy })}
              />
            )}
          </Field>
          <Field label="Authored tolerance" hint="Optional — stated with the policy wherever the policy is stated.">
            <input value={draft.tolerance} readOnly={readOnly} onChange={(e) => patch({ tolerance: e.target.value })} />
          </Field>
          <Field label="Time limit (seconds)" hint="Optional — may only tighten the platform's own bound.">
            <input value={draft.timeLimit} readOnly={readOnly} inputMode="numeric" onChange={(e) => patch({ timeLimit: e.target.value })} />
          </Field>
          <Field label="Memory limit (MiB)" hint="Optional — may only tighten the platform's own bound.">
            <input value={draft.memoryLimit} readOnly={readOnly} inputMode="numeric" onChange={(e) => patch({ memoryLimit: e.target.value })} />
          </Field>
        </div>
      </PracticeSection>

      <PracticeSection title="Editorial">
        <Field label="Worked solution" hint="Learner-facing — opens to the learner once solved." disabled={readOnly}>
          <textarea value={draft.editorial} onChange={(e) => patch({ editorial: e.target.value })} />
        </Field>
      </PracticeSection>

      {domainSections}

      <PracticeSection title="Publish checklist" aside={<span className="x-practice-space__section-note">{readiness}</span>}>
        {checklist.length === 0 ? (
          <p className="x-practice-space__empty">The gate has not run on this draft.</p>
        ) : (
          <ul className="x-practice-space__checklist">
            {checklist.map((item) => (
              <li
                key={item.key}
                className="x-practice-space__check"
                data-met={item.met === true ? "met" : item.met === null ? "unverifiable" : "unmet"}
              >
                <Icon
                  name={item.met === true ? "check-mark" : item.met === null ? "loader" : "x"}
                  size={13}
                  motion={item.met === null ? "flow" : "none"}
                />
                <span>{item.label}</span>
                {item.met === null ? <em className="x-practice-space__check-tag">not yet verifiable</em> : null}
              </li>
            ))}
          </ul>
        )}
        <p className="x-practice-space__check-note">
          The checklist renders the gate's result — it never disables Save or Publish.
        </p>
      </PracticeSection>
    </div>
  );
}
