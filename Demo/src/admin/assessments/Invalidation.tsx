/**
 * Invalidation — staff void one test (assessments.F24, sittings/:sittingId/invalidate).
 *
 * One test, one required reason note, one audited change recorded on the
 * recorded timeline. The test's recorded reason becomes "An administrator
 * invalidated it". Invalidating on a paper touches nothing else on the paper —
 * nothing propagates beyond the one test.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { ACTION, getSitting, INVALIDATION_REASON } from "./fixtures";
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

export function Invalidation() {
  const { sittingId } = useParams();
  const store = useStore();
  const sitting = getSitting(sittingId);
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  if (!sitting) {
    return (
      <AdminPage kicker="Assessments · Invalidate a test" title="Invalidate" lead="One test, one required note, one audited change.">
        <StateBlock state="unavailable" message="No test at this address."
          action={<Link className="btn btn--secondary" to="/admin/sittings">Tests</Link>} />
      </AdminPage>
    );
  }

  const alreadyInvalidated = sitting.state === "invalidated" || done;

  return (
    <AdminPage
      kicker={`Assessments · ${sitting.paperTitle}`}
      title={`Invalidate test ${sitting.id}`}
      lead="Staff void a test and choose no score — a recorded audited change on the test's own timeline."
      actions={<Link className="btn btn--quiet" to={`/admin/sittings/${sitting.id}/events`}>Recorded Events</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.invalidateTest} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The test record" /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={`test ${sitting.id}`} /> : null}

      {preview !== "loading" && preview !== "refused" ? (
        <>
          <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />
          <Card>
            <CardHeader title={`Test ${sitting.id}`} icon="clipboard" eyebrow={sitting.paperTitle} />
            <dl className="account-facts">
              <div><dt>State</dt><dd>{alreadyInvalidated ? "invalidated" : sitting.state}</dd></div>
              <div><dt>Started</dt><dd>{sitting.startedAt}</dd></div>
              <div><dt>Ended</dt><dd>{sitting.endedAt ?? "still in progress"}</dd></div>
              <div><dt>Recorded reason</dt><dd>{alreadyInvalidated ? INVALIDATION_REASON : sitting.endingReason ?? "—"}</dd></div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="The audited change" icon="alert" />
            {alreadyInvalidated ? (
              <StateBlock state="data" compact
                message={sitting.invalidation
                  ? `Already invalidated — ${sitting.invalidation.reason.toLowerCase()} by ${sitting.invalidation.administrator}, with the recorded note.`
                  : "Invalidated — the recorded reason is now \"An administrator invalidated it\", one audited change."} />
            ) : (
              <>
                <label className="field">
                  <span className="meta">Reason note — required, recorded on the test's timeline</span>
                  <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </label>
                <div className="row">
                  <button className="btn btn--primary" type="button" disabled={!note.trim()}
                    onClick={() => setConfirming(true)}>
                    Invalidate this test
                  </button>
                  {!note.trim() ? <span className="meta">The commit is refused until the note is written.</span> : null}
                </div>
              </>
            )}
          </Card>

          <Dialog
            open={confirming}
            title={`Invalidate test ${sitting.id}?`}
            icon="alert"
            tone="destructive"
            onClose={() => setConfirming(false)}
            actions={
              <>
                <Button variant="destructive" onClick={() => {
                  /* Fixture state only — the void lands on the record for the
                     session so the index, this page and the timeline agree. */
                  sitting.state = "invalidated";
                  sitting.invalidation = {
                    reason: INVALIDATION_REASON,
                    administrator: store.session.name,
                    note: note.trim(),
                    at: new Date().toISOString()
                  };
                  setConfirming(false);
                  setDone(true);
                }}>
                  Invalidate — one audited change
                </Button>
                <Button variant="secondary" onClick={() => setConfirming(false)}>Keep the test</Button>
              </>
            }
          >
            <p>
              Invalidate <strong>test {sitting.id}</strong> on <strong>{sitting.paperTitle}</strong>. The
              test's recorded reason becomes "An administrator invalidated it". Your note — "
              {note.trim()}" — is recorded on the test's timeline. Nothing propagates beyond this one
              test.
            </p>
          </Dialog>
        </>
      ) : null}
    </AdminPage>
  );
}
