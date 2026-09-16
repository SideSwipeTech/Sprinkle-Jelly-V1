/**
 * Approvals — `approvals` + `approvals/:id`. Publish-approval review
 * (admin.F08, admin/04-authoring "Approval is the publish"): a submitted item
 * with its studio, its submitter, both halves of the change record, what would
 * be replaced, the classification result and the reach — then approve, which
 * publishes in the same act, or reject with a required reason. A draft edited
 * after submission is refused as a conflict against the revision the approver
 * saw, and where the picture cannot be assembled the decision controls never
 * become reachable.
 *
 * Fixture state only — decisions are local.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Field } from "../../extraction/components/Field/Field";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Notice } from "../../extraction/components/Notice/Notice";
import { ACTION, APPROVALS, fmtInstant, type ApprovalItem } from "./fixtures";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import "./content.css";

const PREVIEWS = ["loaded", "loading", "refused"] as const;

/* ── The queue ────────────────────────────────────────────────────────────── */

export function ApprovalsIndex() {
  const { preview, setPreview, allowed } = usePreview([...PREVIEWS]);
  const pending = APPROVALS.filter((a) => a.status === "pending");
  const settled = APPROVALS.filter((a) => a.status !== "pending");

  return (
    <AdminPage
      kicker="Content"
      title="Publish Approvals"
      lead="The approval is the publish — a super administrator publishes directly, every other role submits. Nothing is inferred from inaction."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.decideApproval} /> : null}

      {preview === "loaded" ? (
        <>
          <LoadedLine loaded={APPROVALS.length} total={APPROVALS.length} />
          <Card>
            <CardHeader title="Waiting on a decision" icon="inbox" eyebrow={`${pending.length} pending`} />
            {pending.length === 0 ? (
              <StateBlock state="empty" message="No pending revisions — an empty queue is a reading in its own right." compact />
            ) : (
              <List>
                {pending.map((a) => (
                  <ListRow key={a.id} as="article" align="center">
                    <div className="ct-row__body">
                      <strong>{a.title}</strong>
                      <p className="meta">
                        {a.kind} · {a.studio} · submitted by {a.submitter} · {fmtInstant(a.submittedAt)}
                        {a.editedAfterSubmission ? " · edited since submission — conflict" : ""}
                        {a.reach === null ? " · the reach cannot be read" : ""}
                      </p>
                    </div>
                    <span className="ct-row__acts">
                      <Chip size="sm" variant="quiet">revision {a.revision}</Chip>
                      <Button variant="secondary" size="sm" to={`/admin/approvals/${a.id}`} label={`Open ${a.title}`}>
                        Open
                      </Button>
                    </span>
                  </ListRow>
                ))}
              </List>
            )}
          </Card>

          {settled.length > 0 ? (
            <Card>
              <CardHeader title="Decided" icon="history" />
              <List>
                {settled.map((a) => (
                  <ListRow key={a.id} as="article" align="center">
                    <div className="ct-row__body">
                      <strong>{a.title}</strong>
                      <p className="meta">
                        {a.status === "approved" ? "approved — published in the same act" : "rejected"}
                        {a.decision ? ` · ${a.decision.by}, ${fmtInstant(a.decision.at)}` : ""}
                      </p>
                    </div>
                    <span className="ct-row__acts">
                      <Button variant="quiet" size="sm" to={`/admin/approvals/${a.id}`} label={`Open ${a.title}`}>
                        Open
                      </Button>
                    </span>
                  </ListRow>
                ))}
              </List>
            </Card>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}

/* ── The detail — the whole picture before the decision ───────────────────── */

export function ApprovalDetail() {
  const { id } = useParams();
  const fixture = APPROVALS.find((a) => a.id === id);
  const { preview, setPreview, allowed } = usePreview([...PREVIEWS]);
  const [status, setStatus] = useState<ApprovalItem["status"] | undefined>(fixture?.status);
  const [decisionNote, setDecisionNote] = useState<string | undefined>(fixture?.decision?.note);
  const [confirming, setConfirming] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  if (!fixture) {
    return (
      <AdminPage kicker="Content · Publish Approvals" title="Submission unavailable">
        <StateBlock
          state="unavailable"
          message="No submitted item at this address."
          action={<Button variant="secondary" to="/admin/approvals">Publish Approvals</Button>}
        />
      </AdminPage>
    );
  }

  /* The picture the decision needs: the item and its studio, the submitter,
     both halves of the change record, what would be replaced, the
     classification result and the reach. Any piece unreadable — here the
     reach — and the decision controls never become reachable. */
  const pictureAssembled = fixture.reach !== null && !fixture.editedAfterSubmission;
  const pending = status === "pending";

  return (
    <AdminPage
      kicker={`Content · Publish Approvals · ${fixture.kind}`}
      title={fixture.title}
      lead={`Submitted by ${fixture.submitter} · ${fmtInstant(fixture.submittedAt)} · revision ${fixture.revision} · ${fixture.studio}`}
      actions={
        <span className="row">
          <Chip size="sm" variant="quiet">{status}</Chip>
          <Button variant="quiet" to="/admin/approvals" icon="arrow-left">The queue</Button>
        </span>
      }
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.decideApproval} /> : null}

      {preview === "loaded" ? (
        <>
          <div className="grid-2">
            <Card>
              <CardHeader title="The item" icon="sticky-note" />
              <dl className="account-facts">
                <div><dt>Studio</dt><dd><Link to={fixture.studioTo}>{fixture.studio}</Link></dd></div>
                <div><dt>Submitter</dt><dd>{fixture.submitter}</dd></div>
                <div><dt>Submitted</dt><dd>{fmtInstant(fixture.submittedAt)}</dd></div>
                <div><dt>Revision under review</dt><dd>{fixture.revision}</dd></div>
              </dl>
            </Card>
            <Card>
              <CardHeader title="Classification result" icon="skills" />
              <dl className="account-facts">
                <div><dt>Skill</dt><dd>{fixture.classification.skill}</dd></div>
                <div><dt>Topic</dt><dd>{fixture.classification.topic}</dd></div>
                <div><dt>Result</dt><dd>{fixture.classification.verdict}</dd></div>
              </dl>
            </Card>
          </div>

          <Card>
            <CardHeader title="The change record — both halves" icon="edit" eyebrow="published vs submitted" />
            <table className="ct-diff">
              <thead>
                <tr><th>Field</th><th>Published half — what learners have now</th><th>Submitted half — what revision {fixture.revision} carries</th></tr>
              </thead>
              <tbody>
                {fixture.changes.map((c) => {
                  const changed = c.published !== c.submitted;
                  return (
                    <tr key={c.field}>
                      <td><strong>{c.field}</strong></td>
                      <td className={changed ? "ct-diff__changed" : undefined}>{c.published}</td>
                      <td className={changed ? "ct-diff__changed" : undefined}>{c.submitted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div className="grid-2">
            <Card>
              <CardHeader title="What the publish would replace" icon="reset" />
              <p className="page__lead">{fixture.replaces}</p>
            </Card>
            <Card>
              <CardHeader title="The reach" icon="target" />
              {fixture.reach === null ? (
                <StateBlock
                  state="unavailable"
                  compact
                  message="The reach cannot be read — how far this change lands is unknown, and the decision controls never become reachable on an unreadable reach."
                />
              ) : (
                <p className="page__lead">{fixture.reach}</p>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader title="The decision" icon="check" eyebrow="explicit, never inferred" />
            {fixture.editedAfterSubmission ? (
              <Notice tone="warning" title="Conflict — draft edited after submission">
                <p>
                  The draft moved after {fixture.submitter} submitted it. Deciding now would review a
                  revision nobody saw — this submission is refused as a conflict against revision{" "}
                  {fixture.revision}. The author resubmits when the edits are meant to be reviewed.
                </p>
              </Notice>
            ) : !pictureAssembled ? (
              <StateBlock
                state="unavailable"
                message="The picture cannot be assembled — the reach is unreadable. Approve and reject stay unreachable until it reads."
              />
            ) : pending ? (
              <>
                <p className="meta">
                  Approve publishes in the same act — there is no second step. Reject returns the
                  draft to {fixture.submitter} with your reason; the reason is required, because a
                  bare refusal tells the author nothing.
                </p>
                <div className="admin-tools">
                  <Button icon="check" onClick={() => setConfirming("approve")}>
                    Approve — publish
                  </Button>
                  <Button variant="secondary" onClick={() => { setConfirming("reject"); setReason(""); }}>
                    Reject with a reason
                  </Button>
                </div>
              </>
            ) : (
              <Notice tone={status === "approved" ? "success" : "neutral"} live="polite">
                <p>
                  {status === "approved"
                    ? "Approved — published in the same act."
                    : `Rejected — returned to ${fixture.submitter} with the reason.`}
                  {decisionNote ? ` “${decisionNote}”` : ""}
                </p>
              </Notice>
            )}
          </Card>

          {confirming === "approve" ? (
            <Dialog
              title={`Approve — ${fixture.title}`}
              icon="check"
              onClose={() => setConfirming(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setConfirming(null)}>Cancel</Button>
                  <Button
                    onClick={() => {
                      setStatus("approved");
                      setDecisionNote(undefined);
                      setConfirming(null);
                    }}
                  >
                    Approve — publish revision {fixture.revision}
                  </Button>
                </>
              }
            >
              <p>
                Approval is the publish: confirming publishes revision {fixture.revision} in the same
                act and replaces what is live. {fixture.reach}
              </p>
            </Dialog>
          ) : null}

          {confirming === "reject" ? (
            <Dialog
              title={`Reject — ${fixture.title}`}
              icon="alert"
              tone="destructive"
              onClose={() => setConfirming(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setConfirming(null)}>Cancel</Button>
                  <Button
                    variant="destructive"
                    disabled={!reason.trim()}
                    onClick={() => {
                      setStatus("rejected");
                      setDecisionNote(reason.trim());
                      setConfirming(null);
                    }}
                  >
                    Reject with this reason
                  </Button>
                </>
              }
            >
              <p>
                Rejection returns the draft to {fixture.submitter} with your reason — it publishes
                nothing. An empty reason leaves the action unreachable rather than saved blank.
              </p>
              <Field label="Reason" required>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
              </Field>
            </Dialog>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
