/**
 * KeyValueRow — term on the left, value on the right. Three demo sources merged:
 *
 *   DiagnosticRow    Assess.tsx:403-414 — each row a padded inset pill,
 *                    `fontSize:12px`, value a `strong` tinted `#2dd4bf`
 *   ProfileFactRow   Assess.tsx:871-883 — same pill, value tinted by provenance
 *   `.account-facts` app.css:213-217 — a `<dl>` strip: ruled rows, `dt`/`dd`,
 *                    `minmax(120px, .45fr) 1fr` grid
 *
 * Two pieces:
 *   KeyValueTable  the bordered `<dl class="x-key-value">` strip — children are
 *                  `KeyValueRow as="definition"` (div > dt + dd, valid inside dl)
 *   KeyValueRow    one row. `as="pair"` renders span + strong (the diagnostic
 *                  anatomy); `as="definition"` renders dt + dd for the table.
 *                  `inset` gives the standalone pill its own inset surface.
 *
 * `tone` colours the value AND expects a non-colour tell beside it — pass
 * `icon`, or put the tell in the value text (the demo's "✓ Available"). A
 * missing value renders an em dash, never zero.
 *
 * Sibling contract: CompletionFactPanel (domain/) already emits
 * `x-key-value` / `x-key-value__row` / `__term` / `__value` per contract §6 —
 * this stylesheet is the implementation it composes onto.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./KeyValueRow.css";

export type KeyValueTone =
  | "default"
  | "muted"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info";

/* ── The definition-list strip ───────────────────────────────────────────── */

export interface KeyValueTableProps {
  children: ReactNode;
  /** Accessible name — dl accepts aria-label as a named group of terms. */
  label?: string;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function KeyValueTable({ children, label, className = "", ...rest }: KeyValueTableProps) {
  return (
    <dl className={`x-key-value${className ? ` ${className}` : ""}`} aria-label={label} {...rest}>
      {children}
    </dl>
  );
}

/* ── The row ─────────────────────────────────────────────────────────────── */

export interface KeyValueRowProps {
  /** The term — left cell. */
  term: ReactNode;
  /** The value — right cell. `null`/`undefined` renders an em dash. */
  value?: ReactNode;
  /** Value tone — colour reinforces, never carries alone. */
  tone?: KeyValueTone;
  /** Leading tell icon inside the value (the "✓" the demo baked into text). */
  icon?: IconName;
  /** `pair` (default — span+strong, diagnostic anatomy) or `definition`
   *  (dt+dd — required inside a KeyValueTable `<dl>`). */
  as?: "pair" | "definition";
  /** Standalone inset pill — the diagnostics/profile surface. Inside an
   *  InsetPanel or a KeyValueTable the row is bare; don't combine. */
  inset?: boolean;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function KeyValueRow({
  term,
  value,
  tone,
  icon,
  as = "pair",
  inset,
  className = "",
  ...rest
}: KeyValueRowProps) {
  const classes = [
    "x-key-value__row",
    inset ? "x-key-value__row--inset" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const shown = value === null || value === undefined ? "—" : value;

  const valueBody = (
    <>
      {icon ? <Icon name={icon} size={13} /> : null}
      {shown}
    </>
  );

  return (
    <div className={classes} data-tone={tone === "default" ? undefined : tone} {...rest}>
      {as === "definition" ? (
        <>
          <dt className="x-key-value__term">{term}</dt>
          <dd className="x-key-value__value">{valueBody}</dd>
        </>
      ) : (
        <>
          <span className="x-key-value__term">{term}</span>
          <strong className="x-key-value__value">{valueBody}</strong>
        </>
      )}
    </div>
  );
}
