/**
 * InsetPanel — the recessed surface inside a card.
 *
 * Canonicalises the repeated `padding + --radius-sm + --c-surface-inset` block:
 * Learn.tsx:199-208 (the accredited-verification fact box), Practice.tsx:399
 * (constraints), :509 (custom-input drawer, bordered), More.tsx and others —
 * always the same anatomy, always hand-rolled inline.
 *
 * Rows inside it are the sibling KeyValueRow (`x-key-value__row`) or free
 * content — a panel carries layout only.
 */

import type { ReactNode } from "react";
import "./InsetPanel.css";

export interface InsetPanelProps {
  children: ReactNode;
  /** Draws the hairline — the bordered variant the demo reached for at drawers. */
  bordered?: boolean;
  /** `section`/`aside` get a landmark role when `label` names them. */
  as?: "div" | "section" | "aside";
  /** Accessible name for landmark elements. */
  label?: string;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function InsetPanel({
  children,
  bordered,
  as = "div",
  label,
  className = "",
  ...rest
}: InsetPanelProps) {
  const Tag = as;
  return (
    <Tag
      className={`x-inset-panel${className ? ` ${className}` : ""}`}
      data-bordered={bordered || undefined}
      aria-label={as === "div" ? undefined : label}
      {...rest}
    >
      {children}
    </Tag>
  );
}
