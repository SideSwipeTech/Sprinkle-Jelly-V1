/**
 * Tabs state matrix.
 */

import type { ReactNode } from "react";
import { Tabs } from "./Tabs";
import type { TabItem } from "./Tabs";

const FAMILIES: TabItem[] = [
  {
    key: "lessons",
    title: "Interactive Lessons",
    subtitle: "Read, run in sandbox, and complete",
    icon: "lessons",
    count: 24
  },
  {
    key: "video",
    title: "Video Studio Courses",
    subtitle: "Watch synchronized modules & transcripts",
    icon: "play",
    count: 6
  }
];

const MANY: TabItem[] = [
  { key: "all", title: "All challenges", icon: "challenges", count: 128 },
  { key: "solved", title: "Solved", icon: "check", count: 41 },
  { key: "todo", title: "In progress", icon: "history", count: 7 },
  { key: "starred", title: "Starred", icon: "star", count: 3 }
];

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "first-selected",
    label: "Two families — first selected",
    render: () => (
      <Tabs tabs={FAMILIES} value="lessons" onChange={() => {}} label="Course families" />
    )
  },
  {
    key: "second-selected",
    label: "Two families — second selected",
    render: () => (
      <Tabs tabs={FAMILIES} value="video" onChange={() => {}} label="Course families" />
    )
  },
  {
    key: "many",
    label: "Four tabs — auto-fit grid",
    render: () => <Tabs tabs={MANY} value="solved" onChange={() => {}} label="Challenge sets" />
  },
  {
    key: "no-count",
    label: "Without count badges or icons",
    render: () => (
      <Tabs
        tabs={[
          { key: "a", title: "Statement", subtitle: "Problem text and constraints" },
          { key: "b", title: "Hints", subtitle: "Progressive reveal" }
        ]}
        value="a"
        onChange={() => {}}
        label="Problem sections"
      />
    )
  }
];
