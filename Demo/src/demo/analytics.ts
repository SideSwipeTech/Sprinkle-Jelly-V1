import { DEMO_MODE } from "./config";

export type DemoEvent =
  | "demo_started"
  | "demo_feature_viewed"
  | "demo_cta_clicked"
  | "demo_signup_clicked"
  | "demo_reset_clicked"
  | "demo_simulated_action";

interface DemoPayload {
  path?: string;
  label?: string;
  feature?: string;
  action?: string;
}

/** Demo analytics stub. Replace this function when a real analytics provider is wired. */
export function trackDemoEvent(event: DemoEvent, payload?: DemoPayload) {
  if (!DEMO_MODE) return;
  const record = { event, timestamp: new Date().toISOString(), ...payload };
  // Keep a small ring buffer in memory for inspection; real provider would replace this.
  try {
    const existing = JSON.parse(window.localStorage.getItem("wp.demo.analytics") ?? "[]") as unknown[];
    const next = [record, ...existing].slice(0, 100);
    window.localStorage.setItem("wp.demo.analytics", JSON.stringify(next));
  } catch {
    /* ignore */
  }
  // eslint-disable-next-line no-console
  console.log("[demo analytics]", record);
}

export function readDemoAnalytics(): unknown[] {
  try {
    return JSON.parse(window.localStorage.getItem("wp.demo.analytics") ?? "[]") as unknown[];
  } catch {
    return [];
  }
}
