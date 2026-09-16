/**
 * ToolCluster — the admin "declared tools" strip.
 *
 * Extracted from admin-shell.css:149 (`.admin-tools`) and its use in
 * AdminPages.tsx:139-146, 199-204, 472-476, 790-794 — a wrapped row of named
 * operations plus the line that reports what the last one touched. The readout
 * is a live region: "Move recorded" arrives without focus moving.
 */

import type { ReactNode } from "react";
import "./ToolCluster.css";

export interface ToolClusterProps {
  /** The operation buttons — `x-btn` children. */
  children: ReactNode;
  /** What the last operation touched — announced politely. */
  readout?: ReactNode;
  label?: string;
}

export function ToolCluster({ children, readout, label = "Tools" }: ToolClusterProps) {
  return (
    <div className="x-tool-cluster">
      <div className="x-tool-cluster__tools" role="toolbar" aria-label={label}>
        {children}
      </div>
      {readout ? <p className="x-tool-cluster__readout" role="status">{readout}</p> : null}
    </div>
  );
}
