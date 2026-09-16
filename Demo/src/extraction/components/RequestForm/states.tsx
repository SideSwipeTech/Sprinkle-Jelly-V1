import { useState, type ReactNode } from "react";
import { RequestForm, type RequestDraft } from "./RequestForm";

function WorkingForm() {
  const [feedback, setFeedback] = useState("");
  return (
    <RequestForm
      areas={["Courses", "Challenges", "Assessments", "CodeLab", "Projects"]}
      feedback={feedback || undefined}
      onSubmit={(draft: RequestDraft) =>
        setFeedback(`Request received for ${draft.area}. Status changes will appear here and in Notifications.`)
      }
    />
  );
}

function DuplicateBlocked() {
  const [feedback, setFeedback] = useState("You already have an open request with that title.");
  return (
    <RequestForm
      areas={["Courses", "Challenges", "Assessments", "CodeLab", "Projects"]}
      feedback={feedback || undefined}
      onSubmit={() => setFeedback("Request received.")}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "working", label: "Working form — submit then feedback", render: () => <WorkingForm /> },
  { key: "feedback", label: "Feedback line (duplicate warning)", render: () => <DuplicateBlocked /> },
  {
    key: "gated",
    label: "Submit gated under min length",
    render: () => <RequestForm areas={["Courses", "Challenges"]} onSubmit={() => {}} />
  }
];
