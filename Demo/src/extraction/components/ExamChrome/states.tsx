/**
 * ExamChrome — state matrix for the sink.
 * The "live sitting" state mounts useSitting + useCountdown for real; the rest
 * pin the individual states (urgent clock, marked, done, last-item submit).
 */

import { useState, type ReactNode } from "react";
import { StateBlock } from "@components/Card";
import {
  AnswerChoice,
  ExamChrome,
  IntegrityBanner,
  QuestionPalette,
  SittingNav,
  TimerStrip
} from "./ExamChrome";
import { useCountdown, useSitting, type SittingItem } from "./hooks";

const ITEMS: SittingItem[] = [
  {
    id: "q1",
    prompt: "What does Python's LEGB rule describe?",
    choices: [
      "The scope resolution order for name bindings (Local, Enclosing, Global, Built-in)",
      "A compression format for CPython bytecode",
      "A PEP-8 convention for import ordering",
      "The memory layout of PyObject pointers"
    ],
    answer: 0
  },
  {
    id: "q2",
    prompt: "Which scope does a nested function inspect first for a free variable?",
    choices: ["Built-in scope", "Module Global scope", "Lexical Enclosing frame", "The caller's frame"],
    answer: 2
  },
  { id: "q3", prompt: "Third item — left unanswered in most states.", choices: ["One", "Two", "Three"], answer: 1 }
];

function LiveSitting() {
  const sitting = useSitting(ITEMS, () => {});
  const clock = useCountdown(42 * 60);
  return (
    <ExamChrome
      banner={{ label: "SEALED POSTURE ACTIVE · DEVICE FIXED RECORD", answered: sitting.answeredCount, total: ITEMS.length }}
      timer={{ clock: clock.mmss, urgent: clock.urgent, meta: "3 items · 45m allocation · Auto-saving on this device", actions: <button type="button" className="x-btn x-btn--secondary" onClick={sitting.finish}>Submit paper</button> }}
      sitting={sitting}
      items={ITEMS}
      onSelect={sitting.goTo}
      onPick={sitting.pick}
      onToggleMark={sitting.toggleMark}
      onPrev={sitting.prev}
      onNext={sitting.next}
      onSubmit={sitting.finish}
      submitLabel="Final paper submit"
    />
  );
}

function CompanyLive() {
  const sitting = useSitting(ITEMS, () => {});
  const clock = useCountdown(60 * 60);
  return (
    <ExamChrome
      banner={{ label: "PRIVATE COMPANY SITTING · ZERO DISCLOSURE", answered: sitting.answeredCount, total: ITEMS.length }}
      timer={{ clock: clock.mmss, urgent: clock.urgent, meta: "3 items · 60m allocation · Auto-saving on this device", actions: <button type="button" className="x-btn x-btn--secondary" onClick={sitting.finish}>Submit paper</button> }}
      sitting={sitting}
      items={ITEMS.map(({ id, prompt, choices }) => ({ id, prompt, choices }))}
      onSelect={sitting.goTo}
      onPick={sitting.pick}
      onToggleMark={sitting.toggleMark}
      onPrev={sitting.prev}
      onNext={sitting.next}
      onSubmit={sitting.finish}
    />
  );
}

function PaletteAllStates() {
  const [current, setCurrent] = useState(2);
  return (
    <QuestionPalette
      current={current}
      onSelect={setCurrent}
      items={[
        { n: 1, answered: true, marked: false },
        { n: 2, answered: true, marked: true },
        { n: 3, answered: false, marked: true },
        { n: 4, answered: false, marked: false },
        { n: 5, answered: true, marked: false }
      ]}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "sitting-mock", label: "Live sitting — scored paper", render: () => <LiveSitting /> },
  { key: "sitting-company", label: "Live sitting — ungraded (company)", render: () => <CompanyLive /> },
  { key: "palette-states", label: "Palette — current/answered/marked", render: () => <PaletteAllStates /> },
  {
    key: "timer-urgent",
    label: "Timer — urgent (<300s)",
    render: () => <TimerStrip clock="04:32" urgent meta="12 items · 45m allocation" />
  },
  {
    key: "timer-expired",
    label: "Timer — expired",
    render: () => <TimerStrip clock="00:00" urgent meta="The clock has run out" />
  },
  {
    key: "banner-warning",
    label: "Integrity banner — warning tone",
    render: () => <IntegrityBanner label="POSTURE DEGRADED · FOCUS LOST" answered={7} total={12} tone="warning" />
  },
  {
    key: "choice-selected",
    label: "Answer choice — selected",
    render: () => (
      <div role="radiogroup" aria-label="Demo choices" style={{ display: "grid", gap: "var(--space-3)" }}>
        <AnswerChoice index={0} text="The exact scope resolution order" selected onSelect={() => {}} />
        <AnswerChoice index={1} text="A compression format for bytecode" selected={false} onSelect={() => {}} />
      </div>
    )
  },
  {
    key: "nav-last",
    label: "Sitting nav — last item submits",
    render: () => <SittingNav isFirst={false} isLast onPrev={() => {}} onNext={() => {}} onSubmit={() => {}} />
  },
  {
    key: "nav-first",
    label: "Sitting nav — first item (prev gated)",
    render: () => <SittingNav isFirst isLast={false} onPrev={() => {}} onNext={() => {}} onSubmit={() => {}} />
  },
  {
    key: "sitting-unavailable",
    label: "Sitting — unresolved",
    render: () => <StateBlock state="unavailable" message="This sitting cannot continue." />
  }
];
