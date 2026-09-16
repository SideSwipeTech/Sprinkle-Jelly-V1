/**
 * ActionPanel — the staged-action inset under an admin record.
 *
 * Extracted from admin-shell.css:150-159 (`.admin-action-panel`) and its use in
 * AdminPages.tsx:795-819 (certificate correct/reissue/revoke): an eyebrow naming
 * the operation, a lead stating its exact consequence, fields, a confirm/cancel
 * row, and an outcome line announced with role=status (was `.form-message`).
 */

import type { ReactNode } from "react";
import "./ActionPanel.css";

export interface ActionPanelProps {
  /** Names the operation, e.g. "Issuer revocation". */
  eyebrow: string;
  /** States the exact consequence before confirmation. */
  lead?: ReactNode;
  /** Fields + the confirm/cancel row. */
  children: ReactNode;
  /** Post-action outcome — announced politely, styled as the success note. */
  outcome?: ReactNode;
}

export function ActionPanel({ eyebrow, lead, children, outcome }: ActionPanelProps) {
  return (
    <div className="x-action-panel" role="group" aria-label={eyebrow}>
      <p className="micro x-action-panel__eyebrow">{eyebrow}</p>
      {lead ? <p className="x-action-panel__lead">{lead}</p> : null}
      {children}
      {outcome ? <p className="x-action-panel__outcome" role="status">{outcome}</p> : null}
    </div>
  );
}
