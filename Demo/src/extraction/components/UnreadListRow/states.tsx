/**
 * UnreadListRow — state matrix for the Kitchen Sink.
 * Source: Account.tsx:72-88 (/notifications).
 */

import type { ReactNode } from "react";
import { UnreadListRow } from "./UnreadListRow";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "unread",
    label: "Unread — accent edge + NEW marker",
    render: () => (
      <UnreadListRow unread title="Mock paper M-209 graded" meta="2h ago">
        Your scorecard is on this device — review the item breakdown.
      </UnreadListRow>
    )
  },
  {
    key: "read",
    label: "Read — plain record row",
    render: () => (
      <UnreadListRow title="Streak milestone recorded" meta="Yesterday">
        Day 23 on the ledger. Kept on this device only.
      </UnreadListRow>
    )
  },
  {
    key: "unread-no-badge",
    label: "Unread, marker hidden — edge alone is still a shape tell",
    render: () => (
      <UnreadListRow unread badge={null} title="Quiet channel notice" meta="Mon">
        Marker suppressed; the thicker accent edge still marks it.
      </UnreadListRow>
    )
  },
  {
    key: "link",
    label: "Link row (to → router Link)",
    render: () => (
      <UnreadListRow unread to="/notifications" title="Request REQ-114 updated" meta="1d ago">
        Status moved to Under Review.
      </UnreadListRow>
    )
  },
  {
    key: "stack",
    label: "In a list — read and unread mixed",
    render: () => (
      <div className="x-list">
        <UnreadListRow unread title="New mock available" meta="now">
          M-210 is published on this device.
        </UnreadListRow>
        <UnreadListRow title="Weekly recap ready" meta="Sun">
          Your week in review is on-device.
        </UnreadListRow>
        <UnreadListRow disabled title="Delivery pending" meta="—">
          This channel is paused.
        </UnreadListRow>
      </div>
    )
  }
];
