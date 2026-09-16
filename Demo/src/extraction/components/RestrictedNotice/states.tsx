import type { ReactNode } from "react";
import { RestrictedNotice } from "./RestrictedNotice";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "restricted",
    label: "Restricted standing — refused + policy",
    render: () => (
      <RestrictedNotice
        message="Account standing: Suspended. Automated test execution and metered assistance actions are refused."
        policy={{
          title: "Moderation Appeal Policy",
          text: "To appeal a standing decision, please refer to the primary site support channel."
        }}
        actions={
          <>
            <button type="button" className="x-btn x-btn--primary">Return to Overview</button>
            <button type="button" className="x-btn x-btn--secondary">Help &amp; Knowledge Base</button>
          </>
        }
      />
    )
  },
  {
    key: "no-actions",
    label: "Refusal without onward actions",
    render: () => (
      <RestrictedNotice
        message="This surface is refused while the declared maintenance window holds."
        policy={{ title: "Declared Window", text: "The window ends only when affected health signals recover." }}
      />
    )
  }
];
