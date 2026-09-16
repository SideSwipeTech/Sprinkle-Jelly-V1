/**
 * ParkedGenerations — `certificates/parked`. The studio's own
 * parked-generations page (decision 175): a generation whose retries are
 * spent, with its failure class, retry count and parked age, under the shared
 * waiting-versus-running split. Retry a parked generation — the release
 * keeps the payload, the tries and the last error, is recorded like any staff
 * write, and moves the certificate back to generating.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { canMutatePeople } from "../roles";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Field } from "../../extraction/components/Field/Field";
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
  GENERATION_SPLIT,
  allParked,
  retryParked
} from "./fixtures";
import "./credentials.css";

export function ParkedGenerations() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const mayAct = canMutatePeople(store.session.role);

  const [retrying, setRetrying] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [outcome, setOutcome] = useState("");

  const parked = allParked();
  const target = parked.find((p) => p.id === retrying) ?? null;

  return (
    <AdminPage
      kicker="Credentials"
      title="Parked generations"
      lead="Generations whose retries are spent — visible and staff-retryable rather than quietly dropped. The certificate was earned; the document is the platform's promise to keep."
      actions={<Link className="btn btn--quiet" to="/admin/certificates">Certificates</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.retryGeneration} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="The parked generations could not be read — Unavailable with a retry, never an empty list."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}
      {preview === "loaded" ? (
        <>
          <div className="cr-split-line" role="group" aria-label="The shared waiting-versus-running split">
            <span>Waiting <strong>{GENERATION_SPLIT.waiting}</strong></span>
            <span>Running <strong>{GENERATION_SPLIT.running}</strong></span>
            <span>Parked <strong>{parked.length}</strong> — retries spent; neither waiting nor running</span>
          </div>
          {parked.length === 0 ? (
            <StateBlock state="empty" message="No parked generations — the good state." />
          ) : (
            <Card>
              <CardHeader title="Parked" icon="alert" eyebrow="each row keeps its payload, its tries and its last error" />
              <List>
                {parked.map((p) => (
                  <ListRow key={p.id} as="article">
                    <div>
                      <strong>{p.learner} — {p.awardingItem}</strong>
                      <p className="meta">
                        {FAILURE_CLASS_LABEL[p.failureClass]} · {p.tries} tries · parked {p.parkedAge}
                      </p>
                      <p className="cr-id">{p.lastError}</p>
                    </div>
                    <div className="row">
                      <Button
                        variant="quiet"
                        size="sm"
                        to={`/admin/certificates/${p.certificateId}`}
                      >
                        The certificate
                      </Button>
                      {mayAct ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => { setRetrying(p.id); setReason(""); setOutcome(""); }}
                        >
                          Retry…
                        </Button>
                      ) : null}
                    </div>
                  </ListRow>
                ))}
              </List>
              {!mayAct ? (
                <p className="meta">
                  This session does not hold {ACTION.retryGeneration} — the rows stay readable; the
                  release is refused.
                </p>
              ) : null}
              {outcome ? (
                <p className="cr-note" data-tone="ok" role="status">
                  <Icon name="check" size={14} /> {outcome}
                </p>
              ) : null}
            </Card>
          )}
        </>
      ) : null}

      <Dialog
        open={target !== null}
        title={target ? `Retry the parked generation — ${target.learner}` : "Retry"}
        icon="reset"
        onClose={() => setRetrying(null)}
      >
        {target ? (
          <>
            <p>
              Releases the parked row for {target.learner} — {target.awardingItem}. The release is
              recorded like any staff write: it keeps the payload, the {target.tries} tries and the
              last error, re-arms the row rather than rewriting it, and moves the certificate back to
              generating inside this transaction.
            </p>
            <Field label="Reason" required hint="Each of the four acts is audited with actor, action, reason and time.">
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why this retry now" />
            </Field>
            <div className="row">
              <Button variant="quiet" onClick={() => setRetrying(null)}>Cancel</Button>
              <Button
                disabled={reason.trim().length === 0}
                onClick={() => {
                  retryParked(target.id);
                  setOutcome(`Released — ${target.learner} · ${target.awardingItem} is generating again; the parked row is re-armed, not rewritten.`);
                  setRetrying(null);
                }}
              >
                Confirm the retry
              </Button>
            </div>
          </>
        ) : null}
      </Dialog>
    </AdminPage>
  );
}
