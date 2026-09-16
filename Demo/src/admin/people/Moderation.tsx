/**
 * Moderation — `users/:userId/{suspend,lift,ban,unban}`. Each act is its own
 * focused page with its own record (admin/01-pages "The moderation pages";
 * admin/05 §Moderation).
 *
 *   suspend  a duration — the short presets ADMIN_SUSPENSION_PRESET_DAYS or a
 *            custom date between ACCESS_SUSPENSION_MIN_DAYS and
 *            ACCESS_SUSPENSION_MAX_DAYS — a required reason, an optional
 *            internal note never shown to the person; the control restates in
 *            plain words when access comes back, and the page states that
 *            only platform access is affected
 *   lift     its own act with its own reason, quoting the suspension in
 *            force, reading restorative rather than destructive
 *   ban      requires a reason; reachable only from the person's own detail;
 *            ending the account's sign-ins is part of the same act
 *   unban    requires no reason — restricting must be accountable and
 *            relieving must be easy
 *
 * Every write on a person is a typed confirmation plus a reason (unban
 * excepted — relieving is easy), behind a fresh main-site handoff, and the
 * change and its record commit together or not at all. Suspending and banning
 * are blocked when the operator is the target — the control explains why.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { canPublishDirect } from "../roles";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Field } from "../../extraction/components/Field/Field";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { Notice } from "../../extraction/components/Notice/Notice";
import { KeyValueRow, KeyValueTable } from "../../extraction/components/KeyValueRow/KeyValueRow";
import {
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import { FreshHandoffGate } from "./gates";
import {
  ACCESS_SUSPENSION_MAX_DAYS,
  ACCESS_SUSPENSION_MIN_DAYS,
  ADMIN_SUSPENSION_PRESET_DAYS,
  ACTION,
  HANDOFF,
  findPerson,
  standingText,
  writeStanding,
  type ModerationEntry,
  type Standing
} from "./fixtures";
import "./people.css";

export type ModerationKind = "suspend" | "lift" | "ban" | "unban";

const KIND_ACTION: Record<ModerationKind, string> = {
  suspend: ACTION.suspend,
  lift: ACTION.lift,
  ban: ACTION.ban,
  unban: ACTION.unban
};

const KIND_TITLE: Record<ModerationKind, string> = {
  suspend: "Suspend access",
  lift: "Lift the suspension early",
  ban: "Ban this account",
  unban: "Unban this account"
};

const DAY_MS = 86_400_000;

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

function wordsFor(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function Moderation({ kind }: { kind: ModerationKind }) {
  const { userId } = useParams();
  const store = useStore();
  const person = findPerson(userId);
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused"]);

  const [preset, setPreset] = useState<number | "custom">(7);
  const [customDate, setCustomDate] = useState(isoDaysFromNow(30));
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [echo, setEcho] = useState("");
  const [recorded, setRecorded] = useState<ModerationEntry | null>(null);

  if (!person) {
    return (
      <AdminPage kicker="People" title="Person unavailable">
        <StateBlock
          state="unavailable"
          message="This person record does not resolve."
          action={<Link className="btn btn--secondary" to="/admin/users">Users</Link>}
        />
      </AdminPage>
    );
  }

  const mayWrite = canPublishDirect(store.session.role);
  const standing = person.standing;

  /* The standing gate — each page is offered only where its act exists. */
  const offered =
    kind === "suspend"
      ? standing.kind === "good"
      : kind === "lift"
        ? standing.kind === "suspended"
        : kind === "ban"
          ? standing.kind !== "banned"
          : standing.kind === "banned";

  const notOfferedReason =
    kind === "suspend"
      ? `Suspension is not offered — this person is ${standingText(standing).toLowerCase()}.`
      : kind === "lift"
        ? "No suspension is in force to lift — the act quotes the suspension in force, and there is none."
        : kind === "ban"
          ? "This account is already banned — repeating the act produces no second record."
          : "This account is not banned — relieving needs nothing lifted.";

  const selfBlocked = person.self && (kind === "suspend" || kind === "ban");

  /* Suspension dates in plain words. */
  const endIso = preset === "custom" ? customDate : isoDaysFromNow(preset);
  const customDays =
    preset === "custom" && customDate
      ? Math.round((new Date(`${customDate}T00:00:00Z`).getTime() - Date.now()) / DAY_MS)
      : null;
  const customValid =
    preset !== "custom" ||
    (customDays !== null &&
      !Number.isNaN(customDays) &&
      customDays >= ACCESS_SUSPENSION_MIN_DAYS &&
      customDays <= ACCESS_SUSPENSION_MAX_DAYS);
  const endWords = wordsFor(endIso);

  /* Unban requires no reason; the other three do. */
  const needsReason = kind !== "unban";
  const reasonOk = !needsReason || reason.trim().length > 0;
  const formOk = offered && !selfBlocked && reasonOk && (kind !== "suspend" || customValid);

  const restorative = kind === "lift" || kind === "unban";

  function record(): { standing: Standing; entry: Omit<ModerationEntry, "id"> } {
    const before = standingText(standing);
    if (kind === "suspend") {
      const after = `Suspended until ${endWords}`;
      return {
        standing: { kind: "suspended", until: endWords, reason: reason.trim() },
        entry: {
          at: "Today", actor: "This session",
          action: "Suspension set", reason: reason.trim(),
          note: note.trim() || null, before, after
        }
      };
    }
    if (kind === "lift") {
      return {
        standing: { kind: "good" },
        entry: {
          at: "Today", actor: "This session",
          action: "Suspension lifted early", reason: reason.trim(),
          note: `Quoted the suspension in force — until ${standing.until}.`,
          before, after: "In good standing"
        }
      };
    }
    if (kind === "ban") {
      return {
        standing: { kind: "banned", reason: reason.trim() },
        entry: {
          at: "Today", actor: "This session",
          action: "Ban recorded", reason: reason.trim(),
          note: "Sign-ins ended as part of the same act.",
          before, after: "Banned"
        }
      };
    }
    return {
      standing: { kind: "good" },
      entry: {
        at: "Today", actor: "This session",
        action: "Ban lifted", reason: null,
        note: "Unbanning requires no reason — restricting must be accountable and relieving must be easy.",
        before, after: "In good standing"
      }
    };
  }

  function confirm() {
    const r = record();
    writeStanding(person!.id, r.standing, r.entry, `${KIND_ACTION[kind]} — recorded`);
    setRecorded({ id: "me-new", ...r.entry });
    setReviewing(false);
    setEcho("");
  }

  return (
    <AdminPage
      kicker="People / Moderation"
      title={`${KIND_TITLE[kind]} — ${person.name}`}
      lead="A focused page, its own reason, its own record. The change and its record commit together or not at all."
      actions={<Link className="btn btn--quiet" to={`/admin/users/${person.id}`}>Back to {person.name}</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={KIND_ACTION[kind]} /> : null}
      {preview === "loaded" ? (
        <>
          {!mayWrite ? (
            <CapabilityRefusal action={KIND_ACTION[kind]} />
          ) : selfBlocked ? (
            <StateBlock
              state="refused"
              message={`${KIND_TITLE[kind]} is blocked when the operator is the target — you are viewing your own account.`}
              action={<Link className="btn btn--secondary" to={`/admin/users/${person.id}`}>Back to {person.name}</Link>}
            />
          ) : !offered ? (
            <StateBlock
              state="refused"
              message={notOfferedReason}
              action={<Link className="btn btn--secondary" to={`/admin/users/${person.id}`}>Back to {person.name}</Link>}
            />
          ) : recorded ? (
            <Card>
              <CardHeader title="The record" icon="check" eyebrow="committed with the change" />
              <KeyValueTable label="The moderation record">
                <KeyValueRow as="definition" term="Action" value={recorded.action} />
                <KeyValueRow as="definition" term="Actor" value={recorded.actor ?? "The platform — attributed to nobody"} />
                <KeyValueRow as="definition" term="Time" value={recorded.at} />
                <KeyValueRow as="definition" term="Reason" value={recorded.reason ?? "—"} />
                {recorded.note ? <KeyValueRow as="definition" term="Private note" value={recorded.note} /> : null}
                <KeyValueRow as="definition" term="Standing before" value={recorded.before} />
                <KeyValueRow as="definition" term="Standing after" value={recorded.after} />
              </KeyValueTable>
              <p className="pp-note" data-tone="ok" role="status">
                <Icon name="check" size={14} /> Recorded — {person.name} is now{" "}
                {standingText(findPerson(person.id)?.standing ?? person.standing).toLowerCase()}.
              </p>
            </Card>
          ) : (
            <Card>
              <CardHeader title={KIND_TITLE[kind]} icon={restorative ? "reset" : "lock"} eyebrow={restorative ? "restorative" : "destructive"} />
              <p className="meta">
                Current standing: {standingText(standing)}
                {standing.reason ? ` — ${standing.reason}` : ""}.
              </p>

              {kind === "suspend" ? (
                <>
                  <Notice tone="neutral" compact>
                    Only platform access is affected — the person's records, work and memberships are
                    untouched.
                  </Notice>
                  <div>
                    <p className="meta">
                      Duration — the short presets, or a custom date between {ACCESS_SUSPENSION_MIN_DAYS} and{" "}
                      {ACCESS_SUSPENSION_MAX_DAYS} days (ADMIN_SUSPENSION_PRESET_DAYS /
                      ACCESS_SUSPENSION_MIN_DAYS / ACCESS_SUSPENSION_MAX_DAYS)
                    </p>
                    <div className="row" role="group" aria-label="Suspension duration presets">
                      {ADMIN_SUSPENSION_PRESET_DAYS.map((d) => (
                        <Chip key={d} size="sm" selected={preset === d} onClick={() => setPreset(d)}>
                          {d} {d === 1 ? "day" : "days"}
                        </Chip>
                      ))}
                      <Chip size="sm" selected={preset === "custom"} onClick={() => setPreset("custom")}>
                        Custom date
                      </Chip>
                    </div>
                  </div>
                  {preset === "custom" ? (
                    <Field
                      label="Access returns on"
                      required
                      error={
                        customValid
                          ? undefined
                          : `Outside the permitted bounds — between ${ACCESS_SUSPENSION_MIN_DAYS} and ${ACCESS_SUSPENSION_MAX_DAYS} days from now.`
                      }
                    >
                      <input
                        type="date"
                        value={customDate}
                        min={isoDaysFromNow(ACCESS_SUSPENSION_MIN_DAYS)}
                        max={isoDaysFromNow(ACCESS_SUSPENSION_MAX_DAYS)}
                        onChange={(e) => setCustomDate(e.target.value)}
                      />
                    </Field>
                  ) : null}
                </>
              ) : null}

              {kind === "lift" ? (
                <Notice tone="info" compact>
                  Suspension in force — until {standing.until}: “{standing.reason}”. Lifting early is
                  its own act with its own reason, and reads restorative rather than destructive.
                </Notice>
              ) : null}

              {kind === "ban" ? (
                <Notice tone="warning" compact>
                  Ending the account's sign-ins is part of the same act — if both cannot be done,
                  neither happens. What the person then reads is the access boundary's own wording.
                </Notice>
              ) : null}

              {kind === "unban" ? (
                <Notice tone="info" compact>
                  Unbanning requires no reason — restricting must be accountable and relieving must be
                  easy.
                </Notice>
              ) : null}

              {needsReason ? (
                <Field label="Reason" required hint="An empty reason leaves the action unreachable.">
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="The required reason, stored with the record"
                  />
                </Field>
              ) : null}

              {kind === "suspend" ? (
                <Field label="Internal note" hint="Kept with the record — never shown to the person.">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional staff-only note"
                  />
                </Field>
              ) : null}

              <div className="admin-tools">
                <Button
                  variant={restorative ? "primary" : "destructive"}
                  disabled={!formOk}
                  onClick={() => setReviewing(true)}
                >
                  {kind === "suspend" ? `Suspend until ${endWords}…` : `${KIND_TITLE[kind]}…`}
                </Button>
                <Button variant="quiet" to={`/admin/users/${person.id}`}>Cancel</Button>
              </div>
              {kind === "suspend" && customValid ? (
                <p className="meta">In plain words: access returns on {endWords}.</p>
              ) : null}
            </Card>
          )}
        </>
      ) : null}

      <Dialog
        open={reviewing}
        title={KIND_TITLE[kind]}
        icon={restorative ? "reset" : "alert"}
        tone={restorative ? "default" : "destructive"}
        onClose={() => setReviewing(false)}
      >
        <p>
          {kind === "suspend"
            ? `Suspends ${person.name} until ${endWords} — access returns on ${endWords}. Only platform access is affected.`
            : kind === "lift"
              ? `Lifts the suspension in force against ${person.name} — until ${standing.until} — returning them to good standing.`
              : kind === "ban"
                ? `Bans ${person.name} and ends the account's sign-ins as part of the same act — if both cannot be done, neither happens.`
                : `Unbans ${person.name}, returning the account to good standing. No reason is required — relieving must be easy.`}
        </p>
        {needsReason ? (
          <p className="meta">
            Reason: “{reason.trim()}”{kind === "suspend" && note.trim() ? ` — internal note kept, never shown to the person.` : "."}
          </p>
        ) : null}
        <FreshHandoffGate />
        <ConfirmByTyping phrase={person.name} value={echo} onChange={setEcho}>
          {(matched) => (
            <div className="row">
              <Button variant="quiet" onClick={() => setReviewing(false)}>Cancel</Button>
              <Button
                variant={restorative ? "primary" : "destructive"}
                disabled={!matched || !reasonOk || !HANDOFF.fresh}
                onClick={confirm}
              >
                Confirm — {KIND_TITLE[kind].toLowerCase()}
              </Button>
            </div>
          )}
        </ConfirmByTyping>
      </Dialog>
    </AdminPage>
  );
}
