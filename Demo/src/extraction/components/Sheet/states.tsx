/**
 * Sheet state matrix.
 */

import type { ReactNode } from "react";
import { Sheet } from "./Sheet";

const body = (
  <p className="x-sheet__demo-text">
    Panel content — forms, notes, inspectors. The page behind stays live unless scrim is on.
  </p>
);

const heading = (
  <div>
    <p className="micro x-sheet__demo-kicker">Private</p>
    <h2 className="x-sheet__demo-title">Panel title</h2>
  </div>
);

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "closed",
    label: "Closed (renders nothing)",
    render: () => (
      <Sheet open={false} onClose={() => {}} label="Panel">
        {body}
      </Sheet>
    )
  },
  {
    key: "open-right",
    label: "Open — right edge, no scrim (notes pattern)",
    render: () => (
      <Sheet onClose={() => {}} label="Quick panel" heading={heading}>
        {body}
      </Sheet>
    )
  },
  {
    key: "open-scrim",
    label: "Open — with scrim (modal)",
    render: () => (
      <Sheet onClose={() => {}} label="Panel" scrim>
        {body}
      </Sheet>
    )
  },
  {
    key: "open-left",
    label: "Open — left edge",
    render: () => (
      <Sheet onClose={() => {}} label="Panel" side="left">
        {body}
      </Sheet>
    )
  }
];
