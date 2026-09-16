/**
 * PersonDetail — `users/:userId`. Identity and standing, headline figures,
 * progress, moderation standing and history, and every administrative action
 * taken against the person — beside an action rail grouped by stakes
 * (admin/01-pages "A person's detail").
 *
 * The identity fields are the main site's own: read-only, explicitly marked
 * as externally owned, and any change to them is refused. Membership is a
 * read-only mirror that informs and never enforces. Opening this detail, the
 * standing and the history are recorded reads — the record is what answers
 * "who looked at my data".
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock, Stat } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { canMutatePeople, canPublishDirect } from "../roles";
import { ActionRail, type ActionRailGroup } from "../../extraction/components/ActionRail/ActionRail";
import { KeyValueRow, KeyValueTable } from "../../extraction/components/KeyValueRow/KeyValueRow";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Select } from "../../extraction/components/Select/Select";
import { Field } from "../../extraction/components/Field/Field";
import { SegmentedControl } from "../../extraction/components/SegmentedControl/SegmentedControl";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  CapabilityRefusal,
  ConflictDialog,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import { FreshHandoffGate } from "./gates";
import {
  ACTION,
  GRANTABLE_ROLES,
  GRANTABLE_ROLE_LABEL,
  HANDOFF,
  findPerson,
  levelForXp,
  recordAction,
  roleLabel,
  standingText,
  writeRoles,
  type GrantableRole
} from "./fixtures";
import "./people.css";

const MEMBERSHIP_LABEL = { current: "Current", lapsed: "Lapsed", none: "None" } as const;

export function PersonDetail() {
  const { userId } = useParams();
  const store = useStore();
  const person = findPerson(userId);
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "conflict", "unverifiable"]);

  /* Role-assignment control state. */
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<GrantableRole>("moderator");
  const [roleDirection, setRoleDirection] = useState<"grant" | "remove">("grant");
  const [roleReason, setRoleReason] = useState("");
  const [roleEcho, setRoleEcho] = useState("");
  const [roleOutcome, setRoleOutcome] = useState("");

  /* The ordinary export — a recorded read before any file is produced. */
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDone, setExportDone] = useState(false);

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

  /* Every write on a person is the super administrator's at launch; the four
     recorded reads are also held by support (here: admin+). */
  const mayRead = canMutatePeople(store.session.role);
  const mayWrite = canPublishDirect(store.session.role);
  const noWrite = `This session does not hold ${ACTION.writeRole} — every write on a person is the super administrator's at launch.`;

  const suspended = person.standing.kind === "suspended";
  const banned = person.standing.kind === "banned";

  const groups: ActionRailGroup[] = [
    {
      stakes: "ordinary",
      label: "Ordinary",
      note: "Reads and navigation — nothing here writes to the person without its own page.",
      actions: [
        {
          id: "export",
          label: "Export this record",
          icon: "download",
          friction: "confirm",
          hint: "A recorded read — the record is written before any file is produced.",
          disabled: !mayRead,
          disabledReason: `This session does not hold ${ACTION.exportPerson}.`,
          onClick: () => setExportOpen(true)
        }
      ]
    },
    {
      stakes: "elevated",
      label: "Elevated",
      note: "Audited changes — the record commits inside the change.",
      actions: [
        {
          id: "role",
          label: "Grant or remove a role…",
          icon: "users",
          friction: "typed-reason",
          hint: "One named person, a reason, an audited change.",
          disabled: !mayWrite || preview === "unverifiable",
          disabledReason:
            preview === "unverifiable"
              ? "The rule set is unreadable — a role change is unreachable rather than guessed."
              : noWrite,
          onClick: () => setRoleOpen(true)
        },
        {
          id: "correction",
          label: "XP and credit correction",
          icon: "credits",
          friction: "typed-reason",
          hint: "A repair tied to its incident reference — a remedy, never a grant.",
          disabled: !mayWrite,
          disabledReason: `This session does not hold ${ACTION.correctLedger}.`,
          to: `/admin/credits/${person.id}`
        }
      ]
    },
    {
      stakes: "destructive",
      label: "Destructive",
      note: "Restrictive acts — a typed confirmation plus a reason, each on its own focused page.",
      actions: [
        ...(!banned
          ? [
              {
                id: "suspend",
                label: "Suspend access…",
                icon: "lock" as const,
                friction: "typed-reason" as const,
                hint: suspended ? "A suspension is already in force." : "Sets a suspension with its end in plain words.",
                disabled: !mayWrite || person.self || suspended,
                disabledReason: !mayWrite
                  ? noWrite
                  : person.self
                    ? "Blocked when the operator is the target — you are viewing your own account."
                    : "A suspension is already in force — lifting it early or letting it run are the acts.",
                to: `/admin/users/${person.id}/suspend`
              },
              {
                id: "ban",
                label: "Ban this account…",
                icon: "shield" as const,
                friction: "typed-reason" as const,
                hint: "Reachable only from the person's own detail — ending sign-ins is part of the same act.",
                disabled: !mayWrite || person.self,
                disabledReason: !mayWrite
                  ? noWrite
                  : "Blocked when the operator is the target — you are viewing your own account.",
                to: `/admin/users/${person.id}/ban`
              }
            ]
          : [])
      ]
    },
    {
      stakes: "restorative",
      label: "Restorative",
      note: "Relieving acts carry the opposite tone from destructive ones.",
      actions: [
        ...(suspended
          ? [
              {
                id: "lift",
                label: "Lift the suspension early…",
                icon: "reset" as const,
                friction: "typed-reason" as const,
                hint: `Quotes the suspension in force — until ${person.standing.until} — with its own reason.`,
                disabled: !mayWrite,
                disabledReason: noWrite,
                to: `/admin/users/${person.id}/lift`
              }
            ]
          : []),
        ...(banned
          ? [
              {
                id: "unban",
                label: "Unban this account…",
                icon: "check" as const,
                friction: "typed" as const,
                hint: "Relieving is easy — unbanning requires no reason.",
                disabled: !mayWrite,
                disabledReason: noWrite,
                to: `/admin/users/${person.id}/unban`
              }
            ]
          : [])
      ]
    }
  ];

  const membershipLine =
    person.membershipMirror.state === "unreadable"
      ? "The mirror cannot be read — a fact about the connection, never about the person."
      : person.membershipMirror.state === "stale"
        ? `${MEMBERSHIP_LABEL[person.membership]} — a stale mirror, read ${person.membershipMirror.age} ago`
        : `${MEMBERSHIP_LABEL[person.membership]} — the mirror is current`;

  const roleChangeValid =
    roleReason.trim().length > 0 &&
    (roleDirection === "grant" ? !person.roles.includes(roleTarget) : person.roles.includes(roleTarget));

  return (
    <AdminPage
      kicker="People"
      title={person.name}
      lead={`@${person.username} · ${person.email}`}
      actions={<Link className="btn btn--quiet" to="/admin/users">All users</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.readDetail} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          compact
          message="The rule set is unreadable — this panel renders Unavailable in the platform's own name while the rest of the page still serves."
        />
      ) : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />
      {preview === "loaded" || preview === "conflict" || preview === "unverifiable" ? (
        <>
          {person.self ? (
            <Notice tone="info" title="Your own account">
              You are viewing your own account — suspending, banning and resetting are blocked where
              the operator is the target.
            </Notice>
          ) : null}
          <p className="meta">
            Recorded reads: opening this detail, the standing and the history are each recorded
            ({ACTION.readDetail} · {ACTION.readStanding} · {ACTION.readHistory}) — the record is
            what answers who looked.
          </p>
          <div className="pp-split">
            <div className="pp-main">
              <Card>
                <CardHeader title="Identity and standing" icon="user" eyebrow="the main site owns these fields" />
                <KeyValueTable label="Identity — read-only mirror">
                  <KeyValueRow as="definition" term="Display name" value={person.name} />
                  <KeyValueRow as="definition" term="Username" value={`@${person.username}`} />
                  <KeyValueRow as="definition" term="Email" value={person.email} />
                  <KeyValueRow as="definition" term="Registration" value={person.registered} />
                  <KeyValueRow as="definition" term="Membership" value={membershipLine} />
                </KeyValueTable>
                <p className="meta">
                  Externally owned by the main site — read-only here, and any change is refused.
                  Membership informs and never enforces; nothing offers to moderate an account for
                  lapsing.
                </p>
                <p className="pp-standing" data-kind={person.standing.kind}>
                  <Icon name={person.standing.kind === "good" ? "check" : "lock"} size={15} />
                  {standingText(person.standing)}
                  {person.standing.reason ? (
                    <span className="pp-standing__reason">— {person.standing.reason}</span>
                  ) : null}
                </p>
                {person.boundaryFault ? (
                  <p className="meta">
                    Boundary fault: a projection owing a verify the main site has not answered — see
                    Identity Delivery.
                  </p>
                ) : null}
              </Card>

              <Card>
                <CardHeader title="Headline figures" icon="target" eyebrow="a figure no module publishes reads Unavailable" />
                <div className="row">
                  <Stat label="Level" value={person.xp === null ? null : levelForXp(person.xp)} icon="star" />
                  <Stat label="XP" value={person.xp} icon="zap" />
                  <Stat label="Credits" value={person.credits} icon="credits" />
                  <Stat label="Streak" value={person.streakDays} unit="days" icon="flame" />
                  <Stat label="Solved" value={person.solvedCount} icon="check" />
                </div>
              </Card>

              <Card>
                <CardHeader title="Progress" icon="courses" />
                {person.progress === null ? (
                  <StateBlock state="unavailable" compact message="No progress reading is published for staff — Unavailable in the platform's own name, never a zero." />
                ) : person.progress.length === 0 ? (
                  <StateBlock state="empty" compact message="Nothing in progress." />
                ) : (
                  <ul className="home__list">
                    {person.progress.map((row) => (
                      <li key={row.label} className="home__row">
                        <strong>{row.label}</strong> <span className="meta">{row.detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {person.enrolled.length > 0 ? (
                  <p className="meta">
                    Enrolled: {person.enrolled.map((c) => c.title).join(" · ")}
                  </p>
                ) : null}
              </Card>

              <Card>
                <CardHeader title="Moderation standing and history" icon="shield" />
                {person.moderation === null ? (
                  <StateBlock state="unavailable" compact message="The moderation history cannot be read — Unavailable, never rendered as no history." />
                ) : person.moderation.length === 0 ? (
                  <StateBlock state="empty" compact message="No moderation entries — in good standing is a statement, and it stands." />
                ) : (
                  <div className="pp-history">
                    {person.moderation.map((entry) => (
                      <div key={entry.id} className="pp-history__entry">
                        <div className="pp-history__head">
                          <strong>{entry.action}</strong>
                          <span className="pp-history__actor">
                            {entry.actor ?? "The platform — attributed to nobody"} · {entry.at}
                          </span>
                        </div>
                        <p className="pp-history__move">
                          {entry.before} → {entry.after}
                        </p>
                        {entry.reason ? <p className="meta">Reason: {entry.reason}</p> : null}
                        {entry.note ? <p className="pp-history__note">Private note: {entry.note}</p> : null}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader title="Administrative actions" icon="history" eyebrow="every act taken against this person" />
                {person.adminActions.length === 0 ? (
                  <StateBlock state="empty" compact message="No administrative action has been taken against this person." />
                ) : (
                  <div className="pp-history">
                    {person.adminActions.map((row) => (
                      <div key={row.id} className="pp-history__entry">
                        <div className="pp-history__head">
                          <strong className="pp-mono">{row.action}</strong>
                          <span className="pp-history__actor">{row.actor} · {row.at}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader title="Roles" icon="users" eyebrow="the three grantable platform roles" />
                {preview === "unverifiable" ? (
                  <StateBlock state="unavailable" compact message="The rule set is unreadable — held roles render Unavailable in the platform's own name rather than a guessed set." />
                ) : person.roles.length === 0 ? (
                  <p className="meta">No role held — a learner.</p>
                ) : (
                  <div className="row">
                    {person.roles.map((r) => (
                      <Chip key={r} variant="quiet" size="sm">{roleLabel(r)}</Chip>
                    ))}
                  </div>
                )}
                <p className="meta">
                  Content author, moderator and support are granted here, each to one named person
                  with a reason by a super administrator — super administrator itself is granted
                  nowhere inside. Every change is an audited change.
                </p>
                {mayWrite && preview !== "unverifiable" ? (
                  <div className="admin-tools">
                    <Button variant="secondary" onClick={() => setRoleOpen(true)}>Grant or remove a role…</Button>
                  </div>
                ) : mayWrite ? (
                  <StateBlock state="unavailable" compact message="The rule set is unreadable — the change stays unreachable rather than guessing a set." />
                ) : (
                  <StateBlock state="refused" compact message={`This session does not hold ${ACTION.writeRole} — the change stays unreachable.`} />
                )}
                {roleOutcome ? <p className="pp-note" data-tone="ok" role="status"><Icon name="check" size={14} /> {roleOutcome}</p> : null}
              </Card>
            </div>

            <div>
              <ActionRail groups={groups} label={`Actions on ${person.name}`} />
            </div>
          </div>
        </>
      ) : null}

      {/* The ordinary confirm — the recorded export. */}
      <Dialog
        open={exportOpen}
        title={`Export ${person.name}'s record`}
        icon="download"
        onClose={() => setExportOpen(false)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setExportOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                recordAction(person.id, `${ACTION.exportPerson} — recorded before any file was produced`);
                setExportDone(true);
                setExportOpen(false);
              }}
            >
              Confirm export
            </Button>
          </>
        }
      >
        <p>
          An export is a recorded read: the record is written before any file is produced, because
          the record is what answers <em>who looked at my data</em>.
        </p>
      </Dialog>
      {exportDone ? (
        <p className="pp-note" data-tone="ok" role="status">
          <Icon name="check" size={14} /> Export recorded — the read is on this person's trail.
        </p>
      ) : null}

      {/* Role assignment — an audited change behind the third tier. */}
      <Dialog
        open={roleOpen}
        title={`Roles — ${person.name}`}
        icon="users"
        onClose={() => setRoleOpen(false)}
      >
        <FormGridRole
          roleTarget={roleTarget}
          setRoleTarget={setRoleTarget}
          roleDirection={roleDirection}
          setRoleDirection={setRoleDirection}
          roleReason={roleReason}
          setRoleReason={setRoleReason}
          held={person.roles}
        />
        <ConfirmByTyping phrase={person.name} value={roleEcho} onChange={setRoleEcho}>
          {(matched) => (
            <div className="row">
              <Button variant="quiet" onClick={() => setRoleOpen(false)}>Cancel</Button>
              <Button
                disabled={!matched || !roleChangeValid || !HANDOFF.fresh}
                onClick={() => {
                  const next =
                    roleDirection === "grant"
                      ? [...person.roles.filter((r) => r !== roleTarget), roleTarget]
                      : person.roles.filter((r) => r !== roleTarget);
                  writeRoles(
                    person.id,
                    next,
                    `${ACTION.writeRole} — ${GRANTABLE_ROLE_LABEL[roleTarget].toLowerCase()} ${roleDirection === "grant" ? "granted" : "removed"} — reason recorded`
                  );
                  setRoleOutcome(`An audited change: ${GRANTABLE_ROLE_LABEL[roleTarget]} ${roleDirection === "grant" ? "granted to" : "removed from"} ${person.name}.`);
                  setRoleOpen(false);
                  setRoleEcho("");
                  setRoleReason("");
                }}
              >
                Confirm the change
              </Button>
            </div>
          )}
        </ConfirmByTyping>
        <FreshHandoffGate />
      </Dialog>
    </AdminPage>
  );
}

/** The role picker's form half — role, direction, required reason. */
function FormGridRole({
  roleTarget,
  setRoleTarget,
  roleDirection,
  setRoleDirection,
  roleReason,
  setRoleReason,
  held
}: {
  roleTarget: GrantableRole;
  setRoleTarget: (r: GrantableRole) => void;
  roleDirection: "grant" | "remove";
  setRoleDirection: (d: "grant" | "remove") => void;
  roleReason: string;
  setRoleReason: (r: string) => void;
  held: string[];
}) {
  return (
    <div className="pp-roleform">
      <Field label="Role" hint="The filter enumerates the configured roles; the grantable three are offered here.">
        <Select
          value={roleTarget}
          onChange={(v) => setRoleTarget(v as GrantableRole)}
          options={GRANTABLE_ROLES.map((r) => ({ value: r, label: `${GRANTABLE_ROLE_LABEL[r]}${held.includes(r) ? " — held" : ""}` }))}
        />
      </Field>
      <SegmentedControl
        label="Grant or remove"
        value={roleDirection}
        onChange={(v) => setRoleDirection(v as "grant" | "remove")}
        options={[
          { id: "grant", label: "Grant" },
          { id: "remove", label: "Remove" }
        ]}
      />
      <Field label="Reason" required hint="An empty reason leaves the action unreachable.">
        <input value={roleReason} onChange={(e) => setRoleReason(e.target.value)} placeholder="Why this role change" />
      </Field>
    </div>
  );
}
