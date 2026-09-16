/**
 * DataLifecycle — Governance › lifecycle (admin pages: "Governance, Data
 * Lifecycle").
 *
 * Two distinct views of one destination: legal holds, listed per person newest
 * first with placing and releasing; and the deletion queue, read-only.
 *
 * A hold names its subject, the exact data it covers, its reason, the
 * individual who authorized it, when it began, when it is next reviewed and
 * when it ended — never a general keep-everything switch. Releasing the last
 * active hold returns that person's parked deletions to pending in the same
 * act, and release is safe to repeat: releasing one already released reports
 * that nothing was released.
 *
 * The queue is visibility, not a gate: every request newest first with status,
 * source, timestamps, scheduled start where one applies and the last error —
 * and no approve, confirm, reject or release control on a learner-initiated
 * request. Held and failed never render alike.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { canMutatePeople } from "../roles";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Button } from "../../extraction/components/Button/Button";
import { Notice } from "../../extraction/components/Notice/Notice";
import { SegmentedControl } from "../../extraction/components/SegmentedControl/SegmentedControl";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { DataTable } from "../../extraction/components/DataTable/DataTable";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../assessments/shared";
import {
  DELETION_QUEUE,
  DEMO_NOW,
  LEGAL_HOLDS,
  RETENTION_HOLD_REVIEW_DAYS,
  daysOld,
  displayDay,
  recordAudit,
  type DeletionRequest,
  type LegalHold
} from "./fixtures";
import "./governance.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];

const STATUS_LABEL: Record<DeletionRequest["status"], string> = {
  pending: "pending",
  running: "erasure in progress",
  held: "held — parked by a hold",
  failed: "failed",
  completed: "completed"
};

export function DataLifecycle() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [view, setView] = useState<"holds" | "queue">("holds");
  const [holds, setHolds] = useState<LegalHold[]>(LEGAL_HOLDS);
  const [queue, setQueue] = useState<DeletionRequest[]>(DELETION_QUEUE);
  const [placing, setPlacing] = useState(false);
  const [placePersonId, setPlacePersonId] = useState(store.adminUsers[0]?.id ?? "");
  const [covers, setCovers] = useState("");
  const [placeReason, setPlaceReason] = useState("");
  const [placeTyped, setPlaceTyped] = useState("");
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [releaseReason, setReleaseReason] = useState("");
  const [releaseTyped, setReleaseTyped] = useState("");
  const [outcome, setOutcome] = useState("");

  const canWrite = canMutatePeople(store.session.role);
  const sortedHolds = [...holds].sort((a, b) => b.beganEpoch - a.beganEpoch);
  const placePerson = store.adminUsers.find((u) => u.id === placePersonId);

  const statusCounts = queue.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const unfinished = queue.filter((r) => r.status !== "completed");
  const oldest = unfinished.length
    ? Math.min(...unfinished.map((r) => r.requestedEpoch))
    : null;

  function placeHold() {
    if (!placePerson || !covers.trim() || placeReason.trim().length < 4) return;
    const hold: LegalHold = {
      id: `LH-2026-${String(holds.length + 12).padStart(3, "0")}`,
      person: placePerson.name,
      personRef: placePerson.id,
      covers: covers.trim(),
      reason: placeReason.trim(),
      authorizedBy: store.session.name,
      began: displayDay(DEMO_NOW),
      beganEpoch: DEMO_NOW,
      nextReview: displayDay(DEMO_NOW + RETENTION_HOLD_REVIEW_DAYS * 86_400_000),
      ended: null
    };
    setHolds([hold, ...holds]);
    recordAudit(`Legal hold ${hold.id} placed — ${hold.personRef} · ${hold.person} — reason: ${hold.reason}`);
    setOutcome(`${hold.id} placed on ${hold.person} — it suspends only matching deletion and nothing else. Next review ${hold.nextReview}.`);
    setPlacing(false);
    setCovers("");
    setPlaceReason("");
    setPlaceTyped("");
  }

  function releaseHold(hold: LegalHold) {
    if (hold.ended) {
      /* Safe to repeat — reported, never an error and never claimed success. */
      setOutcome(`${hold.id} was already released — nothing was released.`);
      return;
    }
    const stillActive = holds.some((h) => h.id !== hold.id && h.personRef === hold.personRef && !h.ended);
    const parked = queue.filter((q) => q.personRef === hold.personRef && q.status === "held");
    const nextHolds = holds.map((h) => (h.id === hold.id ? { ...h, ended: displayDay(DEMO_NOW) } : h));
    setHolds(nextHolds);
    if (!stillActive && parked.length > 0) {
      const ids = new Set(parked.map((q) => q.id));
      setQueue(
        queue.map((q) =>
          ids.has(q.id)
            ? { ...q, status: "pending", step: "resumed — the last matching hold was released", updated: displayDay(DEMO_NOW) }
            : q
        )
      );
      setOutcome(
        `${hold.id} released — the last active hold for ${hold.person}. ${parked.length} parked deletion${parked.length === 1 ? "" : "s"} returned to pending in the same act.`
      );
    } else {
      setOutcome(`${hold.id} released.`);
    }
    recordAudit(`Released legal hold ${hold.id} — ${hold.personRef} · ${hold.person} — reason: ${releaseReason.trim()}`);
    setReleasingId(null);
    setReleaseReason("");
    setReleaseTyped("");
  }

  if (preview === "loading") {
    return (
      <AdminPage kicker="Governance" title="Data lifecycle">
        <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
        <StudioLoading />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      kicker="Governance"
      title="Data lifecycle"
      lead="Two distinct views of one destination: legal holds, per person newest first, and the deletion queue — read-only."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "refused" ? <CapabilityRefusal action="the data-lifecycle read" /> : null}

      {preview === "loaded" ? (
        <>
          <SegmentedControl
            label="Lifecycle views"
            value={view}
            onChange={(v) => setView(v as "holds" | "queue")}
            options={[
              { id: "holds", label: "Legal holds", icon: "lock" },
              { id: "queue", label: "Deletion queue", icon: "history" }
            ]}
          />

          {view === "holds" ? (
            <Card>
              <CardHeader
                title="Legal holds"
                icon="lock"
                eyebrow="per person · newest first"
                action={
                  canWrite ? (
                    <Button variant="secondary" size="sm" icon="plus" onClick={() => setPlacing((v) => !v)}>
                      Place a hold
                    </Button>
                  ) : undefined
                }
              />
              <p className="meta">
                Each hold names its subject, the exact data it covers, its reason, the individual who
                authorized it, when it began, when it is next reviewed and when it ended. Reviewed at
                least every RETENTION_HOLD_REVIEW_DAYS ({RETENTION_HOLD_REVIEW_DAYS} days) — never
                indefinite without a renewed recorded basis.
              </p>

              {placing ? (
                <div className="admin-action-panel">
                  <p className="micro">Place a legal hold</p>
                  <Field label="Person" hint="The hold names one person — its subject.">
                    <Select
                      value={placePersonId}
                      onChange={setPlacePersonId}
                      options={store.adminUsers.map((u) => ({ value: u.id, label: `${u.name} · ${u.email}` }))}
                    />
                  </Field>
                  <Field label="Exact data covered" hint="Never a general keep-everything switch.">
                    <input
                      value={covers}
                      onChange={(e) => setCovers(e.target.value)}
                      placeholder="e.g. Matching assessment records only"
                    />
                  </Field>
                  <Field label="Reason" hint="Required — a written reason, captured with the hold.">
                    <textarea
                      value={placeReason}
                      onChange={(e) => setPlaceReason(e.target.value)}
                      rows={2}
                      placeholder="e.g. Documented legal request L-2026-…"
                    />
                  </Field>
                  {placePerson ? (
                    <ConfirmByTyping
                      phrase={placePerson.name}
                      value={placeTyped}
                      onChange={setPlaceTyped}
                      label={
                        <>
                          Type <code className="x-confirm__phrase">{placePerson.name}</code> to place
                          the hold — it writes to a person
                        </>
                      }
                    >
                      {(matched) => (
                        <Button
                          variant="primary"
                          disabled={
                            !matched || !covers.trim() || placeReason.trim().length < 4
                          }
                          onClick={placeHold}
                        >
                          Place legal hold
                        </Button>
                      )}
                    </ConfirmByTyping>
                  ) : null}
                </div>
              ) : null}

              {sortedHolds.length === 0 ? (
                <StateBlock state="empty" message="No legal holds." />
              ) : (
                <div className="list">
                  {sortedHolds.map((h) => (
                    <article key={h.id} className="list-row">
                      <div>
                        <strong>
                          {h.person} <span className="meta">{h.personRef}</span>
                        </strong>
                        <p className="meta">
                          {h.id} · {h.covers} · authorized by {h.authorizedBy} · began {h.began}
                          {h.ended ? ` · ended ${h.ended}` : ` · next review ${h.nextReview}`}
                        </p>
                        <p className="meta">Reason: {h.reason}</p>
                        {releasingId === h.id ? (
                          <div className="admin-action-panel">
                            <Field label="Reason for release" hint="Required — captured with the record.">
                              <input
                                value={releaseReason}
                                onChange={(e) => setReleaseReason(e.target.value)}
                                placeholder="e.g. Basis expired — review date reached"
                              />
                            </Field>
                            <ConfirmByTyping
                              phrase={h.person}
                              value={releaseTyped}
                              onChange={setReleaseTyped}
                              label={
                                <>
                                  Type <code className="x-confirm__phrase">{h.person}</code> to
                                  release — it writes to a person
                                </>
                              }
                            >
                              {(matched) => (
                                <Button
                                  variant="primary"
                                  disabled={!matched || releaseReason.trim().length < 4}
                                  onClick={() => releaseHold(h)}
                                >
                                  Release hold
                                </Button>
                              )}
                            </ConfirmByTyping>
                          </div>
                        ) : null}
                      </div>
                      {h.ended ? (
                        <span className="row">
                          <Chip size="sm" variant="quiet">released {h.ended}</Chip>
                          {canWrite ? (
                            <Button variant="quiet" size="sm" onClick={() => releaseHold(h)}>
                              Release again
                            </Button>
                          ) : null}
                        </span>
                      ) : canWrite ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setReleasingId(h.id);
                            setReleaseTyped("");
                            setReleaseReason("");
                          }}
                        >
                          Release…
                        </Button>
                      ) : (
                        <Chip size="sm" variant="quiet">active</Chip>
                      )}
                    </article>
                  ))}
                </div>
              )}
              {!canWrite ? (
                <p className="meta">Placing and releasing holds writes to a person — the current role cannot.</p>
              ) : null}
            </Card>
          ) : (
            <Card>
              <CardHeader title="Deletion queue" icon="history" eyebrow="read-only · newest first" />
              <div className="row">
                {(["pending", "running", "held", "failed", "completed"] as const).map((s) => (
                  <Chip key={s} size="sm" variant="quiet">
                    {STATUS_LABEL[s]} {statusCounts[s] ?? 0}
                  </Chip>
                ))}
                <Chip size="sm" variant="accent">
                  oldest unfinished:{" "}
                  {unfinished.length === 0
                    ? "none"
                    : oldest === null
                      ? "unavailable"
                      : `${daysOld(oldest)} days`}
                </Chip>
              </div>
              <Notice tone="neutral" compact>
                Read-only visibility, not a gate — no approve, confirm, reject or release control on a
                learner-initiated request; it becomes actionable by itself once
                RETENTION_ERASURE_CANCEL_DAYS have elapsed. Held and failed never render alike, and an
                unfinished account reports erasure in progress, never erased.
              </Notice>
              <DataTable
                label="Deletion queue"
                columns={["Request", "Source", "Status", "Requested", "Scheduled start", "Step · last error"]}
                rows={queue.map((r) => ({
                  key: r.id,
                  cells: [
                    <>
                      <strong>{r.id}</strong>
                      <div className="meta">{r.personRef} · {r.person}</div>
                    </>,
                    r.source,
                    <span className={`gov-dq gov-dq--${r.status}`}>{STATUS_LABEL[r.status]}</span>,
                    <>
                      {r.requested}
                      <div className="meta">updated {r.updated}</div>
                    </>,
                    r.scheduledStart ?? "—",
                    <>
                      {r.step}
                      {r.lastError ? <div className="meta">{r.lastError}</div> : null}
                    </>
                  ]
                }))}
              />
              <LoadedLine loaded={queue.length} total={queue.length} />
              <Notice tone="info" compact title="Destructive retention">
                The current retention pass is a rehearsal — it counts everything and destroys nothing.
                Its destructive step waits on the owner's signature on the report; that wait concerns
                retention deletion only, never account erasure — the erasure pass launches in full
                without it.
              </Notice>
            </Card>
          )}

          {outcome ? (
            <Notice tone="success" live="polite">
              {outcome}
            </Notice>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
