import type { ReactNode } from "react";
import { ReviewItemCard } from "./ReviewItemCard";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "correct",
    label: "Correct item",
    render: () => (
      <ReviewItemCard
        index={0}
        correct
        credit="+10 XP"
        prompt="What does Python's LEGB rule describe?"
        remediation="Python evaluates unqualified names following LEGB: Local frame, then Enclosing functions, then Module Global, then __builtins__."
      />
    )
  },
  {
    key: "incorrect",
    label: "Incorrect item",
    render: () => (
      <ReviewItemCard
        index={3}
        correct={false}
        credit="0 XP"
        prompt="Which HTTP status code is honest when a resource is permanently deleted?"
        remediation="HTTP 410 Gone explicitly signifies the target was intentionally purged; caches and search engines may drop the reference."
      />
    )
  },
  {
    key: "no-remediation",
    label: "Without remediation inset",
    render: () => <ReviewItemCard index={6} correct={false} credit="0 XP" prompt="An item with no authored explanation." />
  }
];
