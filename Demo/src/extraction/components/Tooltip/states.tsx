/**
 * Tooltip state matrix. CSS-only — "open" is demonstrated with the x-tip--force sink
 * fixture, since hover can't be scripted declaratively.
 */

import type { ReactNode } from "react";
import { Tooltip } from "./Tooltip";

const demoBtn = (
  <button type="button" className="x-tip__demo-btn" aria-label="Section">
    ?
  </button>
);

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "rest",
    label: "At rest — hover or focus the trigger",
    render: () => <Tooltip label="Practice section">{demoBtn}</Tooltip>
  },
  {
    key: "right",
    label: "Right (the spine pattern) — forced visible",
    render: () => (
      <span className="x-tip--force">
        <Tooltip label="Practice section" side="right">
          {demoBtn}
        </Tooltip>
      </span>
    )
  },
  {
    key: "top",
    label: "Top — forced visible",
    render: () => (
      <span className="x-tip--force">
        <Tooltip label="Practice section" side="top">
          {demoBtn}
        </Tooltip>
      </span>
    )
  },
  {
    key: "bottom",
    label: "Bottom — forced visible",
    render: () => (
      <span className="x-tip--force">
        <Tooltip label="Practice section" side="bottom">
          {demoBtn}
        </Tooltip>
      </span>
    )
  },
  {
    key: "left",
    label: "Left — forced visible",
    render: () => (
      <span className="x-tip--force">
        <Tooltip label="Practice section" side="left">
          {demoBtn}
        </Tooltip>
      </span>
    )
  }
];
