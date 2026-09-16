/**
 * CardGrid — state matrix for the Kitchen Sink.
 */

import type { ReactNode } from "react";
import { CardGrid } from "./CardGrid";

function DemoCard({ title, meta, span }: { title: string; meta: string; span?: boolean }) {
  return (
    <div className="card surface" data-span={span ? "2" : undefined}>
      <strong>{title}</strong>
      <p className="meta" style={{ margin: 0 }}>{meta}</p>
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "standard",
    label: "Auto-fit, 280px floor — sink/assess shape",
    render: () => (
      <CardGrid>
        <DemoCard title="Foundations of Python" meta="Course card" />
        <DemoCard title="Data Structures" meta="Course card" />
        <DemoCard title="Systems Primer" meta="Course card" />
        <DemoCard title="Web Basics" meta="Course card" />
      </CardGrid>
    )
  },
  {
    key: "roomy",
    label: "320px floor — courses__grid",
    render: () => (
      <CardGrid trackSize="lg">
        <DemoCard title="Python Foundations" meta="The wide course card" />
        <DemoCard title="Rust Systems" meta="The wide course card" />
        <DemoCard title="Databases" meta="The wide course card" />
      </CardGrid>
    )
  },
  {
    key: "span",
    label: "Wide-band span — data-span=2 (home__continue / home__activity)",
    render: () => (
      <CardGrid trackSize="md">
        <DemoCard title="Continue where you left off" meta="spans two tracks at the wide band" span />
        <DemoCard title="Recent activity" meta="spans two tracks at the wide band" span />
        <DemoCard title="A quiet tile" meta="one track" />
      </CardGrid>
    )
  },
  {
    key: "single",
    label: "Narrow — every track takes the row",
    render: () => (
      <CardGrid>
        <DemoCard title="Sole tile" meta="auto-fit collapses gracefully" />
      </CardGrid>
    )
  }
];
