import { useState, type ReactNode } from "react";
import { StateBlock } from "@components/Card";
import { RequestHistory, RequestRow, type RequestStatus } from "./RequestRow";

function HistoryDemo() {
  const [rows, setRows] = useState<{ id: string; title: string; createdAt: string; status: RequestStatus }[]>([
    { id: "r1", title: "Distributed systems practice track", createdAt: "20 Aug 2026", status: "Under Review" },
    { id: "r2", title: "Consensus and failure recovery", createdAt: "18 Aug 2026", status: "Planned" },
    { id: "r3", title: "Raft in Go", createdAt: "11 Aug 2026", status: "Published" }
  ]);
  return (
    <RequestHistory>
      {rows.map((r) => (
        <RequestRow
          key={r.id}
          title={r.title}
          createdAt={r.createdAt}
          status={r.status}
          onWithdraw={() => setRows((cur) => cur.map((x) => x.id === r.id ? { ...x, status: "Withdrawn" } : x))}
        />
      ))}
    </RequestHistory>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "history", label: "History — withdraw an open request", render: () => <HistoryDemo /> },
  {
    key: "statuses",
    label: "All five statuses",
    render: () => (
      <div className="x-list">
        {(["Under Review", "Planned", "In Authoring", "Published", "Withdrawn"] as RequestStatus[]).map((s) => (
          <RequestRow key={s} title={`Request in ${s}`} createdAt="16 Aug 2026" status={s} />
        ))}
      </div>
    )
  },
  {
    key: "empty",
    label: "No requests yet",
    render: () => <StateBlock state="empty" message="No requests on this device yet." />
  }
];
