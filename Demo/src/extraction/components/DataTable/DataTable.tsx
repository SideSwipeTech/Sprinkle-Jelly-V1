/**
 * DataTable — the admin table: uppercase micro heads, self-scrolling body,
 * selected-row state.
 *
 * Extracted from admin-shell.css:133-147 (`.admin-table`) and the Economy
 * staged-edit pattern (AdminPages.tsx:1188-1232). The demo painted the selected
 * row with an inline `background` and the enforced value with a `#2dd4bf`
 * literal — here the row carries `data-on` and the value cell carries
 * `x-data-table__value`, because a fact is not a verdict.
 *
 * The `alert()` in the stage action is gone: callers receive `onRowAction`-style
 * callbacks through their own cells and confirm via the overlays family's Dialog.
 */

import type { CSSProperties, ReactNode } from "react";
import "./DataTable.css";

export interface DataRowSpec {
  key: string;
  /** One node per column. */
  cells: ReactNode[];
  /** The staged/selected row — inset ground, never an inline literal. */
  on?: boolean;
}

export interface DataTableProps {
  /** Header labels — rendered uppercase-micro. */
  columns: ReactNode[];
  rows: DataRowSpec[];
  /** Accessible caption — a bare table announces nothing. */
  label: string;
  /** Min table width before the block self-scrolls. Default 42.5rem (was 680px). */
  minWidth?: string;
}

export function DataTable({ columns, rows, label, minWidth }: DataTableProps) {
  const style = (minWidth ? { "--x-table-min": minWidth } : {}) as CSSProperties;
  return (
    <div className="x-data-table" style={style}>
      <table>
        <caption className="x-data-table__caption">{label}</caption>
        <thead>
          <tr>
            {columns.map((col, i) => <th key={i} scope="col">{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} data-on={row.on || undefined}>
              {row.cells.map((cell, i) => <td key={i}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
