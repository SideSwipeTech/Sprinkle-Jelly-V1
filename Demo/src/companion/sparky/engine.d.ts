import type { SparkyRig } from "./sparky.js";
export type Gesture = "nod" | "shake" | "tilt" | "bounce" | "stretch" | "glanceLeft" | "glanceRight" | "present" | "wiggle" | "blink";
export type Reaction = "success" | "warning" | "error" | "celebrate" | "alert" | "hint" | "think" | "attend";
export class SparkyEngine {
  constructor(rig: SparkyRig, opts?: { reducedMotion?: boolean | null; pointerTracking?: boolean });
  rig: SparkyRig;
  expression: string;
  timeScale: number;
  log: (message: string) => void;
  readonly reducedMotion: boolean;
  setReducedMotion(v: boolean | null): void;
  setPointerTracking(v: boolean): void;
  start(): this;
  stop(): this;
  destroy(): void;
  setExpression(name: string, opts?: { instant?: boolean }): void;
  play(gesture: Gesture): void;
  react(kind: Reaction): void;
  enter(): void;
  leave(then?: () => void): void;
  suppress(): void;
  restore(): void;
  sleep(): void;
  wake(): void;
}
export const GESTURES: Record<Gesture, (engine: SparkyEngine) => void>;
export const REACTIONS: Record<Reaction, (engine: SparkyEngine) => void>;
