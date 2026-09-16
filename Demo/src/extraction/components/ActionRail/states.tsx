/**
 * ActionRail state matrix for the Kitchen Sink — the stakes groups and the
 * inert-with-reason item, rendered against the person-detail use case.
 */
import type { ReactNode } from "react";
import { ActionRail } from "./ActionRail";

const FULL: Parameters<typeof ActionRail>[0]["groups"] = [
  {
    stakes: "ordinary",
    label: "Ordinary",
    note: "Reads and navigation — nothing here writes to the person.",
    actions: [
      { id: "export", label: "Export this record", hint: "Recorded before any file is produced.", icon: "download", friction: "confirm", onClick: () => {} }
    ]
  },
  {
    stakes: "elevated",
    label: "Elevated",
    note: "Audited changes — the record is inside the change.",
    actions: [
      { id: "role", label: "Grant or remove a role…", hint: "One named person, a reason, an audited change.", icon: "users", friction: "typed-reason", onClick: () => {} },
      { id: "correction", label: "XP and credit correction", hint: "A repair tied to its incident reference.", icon: "credits", friction: "typed-reason", to: "/admin/credits/u-yash" }
    ]
  },
  {
    stakes: "destructive",
    label: "Destructive",
    note: "Restrictive acts — typed confirmation plus a reason.",
    actions: [
      { id: "suspend", label: "Suspend access…", hint: "Sets a suspension with its end in plain words.", icon: "lock", friction: "typed-reason", to: "/admin/users/u-yash/suspend" },
      { id: "ban", label: "Ban this account…", hint: "Reachable only from the person's own detail.", icon: "shield", friction: "typed-reason", to: "/admin/users/u-yash/ban" }
    ]
  },
  {
    stakes: "restorative",
    label: "Restorative",
    note: "Relieving acts — the opposite tone from destructive.",
    actions: [
      { id: "lift", label: "Lift the suspension early…", hint: "Quotes the suspension in force; its own reason.", icon: "reset", friction: "typed-reason", to: "/admin/users/u-yash/lift" },
      { id: "unban", label: "Unban this account…", hint: "Relieving is easy — no reason is required.", icon: "check", friction: "typed", to: "/admin/users/u-yash/unban" }
    ]
  }
];

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "all-stakes",
    label: "All four stakes groups",
    render: () => <ActionRail groups={FULL} label="Actions on this person" />
  },
  {
    key: "disabled-reason",
    label: "Inert item states why (operator is the target)",
    render: () => (
      <ActionRail
        label="Actions on this person"
        groups={[
          {
            stakes: "destructive",
            label: "Destructive",
            actions: [
              {
                id: "suspend",
                label: "Suspend access…",
                icon: "lock",
                friction: "typed-reason",
                disabled: true,
                disabledReason: "Blocked when the operator is the target — you are viewing your own account."
              }
            ]
          },
          {
            stakes: "restorative",
            label: "Restorative",
            actions: [
              { id: "unban", label: "Unban this account…", icon: "check", friction: "typed", to: "/admin/users/u-yash/unban" }
            ]
          }
        ]}
      />
    )
  },
  {
    key: "ordinary-only",
    label: "Single group — absent groups render nothing",
    render: () => (
      <ActionRail
        groups={[
          { stakes: "ordinary", label: "Ordinary", actions: [{ id: "export", label: "Export this record", icon: "download", friction: "confirm", onClick: () => {} }] },
          { stakes: "destructive", label: "Destructive", actions: [] }
        ]}
      />
    )
  }
];
