/**
 * ProgressReset — Operations › progress-reset (admin pages: "Progress reset").
 *
 * Nine independently selectable scopes, an exact counted blast radius — never
 * an estimate — and one durable operation reporting per-scope progress. A
 * super-administrator act: a reason and a typed confirmation, the confirm
 * enumerating every selected scope and repeating that it is permanent. A count
 * that cannot be produced blocks the confirmation.
 *
 * The promise is stated three separate times — on the page, in its own
 * notice, and on the outcome: a reset never revokes earned XP or level.
 */

import { useEffect, useState } from "react";
import { Card, CardHeader, StateBlock, Stat } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Button } from "../../extraction/components/Button/Button";
import { Notice } from "../../extraction/components/Notice/Notice";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import {
  CapabilityRefusal,
  NotVerifiableNote,
  PreviewBar,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../assessments/shared";
import { RESET_SCOPES, RESET_SURVIVORS, blastRadius, recordAudit } from "./fixtures";
import "./governance.css";

type StepStatus = "pending" | "running" | "succeeded" | "failed";

interface OpScope {
  scopeId: string;
  status: StepStatus;
  /** The exact count this scope is converging on. */
  count: number;
  attempts: number;
}

interface Operation {
  id: string;
  person: string;
  scopes: OpScope[];
  done: boolean;
}

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused", "unverifiable"];

/** A step that fails retries safely within bounds — the fixture fails the
 *  skill-evidence step once so the bounded retry renders for real. */
const FLAKY_SCOPE = "skill-evidence";
const MAX_ATTEMPTS = 2;

export function ProgressReset() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [personId, setPersonId] = useState(store.adminUsers[0]?.id ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [op, setOp] = useState<Operation | null>(null);

  const person = store.adminUsers.find((u) => u.id === personId);
  const isSuper = store.session.role === "superadmin";
  /* The preview's unverifiable state is the count that cannot be produced. */
  const countable = preview !== "unverifiable";

  /* The durable operation converges scope by scope: pending → running →
     succeeded; a failed step retries within bounds and a step that succeeded
     is never applied twice. */
  useEffect(() => {
    if (!op || op.done) return;
    const timer = setTimeout(() => {
      setOp((current) => {
        if (!current || current.done) return current;
        const scopes = current.scopes.map((s) => ({ ...s }));
        const active = scopes.find((s) => s.status === "running");
        if (active) {
          if (active.scopeId === FLAKY_SCOPE && active.attempts === 1) {
            active.status = "failed";
          } else {
            active.status = "succeeded";
          }
          return { ...current, scopes };
        }
        const retry = scopes.find((s) => s.status === "failed" && s.attempts < MAX_ATTEMPTS);
        const next = retry ?? scopes.find((s) => s.status === "pending");
        if (next) {
          next.status = "running";
          next.attempts += 1;
          return { ...current, scopes };
        }
        return { ...current, scopes, done: true };
      });
    }, 550);
    return () => clearTimeout(timer);
  }, [op]);

  if (preview === "loading") {
    return (
      <AdminPage kicker="Operations" title="Progress reset">
        <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
        <StudioLoading />
      </AdminPage>
    );
  }

  const countsKnown = (scopeId: string) => countable && person !== undefined
    ? blastRadius(person.id, scopeId)
    : null;

  const selectedScopes = RESET_SCOPES.filter((s) => picked.includes(s.id));
  const uncountable = selectedScopes.filter((s) => countsKnown(s.id) === null);
  const total = selectedScopes.reduce((sum, s) => sum + (countsKnown(s.id) ?? 0), 0);
  const canConfirm =
    isSuper &&
    op === null &&
    selectedScopes.length > 0 &&
    uncountable.length === 0 &&
    reason.trim().length >= 4;

  function confirmReset() {
    if (!person || !canConfirm) return;
    const scopes: OpScope[] = selectedScopes.map((s) => ({
      scopeId: s.id,
      status: "pending",
      count: countsKnown(s.id) ?? 0,
      attempts: 0
    }));
    setOp({ id: `reset-${Date.now()}`, person: person.name, scopes, done: false });
    recordAudit(
      `Progress reset confirmed for ${person.name} (${person.id}) — permanent; scopes: ${selectedScopes
        .map((s) => s.title)
        .join("; ")} — reason: ${reason.trim()}`
    );
  }

  const opDone = op?.done ?? false;
  const opFailedScope = op?.scopes.find((s) => s.status === "failed");
  const opTouched = op?.scopes.filter((s) => s.status === "succeeded" && s.count > 0) ?? [];

  return (
    <AdminPage
      kicker="Operations"
      title="Progress reset"
      lead="Nine independently selectable scopes, an exact counted blast radius, and one durable operation reporting per-scope progress. A reset never revokes earned XP or level — only progress records go."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "refused" ? <CapabilityRefusal action="the progress-reset capability" /> : null}

      {preview === "loaded" || preview === "unverifiable" ? (
        <>
          <Card>
            <CardHeader title="Person and scopes" icon="reset" />
            <Field label="Person" hint="The reset scopes one person's progress — never identity or access.">
              <Select
                value={personId}
                onChange={(v) => {
                  setPersonId(v);
                  setPicked([]);
                  setReason("");
                  setTyped("");
                  setOp(null);
                }}
                options={store.adminUsers.map((u) => ({ value: u.id, label: `${u.name} · ${u.email}` }))}
              />
            </Field>
            <p className="meta">
              Select any of the nine scopes — each is independently selectable, and the operation
              covers exactly the confirmed scopes and no more.
            </p>
            <div className="gov-scopes" role="group" aria-label="Reset scopes">
              {RESET_SCOPES.map((scope) => {
                const count = countsKnown(scope.id);
                const on = picked.includes(scope.id);
                return (
                  <label key={scope.id} className="gov-scope" data-on={on || undefined}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={op !== null}
                      onChange={() =>
                        setPicked((prev) =>
                          on ? prev.filter((id) => id !== scope.id) : [...prev, scope.id]
                        )
                      }
                    />
                    <span className="gov-scope__body">
                      <span className="gov-scope__title">{scope.title}</span>
                      <span className="gov-scope__covers">{scope.covers}</span>
                    </span>
                    <span className="gov-scope__count" data-unavailable={count === null || undefined}>
                      {count === null ? "unavailable" : `${count} record${count === 1 ? "" : "s"}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </Card>

          <Notice tone="warning" title="What a reset never touches">
            A reset never revokes earned XP or level — only progress records go. Also surviving every
            scope: {RESET_SURVIVORS.slice(1).join("; ")}.
          </Notice>

          <Card>
            <CardHeader title="Blast radius" icon="target" eyebrow="exact counts, never an estimate" />
            {selectedScopes.length === 0 ? (
              <StateBlock state="empty" message="Select at least one scope — the blast radius counts exactly the confirmed scopes." />
            ) : (
              <>
                <p className="meta">
                  Counted for {person?.name ?? "—"} under the same authorization, filters and snapshot
                  the reset itself will use — snapshot of this visit.
                </p>
                {!countable ? (
                  <NotVerifiableNote subject="The blast radius" />
                ) : uncountable.length > 0 ? (
                  <StateBlock
                    state="unavailable"
                    message={`No count could be produced for ${uncountable
                      .map((s) => s.title)
                      .join(", ")} under this snapshot — the destructive confirmation is blocked.`}
                  />
                ) : (
                  <div className="admin-health">
                    <div className="admin-health__cell">
                      <Stat label="Records across the selected scopes" value={total} />
                    </div>
                    <div className="admin-health__cell">
                      <Stat label="Scopes selected" value={selectedScopes.length} unit="of 9" />
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {op === null ? (
            <Card>
              <CardHeader title="Confirm — permanent" icon="alert" />
              {!isSuper ? (
                <StateBlock
                  state="refused"
                  message="A progress reset is a super-administrator act. This session's role cannot confirm one — the scopes above stay a read-only count."
                />
              ) : (
                <>
                  <p className="meta">
                    The confirm enumerates every selected scope. This is permanent — the records the
                    counted blast radius names go, and they do not come back.
                  </p>
                  {selectedScopes.length > 0 ? (
                    <ul className="home__list">
                      {selectedScopes.map((s) => (
                        <li key={s.id} className="home__row">
                          {s.title} — {countsKnown(s.id) ?? "—"} records
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Field
                    label="Reason"
                    hint="Required — it writes to a person, so the reason is captured with the record."
                  >
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      placeholder="Why this person's progress is being reset"
                    />
                  </Field>
                  {person ? (
                    <ConfirmByTyping
                      phrase={person.name}
                      value={typed}
                      onChange={setTyped}
                      label={
                        <>
                          Type <code className="x-confirm__phrase">{person.name}</code> to confirm the
                          permanent reset
                        </>
                      }
                    >
                      {(matched) => (
                        <Button
                          variant="destructive"
                          icon="alert"
                          disabled={!matched || !canConfirm}
                          onClick={confirmReset}
                        >
                          Reset progress permanently
                        </Button>
                      )}
                    </ConfirmByTyping>
                  ) : null}
                  {!canConfirm && selectedScopes.length > 0 ? (
                    <p className="meta" role="status">
                      The action stays unreachable until every selected scope has an exact count and
                      the reason is captured.
                    </p>
                  ) : null}
                </>
              )}
            </Card>
          ) : (
            <Card live>
              <CardHeader
                title={opDone ? "Operation — final" : "Operation — running"}
                icon="history"
                eyebrow="one durable operation"
              />
              <p className="meta">
                The confirmed scopes converge independently; a step that succeeded is never applied
                twice, and repeating the confirmation adds nothing and never widens the scope.
              </p>
              <div className="gov-ops">
                {op.scopes.map((s) => {
                  const scope = RESET_SCOPES.find((r) => r.id === s.scopeId);
                  return (
                    <div key={s.scopeId} className="gov-op" data-status={s.status}>
                      <span className="gov-op__title">{scope?.title ?? s.scopeId}</span>
                      <span className="gov-op__detail">
                        {s.status === "failed"
                          ? `failed — retrying within bounds (attempt ${s.attempts + 1} of ${MAX_ATTEMPTS})`
                          : s.status === "succeeded"
                            ? `${s.count} record${s.count === 1 ? "" : "s"} reset${s.attempts > 1 ? ` · attempt ${s.attempts}` : ""}`
                            : s.status === "running"
                              ? `running — attempt ${s.attempts}`
                              : "pending"}
                      </span>
                      <Chip size="sm" variant={s.status === "failed" ? "default" : "quiet"}>
                        {s.status}
                      </Chip>
                    </div>
                  );
                })}
              </div>
              {opDone ? (
                opFailedScope ? (
                  <StateBlock
                    state="unavailable"
                    message={`Incomplete — never reported as a completed reset. The failed domain is ${RESET_SCOPES.find((r) => r.id === opFailedScope.scopeId)?.title}; its failure undoes nothing that succeeded, and an exhausted retry is an operational incident.`}
                  />
                ) : (
                  <Notice tone="success" title="Outcome" live="polite">
                    Every requested scope reached its declared result. A reset never revokes earned XP
                    or level; the permanent solve facts, reward identities, economy ledger,
                    certificates, notes, files and achievements were not touched. The learner is told
                    once — the reset notice goes only after the complete requested scope is consistent
                    {opTouched.length > 0
                      ? `, naming ${opTouched.length} scope${opTouched.length === 1 ? "" : "s"} that touched at least one record`
                      : "; this reset touched no record, so no notice is produced"}
                    .
                  </Notice>
                )
              ) : null}
            </Card>
          )}
        </>
      ) : null}
    </AdminPage>
  );
}
