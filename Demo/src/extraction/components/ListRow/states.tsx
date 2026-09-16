/**
 * ListRow — state matrix for the Kitchen Sink.
 *
 * Sibling classes referenced, not imported (contract §6): `x-chip` is
 * controls/Chip. `meta` is the global utility from app.css.
 */

import type { ReactNode } from "react";
import { StateBlock } from "@components/Card";
import { List, ListRow } from "./ListRow";

/** The record anatomy ~25 sites share: title block + trailing fact. */
function Record({ title, meta, trailing }: { title: string; meta: string; trailing?: ReactNode }) {
  return (
    <>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong>{title}</strong>
        <p className="meta" style={{ margin: 0 }}>{meta}</p>
      </div>
      {trailing}
    </>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "static",
    label: "Static record (article)",
    render: () => (
      <ListRow as="article">
        <Record title="Foundations of Python" meta="Course · in progress" trailing={<span className="x-chip x-chip--quiet">Enrolled</span>} />
      </ListRow>
    )
  },
  {
    key: "link",
    label: "Link row (to → router Link)",
    render: () => (
      <ListRow to="/challenges/two-sum">
        <Record title="Two Sum" meta="Easy · Arrays · 84% accept" />
      </ListRow>
    )
  },
  {
    key: "button",
    label: "Button row (onClick → real button)",
    render: () => (
      <ListRow onClick={() => {}}>
        <Record title="Chapter 3 — Closure" meta="04:12" />
      </ListRow>
    )
  },
  {
    key: "selected",
    label: "Selected (data-on + aria-pressed)",
    render: () => (
      <ListRow onClick={() => {}} selected>
        <Record title="Chapter 2 — Scope" meta="current pick" />
      </ListRow>
    )
  },
  {
    key: "current",
    label: "Current link (data-on + aria-current)",
    render: () => (
      <ListRow to="/mock/m-201/result" current>
        <Record title="Mock sitting M-201" meta="Scorecard" />
      </ListRow>
    )
  },
  {
    key: "done",
    label: "Done (data-done — success edge)",
    render: () => (
      <ListRow to="/challenges/two-sum" done>
        <Record title="Two Sum" meta="Easy · Arrays" />
      </ListRow>
    )
  },
  {
    key: "hover",
    label: "Hover (data-hover sink pin)",
    render: () => (
      <ListRow to="/courses/rust-101" data-hover>
        <Record title="Rust Fundamentals" meta="Course" />
      </ListRow>
    )
  },
  {
    key: "focus",
    label: "Focus ring (data-focus sink pin)",
    render: () => (
      <ListRow onClick={() => {}} data-focus>
        <Record title="Chapter 1 — Bindings" meta="02:40" />
      </ListRow>
    )
  },
  {
    key: "disabled",
    label: "Disabled (real inert: disabled + aria-disabled)",
    render: () => (
      <List>
        <ListRow onClick={() => {}} disabled>
          <Record title="Locked chapter" meta="Complete chapter 2 first" />
        </ListRow>
        <ListRow to="/mock/m-locked/sitting" disabled>
          <Record title="Sealed sitting" meta="Opens 09:00" />
        </ListRow>
      </List>
    )
  },
  {
    key: "align-center",
    label: "Centre-aligned cells (x-list-row--center)",
    render: () => (
      <ListRow to="/solutions/two-sum" align="center">
        <span className="x-chip x-chip--quiet">00:48</span>
        <span style={{ flex: 1, fontSize: "var(--text-sm)", textAlign: "left" }}>Two Sum — editorial</span>
      </ListRow>
    )
  },
  {
    key: "empty",
    label: "Empty — honest absence (StateBlock, never an empty list)",
    render: () => (
      <List>
        <StateBlock state="empty" message="No completed sittings yet." />
      </List>
    )
  },
  {
    key: "pending",
    label: "Pending — StateBlock carries it until Skeleton rows land",
    render: () => (
      <List>
        <StateBlock state="pending" message="Loading records…" />
      </List>
    )
  },
  {
    key: "stack",
    label: "In a list — mixed elements and states",
    render: () => (
      <List>
        <ListRow to="/mock/m-201/result">
          <Record title="Mock sitting M-201" meta="Mock · 8 of 12 · Tuesday" />
        </ListRow>
        <ListRow to="/company/acme/result" done>
          <Record title="Acme Industries" meta="Company · completed" />
        </ListRow>
        <ListRow as="article">
          <Record title="Request REQ-114" meta="Opened Monday" trailing={<span className="x-chip x-chip--quiet">Under Review</span>} />
        </ListRow>
      </List>
    )
  }
];
