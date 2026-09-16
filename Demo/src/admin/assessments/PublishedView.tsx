/**
 * PublishedView — the published paper's read-only view (assessments.F18).
 * Every section, question, option, key, marks value and explanation, read only.
 * Duplicate yields an independent draft with the same permanent type and no
 * tests; archive is the one retirement step — it stops every start path at
 * once, leaves every result readable and is terminal. Its confirmation names
 * the object and how many tests exist.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { QUESTION_KIND_LABEL, type AnswerKey } from "../../extraction/components/QuestionEditor/QuestionEditor";
import { ACTION, getPaper, type StudioPaper, type StudioQuestion } from "./fixtures";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  ConflictDialog,
  ContentGuardNote,
  ContentWriteRefusal,
  LoadedLine,
  NotVerifiableNote,
  OutOfDateNote,
  PreviewBar,
  StudioLoading,
  usePreview
} from "./shared";

/** The staff-only key rendered as fact rows — matched to the kind. */
function KeyFacts({ question, options }: { question: StudioQuestion; options: { id: string; text: string }[] }) {
  const key: AnswerKey | null = question.key;
  if (!key) return <p className="meta">No key recorded.</p>;
  if (key.kind === "single-choice") {
    return <p className="meta">Key: {options.find((o) => o.id === key.optionId)?.text ?? "—"} (exactly one correct)</p>;
  }
  if (key.kind === "multiple-choice") {
    return <p className="meta">Key set: {key.optionIds.map((id) => options.find((o) => o.id === id)?.text ?? id).join(" · ")}</p>;
  }
  if (key.kind === "numerical") {
    return (
      <p className="meta">
        Key: {key.value} · tolerance{" "}
        {key.toleranceMode === "exact" ? "exact" : `${key.toleranceMode} ${key.tolerance}`}
      </p>
    );
  }
  if (key.kind === "true-false") return <p className="meta">Key: {key.value === true ? "True" : key.value === false ? "False" : "—"}</p>;
  return null;
}

/** The frozen record itself — every section, question, option, key, marks
 *  value and explanation, read only. The standalone route and the workspace's
 *  Questions tab on a frozen paper both render it. */
export function PublishedContent({ paper, lifecycle }: { paper: StudioPaper; lifecycle?: string }) {
  return (
    <Card>
      <CardHeader title={paper.title} icon="clipboard" eyebrow={`${paper.type === "mock" ? "Mock" : "Company"} · ${lifecycle ?? paper.lifecycle} — the paper freezes permanently`} />
      <LoadedLine loaded={paper.questions.length} total={paper.questions.length} />
      {paper.sections.map((s) => (
        <div key={s.id} className="list-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <strong>Section {s.name}</strong>
          <p className="meta">
            {s.subject} · briefing: {s.briefing || "—"} · {s.codingAllowance === null ? "unlimited coding runs" : `coding-run allowance ${s.codingAllowance}`}
            {s.suggestedMinutes === null ? "" : ` · suggested ${s.suggestedMinutes} min`}
          </p>
          {paper.questions.filter((q) => q.sectionId === s.id).map((q) => (
            <div key={q.id} className="list-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{q.order}. {q.prompt || "(empty prompt)"}</strong>
                <span className="chip chip--quiet">{QUESTION_KIND_LABEL[q.kind]}</span>
              </div>
              <p className="meta">
                {q.marks} marks{q.negativeMarks ? ` · −${q.negativeMarks} on a wrong answer` : " · no penalty"}
                {q.difficulty ? ` · ${q.difficulty}` : ""}
                {q.targetSeconds ? ` · target ${q.targetSeconds}s` : ""}
                {" · "}{q.skill || "—"} / {q.topic || "—"}
              </p>
              {q.options.length > 0 ? (
                <ul className="meta" style={{ margin: 0, paddingLeft: "var(--space-5)" }}>
                  {q.options.map((o) => <li key={o.id}>{o.text || "(empty)"}</li>)}
                </ul>
              ) : null}
              {q.kind === "coding" ? (
                <p className="meta">
                  Language {q.language || "—"} · {q.cases.length} case{q.cases.length === 1 ? "" : "s"} (
                  {q.cases.filter((c) => c.visible).length} visible, {q.cases.filter((c) => !c.visible).length} hidden)
                </p>
              ) : (
                <KeyFacts question={q} options={q.options} />
              )}
              {q.explanation ? <p className="meta">Explanation: {q.explanation}</p> : null}
            </div>
          ))}
        </div>
      ))}
      {paper.sections.length === 0 ? <StateBlock state="empty" compact message="This paper carries no sections." /> : null}
    </Card>
  );
}

