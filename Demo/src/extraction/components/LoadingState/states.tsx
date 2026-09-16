/**
 * LoadingState state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { LoadingState } from "./LoadingState";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "default",
    label: "Default — region loading",
    render: () => <LoadingState label="Loading the editor workbench…" />
  },
  {
    key: "compact",
    label: "Compact — toolbar/status bar",
    render: () => <LoadingState compact label="Running visible samples…" />
  },
  {
    key: "custom-icon",
    label: "Custom glyph",
    render: () => <LoadingState icon="history" label="Restoring your sitting…" />
  }
];
