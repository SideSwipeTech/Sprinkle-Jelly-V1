/**
 * PublishChecklist — the publish readiness checklist route
 * (mocks/:paperId/publish). The surface itself is the shared PaperReview the
 * workspace's Review tab also renders: blocking issues listed separately
 * from warnings, each pointing at the field or section it concerns, a run
 * against nothing registered never reading ready, and a super
 * administrator's publish where every other role submits for approval.
 */

import { Link, useParams } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { ACTION, getPaper } from "./fixtures";
import { PaperReview } from "./PaperReview";
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

export function PublishChecklist() {
  const { paperId } = useParams();
  const paper = getPaper(paperId);
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);

  if (!paper) {
    return (
      <AdminPage kicker="Assessments · Publish" title="Publish checklist" lead="Every named check, reported individually.">
        <StateBlock state="unavailable" message="No paper at this address."
          action={<Link className="btn btn--secondary" to="/admin/mocks">Assessment studio</Link>} />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      kicker={`Assessments · ${paper.title}`}
      title="Publish readiness checklist"
      lead="The shared contract and the selected type's contract — blocking issues separate from warnings, each reported individually and actionably."
      actions={<Link className="btn btn--quiet" to={`/admin/mocks/${paper.id}?tab=review`}>Back to the paper</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.publishPaper} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal type={paper.type} /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={paper.title} /> : null}

      {preview !== "loading" && preview !== "refused" ? (
        <>
          <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />
          {preview === "unverifiable" ? <NotVerifiableNote subject="A publish check" /> : null}
          <PaperReview paper={paper} revision={JSON.stringify(paper)} />
        </>
      ) : null}
    </AdminPage>
  );
}
