/**
 * Button state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { Button } from "./Button";

function LoadingDemo() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      loading={busy}
      loadingLabel="Running…"
      onClick={() => {
        setBusy(true);
        window.setTimeout(() => setBusy(false), 1500);
      }}
    >
      Run checks
    </Button>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "primary", label: "Primary", render: () => <Button>Start sitting</Button> },
  { key: "secondary", label: "Secondary", render: () => <Button variant="secondary">Browse others</Button> },
  { key: "quiet", label: "Quiet", render: () => <Button variant="quiet">Open details</Button> },
  { key: "destructive", label: "Destructive", render: () => <Button variant="destructive" icon="trash">Delete draft</Button> },
  { key: "sm", label: "Small (workbench)", render: () => <Button size="sm" variant="secondary" icon="reset">Reset starter</Button> },
  { key: "icon", label: "Primary with icon", render: () => <Button icon="check">Submit solution</Button> },
  { key: "loading", label: "Loading (click)", render: () => <LoadingDemo /> },
  { key: "loading-held", label: "Loading held", render: () => <Button loading loadingLabel="Submitting…">Submit</Button> },
  { key: "disabled", label: "Disabled button", render: () => <Button disabled>Publish directly</Button> },
  { key: "disabled-link", label: "Disabled link (aria-disabled, no navigation)", render: () => <Button to="/mock/demo/sitting" disabled>Start Sealed Sitting Now →</Button> },
  { key: "link", label: "Link button", render: () => <Button to="/courses" variant="secondary">Open catalogue</Button> }
];
