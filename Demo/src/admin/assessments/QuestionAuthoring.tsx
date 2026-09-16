/**
 * QuestionAuthoring — a question authored inside one section
 * (mocks/:paperId/sections/:sectionId/questions/:questionId).
 *
 * `:questionId = "new"` is the create flow — the kind is the one field still
 * open, fixed the moment the question exists. The QuestionEditor does the
 * work: a mismatched key cannot be saved, and every unmet requirement reports
 * inline. While the paper is a draft the question is editable and removable —
 * removal sits behind an ordinary confirm; a content write after publication
 * is refused naming the correction path and the editable set, and a published
 * paper offers no authoring surface at all.
 */

import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs, type Crumb } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { QuestionEditor, QUESTION_KIND_LABEL, type QuestionDraft } from "../../extraction/components/QuestionEditor/QuestionEditor";
import { ACTION, commitNewQuestion, commitQuestionUpdate, emptyQuestionDraft, getCompany, getPaper, getQuestion, removeQuestion } from "./fixtures";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  ConflictDialog,
  ContentGuardNote,
  ContentWriteRefusal,
  NotVerifiableNote,
  OutOfDateNote,
  PreviewBar,
  StudioLoading,
  usePreview
} from "./shared";

export function QuestionAuthoring() {
  const { paperId, sectionId, questionId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const paper = getPaper(paperId);
  const isNew = questionId === "new";
  const { section, question } = paper ? getQuestion(paper, sectionId, questionId) : { section: undefined, question: undefined };
  /* A section added on the studio page this session resolves by address but
     not by fixture — the name travels on the link so the page still names it
     and the commit materializes it on the draft. */
  const sectionObj = section ?? (isNew && sectionId
    ? { id: sectionId, name: params.get("section")?.trim() || sectionId }
    : undefined);

  const published = paper?.lifecycle !== "draft";
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  const [draft, setDraft] = useState<QuestionDraft | null>(
    question ? { ...question } : isNew ? emptyQuestionDraft() : null
  );
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (!paper || !sectionObj || (!isNew && !question) || !draft) {
    return (
      <AdminPage kicker="Assessments · Question authoring" title="Question" lead="A question is authored inside one section.">
        <StateBlock
          state="unavailable"
          message="No question at this address."
          action={paper ? <Link className="btn btn--secondary" to={`/admin/mocks/${paper.id}`}>Back to the paper</Link> : <Link className="btn btn--secondary" to="/admin/mocks">Assessment studio</Link>}
        />
      </AdminPage>
    );
  }

  const title = isNew ? "New question" : `${QUESTION_KIND_LABEL[question!.kind]} question`;
  const lead = isNew
    ? `Section ${sectionObj.name} — the kind is chosen now and fixed once the question exists.`
    : `Section ${sectionObj.name} — question ${question!.order}. The kind is fixed once the question exists.`;

  /* The paper context persists through authoring: the trail runs index →
     (company, for a Company paper) → paper → section and question. */
  const owner = paper.type === "company" ? getCompany(paper.companyId ?? undefined) : undefined;
  const crumbs: Crumb[] = [
    { label: "Assessment studio", to: "/admin/mocks" },
    ...(owner
      ? [
          { label: "Companies", to: "/admin/mocks/companies" },
          { label: owner.name, to: `/admin/mocks/companies/${owner.id}` }
        ]
      : []),
    { label: paper.title || "Untitled draft", to: `/admin/mocks/${paper.id}?tab=questions` },
    { label: `${sectionObj.name} · ${title}` }
  ];

  return (
    <AdminPage
      kicker={`Assessments · ${paper.title || "Untitled draft"}`}
      title={title}
      lead={lead}
      actions={<Link className="btn btn--quiet" to={`/admin/mocks/${paper.id}?tab=questions`}>Back to the paper</Link>}
    >
      <div className="a-crumbs">
        <Breadcrumbs items={crumbs} label="Question trail" />
      </div>

      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editPaper} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal type={paper.type} /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The per-kind validation" /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={question?.id ?? "a new question"} /> : null}

      {preview !== "loading" && preview !== "refused" ? (
        <>
          <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />
          <Card>
            <CardHeader
              title={sectionObj.name}
              icon="edit"
              eyebrow={published ? "published — content read-only" : isNew ? "draft — the kind is still open" : `draft — ${QUESTION_KIND_LABEL[draft.kind]}`}
            />
            {published ? (
              <>
                {isNew ? (
                  <StateBlock
                    state="refused"
                    compact
                    message="A new question on a published paper is a content write — refused. Content freezes permanently at publish; the correction path is a duplicate: archive, fix the copy, publish it as a new paper."
                  />
                ) : (
                  <>
                    <QuestionEditor draft={draft} onChange={setDraft} onSave={() => {}} exists locked />
                    <p className="meta">
                      Read only — content is frozen permanently at publish. A write here is refused as a
                      content write; the correction path is a duplicate, and the full read-only record sits on{" "}
                      <Link to={`/admin/mocks/${paper.id}/published`}>the published view</Link>.
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <QuestionEditor
                  draft={draft}
                  onChange={(d) => { setDraft(d); setSaved(false); }}
                  onSave={(d) => {
                    if (isNew) {
                      commitNewQuestion(paper.id, sectionObj.id, sectionObj.name, d);
                      navigate(`/admin/mocks/${paper.id}?tab=questions`);
                      return;
                    }
                    /* The save commits on the draft paper — the outline, the
                       publish gate and every read-back then agree. */
                    if (question) commitQuestionUpdate(paper.id, question.id, d);
                    setSaved(true);
                  }}
                  exists={!isNew}
                  saveLabel={isNew ? "Add question" : "Save question"}
                />
                {saved ? <p className="page__lead" role="status">Saved — committed with its trail row.</p> : null}
                {!isNew ? (
                  <div className="row" style={{ marginTop: "var(--space-4)" }}>
                    <Button variant="quiet" size="sm" onClick={() => setRemoving(true)}>
                      Remove this question…
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </Card>

          {/* Ordinary confirm — removal is a draft-time act. */}
          <Dialog
            open={removing}
            title="Remove this question?"
            icon="alert"
            tone="destructive"
            onClose={() => setRemoving(false)}
            actions={
              <>
                <Button variant="secondary" onClick={() => setRemoving(false)}>Keep it</Button>
                <Button variant="destructive"
                  onClick={() => {
                    if (question) removeQuestion(paper.id, question.id);
                    navigate(`/admin/mocks/${paper.id}?tab=questions`);
                  }}>
                  Remove the question
                </Button>
              </>
            }
          >
            <p>
              Remove “{question?.prompt || "(empty prompt)"}” from {paper.title}. The removal commits
              on the draft with its trail row — nothing else on the paper moves.
            </p>
          </Dialog>
        </>
      ) : null}
    </AdminPage>
  );
}
