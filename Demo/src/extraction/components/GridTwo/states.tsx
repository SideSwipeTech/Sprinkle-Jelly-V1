/**
 * GridTwo — state matrix for the Kitchen Sink.
 * Demo children carry the kit's `card surface` classes so splits read as pages.
 */

import type { ReactNode } from "react";
import { GridThree, GridTwo } from "./GridTwo";

function DemoCard({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="card surface">
      <strong>{title}</strong>
      <p className="meta" style={{ margin: 0 }}>{meta}</p>
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "lead",
    label: "Lead split — 1.2fr / 0.8fr (app.css .grid-2)",
    render: () => (
      <GridTwo>
        <DemoCard title="Main column" meta="statement, list, form" />
        <DemoCard title="Aside" meta="facts, diagnostics, meta" />
      </GridTwo>
    )
  },
  {
    key: "balanced",
    label: "Balanced split — 1.15fr / 0.85fr (surfaces.css .split)",
    render: () => (
      <GridTwo ratio="balanced">
        <DemoCard title="Primary region" meta="near-even split" />
        <DemoCard title="Secondary region" meta="the quieter side" />
      </GridTwo>
    )
  },
  {
    key: "editor",
    label: "Editor split — 0.42fr / 0.58fr, 52dvh floor (.split--editor)",
    render: () => (
      <GridTwo ratio="editor">
        <DemoCard title="Statement pane" meta="narrow · read" />
        <DemoCard title="Work pane" meta="wide · edit" />
      </GridTwo>
    )
  },
  {
    key: "three",
    label: "Three-up — GridThree (app.css .grid-3)",
    render: () => (
      <GridThree>
        <DemoCard title="One" meta="stat card" />
        <DemoCard title="Two" meta="stat card" />
        <DemoCard title="Three" meta="stat card" />
      </GridThree>
    )
  }
];
