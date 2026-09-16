/**
 * StatusText state matrix for the Kitchen Sink — six tones across the three
 * cuts (inline / chip / solid).
 */
import type { ReactNode } from "react";
import { StatusText } from "./StatusText";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "chip-neutral", label: "chip · neutral — no signal", render: () => <StatusText tone="neutral">Draft</StatusText> },
  { key: "chip-info", label: "chip · info", render: () => <StatusText tone="info">Under Review</StatusText> },
  { key: "chip-success", label: "chip · success — Accepted", render: () => <StatusText tone="success">Accepted</StatusText> },
  { key: "chip-warning", label: "chip · warning — Runtime error", render: () => <StatusText tone="warning">Runtime error</StatusText> },
  { key: "chip-error", label: "chip · error — Time limit exceeded", render: () => <StatusText tone="error">Time limit exceeded</StatusText> },
  { key: "chip-accent", label: "chip · accent — Benchmark met", render: () => <StatusText tone="accent">Benchmark met</StatusText> },
  { key: "inline-success", label: "inline · success — status-good", render: () => <StatusText tone="success" variant="inline">Available (Active)</StatusText> },
  { key: "inline-error", label: "inline · error — diagnostic", render: () => <StatusText tone="error" variant="inline">Sync failed</StatusText> },
  { key: "solid-warning", label: "solid · warning — DEGRADED", render: () => <StatusText tone="warning" variant="solid">DEGRADED</StatusText> },
  { key: "solid-error", label: "solid · error — SEALED", render: () => <StatusText tone="error" variant="solid">SEALED</StatusText> },
  { key: "solid-accent", label: "solid · accent — NEW", render: () => <StatusText tone="accent" variant="solid">NEW</StatusText> },
  { key: "icon-override", label: "icon override — XP bonus", render: () => <StatusText tone="success" icon="zap">+50 XP On-Time Bonus</StatusText> }
];
