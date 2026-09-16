import type { ReactNode } from "react";
import { CourseCard } from "./CourseCard";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "cover-enrolled",
    label: "Cover variant — enrolled + coverage tag",
    render: () => (
      <CourseCard
        cover
        eyebrow="Programming · PYTHON"
        title="Foundations of Python"
        icon="courses"
        summary="Variables, control flow, data structures — the language from first principles."
        coverage="covered"
        enrolled
        meta={["12 lessons", "6h 20m", "Beginner"]}
        action={<button type="button" className="x-btn x-btn--primary">Open Curriculum Hub →</button>}
      />
    )
  },
  {
    key: "cover-not-started",
    label: "Cover variant — not started",
    render: () => (
      <CourseCard
        cover
        eyebrow="Systems · GO"
        title="Concurrent Go Services"
        icon="courses"
        summary="Goroutines, channels, and graceful shutdown patterns."
        coverage="not-started"
        meta={["9 lessons", "4h", "Intermediate"]}
        action={<button type="button" className="x-btn x-btn--primary">Open Curriculum Hub →</button>}
      />
    )
  },
  {
    key: "plain",
    label: "Plain variant — video course",
    render: () => (
      <CourseCard
        eyebrow="Studio Video"
        title="Frontend Architecture Walkthrough"
        icon="play"
        summary="Watch synchronized modules & transcripts."
        meta={["48 min total", "6 modules", "6 chapters"]}
        action={<button type="button" className="x-btn x-btn--secondary">Launch Video Studio →</button>}
      />
    )
  }
];