export function PublishedView() {
  const { paperId } = useParams();
  const paper = getPaper(paperId);
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  const [archiving, setArchiving] = useState(false);
  const [archived, setArchived] = useState(false);
  const [duplicated, setDuplicated] = useState(false);

  if (!paper) {
    return (
      <AdminPage kicker="Assessments · Read-only view" title="Published paper" lead="Read only.">
        <StateBlock state="unavailable" message="No paper at this address."
          action={<Link className="btn btn--secondary" to="/admin/mocks">Assessment studio</Link>} />
      </AdminPage>
    );
  }

  const lifecycle = archived ? "archived" : paper.lifecycle;

  return (
    <AdminPage
      kicker={`Assessments · ${paper.title}`}
      title="The published paper, read only"
      lead="Every section, question, option, key, marks value and explanation. Nothing here writes to content."
      actions={
        <div className="row">
          <span className="chip">{lifecycle}</span>
          <Link className="btn btn--quiet" to={`/admin/mocks/${paper.id}?tab=questions`}>Back to the paper</Link>
        </div>
      }
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editPaper} /> : null}
      {preview === "content-write" ? <ContentWriteRefusal type={paper.type} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The published record" /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={paper.title} /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />

      {preview !== "loading" && preview !== "refused" && preview !== "conflict" ? (
        <>
          <PublishedContent paper={paper} lifecycle={lifecycle} />

          <Card>
            <CardHeader title="Correction and retirement" icon="copy" />
            <div className="row">
              <button className="btn btn--secondary" type="button"
                onClick={() => setDuplicated(true)}>
                Duplicate as draft
              </button>
              {lifecycle !== "archived" ? (
                <button className="btn btn--quiet" type="button" onClick={() => setArchiving(true)}>
                  Archive…
                </button>
              ) : null}
              <Link className="btn btn--quiet" to={`/admin/mocks/${paper.id}/settings`}>Settings after publication</Link>
            </div>
            {duplicated ? (
              <p className="page__lead" role="status">
                Duplicated — an independent draft with its own identity, the same permanent type and no
                tests. The two papers never merge or show as one.
              </p>
            ) : null}
            {archived ? (
              <StateBlock state="data" compact
                message="Archived — every start path stopped at once, every result stays readable, and the step is terminal. There is no path back to draft." />
            ) : null}
          </Card>

          <Dialog
            open={archiving}
            title={`Archive ${paper.title}?`}
            icon="alert"
            tone="destructive"
            onClose={() => setArchiving(false)}
            actions={
              <>
                <Button variant="destructive" onClick={() => { setArchiving(false); setArchived(true); }}>
                  Archive permanently
                </Button>
                <Button variant="secondary" onClick={() => setArchiving(false)}>Keep published</Button>
              </>
            }
          >
            <p>
              Archive <strong>{paper.title}</strong> — {paper.testCount} test{paper.testCount === 1 ? "" : "s"} exist
              against it and stay readable. Every start path stops at once and the step is terminal:
              nothing destroys content and there is no path back to draft.
            </p>
          </Dialog>
        </>
      ) : null}
    </AdminPage>
  );
}
