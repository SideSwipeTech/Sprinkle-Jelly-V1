/**
 * CertificateDetail — `certificates/:certId`. The private per-certificate
 * view: the record, the append-only status history and the audit trail
 * (certificates/01-pages "Studio, one certificate").
 *
 * The four acts stay apart: revoke, decide a name-correction proposal,
 * reissue, retry a generation — and the retry lives on the studio's own
 * parked-generations page (decision 175), linked from here.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { canMutatePeople } from "../roles";
import { ActionPanel } from "../../extraction/components/ActionPanel/ActionPanel";
import { KeyValueRow, KeyValueTable } from "../../extraction/components/KeyValueRow/KeyValueRow";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import {
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import {
  ACTION,
  FAILURE_CLASS_LABEL,
  PENDING_READING_LABEL,
  REVOCATION_CODES,
  STATUS_LABEL,
  currentProposal,
  decideProposal,
  findCertificate,
  proposalHistory,
  reissueCertificate,
  revokeCertificate,
  wasReissued
} from "./fixtures";
import "./credentials.css";

export function CertificateDetail() {
  const { certId } = useParams();
  const store = useStore();
  const cert = findCertificate(certId);
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);

  /* Decide-a-proposal state. */
  const [decideOpen, setDecideOpen] = useState<"approved" | "rejected" | null>(null);
  const [decideReason, setDecideReason] = useState("");
  const [decideOutcome, setDecideOutcome] = useState("");

  /* Reissue state. */
  const [reissueOpen, setReissueOpen] = useState(false);
  const [reissueOutcome, setReissueOutcome] = useState("");

  /* Revocation state. */
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeCode, setRevokeCode] = useState("");
  const [revokeNote, setRevokeNote] = useState("");
  const [revokeOutcome, setRevokeOutcome] = useState("");

  if (!cert) {
    return (
      <AdminPage kicker="Credentials" title="Certificate unavailable">
        <StateBlock
          state="unavailable"
          message="This certificate record does not resolve."
          action={<Link className="btn btn--secondary" to="/admin/certificates">Certificates</Link>}
        />
      </AdminPage>
    );
  }

  const mayAct = canMutatePeople(store.session.role);
  const proposal = currentProposal(cert.learnerId);
  const decidedProposals = proposalHistory(cert.learnerId).filter((p) => p.state !== "pending");
  const affectedByReissue = cert.status === "issued" ? 1 : 0;
  const revokeReady = revokeCode !== "" && revokeNote.trim().length > 0;

  return (
    <AdminPage
      kicker="Credentials"
      title={cert.awardingItem}
      lead={`${cert.learner} · ${STATUS_LABEL[cert.status]}`}
      actions={<Link className="btn btn--quiet" to="/admin/certificates">All certificates</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.openStudio} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="The certificate record could not be read — Unavailable with a retry, never an empty record."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}
      {preview === "loaded" ? (
        <>
          <Card>
            <CardHeader title="The record" icon="shield" eyebrow="private per-certificate view" />
            <KeyValueTable label="Certificate record">
              <KeyValueRow as="definition" term="Identifier" value={<code className="cr-id">{cert.identifier}</code>} />
              <KeyValueRow as="definition" term="Learner" value={cert.learner} />
              <KeyValueRow as="definition" term="Awarding item" value={`${cert.awardingItem} — ${cert.awardingKind}`} />
              <KeyValueRow
                as="definition"
                term="Status"
                value={
                  cert.status === "pending" && cert.pendingReading
                    ? `Pending — ${PENDING_READING_LABEL[cert.pendingReading]}`
                    : STATUS_LABEL[cert.status]
                }
                tone={cert.status === "revoked" ? "error" : cert.status === "pending" ? "warning" : "default"}
              />
              <KeyValueRow as="definition" term="Shown publicly" value={cert.shownPublicly ? "Shown" : "Hidden by the owner — still issued"} />
              <KeyValueRow as="definition" term="Completed" value={cert.completedAt} />
              <KeyValueRow as="definition" term="Issued" value={cert.issuedAt} />
              <KeyValueRow as="definition" term="Display name rendered" value={cert.displayName} />
              <KeyValueRow as="definition" term="Frozen presentation" value={cert.presentation} />
              {cert.generation ? (
                <KeyValueRow
                  as="definition"
                  term="Generation"
                  value={`${cert.generation.tries} ${cert.generation.tries === 1 ? "try" : "tries"}${cert.generation.failureClass ? ` · ${FAILURE_CLASS_LABEL[cert.generation.failureClass]}` : ""}${cert.generation.parkedAge ? ` · parked ${cert.generation.parkedAge}` : ""}`}
                />
              ) : null}
              {wasReissued(cert.id) ? (
                <KeyValueRow as="definition" term="Document" value="Reissued — the current reference moved to the new document; the one it stands in for is marked replaced." />
              ) : null}
            </KeyValueTable>
          </Card>

          <Card>
            <CardHeader title="Status history" icon="history" eyebrow="append-only — never updated, never deleted" />
            {cert.history.length === 0 ? (
              <StateBlock state="empty" compact message="No transitions recorded." />
            ) : (
              <div className="cr-history">
                {cert.history.map((row, i) => (
                  <div key={i} className="cr-history__entry">
                    <div className="cr-history__head">
                      <strong>{row.from} → {row.to}</strong>
                      <span className="cr-history__meta">{row.actor} · {row.at}</span>
                    </div>
                    {row.code ? <p className="cr-history__meta">code <code>{row.code}</code></p> : null}
                    {row.note ? <p className="meta">{row.note}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Audit trail" icon="list" />
            {cert.audit.length === 0 ? (
              <StateBlock state="empty" compact message="No audited acts on this certificate." />
            ) : (
              <div className="cr-history">
                {cert.audit.map((row, i) => (
                  <div key={i} className="cr-history__entry">
                    <div className="cr-history__head">
                      <strong className="cr-id">{row.action}</strong>
                      <span className="cr-history__meta">{row.actor} · {row.at}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {!mayAct ? (
            <CapabilityRefusal action={ACTION.revoke} />
          ) : (
            <>
              {/* Act one — decide a name-correction proposal. Never a
                  substitution: the learner's exact value is accepted or
                  refused. */}
              <ActionPanel
                eyebrow="Name correction"
                lead="A correction is not a revocation. The decision binds to the exact revision in front of you — the learner's value is accepted or refused, never substituted."
                outcome={decideOutcome || undefined}
              >
                {proposal ? (
                  <>
                    <KeyValueTable label="The proposal in front of you">
                      <KeyValueRow as="definition" term="Revision" value={<code className="cr-id">{proposal.id}</code>} />
                      <KeyValueRow as="definition" term="Current name" value={proposal.currentName} />
                      <KeyValueRow as="definition" term="Proposed value" value={proposal.proposed} />
                      <KeyValueRow as="definition" term="Learner's reason" value={proposal.learnerReason} />
                    </KeyValueTable>
                    <p className="meta">
                      Read under {ACTION.readProposedName} — the one staff-readable learner-written
                      field, with its reason.
                    </p>
                    <div className="row">
                      <Button variant="primary" onClick={() => { setDecideOpen("approved"); setDecideReason(""); setDecideOutcome(""); }}>
                        Approve the proposed value…
                      </Button>
                      <Button variant="quiet" onClick={() => { setDecideOpen("rejected"); setDecideReason(""); setDecideOutcome(""); }}>
                        Reject it…
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="meta">
                    No current proposal — the queue says so rather than presenting a stale one.
                    {decidedProposals.length > 0
                      ? ` Decided: ${decidedProposals.map((p) => `${p.proposed} (${p.state}${p.decisionReason ? ` — ${p.decisionReason}` : ""})`).join("; ")}.`
                      : ""}
                  </p>
                )}
              </ActionPanel>

              {/* Act two — reissue. The count is recomputed at the
                  confirmation; nothing affected means confirming does
                  nothing. */}
              <ActionPanel
                eyebrow="Reissue"
                lead="Replaces exactly one certificate document — a display-name reissue is never a new lineage member. The identifier, the dates, the validity and the lineage never move."
                outcome={reissueOutcome || undefined}
              >
                {cert.status === "issued" ? (
                  <>
                    <p className="meta">
                      Covers this valid issued certificate — {affectedByReissue} affected, recomputed
                      at the confirmation. A count that changed since the preview returns you to the
                      preview rather than silently widening the act.
                    </p>
                    <div className="row">
                      <Button variant="secondary" onClick={() => { setReissueOpen(true); setReissueOutcome(""); }}>
                        Reissue the document…
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="meta">
                    Nothing affected — this certificate is {STATUS_LABEL[cert.status].toLowerCase()},
                    so the control says so and confirming does nothing. Revoked certificates, the
                    erasure markers and unfinished generations are excluded.
                  </p>
                )}
              </ActionPanel>

              {/* Act three — revocation on a closed reason. */}
              <ActionPanel
                eyebrow="Revocation"
                lead="Makes the public check answer not valid — append-only, effective immediately, undone by no administrator's act. The awarding event is never erased."
                outcome={revokeOutcome || undefined}
              >
                {cert.status === "revoked" ? (
                  <p className="meta">Already revoked — repeating it is harmless and produces no second transition.</p>
                ) : cert.status === "pending" ? (
                  <p className="meta">Nothing issued yet — a pending certificate is not valid and has nothing to revoke.</p>
                ) : (
                  <div className="row">
                    <Button variant="destructive" onClick={() => { setRevokeOpen(true); setRevokeCode(""); setRevokeNote(""); setRevokeOutcome(""); }}>
                      Revoke on a closed reason…
                    </Button>
                  </div>
                )}
              </ActionPanel>

              {/* Act four — retry a generation, on the studio's own
                  parked-generations page. */}
              <ActionPanel
                eyebrow="Generation"
                lead="A parked generation is retried on the studio's own parked-generations page — it keeps its payload, its tries and its last error, and the release is recorded like any staff write."
              >
                {cert.pendingReading === "generation_failed" ? (
                  <div className="row">
                    <Button variant="secondary" to="/admin/certificates/parked">
                      Retry it on parked generations
                    </Button>
                  </div>
                ) : (
                  <p className="meta">
                    {cert.status === "issued"
                      ? "The document is durably held — nothing to retry."
                      : cert.pendingReading === "generating"
                        ? "Generating — the platform's retry policy owns it until it parks."
                        : "Waiting on the learner's display name — nothing the platform can retry."}
                  </p>
                )}
              </ActionPanel>
            </>
          )}
        </>
      ) : null}

      {/* Decide — the reason is required either way. */}
      <Dialog
        open={decideOpen !== null}
        title={decideOpen === "approved" ? `Approve “${proposal?.proposed}”` : `Reject “${proposal?.proposed}”`}
        icon="edit"
        onClose={() => setDecideOpen(null)}
      >
        <p>
          {decideOpen === "approved"
            ? `The approval and the display-name update commit together — one record, one audit, one act. Certificates not yet generated use the corrected name automatically; documents already made are unchanged unless a reissue is separately confirmed.`
            : "A rejection keeps the existing name and puts its safe reason on the learner's own certificate page — never a notification, never internal detail."}
        </p>
        <Field label="Your reason" required hint="Audited with actor, action, reason and time; a rejection's reason is the safe reason the learner reads.">
          <input value={decideReason} onChange={(e) => setDecideReason(e.target.value)} placeholder="Required" />
        </Field>
        <div className="row">
          <Button variant="quiet" onClick={() => setDecideOpen(null)}>Cancel</Button>
          <Button
            disabled={decideReason.trim().length === 0}
            onClick={() => {
              if (proposal && decideOpen) {
                decideProposal(proposal, decideOpen, decideReason.trim());
                setDecideOutcome(
                  decideOpen === "approved"
                    ? `Approved — the display name is now “${proposal.proposed}”, committed with the decision.`
                    : "Rejected — the existing name stands and the safe reason is on the learner's own page."
                );
              }
              setDecideOpen(null);
            }}
          >
            {decideOpen === "approved" ? "Confirm approval" : "Confirm rejection"}
          </Button>
        </div>
      </Dialog>

      {/* Reissue — the count restated at confirmation. */}
      <Dialog
        open={reissueOpen}
        title="Reissue the document"
        icon="reset"
        onClose={() => setReissueOpen(false)}
      >
        <p>
          Recomputed at this confirmation: {affectedByReissue} certificate affected — this one. The
          current reference moves to the new document only once that document is durably held; the
          one it stands in for is marked replaced and taken out of download. A document already
          downloaded cannot be recalled — its QR keeps resolving the unchanged identifier. The
          public answer stays valid; no notification is produced.
        </p>
        <div className="row">
          <Button variant="quiet" onClick={() => setReissueOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              reissueCertificate(cert.id);
              setReissueOutcome("Reissue confirmed — one document queued; the previous is marked replaced.");
              setReissueOpen(false);
            }}
          >
            Confirm reissue
          </Button>
        </div>
      </Dialog>

      {/* Revocation — one closed code, a mandatory note, the one dialog. */}
      <Dialog
        open={revokeOpen}
        title={`Revoke — ${cert.awardingItem}`}
        icon="alert"
        tone="destructive"
        onClose={() => setRevokeOpen(false)}
      >
        <p>
          One code from the closed five, a mandatory reason note and this explicit confirmation. A
          revocation nobody can name with one of the five is refused rather than recorded under a
          general-purpose reason.
        </p>
        <Field label="Closed reason code" required>
          <Select
            value={revokeCode}
            onChange={setRevokeCode}
            options={[
              { value: "", label: "Choose the code…", disabled: true },
              ...REVOCATION_CODES.map((c) => ({
                value: c.id,
                label: c.machine ? `${c.id} — machine only, on the completed erasure` : c.id,
                disabled: c.machine
              }))
            ]}
          />
        </Field>
        {revokeCode ? (
          <p className="meta">{REVOCATION_CODES.find((c) => c.id === revokeCode)?.covers}</p>
        ) : null}
        <Field label="Reason note" required hint="Mandatory — a missing note is refused the same way as an unconfirmed act.">
          <textarea value={revokeNote} onChange={(e) => setRevokeNote(e.target.value)} placeholder="The circumstances, in the record" />
        </Field>
        <div className="row">
          <Button variant="quiet" onClick={() => setRevokeOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!revokeReady}
            onClick={() => {
              revokeCertificate(cert.id, revokeCode, revokeNote.trim());
              setRevokeOutcome("Revocation recorded — the public check answers not valid from now.");
              setRevokeOpen(false);
            }}
          >
            Confirm revocation
          </Button>
        </div>
      </Dialog>
    </AdminPage>
  );
}
