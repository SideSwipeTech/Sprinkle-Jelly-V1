/**
 * FormGrid — the two-column admin form layout with a full-span cell.
 *
 * Extracted from admin-shell.css:160-166 (`.admin-form-grid` +
 * `.admin-form-grid__wide`), used by credit correction (845-851) and the
 * maintenance declaration (1057-1061). Fields are `x-field` children; `Wide`
 * spans the row.
 */

import type { ReactNode } from "react";
import "./FormGrid.css";

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="x-form-grid">{children}</div>;
}

/** Full-width cell — for textareas and long inputs. */
export function FormGridWide({ children }: { children: ReactNode }) {
  return <div className="x-form-grid__wide">{children}</div>;
}
