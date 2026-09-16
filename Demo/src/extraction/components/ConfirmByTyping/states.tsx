/**
 * ConfirmByTyping state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { ConfirmByTyping } from "./ConfirmByTyping";
import { Button } from "../Button/Button";

function DeleteDemo() {
  const [echo, setEcho] = useState("");
  return (
    <ConfirmByTyping phrase="Foundations of Python" value={echo} onChange={setEcho}>
      {(matched: boolean) => (
        <Button variant="destructive" disabled={!matched} icon="trash">Permanent delete…</Button>
      )}
    </ConfirmByTyping>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "empty", label: "Empty — action unreachable (type the phrase)", render: () => <DeleteDemo /> },
  {
    key: "mismatch",
    label: "Partial echo — aria-invalid + status",
    render: () => (
      <ConfirmByTyping phrase="Foundations of Python" value="Foundations" onChange={() => {}}>
        {(matched: boolean) => <Button variant="destructive" disabled={!matched}>Permanent delete…</Button>}
      </ConfirmByTyping>
    )
  },
  {
    key: "matched",
    label: "Matched — action armed",
    render: () => (
      <ConfirmByTyping phrase="Foundations of Python" value="Foundations of Python" onChange={() => {}}>
        {(matched: boolean) => <Button variant="destructive" disabled={!matched}>Permanent delete…</Button>}
      </ConfirmByTyping>
    )
  },
  {
    key: "lax",
    label: "Lax match (trim + case-fold)",
    render: () => (
      <ConfirmByTyping phrase="Foundations of Python" value="  foundations of python " lax onChange={() => {}}>
        {(matched: boolean) => <Button variant="quiet" disabled={!matched}>Archive…</Button>}
      </ConfirmByTyping>
    )
  }
];
