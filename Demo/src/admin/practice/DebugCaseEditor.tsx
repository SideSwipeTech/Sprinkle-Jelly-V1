/**
 * DebugCaseEditor — `/admin/debug/:id`. The case studio: the shared practice
 * editing space (re-worded "Buggy program" / "Reference fix" — the two-sided
 * validation the publish gate reads) plus this domain's own material:
 * bug types and count, primary skill, the internal bug note, the timed
 * duration and allowance, the debrief per offered language, and the optional
 * hint ladder.
 *
 * `:id = "new"` is the create flow; an unknown id is an honest unavailable.
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { setDebugLifecycle } from "@state/store";
import { PracticeEditorSpace } from "../../extraction/components/PracticeEditorSpace/PracticeEditorSpace";
import { PracticeSection } from "../../extraction/components/PracticeEditorSpace/PracticeSection";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { HintLadder } from "../../extraction/components/HintLadder/HintLadder";
import { Button } from "../../extraction/components/Button/Button";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { EMPTY_DEBRIEF, resolveDebugCase, XP_BY_DIFFICULTY, type DebugDebrief } from "./fixtures";
import { DEBUG_FIXTURE_ROWS } from "./debug/fixtures";

export function DebugCaseEditor() {
  const { id = "" } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const fixture = resolveDebugCase(id, store, DEBUG_FIXTURE_ROWS);
  const [draft, setDraft] = useState(fixture?.draft);
  const [bugCount, setBugCount] = useState(fixture?.bugCount ?? "");
  const [bugTypes, setBugTypes] = useState(fixture?.bugTypes ?? "");
  const [primarySkill, setPrimarySkill] = useState(fixture?.primarySkill ?? "");
  const [internalNote, setInternalNote] = useState(fixture?.internalNote ?? "");
  const [mode, setMode] = useState(fixture?.mode ?? "practice");
  const [timedMinutes, setTimedMinutes] = useState(fixture?.timedMinutes ?? "");
  const [timedAllowance, setTimedAllowance] = useState(fixture?.timedAllowance ?? "");
  const [debriefs, setDebriefs] = useState(fixture?.debriefs ?? {});
  const [debriefLang, setDebriefLang] = useState(fixture?.draft.languages[0]?.key ?? "");
  const [rungs, setRungs] = useState(fixture?.rungs ?? []);
  const [dirty, setDirty] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  if (!fixture || !draft) {
    return (
      <AdminPage kicker="Content · Case studio" title="Case unavailable">
        <StateBlock
          state="unavailable"
          message="This case could not be read — nothing was loaded."
          action={
            <Button variant="secondary" onClick={() => navigate("/admin/debug")}>
              Back to the debug studio
            </Button>
          }
        />
      </AdminPage>
    );
  }

  const isNew = id === "new";
  const readOnly = fixture.lifecycle === "archived";
  const touch = () => setDirty(true);
  const leave = () => (dirty ? setLeaveOpen(true) : navigate("/admin/debug"));

  const debrief: DebugDebrief = debriefs[debriefLang] ?? EMPTY_DEBRIEF;
  const patchDebrief = (p: Partial<DebugDebrief>) => {
    setDebriefs((d) => ({ ...d, [debriefLang]: { ...(d[debriefLang] ?? EMPTY_DEBRIEF), ...p } }));
    touch();
  };

  return (
    <AdminPage
      kicker="Content · Case studio"
      title={isNew ? "New case" : draft.title || fixture.id}
      lead="The shared practice editing space — the buggy program set against the staff-only reference fix, plus duration, allowance, debrief and the optional hint ladder."
      actions={
        <Button variant="quiet" icon="arrow-left" onClick={leave}>
          Debug studio
        </Button>
      }
    >
      <PracticeEditorSpace
        label="Case studio"
        lifecycle={fixture.lifecycle === "published" ? "published" : "draft"}
        readOnly={readOnly}
        dirty={dirty}
        draft={draft}
        onDraftChange={(p) => {
          setDraft((d) => ({ ...d!, ...p }));
          touch();
        }}
        xpAward={draft.title ? XP_BY_DIFFICULTY[draft.difficulty] : null}
        starterWord="Buggy program"
        referenceWord="Reference fix"
        checklist={fixture.checklist}
        onSave={readOnly ? undefined : () => setDirty(false)}
        onPublish={
          readOnly || fixture.lifecycle === "published"
            ? undefined
            : () => {
                if (!isNew) setDebugLifecycle(id, "published");
                setDirty(false);
              }
        }
        domainFields={
          <>
            <Field label="Planted-bug count" hint="Authored — the count the board cards carry.">
              <input value={bugCount} inputMode="numeric" readOnly={readOnly} onChange={(e) => { setBugCount(e.target.value); touch(); }} />
            </Field>
            <Field label="Bug types" hint="Comma-separated — each from the curated vocabulary, never free-typed.">
              <input value={bugTypes} readOnly={readOnly} onChange={(e) => { setBugTypes(e.target.value); touch(); }} />
            </Field>
            <Field label="Primary skill" hint="So every fix is classifiable and priceable.">
              <input value={primarySkill} readOnly={readOnly} onChange={(e) => { setPrimarySkill(e.target.value); touch(); }} />
            </Field>
            <Field label="Mode" hint="Practice or timed — a timed case requires duration and allowance.">
              <Select
                value={mode}
                disabled={readOnly}
                options={[
                  { value: "practice", label: "Practice" },
                  { value: "timed", label: "Timed" }
                ]}
                onChange={(v) => {
                  setMode(v as "practice" | "timed");
                  touch();
                }}
              />
            </Field>
            {mode === "timed" ? (
              <>
                <Field label="Timed duration (minutes)" hint="Required on a timed case — the platform's timed range applies.">
                  <input value={timedMinutes} inputMode="numeric" readOnly={readOnly} onChange={(e) => { setTimedMinutes(e.target.value); touch(); }} />
                </Field>
                <Field label="Timed allowance" hint="Windows a learner may hold — the platform's allowance range applies.">
                  <input value={timedAllowance} inputMode="numeric" readOnly={readOnly} onChange={(e) => { setTimedAllowance(e.target.value); touch(); }} />
                </Field>
              </>
            ) : null}
          </>
        }
        domainSections={
          <>
            <PracticeSection title="Debrief" aside={<span className="x-practice-space__section-note">one per offered language — all required to publish</span>}>
              {draft.languages.length > 1 ? (
                <Select
                  size="sm"
                  aria-label="Debrief language"
                  value={debriefLang}
                  options={draft.languages.map((l) => ({ value: l.key, label: l.label }))}
                  onChange={setDebriefLang}
                />
              ) : null}
              <div className="x-practice-space__grid">
                <Field label="Root cause" disabled={readOnly}>
                  <textarea value={debrief.rootCause} onChange={(e) => patchDebrief({ rootCause: e.target.value })} />
                </Field>
                <Field label="Why the broken code fails" disabled={readOnly}>
                  <textarea value={debrief.whyFails} onChange={(e) => patchDebrief({ whyFails: e.target.value })} />
                </Field>
                <Field label="Repair strategy" disabled={readOnly}>
                  <textarea value={debrief.repair} onChange={(e) => patchDebrief({ repair: e.target.value })} />
                </Field>
                <Field label="Important edge case" disabled={readOnly}>
                  <textarea value={debrief.edgeCase} onChange={(e) => patchDebrief({ edgeCase: e.target.value })} />
                </Field>
              </div>
              <Field label="Corrected code" disabled={readOnly}>
                <textarea value={debrief.corrected} onChange={(e) => patchDebrief({ corrected: e.target.value })} />
              </Field>
              <Field label="Complexity or safety note" hint="Optional." disabled={readOnly}>
                <input value={debrief.note} onChange={(e) => patchDebrief({ note: e.target.value })} />
              </Field>
            </PracticeSection>

            <PracticeSection title="Internal bug note" aside={<span className="x-practice-space__section-note">staff only — never promoted into a debrief</span>}>
              <Field label="Bug note" disabled={readOnly}>
                <textarea value={internalNote} onChange={(e) => { setInternalNote(e.target.value); touch(); }} />
              </Field>
            </PracticeSection>

            <PracticeSection title="Hint ladder" aside={<span className="x-practice-space__section-note">optional — not among the publish requirements</span>}>
              {rungs.length === 0 ? (
                <p className="x-practice-space__empty">No hint rungs authored — a valid publishable state.</p>
              ) : (
                <HintLadder rungs={rungs} revealed={rungs.length} onReveal={() => {}} label="Hint ladder preview" />
              )}
              {!readOnly ? (
                <>
                  {rungs.map((rung, i) => (
                    <Field key={i} label={`Rung ${i + 1}`} disabled={readOnly}>
                      <input
                        value={rung.content}
                        onChange={(e) => {
                          setRungs((rs) => rs.map((r, j) => (j === i ? { ...r, content: e.target.value } : r)));
                          touch();
                        }}
                      />
                    </Field>
                  ))}
                  <Button
                    variant="quiet"
                    size="sm"
                    icon="plus"
                    onClick={() => {
                      setRungs((rs) => [...rs, { title: `Rung ${rs.length + 1}`, content: "" }]);
                      touch();
                    }}
                  >
                    Add rung
                  </Button>
                </>
              ) : null}
            </PracticeSection>
          </>
        }
      />

      <Dialog
        open={leaveOpen}
        title="Leave with unsaved work?"
        icon="alert"
        onClose={() => setLeaveOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setLeaveOpen(false)}>Stay</Button>
            <Button variant="destructive" onClick={() => navigate("/admin/debug")}>Leave without saving</Button>
          </>
        }
      >
        <p>Unsaved edits to this draft are lost if you leave. Save first, or leave anyway.</p>
      </Dialog>
    </AdminPage>
  );
}
