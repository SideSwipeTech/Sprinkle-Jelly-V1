import type { ReactNode } from "react";
import { ContinueCard } from "./ContinueCard";

const TARGET = {
  title: "Variables, Scope & the LEGB Rule",
  context: "Foundations of Python",
  percent: 68,
  to: "/courses/python-foundations/lessons/legb"
};

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "hero",
    label: "Hero layout (Dashboard cell)",
    render: () => <ContinueCard layout="hero" item={TARGET} chargeLabel="Course progress" />
  },
  {
    key: "rail",
    label: "Rail layout (Courses card)",
    render: () => <ContinueCard layout="rail" item={TARGET} />
  },
  {
    key: "empty",
    label: "Empty — nothing in progress",
    render: () => (
      <ContinueCard
        layout="rail"
        item={null}
        emptyAction={<button type="button" className="x-btn x-btn--secondary">Browse Courses</button>}
      />
    )
  }
];
