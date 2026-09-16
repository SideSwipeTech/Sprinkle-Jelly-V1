import { useState, type ReactNode } from "react";
import { ErasureFlow, type ErasureStage } from "./ErasureFlow";

const CONSEQUENCES = [
  { icon: "history" as const, text: "Learning history, notes, projects, and settings enter the staged queue." },
  { icon: "shield" as const, text: "Certificates keep only the public awarding record required for verification." },
  { icon: "clock" as const, text: "A cancellation window appears before ordered erasure begins." }
];

function FlowDemo({ initial }: { initial: ErasureStage }) {
  const [stage, setStage] = useState<ErasureStage>(initial);
  return (
    <ErasureFlow
      stage={stage}
      consequences={CONSEQUENCES}
      cancellationDeadline="24 August 2026, 18:00 IST"
      onReview={() => setStage("review")}
      onSubmit={() => setStage("requested")}
      onCancelReview={() => setStage("idle")}
      onCancelRequest={() => setStage("idle")}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "idle", label: "Idle — the invitation", render: () => <FlowDemo initial="idle" /> },
  { key: "review", label: "Review — consequences, nothing deleted", render: () => <FlowDemo initial="review" /> },
  { key: "requested", label: "Requested — cancellation window open", render: () => <FlowDemo initial="requested" /> }
];
