/**
 * ChipTabBar state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { ChipTabBar } from "./ChipTabBar";

function CourseTabsDemo() {
  const [tab, setTab] = useState("outline");
  return (
    <ChipTabBar
      label="Course sections"
      ruled
      value={tab}
      onChange={setTab}
      tabs={[
        { id: "outline", label: "Curriculum (12)", icon: "lessons" },
        { id: "video", label: "Studio Video", icon: "play" },
        { id: "quiz", label: "Knowledge Check", icon: "clipboard" },
        { id: "project", label: "Capstone Brief", icon: "projects" },
        { id: "changes", label: "Changelog", icon: "history" }
      ]}
    />
  );
}

function PlainDemo() {
  const [tab, setTab] = useState("all");
  return (
    <ChipTabBar
      label="Solutions view"
      value={tab}
      onChange={setTab}
      tabs={[
        { id: "all", label: "All Solutions (9)" },
        { id: "challenges", label: "Algorithm Challenges" },
        { id: "daily", label: "Daily Rituals" },
        { id: "debug", label: "Debug Fixes" }
      ]}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "icons-ruled", label: "Icon tabs with ruled edge", render: () => <CourseTabsDemo /> },
  { key: "plain", label: "Text-only tabs", render: () => <PlainDemo /> },
  {
    key: "disabled-tab",
    label: "Tab disabled (skipped by arrows)",
    render: () => (
      <ChipTabBar
        label="Sections"
        value="a"
        onChange={() => {}}
        tabs={[
          { id: "a", label: "Outline" },
          { id: "b", label: "Quiz", disabled: true },
          { id: "c", label: "Project" }
        ]}
      />
    )
  }
];
