/**
 * Notice state matrix for the Kitchen Sink — all five tones plus live and
 * action-bearing cuts. The action slot demonstrates the sibling convention:
 * a solid `x-status-text` referenced by class, per contract §6.
 */
import type { ReactNode } from "react";
import { Notice } from "./Notice";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "neutral",
    label: "Neutral — quiet note (settings-note)",
    render: () => (
      <Notice tone="neutral">
        Changes apply to new items only. Existing unread notifications remain in your inbox.
      </Notice>
    )
  },
  {
    key: "info",
    label: "Info — [NOTE] callout (left bar)",
    render: () => (
      <Notice tone="info" title="Note" compact>
        All code examples execute in a browser-isolated sandbox. No state is persisted to the global server.
      </Notice>
    )
  },
  {
    key: "success",
    label: "Success — quiz feedback, live",
    render: () => (
      <Notice tone="success" title="Correct choice" live="polite">
        The accumulator pattern holds because each iteration narrows the search space.
      </Notice>
    )
  },
  {
    key: "warning",
    label: "Warning — maintenance interceptor",
    render: () => (
      <Notice
        tone="warning"
        title="Active maintenance notice"
        live="assertive"
        action={
          <span className="x-status-text x-status-text--solid" data-tone="warning">
            DEGRADED
          </span>
        }
      >
        Batch execution container upgrade in progress (02:00–04:00 IST). Interactive sandboxes degraded.
      </Notice>
    )
  },
  {
    key: "error",
    label: "Error — sealed-sitting constraint",
    render: () => (
      <Notice
        tone="error"
        title="Sealed sitting constraint"
        live="assertive"
        action={
          <span className="x-status-text x-status-text--solid" data-tone="error">
            SEALED
          </span>
        }
      >
        External companion guidance and the scratchpad ledger are locked during sealed mock exams.
      </Notice>
    )
  },
  {
    key: "no-icon",
    label: "Icon suppressed — border tells alone",
    render: () => (
      <Notice tone="info" icon={null}>
        The inline-start bar still says 'informational' with no glyph at all.
      </Notice>
    )
  }
];
