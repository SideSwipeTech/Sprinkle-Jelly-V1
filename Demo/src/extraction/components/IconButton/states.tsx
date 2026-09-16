/**
 * IconButton state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { IconButton } from "./IconButton";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "default",
    label: "Default — close",
    render: () => <IconButton icon="x" label="Close" />
  },
  {
    key: "badge",
    label: "With badge — 3 unread",
    render: () => <IconButton icon="notifications" label="Notifications" badge={3} badgeLabel="3 unread" />
  },
  {
    key: "expanded",
    label: "Expanded — popover trigger",
    render: () => <IconButton icon="sticky-note" label="Quick Notes" expanded />
  },
  {
    key: "active",
    label: "On — data-on toggle",
    render: () => <IconButton icon="settings" label="Settings" active />
  },
  {
    key: "disabled",
    label: "Disabled — companion dismiss",
    render: () => <IconButton icon="x" label="Dismiss message" disabled iconSize={14} />
  }
];
