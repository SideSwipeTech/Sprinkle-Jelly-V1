/**
 * Avatar state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { Avatar } from "./Avatar";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "sm", label: "sm — admin top bar (28px)", render: () => <Avatar name="Vamsi Admin" size="sm" /> },
  { key: "md", label: "md — shell header (32px)", render: () => <Avatar name="Vamsi" /> },
  { key: "lg", label: "lg — profile hero (56px, gradient)", render: () => <Avatar name="Vamsi" size="lg" /> },
  { key: "initial-override", label: "initial override — handle", render: () => <Avatar name="K. Vamsi" initial="k" /> }
];
