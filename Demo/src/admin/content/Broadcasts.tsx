/**
 * Broadcasts — `broadcasts`. The broadcast composer and its readable history
 * (admin.F18, notifications/01 §2.6–2.7, notifications/03 §4.8): one
 * announcement to every eligible learner — active, holding no staff role,
 * with System enabled — and no member of staff. No audience selector exists
 * because targeting is behavior the product does not have.
 *
 * The composer states its three fixed facts, previews exactly as an inbox row,
 * and shows the estimated recipient count as an upper bound — Administration's
 * estimate, never a target. Sending passes a confirmation that states the
 * blast radius, what is at stake and that the send is attributed; at or above
 * NOTIFICATIONS_BROADCAST_SECOND_CONFIRMATION_RECIPIENTS — or where the
 * estimate cannot be computed — a second explicit confirmation is required.
 * Once delivery begins one control exists: Stop remaining delivery. Stopped is
 * terminal — no resume, no recall, no re-send.
 *
 * Fixture state only.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Field } from "../../extraction/components/Field/Field";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  ACTION,
  BROADCASTS,
  COMPOSER,
  FIG,
  fmtInstant,
  type BroadcastRec
} from "./fixtures";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import "./content.css";

export function Broadcasts() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused"]);
  const [history, setHistory] = useState<BroadcastRec[]>(BROADCASTS);
  const [icon, setIcon] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [sendFailedOnce, setSendFailedOnce] = useState(false);
  const [failureNote, setFailureNote] = useState<string | null>(null);
  const [stopping, setStopping] = useState<BroadcastRec | null>(null);
  const [stopWhy, setStopWhy] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  const estimate = COMPOSER.estimatedAudience;
  const needsSecond = estimate === null || estimate >= FIG.NOTIFICATIONS_BROADCAST_SECOND_CONFIRMATION_RECIPIENTS;
  const titleOver = title.length > FIG.PLATFORM_TITLE_CHARS;
  const messageOver = message.length > FIG.NOTIFICATIONS_BROADCAST_MESSAGE_CHARS;
  const canSend = COMPOSER.sendingAvailable && title.trim() && message.trim() && !titleOver && !messageOver;

  function openConfirm() {
    setAck2(false);
    setConfirming(true);
  }

  function send() {
    if (!canSend || (needsSecond && !ack2)) return;
    setConfirming(false);
    if (COMPOSER.sendBehaviour === "fails-once" && !sendFailedOnce) {
      /* A failed submission says plainly that nothing was sent and keeps the
         draft — the fields stay exactly as typed. */
      setSendFailedOnce(true);
      setFailureNote("The submission failed — nothing was sent, and the draft is kept. Retry sends once: two submissions of one send produce one delivery.");
      return;
    }
    const rec: BroadcastRec = {
      id: `bc-${43 + history.length}`,
      title: title.trim(),
      message: message.trim(),
      icon: icon.trim() || FIG.NOTIFICATIONS_BROADCAST_DEFAULT_ICON,
      author: "you",
      createdAt: new Date().toISOString(),
      status: "in flight",
      estimated: estimate,
      delivered: 0,
      failed: 0,
      skipped: 0,
      stoppedBefore: 0
    };
    setHistory((prev) => [rec, ...prev]);
    setTitle("");
    setMessage("");
    setIcon("");
    setFailureNote(null);
    setFlash("Sent — the broadcast and its attribution record exist together, and delivery has begun. One control exists now: Stop remaining delivery.");
  }

  function stop(rec: BroadcastRec) {
    setHistory((prev) =>
      prev.map((b) =>
        b.id === rec.id
          ? {
              ...b,
              status: "stopped" as const,
              /* Where the estimate could not be computed the stopped count is
                 read as unavailable — never a fabricated zero. */
              stoppedBefore:
                b.estimated === null
                  ? null
                  : Math.max(0, b.estimated - b.delivered - b.failed - b.skipped),
              stopRequest: { by: "you", at: new Date().toISOString(), why: stopWhy.trim() || "Stopped by the operator." }
            }
          : b
      )
    );
    setStopping(null);
    setStopWhy("");
    setFlash("Stopped — terminal. What was delivered stays delivered; nothing is recalled, and a correction is a new draft with a new identity.");
  }

  function retry(rec: BroadcastRec) {
    setHistory((prev) =>
      prev.map((b) =>
        b.id === rec.id
          ? { ...b, status: "delivered" as const, delivered: (b.estimated ?? 0) - b.skipped, note: undefined }
          : b
      )
    );
    setFlash(`Retry of ${rec.id} — delivery began this time. A held send is never reported as sent.`);
  }

  return (
    <AdminPage
      kicker="People"
      title="Broadcasts"
      lead="One announcement to every eligible learner and no member of staff — the category is System, and delivery continues after the composer is closed. There is no audience selector."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.sendBroadcast} /> : null}

      {preview === "loaded" ? (
        <>
          {flash ? <Notice tone="info" live="polite">{flash}</Notice> : null}

          <div className="ct-gaps">
            <Card>
              <CardHeader title="The composer" icon="notifications" eyebrow="category: System · audience: all active learners" />
              <Notice tone="info" compact title="Three fixed facts">
                <p>
                  The audience is all active learners — no member of staff; the category is System;
                  and delivery continues after the composer is closed. The estimate below is an upper
                  bound, Administration's own — never a target.
                </p>
              </Notice>
              {!COMPOSER.sendingAvailable ? (
                <StateBlock
                  state="unavailable"
                  compact
                  message={`Sending is unavailable — ${COMPOSER.sendingReason || "the reason is stated within reach"}.`}
                />
              ) : null}
              <Field label="Estimated recipients — an upper bound">
                <input
                  readOnly
                  value={estimate === null ? "uncomputable — the second acknowledgement is still required" : `at most ${estimate}`}
                  aria-label="Estimated recipients"
                />
              </Field>
              <div className="admin-form-grid">
                <Field
                  label={`Title — required, at most ${FIG.PLATFORM_TITLE_CHARS} characters`}
                  required
                  error={titleOver ? `Over ${FIG.PLATFORM_TITLE_CHARS} — refused whole, never trimmed.` : undefined}
                  hint={`${title.length}/${FIG.PLATFORM_TITLE_CHARS}`}
                >
                  <input value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>
                <Field
                  label="Icon key"
                  hint={`Optional — left empty the stored default applies: ${FIG.NOTIFICATIONS_BROADCAST_DEFAULT_ICON}, overridable by a super administrator's stored default under Identity Delivery.`}
                >
                  <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder={FIG.NOTIFICATIONS_BROADCAST_DEFAULT_ICON} />
                </Field>
              </div>
              <Field
                label={`Message — required, at most ${FIG.NOTIFICATIONS_BROADCAST_MESSAGE_CHARS} characters`}
                required
                error={messageOver ? `Over ${FIG.NOTIFICATIONS_BROADCAST_MESSAGE_CHARS} — refused whole, never trimmed.` : undefined}
                hint={`${message.length}/${FIG.NOTIFICATIONS_BROADCAST_MESSAGE_CHARS}`}
              >
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
              </Field>
              {failureNote ? <Notice tone="error" live="polite">{failureNote}</Notice> : null}
              <div className="admin-tools">
                <Button icon="notifications" disabled={!canSend} onClick={openConfirm}>
                  Send the broadcast
                </Button>
              </div>
              {title.trim() === "" && message.trim() === "" ? (
                <p className="meta">No draft exists yet — the composer says so rather than pretending.</p>
              ) : null}
            </Card>

            <Card>
              <CardHeader title="Previewed exactly as an inbox row" icon="inbox" />
              <div className="ct-inboxrow">
                <span className="ct-inboxrow__icon" aria-hidden="true">
                  <Icon name="notifications" size={18} />
                </span>
                <div className="ct-inboxrow__body">
                  <p className="ct-inboxrow__title">{title.trim() || "—"}</p>
                  <p className="ct-inboxrow__text">{message.trim() || "—"}</p>
                  <p className="meta">System · icon key: {icon.trim() || FIG.NOTIFICATIONS_BROADCAST_DEFAULT_ICON} · just now</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="History" icon="history" eyebrow="newest first — a read-only record" />
            {history.length === 0 ? (
              <StateBlock state="empty" message="No broadcasts yet — stated as such; a fact about the platform's past." compact />
            ) : (
              <>
                <LoadedLine loaded={history.length} total={history.length} />
                <List>
                  {history.map((b) => (
                    <ListRow key={b.id} as="article">
                      <div>
                        <strong>{b.title}</strong>
                        <p className="meta">
                          {b.author} · {fmtInstant(b.createdAt)} · {b.status}
                          {b.failReason ? ` · ${b.failReason}` : ""}
                        </p>
                        <p className="meta">
                          estimated {b.estimated ?? "uncomputable"} · delivered {b.delivered} · failed {b.failed} ·
                          skipped as ineligible {b.skipped} · stopped before delivery{" "}
                          {b.stoppedBefore === null ? "unavailable" : b.stoppedBefore}
                          {b.stopRequest
                            ? ` · stop asked by ${b.stopRequest.by} at ${fmtInstant(b.stopRequest.at)} — “${b.stopRequest.why}”`
                            : ""}
                          {b.note ? ` · ${b.note}` : ""}
                        </p>
                        {b.status === "in flight" ? (
                          <div className="row">
                            <Button variant="secondary" size="sm" onClick={() => { setStopping(b); setStopWhy(""); }}>
                              Stop remaining delivery
                            </Button>
                          </div>
                        ) : null}
                        {b.status === "held" ? (
                          <div className="row">
                            <Button variant="secondary" size="sm" onClick={() => retry(b)}>Retry the send</Button>
                          </div>
                        ) : null}
                      </div>
                    </ListRow>
                  ))}
                </List>
                <p className="meta">
                  No re-send, no edit, no recall — and the record never says who received, read or
                  deleted one.
                </p>
              </>
            )}
          </Card>

          {confirming ? (
            <Dialog
              title="Send the broadcast"
              icon="alert"
              tone="destructive"
              onClose={() => setConfirming(false)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setConfirming(false)}>Cancel — sends nothing, keeps the draft</Button>
                  <Button variant="destructive" disabled={needsSecond && !ack2} onClick={send}>
                    Send — attributed to you
                  </Button>
                </>
              }
            >
              <p>
                The blast radius: at most {estimate === null ? "an uncomputable number of" : estimate}{" "}
                eligible learners — every preference is applied at delivery. What is at stake: one
                System-category announcement in each reached inbox, attributed to you, durable, and
                unstoppable only for what already delivered.
              </p>
              {needsSecond ? (
                <Field
                  label={
                    estimate === null
                      ? "The estimate could not be computed — the second acknowledgement is required rather than skipped"
                      : `At or above ${FIG.NOTIFICATIONS_BROADCAST_SECOND_CONFIRMATION_RECIPIENTS} estimated recipients — a second explicit confirmation`
                  }
                  required
                >
                  <label className="row">
                    <input type="checkbox" checked={ack2} onChange={(e) => setAck2(e.target.checked)} />
                    <span>I confirm this send a second time, knowing its scale.</span>
                  </label>
                </Field>
              ) : null}
            </Dialog>
          ) : null}

          {stopping ? (
            <Dialog
              title={`Stop remaining delivery — ${stopping.title}`}
              icon="alert"
              tone="destructive"
              onClose={() => setStopping(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setStopping(null)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => stop(stopping)}>Stop remaining delivery</Button>
                </>
              }
            >
              <p>
                Not a recall: the stop is durable before delivery workers stop claiming recipients,
                whatever is already in flight may finish, and nothing already delivered comes back or
                is overwritten. Stopped is terminal — no resume, no edit-and-resume, no re-send of
                this record.
              </p>
              <Field label="Why" hint="Recorded with the stop — who asked, when and why.">
                <input value={stopWhy} onChange={(e) => setStopWhy(e.target.value)} />
              </Field>
            </Dialog>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
