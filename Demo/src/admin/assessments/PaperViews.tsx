/**
 * PaperViews — the selected-paper workspace's Overview and Questions views.
 *
 * Overview carries the paper's facts and status: the immutable type, the
 * lifecycle, the owning company a Company paper never leaves, and the whole
 * editable field set while the paper is a draft — read back as facts once the
 * paper freezes.
 *
 * Questions is the section/question outline: sections are added, briefed and
 * removed and questions are authored one section at a time while the paper is
 * a draft; once the paper freezes the same view renders the published record
 * read-only — a content write is refused naming the correction path.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import {
  commitNewSection,
  editableSetFor,
  getCompany,
  removeQuestion,
  removeSection,
  type StudioPaper,
  type StudioQuestion,
  type StudioSection
} from "./fixtures";
import { LoadedLine } from "./shared";
import { PublishedContent } from "./PublishedView";

const EXAM_FLAG_LABEL = {
  timer: "Timer",
  palette: "Question palette",
  review: "Review flag",
  skip: "Skip",
  revisit: "Revisit",
  sectionSwitching: "Section switching"
} as const;

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────────── */

export function PaperOverview({
  draft,
  onSet,
  onSave,
  savedNote
}: {
  draft: StudioPaper;
  onSet: (patch: Partial<StudioPaper>) => void;
  onSave: () => void;
  savedNote: string;
}) {
  const editable = draft.lifecycle === "draft";
  const company = draft.companyId ? getCompany(draft.companyId) : undefined;
  const set = onSet;

  return (
    <>
      <Card>
        <CardHeader title="Status" icon="clipboard" eyebrow="the paper's facts" />
        <dl className="account-facts">
          <Fact label="Type" value={`${draft.type === "mock" ? "Mock" : "Company"} — selected at creation, immutable`} />
          <Fact label="Lifecycle" value={draft.lifecycle} />
          {draft.type === "company" ? (
            <Fact
              label="Owning company"
              value={company ? `${company.name} — owned since creation, never re-owned` : "—"}
            />
          ) : null}
          <Fact label="Updated" value={draft.updatedAt} />
          <Fact label="Tests on record" value={draft.testCount === 0 ? "none" : String(draft.testCount)} />
        </dl>
        {company ? (
          <p className="meta">
            Opened from its company's papers list —{" "}
            <Link to={`/admin/mocks/companies/${company.id}`}>{company.name}</Link>.
          </p>
        ) : null}
      </Card>

      <Card>
        <CardHeader title="Details" icon="clipboard" eyebrow="shared path" />
        {editable ? (
          <div className="sink__grid">
            <label className="field"><span className="meta">Title</span>
              <input value={draft.title} onChange={(e) => set({ title: e.target.value })} /></label>
            <label className="field"><span className="meta">Description{draft.type === "mock" ? " — doubles as the learner-facing instructions" : ""}</span>
              <textarea value={draft.description} onChange={(e) => set({ description: e.target.value })} /></label>
            <label className="field"><span className="meta">Time limit (minutes)</span>
              <input inputMode="numeric" value={draft.durationMinutes} onChange={(e) => set({ durationMinutes: Number(e.target.value) })} /></label>
            <label className="field"><span className="meta">Submission grace (seconds)</span>
              <input inputMode="numeric" value={draft.graceSeconds} onChange={(e) => set({ graceSeconds: Number(e.target.value) })} /></label>
            <label className="field"><span className="meta">Availability opens</span>
              <input type="date" value={draft.availabilityStart} onChange={(e) => set({ availabilityStart: e.target.value })} /></label>
            <label className="field"><span className="meta">Availability closes</span>
              <input type="date" value={draft.availabilityEnd} onChange={(e) => set({ availabilityEnd: e.target.value })} /></label>
            <label className="row"><input type="checkbox" checked={draft.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured marking — pins the paper first in its catalogue section</label>
          </div>
        ) : (
          <dl className="account-facts">
            <Fact label="Description" value={draft.description} />
            <Fact label="Time limit" value={`${draft.durationMinutes} minutes`} />
            <Fact label="Submission grace" value={`${draft.graceSeconds} seconds`} />
            <Fact label="Availability window" value={draft.availabilityStart || draft.availabilityEnd ? `${draft.availabilityStart || "open"} → ${draft.availabilityEnd || "open"}` : "always open"} />
            <Fact label="Featured marking" value={draft.featured ? "pinned first" : "off"} />
          </dl>
        )}
      </Card>

      <Card>
        <CardHeader title="Integrity and marking" icon="shield" eyebrow="shared path" />
        {editable ? (
          <div className="sink__grid">
            <label className="field"><span className="meta">Strictness — the response to Recorded Events</span>
              <select value={draft.strictness} onChange={(e) => set({ strictness: e.target.value as StudioPaper["strictness"] })}>
                <option value="off">off</option><option value="standard">Standard</option><option value="strict">Strict</option>
              </select></label>
            <label className="field"><span className="meta">Counted-event ceiling</span>
              <input inputMode="numeric" value={draft.countedEventCeiling} onChange={(e) => set({ countedEventCeiling: Number(e.target.value) })} /></label>
            <label className="row"><input type="checkbox" checked={draft.fullscreenRequired} onChange={(e) => set({ fullscreenRequired: e.target.checked })} /> Fullscreen required — leaving it counts</label>
            <label className="row"><input type="checkbox" checked={draft.clipboardCounted} onChange={(e) => set({ clipboardCounted: e.target.checked })} /> Clipboard and context-menu actions counted</label>
            <label className="row"><input type="checkbox" checked={draft.restrictedNavigationCounted} onChange={(e) => set({ restrictedNavigationCounted: e.target.checked })} /> Restricted navigation and shortcuts counted</label>
            <label className="field"><span className="meta">Numerical tolerance</span>
              <select value={draft.numericalTolerance.mode}
                onChange={(e) => set({ numericalTolerance: { ...draft.numericalTolerance, mode: e.target.value as "exact" | "absolute" | "relative" } })}>
                <option value="exact">exact</option><option value="absolute">absolute</option><option value="relative">relative (0–10%)</option>
              </select></label>
          </div>
        ) : (
          <dl className="account-facts">
            <Fact label="Strictness" value={draft.strictness} />
            <Fact label="Counted-event ceiling" value={String(draft.countedEventCeiling)} />
            <Fact label="Fullscreen required" value={draft.fullscreenRequired ? "yes" : "no"} />
            <Fact label="Clipboard counted" value={draft.clipboardCounted ? "yes" : "no"} />
            <Fact label="Restricted navigation counted" value={draft.restrictedNavigationCounted ? "yes" : "no"} />
            <Fact label="Numerical tolerance" value={draft.numericalTolerance.mode === "exact" ? "exact" : `${draft.numericalTolerance.mode} ${draft.numericalTolerance.value}`} />
          </dl>
        )}
        <p className="meta">Every test is sealed and proctored — neither is authorable. Strictness governs the response to Recorded Events alone.</p>
      </Card>

      {draft.type === "mock" ? (
        <Card>
          <CardHeader title="Mock fields" icon="browse-tests" eyebrow="the selected type's fields only" />
          {editable ? (
            <div className="sink__grid">
              <label className="field"><span className="meta">Category</span>
                <input value={draft.category} onChange={(e) => set({ category: e.target.value })} /></label>
              <label className="field"><span className="meta">Difficulty</span>
                <select value={draft.difficulty} onChange={(e) => set({ difficulty: e.target.value as StudioPaper["difficulty"] })}>
                  <option value="">—</option>
                  {(["easy", "medium", "hard", "extreme"] as const).map((d) => <option key={d} value={d}>{d}</option>)}
                </select></label>
              <label className="field"><span className="meta">Passing percentage (1–100)</span>
                <input inputMode="numeric" value={draft.passingPercent ?? ""} onChange={(e) => set({ passingPercent: e.target.value === "" ? null : Number(e.target.value) })} /></label>
              {Object.entries(EXAM_FLAG_LABEL).map(([key, label]) => (
                <label className="row" key={key}>
                  <input type="checkbox"
                    checked={draft.examFlags[key as keyof typeof EXAM_FLAG_LABEL]}
                    onChange={(e) => set({ examFlags: { ...draft.examFlags, [key]: e.target.checked } })} />
                  {label}
                </label>
              ))}
              <label className="row"><input type="checkbox" checked={draft.shuffleQuestions} onChange={(e) => set({ shuffleQuestions: e.target.checked })} /> Shuffle question order</label>
              <label className="row"><input type="checkbox" checked={draft.shuffleOptions} onChange={(e) => set({ shuffleOptions: e.target.checked })} /> Shuffle option order</label>
            </div>
          ) : (
            <dl className="account-facts">
              <Fact label="Category" value={draft.category} />
              <Fact label="Difficulty" value={draft.difficulty} />
              <Fact label="Passing percentage" value={draft.passingPercent === null ? "—" : `${draft.passingPercent}%`} />
              <Fact label="Exam-XP flags" value={Object.entries(EXAM_FLAG_LABEL).filter(([k]) => draft.examFlags[k as keyof typeof EXAM_FLAG_LABEL]).map(([, l]) => l).join(" · ") || "none on"} />
              <Fact label="Randomization" value={[draft.shuffleQuestions ? "question order" : "", draft.shuffleOptions ? "option order" : ""].filter(Boolean).join(" · ") || "none"} />
            </dl>
          )}
        </Card>
      ) : (
        <Card>
          <CardHeader title="Company fields" icon="companies" eyebrow="the selected type's fields only" />
          {editable ? (
            <div className="sink__grid">
              <p className="meta">
                The owning company was selected at creation and is never re-owned —{" "}
                {company ? (
                  <Link to={`/admin/mocks/companies/${company.id}`}>{company.name}</Link>
                ) : (
                  "—"
                )}
                . Role, year and provenance are the paper's own fields until the freeze fixes them absolutely.
              </p>
              <label className="field"><span className="meta">Role — must belong to {company?.name ?? "the owning company"}</span>
                <select value={draft.roleId ?? ""} onChange={(e) => set({ roleId: e.target.value || null })}>
                  <option value="">—</option>
                  {(company?.roles ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select></label>
              <label className="field"><span className="meta">Year</span>
                <input inputMode="numeric" value={draft.year} onChange={(e) => set({ year: e.target.value })} /></label>
              <label className="field"><span className="meta">Provenance</span>
                <select value={draft.provenance} onChange={(e) => set({ provenance: e.target.value as StudioPaper["provenance"] })}>
                  <option value="pattern">Pattern — built to the employer's shape</option>
                  <option value="actual">Actual — the employer's released questions</option>
                </select></label>
              {draft.provenance === "actual" ? (
                <>
                  <label className="field"><span className="meta">Dated source — gated at publish</span>
                    <input value={draft.provenanceSource} onChange={(e) => set({ provenanceSource: e.target.value })} /></label>
                  <label className="row"><input type="checkbox" checked={draft.provenanceRight} onChange={(e) => set({ provenanceRight: e.target.checked })} /> A documented right to reproduce is recorded</label>
                </>
              ) : null}
              <label className="field"><span className="meta">Briefing instructions — separate from the description</span>
                <textarea value={draft.briefingInstructions} onChange={(e) => set({ briefingInstructions: e.target.value })} /></label>
              <p className="meta">Movement on a Company paper is sectional locking — a completed section locks, the cursor moves forward and adjacent only.</p>
            </div>
          ) : (
            <dl className="account-facts">
              <Fact label="Owning company" value={company?.name ?? "—"} />
              <Fact label="Role" value={company?.roles.find((r) => r.id === draft.roleId)?.name ?? "—"} />
              <Fact label="Year" value={draft.year} />
              <Fact label="Provenance" value={draft.provenance === "actual" ? "Actual — released questions" : "Pattern — built to the shape"} />
              <Fact label="Briefing instructions" value={draft.briefingInstructions} />
            </dl>
          )}
        </Card>
      )}

      <Card>
        <CardHeader title={editable ? "Commit" : "The paper's life"} icon="check" />
        <div className="row">
          {editable ? (
            <>
              <button className="btn btn--primary" type="button" onClick={onSave}>Save draft</button>
              <Link className="btn btn--secondary" to={`/admin/mocks/${draft.id}/import`}>Bulk question import</Link>
            </>
          ) : null}
          <Link className="btn btn--quiet" to={`/admin/mocks/${draft.id}/published`}>The read-only record</Link>
          <Link className="btn btn--quiet" to={`/admin/mocks/${draft.id}/${draft.type === "mock" ? "analytics" : "company-analytics"}`}>Analytics</Link>
        </div>
        {savedNote ? <p className="page__lead" role="status">{savedNote}</p> : null}
        {!editable ? (
          <p className="meta">
            The paper froze at publish — content is read-only and the only correction is a duplicate:
            archive, fix the copy, publish it as a new paper. Settings stay editable — the enumerated
            set for this type lives on Settings: {editableSetFor(draft.type).join(" · ")}.
          </p>
        ) : null}
      </Card>
    </>
  );
}

/* ── Questions ────────────────────────────────────────────────────────────── */

export function PaperQuestions({
  draft,
  onSet,
  onStructure
}: {
  draft: StudioPaper;
  /** Section field edits — unsaved until Save commits the draft. */
  onSet: (patch: Partial<StudioPaper>) => void;
  /** The committed structure acts — the record already moved, so the local
   *  mirror raises no unsaved-changes flag. */
  onStructure: (patch: Partial<StudioPaper>) => void;
}) {
  const [removingSection, setRemovingSection] = useState<StudioSection | null>(null);
  const [removingQuestion, setRemovingQuestion] = useState<StudioQuestion | null>(null);
  const editable = draft.lifecycle === "draft";

  const patchSection = (id: string, patch: Partial<StudioSection>) =>
    onSet({ sections: draft.sections.map((x) => (x.id === id ? { ...x, ...patch } : x)) });

  /* The structure acts — draft only. Create and remove commit through the
     fixture mutators so the index, this page and the authoring surface agree
     for the session; the local draft mirrors each result. */
  function addSection() {
    const s = commitNewSection(draft.id, "");
    if (s) onStructure({ sections: [...draft.sections, s] });
  }

  function confirmRemoveSection() {
    if (!removingSection) return;
    removeSection(draft.id, removingSection.id);
    onStructure({
      sections: draft.sections.filter((x) => x.id !== removingSection.id),
      questions: draft.questions.filter((q) => q.sectionId !== removingSection.id)
    });
    setRemovingSection(null);
  }

  function confirmRemoveQuestion() {
    if (!removingQuestion) return;
    removeQuestion(draft.id, removingQuestion.id);
    onStructure({ questions: draft.questions.filter((q) => q.id !== removingQuestion.id) });
    setRemovingQuestion(null);
  }

  /* Frozen — the published record renders read-only with the correction path
     stated; the authoring surface is absent, never disabled. */
  if (!editable) {
    return (
      <>
        <StateBlock
          state="data"
          compact
          message={`${draft.lifecycle === "archived" ? "Archived — the step is terminal; " : "Published — "}the paper froze at publish. Content below is read-only; a write to it is refused as a content write. The correction path is a duplicate — archive, fix the copy, publish it as a new paper — and the permissible settings live on Settings.`}
        />
        <PublishedContent paper={draft} lifecycle={draft.lifecycle} />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Structure"
          icon="list"
          eyebrow="sections and questions, authored while the paper is a draft"
          action={
            <Button variant="secondary" size="sm" icon="plus" onClick={addSection}>Add section</Button>
          }
        />
        <LoadedLine loaded={draft.questions.length} total={draft.questions.length} />
        {draft.sections.length === 0 ? (
          <StateBlock
            state="empty"
            compact
            message="No sections yet — a draft carries at least one before publish."
            action={
              <Button size="sm" icon="plus" onClick={addSection}>Add the first section</Button>
            }
          />
        ) : (
          <div className="list">
            {draft.sections.map((s) => {
              const held = draft.questions.filter((q) => q.sectionId === s.id);
              return (
                <div key={s.id} className="list-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <label className="field">
                    <span className="meta">Section name</span>
                    <input value={s.name} onChange={(e) => patchSection(s.id, { name: e.target.value })} />
                  </label>
                  <div className="sink__grid">
                    <label className="field"><span className="meta">Subject</span>
                      <input value={s.subject} onChange={(e) => patchSection(s.id, { subject: e.target.value })} /></label>
                    <label className="field"><span className="meta">Briefing — shown before the section</span>
                      <input value={s.briefing} onChange={(e) => patchSection(s.id, { briefing: e.target.value })} /></label>
                    <label className="field"><span className="meta">Coding-run allowance — empty is unlimited</span>
                      <input inputMode="numeric" value={s.codingAllowance ?? ""}
                        onChange={(e) => patchSection(s.id, { codingAllowance: e.target.value === "" ? null : Number(e.target.value) })} /></label>
                    <label className="field"><span className="meta">Suggested minutes — pacing, never a limit</span>
                      <input inputMode="numeric" value={s.suggestedMinutes ?? ""}
                        onChange={(e) => patchSection(s.id, { suggestedMinutes: e.target.value === "" ? null : Number(e.target.value) })} /></label>
                  </div>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <label className="row"><input type="checkbox" checked={s.include}
                      onChange={(e) => patchSection(s.id, { include: e.target.checked })} />
                      carried at publish</label>
                    <span className="row">
                      <Button variant="secondary" size="sm" icon="plus"
                        to={`/admin/mocks/${draft.id}/sections/${s.id}/questions/new?section=${encodeURIComponent(s.name)}`}>
                        Add question
                      </Button>
                      <Button variant="quiet" size="sm" onClick={() => setRemovingSection(s)}>
                        Remove section…
                      </Button>
                    </span>
                  </div>
                  {held.map((q) => (
                    <div key={q.id} className="list-row">
                      <div className="a-cell">
                        <Link className="a-titlelink" to={`/admin/mocks/${draft.id}/sections/${s.id}/questions/${q.id}`}>
                          <strong>{q.prompt || "(empty prompt)"}</strong>
                        </Link>
                        <p className="a-cell__meta">{q.kind} · {q.marks || "—"} marks{q.negativeMarks ? ` · −${q.negativeMarks}` : ""}</p>
                      </div>
                      <div className="a-row-actions">
                        <Button variant="quiet" size="sm"
                          to={`/admin/mocks/${draft.id}/sections/${s.id}/questions/${q.id}`}>
                          Edit
                        </Button>
                        <Button variant="quiet" size="sm" onClick={() => setRemovingQuestion(q)}>
                          Remove…
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Ordinary confirms — removal is a draft-time act; a frozen paper
          never shows these controls. */}
      <Dialog
        open={removingSection !== null}
        title={removingSection ? `Remove section ${removingSection.name}?` : "Remove section?"}
        icon="alert"
        tone="destructive"
        onClose={() => setRemovingSection(null)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setRemovingSection(null)}>Keep it</Button>
            <Button variant="destructive" onClick={confirmRemoveSection}>Remove the section</Button>
          </>
        }
      >
        {removingSection ? (
          <p>
            Remove <strong>{removingSection.name}</strong> from the draft — it holds{" "}
            {draft.questions.filter((q) => q.sectionId === removingSection.id).length} question
            {draft.questions.filter((q) => q.sectionId === removingSection.id).length === 1 ? "" : "s"},
            which go with it. The removal commits on the draft with its trail row.
          </p>
        ) : null}
      </Dialog>

      <Dialog
        open={removingQuestion !== null}
        title="Remove this question?"
        icon="alert"
        tone="destructive"
        onClose={() => setRemovingQuestion(null)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setRemovingQuestion(null)}>Keep it</Button>
            <Button variant="destructive" onClick={confirmRemoveQuestion}>Remove the question</Button>
          </>
        }
      >
        {removingQuestion ? (
          <p>
            Remove “{removingQuestion.prompt || "(empty prompt)"}” from the draft. The removal
            commits on the draft with its trail row.
          </p>
        ) : null}
      </Dialog>
    </>
  );
}
