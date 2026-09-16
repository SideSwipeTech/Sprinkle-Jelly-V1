/**
 * HeaderMenu state matrix.
 */

import type { ReactNode } from "react";
import { HeaderMenu } from "./HeaderMenu";

const ITEMS = [
  { id: "n1", title: "Streak saved", body: "Your 12-day streak carried into today.", unread: true },
  { id: "n2", title: "Review queue moved", body: "Two submissions returned to you.", unread: true },
  { id: "n3", title: "New challenge", body: "A fresh systems challenge is live.", unread: false }
];

const markRead = (
  <button type="button" className="x-btn x-btn--quiet x-btn--sm">
    Mark read
  </button>
);

const viewAll = <a href="#/notifications">View all notifications →</a>;

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "closed",
    label: "Closed — unread badge on trigger",
    render: () => (
      <HeaderMenu
        icon="notifications"
        label="Notifications"
        badge={2}
        title="Notifications"
        items={ITEMS}
      />
    )
  },
  {
    key: "open-unread",
    label: "Open — unread rows tinted",
    render: () => (
      <HeaderMenu
        icon="notifications"
        label="Notifications"
        badge={2}
        title="Notifications (2 new)"
        action={markRead}
        items={ITEMS}
        footer={viewAll}
        defaultOpen
      />
    )
  },
  {
    key: "open-read",
    label: "Open — all read (no badge)",
    render: () => (
      <HeaderMenu
        icon="notifications"
        label="Notifications"
        title="Notifications"
        items={ITEMS.map((i) => ({ ...i, unread: false }))}
        footer={viewAll}
        defaultOpen
      />
    )
  },
  {
    key: "empty",
    label: "Empty — honest absence",
    render: () => (
      <HeaderMenu
        icon="notifications"
        label="Notifications"
        title="Notifications"
        items={[]}
        emptyMessage="No notifications yet."
        defaultOpen
      />
    )
  }
];
